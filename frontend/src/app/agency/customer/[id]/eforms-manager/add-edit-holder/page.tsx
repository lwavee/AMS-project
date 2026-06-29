/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Search, FileText, Check, Plus, Trash2, Shield, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

// ── All 50 US states ────────────────────────────────────────────────────────────
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// ── Description of Operations templates ─────────────────────────────────────────
const MASTER_DESC =
  "Verification of Insurance Coverage (Subject to all policy terms, exclusions and conditions)";

const DESC_TEMPLATES: Record<string, string> = {
  "": "",
  AI: "Certificate Holder is listed as Additional Insured. ( Subject to all policy terms, exclusions and conditions )",
  "Verification of Insurance": MASTER_DESC,
};

const TEMPLATE_OPTIONS = [
  { value: "", label: "-- Select Template --" },
  { value: "AI", label: "Additional Insured (AI)" },
  { value: "Verification of Insurance", label: "Verification of Insurance" },
];

const INSURANCE_TYPES = [
  "General Liability",
  "Automobile Liability",
  "Garage Liability",
  "Garage Keepers Liability",
  "Umbrella/Excess Liability",
];

interface CertificateHolder {
  id: string; // local-only before save
  dbId?: number;
  name: string;
  contact: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  fax: string;
  fax_ext: string;
  issue_date: string;
  written_notice_days: number;
  desc_of_ops: string;
  same_as_master: boolean;
  selectedTemplate: string;
  note: string;
  print_note: boolean;
  job_type: string;
  job_num: string;
  project_end_date: string;
  licensed: boolean;
  bonded: boolean;
  write_to_list: boolean;
  distribution_method: string;
  name_selection: string;
  additional_insured: Record<string, string>;
  waiver_subrogation: Record<string, string>;
}

const DEFAULT_HOLDER: Omit<CertificateHolder, "id"> = {
  name: "",
  contact: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  email: "",
  fax: "",
  fax_ext: "",
  issue_date: "",
  written_notice_days: 10,
  desc_of_ops: MASTER_DESC,
  same_as_master: true,
  selectedTemplate: "",
  note: "",
  print_note: true,
  job_type: "",
  job_num: "",
  project_end_date: "",
  licensed: false,
  bonded: false,
  write_to_list: false,
  distribution_method: "",
  name_selection: "Certificate Holder Master List",
  additional_insured: Object.fromEntries(
    [...INSURANCE_TYPES, "Work Comp", "Other"].map((t) => [t, "N"])
  ),
  waiver_subrogation: Object.fromEntries(
    [...INSURANCE_TYPES, "Work Comp", "Other"].map((t) => [t, "N"])
  ),
};

