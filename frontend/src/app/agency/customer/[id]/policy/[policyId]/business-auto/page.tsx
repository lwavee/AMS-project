"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
  Car,
  ShieldAlert,
  ListPlus,
  Save,
  Printer
} from "lucide-react";



export default function BusinessAutoPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const policyId = params?.policyId as string;

  // -- COVERED AUTO SYMBOLS STATE --
  const [symbols, setSymbols] = useState<Record<string, Record<string, boolean>>>({
    liability: { "1": false, "2": false, "3": false, "4": false, "7": true, "8": true, "9": true },
    pip: { "2": false, "5": false, "7": false },
    additionalPip: { "5": false, "7": false },
    medicalPayments: { "2": false, "3": false, "4": false, "7": false, "8": false },
    uninsuredMotorist: { "2": false, "3": false, "4": false, "6": false, "7": false, "8": false, "9": false },
    underinsuredMotorist: { "2": false, "3": false, "4": false, "6": false, "7": false, "8": false, "9": false },
    towing: { "3": false, "7": false },
    comprehensive: { "2": false, "3": false, "4": false, "7": false, "8": false },
    specifiedCauses: { "2": false, "3": false, "4": false, "7": false, "8": false },
    collision: { "2": false, "3": false, "4": false, "7": false, "8": false },
  });

  const handleSymbolToggle = async (category: string, num: string) => {
    const newSymbols = {
      ...symbols,
      [category]: {
        ...symbols[category],
        [num]: !symbols[category][num]
      }
    };
    setSymbols(newSymbols);

    try {
      await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto/symbols`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSymbols)
      });
    } catch (err) {
      console.error("Failed to save symbols", err);
    }
  };

  const renderCheckboxes = (category: string, nums: string[]) => (
    <div className="flex items-center gap-2 flex-wrap">
      {nums.map(n => (
        <label key={n} className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={symbols[category]?.[n] || false}
            onChange={() => handleSymbolToggle(category, n)}
            className="accent-primary rounded-sm w-3 h-3"
          />
          <span className="text-[10px] font-bold text-slate-600">{n}</span>
        </label>
      ))}
    </div>
  );

  // -- COVERAGES STATE --
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  const [coverages, setCoverages] = useState([
    { level: "Line of Business", state: "", location: "", coverage: "Combined single limit", formSection: "Liability", sortOrder: "1", limit1: "1,000,000", limit2: "", premium: "", dedType: "", dedAmt: "", numberOf: "", rate: "", misc: "" },
    { level: "Line of Business", state: "", location: "", coverage: "Uninsured motorist BI split limit", formSection: "Uninsured Motorist", sortOrder: "2", limit1: "1,000,000", limit2: "", premium: "", dedType: "", dedAmt: "", numberOf: "", rate: "", misc: "" },
    { level: "Line of Business", state: "", location: "", coverage: "Comprehensive", formSection: "Comprehensive", sortOrder: "3", limit1: "", limit2: "", premium: "", dedType: "", dedAmt: "1,000", numberOf: "", rate: "", misc: "" },
    { level: "Line of Business", state: "", location: "", coverage: "Collision", formSection: "Collision", sortOrder: "4", limit1: "", limit2: "", premium: "", dedType: "", dedAmt: "1,000", numberOf: "", rate: "", misc: "" }
  ]);

  const emptyCoverage = { level: "Line of Business", state: "", location: "", coverage: "", formSection: "", sortOrder: "", limit1: "", limit2: "", premium: "", dedType: "", dedAmt: "", numberOf: "", rate: "", misc: "" };
  const [activeItem, setActiveItem] = useState(emptyCoverage);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (customerId && policyId) {
      const token = localStorage.getItem("token");
      // Fetch Coverages
      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCoverages(data);
          }
        })
        .catch(err => console.error("Failed to load coverages", err));

      // Fetch Symbols
      fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto/symbols`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 204) return null;
          return res.json();
        })
        .then(data => {
          if (data) {
            // Merge with default symbols to ensure keys exist
            setSymbols(prev => ({ ...prev, ...data }));
          }
        })
        .catch(err => console.error("Failed to load symbols", err));
    }
  }, [customerId, policyId]);

  const handleActiveChange = (field: string, val: string) => {
    setActiveItem({ ...activeItem, [field]: val });
  };

  const COVERAGE_OPTIONS = [
    "$100 Deduc Comp Ops", "1ST PARTY BENE BROADEN NI", "5MPH Bumpers NJ", "90 Days Notice",
    "AAA MEMBERSHIP", "AAA Option", "AB Restraint Drvr only", "AB-Restraint all frnt seat",
    "ACCI PRECENTION COURSE CR", "Accidental Death Benefit", "Accidental Death Benefits",
    "ACCIDENTAL DISCHARGE", "Accidentl Health Employee", "Ace Advantage DOC Coll",
    "Ace Advantage DOC Comp", "Ace Advantage DOC Liab", "Ace Advantage Veh", "Ace Advantage Veh Liab",
    "Acquisition", "Action Over Exclusion", "Active Anti-Theft Alarm Discount",
    "Active Disabling Device Discount", "Actively Seeking Pol Rvw", "ACTS E&O LIAB",
    "Acts E&O Liability", "Acuity Enhc BAUTO Cov", "Acuity Enhc Truckers",
    "Add Purchased Equip", "Added Reparations Bene", "Additional Chiropractic Benefits",
    "Additional PIP", "Bodily Injury", "Broad Form", "Collision", "Combined single limit",
    "Comprehensive", "Drive Other Car", "Fire and Theft Combined", "Hired Auto",
    "Medical Payments", "Motor Truck Cargo", "Non-Owned Auto", "Personal Injury Protection",
    "Physical Damage", "Property Damage", "Rental Reimbursement", "Specified Perils",
    "Split Limit", "Towing and Labor", "Trailer Interchange",
    "Underinsured Motorist", "Uninsured motorist BI split limit", "Uninsured Motorist"
  ];

  const FORM_SECTION_OPTIONS = [
    "", "Additional PIP", "Collision", "Comprehensive", "Cyber and Privacy Liability",
    "Liability", "Medical Payments", "Misc. Physical Damage",
    "Personal Injury Protection", "Specified Causes of Loss", "Towing & Labor",
    "Underinsured Motorist", "Uninsured Motorist"
  ];

  const DED_TYPE_OPTIONS = [
    "", "Coinsurance", "Disappearing", "Dollars", "Flat", "Hours",
    "Indemnity Only", "Medical Only", "Other", "Per Accident",
    "Per Claim", "Percent", "Whole Dollar"
  ];

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
        await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto`, {
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

  // Commits the current row edit/add into local state only (no DB call)
  const handleRowCommit = () => {
    let newCoverages = [...coverages];
    if (mode === "add") {
      newCoverages = [...coverages, activeItem];
      setSelectedIdx(newCoverages.length - 1);
    } else if (mode === "edit" && selectedIdx !== null) {
      newCoverages[selectedIdx] = activeItem;
    }
    setCoverages(newCoverages);
    setMode("view");
  };

  // Global Save — persists coverages + symbols to DB
  const handleSave = async () => {
    if (isSaving) return;
    // If user is mid-edit, commit the row first
    let covToSave = coverages;
    if (mode !== "view") {
      let newCoverages = [...coverages];
      if (mode === "add") { newCoverages = [...coverages, activeItem]; setSelectedIdx(newCoverages.length - 1); }
      else if (mode === "edit" && selectedIdx !== null) { newCoverages[selectedIdx] = activeItem; }
      setCoverages(newCoverages);
      setMode("view");
      covToSave = newCoverages;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto`, {
          method: "PUT", headers, body: JSON.stringify(covToSave),
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${policyId}/business-auto/symbols`, {
          method: "PUT", headers, body: JSON.stringify(symbols),
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
  const panelHeaderCls = "w-full px-5 py-3.5 bg-[#B5A48A]/10 border-b border-border-main flex items-center justify-between text-xs font-bold text-primary rounded-t-2xl";
  const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl overflow-hidden mb-6";
  const btnPrimaryCls = "h-8 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 flex items-center gap-1.5 transition-all";
  const btnCls = "h-8 px-3 bg-white border border-border-main text-text-main text-xs font-bold rounded-xl shadow-sm hover:bg-secondary/40 flex items-center gap-1.5 transition-all";

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col select-none overflow-x-hidden pb-24">
      {/* ── 1. Modern Sticky Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Car size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-black text-primary tracking-tight">Business Auto</h1>
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
        <button className={btnCls}><Printer size={13} /> Print</button>
      </div>

      {/* ── 3. Content Area ── */}
      <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* Panel: Covered Auto Symbols */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls + " !bg-slate-500/10 !text-slate-700"}>
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} />
              <span>Covered Auto Symbols</span>
            </div>
            <button className="text-[10px] font-extrabold uppercase tracking-widest hover:text-danger transition-colors cursor-pointer">Delete</button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Liability</span>
                <div className="flex items-center gap-2">
                  {renderCheckboxes("liability", ["1", "2", "3", "4", "7", "8", "9"])}
                  <input type="text" className={inputCls + " !w-8 !h-5 !px-1 text-center"} />
                  <input type="text" className={inputCls + " !w-8 !h-5 !px-1 text-center"} />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Personal Injury Protection</span>
                {renderCheckboxes("pip", ["2", "5", "7"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Additional PIP</span>
                {renderCheckboxes("additionalPip", ["5", "7"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Property Protection</span>
                <div className="flex items-center gap-2">
                  <input type="text" className={inputCls + " !w-8 !h-5 !px-1 text-center"} />
                  <input type="text" className={inputCls + " !w-8 !h-5 !px-1 text-center"} />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Medical Payments</span>
                {renderCheckboxes("medicalPayments", ["2", "3", "4", "7", "8"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Uninsured Motorist</span>
                {renderCheckboxes("uninsuredMotorist", ["2", "3", "4", "6", "7", "8", "9"])}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Underinsured Motorist</span>
                {renderCheckboxes("underinsuredMotorist", ["2", "3", "4", "6", "7", "8", "9"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Towing & Labor</span>
                {renderCheckboxes("towing", ["3", "7"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Comprehensive</span>
                {renderCheckboxes("comprehensive", ["2", "3", "4", "7", "8"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Specified Causes of Loss</span>
                {renderCheckboxes("specifiedCauses", ["2", "3", "4", "7", "8"])}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Collision</span>
                {renderCheckboxes("collision", ["2", "3", "4", "7", "8"])}
              </div>
            </div>

            {/* Full Width Bottom */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t border-border-main/50 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-2 block">Additional Coverage/Symbols</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <select className={selectCls + " !w-40"}><option></option></select>
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" className={inputCls + " !w-64"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                    <input type="text" className={inputCls + " !w-8 !h-6 !px-1"} />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 mb-1 block">Endorsements, Forms, Conditions:</span>
                <textarea className="w-full h-16 p-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Panel: Coverages */}
        <div className={panelContainerCls}>
          <div className={panelHeaderCls}>
            <div className="flex items-center gap-2">
              <ListPlus size={15} className="text-primary" />
              <span>Coverages</span>
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

          <div className="bg-white p-3 border-b border-border-main/50 flex items-center justify-between flex-wrap gap-4">
            <button className="h-8 px-4 bg-slate-100 border border-border-main text-text-main hover:bg-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer">Get Coverages</button>
            <div className="flex items-center gap-2 bg-slate-50 border border-border-main/50 p-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Line of Business Premium:</span>
              <input type="text" className={inputCls + " !w-24 !h-7 !text-[10px]"} />
              <button className="h-7 px-3 bg-primary text-white hover:bg-primary/90 text-[10px] font-bold rounded-lg transition-all cursor-pointer">Calculate</button>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 border border-border-main/50 p-1.5 px-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Default New Vehicle Coverages:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="defaultCov" defaultChecked className="accent-primary" />
                <span className="text-[10px] font-bold text-slate-700">From Line of Business</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="defaultCov" className="accent-primary" />
                <span className="text-[10px] font-bold text-slate-700">From Last Vehicle</span>
              </label>
            </div>
            <button className="h-8 px-4 bg-slate-100 border border-border-main text-text-main hover:bg-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer">Update Vehicle Coverages</button>
          </div>

          <div className="bg-slate-50/50 w-full overflow-x-auto border-b border-border-main/50">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100/70 border-b border-border-main/50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-red-500">Level</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">State</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Location</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-red-500">Coverage</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Form Section</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Sort Order #</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Limit 1</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Limit 2</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-right">Premium</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50">Ded Type</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-right">Ded Amt</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-right">Number of</th>
                  <th className="px-3 py-2 font-extrabold border-r border-border-main/50 text-right">Rate</th>
                  <th className="px-3 py-2 font-extrabold">Miscellaneous Information</th>
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
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.level}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.state}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.location}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.coverage}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.formSection}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.sortOrder}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.limit1}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.limit2}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.premium}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50">{cov.dedType}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.dedAmt}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.numberOf}</td>
                    <td className="px-3 py-1.5 border-r border-border-main/50 text-right">{cov.rate}</td>
                    <td className="px-3 py-1.5">{cov.misc}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-xs">
                  <td colSpan={8} className="px-3 py-2 border-r border-border-main/50 text-right text-slate-500 uppercase tracking-wider text-[10px]">Total Premium:</td>
                  <td className="px-3 py-2 border-r border-border-main/50 text-right">$0.00</td>
                  <td colSpan={5}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {(mode === "add" || mode === "edit") && (
            <div className="p-5 bg-slate-50 animate-in fade-in slide-in-from-top-4 duration-300">
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
                        <input type="text" value={activeItem.state} onChange={e => handleActiveChange("state", e.target.value)} placeholder="" className={inputCls + " !w-16 !h-7"} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="covLevel" checked={activeItem.level === "Location"} onChange={() => handleActiveChange("level", "Location")} className="accent-primary" />
                        <span className="text-xs font-semibold text-text-main">Location</span>
                      </label>
                      {activeItem.level === "Location" && (
                        <input type="text" value={activeItem.location} onChange={e => handleActiveChange("location", e.target.value)} placeholder="" className={inputCls + " !w-16 !h-7"} />
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Coverage + Form Section + Sort Order row */}
                <div className="flex items-end gap-6 flex-wrap">
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <span className={labelCls + " text-red-500"}>Coverage:</span>
                    <select value={activeItem.coverage} onChange={e => handleActiveChange("coverage", e.target.value)} className={selectCls + " !border-blue-400"}>
                      <option value=""></option>
                      {COVERAGE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="w-48 space-y-1">
                    <span className={labelCls}>Form Section:</span>
                    <select value={activeItem.formSection} onChange={e => handleActiveChange("formSection", e.target.value)} className={selectCls}>
                      {FORM_SECTION_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <span className={labelCls}>Sort Order #:</span>
                    <input type="text" value={activeItem.sortOrder} onChange={e => handleActiveChange("sortOrder", e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Limit 1 / Limit 2 / Premium + Ded Type / Ded Amt / Number of */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="space-y-1">
                    <span className={labelCls}>Limit 1:</span>
                    <input type="text" value={activeItem.limit1} onChange={e => handleActiveChange("limit1", e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <span className={labelCls}>Limit 2:</span>
                    <input type="text" value={activeItem.limit2} onChange={e => handleActiveChange("limit2", e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <span className={labelCls}>Premium:</span>
                    <input type="text" value={activeItem.premium} onChange={e => handleActiveChange("premium", e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <span className={labelCls}>Ded Type:</span>
                    <select value={activeItem.dedType} onChange={e => handleActiveChange("dedType", e.target.value)} className={selectCls}>
                      {DED_TYPE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className={labelCls}>Ded Amt:</span>
                    <input type="text" value={activeItem.dedAmt} onChange={e => handleActiveChange("dedAmt", e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <span className={labelCls}>Number of:</span>
                    <input type="text" value={activeItem.numberOf} onChange={e => handleActiveChange("numberOf", e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Rate */}
                <div className="flex items-end gap-6">
                  <div className="w-24 space-y-1">
                    <span className={labelCls}>Rate:</span>
                    <input type="text" value={activeItem.rate} onChange={e => handleActiveChange("rate", e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Miscellaneous Information */}
                <div className="space-y-1">
                  <span className={labelCls}>Miscellaneous Information:</span>
                  <textarea value={activeItem.misc} onChange={e => handleActiveChange("misc", e.target.value)} className="w-full h-14 p-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm outline-none text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none max-w-lg" />
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
