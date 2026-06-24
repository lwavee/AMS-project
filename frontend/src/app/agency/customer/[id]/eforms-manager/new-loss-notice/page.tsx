/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Check, Save, Printer, Paperclip, ChevronDown, 
  ChevronRight, ChevronLeft, Plus, Minus, Play, Copy
} from "lucide-react";

export default function NewLossNoticePage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `Loss Notice`;
    
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
        <span className="font-bold text-amber-900 text-sm">Loss Notice</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">Create</button>
          <button className="px-3 py-1 bg-white border border-border-main text-text-main text-[11px] font-bold rounded-lg hover:bg-secondary transition-colors shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 overflow-y-auto bg-bg-base p-4">
        
        <p className="text-[11px] font-bold text-text-main mb-4">
          Select which form you wish to create, as well as risk information.
        </p>

        <div className="w-full max-w-[600px] flex flex-col gap-5">
          
          {/* Claim Selection Box */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm relative pt-6">
            <span className="text-[10px] font-bold text-text-muted absolute top-0 -mt-2 ml-1 bg-white px-1 border-x border-t border-transparent rounded-t-sm">Claim Selection</span>
            
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-red-600 w-12">Claim:</label>
              <input type="text" className="w-[300px] h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary text-text-main shadow-sm" />
              <div className="flex flex-col gap-0.5 ml-2">
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer leading-tight">Search</span>
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer leading-tight">New Claim</span>
              </div>
            </div>
          </div>

          {/* Form Selection Box */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm relative pt-6">
            <span className="text-[10px] font-bold text-text-muted absolute top-0 -mt-2 ml-1 bg-white px-1 border-x border-t border-transparent rounded-t-sm">Form Selection</span>
            
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-red-600 w-12">Form:</label>
              <div className="relative w-[300px]">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-sm">
                  <option></option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

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
