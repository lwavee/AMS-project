"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Check, X, FileText, Save, Printer, 
  Paperclip, ChevronDown, ChevronRight, ChevronLeft, Plus, Minus, Play, Copy
} from "lucide-react";

export default function NewEpiPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `Evidence of Property`;
    
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
      
      {/* ── Modern Toolbar ── */}
      <div className="bg-white flex flex-col shrink-0 border-b border-border-main shadow-sm">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border-main/50">
          {["File", "Edit", "eForms", "View", "Operation", "Toolbox", "Help"].map((item) => (
            <span key={item} className="text-xs font-semibold text-text-muted hover:text-primary cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50">
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Save size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Copy size={16} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-green-600 transition-all">
            <Check size={16} strokeWidth={3} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Paperclip size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Printer size={16} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Plus size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Minus size={16} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <ChevronRight size={16} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-green-600 transition-all">
            <Play size={16} className="fill-current" />
          </button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0">
        <span className="font-bold text-amber-900 text-sm">Evidence of Property</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">Create</button>
          <button className="px-3 py-1 bg-white border border-border-main text-text-main text-[11px] font-bold rounded-lg hover:bg-secondary transition-colors shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        <span className="text-[11px] font-bold text-text-main">Select which form you wish to create, as well as appropriate risk & interest information.</span>

        {/* Top Split Section */}
        <div className="flex gap-4">
          
          {/* Form Selection */}
          <div className="w-1/2 bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3 min-w-[350px]">
            <h3 className="text-xs font-bold text-text-main border-b border-border-main/50 pb-1.5 mb-1.5">Form Selection</h3>
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted w-24">Form:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer text-text-main">
                  <option>Evidence Of Property Insurance, 27, 03/21</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted w-24">Description:</label>
              <input type="text" className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-text-main" />
            </div>

            <div className="flex items-center mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
                Show to Insured
              </label>
            </div>
          </div>

          {/* Line of Business */}
          <div className="w-1/2 bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3 min-w-[350px]">
            <h3 className="text-[11px] font-bold text-text-main border-b border-border-main/50 pb-1.5 mb-1.5">Select from Available Line(s) of Business, then Click Load Risk</h3>
            
            <div className="flex gap-3 h-20">
              <div className="flex-1 border border-border-main rounded-lg bg-bg-base p-2 overflow-y-auto">
                <div className="text-xs font-semibold text-text-main cursor-pointer hover:bg-secondary/50 p-1 rounded">Business Auto - AUTOB</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button className="px-4 py-1.5 bg-secondary hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors shadow-sm">Load Risks</button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto self-end">
              <button className="px-3 py-1 bg-white hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors">Select All</button>
              <button className="px-3 py-1 bg-white hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors">Clear All</button>
            </div>
          </div>

        </div>

        {/* Risk Information Grid */}
        <div className="bg-white rounded-xl border border-border-main flex flex-col shadow-sm overflow-hidden h-40 shrink-0">
          <h3 className="text-xs font-bold text-text-main bg-slate-50 border-b border-border-main px-4 py-2">Risk Information</h3>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse text-[11px] font-semibold">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="border-b border-border-main text-text-muted">
                  <th className="px-3 py-2 w-16 text-center border-r border-border-main">Select</th>
                  <th className="px-3 py-2 border-r border-border-main">Risk</th>
                  <th className="px-3 py-2 border-r border-border-main">Details</th>
                  <th className="px-3 py-2">Subject of Ins.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-1.5 text-center border-r border-slate-100">
                    <input type="checkbox" className="rounded accent-primary" />
                  </td>
                  <td className="px-3 py-1.5 border-r border-slate-100"></td>
                  <td className="px-3 py-1.5 border-r border-slate-100"></td>
                  <td className="px-3 py-1.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Split Section */}
        <div className="flex gap-4 mb-4">
          
          {/* Note/Message */}
          <div className="w-1/2 bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3 h-40">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-1.5 mb-1.5">
              <h3 className="text-xs font-bold text-text-main">Note/Message</h3>
              <label className="flex items-center gap-1.5 text-xs font-bold text-text-main cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary accent-primary" />
                Print note with form
              </label>
            </div>
            <textarea className="flex-1 w-full border border-border-main rounded-lg bg-bg-base p-2 text-xs font-semibold outline-none focus:border-primary resize-none text-text-main"></textarea>
          </div>

          {/* Signature to use */}
          <div className="w-1/2 bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col h-40">
            <h3 className="text-xs font-bold text-text-main border-b border-border-main/50 pb-1.5 mb-3">Signature to use</h3>
            
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer w-28">
                  <input type="radio" name="signature" defaultChecked className="w-4 h-4 rounded-full text-primary accent-primary" />
                  Select from List:
                </label>
                <div className="relative flex-1">
                  <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                    <option></option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer w-28">
                  <input type="radio" name="signature" className="w-4 h-4 rounded-full text-primary accent-primary" />
                  Manual:
                </label>
                <input type="text" className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-text-main" />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-auto pt-3 border-t border-border-main/50">
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Holder Detail</span>
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Copy Holder Detail</span>
            </div>
          </div>

        </div>

      </div>

      {/* ── Status Bar ── */}
      <div className="bg-white border-t border-border-main h-9 px-4 flex items-center justify-end shrink-0 gap-4 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
        <button className="px-5 py-1.5 border border-border-main rounded-lg text-xs font-bold text-text-muted hover:bg-secondary transition-colors">Create</button>
        <div className="w-px h-4 bg-border-main" />
        <span className="text-[11px] text-text-muted font-semibold">Gamaty Insurance Agency LLC</span>
        <div className="w-px h-4 bg-border-main" />
        <span className="text-[11px] font-bold text-primary">AOR</span>
      </div>
    </div>
  );
}
