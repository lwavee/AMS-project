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
        <h2 className="text-[13px] font-bold text-slate-900">Binder</h2>
        <div className="flex items-center gap-1">
          <button className="text-[10px] font-semibold bg-slate-300 hover:bg-slate-400 text-slate-800 px-2 py-[2px] rounded border border-slate-400 cursor-pointer shadow-sm">Create</button>
          <button onClick={() => window.close()} className="text-[10px] font-semibold bg-[#fcd281] hover:bg-[#e1b764] text-slate-800 px-2 py-[2px] rounded border border-[#e1b764] cursor-pointer shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Form Content ── */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col bg-[#f0f0f0]">
        
        <p className="text-[11px] text-slate-800 mb-3 font-medium leading-tight max-w-[800px]">
          Select which form you wish to create, as well as appropriate risk & interest information.
        </p>

        {/* Top Section */}
        <div className="flex gap-4 mb-4">
          
          {/* Left Panel */}
          <div className="w-[300px] flex flex-col gap-2">
            <div>
              <div className="text-[11px] text-slate-800 mb-1">Form Selection</div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-600 w-16 text-right">Form:</span>
                <select className="flex-1 text-[11px] border border-slate-400 p-0.5 rounded-sm">
                  <option>Insurance Binder, 75, 03/2016</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-800 w-16 text-right">Description:</span>
              <input type="text" className="flex-1 text-[11px] border border-slate-400 p-0.5 rounded-sm" />
            </div>

            <div>
              <div className="text-[11px] text-slate-800 mb-1">Dates</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-red-600 w-16 text-right">Eff Date:</span>
                <div className="flex-1 flex gap-2">
                  <input type="date" className="flex-1 text-[11px] border border-slate-400 p-0.5 rounded-sm" defaultValue="2025-08-03" />
                  <span className="text-[11px] text-slate-800 whitespace-nowrap">Eff Time:</span>
                  <input type="text" className="w-[60px] text-[11px] border border-slate-400 p-0.5 rounded-sm" defaultValue="12:01 AM" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-600 w-16 text-right">Exp Date:</span>
                <div className="flex-1">
                  <input type="date" className="w-[110px] text-[11px] border border-slate-400 p-0.5 rounded-sm" defaultValue="2025-09-02" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel (Available Lines) */}
          <div className="flex-1 max-w-[400px]">
            <div className="text-[11px] text-slate-800 mb-1">Select from Available Lines of Business, then Click Load Risks</div>
            <div className="flex gap-2 h-[80px]">
              <select multiple className="flex-1 border border-slate-400 text-[11px] p-1 rounded-sm">
                <option>Homeowners - HOME</option>
              </select>
              <button className="text-[11px] h-6 bg-[#f0f0f0] hover:bg-slate-200 border border-slate-400 px-3 py-0.5 rounded-sm whitespace-nowrap">Load Risks</button>
            </div>
          </div>
        </div>

        {/* Risk Information Grid */}
        <div className="mb-4 max-w-[700px]">
          <div className="flex items-end justify-between mb-1">
            <div className="text-[11px] text-slate-800">Risk Information</div>
            <div className="flex gap-2">
              <button className="text-[11px] bg-[#f0f0f0] hover:bg-slate-200 border border-slate-400 px-3 py-[2px] rounded-sm">Select All</button>
              <button className="text-[11px] bg-[#f0f0f0] hover:bg-slate-200 border border-slate-400 px-3 py-[2px] rounded-sm">Clear All</button>
            </div>
          </div>
          <div className="border border-slate-400 bg-white h-[100px] overflow-auto">
            <div className="grid grid-cols-[50px_100px_1fr_150px] bg-[#f0f0f0] border-b border-slate-400 text-[11px] font-semibold text-slate-800 sticky top-0">
              <div className="border-r border-slate-400 p-1 flex items-center justify-center">Select</div>
              <div className="border-r border-slate-400 p-1 flex items-center">Risk</div>
              <div className="border-r border-slate-400 p-1 flex items-center">Details</div>
              <div className="p-1 flex items-center">Subject of Ins.</div>
            </div>
            {/* Empty grid content */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex gap-8 max-w-[700px]">
          {/* Note/Message */}
          <div className="flex-1">
            <div className="text-[11px] text-slate-800 mb-1">Note/Message</div>
            <div className="mb-1">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-800">
                <input type="checkbox" defaultChecked /> Print note with form
              </label>
            </div>
            <textarea className="w-full h-[60px] border border-slate-400 rounded-sm text-[11px] p-1 resize-none" />
          </div>

          {/* Signature to use */}
          <div className="flex-1">
            <div className="text-[11px] text-slate-800 mb-2">Signature to use</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-800 w-24">
                  <input type="radio" name="signature" defaultChecked /> Select from List:
                </label>
                <select className="flex-1 border border-slate-400 text-[11px] p-0.5 rounded-sm bg-slate-100" disabled></select>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-800 w-24">
                  <input type="radio" name="signature" /> Manual:
                </label>
                <input type="text" className="flex-1 border border-slate-400 text-[11px] p-0.5 rounded-sm" />
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button className="text-[11px] text-blue-700 hover:underline">Interest Detail</button>
              <button className="text-[11px] text-blue-700 hover:underline">Copy Interest Detail</button>
            </div>
          </div>
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
