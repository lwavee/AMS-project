"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Check, X, Save, Printer, Paperclip, ChevronDown, 
  ChevronRight, ChevronLeft, Plus, Minus, Play, Copy
} from "lucide-react";

export default function NewChangeRequestPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  // Accordion states
  const [openSection, setOpenSection] = useState({
    newChangeRequest: true,
    recipients: false,
    memoText: true
  });

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    document.title = `Policy Change Request`;
    
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
      <div className="bg-white flex flex-col shrink-0 border-b border-border-main shadow-sm z-10">
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
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0 z-10">
        <span className="font-bold text-amber-900 text-sm">Policy Change Request</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">Create</button>
          <button className="px-3 py-1 bg-white border border-border-main text-text-main text-[11px] font-bold rounded-lg hover:bg-secondary transition-colors shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Layout (Scrollable) ── */}
      <div className="flex-1 overflow-y-auto bg-bg-base pb-10">
        
        {/* Accordion 1: New Change Request */}
        <div className="mb-1">
          <div 
            onClick={() => toggleSection("newChangeRequest")}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50/50 border-b border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <ChevronDown size={14} className={`text-amber-700 transition-transform ${!openSection.newChangeRequest && '-rotate-90'}`} />
            <span className="font-bold text-amber-900 text-xs">New Change Request</span>
          </div>
          
          {openSection.newChangeRequest && (
            <div className="p-4 bg-white flex flex-col gap-5 border-b border-border-main shadow-sm">
              
              <div className="flex gap-8">
                {/* Left Side */}
                <div className="flex-1 flex flex-col gap-3 min-w-[350px]">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-text-muted w-24">Form Type:</label>
                    <div className="relative flex-1">
                      <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                        <option>AMS Change Request, 02/2005</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-text-muted w-24">Regarding:</label>
                    <input type="text" defaultValue="DNLD/Renew policy" className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-text-main" />
                  </div>

                  {/* Insured Group */}
                  <div className="border border-border-main rounded-xl p-3 flex flex-col gap-3 mt-1 bg-slate-50/50">
                    <span className="text-[10px] font-bold text-text-muted absolute -mt-5 ml-1 bg-white px-1">Insured</span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-primary cursor-pointer">
                        <input type="radio" name="insured" defaultChecked className="w-4 h-4 rounded-full text-primary accent-primary" />
                        Customer
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-text-muted cursor-pointer">
                        <input type="radio" name="insured" className="w-4 h-4 rounded-full text-primary accent-primary" />
                        Policy, First Named Insured
                      </label>
                    </div>
                    <input type="text" className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary text-text-main shadow-sm" />
                    <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer mt-1">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
                      Include Fax
                    </label>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <label className="text-xs font-bold text-text-muted w-24">Agency Contact:</label>
                    <div className="relative flex-1">
                      <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer"></select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex flex-col gap-3 min-w-[350px]">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-text-muted w-24">Request Type:</label>
                    <div className="relative flex-1">
                      <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer"></select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Company Group */}
                  <div className="border border-border-main rounded-xl p-3 flex flex-col gap-3 mt-10 bg-slate-50/50">
                    <span className="text-[10px] font-bold text-text-muted absolute -mt-5 ml-1 bg-white px-1">Company</span>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-text-muted w-14">Name:</label>
                      <div className="relative flex-1">
                        <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"></select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-text-muted w-14">Address:</label>
                      <div className="relative flex-1">
                        <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"></select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer mt-1">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
                      Include Fax
                    </label>
                  </div>
                </div>
              </div>

              {/* Full Width Textareas */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted">Agency Message:</label>
                  <textarea className="w-full h-24 border border-border-main rounded-xl bg-white p-3 text-xs font-semibold outline-none focus:border-primary resize-none text-text-main shadow-sm"></textarea>
                </div>
                
                <div className="flex flex-col gap-1.5 bg-slate-50/50 border border-border-main rounded-xl p-3">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-text-muted">Note/Message</label>
                    <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
                      Print note with form
                    </label>
                  </div>
                  <textarea className="w-full h-24 border border-border-main rounded-lg bg-white p-3 text-xs font-semibold outline-none focus:border-primary resize-none text-text-main shadow-sm"></textarea>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Accordion 2: Recipients */}
        <div className="mb-1">
          <div 
            onClick={() => toggleSection("recipients")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 border-y border-border-main cursor-pointer hover:bg-slate-200/50 transition-colors"
          >
            <ChevronRight size={14} className={`text-primary transition-transform ${openSection.recipients && 'rotate-90'}`} />
            <span className="font-bold text-text-main text-xs">Recipients</span>
          </div>
          {openSection.recipients && (
            <div className="p-4 bg-white border-b border-border-main h-32 flex items-center justify-center text-text-muted text-xs font-semibold">
              No recipients loaded.
            </div>
          )}
        </div>

        {/* Accordion 3: Memo Text */}
        <div className="mb-1">
          <div 
            onClick={() => toggleSection("memoText")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500 border-y border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors text-white shadow-inner"
          >
            <ChevronDown size={14} className={`text-white transition-transform ${!openSection.memoText && '-rotate-90'}`} />
            <span className="font-bold text-xs">Memo Text</span>
          </div>
          
          {openSection.memoText && (
            <div className="p-4 bg-white flex flex-col gap-4 border-b border-border-main shadow-sm pb-10">
              
              <div className="border border-border-main rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50 w-[550px]">
                <span className="text-[10px] font-bold text-text-muted absolute -mt-6 ml-1 bg-white px-1">Policy Comparison</span>
                
                <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer">
                  <input type="radio" name="comparison" defaultChecked className="w-4 h-4 rounded-full text-primary accent-primary" />
                  Insert Most Recent Changes
                </label>
                
                <div className="flex flex-col gap-3 ml-6 mt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-main cursor-pointer -ml-6">
                    <input type="radio" name="comparison" className="w-4 h-4 rounded-full text-primary accent-primary" />
                    Insert Changes From Policy Comparison Against
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-text-muted w-14 text-right">Policy:</label>
                    <div className="relative flex-1">
                      <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"></select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-text-muted w-14 text-right">Eff. Date:</label>
                    <div className="relative flex-1">
                      <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"></select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 bg-white hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors shadow-sm">Insert Changes</button>
                      <button className="px-4 py-1.5 bg-white hover:bg-secondary/70 border border-border-main rounded-lg text-xs font-bold text-text-main transition-colors shadow-sm">Clear All</button>
                    </div>
                  </div>
                </div>
              </div>

              <textarea className="w-1/2 h-64 border border-border-main rounded-xl bg-white p-3 text-xs font-semibold outline-none focus:border-primary resize-none text-text-main shadow-sm mt-2"></textarea>
            </div>
          )}
        </div>

      </div>

      {/* ── Status Bar ── */}
      <div className="bg-white border-t border-border-main h-9 px-4 flex items-center justify-end shrink-0 gap-4 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10">
        <button className="px-5 py-1.5 border border-border-main rounded-lg text-xs font-bold text-text-muted hover:bg-secondary transition-colors">Create</button>
        <div className="w-px h-4 bg-border-main" />
        <span className="text-[11px] text-text-muted font-semibold">Gamaty Insurance Agency LLC</span>
        <div className="w-px h-4 bg-border-main" />
        <span className="text-[11px] font-bold text-primary">AOR</span>
      </div>
    </div>
  );
}
