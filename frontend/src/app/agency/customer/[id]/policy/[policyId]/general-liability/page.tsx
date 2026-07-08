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
  MapPin,
  List,
  Check
} from "lucide-react";

export default function GeneralLiabilityPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const policyId = params?.policyId as string;

  

  const US_STATES = [
    "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [isSaving, setIsSaving] = useState(false);

  const [coverages, setCoverages] = useState([
    { coverage: "General Aggregate", limit1: "2,000,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "6,514.30", sortOrder: "1", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Products/Completed Ops Aggregate", limit1: "2,000,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "2", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Personal & Advertising Injury", limit1: "1,000,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "3", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Each Occurrence", limit1: "1,000,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "4", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Fire Damage", limit1: "50,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "5", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Medical Expense", limit1: "5,000", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "6", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
    { coverage: "Self Ins Retention", limit1: "2,500", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "7", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false },
  ]);

  const emptyCoverage = { coverage: "", limit1: "", limit2: "", ded: "", dedType: "", basis: "", appliesTo: "", premium: "", sortOrder: "", level: "Line of Business", state: "", location: "", appliesPer: "", otherDesc: "", exposure: "", rate: "", misc: "", numEmp: "", retroDate: "", comments: "", defaultStdCov: false };
  const [activeItem, setActiveItem] = useState(emptyCoverage);

  const [info, setInfo] = useState({
    liabilityCoverageType: "Commercial General Liability",
    coverageBasis: "Occurrence",
    otherCoverages: ""
  });

  useEffect(() => {
    if (customerId && policyId) {
      const token = localStorage.getItem("token");
      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/general-liability`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCoverages(data);
          }
        })
        .catch(err => console.error("Failed to load coverages", err));

      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/general-liability/info`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 204) return null;
          return res.json();
        })
        .then(data => {
          if (data) {
            setInfo({
              liabilityCoverageType: data.liabilityCoverageType || "Commercial General Liability",
              coverageBasis: data.coverageBasis || "Occurrence",
              otherCoverages: data.otherCoverages || ""
            });
          }
        })
        .catch(err => console.error("Failed to load info", err));
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

  const handleDelete = async () => {
    if (selectedIdx !== null) {
      const newCoverages = coverages.filter((_, i) => i !== selectedIdx);
      setCoverages(newCoverages);
      setSelectedIdx(null);
      
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
      } catch (err) {
        console.error("Failed to save coverages", err);
      }
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
    "2 Million Liab", "2+ Cov Forms Used by Us", "2009 FIGA Reg Assmt", "2orMoreCovFormUsedByUs",
    "A&E Extend", "AACS AFFILATION CR", "AAFPS AFFILIATION", "AbMol Cnsir ClssSpc",
    "Each Occurrence", "Fire Damage", "General Aggregate", "Medical Expense", 
    "Personal & Advertising Injury", "Products/Completed Ops Aggregate", "Self Ins Retention"
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

  const renderBadge = (condition: boolean, text: string) => {
    return condition ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-primary/20">
        <Check size={10} className="stroke-[3]" /> {text}
      </span>
    ) : null;
  };


  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">

      {/* ── 1. Modern Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Shield className="text-white size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">General Liability</span>
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
          className={`${btnPrimaryCls} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save size={13} className="stroke-[2.5]" /> {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={async () => {
            await handleSave();
            window.close();
          }}
          disabled={isSaving}
          className={btnCls}
        >
          <Check size={13} /> Save & Close
        </button>
        <button 
          onClick={() => window.close()}
          className={btnCls}
        >
          <X size={13} /> Cancel
        </button>
        <button 
          onClick={() => {
            window.open(`/agency/customer/${customerId}/eforms-manager/print-options`, "_blank", "width=850,height=600,menubar=no,toolbar=no,location=no,status=no");
          }}
          className={btnCls}
        >
          <Printer size={13} /> Print
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6 w-full">

        {/* Panel 0: General Coverage Information */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls + " justify-between"}>
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-primary" />
              <span>General Coverage Information</span>
            </div>
            <button className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 hover:text-danger transition-colors">Delete</button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <span className={labelCls}>Liability Coverage Type</span>
                <select 
                  className={inputCls} 
                  value={info.liabilityCoverageType}
                  onChange={e => setInfo({...info, liabilityCoverageType: e.target.value})}
                >
                  <option>Commercial General Liability</option>
                  <option>Contractual Liability</option>
                  <option>Liquor Liability</option>
                  <option>Manufacturers and Contractors</option>
                  <option>Owners & Contractors Protective</option>
                  <option>Owners, Landlord and Tenants</option>
                  <option>Pollution Liability</option>
                  <option>Prod/Completed Operations Liab</option>
                  <option>Railroad Protective Liability</option>
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
                  <th className="px-3 py-2 border-r border-border-main/50">Coverage</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Limit 1</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Deductible</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Deductible Type</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Basis</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Applies To</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Premium</th>
                  <th className="px-3 py-2 text-center">Sort #</th>
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
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.coverage}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.limit1}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.ded}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.dedType}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.basis}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.appliesTo}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.premium}</td>
                    <td className="px-3 py-2 text-center">{cov.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(mode === "add" || mode === "edit") && (
            <div className="p-5 bg-slate-50 border-t border-border-main/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white border border-border-main shadow-sm rounded-xl p-5 space-y-5">

                {/* Coverage Level */}
                <fieldset className="border border-border-main/60 rounded-xl px-5 pb-4 pt-1">
                  <legend className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Coverage Level</legend>
                  <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="covLevel" checked={activeItem.level === "Line of Business"} onChange={() => handleActiveChange("level", "Line of Business")} className="accent-primary" />
                      <span className="text-xs font-semibold text-primary">Line of Business</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="covLevel" checked={activeItem.level === "State"} onChange={() => handleActiveChange("level", "State")} className="accent-primary" />
                        <span className="text-xs font-semibold text-text-main">State</span>
                      </label>
                      {activeItem.level === "State" && (
                        <select value={activeItem.state} onChange={e => handleActiveChange("state", e.target.value)} className={inputCls + " !w-24 appearance-none cursor-pointer"}>
                          {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="covLevel" checked={activeItem.level === "Location"} onChange={() => handleActiveChange("level", "Location")} className="accent-primary" />
                        <span className="text-xs font-semibold text-text-main">Location</span>
                      </label>
                      {activeItem.level === "Location" && (
                        <input type="text" value={activeItem.location} onChange={e => handleActiveChange("location", e.target.value)} className={inputCls + " !w-24"} />
                      )}
                    </div>
                  </div>
                </fieldset>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-main">
                    <input type="checkbox" checked={activeItem.defaultStdCov as boolean} onChange={e => handleActiveChange("defaultStdCov", e.target.checked as any)} className="accent-primary w-4 h-4 rounded-sm" />
                    Default standard coverages and limits based on General Aggregate.
                  </label>
                  <div className="flex items-center gap-3">
                    <span className={labelCls + " !mb-0"}>Sort Order #:</span>
                    <input type="text" value={activeItem.sortOrder} onChange={e => handleActiveChange("sortOrder", e.target.value)} className={inputCls + " !w-16 text-center"} />
                  </div>
                </div>

                <div className="flex items-end gap-6 flex-wrap">
                  <div className="flex-1 min-w-[200px] space-y-1">
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

                <fieldset className="border border-border-main/60 rounded-xl px-5 pb-4 pt-1">
                  <legend className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">General Aggregate Coverage Information</legend>
                  <div className="flex items-end gap-6 mt-2">
                    <div className="w-48 space-y-1">
                      <span className={labelCls}>Limit Applies Per:</span>
                      <select value={activeItem.appliesPer} onChange={e => handleActiveChange("appliesPer", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                        <option value=""></option>
                        <option value="Location">Location</option>
                        <option value="Project">Project</option>
                        <option value="Policy">Policy</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className={labelCls}>Other Description:</span>
                      <input type="text" value={activeItem.otherDesc} onChange={e => handleActiveChange("otherDesc", e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </fieldset>

                <div className="flex items-end gap-6">
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Exposure:</span>
                    <input type="text" value={activeItem.exposure} onChange={e => handleActiveChange("exposure", e.target.value)} onBlur={() => handleFormatField("exposure", activeItem.exposure)} className={inputCls} />
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Rate:</span>
                    <input type="text" value={activeItem.rate} onChange={e => handleActiveChange("rate", e.target.value)} onBlur={() => handleFormatField("rate", activeItem.rate)} className={inputCls} />
                  </div>
                  <div className="w-40 space-y-1">
                    <span className={labelCls}>Premium:</span>
                    <input type="text" value={activeItem.premium} onChange={e => handleActiveChange("premium", e.target.value)} onBlur={() => handleFormatField("premium", activeItem.premium)} className={inputCls} />
                  </div>
                </div>

                <fieldset className="border border-border-main/60 rounded-xl px-5 pb-4 pt-1">
                  <legend className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Deductible Information</legend>
                  <div className="flex items-end gap-6 mt-2">
                    <div className="w-48 space-y-1">
                      <span className={labelCls}>Type:</span>
                      <select value={activeItem.dedType} onChange={e => handleActiveChange("dedType", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                        {DED_TYPE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="w-32 space-y-1">
                      <span className={labelCls}>Amt:</span>
                      <input type="text" value={activeItem.ded} onChange={e => handleActiveChange("ded", e.target.value)} onBlur={() => handleFormatField("ded", activeItem.ded)} className={inputCls} />
                    </div>
                    <div className="w-48 space-y-1">
                      <span className={labelCls}>Basis:</span>
                      <select value={activeItem.basis} onChange={e => handleActiveChange("basis", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                        <option value=""></option>
                        <option value="Per Claim">Per Claim</option>
                        <option value="Per Occurrence">Per Occurrence</option>
                      </select>
                    </div>
                    <div className="w-48 space-y-1">
                      <span className={labelCls}>Applies To:</span>
                      <select value={activeItem.appliesTo} onChange={e => handleActiveChange("appliesTo", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                        <option value=""></option>
                        <option value="Bodily Injury">Bodily Injury</option>
                        <option value="Property Damage">Property Damage</option>
                        <option value="BI & PD">BI & PD</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                <div className="space-y-1">
                  <span className={labelCls}>Miscellaneous Information:</span>
                  <input type="text" value={activeItem.misc} onChange={e => handleActiveChange("misc", e.target.value)} className={inputCls + " max-w-2xl"} />
                </div>

                <fieldset className="border border-border-main/60 rounded-xl px-5 pb-4 pt-1">
                  <legend className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Employee Benefit Information</legend>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " !mb-0"}>Number of employees covered by Employee Benefits Plans:</span>
                        <input type="text" value={activeItem.numEmp} onChange={e => handleActiveChange("numEmp", e.target.value)} className={inputCls + " !w-24"} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={labelCls + " !mb-0"}>Retroactive Date:</span>
                        <input type="date" value={activeItem.retroDate} onChange={e => handleActiveChange("retroDate", e.target.value)} className={inputCls + " !w-36 appearance-none cursor-pointer"} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className={labelCls}>Comments:</span>
                      <textarea value={activeItem.comments} onChange={e => handleActiveChange("comments", e.target.value)} className="w-full h-16 p-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"></textarea>
                    </div>
                  </div>
                </fieldset>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}