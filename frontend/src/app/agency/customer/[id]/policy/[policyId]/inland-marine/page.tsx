/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
  Save,
  Printer,
  X,
  FileText,
  Shield,
  ShieldCheck,
  Check,
  Plus,
  Anchor
} from "lucide-react";

export default function InlandMarinePage() {
  const params = useParams();
  const customerId = params?.id as string;
  const policyId = params?.policyId as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Default Inland Marine Coverages as requested:
  // Scheduled Equipment, Unscheduled Tools & Equipment, Leased / Rented Equipment, Newly Acquired Equipment, Total Insured Value
  const defaultInlandMarineCoverages = [
    { coverage: "Scheduled Equipment", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "1", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Unscheduled Tools & Equipment", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "2", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Leased / Rented Equipment", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "3", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Newly Acquired Equipment", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "4", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Total Insured Value", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "5", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
  ];

  const [coverages, setCoverages] = useState(defaultInlandMarineCoverages);

  const emptyCoverage = { coverage: "", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false };
  const [activeItem, setActiveItem] = useState(emptyCoverage);

  // -- ADDITIONAL COVERAGES STATE --
  const initialAdditionalCoverages = [
    { id: "add-cov-1", coverage: "", limit1: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "" }
  ];
  const [additionalCoverages, setAdditionalCoverages] = useState(initialAdditionalCoverages);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(0);

  const [info, setInfo] = useState({
    liabilityCoverageType: "Inland Marine",
    coverageBasis: "Occurrence",
    otherCoverages: ""
  });

  useEffect(() => {
    if (customerId && policyId) {
      if (typeof window !== "undefined") {
        try {
          const storedCoverages = localStorage.getItem(`im_coverages_${customerId}_${policyId}`);
          if (storedCoverages) {
            const parsed = JSON.parse(storedCoverages);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCoverages(parsed);
            }
          }
          const storedInfo = localStorage.getItem(`im_info_${customerId}_${policyId}`);
          if (storedInfo) {
            setInfo(JSON.parse(storedInfo));
          }

          const storedAdd = localStorage.getItem(`im_additional_coverages_${customerId}_${policyId}`) || 
                            localStorage.getItem(`gl_additional_coverages_${customerId}_${policyId}`);
          if (storedAdd) {
            const parsed = JSON.parse(storedAdd);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const hasOldMockData = parsed.some((p: any) => 
                p.coverage === "Employee Benefits Liability" || 
                p.coverage === "Contractual Liability"
              );
              if (!hasOldMockData) {
                setAdditionalCoverages(parsed);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load inland marine data from local storage", e);
        }
      }
    }
  }, [customerId, policyId]);

  const handleActiveChange = (field: string, val: string) => {
    setActiveItem({ ...activeItem, [field]: val });
  };

  const handleFormatField = (field: keyof typeof activeItem, val: string) => {
    let clean = val.replace(/,/g, '').replace(/\$/g, '');
    if (!clean || isNaN(Number(clean))) return;
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parseFloat(clean));
    handleActiveChange(field as string, formatted);
  };

  const handleNew = () => {
    const nextSort = String(coverages.length + 1);
    setActiveItem({ ...emptyCoverage, sortOrder: nextSort });
    setMode("add");
  };

  const handleEdit = () => {
    if (selectedIdx !== null && coverages[selectedIdx]) {
      setActiveItem({ ...coverages[selectedIdx] });
      setMode("edit");
    }
  };

  const handleDelete = () => {
    if (selectedIdx !== null) {
      const newCoverages = coverages.filter((_, i) => i !== selectedIdx);
      setCoverages(newCoverages);
      setSelectedIdx(null);
      if (typeof window !== "undefined") {
        localStorage.setItem(`im_coverages_${customerId}_${policyId}`, JSON.stringify(newCoverages));
      }
    }
  };

  // -- ADDITIONAL COVERAGES HANDLERS --
  const handleUpdateAdditionalCoverage = (idx: number, field: string, val: string) => {
    const updated = [...additionalCoverages];
    updated[idx] = { ...updated[idx], [field]: val };
    setAdditionalCoverages(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`im_additional_coverages_${customerId}_${policyId}`, JSON.stringify(updated));
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: `add-cov-${Date.now()}`,
      coverage: "",
      limit1: "",
      ded: "",
      dedType: "",
      basis: "",
      appliesTo: "",
      premium: "",
      sortOrder: ""
    };
    const updated = [...additionalCoverages, newRow];
    setAdditionalCoverages(updated);
    setSelectedRowIdx(updated.length - 1);
    if (typeof window !== "undefined") {
      localStorage.setItem(`im_additional_coverages_${customerId}_${policyId}`, JSON.stringify(updated));
    }
  };

  const handleDeleteRow = (idx: number) => {
    let updated = additionalCoverages.filter((_, i) => i !== idx);
    if (updated.length === 0) {
      updated = [{
        id: `add-cov-${Date.now()}`,
        coverage: "",
        limit1: "",
        ded: "",
        dedType: "",
        basis: "",
        appliesTo: "",
        premium: "",
        sortOrder: ""
      }];
    }
    setAdditionalCoverages(updated);
    setSelectedRowIdx(Math.max(0, Math.min(idx, updated.length - 1)));
    if (typeof window !== "undefined") {
      localStorage.setItem(`im_additional_coverages_${customerId}_${policyId}`, JSON.stringify(updated));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRowIdx !== null) {
      handleDeleteRow(selectedRowIdx);
    } else {
      handleDeleteRow(additionalCoverages.length - 1);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    let newCoverages = [...coverages];
    if (mode === "add") {
      newCoverages = [...coverages, activeItem];
      setSelectedIdx(newCoverages.length - 1);
    } else if (mode === "edit" && selectedIdx !== null) {
      newCoverages[selectedIdx] = activeItem;
    }
    
    setCoverages(newCoverages);
    setMode("view");

    if (typeof window !== "undefined") {
      localStorage.setItem(`im_coverages_${customerId}_${policyId}`, JSON.stringify(newCoverages));
      localStorage.setItem(`im_info_${customerId}_${policyId}`, JSON.stringify(info));
      localStorage.setItem(`im_additional_coverages_${customerId}_${policyId}`, JSON.stringify(additionalCoverages));
    }

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/general-liability`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newCoverages),
      });

      await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/general-liability/info`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(info),
      });
    } catch (err) {
      console.error("Failed to save coverages", err);
    } finally {
      setIsSaving(false);
    }
  };

  const COVERAGE_OPTIONS = [
    "Scheduled Equipment",
    "Unscheduled Tools & Equipment",
    "Leased / Rented Equipment",
    "Newly Acquired Equipment",
    "Total Insured Value",
    "Installation Floater",
    "Contractors Equipment",
    "Builders Risk",
    "Transit / Cargo",
    "Electronic Data Processing",
    "Miscellaneous Inland Marine"
  ];

  const DED_TYPE_OPTIONS = [
    "", "Coinsurance", "Disappearing", "Dollars", "Flat", "Hours",
    "Indemnity Only", "Medical Only", "Other", "Per Accident",
    "Per Claim", "Percent", "Whole Dollar"
  ];

  // Standard CSS classes for reuse
  const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate";
  const inputCls = "w-full h-9 px-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all truncate";
  const panelHeaderCls = "w-full px-5 py-3.5 bg-secondary/20 border-b border-border-main flex items-center gap-2 text-xs font-bold text-primary rounded-t-2xl";
  const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl";
  const btnCls = "h-8 px-3.5 bg-white border-border-main text-text-main hover:bg-secondary/60 hover:text-primary text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-sm flex items-center gap-1.5";
  const btnPrimaryCls = "h-8 px-3.5 bg-primary border-primary text-white shadow-primary/20 hover:bg-primary/95 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border shadow-sm flex items-center gap-1.5";

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">

      {/* ── 1. Modern Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Anchor className="text-white size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">Inland Marine</span>
            <span className="text-[9px] uppercase tracking-wider text-primary font-bold leading-none mt-0.5">Line of Business Details</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-text-main">Policy: {policyId}</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Customer: {customerId}</span>
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
      <div className="bg-white border-b border-border-main px-6 py-3 flex items-center gap-2.5 shrink-0 shadow-sm sticky top-16 z-40 overflow-x-auto">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={btnPrimaryCls}
        >
          <Save size={13} className="stroke-[2.5]" />
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </button>
        <button 
          onClick={() => window.print()}
          className={btnCls}
        >
          <Printer size={13} className="stroke-[2.5]" />
          <span>Print</span>
        </button>
      </div>

      {/* ── 3. Main Form Content ── */}
      <div className="p-6 max-w-[1400px] w-full mx-auto space-y-6">

        {/* Section 1: Inland Marine Details */}
        <div className={panelContainerCls + " p-6"}>
          <div className="max-w-4xl space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <span className={labelCls}>Inland Marine Coverage Type</span>
                <select 
                  className={inputCls} 
                  value={info.liabilityCoverageType}
                  onChange={e => setInfo({...info, liabilityCoverageType: e.target.value})}
                >
                  <option value="Inland Marine">Inland Marine</option>
                  <option value="Commercial Inland Marine">Commercial Inland Marine</option>
                  <option value="Contractors Equipment Floater">Contractors Equipment Floater</option>
                  <option value="Installation Floater">Installation Floater</option>
                  <option value="Builders Risk">Builders Risk</option>
                </select>
              </div>

              <div>
                <span className={labelCls}>Coverage Basis</span>
                <div className="flex items-center gap-6 h-9">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="radio" 
                      name="coverageBasis" 
                      className="accent-primary w-4 h-4" 
                      checked={info.coverageBasis === "Claims"}
                      onChange={() => setInfo({...info, coverageBasis: "Claims"})}
                    />
                    Claims
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="radio" 
                      name="coverageBasis" 
                      className="accent-primary w-4 h-4" 
                      checked={info.coverageBasis === "Occurrence"}
                      onChange={() => setInfo({...info, coverageBasis: "Occurrence"})}
                    />
                    Occurrence
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <span className={labelCls}>Other Coverages, Restrictions and/or Endorsements</span>
              <textarea
                className={inputCls.replace('h-9', 'min-h-[140px] py-3 resize-y leading-relaxed').replace('truncate', '')}
                placeholder="Enter details here..."
                value={info.otherCoverages}
                onChange={e => setInfo({...info, otherCoverages: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Panel 1: Coverages */}
        <div className={panelContainerCls + " overflow-hidden"}>
          <div className={panelHeaderCls + " justify-between"}>
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-primary" />
              <span>Coverages</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              {mode === "view" && (
                <>
                  <button onClick={handleNew} className="hover:text-primary transition-colors cursor-pointer">Add</button>
                  <button onClick={handleEdit} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-primary"}`}>Edit</button>
                  <button onClick={handleDelete} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-danger"}`}>Delete</button>
                </>
              )}
              {mode === "add" && (
                <>
                  <button onClick={handleSave} className="hover:text-primary transition-colors cursor-pointer">Add</button>
                  <button onClick={() => setMode("view")} className="hover:text-danger transition-colors cursor-pointer">Cancel</button>
                </>
              )}
              {mode === "edit" && (
                <>
                  <button onClick={handleSave} className="hover:text-primary transition-colors cursor-pointer">Update</button>
                  <button onClick={() => setMode("view")} className="hover:text-danger transition-colors cursor-pointer">Cancel</button>
                </>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-border-main text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="px-3 py-2 border-r border-border-main/50">COVERAGE</th>
                  <th className="px-3 py-2 border-r border-border-main/50">LIMIT 1</th>
                  <th className="px-3 py-2 border-r border-border-main/50">DEDUCTIBLE</th>
                  <th className="px-3 py-2 border-r border-border-main/50">DEDUCTIBLE TYPE</th>
                  <th className="px-3 py-2 border-r border-border-main/50">BASIS</th>
                  <th className="px-3 py-2 border-r border-border-main/50">APPLIES TO</th>
                  <th className="px-3 py-2 border-r border-border-main/50">PREMIUM</th>
                  <th className="px-3 py-2 text-center">SORT #</th>
                </tr>
              </thead>
              <tbody className="text-xs text-text-main font-semibold bg-white">
                {coverages.map((cov, i) => (
                  <tr 
                    key={i} 
                    onClick={() => { if (mode === 'view') setSelectedIdx(i); }}
                    onDoubleClick={() => {
                      if (mode === 'view') {
                        setSelectedIdx(i);
                        setActiveItem({ ...coverages[i] });
                        setMode("edit");
                      }
                    }}
                    className={`border-b border-border-main/50 cursor-pointer transition-all ${selectedIdx === i ? 'bg-primary/10 text-primary font-bold shadow-inner' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 border-r border-border-main/50 font-semibold">{cov.coverage}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.limit1 || "—"}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.ded || "—"}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.dedType || "—"}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.basis || "—"}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.appliesTo || "—"}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.premium || "—"}</td>
                    <td className="px-3 py-2 text-center">{cov.sortOrder || (i + 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(mode === "add" || mode === "edit") && (
            <div className="p-5 bg-slate-50 border-t border-border-main/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white border border-border-main shadow-sm rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " !mb-0"}>Sort Order #:</span>
                    <input type="text" value={activeItem.sortOrder} onChange={e => handleActiveChange("sortOrder", e.target.value)} className={inputCls + " !w-16 text-center"} />
                  </div>
                </div>

                <div className="flex items-end gap-6 flex-wrap">
                  <div className="flex-1 min-w-[220px] space-y-1">
                    <span className={labelCls + " text-red-500"}>Coverage:</span>
                    <select value={activeItem.coverage} onChange={e => handleActiveChange("coverage", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                      <option value=""></option>
                      {COVERAGE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Limit 1:</span>
                    <input type="text" value={activeItem.limit1} onChange={e => handleActiveChange("limit1", e.target.value)} onBlur={() => handleFormatField("limit1", activeItem.limit1)} className={inputCls} />
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Limit 2:</span>
                    <input type="text" value={activeItem.limit2} onChange={e => handleActiveChange("limit2", e.target.value)} onBlur={() => handleFormatField("limit2", activeItem.limit2)} className={inputCls} />
                  </div>
                </div>

                <div className="flex items-end gap-6 flex-wrap">
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Deductible:</span>
                    <input type="text" value={activeItem.ded} onChange={e => handleActiveChange("ded", e.target.value)} onBlur={() => handleFormatField("ded", activeItem.ded)} className={inputCls} />
                  </div>
                  <div className="w-48 space-y-1">
                    <span className={labelCls}>Deductible Type:</span>
                    <select value={activeItem.dedType} onChange={e => handleActiveChange("dedType", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                      {DED_TYPE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Basis:</span>
                    <select value={activeItem.basis} onChange={e => handleActiveChange("basis", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                      <option value=""></option>
                      <option value="Occurrence">Occurrence</option>
                      <option value="Claims Made">Claims Made</option>
                    </select>
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Applies To:</span>
                    <input type="text" value={activeItem.appliesTo} onChange={e => handleActiveChange("appliesTo", e.target.value)} className={inputCls} />
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Premium:</span>
                    <input type="text" value={activeItem.premium} onChange={e => handleActiveChange("premium", e.target.value)} onBlur={() => handleFormatField("premium", activeItem.premium)} className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setMode("view")} className={btnCls}>Cancel</button>
                  <button type="button" onClick={handleSave} className={btnPrimaryCls}>Save Coverage</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Additional Coverages */}
        <div className={panelContainerCls + " overflow-hidden"}>
          <div className={panelHeaderCls + " justify-between"}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" />
              <span>Additional Coverages</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <button 
                type="button"
                onClick={handleAddRow} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus size={11} className="stroke-[3]" /> Add
              </button>
              <button 
                type="button"
                onClick={handleDeleteSelected} 
                disabled={selectedRowIdx === null} 
                className={`transition-colors cursor-pointer flex items-center gap-1 ${selectedRowIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-danger"}`}
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-border-main text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="px-3 py-2.5 border-r border-border-main/50">COVERAGE</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-36">LIMIT 1</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-28">DEDUCTIBLE</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-36">DEDUCTIBLE TYPE</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-28">BASIS</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-32">APPLIES TO</th>
                  <th className="px-3 py-2.5 border-r border-border-main/50 w-32">PREMIUM</th>
                  <th className="px-3 py-2.5 text-center w-20">SORT #</th>
                  <th className="px-2 py-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="text-xs text-text-main font-semibold bg-white divide-y divide-border-main/40">
                {additionalCoverages.map((row, i) => (
                  <tr 
                    key={row.id || i}
                    onClick={() => setSelectedRowIdx(i)}
                    className={`transition-colors ${selectedRowIdx === i ? 'bg-primary/5' : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.coverage} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "coverage", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.limit1} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "limit1", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.ded} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "ded", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.dedType} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "dedType", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.basis} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "basis", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.appliesTo} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "appliesTo", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 border-r border-border-main/40">
                      <input 
                        type="text" 
                        value={row.premium} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "premium", e.target.value)} 
                        className="w-full h-8 px-2.5 text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <input 
                        type="text" 
                        value={row.sortOrder} 
                        onChange={e => handleUpdateAdditionalCoverage(i, "sortOrder", e.target.value)} 
                        className="w-12 mx-auto h-8 text-center text-xs font-semibold bg-white border border-border-main/60 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-main"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRow(i);
                        }} 
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
                        title="Delete line"
                      >
                        <X size={14} className="stroke-[2.5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-border-main/50 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddRow}
              className="h-8 px-3 bg-white border border-border-main text-primary hover:bg-secondary/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus size={13} className="stroke-[2.5]" /> Add Line
            </button>
            <span className="text-[10px] font-semibold text-slate-400">
              {additionalCoverages.length} {additionalCoverages.length === 1 ? 'line' : 'lines'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
