/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useParams } from "next/navigation";
import { Save } from "lucide-react";

interface Policy { id: number; policy_number?: string; policy_num?: string; term?: string; type?: string; status?: string; lobs?: any[]; eff_date?: string; exp_date?: string; effDate?: string; expDate?: string; }

export default function NewCertPropPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Form Selection Filters
  const [certNum, setCertNum] = useState("CP2662400101");
  const [assignNumber, setAssignNumber] = useState(true);
  const [description, setDescription] = useState("");
  const [showToInsured, setShowToInsured] = useState(false);

  // Property type of insurance
  const [selectedPropPolicy, setSelectedPropPolicy] = useState("");
  const [propDetailDate, setPropDetailDate] = useState("");
  const [selectedPropRows, setSelectedPropRows] = useState<Set<number>>(new Set([1]));
  const propRows = [
    { id: 1, risk: "Items", details: "Personal computers 0001..." },
    { id: 2, risk: "Location", details: "0001 51540 CEDAR RD L.." },
  ];

  // Inland Marine
  const [inlandMarinePolicy, setInlandMarinePolicy] = useState("");
  const [inlandMarineDate, setInlandMarineDate] = useState("");
  const [inlandMarineSection, setInlandMarineSection] = useState("");

  // Crime / Boiler / Other
  const [crimePolicy, setCrimePolicy] = useState("");
  const [crimeDate, setCrimeDate] = useState("");
  const [boilerPolicy, setBoilerPolicy] = useState("");
  const [boilerDate, setBoilerDate] = useState("");
  const [otherPolicy, setOtherPolicy] = useState("");
  const [otherDate, setOtherDate] = useState("");

  // Special Conditions
  const [selectedDefaultText, setSelectedDefaultText] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");

  // Note/Message
  const [noteMessage, setNoteMessage] = useState("");
  const [printNote, setPrintNote] = useState(true);

  // Authorized Rep
  const [authRep, setAuthRep] = useState("");

  const togglePropRow = (id: number) => {
    setSelectedPropRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  useEffect(() => {
    document.title = "Certificate of Property Insurance";
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || !customerId) return;
      try {
        const [custRes, polRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (custRes.ok) setCustomer(await custRes.json());
        if (polRes.ok) setPolicies(await polRes.json());
      } catch {}
    };
    fetchData();
  }, [customerId]);

  const agencyName = "Gamaty Insurance Agency LLC";

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: description || certNum,
          form_type: "Certificates",
          certType: "Property",
          form_data: { specialConditions, noteMessage, certNum, selectedPropPolicy },
        }),
      });
      const newCert = await res.json();
      if (window.opener) window.opener.postMessage({ type: "CREATE_CERTIFICATE", payload: { id: newCert.id, name: newCert.description } }, "*");
      window.close();
    } catch {
      if (window.opener) window.opener.postMessage({ type: "CREATE_CERTIFICATE", payload: { id: Date.now(), name: description || certNum } }, "*");
      window.close();
    }
  };

  const policyOptions = policies.length > 0
    ? policies.map(p => { 
        const num = p.policy_number || p.policy_num || `Policy ${p.id}`; 
        const displayType = p.lobs && p.lobs.length > 1 ? "Package" : (p.lobs && p.lobs.length === 1 ? (p.lobs[0]?.type || p.lobs[0]?.level || p.type) : p.type);
        const eDate = p.eff_date || p.effDate;
        const xDate = p.exp_date || p.expDate;
        const dateStr = (eDate && xDate) ? `${eDate} to ${xDate}` : (p.term && p.term.indexOf("Month") === -1 ? p.term : "");
        return (
          <option key={p.id} value={String(p.id)}>
            {num}{displayType ? `, ${displayType}` : ""}{p.status ? `, ${p.status}` : ""}{dateStr ? `, ${dateStr}` : ""}
          </option>
        ); 
      })
    : [<option key="demo" value="demo">46-CF818413, 8/14/2023</option>];

  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white border-b border-border-main px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-extrabold text-text-main tracking-tight">New Certificate of Property</h2>
          <p className="text-[11px] font-semibold text-text-muted mt-0.5">
            Select which form you wish to create, as well as appropriate policies &amp; types of insurance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
            <Save size={13} /><span>Save</span>
          </button>
          <button onClick={handleCreate} className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20">
            Create
          </button>
          <div className="h-5 w-px bg-border-main mx-1" />
          <button onClick={() => window.close()} className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
            Cancel
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6 flex gap-6">

        {/* LEFT COLUMN */}
        <div className="flex-1 max-w-[520px] flex flex-col gap-6">

          {/* Form Selection Filters */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Form Selection Filters</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-text-main">Form:</label>
              <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                <option>Certificate of Property Insurance, 24</option>
                <option>Certificate of Property Insurance, 28</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Certificate #:</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={certNum} onChange={e => setCertNum(e.target.value)} className="flex-1 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-text-main cursor-pointer shrink-0">
                    <input type="checkbox" checked={assignNumber} onChange={e => setAssignNumber(e.target.checked)} className="accent-primary w-3.5 h-3.5" /> Assign
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Description:</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
                <input type="checkbox" checked={showToInsured} onChange={e => setShowToInsured(e.target.checked)} className="accent-primary w-4 h-4" /> Show to Insured
              </label>
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-semibold text-text-main">Issue Date:</label>
                <input type="text" defaultValue="7/2/2026" className="w-24 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-center" />
              </div>
            </div>
          </div>

          {/* Type of Insurance */}
          <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border-main/50">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Type of Insurance</h3>
            </div>

            {/* PROPERTY */}
            <div className="p-5 border-b border-border-main/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-bold text-primary uppercase tracking-wide">Property</span>
                <span className="text-[11px] font-semibold text-text-muted">Get detail based on:</span>
              </div>
              <div className="grid grid-cols-[64px_1fr_100px] gap-x-3 gap-y-0 items-center mb-3">
                <label className="text-[13px] font-semibold text-text-main">Policy #:</label>
                <select value={selectedPropPolicy} onChange={e => setSelectedPropPolicy(e.target.value)} className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option value="">Select policy...</option>
                  {policyOptions}
                </select>
                <input type="text" value={propDetailDate} onChange={e => setPropDetailDate(e.target.value)} placeholder="7/2/2026" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-2 py-2 outline-none focus:border-primary text-center" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setSelectedPropRows(new Set(propRows.map(r => r.id)))} className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-1.5 transition-all cursor-pointer">Select All</button>
                <button onClick={() => setSelectedPropRows(new Set())} className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-1.5 transition-all cursor-pointer">Clear All</button>
              </div>
              <div className="border border-border-main rounded-xl overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-secondary/40">
                    <tr className="border-b border-border-main">
                      <th className="px-3 py-2 w-10 font-bold text-text-muted text-center">Select</th>
                      <th className="px-3 py-2 border-l border-border-main font-bold text-text-muted">Risk</th>
                      <th className="px-3 py-2 border-l border-border-main font-bold text-text-muted">Details</th>
                      <th className="px-3 py-2 border-l border-border-main font-bold text-text-muted">Subject of Ins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propRows.map((row, idx) => {
                      const sel = selectedPropRows.has(row.id);
                      return (
                        <tr key={row.id} onClick={() => togglePropRow(row.id)}
                          className={`border-b border-border-main/30 cursor-pointer transition-colors ${sel ? "bg-secondary/40" : idx % 2 === 0 ? "bg-white" : "bg-bg-base/50"} hover:bg-secondary/20`}>
                          <td className="px-3 py-2 text-center"><input type="checkbox" checked={sel} onChange={() => togglePropRow(row.id)} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 accent-primary rounded" /></td>
                          <td className="px-3 py-2 border-l border-border-main/30 font-semibold text-text-main">{row.risk}</td>
                          <td className="px-3 py-2 border-l border-border-main/30 text-text-muted">{row.details}</td>
                          <td className={`px-3 py-2 border-l border-border-main/30 ${sel ? "bg-primary text-white" : ""}`}></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INLAND MARINE */}
            <div className="p-5 border-b border-border-main/40 bg-bg-base/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-bold text-text-main uppercase tracking-wide">Inland Marine</span>
                <span className="text-[11px] font-semibold text-text-muted">Get detail based on:</span>
              </div>
              <div className="grid grid-cols-[120px_1fr_100px] gap-x-3 gap-y-3 items-center">
                <label className="text-[13px] font-semibold text-text-main">Policy #:</label>
                <select value={inlandMarinePolicy} onChange={e => setInlandMarinePolicy(e.target.value)} className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="">—</option>{policyOptions}
                </select>
                <input type="text" value={inlandMarineDate} onChange={e => setInlandMarineDate(e.target.value)} className="w-full text-[13px] font-semibold bg-white border border-border-main rounded-xl px-2 py-2 outline-none focus:border-primary text-center" placeholder="Date" />

                <label className="text-[13px] font-semibold text-text-main leading-tight">Data Entry Section:</label>
                <select value={inlandMarineSection} onChange={e => setInlandMarineSection(e.target.value)} className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="">—</option>
                </select>
                <div />
              </div>
            </div>

            {/* CRIME / BOILER / OTHER */}
            <div className="p-5">
              <div className="grid grid-cols-[120px_1fr_100px] gap-x-3 gap-y-0 mb-3 items-end">
                <span />
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest text-center">Policy #</span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest text-center leading-tight">Get detail<br />based on:</span>
              </div>
              {[
                { label: "Crime", policy: crimePolicy, setPolicy: setCrimePolicy, date: crimeDate, setDate: setCrimeDate },
                { label: "Boiler & Machinery", policy: boilerPolicy, setPolicy: setBoilerPolicy, date: boilerDate, setDate: setBoilerDate },
                { label: "Other", policy: otherPolicy, setPolicy: setOtherPolicy, date: otherDate, setDate: setOtherDate },
              ].map(({ label, policy, setPolicy, date, setDate }) => (
                <div key={label} className="grid grid-cols-[120px_1fr_100px] gap-x-3 gap-y-0 mt-3 items-center">
                  <label className="text-[13px] font-semibold text-text-main">{label}:</label>
                  <select value={policy} onChange={e => setPolicy(e.target.value)} className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary appearance-none cursor-pointer">
                    <option value="">—</option>{policyOptions}
                  </select>
                  <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full text-[13px] font-semibold bg-bg-base border border-border-main rounded-xl px-2 py-2 outline-none focus:border-primary text-center" placeholder="Date" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 max-w-[500px]">

          {/* Special Conditions */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col flex-1 min-h-[240px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Special Conditions</h3>
              <a href="#" className="text-[11px] font-bold text-primary hover:underline">Text Setup</a>
            </div>
            <div className="flex gap-3 mb-4 items-center">
              <label className="text-[13px] font-semibold text-text-main shrink-0">Default Text:</label>
              <select value={selectedDefaultText} onChange={e => setSelectedDefaultText(e.target.value)}
                className="flex-1 text-[13px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                <option value="">Select a default text...</option>
                <option value="Standard Property Language">Standard Property Language</option>
                <option value="Additional Conditions">Additional Conditions</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => { if (!selectedDefaultText) return; setSpecialConditions(prev => prev ? prev + "\n" + selectedDefaultText : selectedDefaultText); }}
                  className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-2 transition-all cursor-pointer">Insert</button>
                <button onClick={() => { if (!selectedDefaultText) return; setSpecialConditions(selectedDefaultText); }}
                  className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-2 transition-all cursor-pointer">Replace</button>
              </div>
            </div>
            <textarea value={specialConditions} onChange={e => setSpecialConditions(e.target.value)} placeholder="Enter special conditions..."
              className="flex-1 w-full border border-border-main bg-bg-base rounded-xl p-3 text-[13px] font-semibold text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" />
          </div>

          {/* Note / Message */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col h-[160px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Note / Message</h3>
              <label className="flex items-center gap-2 text-[12px] font-semibold text-text-main cursor-pointer">
                <input type="checkbox" checked={printNote} onChange={e => setPrintNote(e.target.checked)} className="accent-primary w-3.5 h-3.5" /> Print note with form
              </label>
            </div>
            <textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder="Enter note or message..."
              className="flex-1 w-full border border-border-main bg-bg-base rounded-xl p-3 text-[13px] font-semibold text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" />
          </div>

          {/* Authorized Representative Signature */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Authorized Representative Signature</h3>
            <select value={authRep} onChange={e => setAuthRep(e.target.value)}
              className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
              <option value="">Select representative...</option>
              <option value={agencyName}>{agencyName}</option>
            </select>
            <div className="flex gap-4 pt-1">
              <a href="#" className="text-[12px] font-bold text-primary hover:underline">Holder Detail</a>
              <a href="#" className="text-[12px] font-bold text-primary hover:underline">Copy Holder Detail</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}