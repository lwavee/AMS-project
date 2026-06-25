/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Copy, Paperclip, Printer, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

export default function NewCertificateFormPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedDefaultText, setSelectedDefaultText] = useState("");
  const [descriptionOfOperations, setDescriptionOfOperations] = useState("");

  useEffect(() => {
    document.title = `eForms - Policy #EGL0013969 Eff date 2/3/2026 to 2/3/2027`;
    
    // Fetch basic customer info to populate
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (token && customerId) {
        try {
          const res = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCustomer(data);
          }
          const polRes = await fetch(`http://localhost:8000/api/customers/${customerId}/policies`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (polRes.ok) {
            const polData = await polRes.json();
            setPolicies(polData);
          }
        } catch (e) {}
      }
    };
    fetchData();
  }, [customerId]);

  const customerName = customer 
    ? (customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" "))
    : "KH Interiors, Inc.";

  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans overflow-hidden">
      
      {/* ── Modern Form Header ── */}
      <div className="bg-white border-b border-border-main px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-extrabold text-text-main tracking-tight">New Certificate of Liability</h2>
          <p className="text-[11px] font-semibold text-text-muted mt-0.5">Policy #EGL0013969 • Eff: 2/3/2026 to 2/3/2027</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
            <Save size={13} />
            <span>Save</span>
          </button>
          <button className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20">
            Create
          </button>
          <div className="h-5 w-px bg-border-main mx-1"></div>
          <button onClick={() => window.close()} className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
            Cancel
          </button>
        </div>
      </div>

      {/* ── Main Form Content ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
        <p className="text-[13px] text-text-muted mb-6 font-medium max-w-[800px] leading-relaxed">Select which form you wish to create, as well as appropriate policies & types of insurance.</p>
        
        <div className="flex gap-6 max-w-[1000px]">
          {/* Left Column */}
          <div className="flex-1 max-w-[500px] flex flex-col gap-6">
            {/* Form Selection Filters */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Form Selection Filters</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Form:</label>
                <select defaultValue="12/2025" className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option value="12/2025">Certificate of Liability Insurance, 25, 12/2025</option>
                  <option value="03/2016">Certificate of Liability Insurance, 25, 03/2016</option>
                  <option value="30/2016">Certificate of Garage Insurance, 30, 03/2016</option>
                  <option value="22/2016">Intermodal Interchange Certificate of Insurance, 22, 03/2016</option>
                  <option value="22/04/2012">Intermodal Interchange Certificate of Insurance, 22, 04/2012</option>

                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Certificate #:</label>
                  <div className="flex items-center gap-3">
                    <input type="text" defaultValue="CL2662208991" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                    <label className="flex items-center gap-2 text-[12px] font-semibold text-text-main cursor-pointer shrink-0">
                      <input type="checkbox" className="accent-primary w-3.5 h-3.5" defaultChecked /> Assign
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Description:</label>
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
                  <input type="checkbox" className="accent-primary w-4 h-4" /> Show to Insured
                </label>
                <div className="flex items-center gap-3">
                  <label className="text-[13px] font-semibold text-text-main">Issue Date:</label>
                  <input type="text" defaultValue="6/22/2026" className="w-24 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-center" />
                </div>
              </div>
            </div>

            {/* Type of Insurance */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Type of Insurance</h3>
              <div className="grid grid-cols-[140px_1fr_90px] gap-x-3 gap-y-2 mb-2 items-end">
                <span></span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest text-center">Policy #</span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest text-center leading-tight">Get detail<br/>based on:</span>
              </div>
              {[
                  { label: "General Liability" },
                  { label: "Automobile" },
                  { label: "Cargo" }, 
                  { label: "Trailer Interchange" },
                  { label: "Work Comp/Emp Liability" },
                  { label: "Garage Liability" },
                  { label: "Garage Keepers Liability" },
                  { label: "Umbrella/Excess Liability" },
                  { label: "Other" }
              ].map((row, i) => {
                const hasPolicies = policies.length > 0;
                return (
                <div key={i} className="grid grid-cols-[140px_1fr_90px] gap-x-3 gap-y-2 mt-2 items-center">
                  <label className="text-[12px] font-semibold text-text-main">{row.label}:</label>
                  <select className={`w-full text-[12px] font-semibold border rounded-xl px-2 py-1.5 outline-none truncate cursor-pointer appearance-none ${hasPolicies ? 'border-border-main bg-white focus:border-primary focus:ring-1 focus:ring-primary/20' : 'border-transparent bg-secondary/50 text-text-muted cursor-not-allowed'}`} disabled={!hasPolicies}>
                    {!hasPolicies ? (
                      <option>No policies available</option>
                    ) : (
                      <option value="">Select policy...</option>
                    )}
                    {policies.map((p, idx) => {
                      const termSplit = p.term ? p.term.split(" - ") : [];
                      const effDate = termSplit[0] || "";
                      const expDate = termSplit[1] || "";
                      return (
                        <option key={idx} value={p.policy_num}>
                          {p.policy_num}{effDate ? `, ${effDate}` : ""}{expDate ? `, ${expDate}` : ""}{p.type ? `, ${p.type}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <input type="text" defaultValue={hasPolicies && policies[0].term ? policies[0].term.split(" - ")[0] : ""} className={`w-full text-[12px] font-semibold border rounded-xl px-2 py-1.5 outline-none text-center ${hasPolicies ? 'border-border-main bg-white focus:border-primary focus:ring-1 focus:ring-primary/20' : 'border-transparent bg-secondary/50 text-text-muted cursor-not-allowed'}`} disabled={!hasPolicies} />
                </div>
              )})}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-6 max-w-[500px]">
            {/* Select Named Insured */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-2">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Select Named Insured</h3>
              <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                <option>{customerName} - 15009 SE 94th Ave.</option>
              </select>
            </div>

            {/* Description of Operations */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col flex-1 min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Description of Operations</h3>
                <a href="#" className="text-[11px] font-bold text-primary hover:underline">Text Setup</a>
              </div>
              
              <div className="flex gap-3 mb-4 items-center">
                <label className="text-[13px] font-semibold text-text-main shrink-0">Default Text:</label>
                <select 
                  value={selectedDefaultText}
                  onChange={(e) => setSelectedDefaultText(e.target.value)}
                  className="flex-1 text-[13px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">Select a default text to plug...</option>
                  <option value="AI">AI</option>
                  <option value="Verification of Insurance">Verification of Insurance</option>
                </select>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (!selectedDefaultText) return;
                      const textToAdd = selectedDefaultText === "AI" 
                        ? "Certificate Holder is listed as Additional Insured. ( Subject to all policy terms, exclusions and conditions )"
                        : "Verification of Insurance Coverage ( Subject to all policy terms, exclusions and conditions )";
                      setDescriptionOfOperations(prev => prev ? prev + "\n" + textToAdd : textToAdd);
                    }}
                    className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-2 transition-all cursor-pointer">Append</button>
                  <button 
                    onClick={() => {
                      if (!selectedDefaultText) return;
                      const textToAdd = selectedDefaultText === "AI" 
                        ? "Certificate Holder is listed as Additional Insured. ( Subject to all policy terms, exclusions and conditions )"
                        : "Verification of Insurance Coverage ( Subject to all policy terms, exclusions and conditions )";
                      setDescriptionOfOperations(textToAdd);
                    }}
                    className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-3 py-2 transition-all cursor-pointer">Replace</button>
                </div>
              </div>
              
              <textarea 
                value={descriptionOfOperations}
                onChange={(e) => setDescriptionOfOperations(e.target.value)}
                className="flex-1 w-full border border-border-main bg-bg-base rounded-xl p-3 text-[13px] font-semibold text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"></textarea>
            </div>

            {/* Note/Message */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col h-[150px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Note/Message</h3>
                <label className="flex items-center gap-2 text-[12px] font-semibold text-text-main cursor-pointer">
                  <input type="checkbox" className="accent-primary w-3.5 h-3.5" defaultChecked /> Print note with form
                </label>
              </div>
              <textarea className="flex-1 w-full border border-border-main bg-bg-base rounded-xl p-3 text-[13px] font-semibold text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"></textarea>
            </div>

            {/* Authorized Rep */}
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-2">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Authorized Representative Signature</h3>
              <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                <option>Select signature...</option>
              </select>
              
              <div className="flex gap-4 mt-3">
                <a href="#" className="text-[12px] font-bold text-primary hover:underline">Holder Detail</a>
                <a href="#" className="text-[12px] font-bold text-primary hover:underline">Copy Holder Detail</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
