/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../lib/config";
import Acord25Form from "../../../../../services/pdf/Acord25Form";
import {
  FileSignature,
  Search,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderClosed,
  FolderOpen,
  FileText,
  File,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// ─── Tab definitions matching AMS360 eForms Manager ──────────────────────────
const EFORM_TABS = [
  "All Forms",
  "Applications",
  "AutoId Cards",
  "Binders",
  "Cancellations",
  "Certificates",
  "EPI",
  "Change Requests",
  "Loss Notices",
] as const;

type EFormTab = typeof EFORM_TABS[number];

// ─── Mock tree node structure ────────────────────────────────────────────────
interface TreeNode {
  id: string;
  label: string;
  type: "folder" | "file";
  children?: TreeNode[];
  formType?: string;
}

// ─── Tree View Component ─────────────────────────────────────────────────────
function TreeItem({
  node,
  depth = 0,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth?: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const isFolder = node.type === "folder";
  const isSelected = selected === node.id;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          onSelect(node.id);
        }}
        className={`
          w-full flex items-center gap-1.5 px-2 py-[2px] text-[11px] font-medium
          transition-all duration-150 cursor-pointer text-left
          ${isSelected
            ? "bg-primary/15 text-primary font-bold"
            : "text-text-main hover:bg-secondary/50"
          }
        `}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {isFolder ? (
          expanded ? (
            <>
              <ChevronDown size={12} className="shrink-0 text-primary/60" />
              <FolderOpen size={14} className="shrink-0 text-primary" />
            </>
          ) : (
            <>
              <ChevronRight size={12} className="shrink-0 text-text-muted/60" />
              <FolderClosed size={14} className="shrink-0 text-text-muted" />
            </>
          )
        ) : (
          <>
            <span className="w-[12px] shrink-0" />
            <FileText size={14} className="shrink-0 text-text-muted/60" />
          </>
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EFORMS MANAGER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EFormsManagerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<EFormTab>("All Forms");
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [selectedEffDate, setSelectedEffDate] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ── Fetch customer and policies ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [custRes, polRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (custRes.status === 401) {
        router.push("/login");
        return;
      }
      if (!custRes.ok) throw new Error("Failed to load customer");

      const custData = await custRes.json();
      setCustomer(custData);

      if (polRes.ok) {
        const polData = await polRes.json();
        const formatted = polData.map((p: any) => ({
          id: p.id.toString(),
          policyNum: p.policy_num,
          effDate: p.eff_date,
          expDate: p.exp_date,
          type: p.description || "",
          status: p.status,
          term: p.term,
        }));
        setPolicies(formatted);
        if (formatted.length > 0) {
          setSelectedPolicy(formatted[0].policyNum);
          setSelectedEffDate(
            `${formatted[0].effDate || "N/A"}, ${formatted[0].status || "Active"}, ${formatted[0].type || ""}`
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId, fetchData]);

  // ── Build tree data from customer + policies ──
  const buildTree = (): TreeNode[] => {
    if (!customer) return [];

    const customerName =
      customer.name ||
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      "Customer";

    const certNodes: TreeNode[] = [
      {
        id: `cert-all`,
        label: `Certificate, Last 2 year(s)`,
        type: "folder" as const,
        children: [
          {
            id: `cert-file-1`,
            label: `CL2581202834 2025 Master Coi, Liability - 25`,
            type: "file" as const,
            formType: "Certificates",
          },
          {
            id: `cert-file-2`,
            label: `CL257201165 MASTER COI, Liability - 25`,
            type: "file" as const,
            formType: "Certificates",
          }
        ],
      }
    ];

    const policyNodes: TreeNode[] = policies.map((p) => ({
      id: `p-${p.id}`,
      label: `NBS New business ${p.effDate || ""}`,
      type: "folder" as const,
      children: [
        {
          id: `appform-${p.id}`,
          label: "Commercial Applicant Information",
          type: "folder" as const,
          children: [
            {
              id: `misc-${p.id}`,
              label: `${p.type || "Miscellaneous Professional"} Liability`,
              type: "file" as const,
              formType: "Applications",
            }
          ]
        }
      ]
    }));

    return [
      {
        id: "root",
        label: `Customer - ${customerName}`,
        type: "folder",
        children: [...certNodes, ...policyNodes],
      },
    ];
  };

  const treeData = buildTree();

  // ── Filter tree by active tab ──
  const filterTree = (nodes: TreeNode[], tab: EFormTab): TreeNode[] => {
    if (tab === "All Forms") return nodes;

    const tabTypeMap: Record<string, string> = {
      Applications: "Applications",
      "AutoId Cards": "AutoId",
      Binders: "Binder",
      Cancellations: "Cancellation",
      Certificates: "Certificate",
      EPI: "EPI",
      "Change Requests": "Change",
      "Loss Notices": "Loss",
    };

    const filterType = tabTypeMap[tab] || tab;

    const filterNodes = (items: TreeNode[]): TreeNode[] => {
      return items
        .map((node) => {
          if (node.type === "file") {
            return node.formType?.includes(filterType) ? node : null;
          }
          if (node.children) {
            const filtered = filterNodes(node.children);
            if (filtered.length > 0) {
              return { ...node, children: filtered };
            }
          }
          // Keep folder structure even if empty for context
          if (node.type === "folder" && node.id === "root") {
            return { ...node, children: [] };
          }
          return null;
        })
        .filter(Boolean) as TreeNode[];
    };

    return filterNodes(nodes);
  };

  const displayTree = filterTree(treeData, activeTab);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="bg-white/80 backdrop-blur-xl border-b border-border-main h-12 px-4 flex items-center gap-3 shrink-0">
          <FileSignature size={18} className="text-primary" />
          <span className="font-bold text-sm text-text-main">eForms Manager</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">
              Loading eForms Manager...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !customer) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="bg-white border-b border-border-main h-12 px-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle size={28} className="text-danger" />
            <p className="font-bold text-sm text-text-main">Failed to Load</p>
            <p className="text-xs text-slate-400">{error || "Customer not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const customerName =
    customer.name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans select-none overflow-hidden">

      {/* ── Title Bar ── */}
      <div className="bg-white border-b border-border-main h-11 px-4 flex items-center gap-3 shrink-0 shadow-sm">
        <FileSignature size={16} className="text-primary shrink-0" />
        <span className="text-[13px] font-bold text-text-main truncate">
          eForms - {customerName}
          {selectedPolicy && ` - Policy #${selectedPolicy}`}
          {policies.length > 0 && policies[0].effDate && ` Eff date ${policies[0].effDate}`}
          {policies.length > 0 && policies[0].expDate && ` to ${policies[0].expDate}`}
        </span>
      </div>

      {/* ── Menu Bar (AMS360 style) ── */}
      <div className="bg-secondary/40 border-b border-border-main h-8 px-3 flex items-center gap-4 shrink-0">
        {["File", "Edit", "eForms", "View", "Operation", "Toolbox", "Help"].map((menu) => (
          <button
            key={menu}
            className="text-[11px] font-semibold text-text-main hover:text-primary hover:underline cursor-pointer transition-colors"
          >
            {menu}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-secondary/20 border-b border-border-main h-9 px-3 flex items-center gap-1.5 shrink-0">
        {[
          { icon: "💾", title: "Save" },
          { icon: "📋", title: "Copy" },
          { icon: "📎", title: "Attach" },
          { icon: "🖨️", title: "Print" },
          { icon: "➕", title: "Add" },
          { icon: "➖", title: "Remove" },
          { icon: "◀", title: "Previous" },
          { icon: "▶", title: "Next" },
        ].map((btn, i) => (
          <button
            key={i}
            title={btn.title}
            className="h-7 w-7 flex items-center justify-center text-sm border border-border-main rounded bg-white hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* ── Category Tabs ── */}
      <div className="bg-white border-b border-border-main px-2 flex items-center gap-0 shrink-0 overflow-x-auto">
        {EFORM_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-2 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border-b-2
              ${activeTab === tab
                ? "text-primary border-primary bg-primary/5"
                : "text-text-muted border-transparent hover:text-primary hover:border-primary/30 hover:bg-secondary/30"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Action bar ── */}
      <div className="bg-secondary/10 border-b border-border-main h-7 px-3 flex items-center gap-3 shrink-0 overflow-x-auto">
        <button 
          onClick={() => {
            let path = "new-certificate";
            if (activeTab === "Applications") path = "new-application";
            if (activeTab === "Binders") path = "new-binder";
            window.open(`/agency/customer/${customerId}/eforms-manager/${path}`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
          }}
          className="text-[11px] font-semibold text-text-main hover:text-primary cursor-pointer whitespace-nowrap"
        >
          New
        </button>
        {activeTab === "AutoId Cards" && (
          <>
            <button className="text-[11px] font-semibold text-text-main hover:text-primary cursor-pointer whitespace-nowrap">New & Email</button>
            <button className="text-[11px] font-semibold text-text-main hover:text-primary cursor-pointer whitespace-nowrap">New & Print</button>
          </>
        )}
        {activeTab === "Binders" && (
          <>
            {["Copy", "Cancel", "Extend", "Replaced By Policy", "Update", "Replace", "Interests"].map(btn => (
              <button key={btn} className="text-[11px] font-semibold text-text-main hover:text-primary cursor-pointer whitespace-nowrap">
                {btn}
              </button>
            ))}
          </>
        )}
        <button className="text-[11px] font-semibold text-text-main hover:text-danger cursor-pointer whitespace-nowrap">
          Delete
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel: Customer/Policy selectors + Tree ── */}
        <div className="w-[340px] shrink-0 border-r border-border-main bg-white flex flex-col">

          {/* Customer field */}
          <div className="flex items-center gap-2 px-2 py-1 border-b border-border-main">
            <label className="text-[10px] font-bold text-text-muted shrink-0 w-14">Customer:</label>
            <div className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                value={customerName}
                readOnly
                className="flex-1 text-[11px] font-semibold text-text-main bg-secondary/20 border border-border-main rounded px-1.5 py-0.5 outline-none"
              />
              <button className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                <Search size={12} />
              </button>
            </div>
          </div>

          {/* Policy # dropdown */}
          <div className="flex items-center gap-2 px-2 py-1 border-b border-border-main">
            <label className="text-[10px] font-bold text-text-muted shrink-0 w-14">Policy #:</label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="flex-1 text-[10px] font-semibold text-text-main bg-white border border-border-main rounded px-1.5 py-0.5 outline-none focus:border-primary cursor-pointer truncate"
              title={selectedPolicy}
            >
              {policies.map((p) => {
                const statusFlag = p.status === "Active" ? "A" : "E";
                return (
                  <option key={p.id} value={p.policyNum}>
                    {p.policyNum}, {p.effDate || "N/A"}, {p.expDate || "N/A"}, {p.type || ""}, P, {statusFlag}
                  </option>
                );
              })}
              {policies.length === 0 && (
                <option value="">No policies found</option>
              )}
            </select>
          </div>

          {/* Eff Date dropdown */}
          <div className="flex items-center gap-2 px-2 py-1 border-b border-border-main">
            <label className="text-[10px] font-bold text-text-muted shrink-0 w-14">Eff Date:</label>
            <select
              value={selectedEffDate}
              onChange={(e) => setSelectedEffDate(e.target.value)}
              className="flex-1 text-[10px] font-semibold text-text-main bg-white border border-border-main rounded px-1.5 py-0.5 outline-none focus:border-primary cursor-pointer truncate"
              title={selectedEffDate}
            >
              {policies.map((p) => (
                <option key={p.id} value={`${p.effDate}, ${p.status}, ${p.type}`}>
                  {p.effDate || "N/A"}, New business, NBS, {p.effDate || "N/A"}
                </option>
              ))}
              {policies.length === 0 && (
                <option value="">N/A</option>
              )}
            </select>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto border-t border-border-main bg-white">
            {displayTree.length > 0 ? (
              displayTree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  selected={selectedNode}
                  onSelect={setSelectedNode}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <FileText size={24} className="text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400">No forms found</p>
                <p className="text-[10px] text-slate-300 mt-1">
                  No eForms available for this filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Form preview area ── */}
        <div className="flex-1 flex flex-col bg-gray-200 overflow-auto relative">
          {selectedNode?.startsWith("cert-file") ? (
            <Acord25Form customer={customer} policies={policies} />
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-full">
              <div className="text-center space-y-3 p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border border-border-main shadow-inner flex items-center justify-center mx-auto">
                  <FileSignature size={28} className="text-primary/30" />
                </div>
                <p className="text-sm font-bold text-text-main">eForms Preview</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Select a form from the tree on the left to preview it here. 
                  Forms can be filled out, printed, and submitted electronically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="bg-secondary/30 border-t border-border-main h-7 px-4 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold text-text-muted">View</span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-semibold text-text-muted">
            {customer.division || "Gamaty Insurance Agency LLC"}
          </span>
          <span className="text-[10px] font-bold text-primary">AOR</span>
        </div>
      </div>
    </div>
  );
}
