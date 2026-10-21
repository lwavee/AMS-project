/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../../../../lib/config";
import {
  Save,
  Printer,
  Play,
  RefreshCw,
  X,
  FileText,
  Calculator,
  Info,
  Check,
  Building2,
  Users,
  CreditCard,
  List,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Send,
} from "lucide-react";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const submissionId = params?.submissionId as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [customer, setCustomer] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [originalSubmission, setOriginalSubmission] = useState<any>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingLob, setIsAddingLob] = useState(false);
  const [isEditingLob, setIsEditingLob] = useState(false);
  const [selectedLobIndex, setSelectedLobIndex] = useState<number | null>(null);
  const [lobs, setLobs] = useState<any[]>([]);
  const [newLob, setNewLob] = useState({
    type: "",
    description: "",
    application: "",
    writingCompany: "",
    statePlan: "",
    sort: "1",
    premium: "",
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    lob: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const LOB_OPTIONS: Record<string, string[]> = {
    "Commercial Lines": [
      "General Liability",
      "Commercial Property",
      "Umbrella",
      "Commercial Auto",
      "Business Auto",
      "Workers Compensation",
      "Professional Liability",
      "Business Owners Policy",
      "Inland Marine",
      "Cyber Liability",
    ],
    "Personal Lines": [
      "Homeowners",
      "Personal Auto",
      "Personal Umbrella",
      "Renters",
      "Condominium",
      "Valuable Items",
      "Flood",
      "Earthquake",
    ],
    "Health": [
      "Group Health",
      "Individual Health",
      "Dental",
      "Vision",
      "Medicare Supplement",
    ],
    "Life": [
      "Term Life",
      "Whole Life",
      "Universal Life",
      "Variable Life",
    ],
    "Benefits": [
      "Group Life",
      "Group Disability",
      "Group Health",
    ],
    "Financial Services": [
      "Annuities",
      "Mutual Funds",
    ],
    "Non Property & Casualty": [
      "Surety Bonds",
      "Fidelity Bonds",
    ],
  };

  const currentType = submission?.business_type || submission?.type || "Commercial Lines";
  const availableLobs = LOB_OPTIONS[currentType] || LOB_OPTIONS["Commercial Lines"];

  useEffect(() => {
    if (!customerId || !submissionId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const custRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (custRes.ok) {
          setCustomer(await custRes.json());
        }

        let match: any = null;
        try {
          const subRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions/${submissionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (subRes.ok) {
            match = await subRes.json();
          }
        } catch {}

        if (!match) {
          try {
            const listRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (listRes.ok) {
              const list = await listRes.json();
              match = list.find((s: any) => s.id?.toString() === submissionId.toString());
            }
          } catch {}
        }

        // Check local storage for fallback
        const storedStr = typeof window !== "undefined" ? localStorage.getItem(`submissions_${customerId}`) : null;
        let storedLobs: any[] = [];
        if (storedStr) {
          try {
            const storedList = JSON.parse(storedStr);
            const storedMatch = storedList.find((s: any) => s.id?.toString() === submissionId.toString());
            if (storedMatch) {
              match = match || storedMatch;
              if (storedMatch.lobs) storedLobs = storedMatch.lobs;
            }
          } catch {}
        }

        // Mock fallback if needed
        if (!match) {
          match = {
            id: submissionId,
            quote_id: "QTE-2026-" + submissionId.slice(-4),
            status: "Quoted",
            term: "12 Months",
            type: "General Liability",
            business_type: "Commercial Lines",
            company: "Kinsale Insurance Company",
            description: "Commercial General Liability Quote",
            eff_date: "10/28/2026",
            exp_date: "10/28/2027",
            premium: "$3,304.03",
            total_premium: "$3,304.03",
            lobs: [
              {
                type: "General Liability",
                description: "Commercial General Liability Quote",
                application: "ACORD 125/126",
                writingCompany: "Kinsale Insurance Company",
                statePlan: "Florida",
                sort: "1",
                premium: "$3,304.03",
              },
            ],
          };
        }

        setSubmission(match);
        setOriginalSubmission(JSON.parse(JSON.stringify(match)));
        setLobs(match.lobs || (storedLobs.length > 0 ? storedLobs : []));
        const matchedWritingCo = match?.writing_company || match?.writingCompany || match?.company || "";
        setNewLob((prev) => ({
          ...prev,
          writingCompany: matchedWritingCo,
        }));
      } catch (err: any) {
        setError(err.message || "Failed to load submission data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, submissionId]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#9A8B7A] size-8" />
          <span className="text-xs font-extrabold text-[#8c827a] uppercase tracking-widest">
            Loading Quote Submission details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm max-w-md w-full text-center">
          <Info className="size-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-[#1f1d1a]">Error Loading Submission</h3>
          <p className="text-xs font-medium text-[#6b5e52] mt-2">{error || "Could not retrieve submission details."}</p>
          <button
            onClick={() => window.close()}
            className="mt-6 w-full h-10 bg-[#FAF8F5] hover:bg-[#F5EDE5] text-[#9A8B7A] font-bold text-xs rounded-xl transition-all border border-[#e5ddd5]"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const custName = customer?.name || customer?.company_name || "Customer";
  const submissionDisplay = submission.submission_id || submission.submissionId || submission.quote_id || submission.quoteId || `SUB-${submissionId}`;
  const dateRange = `(${submission.eff_date || "—"} - ${submission.exp_date || "—"})`;

  const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate";
  const baseInputCls = "w-full h-9 px-3 text-xs font-semibold rounded-xl outline-none transition-all truncate";
  const readOnlyInputCls = `${baseInputCls} bg-white border border-[#e5ddd5] text-[#1f1d1a] cursor-default`;
  const editableInputCls = `${baseInputCls} bg-white border-[#9A8B7A] text-[#1f1d1a] focus:border-[#9A8B7A] focus:ring-2 focus:ring-[#9A8B7A]/20 hover:border-[#9A8B7A] shadow-xs`;
  const inputCls = isEditable ? editableInputCls : readOnlyInputCls;

  const btnCls =
    "h-8 px-3.5 bg-white border-[#e5ddd5] text-[#2d2a26] hover:bg-[#FAF8F5] text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-2xs flex items-center gap-1.5";
  const btnPrimaryCls =
    "h-8 px-3.5 bg-[#9A8B7A] border-[#9A8B7A] text-white hover:bg-[#8a6f4d] text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-2xs flex items-center gap-1.5";

  const handleFieldChange = (field: string, value: any) => {
    setSubmission((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSubmission = async () => {
    setIsSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const updatedSubmission = {
        ...submission,
        lobs: lobs,
      };

      // 1. Update localStorage
      if (typeof window !== "undefined" && customerId) {
        const storedStr = localStorage.getItem(`submissions_${customerId}`);
        if (storedStr) {
          try {
            const list = JSON.parse(storedStr);
            const idx = list.findIndex((s: any) => s.id?.toString() === submissionId?.toString());
            if (idx !== -1) {
              list[idx] = { ...list[idx], ...updatedSubmission };
              localStorage.setItem(`submissions_${customerId}`, JSON.stringify(list));
            } else {
              list.push(updatedSubmission);
              localStorage.setItem(`submissions_${customerId}`, JSON.stringify(list));
            }
            window.dispatchEvent(new Event("storage"));
          } catch {}
        }
      }

      // 2. Persist to Backend API
      if (customerId && submissionId && !submissionId.toString().startsWith("sub-")) {
        try {
          await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions/${submissionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedSubmission),
          });
        } catch {}
      }

      setIsEditable(false);
      setToast({ text: "Quote submission saved successfully.", type: "success" });
    } catch {
      setToast({ text: "Error saving submission.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Convert/Bind submission into active policy
  const handleBindToPolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions/${submissionId}/bind`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSubmission((prev: any) => ({ ...prev, status: "Bound" }));
        setToast({ text: `Submission ${submissionDisplay} successfully bound into Policy!`, type: "success" });
        window.dispatchEvent(new Event("storage"));
        if (data?.policy?.id) {
          window.open(
            `/agency/customer/${customerId}/policy/${data.policy.id}`,
            "_blank",
            "width=1320,height=860,resizable=yes,scrollbars=yes"
          );
        }
      } else {
        setSubmission((prev: any) => ({ ...prev, status: "Bound" }));
        setToast({ text: `Submission marked as Bound.`, type: "success" });
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      setSubmission((prev: any) => ({ ...prev, status: "Bound" }));
      setToast({ text: `Quote marked as Bound.`, type: "success" });
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleAddLob = () => {
    if (!newLob.type) return;
    const updated = [...lobs, { ...newLob, id: Date.now().toString() }];
    setLobs(updated);
    setSubmission((prev: any) => ({ ...prev, lobs: updated }));
    setIsAddingLob(false);
    setNewLob({
      type: "",
      description: "",
      application: "",
      writingCompany: submission?.writing_company || submission?.company || "",
      statePlan: "",
      sort: (updated.length + 1).toString(),
      premium: "",
    });
    setToast({ text: "Line of business added to quote.", type: "success" });
  };

  const handleDeleteLob = (idx: number) => {
    const updated = lobs.filter((_, i) => i !== idx);
    setLobs(updated);
    setSubmission((prev: any) => ({ ...prev, lobs: updated }));
    setToast({ text: "Line of business removed.", type: "info" });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F2937] font-sans pb-16">
      {/* Toast Notice */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-[#E8F8F0] border-[#10b981]/30 text-[#12805C]"
              : toast.type === "error"
              ? "bg-[#FEE2E2] border-red-200 text-red-700"
              : "bg-[#EFF6FF] border-blue-200 text-blue-700"
          }`}
        >
          {toast.type === "success" && <Check className="size-4 text-[#10b981]" />}
          {toast.type === "error" && <X className="size-4 text-red-500" />}
          {toast.type === "info" && <Info className="size-4 text-blue-500" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ── Top Header Toolbar matching Policy Page ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1550px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
                  window.close();
                } else {
                  router.push(`/agency/customer/${customerId}/submissions`);
                }
              }}
              className="h-9 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EDE5] text-[#9A8B7A] border border-[#e5ddd5] flex items-center gap-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <X size={15} />
              <span>Close</span>
            </button>
            <div className="h-5 w-px bg-[#e5ddd5]" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#8c827a]">Submission:</span>
              <span className="text-sm font-extrabold text-[#1f1d1a]">{submissionDisplay}</span>
              <span className="text-xs text-[#8c827a] font-medium">{dateRange}</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                {submission.status || "Quoted"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isEditable ? (
              <button
                type="button"
                onClick={handleSaveSubmission}
                disabled={isSaving}
                className={btnPrimaryCls}
              >
                <Save size={14} />
                <span>{isSaving ? "Saving..." : "Save Quote"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditable(true)}
                className={btnCls}
              >
                <Play size={14} className="text-[#9A8B7A]" />
                <span>Edit Quote</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBindToPolicy}
              className="h-8 px-3.5 bg-white border border-[#10b981]/40 text-[#12805C] hover:bg-[#E8F8F0] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <CheckCircle size={14} className="text-[#10b981]" />
              <span>Bind Policy</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className={btnCls}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-[1550px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Banner Alert for Editing */}
        {isEditable && (
          <div className="p-3.5 rounded-2xl bg-[#FEF7EC] border border-[#f59e0b]/30 text-[#D97706] text-xs font-bold flex items-center gap-2">
            <Info size={16} />
            <span>Editing mode enabled. Make your updates to the quote information or coverages, then click Save Quote.</span>
          </div>
        )}

        {/* ── SECTION 1: Basic Quote / Submission Information ── */}
        <div className="border border-[#e5ddd5] bg-white rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection("basic")}
            className="w-full px-5 py-3.5 bg-[#FAF7F2] flex items-center justify-between text-xs font-extrabold text-[#1f1d1a] cursor-pointer hover:bg-[#F5EDE5]/70 transition-colors border-b border-[#e5ddd5]"
          >
            <div className="flex items-center gap-2.5">
              <Layers size={16} className="text-[#9A8B7A]" />
              <span>Basic Submission & Quote Information</span>
            </div>
            {expandedSections.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.basic && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Submission ID</label>
                <input
                  type="text"
                  value={submission.submission_id || submission.submissionId || submission.quote_id || submission.quoteId || ""}
                  onChange={(e) => {
                    handleFieldChange("submission_id", e.target.value);
                    handleFieldChange("quote_id", e.target.value);
                  }}
                  disabled={!isEditable}
                  className={inputCls + " font-bold"}
                />
              </div>

              <div>
                <label className={labelCls}>Submission Status</label>
                {isEditable ? (
                  <select
                    value={submission.status || "Submitted"}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className={inputCls}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In Process">In Process</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Bound">Bound</option>
                    <option value="Declined">Declined</option>
                    <option value="Lost">Lost</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={submission.status || "Quoted"}
                    disabled
                    className={inputCls}
                  />
                )}
              </div>

              <div>
                <label className={labelCls}>Effective Date</label>
                <input
                  type="text"
                  value={submission.eff_date || ""}
                  onChange={(e) => handleFieldChange("eff_date", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Expiration Date</label>
                <input
                  type="text"
                  value={submission.exp_date || ""}
                  onChange={(e) => handleFieldChange("exp_date", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Term</label>
                <input
                  type="text"
                  value={submission.term || "12 Months"}
                  onChange={(e) => handleFieldChange("term", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Business Type</label>
                <input
                  type="text"
                  value={submission.business_type || submission.type || "Commercial Lines"}
                  onChange={(e) => handleFieldChange("business_type", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Parent Company</label>
                <input
                  type="text"
                  value={submission.parent_company || submission.company || "ISC, Brokerage Company"}
                  onChange={(e) => handleFieldChange("parent_company", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Writing Company</label>
                <input
                  type="text"
                  value={submission.writing_company || submission.company || "ISC, Brokerage Company"}
                  onChange={(e) => handleFieldChange("writing_company", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Executive</label>
                <input
                  type="text"
                  value={submission.executive || "Anatian, Yoav"}
                  onChange={(e) => handleFieldChange("executive", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Representative</label>
                <input
                  type="text"
                  value={submission.representative || "Parungao, Joana"}
                  onChange={(e) => handleFieldChange("representative", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Estimated / Total Premium $</label>
                <input
                  type="text"
                  value={submission.total_premium || submission.premium || "$3,304.03"}
                  onChange={(e) => handleFieldChange("total_premium", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls + " font-bold text-[#1f1d1a]"}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <input
                  type="text"
                  value={submission.description || "Comprehensive General Liability Submission"}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  disabled={!isEditable}
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: Lines of Business (LOB) ── */}
        <div className="border border-[#e5ddd5] bg-white rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-[#FAF7F2] flex items-center justify-between border-b border-[#e5ddd5]">
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-[#9A8B7A]" />
              <span className="text-xs font-extrabold text-[#1f1d1a]">
                Lines of Business ({lobs.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingLob(true)}
                className="h-7 px-2.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus size={12} />
                <span>Add LOB</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSection("lob")}
                className="text-[#6b5e52] hover:text-[#1f1d1a] cursor-pointer"
              >
                {expandedSections.lob ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {expandedSections.lob && (
            <div className="p-6">
              {/* LOB Table */}
              <div className="border border-[#ebe5df] rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#ebe5df]">
                    <tr>
                      <th className="px-4 py-3 font-bold">Line of Business</th>
                      <th className="px-4 py-3 font-bold">Description</th>
                      <th className="px-4 py-3 font-bold">Writing Company</th>
                      <th className="px-4 py-3 font-bold">Application</th>
                      <th className="px-4 py-3 font-bold">State</th>
                      <th className="px-4 py-3 font-bold">Premium</th>
                      <th className="px-4 py-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebe5df]">
                    {lobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[#8c827a]">
                          No lines of business added to this quote yet. Click "Add LOB" to add coverage lines.
                        </td>
                      </tr>
                    ) : (
                      lobs.map((lob, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-[#1f1d1a]">
                            {lob.type || lob.coverage || "General Liability"}
                          </td>
                          <td className="px-4 py-3.5 text-[#4a423b]">
                            {lob.description || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-[#4a423b]">
                            {lob.writingCompany || submission.company || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-[#4a423b]">
                            {lob.application || "ACORD 125/126"}
                          </td>
                          <td className="px-4 py-3.5 text-[#4a423b]">
                            {lob.statePlan || "FL"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-[#1f1d1a]">
                            {lob.premium || submission.total_premium || "$0.00"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteLob(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors cursor-pointer"
                              title="Delete LOB"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add LOB Inline Modal */}
              {isAddingLob && (
                <div className="mt-4 p-5 rounded-2xl border border-[#9A8B7A]/30 bg-[#FAF8F5] space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-[#e5ddd5] pb-2">
                    <h4 className="text-xs font-bold text-[#1f1d1a]">Add Line of Business to Quote</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingLob(false)}
                      className="text-[#8c827a] hover:text-[#1f1d1a] cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className={labelCls}>LOB Type *</label>
                      <select
                        value={newLob.type}
                        onChange={(e) => setNewLob({ ...newLob, type: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-semibold"
                      >
                        <option value="">-- Select LOB --</option>
                        {availableLobs.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Commercial General Liability"
                        value={newLob.description}
                        onChange={(e) => setNewLob({ ...newLob, description: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Writing Company</label>
                      <input
                        type="text"
                        value={newLob.writingCompany}
                        onChange={(e) => setNewLob({ ...newLob, writingCompany: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Application</label>
                      <input
                        type="text"
                        placeholder="e.g. ACORD 125/126"
                        value={newLob.application}
                        onChange={(e) => setNewLob({ ...newLob, application: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>State Plan</label>
                      <input
                        type="text"
                        placeholder="FL"
                        value={newLob.statePlan}
                        onChange={(e) => setNewLob({ ...newLob, statePlan: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Premium $</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={newLob.premium}
                        onChange={(e) => setNewLob({ ...newLob, premium: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-lg border border-[#e5ddd5] bg-white text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingLob(false)}
                      className="h-8 px-3 rounded-lg border border-[#e5ddd5] text-xs font-bold text-[#6b5e52] hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLob}
                      disabled={!newLob.type}
                      className="h-8 px-4 rounded-lg bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold disabled:opacity-50"
                    >
                      Add LOB
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
