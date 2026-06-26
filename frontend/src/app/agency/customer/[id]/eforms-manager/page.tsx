/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../lib/config";
import Acord25Form from "../../../../../services/pdf/Acord25Form";
import Header from "../../../../../components/Header";
import RightDrawer from "../../../../../components/RightDrawer";
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
  Save,
  Copy,
  Paperclip,
  Printer,
  Plus,
  Minus,
  Edit3,
  Download,
  UploadCloud,
  FilePlus,
  Activity,
  MoreHorizontal,
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
  onAddEditHolder,
}: {
  node: TreeNode;
  depth?: number;
  selected: string | null;
  onSelect: (id: string) => void;
  onAddEditHolder?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const isFolder = node.type === "folder";
  const isSelected = selected === node.id;
  
  // Menu logic
  const [menuOpen, setMenuOpen] = useState(false);
  const isMaster = node.id.startsWith("cert-file-master-");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div>
      <div className="relative group" ref={menuRef}>
        <div
          className={`
            w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[13px] font-medium rounded-lg
            transition-all duration-150 text-left my-0.5
            ${isSelected
              ? "bg-secondary text-primary font-bold"
              : "text-black hover:bg-secondary/50 hover:text-primary"
            }
          `}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <div 
            className="flex flex-1 items-center gap-2 truncate cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (isFolder) setExpanded(!expanded);
              onSelect(node.id);
            }}
          >
            {isFolder ? (
              expanded ? (
                <>
                  <ChevronDown size={14} className="shrink-0 text-primary/60" />
                  <FolderOpen size={16} className="shrink-0 text-primary fill-primary/20" />
                </>
              ) : (
                <>
                  <ChevronRight size={14} className="shrink-0 text-text-muted/60" />
                  <FolderClosed size={16} className="shrink-0 text-text-muted" />
                </>
              )
            ) : (
              <>
                <span className="w-[14px] shrink-0" />
                <FileText size={16} className="shrink-0 text-text-muted/60" />
              </>
            )}
            <span className="truncate">{node.label}</span>
          </div>
          
          {isMaster && (
            <button 
              className={`p-1 rounded-md hover:bg-slate-300 ${menuOpen ? 'bg-slate-300' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <MoreHorizontal size={14} className="text-slate-500" />
            </button>
          )}
        </div>
        
        {isMaster && menuOpen && (
          <div 
            className="absolute z-50 right-4 top-8 bg-white border border-slate-200 shadow-xl rounded-md py-1 w-48 text-xs font-medium text-slate-700"
          >
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
              onClick={() => {
                setMenuOpen(false);
                if (onAddEditHolder) onAddEditHolder(node.id);
              }}
            >
              Add/Edit Holder
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Copy</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Renew</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Replace Master Cert</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Update Master Cert</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Distribute Certificates</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Attachments</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-red-600">Delete</button>
            <div className="h-px bg-slate-200 my-1"></div>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Expand Node</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Expand All</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Collapse</button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Collapse All</button>
          </div>
        )}
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
              onAddEditHolder={onAddEditHolder}
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createdCertificates, setCreatedCertificates] = useState<any[]>([]);

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

      const [custRes, polRes, certRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
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

      if (certRes.ok) {
        const certData = await certRes.json();
        const formattedCerts = certData.map((c: any) => ({
          id: `cert-file-master-${c.id}`,
          label: c.description || "my frist master",
          type: "folder" as const,
          formType: "Certificates",
          children: [] // No documents available yet
        }));
        setCreatedCertificates(formattedCerts);
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CREATE_CERTIFICATE') {
        const newCert = {
          id: `cert-file-master-${event.data.payload.id}`,
          label: event.data.payload.name || "my frist master",
          type: "folder" as const,
          formType: "Certificates",
          children: [] // No documents available yet
        };
        setCreatedCertificates(prev => [...prev, newCert]);
        setActiveTab("Certificates");
        setSelectedNode(newCert.id);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
          ...createdCertificates
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
            return node.formType?.includes(filterType) || activeTab === "All Forms" ? node : null;
          }
          if (node.children) {
            const filtered = filterNodes(node.children);
            if (filtered.length > 0) {
              return { ...node, children: filtered };
            }
          }
          // Keep empty folders if they explicitly match the formType (like Master Certificates)
          if (node.type === "folder" && (node.formType?.includes(filterType) || activeTab === "All Forms")) {
            return { ...node, children: [] };
          }
          // Keep root folder even if empty for context
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

  const renderActionButtons = () => {
    switch (activeTab) {
      case "All Forms":
        return (
          <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
            <Trash2 size={13} />
            Delete
          </button>
        );
      case "Applications":
      case "Loss Notices":
        return (
          <>
            <button
              onClick={() => {
                if (activeTab === "Applications") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-application`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                } else if (activeTab === "Loss Notices") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-loss-notice`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                }
              }}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      case "AutoId Cards":
        return (
          <>
            <button
              onClick={() => {
                if (activeTab === "AutoId Cards") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-autoid`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                }
              }}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Email
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Print
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      case "Binders":
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-binder`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-3.5 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Cancel</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Extend</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replaced by Policy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Update</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replace</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Interests</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </div>
        );
      case "Certificates":
        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-certificate`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New Cert Liab
            </button>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cert-prop`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New Cert Prop
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </>
        );
      case "EPI":
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-epi`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Update</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replace</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Interests</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Distribute EPI</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </div>
        );
      case "Change Requests":
        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-change-request`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </>
        );
      case "Cancellations":
        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cancellation`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-email`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              New & Email
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Print
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans select-none overflow-hidden">

      {/* ── Modern Shared Top Header ── */}
      {/* <Header onToggleDrawer={() => setDrawerOpen(true)} /> */}
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-base p-4 lg:p-6 gap-4">

        {/* Top Breadcrumb/Back */}
        {/* <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-text-muted px-2 shrink-0">
          <button
            onClick={() => router.push(`/agency/customer/${customerId}`)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft size={13} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Customer
          </button>
          <ChevronRight size={11} className="text-border-main" />
          <span className="text-text-main truncate">eForms Manager</span>
        </div> */}  

        {/* ─ Modern Floating eForms Card ─ */}
        <div className="bg-white border border-border-main rounded-2xl flex flex-col flex-1 shrink-0 shadow-sm overflow-hidden min-h-0">

          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-border-main/50 gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileSignature size={20} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-lg text-text-main tracking-tight truncate flex items-center gap-2">
                  {customerName}
                  <span className="text-border-main text-sm font-normal hidden sm:inline">—</span>
                  <span className="text-sm font-bold text-primary hidden sm:inline">eForms Manager</span>
                </h1>
                <p className="text-[11px] font-semibold text-text-muted mt-0.5 truncate">
                  {policies.length > 0 && policies[0].effDate ? `Policy #${policies[0].policyNum} | Effective: ${policies[0].effDate}` : "No Active Policies"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
                <Save size={13} />
                <span className="hidden lg:inline">Save</span>
              </button>
              <button className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
                <Printer size={13} />
                <span className="hidden lg:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
            {EFORM_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  h-8 px-4 flex items-center justify-center text-[12px] whitespace-nowrap transition-all cursor-pointer rounded-xl
                  ${activeTab === tab
                    ? "bg-secondary text-primary font-bold"
                    : "text-text-muted hover:text-text-main hover:bg-secondary/50 font-semibold"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Contextual Action Bar */}
          <div className="px-6 py-2.5 border-y border-border-main flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar bg-slate-50/50">
            {renderActionButtons()}
          </div>

          {/* ── Main Content Split ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── Left Panel: Customer/Policy selectors + Tree ── */}
            <div className="w-[340px] shrink-0 border-r border-border-main bg-white flex flex-col h-full">

              {/* Filters Section */}
              <div className="p-4 flex flex-col gap-3 border-b border-border-main bg-white">

                {/* Customer field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Customer</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customerName}
                      readOnly
                      className="flex-1 text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none"
                    />
                    <button className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0">
                      <Search size={14} />
                    </button>
                  </div>
                </div>

                {/* Policy # dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Policy #</label>
                  <select
                    value={selectedPolicy}
                    onChange={(e) => setSelectedPolicy(e.target.value)}
                    className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer truncate appearance-none"
                    title={selectedPolicy}
                  >
                    {policies.map((p) => {
                      const statusFlag = p.status === "Active" ? "A" : "E";
                      return (
                        <option key={p.id} value={p.policyNum}>
                          {p.policyNum} | {p.type || "Policy"} ({statusFlag})
                        </option>
                      );
                    })}
                    {policies.length === 0 && (
                      <option value="">No policies found</option>
                    )}
                  </select>
                </div>

                {/* Eff Date dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Effective Date</label>
                  <select
                    value={selectedEffDate}
                    onChange={(e) => setSelectedEffDate(e.target.value)}
                    className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer truncate appearance-none"
                    title={selectedEffDate}
                  >
                    {policies.map((p) => (
                      <option key={p.id} value={`${p.effDate}, ${p.status}, ${p.type}`}>
                        {p.effDate || "N/A"} - NBS
                      </option>
                    ))}
                    {policies.length === 0 && (
                      <option value="">N/A</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Tree View */}
              <div className="flex-1 overflow-y-auto bg-white p-2">
                {displayTree.length > 0 ? (
                  displayTree.map((node) => (
                    <TreeItem
                      key={node.id}
                      node={node}
                      selected={selectedNode}
                      onSelect={setSelectedNode}
                      onAddEditHolder={(id) => {
                        window.open(
                          `/agency/customer/${customerId}/eforms-manager/add-edit-holder?certId=${id}`,
                          '_blank',
                          'width=1050,height=800,menubar=no,toolbar=no'
                        );
                      }}
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
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-auto relative">
              {selectedNode?.startsWith("cert-file-master-") ? (
                <iframe src={`/acord-form.html?customerId=${customerId}`} className="w-full h-full border-none bg-white" />
              ) : selectedNode?.startsWith("cert-file") ? (
                <Acord25Form customer={customer} policies={policies} />
              ) : (
                <div className="flex-1 flex items-center justify-center min-h-full">
                  <div className="text-center space-y-4 p-8">
                    <div className="h-20 w-20 rounded-3xl bg-white border border-border-main shadow-sm flex items-center justify-center mx-auto transition-transform hover:scale-105">
                      <FileSignature size={32} className="text-primary/40" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-text-main tracking-tight">eForms Preview</h3>
                      <p className="text-[13px] text-text-muted max-w-[260px] mx-auto mt-1.5 leading-relaxed">
                        Select a form from the tree on the left to preview it here. Forms can be filled out, printed, and submitted electronically.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}