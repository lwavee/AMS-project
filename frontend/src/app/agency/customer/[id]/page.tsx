/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../lib/config";
import CustomerSidebar, { NAV_ITEMS } from "../../../../components/customer-center/CustomerSidebar";
import {
  ArrowLeft,
  User,
  FileText,
  Activity,
  StickyNote,
  FolderOpen,
  AlertTriangle,
  BarChart2,
  Settings,
  Edit3,
  Download,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Users,
  Briefcase,
  Calendar,
  Hash,
  Shield,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
  Clock,
  MessageSquare,
  Upload,
  Eye,
} from "lucide-react";

// ─── Theme classes (consistent with project) ────────────────────────────────
const cardCls = "bg-white/80 backdrop-blur-xl border border-border-main rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 relative overflow-hidden group";
const sectionTitleCls = "text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2";
const fieldLabelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
const fieldValueCls = "text-[13px] font-semibold text-text-main mt-0.5";
const emptyStateCls = "flex flex-col items-center justify-center py-20 text-center";


// ─── Info field helper ───────────────────────────────────────────────────────
function InfoField({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={fieldLabelCls}>{label}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon size={11} className="text-slate-400 shrink-0" />}
        <span className={`${fieldValueCls} ${!value ? "text-slate-300 italic" : ""}`}>
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className={cardCls}>
      <div className={sectionTitleCls}>
        {Icon && <Icon size={12} className="text-primary" />}
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider shadow-sm transition-all ${isActive ? "bg-gradient-to-r from-success/10 to-success/5 text-success border border-success/20" : "bg-gradient-to-r from-danger/10 to-danger/5 text-danger border border-danger/20"
      }`}>
      {isActive ? <CheckCircle size={11} className="text-success/70" /> : <XCircle size={11} className="text-danger/70" />}
      {status}
    </span>
  );
}

// ─── Type badge ──────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const isCom = type === "Commercial";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider shadow-sm transition-all ${isCom ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20" : "bg-gradient-to-r from-sky-100 to-sky-50 text-sky-600 border border-sky-200"
      }`}>
      {isCom ? <Briefcase size={11} className="text-primary/70" /> : <User size={11} className="text-sky-500/70" />}
      {type}
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: {
  icon: any; title: string; subtitle: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className={emptyStateCls}>
      <div className="h-14 w-14 rounded-[18px] bg-gradient-to-br from-secondary to-white flex items-center justify-center mb-5 border border-border-main shadow-inner relative group-hover:scale-110 transition-transform duration-500">
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        <Icon size={24} className="text-primary/60 relative z-10" />
      </div>
      <p className="font-bold text-[15px] text-text-main px-4">{title}</p>
      <p className="text-[13px] text-slate-500 mt-1.5 max-w-xs">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 h-9 px-5 flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ring-1 ring-white/20"
        >
          <Plus size={13} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TABS
// ─── Inline field row (AMS360 style: "Label:  Value" in one line) ────────────
function FieldRow({ label, value, link }: { label: string; value?: string | null; link?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-0 py-[3px] border-b border-border-main/30 last:border-0">
      <span className="text-[11px] font-bold text-slate-500 shrink-0 w-36">{label}:</span>
      {link ? (
        <a href={`mailto:${value}`} className="text-[11px] font-semibold text-primary hover:underline truncate">{value}</a>
      ) : (
        <span className="text-[11px] font-semibold text-text-main">{value}</span>
      )}
    </div>
  );
}

// ─── Mini data table (AMS360 style) ─────────────────────────────────────────
function MiniTable({ title, columns, rows, addLabel }: {
  title: string;
  columns: string[];
  rows: (string | null)[][];
  addLabel?: string;
}) {
  return (
    <div className="mb-4">
      {/* Collapsible header */}
      <div className="flex items-center justify-between bg-secondary/60 border border-border-main px-4 py-2 rounded-t-xl">
        <span className="section-title text-primary uppercase tracking-widest flex items-center gap-1.5">
          <ChevronRight size={14} className="text-primary" />
          {title}
        </span>
        {addLabel && (
          <button className="h-7 px-3 flex items-center gap-1 bg-white border border-border-main rounded-lg text-xs font-semibold text-slate-500 hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
            <Plus size={12} />
            {addLabel}
          </button>
        )}
      </div>
      <div className="border border-t-0 border-border-main rounded-b-xl overflow-hidden bg-white">
        <table className="premium-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className="table-header border-r border-border-main/20 last:border-r-0">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-slate-400 italic table-body">No records found</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="table-body border-r border-border-main/20 last:border-r-0">{cell || "—"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverviewTab({ c }: { c: any }) {
  const fullAddress = [c.address, c.address2, [c.city, c.state, c.zip].filter(Boolean).join(", ")].filter(Boolean).join("\n");

  return (
    <div className="flex gap-4 h-full">

      {/* ── LEFT COLUMN: Info sections (AMS360 style) ── */}
      <div className="w-64 shrink-0 bg-white border border-border-main rounded-2xl shadow-sm overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* General Information */}
          <div>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2 pb-1 border-b border-border-main">General Information</p>
            <div className="space-y-0">
              <FieldRow label="Balance" value="$0.00" />
              <FieldRow label="Customer Number" value={String(c.id || "—")} />
              <FieldRow label="Type of Customer" value={c.customer_type || "Customer"} />
              <FieldRow label="Type of Business" value={c.type} />
            </div>
            <div className="mt-2 space-y-0">
              <FieldRow label="Name" value={c.name} />
              <FieldRow label="Personal Name" value={[c.first_name, c.last_name].filter(Boolean).join(" ") || null} />
              {c.firm_name && <FieldRow label="Firm Name" value={c.firm_name} />}
              {c.dba && <FieldRow label="DBA" value={c.dba} />}
            </div>
            <div className="mt-2 space-y-0">
              {c.address && <div className="py-[3px] border-b border-border-main/30"><span className="text-[11px] font-bold text-slate-500 block">Address:</span><span className="text-[11px] text-text-main font-semibold">{c.address}{c.address2 ? `, ${c.address2}` : ""}</span><br /><span className="text-[11px] text-text-main">{[c.city, c.state, c.zip].filter(Boolean).join(", ")}</span></div>}
              <FieldRow label="Business" value={c.phone_business} />
              <FieldRow label="Cell" value={c.cell} />
              <FieldRow label="Phone" value={c.phone} />
              <FieldRow label="Fax" value={c.fax} />
              <FieldRow label="Email" value={c.email} link />
              {c.email2 && <FieldRow label="Email2" value={c.email2} link />}
              {c.web && <FieldRow label="Website" value={c.web} />}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2 pb-1 border-b border-border-main">Additional Details</p>
            <div className="space-y-0">
              <FieldRow label="Division" value={c.division} />
              <FieldRow label="Branch" value={c.branch} />
              <FieldRow label="Department" value={c.department} />
              <FieldRow label="Known Since" value={c.known_since_year} />
              <FieldRow label="Notation" value={c.notation} />
            </div>
          </div>

          {/* Contact Preferences */}
          <div>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2 pb-1 border-b border-border-main">Contact Preferences</p>
            <div className="space-y-0">
              <FieldRow label="Preferred Method" value={c.preferred_method} />
              <FieldRow label="Marketing/Solicitation" value={c.marketing_solicitation || "Unspecified"} />
              <FieldRow label="Electronic Delivery" value={c.electronic_delivery || "Ok to send documents"} />
            </div>
          </div>

          {/* Business with Agency */}
          <div>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2 pb-1 border-b border-border-main">Business with Agency</p>
            <div className="space-y-0">
              <FieldRow label="Acquisition" value={c.acquisition || "Unspecified"} />
              <FieldRow label="Business Origin" value={c.business_origin || "Unspecified"} />
              <FieldRow label="Customer Added Date" value={c.customer_added_date || c.created_date} />
              <FieldRow label="Referral Name" value={c.referral_name} />
            </div>
          </div>

          {/* Notes */}
          {c.notes && (
            <div>
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2 pb-1 border-b border-border-main">Notes</p>
              <p className="text-[11px] text-text-main leading-relaxed whitespace-pre-wrap">{c.notes}</p>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT COLUMN: Data tables (AMS360 style) ── */}
      <div className="flex-1 overflow-y-auto space-y-0">

        {/* Contacts table */}
        <MiniTable
          title="Contacts"
          addLabel="Add Contact"
          columns={["Info", "Contact Name", "Title", "Business Phone"]}
          rows={
            c.primary_exec ? [
              ["👤", c.primary_exec, "Primary Exec", c.phone_business || c.phone || ""],
              ...(c.representative ? [["👤", c.representative, "Representative", ""]] : []),
            ] : []
          }
        />

        {/* Dependents */}
        <MiniTable
          title="Dependents"
          addLabel="Add Dependent"
          columns={["Info", "Dependent Name", "Relationship"]}
          rows={[]}
        />

        {/* Account Service Groups */}
        <MiniTable
          title="Account Service Groups"
          addLabel="Add Group"
          columns={["Info", "Primary", "Type", "Title", "Name", "Type of Business"]}
          rows={[
            ...(c.executive ? [["✓", "Yes", "Exec", "Account Exec", c.executive, c.type || "All"]] : []),
            ...(c.representative ? [["✓", "Yes", "Rep", "Account Rep", c.representative, "All"]] : []),
          ]}
        />

        {/* Cross References */}
        <MiniTable
          title="Cross References"
          addLabel="Add Reference"
          columns={["Type", "Cross Reference"]}
          rows={c.match_code ? [["X-Reference", c.match_code]] : []}
        />

        {/* Policy Auto-Check */}
        <MiniTable
          title="Policy Auto-Check"
          columns={["Line of Business", "Enabled"]}
          rows={[
            ["Personal", c.check_personal ? "✓ Yes" : "No"],
            ["Health", c.check_health ? "✓ Yes" : "No"],
            ["Commercial", c.check_commercial ? "✓ Yes" : "No"],
            ["Life", c.check_life ? "✓ Yes" : "No"],
            ["Financial Services", c.check_financial ? "✓ Yes" : "No"],
            ["Benefits", c.check_benefits ? "✓ Yes" : "No"],
          ]}
        />

      </div>
    </div>
  );
}

// ─── AMS360-style action toolbar button ──────────────────────────────────────
function TbarBtn({ icon: Icon, label, primary, onClick }: { icon?: any; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 flex items-center gap-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${primary
        ? "bg-gradient-to-r from-primary to-primary/90 text-white border-transparent hover:shadow-md hover:shadow-primary/30 shadow-sm shadow-primary/20 hover:-translate-y-px"
        : "bg-white/80 backdrop-blur-sm text-slate-600 border-border-main hover:bg-white hover:text-primary hover:shadow-sm hover:border-primary/30"
        }`}>
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
}

function PolicySummaryView({ selectedPolicy, customer }: { selectedPolicy: any, customer: any }) {
  if (!selectedPolicy) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-60">
        <Shield size={32} className="text-slate-300 mb-3" />
        <span className="text-xs font-bold text-slate-500">No Policy Selected</span>
        <span className="text-[10px] text-slate-400 mt-1 max-w-[200px] text-center">Select a policy from the table to view its summary details</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white p-5 space-y-4 border-t border-border-main">
      {/* Basic Policy Information */}
      <div>
        <p className="text-[11px] font-extrabold text-text-main mb-1.5">Basic Policy Information</p>
        <div className="space-y-0">
          <FieldRow label="Business New to Agency" value="N" />
          <div className="flex items-start gap-0 py-[3px] border-b border-border-main/30">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 w-36">Policy #:</span>
            <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">{selectedPolicy.policyNum}</span>
          </div>
          <FieldRow label="Policy Term" value={selectedPolicy.term} />
          <FieldRow label="Policy Type" value={selectedPolicy.type} />
          <FieldRow label="Policy Description" value={selectedPolicy.description} />
          <FieldRow label="Transaction Date" value={selectedPolicy.effDate || "N/A"} />
          <FieldRow label="Transaction Type" value="Rewrite" />
          <FieldRow label="Transaction Description" value="Rewrite" />
          <FieldRow label="Parent Company" value="ISC" />
          <FieldRow label="Writing Company" value={selectedPolicy.company} />
          <FieldRow label="Division" value={customer?.division || "Gamaty Insurance Agency"} />
          <FieldRow label="Branch" value={customer?.branch || "Capital & Co"} />
          <FieldRow label="Department" value={customer?.department || "Commercial"} />
        </div>
      </div>

      {/* Service Personnel */}
      <div className="border-t border-border-main/50 pt-3">
        <p className="text-[11px] font-extrabold text-text-main mb-1.5">Service Personnel</p>
        <div className="space-y-0">
          <FieldRow label="Primary Executive" value={customer?.primary_exec || "Yoav Anatian"} />
          <FieldRow label="Primary Representative" value={customer?.representative || "Yoav Anatian"} />
        </div>
      </div>

      {/* First Named Insured */}
      <div className="border-t border-border-main/50 pt-3">
        <p className="text-[11px] font-extrabold text-text-main mb-1.5">First Named Insured</p>
        <div className="space-y-0">
          <FieldRow label="Firm Name" value={customer?.firm_name || customer?.name} />
          <FieldRow label="Dec Name" value={customer?.firm_name || customer?.name} />
        </div>
      </div>

      {/* Lines of Business */}
      <div className="border-t border-border-main/50 pt-3 flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-text-main">Lines of Business:</p>
        <span className="text-[11px] text-primary font-bold hover:underline cursor-pointer">{selectedPolicy.type}</span>
      </div>
    </div>
  );
}

function EditDocumentPopup({
  file,
  details,
  setDetails,
  onSave,
  onCancel,
}: {
  file: File;
  details: any;
  setDetails: any;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] border border-border-main overflow-hidden">
        <div className="px-5 py-4 border-b border-border-main bg-secondary/30 flex justify-between items-center">
          <h3 className="font-extrabold text-text-main text-sm">Edit Document (EDP)</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-text-main cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">File Name</label>
            <div className="text-xs font-semibold text-text-main bg-secondary/50 px-3 py-2 rounded-lg truncate border border-border-main/50 shadow-inner">
              {file.name}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Action</label>
            <select
              value={details.action}
              onChange={(e) => setDetails({ ...details, action: e.target.value })}
              className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
            >
              <option value="Upload">Upload</option>
              <option value="Download">Download</option>
              <option value="E-Mail In">E-Mail In</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Description</label>
            <input
              type="text"
              value={details.description}
              onChange={(e) => setDetails({ ...details, description: e.target.value })}
              placeholder="e.g. Liability Policy Endorsement"
              className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Ref #</label>
            <input
              type="text"
              value={details.refNum}
              onChange={(e) => setDetails({ ...details, refNum: e.target.value })}
              placeholder="Auto-generated if blank"
              className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border-main bg-secondary/10 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-[11px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer">Cancel</button>
          <button onClick={onSave} className="px-5 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:-translate-y-0.5 rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 cursor-pointer">Save Document</button>
        </div>
      </div>
    </div>
  );
}

function PoliciesTab({ customerId, customer }: { customerId: string, customer?: any }) {
  const cols = ["Policy #", "Status", "Term", "Type", "Company", "Description"];
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showRightPane, setShowRightPane] = useState("Documents");

  const [documents, setDocuments] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEDP, setShowEDP] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<File | null>(null);
  const [docDetails, setDocDetails] = useState({ description: "", action: "Upload", refNum: "" });

  const [activities, setActivities] = useState<any[]>([]);

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({
          id: d.id,
          fileName: d.file_name,
          ext: d.ext,
          action: d.action,
          description: d.description,
          refNum: d.ref_num,
          info: d.info,
          url: d.url
        }));
        setDocuments(formatted);
      }
    } catch (e) {
      console.error("Error loading documents:", e);
    }
  };

  const loadActivities = () => {
    const defaultMocks = [
      {
        id: "mock-1",
        date: "06/09/2026",
        action: "Email",
        description: "Rewrite",
        by: "KAPIL",
        trans: "Rewrite"
      },
      {
        id: "mock-2",
        date: "06/01/2026",
        action: "Certificate",
        description: "e-Form saved",
        by: "CER...",
        trans: "Rewrite"
      }
    ];
    const stored = localStorage.getItem(`activities_log_${customerId}`);
    if (stored) {
      setActivities(JSON.parse(stored));
    } else {
      setActivities(defaultMocks);
      localStorage.setItem(`activities_log_${customerId}`, JSON.stringify(defaultMocks));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setPendingDoc(e.dataTransfer.files[0]);
      setDocDetails({ description: "", action: "Upload", refNum: "" });
      setShowEDP(true);
    }
  };

  const saveDocument = async () => {
    if (pendingDoc) {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", pendingDoc);
        formData.append("action", docDetails.action);
        formData.append("description", docDetails.description || pendingDoc.name);
        formData.append("refNum", docDetails.refNum || "");

        const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) {
          throw new Error("Failed to upload document");
        }

        const uploadedDoc = await res.json();

        // Add to activities
        const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);
        const userEmail = localStorage.getItem("email") || "YOU";
        const userName = userEmail.split('@')[0].toUpperCase();

        const newActivity = {
          id: `act-${uploadedDoc.id}`,
          date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }),
          action: docDetails.action || "Upload",
          description: docDetails.description || `Uploaded file ${pendingDoc.name}`,
          by: userName,
          policyNum: selectedPolicy ? selectedPolicy.policyNum : "N/A",
          effDate: selectedPolicy ? selectedPolicy.effDate || "N/A" : "N/A",
          trans: "Document"
        };

        setActivities(prev => {
          const updated = [newActivity, ...prev];
          localStorage.setItem(`activities_log_${customerId}`, JSON.stringify(updated));
          return updated;
        });

        await loadDocuments();
        setShowEDP(false);
        setPendingDoc(null);
      } catch (error) {
        alert("Upload failed: " + error);
      }
    }
  };

  const loadPolicies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const storedStr = localStorage.getItem(`policies_${customerId}`);
        const storedPolicies = storedStr ? JSON.parse(storedStr) : [];

        const formatted = data.map((p: any) => {
          const storedMatch = storedPolicies.find((sp: any) => sp.id === p.id.toString());
          const mergedLobs = p.lobs || (storedMatch ? storedMatch.lobs : []);

          const displayType = (() => {
            if (mergedLobs && mergedLobs.length > 1) {
              return "Package";
            }
            if (mergedLobs && mergedLobs.length === 1) {
              return mergedLobs[0]?.type || mergedLobs[0]?.level || "";
            }
            return "";
          })();

          return {
            id: p.id.toString(),
            policyNum: p.policy_num,
            status: p.status,
            term: p.term,
            type: displayType,
            lobs: mergedLobs || [],
            company: p.company,
            description: p.description,
            effDate: p.eff_date,
            expDate: p.exp_date,
            createdDate: new Date(p.created_date).toLocaleDateString()
          };
        });
        setPolicies(formatted);
        localStorage.setItem(`policies_${customerId}`, JSON.stringify(formatted));
      } else {
        const stored = localStorage.getItem(`policies_${customerId}`);
        if (stored) {
          setPolicies(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.error(e);
      const stored = localStorage.getItem(`policies_${customerId}`);
      if (stored) {
        setPolicies(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    loadPolicies();
    loadActivities();
    loadDocuments();
    const handleStorageChange = () => {
      loadPolicies();
      loadActivities();
      loadDocuments();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [customerId]);

  return (
    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-secondary/40 border-b border-border-main flex items-center gap-1.5 flex-wrap">
        <TbarBtn
          icon={Plus}
          label="New Policy"
          primary
          onClick={() => window.open(`/agency/customer/${customerId}/new-policy`, '_blank')}
        />
        <TbarBtn label="Copy" />
        <TbarBtn label="Endorse" />
        <TbarBtn label="Renew" />
        <TbarBtn label="Rewrite" />
        <TbarBtn label="Cancel" />
        <TbarBtn label="Binder Bill" />
        <TbarBtn label="Compare" />
        <div className="ml-auto">
          <TbarBtn icon={Download} label="Export All" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch border-t-0 lg:border-t-0">
        {/* Left Side: Policies */}
        <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border-main">
          <div className="overflow-x-auto flex-1">
            <table className="premium-table w-full">
              <thead>
                <tr>
                  <th className="w-12 text-center table-header border-r border-border-main/20">Type</th>
                  {cols.map(col => (
                    <th key={col} className="table-header border-r border-border-main/20 last:border-r-0">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 1} className="py-20 text-center table-body">
                      <div className="flex flex-col items-center gap-2">
                        <Shield size={28} className="text-slate-200" />
                        <p className="font-bold text-slate-400">No Policies Found</p>
                        <p className="text-slate-300">Click <strong>+ New Policy</strong> to add a policy for this customer.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  policies.map((p) => {
                    const isSelected = selectedPolicyId === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPolicyId(p.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "selected-row" : ""}`}
                      >
                        <td className="text-center table-body text-base border-r border-border-main/20">🛡️</td>
                        <td className="table-body font-bold border-r border-border-main/20">
                          <span
                            onClick={() => window.open(`/agency/customer/${customerId}/policy/${p.id}`, '_blank', 'width=1100,height=850')}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            {p.policyNum}
                          </span>
                        </td>
                        <td className="table-body font-bold text-success border-r border-border-main/20">{p.status}</td>
                        <td className="table-body text-slate-500 border-r border-border-main/20">{p.term}</td>
                        <td className="table-body text-slate-500 border-r border-border-main/20">{p.type}</td>
                        <td className="table-body text-slate-500 font-semibold border-r border-border-main/20">{p.company}</td>
                        <td className="table-body text-slate-500">{p.description}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Policies Footer */}
          <div className="px-4 py-2 border-t border-border-main bg-secondary/20 text-[10px] text-slate-400 font-semibold shrink-0">
            Displaying record(s) {policies.length > 0 ? `1 - ${policies.length} of ${policies.length}` : "0 - 0 of 0"}
          </div>
        </div>

        {/* Right Side: Documents Array */}
        <div className="w-full lg:w-[480px] shrink-0 flex flex-col bg-white">
          <div className="px-3 py-2 border-b border-border-main bg-secondary/10 flex items-center gap-2">
            <span className="text-[11px] font-bold text-text-main">Show:</span>
            <select
              value={showRightPane}
              onChange={(e) => setShowRightPane(e.target.value)}
              className="text-[11px] font-bold border border-border-main rounded px-1.5 py-0.5 min-w-[120px] bg-white text-text-main outline-none focus:border-primary"
            >

              <option value="Policy ">Policy Summary</option>
              <option value="Documents">Documents</option>
              <option value="Notes">Notes</option>
              <option value="Activity">Activity</option>
            </select>
          </div>

          {showRightPane === "Documents" && (
            <>
              <div
                className={`overflow-x-auto flex-1 relative transition-colors duration-200 ${isDragOver ? "bg-primary/5 ring-2 ring-inset ring-primary/40" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragOver && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-[1px] border-2 border-dashed border-primary/50 m-2 rounded-xl pointer-events-none">
                    <FolderOpen size={48} className="text-primary mb-3 animate-bounce" />
                    <p className="font-extrabold text-primary text-sm shadow-sm p-1">Drop document here to edit details</p>
                  </div>
                )}
                <table className="premium-table w-full whitespace-nowrap">
                  <thead>
                    <tr>
                      <th className="table-header text-center w-8 border-r border-border-main/20"><input type="checkbox" className="cursor-pointer" /></th>
                      <th className="table-header text-center w-8 border-r border-border-main/20">@</th>
                      <th className="table-header text-center w-10 border-r border-border-main/20">Info</th>
                      <th className="table-header border-r border-border-main/20">Action</th>
                      <th className="table-header border-r border-border-main/20">File Name</th>
                      <th className="table-header border-r border-border-main/20 w-12 text-center">Ext.</th>
                      <th className="table-header border-r border-border-main/20">Description</th>
                      <th className="table-header w-20">Ref #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-20 text-xs text-slate-500 italic table-body">
                          <span className="block mb-1">No documents found.</span>
                          <span className="text-[10px] text-slate-400">Drag and drop a file here to open the <strong>Edit Document Popup</strong>.</span>
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-secondary/40">
                          <td className="table-body text-center border-r border-border-main/20"><input type="checkbox" className="cursor-pointer" /></td>
                          <td className="table-body text-center border-r border-border-main/20 text-slate-400">📎</td>
                          <td className="table-body text-center border-r border-border-main/20">
                            <FileText size={12} className="inline-block text-primary" />
                          </td>
                          <td className="table-body border-r border-border-main/20">{doc.action}</td>
                          <td 
                            className="table-body border-r border-border-main/20 text-blue-600 font-bold cursor-pointer hover:underline truncate max-w-[150px]"
                            onClick={() => {
                              if (doc.url) {
                                const targetUrl = doc.url.startsWith("/") ? `${API_BASE_URL}${doc.url}` : doc.url;
                                window.open(targetUrl, '_blank');
                              }
                            }}
                          >
                            {doc.fileName}
                          </td>
                          <td className="table-body text-center border-r border-border-main/20 font-semibold">{doc.ext}</td>
                          <td className="table-body border-r border-border-main/20 truncate max-w-[150px]">{doc.description}</td>
                          <td className="table-body">{doc.refNum}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Documents Footer */}
              <div className="px-3 py-2 border-t border-border-main bg-secondary/20 text-[10px] text-slate-400 font-semibold shrink-0 mt-auto text-right">
                Displaying record(s) {documents.length > 0 ? `1 - ${documents.length} of ${documents.length}` : "0 - 0 of 0"}
              </div>
              {/* EDP Modal */}
              {showEDP && pendingDoc && (
                <EditDocumentPopup
                  file={pendingDoc}
                  details={docDetails}
                  setDetails={setDocDetails}
                  onSave={saveDocument}
                  onCancel={() => { setShowEDP(false); setPendingDoc(null); }}
                />
              )}
            </>
          )}

          {showRightPane === "Notes" && (
            <div className="flex-1 overflow-y-auto p-4">
              <NotesTab customerId={customerId} />
            </div>
          )}

          {showRightPane === "Policy " && (
            <PolicySummaryView selectedPolicy={policies.find((p) => p.id === selectedPolicyId)} customer={customer} />
          )}

          {showRightPane === "Activity" && (
            <div className="flex-1 flex flex-col bg-white border-t border-border-main">
              <div className="px-3 py-1.5 border-b border-border-main bg-secondary/20 flex gap-2">
                <TbarBtn
                  icon={Plus}
                  label="New Activity"
                  onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, '_blank', 'width=1000,height=900')}
                />
                <TbarBtn label="Activity Grouping" />
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="premium-table w-full whitespace-nowrap">
                  <thead>
                    <tr>
                      <th className="table-header text-center w-8 border-r border-border-main/20">@</th>
                      <th className="table-header border-r border-border-main/20">Date</th>
                      <th className="table-header border-r border-border-main/20">Action</th>
                      <th className="table-header border-r border-border-main/20">Description</th>
                      <th className="table-header border-r border-border-main/20">By</th>
                      <th className="table-header border-r border-border-main/20">Policy #</th>
                      <th className="table-header border-r border-border-main/20">Eff. Date</th>
                      <th className="table-header border-r border-border-main/20">Trans.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPolicyId ? (
                      activities.map((act) => {
                        const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);
                        const displayPolicyNum = act.policyNum || selectedPolicy?.policyNum || "N/A";
                        const displayEffDate = act.effDate || selectedPolicy?.effDate || "N/A";

                        return (
                          <tr key={act.id} className="hover:bg-secondary/40">
                            <td className="table-body text-center border-r border-border-main/20 text-slate-400">📎</td>
                            <td className="table-body text-blue-600 font-semibold cursor-pointer hover:underline border-r border-border-main/20">{act.date}</td>
                            <td className="table-body border-r border-border-main/20">{act.action}</td>
                            <td className="table-body border-r border-border-main/20 truncate max-w-[120px]">{act.description}</td>
                            <td className="table-body border-r border-border-main/20">{act.by}</td>
                            <td className="table-body border-r border-border-main/20 truncate max-w-[100px]">{displayPolicyNum}</td>
                            <td className="table-body border-r border-border-main/20">{displayEffDate}</td>
                            <td className="table-body border-r border-border-main/20">{act.trans}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-20 text-xs text-slate-500 italic table-body">No activities found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-border-main bg-secondary/20 text-[10px] text-slate-400 font-semibold shrink-0 mt-auto text-right">
                Displaying record(s) {selectedPolicyId ? `1 - ${activities.length} of ${activities.length}` : "0 - 0 of 0"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivitiesTab({ customerId }: { customerId: string }) {
  const cols = ["Date", "By", "Policy #", "Eff. Date", "Trans.", "Action", "Description", "Group"];
  const [activities, setActivities] = useState<any[]>([]);

  const loadActivities = () => {
    const defaultMocks = [
      {
        id: "mock-1",
        date: "06/09/2026",
        by: "KAPIL",
        action: "Email",
        description: "Rewrite",
        policyNum: "ISCCX03000010905",
        effDate: "02/24/2026",
        trans: "Rewrite",
        group: "(All)"
      },
      {
        id: "mock-2",
        date: "06/01/2026",
        by: "CER...",
        action: "Certificate",
        description: "e-Form saved",
        policyNum: "ISCCX03000010905",
        effDate: "02/24/2026",
        trans: "Rewrite",
        group: "(All)"
      }
    ];
    const stored = localStorage.getItem(`activities_log_${customerId}`);
    if (stored) {
      setActivities(JSON.parse(stored));
    } else {
      setActivities(defaultMocks);
      localStorage.setItem(`activities_log_${customerId}`, JSON.stringify(defaultMocks));
    }
  };

  useEffect(() => {
    if (customerId) {
      loadActivities();
      const handleStorageChange = () => {
        loadActivities();
      };
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [customerId]);

  return (
    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-secondary/40 border-b border-border-main flex items-center gap-1.5 flex-wrap">
        <TbarBtn
          icon={Plus}
          label="New Activity"
          primary
          onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, '_blank', 'width=1000,height=900')}
        />
        <TbarBtn label="Activity Grouping" />
        <div className="ml-auto">
          <TbarBtn icon={Download} label="Export All" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              <th className="w-12 text-center table-header border-r border-border-main/20">Type</th>
              {cols.map(col => (
                <th key={col} className="table-header border-r border-border-main/20 last:border-r-0 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className="py-20 text-center table-body">
                  <div className="flex flex-col items-center gap-2">
                    <Activity size={28} className="text-slate-200" />
                    <p className="font-bold text-slate-400">No Activities Found</p>
                    <p className="text-slate-300">Click <strong>+ New Activity</strong> to log an activity for this customer.</p>
                  </div>
                </td>
              </tr>
            ) : (
              activities.map((act) => (
                <tr key={act.id} className="hover:bg-secondary/40">
                  <td className="text-center table-body text-base border-r border-border-main/20">
                    {act.type === "Suspense" ? "🔔" : "📎"}
                  </td>
                  <td className="table-body text-blue-600 font-bold border-r border-border-main/20">{act.date}</td>
                  <td className="table-body border-r border-border-main/20">{act.by}</td>
                  <td className="table-body font-mono border-r border-border-main/20">{act.policyNum || "N/A"}</td>
                  <td className="table-body border-r border-border-main/20">{act.effDate || "N/A"}</td>
                  <td className="table-body border-r border-border-main/20">{act.trans || "General"}</td>
                  <td className="table-body border-r border-border-main/20">{act.action || "Email"}</td>
                  <td className="table-body border-r border-border-main/20 truncate max-w-[200px]">{act.description}</td>
                  <td className="table-body">{act.group || "(All)"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-main bg-secondary/20 text-[10px] text-slate-400 font-semibold">
        Displaying record(s) {activities.length > 0 ? `1 - ${activities.length} of ${activities.length}` : "0 - 0 of 0"}
      </div>
    </div>
  );
}




function NotesTab({ customerId }: { customerId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error("Failed to fetch notes", e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchNotes();
    }
  }, [customerId, fetchNotes]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("email") || "YOU";
      const userName = userEmail.split('@')[0].toUpperCase();
      const userRole = localStorage.getItem("role") || "agent";

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newNote.trim(),
          author: userName,
          role: userRole
        })
      });

      if (res.ok) {
        setNewNote("");
        fetchNotes();
      }
    } catch (e) {
      console.error("Failed to add note", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (e) {
      console.error("Failed to delete note", e);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: editText.trim() })
      });
      if (res.ok) {
        setEditingId(null);
        fetchNotes();
      }
    } catch (e) {
      console.error("Failed to edit note", e);
    }
  };

  return (
    <div className={cardCls}>
      <div className={sectionTitleCls}>
        <StickyNote size={12} className="text-primary" />
        Customer Notes
      </div>

      {/* Create note */}
      <div className="flex gap-2 mb-5">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Write a note..."
          rows={2}
          className="flex-1 px-3 py-2 border border-border-main rounded-xl text-xs text-text-main bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim()}
          className="h-10 px-4 self-start bg-gradient-to-r from-primary to-primary/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ring-1 ring-white/20"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {/* Note list */}
      {loading ? (
        <div className="py-10 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No Notes Yet"
          subtitle="Add a note above to start documenting important information about this customer."
        />
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="border border-border-main rounded-xl p-3.5 bg-secondary/20 group">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-primary/40 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 resize-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(note.id)} className="h-7 px-3 bg-gradient-to-r from-primary to-primary/80 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">Save</button>
                    <button onClick={() => setEditingId(null)} className="h-7 px-3 border border-border-main text-[10px] font-bold rounded-lg cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-text-main leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 bg-white px-2 py-0.5 rounded border border-border-main">
                        By: {note.author} ({note.role})
                      </span>
                      <span className="text-[10px] text-slate-400">{note.created_at}</span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} className="h-6 w-6 flex items-center justify-center border border-border-main rounded-lg hover:bg-white cursor-pointer transition-colors">
                        <Edit3 size={10} className="text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="h-6 w-6 flex items-center justify-center border border-danger/30 rounded-lg hover:bg-danger/5 cursor-pointer transition-colors">
                        <Trash2 size={10} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab() {
  const [docs, setDocs] = useState<{ id: number; name: string; size: string; date: string }[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs(prev => [
      { id: Date.now(), name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, date: new Date().toLocaleDateString() },
      ...prev,
    ]);
    e.target.value = "";
  };

  return (
    <div className={cardCls}>
      <div className={sectionTitleCls}>
        <FolderOpen size={12} className="text-primary" />
        Customer Documents
      </div>

      {/* Upload */}
      <label className="mb-5 flex items-center gap-2.5 h-10 px-4 bg-white border border-dashed border-primary/40 rounded-xl cursor-pointer hover:bg-secondary/40 transition-all w-fit">
        <Upload size={14} className="text-primary" />
        <span className="text-xs font-bold text-primary">Upload Document</span>
        <input type="file" className="hidden" onChange={handleUpload} />
      </label>

      {docs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No Documents"
          subtitle="Upload documents for this customer. Document storage requires Supabase Storage integration."
        />
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 border border-border-main rounded-xl hover:bg-secondary/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                  <FileText size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-main">{doc.name}</p>
                  <p className="text-[10px] text-slate-400">{doc.size} · {doc.date}</p>
                </div>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="h-7 w-7 flex items-center justify-center border border-border-main rounded-lg hover:bg-white cursor-pointer">
                  <Eye size={12} className="text-slate-400" />
                </button>
                <button className="h-7 w-7 flex items-center justify-center border border-border-main rounded-lg hover:bg-white cursor-pointer">
                  <Download size={12} className="text-slate-400" />
                </button>
                <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} className="h-7 w-7 flex items-center justify-center border border-danger/30 rounded-lg hover:bg-danger/5 cursor-pointer">
                  <Trash2 size={12} className="text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-300 mt-4 italic">
        Note: Persistent document storage requires Supabase Storage integration.
      </p>
    </div>
  );
}

function ClaimsTab() {
  return (
    <div className={cardCls}>
      <EmptyState
        icon={AlertTriangle}
        title="No Claims Found"
        subtitle="Claims filed for this customer will appear here."
        actionLabel="File Claim"
        onAction={() => { }}
      />
    </div>
  );
}

function ReportsTab() {
  return (
    <div className={cardCls}>
      <EmptyState
        icon={BarChart2}
        title="No Reports Available"
        subtitle="Customer reports and analytics will appear here once data is available."
        actionLabel="Generate Report"
        onAction={() => { }}
      />
    </div>
  );
}

function SettingsTab({ c }: { c: any }) {
  return (
    <div className="space-y-5">
      <Section title="Folder Settings" icon={Settings}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoField label="Customer Status" value={c.status} />
          <InfoField label="Customer Type" value={c.customer_type} />
          <InfoField label="Exclude from Target List" value={c.exclude_target_list ? "Yes" : "No"} />
          <InfoField label="Exclude from Purge" value={c.exclude_purge ? "Yes" : "No"} />
          <InfoField label="Alt Name for Billing" value={c.alt_name_billing ? "Yes" : "No"} />
          <InfoField label="Alt Address for Billing" value={c.alt_address_billing ? "Yes" : "No"} />
        </div>
      </Section>
      <Section title="Multiple Entity" icon={Building2}>
        <InfoField label="Multiple Entity Type" value={c.multiple_entity_customer_type || "Standard"} />
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { setError("Customer not found."); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer.");
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  useEffect(() => {
    if (customerId) fetchCustomer();
  }, [customerId, fetchCustomer]);

  const handleExport = () => {
    if (!customer) return;
    const rows = Object.entries(customer).map(([k, v]) => `${k},${JSON.stringify(v)}`).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer_${customer.id}_${customer.name?.replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="bg-white/80 backdrop-blur-xl border-b border-border-main h-16 px-6 flex items-center gap-3 shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-50">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 ring-1 ring-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 w-1/2 h-full transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
            <span className="text-white font-bold text-xl tracking-wider font-sans relative z-10">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">
              Sterling Insurance Services
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white px-10 py-8 rounded-2xl border border-border-main shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Loading Customer Profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !customer) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="h-16 bg-white border-b border-border-main px-6 flex items-center gap-3 shrink-0 shadow-sm">
          <button onClick={() => router.push("/agency/dashboard")} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white px-10 py-8 rounded-2xl border border-border-main shadow-xl flex flex-col items-center gap-3 max-w-sm text-center">
            <AlertTriangle size={32} className="text-danger" />
            <p className="font-bold text-sm text-text-main">Failed to Load Customer</p>
            <p className="text-xs text-slate-400">{error || "Customer not found."}</p>
            <button onClick={() => router.push("/agency/dashboard")} className="mt-3 h-9 px-5 bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-primary/30 shadow-sm shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-white/20">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Unknown Customer";

  // ── Main render ──
  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans select-none text-text-main overflow-hidden">

      {/* ── Top Header ── */}
      <header className="bg-white/70 backdrop-blur-2xl border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-40 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        {/* Brand + Back */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 ring-1 ring-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 w-1/2 h-full transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
            <span className="text-white font-bold text-xl tracking-wider font-sans relative z-10">S</span>
          </div>
          <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans hidden md:inline-block">
            Sterling Insurance Services
          </span>
          <div className="h-5 w-px bg-border-main"></div>
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Customer Center
          </button>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-xs font-bold text-text-main truncate max-w-[200px]">{displayName}</span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/agency/new-customer`)}
            className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-slate-600 hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Edit3 size={13} />
            Edit Customer
          </button>
          <button
            onClick={handleExport}
            className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-slate-600 hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </header>

      {/* ── Sub-breadcrumb band ── */}
      <div className="bg-white border-b border-border-main h-9 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          <span>Customer</span>
          <span className="text-slate-300">/</span>
          <span className="text-primary">{displayName}</span>
          <span className="text-slate-300">/</span>
          <span className="capitalize">{activeTab}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {customer.division || "Gamaty Insurance Agency"}
        </span>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} customerId={customerId as string} />

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-bg-base">

          {/* ─ Content Title Bar (AMS360-style: name + active tab, sticky) ─ */}
          <div className="bg-white border-b border-border-main px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-extrabold text-sm text-text-main tracking-tight truncate">
                {displayName}
              </h1>
              <span className="text-slate-300 text-xs shrink-0">—</span>
              <span className="text-xs font-bold text-primary capitalize shrink-0">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchCustomer}
                className="h-7 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-slate-500 hover:text-primary text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wide"
              >
                <Activity size={11} />
                Refresh
              </button>
            </div>
          </div>

          {/* ─ Always-Visible Customer Info Summary Strip (AMS360-style) ─ */}
          <div className="bg-white border-b-2 border-border-main px-5 py-3.5 shrink-0">
            <div className="flex items-start gap-8 flex-wrap">

              {/* Address block */}
              <div className="space-y-0.5 min-w-[160px]">
                {(customer.address || customer.city) && (
                  <div className="flex items-start gap-1.5">
                    <MapPin size={11} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      {customer.address && <p className="text-xs font-semibold text-text-main leading-snug">{customer.address}</p>}
                      {customer.address2 && <p className="text-xs text-slate-500 leading-snug">{customer.address2}</p>}
                      {(customer.city || customer.state || customer.zip) && (
                        <p className="text-xs text-slate-500 leading-snug">
                          {[customer.city, customer.state, customer.zip].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-border-main self-center hidden sm:block" />

              {/* Phones block */}
              <div className="space-y-1">
                {customer.phone && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide w-16 shrink-0">Primary:</span>
                    <span className="text-xs font-semibold text-text-main font-mono">{customer.phone}</span>
                  </div>
                )}
                {customer.phone_business && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide w-16 shrink-0">Business:</span>
                    <span className="text-xs font-semibold text-text-main font-mono">{customer.phone_business}</span>
                  </div>
                )}
                {customer.cell && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide w-16 shrink-0">Cell:</span>
                    <span className="text-xs font-semibold text-text-main font-mono">{customer.cell}</span>
                  </div>
                )}
                {!customer.phone && !customer.phone_business && !customer.cell && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} className="text-slate-300" />
                    <span className="text-xs text-slate-300 italic">No phone on record</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-border-main self-center hidden sm:block" />

              {/* Email / Web block */}
              <div className="space-y-1">
                {customer.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} className="text-primary shrink-0" />
                    <a href={`mailto:${customer.email}`} className="text-xs font-semibold text-primary hover:underline truncate max-w-[200px]">{customer.email}</a>
                  </div>
                )}
                {customer.email2 && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${customer.email2}`} className="text-xs font-semibold text-slate-500 hover:underline truncate max-w-[200px]">{customer.email2}</a>
                  </div>
                )}
                {customer.web && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={11} className="text-slate-400 shrink-0" />
                    <a href={customer.web} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-500 hover:underline truncate max-w-[200px]">{customer.web}</a>
                  </div>
                )}
                {!customer.email && !customer.web && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} className="text-slate-300" />
                    <span className="text-xs text-slate-300 italic">No email on record</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-border-main self-center hidden lg:block" />

              {/* Exec / Status block */}
              <div className="space-y-1 hidden lg:block">
                {customer.primary_exec && (
                  <div className="flex items-center gap-1.5">
                    <User size={11} className="text-primary shrink-0" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Exec:</span>
                    <span className="text-xs font-semibold text-text-main">{customer.primary_exec}</span>
                  </div>
                )}
                {customer.created_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Since:</span>
                    <span className="text-xs font-semibold text-slate-500">{customer.created_date}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <StatusBadge status={customer.status || "Active"} />
                  <TypeBadge type={customer.type || "Commercial"} />
                </div>
              </div>

            </div>
          </div>

          {/* ─ Scrollable Tab Content ─ */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "overview" && <OverviewTab c={customer} />}
            {activeTab === "policies" && <PoliciesTab customerId={customerId as string} customer={customer} />}
            {activeTab === "activities" && <ActivitiesTab customerId={customerId as string} />}
            {activeTab === "notes" && <NotesTab customerId={customerId as string} />}
            {activeTab === "documents" && <DocumentsTab />}
            {activeTab === "claims" && <ClaimsTab />}
            {activeTab === "reports" && <ReportsTab />}
            {activeTab === "settings" && <SettingsTab c={customer} />}
            {activeTab === "eforms" && (
              <div className={cardCls}>
                <div className={sectionTitleCls}>
                  <FileText size={12} className="text-primary" />
                  eForms
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    "Applications", "Auto ID Card", "Binder", "Cancellation",
                    "Certificate of Liability", "Certificate of Property",
                    "Change Request", "EPI", "Loss Notice", "Additional Forms"
                  ].map((formType) => (
                    <button
                      key={formType}
                      onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager`, '_blank')}
                      className="flex items-center gap-2.5 p-3.5 border border-border-main rounded-xl hover:bg-secondary/40 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer text-left group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/15 shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                        <FileText size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{formType}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border-main pt-4">
                  <button
                    onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager`, '_blank')}
                    className="h-9 px-5 flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ring-1 ring-white/20"
                  >
                    <FileText size={13} />
                    Open eForms Manager
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>

      </div>
    </div>
  );
}
