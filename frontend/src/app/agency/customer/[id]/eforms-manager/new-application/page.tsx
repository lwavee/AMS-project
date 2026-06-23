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
    <div className="flex flex-col h-screen bg-[#f0f0f0] font-sans overflow-hidden select-none">
      
      {/* ── Menu Bar ── */}
      <div className="bg-[#f0f0f0] flex items-center gap-4 px-2 py-1 border-b border-white shadow-sm shrink-0">
        {["File", "Edit", "eForms", "View", "Operation", "Toolbox", "Help"].map((item) => (
          <span key={item} className="text-[11px] text-text-main hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer select-none">
            {item}
          </span>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-[#f0f0f0] border-b border-border-main px-2 py-1 flex items-center gap-1 shrink-0">
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Save size={14} className="text-slate-700" />
        </button>
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Copy size={14} className="text-slate-700" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Paperclip size={14} className="text-slate-700" />
        </button>
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Printer size={14} className="text-slate-700" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Plus size={14} className="text-slate-700" />
        </button>
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Minus size={14} className="text-slate-700" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <ChevronLeft size={14} className="text-slate-700" />
        </button>
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <ChevronRight size={14} className="text-slate-700" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300">
          <Play size={14} className="text-green-600 fill-current" />
        </button>
      </div>

      {/* ── Form Header ── */}
      <div className="bg-[#fcd281] px-3 py-1 flex justify-between items-center shrink-0 border-b border-[#e1b764]">
        <h2 className="text-[13px] font-bold text-slate-900">Create Applications (Integrated)</h2>
        <div className="flex items-center gap-1">
          <button className="text-[10px] font-semibold bg-slate-300 hover:bg-slate-400 text-slate-800 px-2 py-[2px] rounded border border-slate-400 cursor-pointer shadow-sm">Create</button>
          <button onClick={() => window.close()} className="text-[10px] font-semibold bg-[#fcd281] hover:bg-[#e1b764] text-slate-800 px-2 py-[2px] rounded border border-[#e1b764] cursor-pointer shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Form Content ── */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col bg-[#f0f0f0]">
        
        <p className="text-[11px] text-slate-800 mb-4 font-medium leading-tight max-w-[800px]">
          Select which of the following Policy, Line of Business Applications, and Forms you would like automatically generated for this Policy and Transaction. System will default to the newest version of Application if a non-supported version exists. Changing the Default Application or Version will not update the Line of Business section on the Policy.
        </p>
        
        <div className="flex items-center gap-6 mb-2">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-800">
            <input type="checkbox" className="opacity-60" disabled /> Policy Information
          </label>
          <div className="flex gap-2">
            <button className="text-[11px] bg-[#f0f0f0] hover:bg-slate-200 border border-slate-400 px-3 py-[2px] rounded-sm">Select All</button>
            <button className="text-[11px] bg-[#f0f0f0] hover:bg-slate-200 border border-slate-400 px-3 py-[2px] rounded-sm">Clear All</button>
          </div>
        </div>

        {/* ── Data Grid ── */}
        <div className="border border-slate-400 bg-white flex-1 overflow-auto flex flex-col max-w-[1200px]">
          
          {/* Grid Header */}
          <div className="grid grid-cols-[60px_300px_1fr_100px] bg-[#f0f0f0] border-b border-slate-400 text-[11px] font-semibold text-slate-800 sticky top-0">
            <div className="border-r border-slate-400 p-1 flex items-center justify-center">Select</div>
            <div className="border-r border-slate-400 p-1 flex items-center">Line Of Business</div>
            <div className="border-r border-slate-400 p-1 flex items-center">Default Application</div>
            <div className="p-1 flex items-center">Version</div>
          </div>

          {/* Row 1 (Selected) */}
          <div className="grid grid-cols-[60px_300px_1fr_100px] border-b border-slate-300 text-[11px] text-slate-800 bg-[#0078d7] text-white">
            <div className="border-r border-slate-300 p-1 flex items-center justify-center relative">
              <span className="absolute left-1 text-[8px]">▶</span>
              <input type="checkbox" className="bg-white" />
            </div>
            <div className="border-r border-slate-300 p-1 flex items-center"></div>
            <div className="border-r border-slate-300 p-1 flex items-center">Commercial Insurance Application</div>
            <div className="p-1 flex items-center">03/2016</div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-[60px_300px_1fr_100px] border-b border-slate-300 text-[11px] text-slate-800">
            <div className="border-r border-slate-300 p-1 flex items-center justify-center">
              <input type="checkbox" />
            </div>
            <div className="border-r border-slate-300 p-1 flex items-center">Miscellaneous Professional Liability - Pollution Liability</div>
            <div className="border-r border-slate-300 p-1 flex items-center">Commercial General Liability Section</div>
            <div className="p-1 flex items-center">09/2016</div>
          </div>

          {/* Empty Space filler */}
          <div className="flex-1 bg-white"></div>
        </div>

      </div>

      {/* ── Status Bar ── */}
      <div className="bg-[#f0f0f0] border-t border-slate-300 h-6 px-4 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-slate-600">Create</span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-600">
            {customer?.division || "Gamaty Insurance Agency LLC"}
          </span>
          <div className="w-px h-3 bg-slate-300" />
          <span className="text-[10px] font-bold text-slate-700">AOR</span>
        </div>
      </div>
    </div>
  );
}
