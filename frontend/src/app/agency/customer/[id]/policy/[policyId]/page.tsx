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
  ChevronUp
} from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const policyId = params?.policyId as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [customer, setCustomer] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [originalPolicy, setOriginalPolicy] = useState<any>(null);
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
    sort: "1"
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    lob: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
      "Cyber Liability"
    ],
    "Personal Lines": [
      "Homeowners",
      "Personal Auto",
      "Personal Umbrella",
      "Renters",
      "Condominium",
      "Valuable Items",
      "Flood",
      "Earthquake"
    ],
    "Health": [
      "Group Health",
      "Individual Health",
      "Dental",
      "Vision",
      "Medicare Supplement"
    ],
    "Life": [
      "Term Life",
      "Whole Life",
      "Universal Life",
      "Variable Life"
    ],
    "Benefits": [
      "Group Life",
      "Group Disability",
      "Group Health"
    ],
    "Financial Services": [
      "Annuities",
      "Mutual Funds"
    ],
    "Non Property & Casualty": [
      "Surety Bonds",
      "Fidelity Bonds"
    ]
  };

  const currentPolicyType = policy?.business_type || policy?.type || "Commercial Lines";
  const availableLobs = LOB_OPTIONS[currentPolicyType] || LOB_OPTIONS["Commercial Lines"];

  useEffect(() => {
    if (!customerId || !policyId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const custRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (custRes.ok) {
          setCustomer(await custRes.json());
        }

        const policiesRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        let match: any = null;
        if (policiesRes.ok) {
          const policiesList = await policiesRes.json();
          match = policiesList.find((p: any) => p.id.toString() === policyId.toString());
        }

        // Check local storage for policy and lobs
        const storedPoliciesStr = typeof window !== "undefined" ? localStorage.getItem(`policies_${customerId}`) : null;
        let storedLobs: any[] = [];
        if (storedPoliciesStr) {
          try {
            const storedPolicies = JSON.parse(storedPoliciesStr);
            const storedMatch = storedPolicies.find((p: any) => p.id.toString() === policyId.toString());
            if (storedMatch) {
              match = match || storedMatch;
              if (storedMatch.lobs) storedLobs = storedMatch.lobs;
            }
          } catch (e) { }
        }

        // Fallback default policy if policyId is "lob-default" or newly created
        if (!match) {
          match = {
            id: policyId,
            policy_num: "POL-GL-" + (customerId || "101"),
            status: "Active",
            term: "1 Year",
            type: "General Liability",
            business_type: "Commercial Lines",
            company: "Kinsale Insurance Company",
            description: "Commercial General Liability Policy",
            eff_date: "08/17/2026",
            exp_date: "08/17/2027",
            premium: "$3,304.03",
            cost: "$3,304.03",
            location: "—",
            lobs: [
              {
                type: "General Liability",
                description: "Commercial General Liability",
                application: "ACORD 125/126",
                writingCompany: "Kinsale Insurance Company",
                statePlan: "Texas",
                sort: "1",
                premium: "$3,304.03",
              },
            ],
          };
        }

        setPolicy(match);
        setOriginalPolicy(JSON.parse(JSON.stringify(match)));
        setLobs(match.lobs || (storedLobs.length > 0 ? storedLobs : []));
        const matchedWritingCo = match?.writing_company || match?.writingCompany || match?.company || "";
        setNewLob(prev => ({
          ...prev,
          writingCompany: matchedWritingCo
        }));
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, policyId]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-primary size-8" />
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Loading Policy details...</span>
        </div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans p-6">
        <div className="bg-white border border-danger/20 rounded-2xl p-6 shadow-sm max-w-md w-full text-center">
          <Info className="size-10 text-danger mx-auto mb-3" />
          <h3 className="font-bold text-lg text-text-main">Error Loading Policy</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">{error || "Could not retrieve policy details."}</p>
          <button
            onClick={() => window.close()}
            className="mt-6 w-full h-10 bg-secondary hover:bg-secondary/80 text-primary font-bold text-xs rounded-xl transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const custName = customer?.name || "Verta Construction and Roofing LLC";
  const dateRange = `(${policy.eff_date || "—"} - ${policy.exp_date || "—"})`;

  // Standard CSS classes for reuse
  const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate";
  const baseInputCls = "w-full h-9 px-3 text-xs font-semibold rounded-xl outline-none transition-all truncate";
  const readOnlyInputCls = `${baseInputCls} bg-white border border-border-main text-text-main cursor-default`;
  const editableInputCls = `${baseInputCls} bg-white border-primary/50 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary shadow-xs`;
  const inputCls = isEditable ? editableInputCls : readOnlyInputCls;

  // Collapsible headers
  const panelHeaderCls = "w-full px-5 py-3.5 bg-secondary/20 flex items-center justify-between text-xs font-bold text-primary cursor-pointer hover:bg-secondary/30 transition-colors";
  const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl overflow-hidden";

  const btnCls = "h-8 px-3.5 bg-white border-border-main text-text-main hover:bg-secondary/60 hover:text-primary text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-sm flex items-center gap-1.5";
  const btnPrimaryCls = "h-8 px-3.5 bg-primary border-primary text-white shadow-primary/20 hover:bg-primary/95 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-sm flex items-center gap-1.5";

  const POLICY_FLAGS = [
    { key: "is_continuous", label: "Continuous" },
    { key: "is_reinsurance", label: "Reinsurance" },
    { key: "is_not_renewable", label: "Not Renewable" },
    { key: "auditable", label: "Auditable" },
    { key: "premium_financed", label: "Premium Financed" },
    { key: "business_new_to_agency", label: "Business New to Agency" },
    { key: "exclude_from_download", label: "Exclude from Download" },
    { key: "exclude_from_purge", label: "Exclude from Purge" },
    { key: "filter_data_entry", label: "Filter Data Entry" }
  ];

  const handlePolicyChange = (field: string, value: any) => {
    setPolicy((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEndorse = () => {
    if (!isEditable) {
      if (!originalPolicy && policy) {
        setOriginalPolicy(JSON.parse(JSON.stringify(policy)));
      }
      setIsEditable(true);
      // Auto-set transaction to "Endorsement" if empty or new business
      setPolicy((prev: any) => ({
        ...prev,
        transaction: (prev?.transaction === "New business" || !prev?.transaction) ? "Endorsement" : prev.transaction
      }));
      setExpandedSections(prev => ({ ...prev, basic: true, lob: true }));
      setToast({ text: "Endorsement mode active. All policy values are now editable.", type: "info" });
    } else {
      setIsEditable(false);
      setToast({ text: "Endorsement mode deactivated.", type: "info" });
    }
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const updatedPolicy = {
        ...policy,
        lobs: lobs
      };

      // 1. Update localStorage cache so all views reflect instantly
      if (typeof window !== "undefined" && customerId) {
        const storedPoliciesStr = localStorage.getItem(`policies_${customerId}`);
        if (storedPoliciesStr) {
          try {
            const storedPolicies = JSON.parse(storedPoliciesStr);
            const pIndex = storedPolicies.findIndex((p: any) => p.id?.toString() === policyId?.toString());
            if (pIndex !== -1) {
              storedPolicies[pIndex] = { ...storedPolicies[pIndex], ...updatedPolicy };
              localStorage.setItem(`policies_${customerId}`, JSON.stringify(storedPolicies));
            } else {
              storedPolicies.push(updatedPolicy);
              localStorage.setItem(`policies_${customerId}`, JSON.stringify(storedPolicies));
            }
            window.dispatchEvent(new Event("storage"));
          } catch (e) {
            console.error("Local storage error:", e);
          }
        }
      }

      // 2. Persist to Backend API
      if (customerId && policyId && !policyId.toString().startsWith("lob-")) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedPolicy)
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn("Backend update response warning:", errData);
          }
        } catch (backendErr) {
          console.warn("Backend fetch failed, stored locally:", backendErr);
        }
      }

      // 3. Log activity
      logLobActivity(
        "Policy Endorsement",
        `Policy #${policy.policy_num || policyId} endorsed (${policy.transaction || "Endorsement"}) - ${policy.description || "Details updated"}`
      );

      // 4. Update original reference & exit edit mode
      setOriginalPolicy(JSON.parse(JSON.stringify(updatedPolicy)));
      setIsEditable(false);
      setToast({ text: "Policy endorsed and saved successfully!", type: "success" });
    } catch (err: any) {
      console.error("Save error:", err);
      setToast({ text: err.message || "Failed to save policy endorsement.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    await handleSavePolicy();
    setTimeout(() => {
      window.close();
    }, 600);
  };

  const handleCancel = () => {
    if (isEditable) {
      if (originalPolicy) {
        setPolicy(JSON.parse(JSON.stringify(originalPolicy)));
        if (originalPolicy.lobs) setLobs(JSON.parse(JSON.stringify(originalPolicy.lobs)));
      }
      setIsEditable(false);
      setToast({ text: "Endorsement changes discarded.", type: "info" });
    } else {
      window.close();
    }
  };

  const handleRenew = () => {
    setIsEditable(true);
    setPolicy((prev: any) => {
      let newEff = prev.exp_date || prev.eff_date;
      let newExp = "";
      if (newEff && /^\d{4}-\d{2}-\d{2}$/.test(newEff)) {
        const d = new Date(newEff);
        d.setFullYear(d.getFullYear() + 1);
        newExp = d.toISOString().split("T")[0];
      }
      return {
        ...prev,
        transaction: "Renewal",
        eff_date: newEff || prev.eff_date,
        exp_date: newExp || prev.exp_date
      };
    });
    setExpandedSections(prev => ({ ...prev, basic: true, lob: true }));
    setToast({ text: "Renewal mode active. Review updated dates and click Save.", type: "info" });
  };

  const handleCancelPolicy = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this policy?");
    if (!confirmed) return;

    const updated = {
      ...policy,
      status: "Cancelled",
      carrier_status: "Cancelled",
      transaction: "Cancellation"
    };
    setPolicy(updated);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (customerId && policyId && !policyId.toString().startsWith("lob-")) {
        await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updated)
        });
      }
      logLobActivity("Policy Cancelled", `Policy #${policy.policy_num || policyId} was cancelled.`);
      setToast({ text: "Policy cancelled successfully.", type: "info" });
    } catch (e) {
      console.error("Cancellation error:", e);
    }
  };

  const saveLobsToBackendAndLocal = async (updatedLobs: any[]) => {
    try {
      const token = localStorage.getItem("token");
      if (policy && policy.id) {
        // Update local state and local storage cache so it reflects immediately
        const storedPoliciesStr = localStorage.getItem(`policies_${customerId}`);
        if (storedPoliciesStr) {
          const storedPolicies = JSON.parse(storedPoliciesStr);
          const pIndex = storedPolicies.findIndex((p: any) => p.id.toString() === policyId);
          if (pIndex !== -1) {
            storedPolicies[pIndex].lobs = updatedLobs;
            localStorage.setItem(`policies_${customerId}`, JSON.stringify(storedPolicies));
            window.dispatchEvent(new Event("storage"));
          }
        }

        // Try to save to backend
        await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ...policy, lobs: updatedLobs })
        });
      }
    } catch (err) {
      console.error("Failed to save LOBs to backend", err);
    }
  };

  const logLobActivity = (action: string, description: string) => {
    try {
      const userEmail = localStorage.getItem("email") || "YOU";
      const userName = userEmail.split('@')[0].toUpperCase();
      const newActivity = {
        id: `act-lob-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }),
        action: action,
        description: description,
        by: userName,
        policyNum: policy?.policy_num || "N/A",
        effDate: policy?.eff_date || "N/A",
        trans: "Policy Change"
      };

      const key = `activities_log_${customerId}`;
      const stored = localStorage.getItem(key);
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      } else {
        list = [
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
      }
      list = [newActivity, ...list];
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to log LOB activity", e);
    }
  };

  const handleAddLob = () => {
    if (!newLob.type) return;
    const writingCo = policy?.writing_company || policy?.writingCompany || policy?.company || newLob.writingCompany || "";
    const updatedLobs = [...lobs, { ...newLob, writingCompany: writingCo, plan: "—" }];
    setLobs(updatedLobs);
    setIsAddingLob(false);
    logLobActivity("LOB Added", `Added Line of Business: ${newLob.type}`);
    setNewLob({
      type: availableLobs[0],
      description: "",
      application: "",
      writingCompany: writingCo,
      statePlan: "",
      sort: (updatedLobs.length + 1).toString()
    });
    saveLobsToBackendAndLocal(updatedLobs);
  };

  const handleSaveEdit = () => {
    if (selectedLobIndex !== null) {
      const writingCo = policy?.writing_company || policy?.writingCompany || policy?.company || newLob.writingCompany || "";
      const oldLob = lobs[selectedLobIndex];
      const updated = [...lobs];
      updated[selectedLobIndex] = { ...newLob, writingCompany: writingCo, plan: oldLob.plan || "—" };
      setLobs(updated);
      setIsAddingLob(false);
      setIsEditingLob(false);
      logLobActivity("LOB Updated", `Updated Line of Business: ${newLob.type} (was ${oldLob.type})`);
      saveLobsToBackendAndLocal(updated);
    }
  };

  const handleDeleteLob = () => {
    if (selectedLobIndex !== null) {
      const oldLob = lobs[selectedLobIndex];
      const updated = lobs.filter((_, i) => i !== selectedLobIndex);
      setLobs(updated);
      setSelectedLobIndex(null);
      setIsAddingLob(false);
      logLobActivity("LOB Deleted", `Deleted Line of Business: ${oldLob.type}`);
      saveLobsToBackendAndLocal(updated);
    }
  };


  const renderBadge = (condition: boolean, text: string) => {
    return condition ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-primary/20">
        <Check size={10} className="stroke-[3]" /> {text}
      </span>
    ) : null;
  };

  const openLobForm = (lobType: string) => {
    const t = (lobType || "").toLowerCase().trim();
    let slug = "general-liability";
    if (t.includes("auto")) {
      slug = "business-auto";
    } else if (t.includes("umbrella")) {
      slug = "umbrella";
    } else if (t.includes("workers") || t.includes("comp")) {
      slug = "workers-compensation";
    } else if (t.includes("inland") || t.includes("marine")) {
      slug = "inland-marine";
    } else {
      slug = "general-liability";
    }
    window.open(`/agency/customer/${customerId}/policy/${policyId}/${slug}?lob=${encodeURIComponent(lobType)}`, '_blank', 'width=1100,height=850');
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">

      {/* ── 1. Modern Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-xl tracking-wider font-sans">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base tracking-tight text-text-main leading-tight font-sans">Sterling Insurance Services</span>
            <span className="text-[9px] uppercase tracking-wider text-primary font-bold leading-none mt-0.5">Policy Information</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-text-main">{custName}</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Policy: {policy.policy_num} | {dateRange}</span>
          </div>
          <button
            onClick={() => window.close()}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border-main bg-white hover:bg-secondary/60 transition-all text-slate-400 hover:text-danger cursor-pointer shadow-sm"
            title="Close Window"
          >
            <X size={16} className="stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* ── 2. Action Toolbar ── */}
      <div className="bg-white border-b border-border-main px-4 sm:px-6 py-3 flex items-center gap-2.5 shrink-0 shadow-sm sticky top-16 z-40 overflow-x-auto">
        <button
          onClick={handleSavePolicy}
          disabled={!isEditable || isSaving}
          className={`${
            isEditable
              ? btnPrimaryCls
              : "h-8 px-3.5 bg-slate-100 border-slate-200 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed border shadow-xs"
          }`}
          title={isEditable ? "Save endorsement changes" : "Click Endorse to edit and save"}
        >
          {isSaving ? (
            <RefreshCw size={13} className="animate-spin stroke-[2.5]" />
          ) : (
            <Save size={13} className="stroke-[2.5]" />
          )}
          {isSaving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={handleSaveAndClose}
          disabled={isSaving}
          className={btnCls}
          title="Save changes and close window"
        >
          <Check size={13} /> Save & Close
        </button>

        <button
          onClick={handleCancel}
          className={btnCls}
          title={isEditable ? "Discard endorsement changes" : "Close window"}
        >
          <X size={13} /> {isEditable ? "Cancel Edit" : "Cancel"}
        </button>

        <div className="h-5 w-px bg-border-main mx-1"></div>

        <button
          onClick={handleEndorse}
          className={`${btnCls} ${
            isEditable
              ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm shadow-amber-500/20 font-extrabold"
              : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          }`}
          title="Click to enable editing on all policy values"
        >
          ✦ {isEditable ? "Endorsing (Active)" : "Endorse"}
        </button>

        <button
          onClick={handleRenew}
          className={btnCls}
          title="Renew policy"
        >
          ↻ Renew
        </button>

        <button
          onClick={handleCancelPolicy}
          className="h-8 px-3.5 bg-white border-danger/40 text-danger hover:bg-danger/5 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-sm ml-auto shrink-0"
          title="Cancel Policy"
        >
          ✕ Cancel Policy
        </button>
      </div>

      {/* ── Endorsement Active Banner ── */}
      {isEditable && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-amber-900 text-xs font-semibold animate-in fade-in duration-200 sticky top-28 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-950">Endorsement Mode Active</span>
            <span className="hidden sm:inline text-amber-800 text-[11px] font-medium">— All policy values are now editable. Make your revisions and click <strong>Save</strong> or <strong>Save & Close</strong>.</span>
          </div>
          <button
            onClick={handleCancel}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer shrink-0"
          >
            Discard Changes
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-4 sm:mt-8 space-y-6 w-full">

        {/* ── 3. Upper Core Details Block ── */}
        <div className="bg-white border border-border-main rounded-2xl p-4 sm:p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 items-end">
          <div>
            <label className={labelCls}>Effective Date</label>
            <input
              type="text"
              value={isEditable ? (policy.eff_date ?? "") : (policy.eff_date || "—")}
              onChange={(e) => handlePolicyChange("eff_date", e.target.value)}
              readOnly={!isEditable}
              placeholder={isEditable ? "YYYY-MM-DD" : "—"}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Transaction</label>
            {isEditable ? (
              <select
                value={policy.transaction || "Endorsement"}
                onChange={(e) => handlePolicyChange("transaction", e.target.value)}
                className={inputCls}
              >
                <option value="Endorsement">Endorsement</option>
                <option value="Policy Change">Policy Change</option>
                <option value="New business">New business</option>
                <option value="Renewal">Renewal</option>
                <option value="Rewrite">Rewrite</option>
                <option value="Reinstatement">Reinstatement</option>
                <option value="Cancellation">Cancellation</option>
                <option value="Audit">Audit</option>
              </select>
            ) : (
              <input
                type="text"
                readOnly
                value={policy.transaction || "New business"}
                className={inputCls}
              />
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <input
              type="text"
              value={isEditable ? (policy.description ?? "") : (policy.description || "Policy Details View")}
              onChange={(e) => handlePolicyChange("description", e.target.value)}
              readOnly={!isEditable}
              placeholder={isEditable ? "Policy description..." : "—"}
              className={inputCls}
            />
          </div>
        </div>

        {/* ── 4. Main Data Panels (Fully Open & Aligned Together) ── */}
        <div className="space-y-6">

          {/* Panel 1: Basic Policy Information */}
          <div className={panelContainerCls}>
            <div className={`${panelHeaderCls} ${expandedSections['basic'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('basic')}>
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-primary" />
                <span>Basic Policy Information</span>
              </div>
              {expandedSections['basic'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>

            {expandedSections['basic'] && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
                  <div>
                    <span className={labelCls}>Policy Number</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.policy_num ?? "") : (policy.policy_num || "—")}
                      onChange={(e) => handlePolicyChange("policy_num", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Policy number..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Issue State</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.issue_state ?? "") : (policy.issue_state || "FL")}
                      onChange={(e) => handlePolicyChange("issue_state", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "State (e.g. CA, FL)" : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Type of Business</span>
                    {isEditable ? (
                      <select
                        value={policy.business_type || policy.type || "Commercial Lines"}
                        onChange={(e) => {
                          const val = e.target.value;
                          handlePolicyChange("business_type", val);
                          handlePolicyChange("type", val);
                        }}
                        className={inputCls}
                      >
                        {Object.keys(LOB_OPTIONS).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.business_type || policy.type || "Commercial Lines"}
                        className={inputCls}
                      />
                    )}
                  </div>
                  <div>
                    <span className={labelCls}>Status</span>
                    {isEditable ? (
                      <select
                        value={policy.status || "Active"}
                        onChange={(e) => handlePolicyChange("status", e.target.value)}
                        className={inputCls}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="In Force">In Force</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Expired">Expired</option>
                        <option value="Non-Renewed">Non-Renewed</option>
                      </select>
                    ) : (
                      <div className="h-9 flex items-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                          policy.status === "Cancelled"
                            ? "text-danger bg-danger/10 border-danger/20"
                            : policy.status === "Pending"
                            ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
                            : "text-success bg-success/10 border-success/20"
                        }`}>
                          {policy.status || "Active"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={labelCls}>Carrier Status</span>
                    {isEditable ? (
                      <select
                        value={policy.carrier_status || "Active"}
                        onChange={(e) => handlePolicyChange("carrier_status", e.target.value)}
                        className={inputCls}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.carrier_status || "Active"}
                        className={inputCls}
                      />
                    )}
                  </div>
                  <div>
                    <span className={labelCls}>Policy Type</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.type ?? "") : (policy.type || "Commercial Lines")}
                      onChange={(e) => handlePolicyChange("type", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Policy type..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Prior Policy</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.prior_policy ?? "") : (policy.prior_policy || "—")}
                      onChange={(e) => handlePolicyChange("prior_policy", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Prior policy #..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Renewal List</span>
                    {isEditable ? (
                      <select
                        value={policy.renewal_list || "At expiration"}
                        onChange={(e) => handlePolicyChange("renewal_list", e.target.value)}
                        className={inputCls}
                      >
                        <option value="At expiration">At expiration</option>
                        <option value="Do not renew">Do not renew</option>
                        <option value="Auto renew">Auto renew</option>
                        <option value="Renew with changes">Renew with changes</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.renewal_list || "At expiration"}
                        className={inputCls}
                      />
                    )}
                  </div>

                  <div>
                    <span className={labelCls}>Renewal/Term</span>
                    {isEditable ? (
                      <select
                        value={policy.term || "12 Months"}
                        onChange={(e) => handlePolicyChange("term", e.target.value)}
                        className={inputCls}
                      >
                        <option value="12 Months">12 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="Continuous">Continuous</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.term || "12 Months"}
                        className={inputCls}
                      />
                    )}
                  </div>
                  <div>
                    <span className={labelCls}>Notation</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.notation ?? "") : (policy.notation || "—")}
                      onChange={(e) => handlePolicyChange("notation", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Notation notes..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Description</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.description ?? "") : (policy.description || "CGL")}
                      onChange={(e) => handlePolicyChange("description", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Description..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Origin</span>
                    {isEditable ? (
                      <select
                        value={policy.origin || "Data entry"}
                        onChange={(e) => handlePolicyChange("origin", e.target.value)}
                        className={inputCls}
                      >
                        <option value="Data entry">Data entry</option>
                        <option value="Download">Download</option>
                        <option value="Bridge">Bridge</option>
                        <option value="Manual">Manual</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.origin || "Data entry"}
                        className={inputCls}
                      />
                    )}
                  </div>

                  <div>
                    <span className={labelCls}>Frequency</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.frequency ?? "") : (policy.frequency || "—")}
                      onChange={(e) => handlePolicyChange("frequency", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "e.g. Annual, Monthly" : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Signature on App</span>
                    {isEditable ? (
                      <select
                        value={policy.signature_on_app || "No"}
                        onChange={(e) => handlePolicyChange("signature_on_app", e.target.value)}
                        className={inputCls}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Waived">Waived</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={policy.signature_on_app || "—"}
                        className={inputCls}
                      />
                    )}
                  </div>
                  <div>
                    <span className={labelCls}>Location</span>
                    <input
                      type="text"
                      value={isEditable ? (policy.location ?? "") : (policy.location || "—")}
                      onChange={(e) => handlePolicyChange("location", e.target.value)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? "Location / Territory..." : "—"}
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-center gap-1.5 flex-wrap">
                    {isEditable ? (
                      POLICY_FLAGS.map((flag) => {
                        const active = Boolean(policy[flag.key]);
                        return (
                          <button
                            key={flag.key}
                            type="button"
                            onClick={() => handlePolicyChange(flag.key, !active)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                              active
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200"
                            }`}
                            title={`Click to toggle ${flag.label}`}
                          >
                            <Check size={11} className={active ? "stroke-[3] opacity-100" : "opacity-30 stroke-[2]"} />
                            {flag.label}
                          </button>
                        );
                      })
                    ) : (
                      POLICY_FLAGS.map((flag) => renderBadge(Boolean(policy[flag.key]), flag.label))
                    )}
                  </div>
                </div>

                <div className="border-t border-border-main mt-6 pt-5">
                  <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-widest mb-4">Company Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <span className={labelCls}>Company Type</span>
                      {isEditable ? (
                        <select
                          value={policy.company_type || "Insurance"}
                          onChange={(e) => handlePolicyChange("company_type", e.target.value)}
                          className={inputCls}
                        >
                          <option value="Insurance">Insurance</option>
                          <option value="Brokerage">Brokerage</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Managing General Agent">Managing General Agent</option>
                          <option value="Direct Writer">Direct Writer</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          readOnly
                          value={policy.company_type || "Insurance"}
                          className={inputCls}
                        />
                      )}
                    </div>
                    <div>
                      <span className={labelCls}>Parent Company</span>
                      <input
                        type="text"
                        value={isEditable ? (policy.parent_company || policy.company || "") : (policy.parent_company || policy.company || "ISC")}
                        onChange={(e) => {
                          handlePolicyChange("parent_company", e.target.value);
                          handlePolicyChange("company", e.target.value);
                        }}
                        readOnly={!isEditable}
                        placeholder={isEditable ? "Parent company name..." : "—"}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <span className={labelCls}>Writing Company</span>
                      <input
                        type="text"
                        value={isEditable ? (policy.writing_company ?? "") : (policy.writing_company || "Sutton Specialty")}
                        onChange={(e) => handlePolicyChange("writing_company", e.target.value)}
                        readOnly={!isEditable}
                        placeholder={isEditable ? "Writing company name..." : "—"}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <span className={labelCls}>Underwriter</span>
                      <input
                        type="text"
                        value={isEditable ? (policy.underwriter ?? "") : (policy.underwriter || "—")}
                        onChange={(e) => handlePolicyChange("underwriter", e.target.value)}
                        readOnly={!isEditable}
                        placeholder={isEditable ? "Underwriter name..." : "—"}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* {/* Panel 2: Personnel & Business Unit (COMMENTED OUT) */}
          {/*
          <div className={panelContainerCls}>
            <div className={`${panelHeaderCls} ${expandedSections['personnel'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('personnel')}>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-primary" />
                <span>Personnel & Business Unit</span>
              </div>
              {expandedSections['personnel'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expandedSections['personnel'] && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-widest mb-4 flex justify-between">
                    Primary Service Group <span className="text-[9px] hover:underline cursor-pointer text-slate-400">View Personnel</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Exec:</span>
                      <input type="text" readOnly value={policy.executive || "Anatian, Yoav"} className={inputCls + " bg-slate-50"} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Rep:</span>
                      <input type="text" readOnly value={policy.representative || "Parungao, Joana"} className={inputCls + " bg-slate-50"} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Broker:</span>
                      <input type="text" readOnly value={policy.broker || "—"} className={inputCls + " bg-slate-50"} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-widest mb-4">Business Unit</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Division:</span>
                      <input type="text" readOnly value={policy.division || "Gamaty Insurance Agency"} className={inputCls} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Branch:</span>
                      <input type="text" readOnly value={policy.branch || "Capital & Co"} className={inputCls} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={labelCls + " w-16 mb-0"}>Dept:</span>
                      <input type="text" readOnly value={policy.department || "Commercial"} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          */}

          {/* Panel 3: Additional Policy Information (COMMENTED OUT) */}
          {/*
          <div className={panelContainerCls}>
            <div className={`${panelHeaderCls} ${expandedSections['additional'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('additional')}>
              <div className="flex items-center gap-2">
                <Info size={15} className="text-primary" />
                <span>Additional Policy Information</span>
              </div>
              {expandedSections['additional'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expandedSections['additional'] && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " w-36 mb-0"}>First Written:</span>
                    <input type="text" readOnly value={policy.first_written || "—"} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " w-36 mb-0"}>Business Origin:</span>
                    <input type="text" readOnly value={policy.business_origin || "—"} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " w-36 mb-0"}>Agency Bus. Class:</span>
                    <input type="text" readOnly value={policy.agency_business_classification || "—"} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " w-36 mb-0"}>Mail Policy To:</span>
                    <input type="text" readOnly value={policy.mail_policy_to || "Agent"} className={inputCls} />
                  </div>
                  <div className="border border-border-main p-4 rounded-xl mt-4">
                    <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Additional Company Information</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Accounting #:</span>
                        <input type="text" readOnly value={policy.accounting_num || "—"} className={inputCls} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Customer #:</span>
                        <input type="text" readOnly value={policy.customer_num || "—"} className={inputCls} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Master Code:</span>
                        <input type="text" readOnly value={policy.master_code || "—"} className={inputCls} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Sub Code:</span>
                        <input type="text" readOnly value={policy.sub_code || "—"} className={inputCls} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    {renderBadge(policy.employees_paid_net, "Employees Paid Net")}
                  </div>
                  <div className="border border-border-main p-4 rounded-xl">
                    <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Broker of Record / Agency Period</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Effective Date:</span>
                        <input type="text" readOnly value={policy.broker_eff_date || "—"} className={inputCls} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " w-24 mb-0"}>Expiration Date:</span>
                        <input type="text" readOnly value={policy.broker_exp_date || "—"} className={inputCls} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " w-36 mb-0"}>Premium Adj:</span>
                    <input type="text" readOnly value={policy.premium_adjustment || "—"} className={inputCls} />
                  </div>
                  <div className="border border-border-main p-4 rounded-xl">
                    <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Agency Negotiated Commissions</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-text-main">
                          <input type="radio" defaultChecked className="accent-primary" /> None
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-text-main w-36">
                          <input type="radio" className="accent-primary" /> % of Premium/Fees
                        </label>
                        <input type="text" readOnly value={policy.commission_percent || "—"} className={inputCls + " w-20"} />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-text-main w-36">
                          <input type="radio" className="accent-primary" /> Flat Rate
                        </label>
                        <input type="text" readOnly value={policy.commission_flat || "—"} className={inputCls + " w-20"} />
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <span className={labelCls + " w-36 mb-0"}>Valid Through:</span>
                        <input type="text" readOnly value={policy.commission_valid_through || "—"} className={inputCls} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          */}

          {/* Panel 4: First Named Insured (COMMENTED OUT) */}
          {/*
          <div className={panelContainerCls}>
            <div className={`${panelHeaderCls} ${expandedSections['insured'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('insured')}>
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-primary" />
                <span>First Named Insured</span>
              </div>
              {expandedSections['insured'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expandedSections['insured'] && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <span className={labelCls}>Named Insured Name</span>
                  <span className="text-xs font-bold text-primary mt-1 block">{custName}</span>
                </div>
                <div>
                  <span className={labelCls}>Customer Type</span>
                  <span className="text-xs font-bold text-text-main mt-1 block">{customer?.type || "Commercial"}</span>
                </div>
                {customer?.address && (
                  <div className="col-span-3">
                    <span className={labelCls}>Billing Address</span>
                    <span className="text-xs font-bold text-text-main mt-1 block">
                      {customer.address}{customer.address2 ? `, ${customer.address2}` : ""}, {customer.city}, {customer.state} {customer.zip}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          */}

          {/* Panel 5: Policy Premium Totals (COMMENTED OUT) */}
          {/*
          <div className={panelContainerCls + " overflow-hidden"}>
            <div className={`${panelHeaderCls} ${expandedSections['premium'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('premium')}>
              <div className="flex items-center gap-2">
                <Calculator size={15} className="text-primary" />
                <span>Policy Premium Totals</span>
              </div>
              {expandedSections['premium'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expandedSections['premium'] && (
              <div className="p-6 bg-slate-50/50">
                <div className="bg-white border border-border-main rounded-xl p-6 shadow-sm max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-500 font-bold text-xs">Premium:</span>
                      <input type="text" readOnly value="$21,234.07" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-500 font-bold text-xs">Fees & Taxes:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-500 font-bold text-xs">Billed Premium:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-500 font-bold text-xs">Billed Fees/Taxes:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-border-main pt-3">
                      <span className="text-text-main font-extrabold text-xs">Unbilled Premium:</span>
                      <input type="text" readOnly value="$21,234.07" className={inputCls + " w-32 text-right text-primary font-bold bg-primary/5"} />
                    </div>
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-border-main pt-3">
                      <span className="text-text-main font-extrabold text-xs">Unbilled Fees:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right text-primary font-bold bg-primary/5"} />
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-1 col-span-2 md:col-span-1">
                      <span className="text-slate-500 font-bold text-xs">DB Entry Billed:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4 pt-1 col-span-2 md:col-span-1">
                      <span className="text-slate-500 font-bold text-xs">Cost of Insurance:</span>
                      <input type="text" readOnly value="$21,234.07" className={inputCls + " w-32 text-right"} />
                    </div>
                    <div className="flex justify-between items-center gap-4 pt-1 col-span-2 md:col-span-1">
                      <span className="text-slate-500 font-bold text-xs">Full Term Premium:</span>
                      <input type="text" readOnly value="$0.00" className={inputCls + " w-32 text-right"} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          */}

          {/* Panel 6: Billing / Payment (COMMENTED OUT) */}
          {/*
          <div className={panelContainerCls + " overflow-hidden"}>
            <div className={`${panelHeaderCls} ${expandedSections['billing'] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection('billing')}>
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-primary" />
                <span>Billing / Payment</span>
              </div>
              {expandedSections['billing'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expandedSections['billing'] && (
              <div className="p-6 bg-white flex flex-col md:flex-row gap-8 items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className={labelCls + " mb-0 text-danger"}>Bill Method:</span>
                    <select defaultValue="Agency bill" className={inputCls + " w-48 text-primary font-bold bg-primary/5"}>
                      <option value="Agency bill">Agency bill</option>
                      <option value="Direct bill">Direct bill</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={labelCls + " mb-0"}>Pay Plan:</span>
                    <input type="text" readOnly value={policy.pay_plan || "Full Pay"} className={inputCls + " w-48"} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={labelCls + " mb-0"}>Payment Method:</span>
                    <input type="text" readOnly value={policy.payment_method || "—"} className={inputCls + " w-48"} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 flex-1 h-full pt-1">
                  <span className={labelCls + " mb-0"}>Number of Payments:</span>
                  <input type="text" readOnly value={policy.number_of_payments || ""} className={inputCls + " w-20"} />
                </div>

                <div className="border border-border-main rounded-xl p-5 shadow-sm relative flex-1">
                  <span className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Base Installment Dates on</span>
                  <div className="space-y-4 mt-2">
                    <label className="flex items-center gap-3 text-xs font-bold text-danger cursor-pointer hover:text-primary transition-colors">
                      <input type="radio" name="installmentBase" defaultChecked className="accent-primary w-4 h-4" />
                      Policy Effective Date
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 text-xs font-bold text-danger cursor-pointer hover:text-primary transition-colors">
                        <input type="radio" name="installmentBase" className="accent-primary w-4 h-4" />
                        Day of Month:
                      </label>
                      <input type="text" className={inputCls + " w-16 text-center font-bold px-1"} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          */}

          {/* Grid Section 7: Line of Business */}
          <div className={panelContainerCls + " overflow-hidden"}>
            <div className={`${panelHeaderCls} ${expandedSections['lob'] ? 'border-b border-border-main' : ''}`} onClick={(e) => {
              if ((e.target as HTMLElement).closest('.lob-actions')) return;
              toggleSection('lob');
            }}>
              <div className="flex items-center gap-2">
                <List size={15} className="text-primary" />
                <span>Line of Business</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="lob-actions flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mr-2">
                  {isAddingLob ? (
                    <>
                      <button onClick={isEditingLob ? handleSaveEdit : handleAddLob} className="hover:text-primary transition-colors">
                        {isEditingLob ? "Save" : "Add"}
                      </button>
                      <button onClick={() => { setIsAddingLob(false); setIsEditingLob(false); }} className="hover:text-danger transition-colors">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setIsAddingLob(true);
                        setIsEditingLob(false);
                        setSelectedLobIndex(null);
                        const options = LOB_OPTIONS[policy.type || "Commercial Lines"] || [];
                        const writingCo = policy?.writing_company || policy?.writingCompany || policy?.company || "";
                        setNewLob({
                          type: options[0] || "",
                          description: "",
                          application: "",
                          writingCompany: writingCo,
                          statePlan: "",
                          sort: (lobs.length + 1).toString()
                        });
                      }} className="hover:text-primary transition-colors cursor-pointer text-slate-500">New</button>

                      <button
                        onClick={() => {
                          if (selectedLobIndex !== null) {
                            const cur = lobs[selectedLobIndex];
                            const writingCo = policy?.writing_company || policy?.writingCompany || policy?.company || cur.writingCompany || "";
                            setNewLob({
                              ...cur,
                              writingCompany: writingCo
                            });
                            setIsAddingLob(true);
                            setIsEditingLob(true);
                          }
                        }}
                        className={`transition-colors ${selectedLobIndex !== null ? "hover:text-primary cursor-pointer text-slate-500" : "text-slate-300 cursor-not-allowed"}`}
                      >
                        Edit
                      </button>

                      <button
                        onClick={handleDeleteLob}
                        className={`transition-colors ${selectedLobIndex !== null ? "hover:text-danger cursor-pointer text-slate-500" : "text-slate-300 cursor-not-allowed"}`}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                {expandedSections['lob'] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>

            {expandedSections['lob'] && (
              <>
                <div className="flex justify-end px-5 py-2 border-b border-border-main bg-slate-50/50">
                  <button className="text-[10px] font-bold text-primary hover:underline">Copy Line of Business</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border-main text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                        <th className="px-5 py-3">Line of Business</th>
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3">Application</th>
                        <th className="px-5 py-3">Writing Company</th>
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3">State Plan</th>
                        <th className="px-5 py-3">Sort #</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-text-main font-semibold">
                      {lobs.map((l, i) => (
                        <tr
                          key={i}
                          onClick={() => setSelectedLobIndex(i)}
                          onDoubleClick={() => openLobForm(l.type)}
                          className={`cursor-pointer transition-colors ${selectedLobIndex === i ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-slate-50/50"}`}
                        >
                          <td className="px-5 py-3.5 text-primary font-bold">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                openLobForm(l.type);
                              }}
                              className="hover:underline cursor-pointer font-bold text-primary"
                              title="Click to open LOB details page"
                            >
                              {l.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{l.description || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500">{l.application || "—"}</td>
                          <td className="px-5 py-3.5 text-text-main">{l.writingCompany || policy?.writing_company || policy?.writingCompany || policy?.company || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-400">{l.plan || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-400">{l.statePlan || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{l.sort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isAddingLob && (
                  <div className="bg-slate-50/80 p-6 border-t border-border-main animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
                      <div className="flex items-center justify-between gap-4">
                        <span className={labelCls + " mb-0 w-32 text-danger"}>Line of Business:</span>
                        <select value={newLob.type} onChange={e => setNewLob({ ...newLob, type: e.target.value })} className={inputCls + " flex-1"}>
                          {availableLobs.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={labelCls + " mb-0 w-32 text-danger"}>Writing Company:</span>
                        <input
                          type="text"
                          value={policy?.writing_company || policy?.writingCompany || policy?.company || newLob.writingCompany || "—"}
                          readOnly
                          disabled
                          className={inputCls + " flex-1 bg-slate-100/80 text-slate-700 cursor-not-allowed select-none font-semibold border-slate-200"}
                          title="Writing Company is fixed from the policy details"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Lower Panels (COMMENTED OUT) */}
          {/*
          <div className="space-y-6 pt-2">
            {[
              { id: "transactionPremiumsGrid", label: "Transaction Premiums Grid" },
              { id: "transactionFees", label: "Transaction Fees, Taxes, Finance & Down Payments" },
              { id: "lossHistory", label: "Loss History" },
              { id: "priorCarrier", label: "Prior Carrier" },
              { id: "otherInsurance", label: "Other Insurance with Company" },
              { id: "additionalCoverages", label: "Additional Policy Level Coverages" },
              { id: "forms", label: "Forms" },
              { id: "additionalInterests", label: "Additional Interests" },
              { id: "remarks", label: "Remarks" },
              { id: "rateDates", label: "Rate Dates" },
            ].map((panel) => (
              <div key={panel.id} className={panelContainerCls}>
                <div className={`${panelHeaderCls} ${expandedSections[panel.id] ? 'border-b border-border-main' : ''}`} onClick={() => toggleSection(panel.id)}>
                  <div className="flex items-center gap-2">
                    <List size={15} className="text-primary" />
                    <span>{panel.label}</span>
                  </div>
                  {expandedSections[panel.id] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
                {expandedSections[panel.id] && (
                  <div className="p-6 text-slate-400 font-medium text-xs text-center">
                    No active records found for {panel.label}.
                  </div>
                )}
              </div>
            ))}
          </div>
          */}

        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 transition-all animate-in slide-in-from-bottom-3 duration-300 ${
          toast.type === "success"
            ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20"
            : toast.type === "error"
            ? "bg-rose-600 text-white border-rose-700 shadow-rose-600/20"
            : "bg-slate-900 text-white border-slate-950 shadow-slate-900/30"
        }`}>
          {toast.type === "success" && <Check size={15} className="stroke-[3]" />}
          {toast.type === "error" && <X size={15} className="stroke-[3]" />}
          {toast.type === "info" && <Info size={15} className="stroke-[2.5]" />}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}