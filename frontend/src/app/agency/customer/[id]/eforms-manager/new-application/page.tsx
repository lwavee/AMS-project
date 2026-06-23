/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Copy, Paperclip, Printer, Plus, Minus, ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function NewApplicationFormPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `eForms - Policy #EGL0013969 Eff date 2/3/2026 to 2/3/2027`;
    
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
          <h2 className="text-base font-extrabold text-text-main tracking-tight">Create Applications (Integrated)</h2>
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
        
        <p className="text-[13px] text-text-muted mb-6 font-medium max-w-[800px] leading-relaxed">
          Select which of the following Policy, Line of Business Applications, and Forms you would like automatically generated for this Policy and Transaction. System will default to the newest version of Application if a non-supported version exists. Changing the Default Application or Version will not update the Line of Business section on the Policy.
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer opacity-60">
            <input type="checkbox" className="accent-primary w-4 h-4" disabled /> Policy Information
          </label>
          <div className="flex gap-2">
            <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Select All</button>
            <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Clear All</button>
          </div>
        </div>

        {/* ── Modern Data Grid ── */}
        <div className="bg-white border border-border-main rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b border-border-main text-[11px] font-bold text-text-muted uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-[60px] text-center border-r border-border-main/50">Select</th>
                  <th className="px-4 py-3 w-[300px] border-r border-border-main/50">Line Of Business</th>
                  <th className="px-4 py-3 border-r border-border-main/50">Default Application</th>
                  <th className="px-4 py-3 w-[100px]">Version</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-text-main divide-y divide-border-main/50">
                
                {/* Row 1 (Selected) */}
                <tr className="hover:bg-secondary/20 transition-colors bg-secondary/10">
                  <td className="px-4 py-3 text-center border-r border-border-main/50">
                    <input type="checkbox" className="accent-primary w-4 h-4" defaultChecked />
                  </td>
                  <td className="px-4 py-3 border-r border-border-main/50 text-text-muted"></td>
                  <td className="px-4 py-3 border-r border-border-main/50">Commercial Insurance Application</td>
                  <td className="px-4 py-3 text-text-muted">03/2016</td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-center border-r border-border-main/50">
                    <input type="checkbox" className="accent-primary w-4 h-4" />
                  </td>
                  <td className="px-4 py-3 border-r border-border-main/50">Miscellaneous Professional Liability - Pollution Liability</td>
                  <td className="px-4 py-3 border-r border-border-main/50">Commercial General Liability Section</td>
                  <td className="px-4 py-3 text-text-muted">09/2016</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
