"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Check, X, FileText, Mail, Save, Printer, 
  Search, Paperclip, ChevronDown, ChevronRight, ChevronLeft, Plus, Minus, Play, Copy
} from "lucide-react";

export default function NewCertPropPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `Certificate of Property Insurance`;
    
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
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
        <span className="font-bold text-amber-900 text-[11px]">Select which form you wish to create, as well as appropriate policies & types of insurance.</span>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        
        {/* Left Column */}
        <div className="w-1/2 flex flex-col gap-4 min-w-[400px]">
          
          {/* Form Selection Filters */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-main border-b border-border-main/50 pb-1.5 mb-1.5">Form Selection Filters</h3>
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted w-24">Form:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                  <option>Certificate of Property Insurance, 24</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted w-24">Certificate #:</label>
              <input type="text" defaultValue="CP2662400101" className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary" />
              <label className="flex items-center gap-1.5 text-xs font-bold text-text-main cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary accent-primary" />
                Assign Number
              </label>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted w-24">Description:</label>
              <input type="text" className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-text-main cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
                Show to Insured
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-text-muted">Issue Date:</label>
                <input type="text" defaultValue="06/24/2026" className="w-28 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-center" />
              </div>
            </div>
          </div>

          {/* Type of Insurance */}
          <div className="bg-white rounded-xl border border-border-main flex flex-col shadow-sm overflow-hidden">
            <h3 className="text-xs font-bold text-text-main bg-slate-50 border-b border-border-main px-4 py-2">Type of Insurance</h3>
            
            {/* Property */}
            <div className="p-4 border-b border-border-main flex flex-col gap-3 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary">Property</h4>
                <label className="text-[10px] font-bold text-text-muted">Get detail based on:</label>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16">Policy #:</label>
                <div className="relative flex-1">
                  <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                    <option>6130122556341, 11</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                </div>
                <input type="text" defaultValue="6/24/2026" className="w-24 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-center" />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button className="px-3 py-1 bg-secondary text-text-main hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold transition-colors">Select All</button>
                <button className="px-3 py-1 bg-secondary text-text-main hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold transition-colors">Clear All</button>
              </div>

              <div className="border border-border-main rounded-lg overflow-hidden mt-1 h-32 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px] font-semibold">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-border-main text-text-muted">
                      <th className="px-2 py-1.5 w-8 text-center">Select</th>
                      <th className="px-2 py-1.5 border-l border-border-main">Risk</th>
                      <th className="px-2 py-1.5 border-l border-border-main">Details</th>
                      <th className="px-2 py-1.5 border-l border-border-main">Subject of Ins</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 bg-primary/10">
                      <td className="px-2 py-1 text-center"><input type="checkbox" defaultChecked className="rounded accent-primary" /></td>
                      <td className="px-2 py-1 border-l border-slate-100">Items</td>
                      <td className="px-2 py-1 border-l border-slate-100">Personal computers 0001...</td>
                      <td className="px-2 py-1 border-l border-slate-100 bg-primary text-white"></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-2 py-1 text-center"><input type="checkbox" className="rounded accent-primary" /></td>
                      <td className="px-2 py-1 border-l border-slate-100">Location</td>
                      <td className="px-2 py-1 border-l border-slate-100">0001 51540 CEDAR RD L..</td>
                      <td className="px-2 py-1 border-l border-slate-100"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inland Marine */}
            <div className="p-4 border-b border-border-main flex flex-col gap-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-text-main">Inland Marine</h4>
                <label className="text-[10px] font-bold text-text-muted">Get detail based on:</label>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16">Policy #:</label>
                <div className="relative flex-1">
                  <select className="w-full h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary appearance-none"></select>
                  <ChevronDown size={12} className="absolute right-2 top-1.5 text-text-muted pointer-events-none" />
                </div>
                <input type="text" className="w-24 h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16 leading-tight">Data Entry<br/>Section:</label>
                <div className="relative flex-1">
                  <select className="w-full h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary appearance-none"></select>
                  <ChevronDown size={12} className="absolute right-2 top-1.5 text-text-muted pointer-events-none" />
                </div>
                <div className="w-24"></div>
              </div>
            </div>

            {/* Others */}
            <div className="p-4 flex flex-col gap-2 bg-white">
              <div className="flex items-center justify-between">
                <div className="w-16"></div>
                <label className="text-[10px] font-bold text-text-muted w-32 text-center">Policy #</label>
                <label className="text-[10px] font-bold text-text-muted w-24 text-center">Get detail based on:</label>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16">Crime:</label>
                <div className="relative w-32">
                  <select className="w-full h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary appearance-none"></select>
                  <ChevronDown size={12} className="absolute right-2 top-1.5 text-text-muted pointer-events-none" />
                </div>
                <input type="text" className="w-24 h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary" />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16 leading-tight">Boiler &<br/>Machinery:</label>
                <div className="relative w-32">
                  <select className="w-full h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary appearance-none"></select>
                  <ChevronDown size={12} className="absolute right-2 top-1.5 text-text-muted pointer-events-none" />
                </div>
                <input type="text" className="w-24 h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary" />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted w-16">Other:</label>
                <div className="relative w-32">
                  <select className="w-full h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary appearance-none"></select>
                  <ChevronDown size={12} className="absolute right-2 top-1.5 text-text-muted pointer-events-none" />
                </div>
                <input type="text" className="w-24 h-7 px-2 text-[11px] font-semibold bg-white border border-border-main rounded outline-none focus:border-primary" />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col gap-4 min-w-[350px]">
          
          {/* Special Conditions */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-main border-b border-border-main/50 pb-1.5 mb-1.5">Special Conditions</h3>
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-muted whitespace-nowrap">Default Text:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer"></select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
              <button className="px-4 py-1.5 bg-secondary hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors">Insert</button>
              <button className="px-4 py-1.5 bg-secondary hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors">Replace</button>
            </div>

            <textarea className="w-full h-32 border border-border-main rounded-lg bg-bg-base p-2 text-xs font-semibold outline-none focus:border-primary resize-none"></textarea>
            
            <div className="flex justify-end">
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Text Setup</span>
            </div>
          </div>

          {/* Note/Message */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3 flex-1 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-1.5 mb-1.5">
              <h3 className="text-xs font-bold text-text-main">Note/Message</h3>
              <label className="flex items-center gap-1.5 text-xs font-bold text-text-main cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary accent-primary" />
                Print note with form
              </label>
            </div>
            <textarea className="flex-1 w-full border border-border-main rounded-lg bg-bg-base p-2 text-xs font-semibold outline-none focus:border-primary resize-none"></textarea>
          </div>

          {/* Authorized Representative Signature */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3">
            <label className="text-xs font-bold text-text-main">Authorized Representative Signature:</label>
            <div className="relative w-2/3">
              <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer"></select>
              <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
            </div>

            <div className="flex items-center gap-6 mt-2 pt-3 border-t border-border-main/50">
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
