"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
  FileText,
  Briefcase,
  Shield,
  Save,
  Printer,
  Check,
  X
} from "lucide-react";

const US_STATES = [
  "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

 

export default function WorkersCompPage() {
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

  const [statesList, setStatesList] = useState([
    {
      state: "OR",
      employerId: "22-3902705",
      anniversaryDate: "",
      participating: "",
      retroPlan: "",
      yearsRetro: "",
      anniversaryRatingDate: "",
      additionalInfo: "",
      safetyGroup: "No",
      dividendPlan: "",
      participatingBasis: "No",
      ncciId: "361057562",
      otherId: ""
    }
  ]);

  const [activeItem, setActiveItem] = useState({
    state: "OR",
    employerId: "",
    anniversaryDate: "",
    participating: "",
    retroPlan: "",
    yearsRetro: "",
    anniversaryRatingDate: "",
    additionalInfo: "",
    safetyGroup: "No",
    dividendPlan: "",
    participatingBasis: "No",
    ncciId: "",
    otherId: ""
  });

  const [part2, setPart2] = useState({
    liabilityCoverageType: "Primary",
    coverageType: "Workers Comp & Employers Liability",
    coverageBasis: "Occurrence",
    eachAccidentLimit: "1,000,000",
    diseasePolicyLimit: "1,000,000",
    diseaseEachEmployee: "1,000,000",
    deductible: "",
    deductibleType: "",
    appliesTo: "",
    hasIncreasedLimits: false,
    incEachAccidentLimit: "",
    incDiseasePolicyLimit: "",
    incDiseaseEachEmployee: "",
    incDeductible: "",
    incDeductibleType: "",
    incAppliesTo: "",
    incFactor: "",
    incFactoredPremium: "",
    classificationsTotalPremium: ""
  });

  useEffect(() => {
    if (customerId && policyId) {
      const token = localStorage.getItem("token");
      // Fetch statesList
      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/workers-comp`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setStatesList(data);
          }
        })
        .catch(err => console.error("Failed to load states list", err));

      // Fetch part2
      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/workers-comp/part2`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 204) return null;
          return res.json();
        })
        .then(data => {
          if (data) setPart2(prev => ({ ...prev, ...data }));
        })
        .catch(err => {
          console.error("Failed to load part 2", err);
        });
    }
  }, [customerId, policyId]);

  const handlePart2Change = (field: string, val: string | boolean) => {
    setPart2(prev => ({ ...prev, [field]: val }));
  };

  const handleActiveChange = (field: string, val: string) => {
    setActiveItem({ ...activeItem, [field]: val });
  };

  const handleNew = () => {
    setActiveItem({
      state: "", employerId: "", anniversaryDate: "", participating: "",
      retroPlan: "", yearsRetro: "", anniversaryRatingDate: "", additionalInfo: "",
      safetyGroup: "No", dividendPlan: "", participatingBasis: "No", ncciId: "", otherId: ""
    });
    setMode("add");
  };

  const handleEdit = () => {
    if (selectedIdx !== null && statesList[selectedIdx]) {
      setActiveItem({ ...statesList[selectedIdx] });
      setMode("edit");
    }
  };

  const handleDelete = async () => {
    if (selectedIdx !== null) {
      const newStatesList = statesList.filter((_, i) => i !== selectedIdx);
      setStatesList(newStatesList);
      setSelectedIdx(null);
      
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/workers-comp`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(newStatesList),
        });
      } catch (err) {
        console.error("Failed to save states list", err);
      }
    }
  };

  // Commits the current row into local state only (no DB call)
  const handleRowCommit = () => {
    let newStatesList = [...statesList];
    if (mode === "add") {
      newStatesList = [...statesList, activeItem];
      setSelectedIdx(newStatesList.length - 1);
    } else if (mode === "edit" && selectedIdx !== null) {
      newStatesList[selectedIdx] = activeItem;
    }
    setStatesList(newStatesList);
    setMode("view");
  };

  // Global Save — persists statesList + part2 to DB
  const handleSave = async () => {
    if (isSaving) return;
    // If user is mid-edit, commit the row first
    let statesListToSave = statesList;
    if (mode !== "view") {
      let newStatesList = [...statesList];
      if (mode === "add") { newStatesList = [...statesList, activeItem]; setSelectedIdx(newStatesList.length - 1); }
      else if (mode === "edit" && selectedIdx !== null) { newStatesList[selectedIdx] = activeItem; }
      setStatesList(newStatesList);
      setMode("view");
      statesListToSave = newStatesList;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/workers-comp`, {
          method: "PUT", headers, body: JSON.stringify(statesListToSave),
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/workers-comp/part2`, {
          method: "PUT", headers, body: JSON.stringify(part2),
        }),
      ]);
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Standard CSS classes for reuse
  const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate";
  const inputCls = "w-full h-8 px-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all truncate";
  const selectCls = "w-full h-8 px-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer";
  const panelHeaderCls = "w-full px-5 py-3.5 bg-secondary/20 border-b border-border-main flex items-center justify-between text-xs font-bold text-primary rounded-t-2xl";
  const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl overflow-hidden mb-6";
  const legendCls = "text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1";
  const btnPrimaryCls = "h-8 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 flex items-center gap-1.5 transition-all";
  const btnCls = "h-8 px-3 bg-white border border-border-main text-text-main text-xs font-bold rounded-xl shadow-sm hover:bg-secondary/40 flex items-center gap-1.5 transition-all";

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">
      {/* ── 1. Modern Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Briefcase size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-black text-primary tracking-tight">Workers Compensation</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              <span>Policy #{policyId || "—"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Customer ID: {customerId || "—"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.close()} className="h-9 px-4 bg-white border border-border-main text-text-main hover:bg-slate-50 hover:text-primary text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm">
            Close
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

      {/* ── 3. Content Area ── */}
      <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* Part 1 Workers Compensation States */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls}>
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-primary" />
              <span>Part 1 Workers Compensation States</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
              {mode === "view" && (
                <>
                  <button onClick={handleNew} className="hover:text-amber-700 transition-colors cursor-pointer">New</button>
                  <button onClick={handleEdit} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-amber-700"}`}>Edit</button>
                  <button onClick={handleDelete} disabled={selectedIdx === null} className={`transition-colors cursor-pointer ${selectedIdx === null ? "text-slate-300 cursor-not-allowed" : "hover:text-danger"}`}>Delete</button>
                </>
              )}
              {mode === "add" && (
                <>
                  <button onClick={handleRowCommit} className="hover:text-amber-700 transition-colors cursor-pointer">Add</button>
                  <button onClick={() => setMode("view")} className="hover:text-red-600 transition-colors cursor-pointer">Cancel</button>
                </>
              )}
              {mode === "edit" && (
                <>
                  <button onClick={handleRowCommit} className="hover:text-amber-700 transition-colors cursor-pointer">Update</button>
                  <button onClick={() => setMode("view")} className="hover:text-red-600 transition-colors cursor-pointer">Cancel</button>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50/50 w-full overflow-x-auto border-b border-border-main/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-border-main/50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 w-24">State</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 w-48">Employer Id</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 w-48">Anniversary Date</th>
                  <th className="px-3 py-2 font-extrabold">Participating</th>
                </tr>
              </thead>
              <tbody className="text-xs text-text-main font-semibold bg-white">
                {statesList.map((st, i) => (
                  <tr
                    key={i}
                    onClick={() => { if (mode === 'view') setSelectedIdx(i); }}
                    onDoubleClick={() => {
                      if (mode === 'view') {
                        setSelectedIdx(i);
                        setActiveItem({ ...statesList[i] });
                        setMode('edit');
                      }
                    }}
                    className={`border-b border-border-main/50 cursor-pointer transition-all ${selectedIdx === i ? 'bg-primary/10 text-primary font-bold shadow-inner' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 border-r border-border-main/50">{st.state}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{st.employerId}</td>
                    <td className="px-3 py-2 border-r border-border-main/50">{st.anniversaryDate}</td>
                    <td className="px-3 py-2">{st.participating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(mode === "add" || mode === "edit") && (
            <div className="p-5 bg-slate-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white border border-border-main shadow-sm rounded-xl p-5">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-center">
                  <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                    <span className={labelCls + " !mb-0 shrink-0 text-red-500"}>State:</span>
                    <select value={activeItem.state} onChange={e => handleActiveChange("state", e.target.value)} className={selectCls + " !border-blue-400"}>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="col-span-12 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-2">
                      <span className={labelCls + " !mb-0 shrink-0"}>Retro Rating Plan:</span>
                      <input type="text" value={activeItem.retroPlan} onChange={e => handleActiveChange("retroPlan", e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={labelCls + " !mb-0 shrink-0"}># of Years Retro in Effect:</span>
                      <input type="text" value={activeItem.yearsRetro} onChange={e => handleActiveChange("yearsRetro", e.target.value)} className={inputCls + " w-20"} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={labelCls + " !mb-0 shrink-0"}>Anniversary Rating Date:</span>
                      <select value={activeItem.anniversaryRatingDate} onChange={e => handleActiveChange("anniversaryRatingDate", e.target.value)} className={selectCls}>
                        <option></option>
                      </select>
                    </div>
                  </div>

                  <div className="col-span-12 flex items-center gap-2">
                    <span className={labelCls + " !mb-0 shrink-0"}>Additional Company Information:</span>
                    <input type="text" value={activeItem.additionalInfo} onChange={e => handleActiveChange("additionalInfo", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Additional Plan Information */}
                  <div>
                    <span className={labelCls}>Additional Plan Information</span>
                    <div className="space-y-4 mt-2">
                      <div className="flex items-center justify-between max-w-sm">
                        <span className="text-xs font-semibold text-slate-600">Is the Insured a member of a Safety Group?</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="safetyGroup" checked={activeItem.safetyGroup === "Yes"} onChange={() => handleActiveChange("safetyGroup", "Yes")} className="accent-primary" />
                            <span className="text-xs font-bold text-slate-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="safetyGroup" checked={activeItem.safetyGroup === "No"} onChange={() => handleActiveChange("safetyGroup", "No")} className="accent-primary" />
                            <span className="text-xs font-bold text-slate-700">No</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 shrink-0">Dividend Plan or Safety Group:</span>
                        <input type="text" value={activeItem.dividendPlan} onChange={e => handleActiveChange("dividendPlan", e.target.value)} className={inputCls + " !w-24"} />
                      </div>

                      <div className="flex items-center justify-between max-w-sm">
                        <span className="text-xs font-semibold text-slate-600">Is Policy to be set on a Participating Basis?</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="participatingBasis" checked={activeItem.participatingBasis === "Yes"} onChange={() => handleActiveChange("participatingBasis", "Yes")} className="accent-primary" />
                            <span className="text-xs font-bold text-slate-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="participatingBasis" checked={activeItem.participatingBasis === "No"} onChange={() => handleActiveChange("participatingBasis", "No")} className="accent-primary" />
                            <span className="text-xs font-bold text-slate-700">No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identification Numbers */}
                  <div>
                    <fieldset className="border border-border-main/70 rounded-xl px-4 pb-4 pt-1 bg-slate-50/50 shadow-sm max-w-md">
                      <legend className={legendCls + " !bg-slate-50/50"}>Identification Numbers:</legend>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-44 shrink-0 text-right">Employer Id:</span>
                          <input type="text" value={activeItem.employerId} onChange={e => handleActiveChange("employerId", e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-44 shrink-0 text-right">NCCI Id:</span>
                          <input type="text" value={activeItem.ncciId} onChange={e => handleActiveChange("ncciId", e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-44 shrink-0 text-right leading-tight">Other Rating Bureau Id or<br />State Employer Reg #:</span>
                          <input type="text" value={activeItem.otherId} onChange={e => handleActiveChange("otherId", e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Part 2 Employers Liability */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls}>
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-primary" />
              <span>Part 2 Employers Liability</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={labelCls + " !mb-0 shrink-0"}>Liability Coverage Type:</span>
                <select value={part2.liabilityCoverageType} onChange={e => handlePart2Change("liabilityCoverageType", e.target.value)} className={selectCls + " max-w-[200px]"}>
                  <option>Primary</option>
                  <option>Excess</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="coverageType" checked={part2.coverageType === "Workers Comp & Employers Liability"} onChange={() => handlePart2Change("coverageType", "Workers Comp & Employers Liability")} className="accent-primary" />
                  <span className="text-xs font-semibold text-text-main">Workers Comp & Employers Liability</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="coverageType" checked={part2.coverageType === "Employers Liability"} onChange={() => handlePart2Change("coverageType", "Employers Liability")} className="accent-primary" />
                  <span className="text-xs font-semibold text-text-main">Employers Liability</span>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Each Accident Limit:</span>
                  <input type="text" value={part2.eachAccidentLimit} onChange={e => handlePart2Change("eachAccidentLimit", e.target.value)} className={inputCls + " max-w-[200px]"} />
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Disease Policy Limit:</span>
                  <input type="text" value={part2.diseasePolicyLimit} onChange={e => handlePart2Change("diseasePolicyLimit", e.target.value)} className={inputCls + " max-w-[200px]"} />
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Disease Each Employee:</span>
                  <input type="text" value={part2.diseaseEachEmployee} onChange={e => handlePart2Change("diseaseEachEmployee", e.target.value)} className={inputCls + " max-w-[200px]"} />
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Deductible:</span>
                  <input type="text" value={part2.deductible} onChange={e => handlePart2Change("deductible", e.target.value)} className={inputCls + " max-w-[200px]"} />
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Deductible Type:</span>
                  <select value={part2.deductibleType} onChange={e => handlePart2Change("deductibleType", e.target.value)} className={selectCls + " max-w-[200px]"}>
                    <option></option>
                    <option>Coinsurance</option>
                    <option>Disappearing</option>
                    <option>Dollars</option>
                    <option>Flat</option>
                    <option>Hours</option>
                    <option>Indemnity Only</option>
                    <option>Medical Only</option>
                    <option>Other</option>
                    <option>Per Accident</option>
                    <option>Per Claim</option>
                    <option>Percent</option>
                    <option>Whole Dollar</option>
                  </select>
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <span className={labelCls + " !mb-0"}>Applies To:</span>
                  <select value={part2.appliesTo} onChange={e => handlePart2Change("appliesTo", e.target.value)} className={selectCls + " max-w-[200px]"}>
                    <option></option>
                    <option>Coins as percentage</option>
                    <option>Indemnity only</option>
                    <option>Med & indemnity</option>
                    <option>Medical only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <fieldset className="border border-border-main/70 rounded-xl px-4 py-3 bg-slate-50/50 shadow-sm max-w-md">
                <legend className={legendCls + " !bg-slate-50/50"}>Coverage Basis</legend>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="coverageBasis" checked={part2.coverageBasis === "Occurrence"} onChange={() => handlePart2Change("coverageBasis", "Occurrence")} className="accent-primary" />
                    <span className="text-xs font-semibold text-text-main">Occurrence</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="coverageBasis" checked={part2.coverageBasis === "Claims Made"} onChange={() => handlePart2Change("coverageBasis", "Claims Made")} className="accent-primary" />
                    <span className="text-xs font-semibold text-text-main">Claims Made</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="border border-border-main/70 rounded-xl px-4 pb-4 pt-2 bg-slate-50/50 shadow-sm max-w-md">
                <legend className="px-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50/50">
                    <input type="checkbox" checked={part2.hasIncreasedLimits} onChange={e => handlePart2Change("hasIncreasedLimits", e.target.checked)} className="accent-primary rounded" />
                    <span className={labelCls + " !mb-0"}>Increased Limits</span>
                  </label>
                </legend>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Each Accident Limit:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incEachAccidentLimit} onChange={e => handlePart2Change("incEachAccidentLimit", e.target.value)} className={inputCls + " max-w-[200px] disabled:bg-slate-100"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Disease Policy Limit:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incDiseasePolicyLimit} onChange={e => handlePart2Change("incDiseasePolicyLimit", e.target.value)} className={inputCls + " max-w-[200px] disabled:bg-slate-100"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Disease Each Employee:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incDiseaseEachEmployee} onChange={e => handlePart2Change("incDiseaseEachEmployee", e.target.value)} className={inputCls + " max-w-[200px] disabled:bg-slate-100"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Deductible:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incDeductible} onChange={e => handlePart2Change("incDeductible", e.target.value)} className={inputCls + " max-w-[200px] disabled:bg-slate-100"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Deductible Type:</span>
                    <select disabled={!part2.hasIncreasedLimits} value={part2.incDeductibleType} onChange={e => handlePart2Change("incDeductibleType", e.target.value)} className={selectCls + " max-w-[200px] disabled:bg-slate-100"}>
                      <option></option>
                      <option>Coinsurance</option>
                      <option>Disappearing</option>
                      <option>Dollars</option>
                      <option>Flat</option>
                      <option>Hours</option>
                      <option>Indemnity Only</option>
                      <option>Medical Only</option>
                      <option>Other</option>
                      <option>Per Accident</option>
                      <option>Per Claim</option>
                      <option>Percent</option>
                      <option>Whole Dollar</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Applies To:</span>
                    <select disabled={!part2.hasIncreasedLimits} value={part2.incAppliesTo} onChange={e => handlePart2Change("incAppliesTo", e.target.value)} className={selectCls + " max-w-[200px] disabled:bg-slate-100"}>
                      <option></option>
                      <option>Coins as percentage</option>
                      <option>Indemnity only</option>
                      <option>Med & indemnity</option>
                      <option>Medical only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Factor:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incFactor} onChange={e => handlePart2Change("incFactor", e.target.value)} className={inputCls + " max-w-[100px] disabled:bg-slate-100"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelCls + " !mb-0"}>Factored Premium:</span>
                    <input type="text" disabled={!part2.hasIncreasedLimits} value={part2.incFactoredPremium} onChange={e => handlePart2Change("incFactoredPremium", e.target.value)} className={inputCls + " max-w-[200px] disabled:bg-slate-100"} />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