export default function AddEditHolderPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const customerId = params?.id as string;
  const certificateId = searchParams.get("certId") || "";   // formatted display number e.g. "202605"
  const certDbIdParam = searchParams.get("certDbId") || "";
  // certDbId is always the raw numeric DB id; fall back to extracting it from the old "cert-file-master-N" format
  const certDbId =
    certDbIdParam ||
    (certificateId.includes("cert-file-master-")
      ? certificateId.replace("cert-file-master-", "")
      : "");


  const [holders, setHolders] = useState<CertificateHolder[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newHolder, setNewHolder] = useState<Omit<CertificateHolder, "id">>({ ...DEFAULT_HOLDER });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Load existing holders from API ──────────────────────────────────────────
  useEffect(() => {
    if (!customerId || !certDbId) { setLoading(false); return; }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setHolders(
          data.map((h) => ({
            id: String(h.id),
            dbId: h.id,
            name: h.name || "",
            contact: h.contact || "",
            address: h.address || "",
            address2: h.address2 || "",
            city: h.city || "",
            state: h.state || "",
            zip: h.zip || "",
            email: h.email || "",
            fax: h.fax || "",
            fax_ext: h.fax_ext || "",
            issue_date: h.issue_date || "",
            written_notice_days: h.written_notice_days ?? 10,
            desc_of_ops: h.desc_of_ops || MASTER_DESC,
            same_as_master: h.same_as_master ?? true,
            selectedTemplate: "",
            note: h.note || "",
            print_note: h.print_note ?? true,
            job_type: h.job_type || "",
            job_num: h.job_num || "",
            project_end_date: h.project_end_date || "",
            licensed: h.licensed ?? false,
            bonded: h.bonded ?? false,
            write_to_list: h.write_to_list ?? false,
            distribution_method: h.distribution_method || "",
            name_selection: h.name_selection || "Certificate Holder Master List",
            additional_insured: h.additional_insured || DEFAULT_HOLDER.additional_insured,
            waiver_subrogation: h.waiver_subrogation || DEFAULT_HOLDER.waiver_subrogation,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId, certDbId]);

  // ── Description of Operations logic ─────────────────────────────────────────
  const handleSameMasterToggle = (checked: boolean) => {
    setNewHolder((h) => ({
      ...h,
      same_as_master: checked,
      desc_of_ops: checked ? MASTER_DESC : h.desc_of_ops,
      selectedTemplate: checked ? "" : h.selectedTemplate,
    }));
  };

  const handleTemplateChange = (tplValue: string) => {
    setNewHolder((h) => ({
      ...h,
      selectedTemplate: tplValue,
      desc_of_ops: tplValue ? DESC_TEMPLATES[tplValue] : h.desc_of_ops,
    }));
  };

  // ── Save holder to backend ───────────────────────────────────────────────────
  const handleSaveHolder = async () => {
    if (!newHolder.name) { setSaveError("Holder name is required."); return; }
    setSaving(true);
    setSaveError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const payload = {
      name: newHolder.name,
      contact: newHolder.contact,
      address: newHolder.address,
      address2: newHolder.address2,
      city: newHolder.city,
      state: newHolder.state,
      zip: newHolder.zip,
      email: newHolder.email,
      fax: newHolder.fax,
      fax_ext: newHolder.fax_ext,
      issue_date: newHolder.issue_date,
      written_notice_days: newHolder.written_notice_days,
      desc_of_ops: newHolder.desc_of_ops,
      same_as_master: newHolder.same_as_master,
      note: newHolder.note,
      print_note: newHolder.print_note,
      job_type: newHolder.job_type,
      job_num: newHolder.job_num,
      project_end_date: newHolder.project_end_date,
      licensed: newHolder.licensed,
      bonded: newHolder.bonded,
      write_to_list: newHolder.write_to_list,
      distribution_method: newHolder.distribution_method,
      name_selection: newHolder.name_selection,
      additional_insured: newHolder.additional_insured,
      waiver_subrogation: newHolder.waiver_subrogation,
    };

    try {
      if (!customerId || !certDbId) {
        // No DB linkage yet — just add locally so the user can see the row
        setHolders((prev) => [
          ...prev,
          { ...newHolder, id: Date.now().toString() },
        ]);
        setIsAddingNew(false);
        setNewHolder({ ...DEFAULT_HOLDER });
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Save failed");
      }
      const saved = await res.json();
      setHolders((prev) => [
        ...prev,
        {
          ...newHolder,
          id: String(saved.id),
          dbId: saved.id,
        },
      ]);
      setIsAddingNew(false);
      setNewHolder({ ...DEFAULT_HOLDER });
    } catch (e: any) {
      setSaveError(e.message || "Error saving holder");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHolder = async (holder: CertificateHolder) => {
    if (!holder.dbId) {
      setHolders((p) => p.filter((h) => h.id !== holder.id));
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      await fetch(
        `${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders/${holder.dbId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      setHolders((p) => p.filter((h) => h.id !== holder.id));
    } catch (e) { console.error(e); }
  };

  const handleClose = () => window.close();

  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-sans text-text-main select-none">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-border-main shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/40 rounded-xl text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Add / Edit Certificate Holders</h2>
            <p className="text-[11px] text-text-muted">
              Certificate: <span className="font-mono font-semibold">{certificateId || "—"}</span>
              &nbsp;·&nbsp;Manage holders, operations, and subrogation waivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          {isAddingNew ? (
            <>
              <button
                onClick={handleSaveHolder}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-semibold shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
                {saving ? "Saving…" : "Save Holder"}
              </button>
              <button
                onClick={() => { setIsAddingNew(false); setSaveError(""); setNewHolder({ ...DEFAULT_HOLDER }); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border-main hover:bg-secondary/20 text-text-main rounded-lg font-semibold shadow-sm transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setIsAddingNew(true); setSaveError(""); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-semibold shadow-sm transition-all duration-150 cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                New Holder
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border-main text-text-main rounded-lg font-semibold shadow-sm opacity-40 cursor-not-allowed">
                Edit
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border-main text-red-600 rounded-lg font-semibold shadow-sm opacity-40 cursor-not-allowed">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
          <div className="w-px h-6 bg-border-main mx-1" />
          <button onClick={handleClose} className="p-2 hover:bg-secondary/40 text-text-muted hover:text-text-main rounded-xl transition-all duration-150 cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">

        {/* Error banner */}
        {saveError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold shrink-0">
            <AlertCircle size={14} /> {saveError}
          </div>
        )}

        {/* Certificate Reference Card */}
        <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Certificate #</span>
            <input
              type="text"
              value={certificateId}
              readOnly
              className="border border-border-main rounded-lg px-3 py-1.5 text-xs bg-bg-base font-mono text-text-main w-56 focus:outline-none"
            />
          </div>
          <a href="#" className="text-xs font-semibold text-primary hover:underline transition-colors">
            Copy multiple holders
          </a>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-border-main overflow-hidden shadow-sm max-h-[280px] overflow-y-auto shrink-0">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-text-muted gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading holders…
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-bg-base border-b border-border-main sticky top-0 z-10">
                <tr>
                  {["Name", "Addr", "City", "State", "Zip", "Issue Date", "Job Type", "Job #", "Project End Date", "Desc of Ops", ""].map((h) => (
                    <th key={h} className="p-3 font-semibold text-text-main text-[11px] uppercase tracking-wider border-r border-border-main/20 last:border-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-text-muted italic">
                      No holders yet. Click <strong>"New Holder"</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  holders.map((holder) => (
                    <tr key={holder.id} className="border-b border-border-main/10 hover:bg-secondary/10 transition-colors last:border-0">
                      <td className="p-3 border-r border-border-main/10 font-medium truncate max-w-[120px]">{holder.name}</td>
                      <td className="p-3 border-r border-border-main/10 truncate max-w-[100px]">{holder.address}</td>
                      <td className="p-3 border-r border-border-main/10">{holder.city}</td>
                      <td className="p-3 border-r border-border-main/10">{holder.state}</td>
                      <td className="p-3 border-r border-border-main/10">{holder.zip}</td>
                      <td className="p-3 border-r border-border-main/10 whitespace-nowrap">{holder.issue_date}</td>
                      <td className="p-3 border-r border-border-main/10">{holder.job_type}</td>
                      <td className="p-3 border-r border-border-main/10">{holder.job_num}</td>
                      <td className="p-3 border-r border-border-main/10 whitespace-nowrap">{holder.project_end_date}</td>
                      <td className="p-3 border-r border-border-main/10 truncate max-w-[180px] text-text-muted">{holder.desc_of_ops}</td>
                      <td className="p-3">
                        <button onClick={() => handleDeleteHolder(holder)} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isAddingNew && (
          <div className="flex justify-center gap-4 py-4 shrink-0">
            <button className="px-6 py-2.5 bg-bg-base border border-border-main rounded-xl text-text-muted text-xs font-bold shadow-sm opacity-50 cursor-not-allowed">
              Create / Refresh Forms
            </button>
            <button onClick={handleClose} className="px-6 py-2.5 bg-white border border-border-main hover:bg-secondary/20 rounded-xl text-text-main text-xs font-bold shadow-sm transition-all duration-150 cursor-pointer">
              Cancel
            </button>
          </div>
        )}

        {/* ── Add New Holder Form ───────────────────────────────────────────────── */}
        {isAddingNew && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 mb-6">

            {/* COLUMN 1 */}
            <div className="flex flex-col gap-6">

              {/* Name Selection */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Name Selection</h3>
                <div className="flex flex-col gap-2 text-xs">
                  {["Additional Named Insureds", "Certificate Holder Master List", "Customer Certificate Holder List", "Policy Additional Interests", "Setup Additional Interests"].map((label) => (
                    <label key={label} className="flex items-center gap-2.5 text-text-main cursor-pointer select-none py-0.5">
                      <input
                        type="radio"
                        name="nameSelection"
                        value={label}
                        checked={newHolder.name_selection === label}
                        onChange={(e) => setNewHolder((h) => ({ ...h, name_selection: e.target.value }))}
                        className="accent-primary w-4 h-4"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-text-muted shrink-0 w-20">Name Filter:</span>
                  <div className="flex-1 border border-border-main rounded-lg flex items-center bg-white shadow-sm focus-within:border-primary transition-colors overflow-hidden">
                    <input type="text" placeholder="Filter names..." className="w-full px-2.5 py-1.5 text-xs outline-none text-text-main" />
                    <Search size={14} className="text-text-muted mr-2.5 shrink-0" />
                  </div>
                  <button className="p-2 hover:bg-secondary/40 border border-border-main rounded-lg text-text-muted hover:text-text-main transition-all shrink-0 cursor-pointer">
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {/* Holder Contact Details */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Holder Details</h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  <Row label="Name *">
                    <input type="text" className={INPUT} value={newHolder.name} onChange={(e) => setNewHolder((h) => ({ ...h, name: e.target.value }))} required />
                  </Row>
                  <Row label="Contact">
                    <input type="text" className={INPUT} value={newHolder.contact} onChange={(e) => setNewHolder((h) => ({ ...h, contact: e.target.value }))} />
                  </Row>
                  <Row label="Address">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <input type="text" placeholder="Line 1" className={INPUT} value={newHolder.address} onChange={(e) => setNewHolder((h) => ({ ...h, address: e.target.value }))} />
                      <input type="text" placeholder="Line 2" className={INPUT} value={newHolder.address2} onChange={(e) => setNewHolder((h) => ({ ...h, address2: e.target.value }))} />
                    </div>
                  </Row>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-semibold text-text-muted shrink-0">City</span>
                    <input type="text" className={INPUT + " flex-1"} value={newHolder.city} onChange={(e) => setNewHolder((h) => ({ ...h, city: e.target.value }))} />
                    <span className="font-semibold text-text-muted ml-1">St</span>
                    <select
                      className="border border-border-main p-1.5 rounded-lg focus:outline-none focus:border-primary text-text-main bg-white text-xs shadow-sm w-20"
                      value={newHolder.state}
                      onChange={(e) => setNewHolder((h) => ({ ...h, state: e.target.value }))}
                    >
                      <option value=""></option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-semibold text-text-muted shrink-0">Zip</span>
                    <input type="text" className={INPUT + " w-24"} value={newHolder.zip} onChange={(e) => setNewHolder((h) => ({ ...h, zip: e.target.value }))} />
                    <span className="font-semibold text-text-muted ml-2">Email</span>
                    <input type="text" className={INPUT + " flex-1"} value={newHolder.email} onChange={(e) => setNewHolder((h) => ({ ...h, email: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-semibold text-text-muted shrink-0">Fax</span>
                    <input type="text" className={INPUT + " w-24"} value={newHolder.fax} onChange={(e) => setNewHolder((h) => ({ ...h, fax: e.target.value }))} />
                    <span className="font-semibold text-text-muted ml-2">Ext</span>
                    <input type="text" className={INPUT + " w-16"} value={newHolder.fax_ext} onChange={(e) => setNewHolder((h) => ({ ...h, fax_ext: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Insured & Subrogation */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Insured &amp; Subrogation</h3>
                <label className="flex items-center gap-2 text-xs text-text-main font-semibold cursor-pointer select-none">
                  <input type="checkbox" className="accent-primary w-4 h-4" checked={newHolder.write_to_list} onChange={(e) => setNewHolder((h) => ({ ...h, write_to_list: e.target.checked }))} />
                  Write to Cust Cert Holder List
                </label>
                <div className="flex items-center justify-between gap-2 text-xs border-b border-border-main/30 pb-3">
                  <span className="font-semibold text-text-muted">Method of Distribution:</span>
                  <select className="border border-border-main rounded-lg p-1.5 bg-white text-xs text-text-main focus:outline-none focus:border-primary w-32 shadow-sm" value={newHolder.distribution_method} onChange={(e) => setNewHolder((h) => ({ ...h, distribution_method: e.target.value }))}>
                    <option value=""></option>
                    <option value="email">Email</option>
                    <option value="fax">Fax</option>
                    <option value="print">Print</option>
                  </select>
                </div>
                <table className="w-full text-[10px] text-center border-collapse">
                  <thead>
                    <tr className="border-b border-border-main/30">
                      <th className="text-left font-semibold text-text-muted pb-1.5 uppercase tracking-wider">Type</th>
                      <th className="font-semibold text-text-muted pb-1.5 uppercase tracking-wider">Add'l Ins?</th>
                      <th className="font-semibold text-text-muted pb-1.5 uppercase tracking-wider">Waiver Sub?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/10">
                    {INSURANCE_TYPES.map((type) => (
                      <tr key={type} className="hover:bg-secondary/10">
                        <td className="text-left text-text-main font-medium py-1.5">{type}:</td>
                        <td className="py-1.5">
                          <YNRadio name={`${type}-AI`} value={newHolder.additional_insured[type]} onChange={(v) => setNewHolder((h) => ({ ...h, additional_insured: { ...h.additional_insured, [type]: v } }))} />
                        </td>
                        <td className="py-1.5">
                          <YNRadio name={`${type}-WS`} value={newHolder.waiver_subrogation[type]} onChange={(v) => setNewHolder((h) => ({ ...h, waiver_subrogation: { ...h.waiver_subrogation, [type]: v } }))} />
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-secondary/10">
                      <td className="text-left text-text-main font-medium py-1.5">Work Comp:</td>
                      <td className="py-1.5 text-text-muted text-[9px] font-mono">N/A</td>
                      <td className="py-1.5">
                        <YNRadio name="WC-WS" value={newHolder.waiver_subrogation["Work Comp"]} onChange={(v) => setNewHolder((h) => ({ ...h, waiver_subrogation: { ...h.waiver_subrogation, "Work Comp": v } }))} />
                      </td>
                    </tr>
                    <tr className="hover:bg-secondary/10">
                      <td className="text-left text-text-main font-medium py-1.5">Other:</td>
                      <td className="py-1.5">
                        <YNRadio name="Other-AI" value={newHolder.additional_insured["Other"]} onChange={(v) => setNewHolder((h) => ({ ...h, additional_insured: { ...h.additional_insured, Other: v } }))} />
                      </td>
                      <td className="py-1.5">
                        <YNRadio name="Other-WS" value={newHolder.waiver_subrogation["Other"]} onChange={(v) => setNewHolder((h) => ({ ...h, waiver_subrogation: { ...h.waiver_subrogation, Other: v } }))} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="flex flex-col gap-6">

              {/* Dates */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Dates &amp; Written Notice</h3>
                <div className="flex flex-col gap-3 text-xs">
                  <Row label="Date Issued *">
                    <input type="date" className={INPUT + " flex-1"} value={newHolder.issue_date} onChange={(e) => setNewHolder((h) => ({ ...h, issue_date: e.target.value }))} />
                  </Row>
                  <div className="border-t border-border-main/30 pt-2 flex flex-col gap-2">
                    <span className="font-semibold text-text-main">Written Notice of Cancellation</span>
                    <Row label="# of Days:">
                      <input type="number" className={INPUT + " w-24"} value={newHolder.written_notice_days} onChange={(e) => setNewHolder((h) => ({ ...h, written_notice_days: Number(e.target.value) }))} />
                    </Row>
                  </div>
                </div>
              </div>

              {/* Description of Operations — Smart Logic */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex-1 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Description of Operations</h3>

                <div className="flex-1 flex flex-col gap-3 text-xs">
                  {/* "Same as Master" toggle */}
                  <div className="flex items-center justify-between gap-2 border-b border-border-main/20 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-text-main font-semibold">
                      <input
                        type="checkbox"
                        className="accent-primary w-4 h-4"
                        checked={newHolder.same_as_master}
                        onChange={(e) => handleSameMasterToggle(e.target.checked)}
                      />
                      Same as Master Description
                    </label>
                    <button
                      className="bg-white border border-border-main hover:bg-secondary/20 text-text-main text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-sm cursor-pointer"
                      onClick={() => setNewHolder((h) => ({ ...h, desc_of_ops: MASTER_DESC }))}
                    >
                      Insert Master
                    </button>
                  </div>

                  {/* Template selector — only visible when "same_as_master" is OFF */}
                  {!newHolder.same_as_master && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-muted shrink-0 w-16">Template:</span>
                      <select
                        className="flex-1 border border-border-main rounded-lg p-1.5 bg-white text-xs text-text-main focus:outline-none focus:border-primary shadow-sm"
                        value={newHolder.selectedTemplate}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                      >
                        {TEMPLATE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <button
                        className="bg-white border border-border-main hover:bg-secondary/20 text-text-main text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-sm cursor-pointer"
                        onClick={() => handleTemplateChange(newHolder.selectedTemplate)}
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Textarea — frozen when same_as_master is checked */}
                  <textarea
                    className={`w-full flex-1 min-h-[150px] border p-2.5 rounded-lg text-text-main bg-white text-xs font-sans leading-relaxed resize-y shadow-sm transition-colors ${
                      newHolder.same_as_master
                        ? "border-border-main/40 bg-bg-base text-text-muted cursor-not-allowed focus:outline-none"
                        : "border-border-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    }`}
                    value={newHolder.desc_of_ops}
                    readOnly={newHolder.same_as_master}
                    onChange={(e) => !newHolder.same_as_master && setNewHolder((h) => ({ ...h, desc_of_ops: e.target.value }))}
                  />

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">Text Setup</span>
                  </div>
                </div>
              </div>

              {/* Note / Message */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Note / Message</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-text-main">
                    <input type="checkbox" className="accent-primary w-4 h-4" checked={newHolder.print_note} onChange={(e) => setNewHolder((h) => ({ ...h, print_note: e.target.checked }))} />
                    Print note with form
                  </label>
                  <textarea
                    placeholder="Enter internal notes or messages..."
                    className={INPUT_AREA}
                    value={newHolder.note}
                    onChange={(e) => setNewHolder((h) => ({ ...h, note: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 3 */}
            <div className="flex flex-col gap-6">

              {/* Summary panel */}
              <div className="bg-secondary/10 border border-border-main rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden flex-1 min-h-[160px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl translate-x-4 -translate-y-4" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Certificate Summary</h4>
                <div className="flex flex-col gap-2.5 text-xs">
                  <SummaryRow label="Certificate #" value={certificateId || "—"} mono />
                  <SummaryRow label="Total Holders" value={String(holders.length)} bold />
                  <SummaryRow label="Desc. Mode" value={newHolder.same_as_master ? "Master" : (newHolder.selectedTemplate || "Custom")} />
                  <SummaryRow label="Status" value="Active" badge />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center text-center p-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary mb-2 shadow-sm">
                    <Shield size={18} />
                  </div>
                  <h5 className="font-bold text-text-main text-[11px] mb-1">Standard ACORD Verification</h5>
                  <p className="text-[10px] text-text-muted max-w-[180px]">
                    All certificate holder listings conform to standard ACORD distribution guidelines.
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl border border-border-main p-5 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-2 uppercase tracking-wider">Additional Information</h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  <Row label="Job Type:" right>
                    <input type="text" className={INPUT + " flex-1"} value={newHolder.job_type} onChange={(e) => setNewHolder((h) => ({ ...h, job_type: e.target.value }))} />
                  </Row>
                  <Row label="Job #:" right>
                    <input type="text" className={INPUT + " flex-1"} value={newHolder.job_num} onChange={(e) => setNewHolder((h) => ({ ...h, job_num: e.target.value }))} />
                  </Row>
                  <Row label="Project End Date:" right>
                    <input type="date" className={INPUT + " w-36"} value={newHolder.project_end_date} onChange={(e) => setNewHolder((h) => ({ ...h, project_end_date: e.target.value }))} />
                  </Row>
                  <div className="flex items-center justify-center gap-6 mt-2 border-t border-border-main/20 pt-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-text-main">
                      <input type="checkbox" className="accent-primary w-4 h-4" checked={newHolder.licensed} onChange={(e) => setNewHolder((h) => ({ ...h, licensed: e.target.checked }))} />
                      Licensed
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-text-main">
                      <input type="checkbox" className="accent-primary w-4 h-4" checked={newHolder.bonded} onChange={(e) => setNewHolder((h) => ({ ...h, bonded: e.target.checked }))} />
                      Bonded
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Tailwind helpers ───────────────────────────────────────────────────
const INPUT =
  "border border-border-main p-1.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-text-main bg-white text-xs transition-colors shadow-sm";
const INPUT_AREA =
  "w-full min-h-[70px] border border-border-main p-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-text-main bg-white text-xs transition-colors shadow-sm";

function Row({ label, children, right = false }: { label: string; children: React.ReactNode; right?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`shrink-0 font-semibold text-text-muted ${right ? "w-28 text-right" : "w-20"}`}>{label}</span>
      {children}
    </div>
  );
}

function YNRadio({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex gap-2">
      <label className="flex items-center gap-0.5 cursor-pointer">
        <input type="radio" name={name} className="w-3 h-3 accent-primary" checked={value === "Y"} onChange={() => onChange("Y")} /> Y
      </label>
      <label className="flex items-center gap-0.5 cursor-pointer">
        <input type="radio" name={name} className="w-3 h-3 accent-primary" checked={value === "N"} onChange={() => onChange("N")} /> N
      </label>
    </div>
  );
}

function SummaryRow({ label, value, mono = false, bold = false, badge = false }: { label: string; value: string; mono?: boolean; bold?: boolean; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border-main/15 pb-1.5">
      <span className="text-text-muted">{label}</span>
      {badge ? (
        <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full font-bold text-[10px]">{value}</span>
      ) : (
        <span className={`${mono ? "font-mono" : ""} ${bold ? "text-primary font-bold" : "font-semibold text-text-main"}`}>{value}</span>
      )}
    </div>
  );
}
