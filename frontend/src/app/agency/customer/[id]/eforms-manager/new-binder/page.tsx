/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Copy, Paperclip, Printer, Plus, Minus, ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function NewBinderFormPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `eForms - Linda Haddock - Policy #500242202700 Eff date 8/3/2025 to 8/3/2026`;
    
    const fetchCust = async () => {
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
        } catch (e) {}
      }
    };
    fetchCust();
  }, [customerId]);

  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans overflow-hidden select-none">
      
      {/* ── Modern Form Header ── */}
      <div className="bg-white border-b border-border-main px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-extrabold text-text-main tracking-tight">New Binder</h2>
          <p className="text-[11px] font-semibold text-text-muted mt-0.5">Linda Haddock • Policy #500242202700 • Eff: 8/3/2025 to 8/3/2026</p>
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
        
        <p className="text-[13px] text-text-muted mb-6 font-medium max-w-[800px] leading-relaxed">
          Select which form you wish to create, as well as appropriate risk & interest information.
        </p>

        {/* Top Section */}
        <div className="flex gap-6 mb-6">
          
          {/* Left Panel */}
          <div className="flex-1 max-w-[400px] flex flex-col gap-4">
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Form Selection</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Form:</label>
                <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option>Insurance Binder, 75, 03/2016</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Description:</label>
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Dates</h3>
              
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Eff Date:</label>
                  <input type="date" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="2025-08-03" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Eff Time:</label>
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-center" defaultValue="12:01 AM" />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Exp Date:</label>
                <input type="date" className="w-1/2 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="2025-09-02" />
              </div>
            </div>
          </div>

          {/* Right Panel (Available Lines) */}
          <div className="flex-1 max-w-[500px]">
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col h-full gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                Select from Available Lines of Business, then Click Load Risks
              </h3>
              
              <div className="flex flex-col gap-3 flex-1">
                <select multiple className="flex-1 w-full border border-border-main bg-bg-base rounded-xl text-[13px] font-semibold text-text-main p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 custom-scrollbar min-h-[120px]">
                  <option>Homeowners - HOME</option>
                </select>
                <button className="text-[13px] font-bold bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2 transition-all self-end shadow-sm shadow-primary/20">
                  Load Risks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Information Grid */}
        <div className="mb-6 flex flex-col flex-1 min-h-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Risk Information</h3>
            <div className="flex gap-2">
              <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Select All</button>
              <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Clear All</button>
            </div>
          </div>
          
          <div className="bg-white border border-border-main rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary/30 border-b border-border-main text-[11px] font-bold text-text-muted uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-[60px] text-center border-r border-border-main/50">Select</th>
                    <th className="px-4 py-3 w-[150px] border-r border-border-main/50">Risk</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Details</th>
                    <th className="px-4 py-3 w-[200px]">Subject of Ins.</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] font-semibold text-text-main divide-y divide-border-main/50">
                  {/* Empty state or rows go here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex gap-6 max-w-[924px]">
          {/* Note/Message */}
          <div className="flex-1 bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Note/Message</h3>
              <label className="flex items-center gap-2 text-[12px] font-semibold text-text-main cursor-pointer">
                <input type="checkbox" className="accent-primary w-3.5 h-3.5" defaultChecked /> Print note with form
              </label>
            </div>
            <textarea className="w-full flex-1 min-h-[80px] border border-border-main bg-bg-base rounded-xl text-[13px] font-semibold text-text-main p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" />
          </div>

          {/* Signature to use */}
          <div className="flex-1 bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Signature to use</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main w-32 cursor-pointer">
                  <input type="radio" name="signature" className="accent-primary w-4 h-4" defaultChecked /> Select from List:
                </label>
                <select className="flex-1 border border-border-main text-[13px] font-semibold text-text-muted p-2 rounded-xl bg-secondary/30 appearance-none cursor-not-allowed" disabled></select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main w-32 cursor-pointer">
                  <input type="radio" name="signature" className="accent-primary w-4 h-4" /> Manual:
                </label>
                <input type="text" className="flex-1 border border-border-main bg-white text-[13px] font-semibold text-text-main p-2 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            
            <div className="flex gap-4 mt-auto pt-2">
              <button className="text-[12px] font-bold text-primary hover:underline">Interest Detail</button>
              <button className="text-[12px] font-bold text-primary hover:underline">Copy Interest Detail</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
