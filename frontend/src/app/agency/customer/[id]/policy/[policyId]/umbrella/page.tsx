"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { FileText, Shield, Save, Printer, Check, X } from "lucide-react";

export default function UmbrellaPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const policyId = params?.policyId as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  

  const [covMode, setCovMode] = useState<"view" | "add" | "edit">("view");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [isSaving, setIsSaving] = useState(false);

  const [coverages, setCoverages] = useState([
    { level: "Line of Business", coverage: "Excess Liability", state: "", location: "", limit1: "2,000,000", limit2: "2,000,000", retType: "", retention: "", premium: "2,887.50", sort: "1", exposure: "", rate: "", retAmount: "", retBasis: "", misc: "" }
  ]);

  const [activeCov, setActiveCov] = useState({
    level: "Line of Business", coverage: "Excess Liability", state: "", location: "", limit1: "", limit2: "", retType: "", retention: "", premium: "", sort: "1", exposure: "", rate: "", retAmount: "", retBasis: "", misc: ""
  });

  const defaultInfo = {
    coverageType: "Umbrella",
    expiringPolicy: "",
    proposedRetroDate: "",
    currentRetroDate: "",
    firstDollarDefense: "No",
  };
  const [info, setInfo] = useState(defaultInfo);

  // Fetch both coverages and info on load
  useEffect(() => {
    if (!customerId || !policyId) return;
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/umbrella`, { headers })
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setCoverages(data); })
      .catch(err => console.error("Failed to load coverages", err));

    fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/umbrella/info`, { headers })
      .then(res => { if (res.status === 204) return null; return res.json(); })
      .then(data => { if (data) setInfo(data); })
      .catch(err => console.error("Failed to load umbrella info", err));
  }, [customerId, policyId, API_BASE_URL]);

  const handleFormatAmount = (val: string) => {
    const clean = val.replace(/,/g, '').replace(/\$/g, '');
    if (!clean || isNaN(Number(clean))) return val;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parseFloat(clean));
  };

  const handleActiveCovChange = (field: string, val: string) => {
    setActiveCov({ ...activeCov, [field]: val });
  };

  const handleNew = () => {
    setActiveCov({ level: "Line of Business", coverage: "Excess Liability", state: "", location: "", limit1: "", limit2: "", retType: "", retention: "", premium: "", sort: (coverages.length + 1).toString(), exposure: "", rate: "", retAmount: "", retBasis: "", misc: "" });
    setCovMode("add");
  };

  const handleEdit = () => {
    if (selectedIdx !== null && coverages[selectedIdx]) {
      setActiveCov({ ...coverages[selectedIdx], exposure: coverages[selectedIdx].exposure || "", rate: coverages[selectedIdx].rate || "", retAmount: coverages[selectedIdx].retAmount || "", retBasis: coverages[selectedIdx].retBasis || "", misc: coverages[selectedIdx].misc || "" });
      setCovMode("edit");
    }
  };

  // Commit the row edit/add into local state (no DB call — global Save does that)
  const handleRowCommit = () => {
    if (isSaving) return;
    const formattedCov = {
      ...activeCov,
      limit1: handleFormatAmount(activeCov.limit1),
      limit2: handleFormatAmount(activeCov.limit2),
      premium: handleFormatAmount(activeCov.premium)
    };
    let newCovs = [...coverages];
    if (covMode === "add") {
      newCovs = [...coverages, formattedCov];
      setSelectedIdx(newCovs.length - 1);
    } else if (covMode === "edit" && selectedIdx !== null) {
      newCovs[selectedIdx] = formattedCov;
    }
    setCoverages(newCovs);
    setCovMode("view");
  };

  const handleDelete = async () => {
    if (selectedIdx === null) return;
    const newCovs = coverages.filter((_, i) => i !== selectedIdx);
    setCoverages(newCovs);
    setSelectedIdx(null);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/umbrella`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newCovs)
      });
    } catch (err) {
      console.error("Failed to delete coverage", err);
    }
  };

  // Global Save — persists coverages + info to DB
  const handleGlobalSave = async () => {
    if (isSaving) return;
    // If user is mid-edit, commit the row first
    let covToSave = coverages;
    if (covMode !== "view") {
      const formattedCov = {
        ...activeCov,
        limit1: handleFormatAmount(activeCov.limit1),
        limit2: handleFormatAmount(activeCov.limit2),
        premium: handleFormatAmount(activeCov.premium)
      };
      let newCovs = [...coverages];
      if (covMode === "add") { newCovs = [...coverages, formattedCov]; setSelectedIdx(newCovs.length - 1); }
      else if (covMode === "edit" && selectedIdx !== null) { newCovs[selectedIdx] = formattedCov; }
      setCoverages(newCovs);
      setCovMode("view");
      covToSave = newCovs;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/umbrella`, {
          method: "PUT", headers, body: JSON.stringify(covToSave)
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/umbrella/info`, {
          method: "PUT", headers, body: JSON.stringify(info)
        }),
      ]);
    } catch (err) {
      console.error("Failed to save umbrella data", err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalPremium = coverages.reduce((sum, c) => sum + (parseFloat((c.premium || "").replace(/,/g, '')) || 0), 0);

  // CSS
  const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate";
  const inputCls = "w-full h-9 px-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all truncate";
  const panelHeaderCls = "w-full px-5 py-3.5 bg-secondary/20 border-b border-border-main flex items-center gap-2 text-xs font-bold text-primary rounded-t-2xl";
  const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl";
  const legendCls = "text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 bg-white";
  const radioLabelCls = "flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer hover:text-primary transition-colors";
  const btnPrimaryCls = "h-8 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 flex items-center gap-1.5 transition-all";
  const btnCls = "h-8 px-3 bg-white border border-border-main text-text-main text-xs font-bold rounded-xl shadow-sm hover:bg-secondary/40 flex items-center gap-1.5 transition-all";

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">

      {/* ── 1. Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Shield className="text-white size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">Umbrella</span>
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
            <span className="sr-only">Close</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </header>

      {/* ── 2. Global Action Toolbar ── */}
      <div className="bg-white border-b border-border-main px-6 py-3 flex items-center gap-2.5 shrink-0 shadow-sm sticky top-16 z-40 overflow-x-auto">
        <button
          onClick={handleGlobalSave}
          disabled={isSaving}
          className={`${btnPrimaryCls} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save size={13} className="stroke-[2.5]" /> {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={async () => {
            await handleGlobalSave();
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

      {/* ── 3. Content ── */}
      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6 w-full">

        {/* Panel 1: Policy Information */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls}>
            <FileText size={15} className="text-primary" />
            <span>Policy Information</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 items-end">

              <div className="col-span-1 lg:col-span-2">
                <fieldset className="border border-border-main/70 rounded-xl px-4 pb-3 pt-0.5 bg-slate-50/20">
                  <legend className={legendCls}>Coverage Type</legend>
                  <div className="flex items-center gap-6 mt-1">
                    <label className={radioLabelCls}>
                      <input type="radio" name="coverageType" className="accent-primary w-4 h-4"
                        checked={info.coverageType === "Umbrella"}
                        onChange={() => setInfo({ ...info, coverageType: "Umbrella" })} />
                      Umbrella
                    </label>
                    <label className={radioLabelCls}>
                      <input type="radio" name="coverageType" className="accent-primary w-4 h-4"
                        checked={info.coverageType === "Other Than Umbrella"}
                        onChange={() => setInfo({ ...info, coverageType: "Other Than Umbrella" })} />
                      Other Than Umbrella
                    </label>
                  </div>
                </fieldset>
              </div>

              <div className="col-span-1 mb-1">
                <div className="flex items-center gap-4">
                  <span className={labelCls + " !mb-0 shrink-0"}>Expiring Policy:</span>
                  <input type="text" className={inputCls} value={info.expiringPolicy}
                    onChange={e => setInfo({ ...info, expiringPolicy: e.target.value })} />
                </div>
              </div>

              <div className="col-span-1">
                <div className="flex items-center gap-4">
                  <span className={labelCls + " !mb-0 shrink-0"}>Proposed Retro Date:</span>
                  <input type="text" className={inputCls} value={info.proposedRetroDate}
                    onChange={e => setInfo({ ...info, proposedRetroDate: e.target.value })} />
                </div>
              </div>

              <div className="col-span-1">
                <div className="flex items-center gap-4">
                  <span className={labelCls + " !mb-0 shrink-0"}>Current Retro Date:</span>
                  <input type="text" className={inputCls} value={info.currentRetroDate}
                    onChange={e => setInfo({ ...info, currentRetroDate: e.target.value })} />
                </div>
              </div>

              <div className="col-span-1">
                <fieldset className="border border-border-main/70 rounded-xl px-4 pb-3 pt-0.5 bg-slate-50/20">
                  <legend className={legendCls}>1st Dollar Defense</legend>
                  <div className="flex items-center gap-6 mt-1">
                    <label className={radioLabelCls}>
                      <input type="radio" name="firstDollarDefense" className="accent-primary w-4 h-4"
                        checked={info.firstDollarDefense === "Yes"}
                        onChange={() => setInfo({ ...info, firstDollarDefense: "Yes" })} />
                      Yes
                    </label>
                    <label className={radioLabelCls}>
                      <input type="radio" name="firstDollarDefense" className="accent-primary w-4 h-4"
                        checked={info.firstDollarDefense === "No"}
                        onChange={() => setInfo({ ...info, firstDollarDefense: "No" })} />
                      No
                    </label>
                  </div>
                </fieldset>
              </div>

            </div>
          </div>
        </div>

        {/* Panel 2: Umbrella Coverages/Limits/Premiums */}
        <div className={panelContainerCls + " overflow-hidden"}>
          <div className={panelHeaderCls + " justify-between bg-amber-100/60 border-b border-amber-200"}>
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-amber-700" />
              <span className="text-amber-900">Umbrella Coverages/Limits/Premiums</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
              {covMode === "view" && (
                <>
                  <button onClick={handleNew} className="hover:text-amber-700 transition-colors cursor-pointer">New</button>
                  <button onClick={handleEdit} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-amber-700"}`}>Edit</button>
                  <button onClick={handleDelete} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-red-600"}`}>Delete</button>
                </>
              )}
              {covMode === "add" && (
                <>
                  <button onClick={handleRowCommit} disabled={isSaving} className={`transition-colors cursor-pointer ${isSaving ? 'opacity-50 text-slate-400' : 'hover:text-amber-700'}`}>Add</button>
                  <button onClick={() => setCovMode("view")} disabled={isSaving} className="hover:text-red-600 transition-colors cursor-pointer">Cancel</button>
                </>
              )}
              {covMode === "edit" && (
                <>
                  <button onClick={handleRowCommit} disabled={isSaving} className={`transition-colors cursor-pointer ${isSaving ? 'opacity-50 text-slate-400' : 'hover:text-amber-700'}`}>Update</button>
                  <button onClick={() => setCovMode("view")} disabled={isSaving} className="hover:text-red-600 transition-colors cursor-pointer">Cancel</button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border-main text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="px-3 py-2 border-r border-border-main/50">Coverage Level</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Coverage</th>
                  <th className="px-3 py-2 border-r border-border-main/50">State</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Location</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Limit 1</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Limit 2</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Retention Type</th>
                  <th className="px-3 py-2 border-r border-border-main/50">Retention</th>
                  <th className="px-3 py-2 border-r border-border-main/50 text-right">Premium</th>
                  <th className="px-3 py-2 text-center">Sort #</th>
                </tr>
              </thead>
              <tbody className="text-xs text-text-main font-semibold bg-white">
                {coverages.map((cov, i) => (
                  <tr
                    key={i}
                    onClick={() => { if (covMode === 'view') setSelectedIdx(i); }}
                    onDoubleClick={() => {
                      if (covMode === 'view') {
                        setSelectedIdx(i);
                        setActiveCov({ ...coverages[i] });
                        setCovMode('edit');
                      }
                    }}
                    className={`border-b border-border-main/50 cursor-pointer transition-all ${selectedIdx === i ? 'bg-primary/10 text-primary font-bold shadow-inner' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.level}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.coverage}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.state}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.location}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.limit1}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.limit2}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.retType}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{cov.retention}</td>
                    <td className="px-3 py-2 border-r border-border-main/50 text-right">{cov.premium}</td>
                    <td className="px-3 py-2 text-center">{cov.sort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 flex justify-end items-center border-b border-border-main shadow-inner">
            <div className="bg-white border border-border-main px-3 py-1 text-xs font-bold text-text-main min-w-[200px] text-right shadow-sm rounded">
              $ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPremium)}
            </div>
          </div>

          {covMode !== "view" && (
            <div className="p-6 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-200">
              <fieldset className="border border-border-main/70 rounded-xl px-4 pb-4 pt-1 mb-5 bg-white shadow-sm">
                <legend className={legendCls + " !bg-white"}>Coverage Level</legend>
                <div className="flex items-center gap-8 mt-2">
                  <label className={radioLabelCls + " text-danger"}>
                    <input type="radio" name="coverageLevel" defaultChecked className="accent-primary w-4 h-4" />
                    Line of Business
                  </label>
                  <label className={radioLabelCls + " text-slate-400 font-medium"}>
                    <input type="radio" name="coverageLevel" disabled className="accent-primary w-4 h-4" />
                    State
                  </label>
                  <select className={inputCls + " w-24 bg-slate-100 border-transparent shadow-none"} disabled></select>
                  <label className={radioLabelCls + " text-slate-400 font-medium"}>
                    <input type="radio" name="coverageLevel" disabled className="accent-primary w-4 h-4" />
                    Location
                  </label>
                  <select className={inputCls + " w-24 bg-slate-100 border-transparent shadow-none"} disabled></select>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 items-center">
                <div className="col-span-1 lg:col-span-2"></div>
                <div className="col-span-1 flex justify-end gap-2 items-center">
                  <span className={labelCls + " !mb-0"}>Sort Order #:</span>
                  <input type="text" value={activeCov.sort} onChange={e => handleActiveCovChange("sort", e.target.value)} className={inputCls + " !w-16 text-center"} />
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-20 shrink-0 text-right"}>Coverage:</span>
                    <select value={activeCov.coverage} onChange={e => handleActiveCovChange("coverage", e.target.value)} className={inputCls}>
                      <option>Excess Liability</option>
                      <option>Commercial Umbrella</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-16 shrink-0 text-right"}>Limit 1:</span>
                    <input type="text" value={activeCov.limit1} onChange={e => handleActiveCovChange("limit1", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-16 shrink-0 text-right"}>Limit 2:</span>
                    <input type="text" value={activeCov.limit2} onChange={e => handleActiveCovChange("limit2", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-24 shrink-0 text-right"}>Retention Type:</span>
                    <input type="text" value={activeCov.retType} onChange={e => handleActiveCovChange("retType", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-20 shrink-0 text-right"}>Retention:</span>
                    <input type="text" value={activeCov.retention} onChange={e => handleActiveCovChange("retention", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className={labelCls + " !mb-0 w-16 shrink-0 text-right"}>Premium:</span>
                    <input type="text" value={activeCov.premium} onChange={e => handleActiveCovChange("premium", e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}