"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Copy, Paperclip, Printer, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

export default function NewCertificateFormPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `eForms - Policy #EGL0013969 Eff date 2/3/2026 to 2/3/2027`;
    
    // Fetch basic customer info to populate
    const fetchCust = async () => {
      const token = localStorage.getItem("token");
      if (token) {
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
    if (customerId) fetchCust();
  }, [customerId]);

  const customerName = customer 
    ? (customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" "))
    : "KH Interiors, Inc.";

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] font-sans overflow-hidden">
      
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
      </div>

      {/* ── Form Header ── */}
      <div className="bg-[#fcd281] px-3 py-1 flex justify-between items-center shrink-0 border-b border-[#e1b764]">
        <h2 className="text-[13px] font-bold text-slate-900">Certificate of Liability</h2>
        <div className="flex items-center gap-1">
          <button className="text-[10px] font-semibold bg-slate-300 hover:bg-slate-400 text-slate-800 px-2 py-[2px] rounded border border-slate-400 cursor-pointer shadow-sm">Create</button>
          <button onClick={() => window.close()} className="text-[10px] font-semibold bg-[#fcd281] hover:bg-[#e1b764] text-slate-800 px-2 py-[2px] rounded border border-[#e1b764] cursor-pointer shadow-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Form Content ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <p className="text-[11px] text-slate-800 mb-4 font-medium">Select which form you wish to create, as well as appropriate policies & types of insurance.</p>
        
        <div className="flex gap-6 max-w-[1000px]">
          {/* Left Column */}
          <div className="flex-1 max-w-[450px] flex flex-col gap-4">
            {/* Form Selection Filters */}
            <div className="border border-slate-300 p-2 relative rounded bg-transparent">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[10px] text-slate-600">Form Selection Filters</span>
              <div className="flex items-center gap-2 mt-1">
                <label className="text-[11px] text-red-600 shrink-0">Form:</label>
                <select className="flex-1 text-[11px] border border-slate-300 rounded-sm px-1 py-0.5 outline-none bg-white">
                  <option>Certificate of Liability Insurance, 25, 12/2025</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] items-center gap-y-2 gap-x-2">
              <label className="text-[11px] text-slate-700 text-right">Certificate #:</label>
              <div className="flex items-center gap-4">
                <input type="text" defaultValue="CL2662208991" className="w-[120px] text-[11px] border border-slate-300 rounded-sm px-1 py-0.5 outline-none" />
                <label className="flex items-center gap-1 text-[11px] text-slate-800 cursor-pointer">
                  <input type="checkbox" defaultChecked /> Assign Number
                </label>
              </div>
              
              <label className="text-[11px] text-slate-700 text-right">Description:</label>
              <input type="text" className="w-[200px] text-[11px] border border-slate-300 rounded-sm px-1 py-0.5 outline-none" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1 text-[11px] text-slate-800 cursor-pointer pl-4">
                <input type="checkbox" /> Show to Insured
              </label>
              <div className="flex items-center gap-2 pr-10">
                <label className="text-[11px] text-slate-700">Issue Date:</label>
                <input type="text" defaultValue="6/22/2026" className="w-[80px] text-[11px] border border-slate-300 rounded-sm px-1 py-0.5 outline-none bg-white text-center" />
              </div>
            </div>

            {/* Type of Insurance */}
            <div className="mt-2">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Type of Insurance</h3>
              <div className="grid grid-cols-[130px_1fr_90px] gap-x-2 gap-y-1 mb-1 items-end">
                <span></span>
                <span className="text-[10px] text-slate-600 text-center">Policy #</span>
                <span className="text-[10px] text-slate-600 text-center leading-[1.1]">Get detail<br/>based on:</span>
              </div>
              {[
                { label: "General Liability", val1: "EGL0013969, 2/3/2", val2: "6/22/2026" },
                { label: "Automobile" },
                { label: "Cargo" },
                { label: "Trailer Interchange" },
                { label: "Work Comp/Emp Liability" },
                { label: "Garage Liability" },
                { label: "Garage Keepers Liability" },
                { label: "Umbrella/Excess Liability" },
                { label: "Other" }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[130px_1fr_90px] gap-x-2 gap-y-[3px] mt-1 items-center">
                  <label className="text-[11px] text-slate-700">{row.label}:</label>
                  <select className={`w-full text-[11px] border rounded-sm px-1 py-[2px] outline-none truncate ${row.val1 ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-200/50'}`}>
                    {row.val1 && <option>{row.val1}</option>}
                  </select>
                  <input type="text" defaultValue={row.val2 || ""} className={`w-full text-[11px] border rounded-sm px-1 py-[2px] outline-none text-center ${row.val2 ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-200/50'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Select Named Insured */}
            <div className="border border-slate-300 p-2 relative rounded bg-transparent">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[10px] text-slate-600">Select Named Insured</span>
              <select className="w-full text-[11px] border border-slate-300 rounded-sm px-1 py-1 mt-1 outline-none">
                <option>{customerName} - 15009 SE 94th Ave.</option>
              </select>
            </div>

            {/* Description of Operations */}
            <div className="border border-slate-300 p-2 relative rounded bg-transparent flex flex-col h-[160px]">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[10px] text-slate-600">Description of Operations</span>
              <div className="flex gap-2 mt-2 mb-2 items-start relative">
                <div className="flex items-center gap-1 flex-1">
                  <label className="text-[11px] text-slate-700 shrink-0">Default Text:</label>
                  <select className="flex-1 text-[11px] border border-[#7cbdf5] rounded-sm px-1 py-0.5 outline-none bg-[#e8f4fc]"></select>
                </div>
                {/* Tooltip imitation from screenshot */}
                <div className="absolute top-[22px] left-[70px] bg-white border border-slate-400 px-2 py-0.5 text-[10px] text-slate-600 shadow-sm z-10 whitespace-nowrap">
                  Select a default text to plug to Description of Operations.
                </div>
                <div className="flex flex-col gap-1 w-[60px]">
                  <button className="text-[10px] border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded py-[1px]">Insert</button>
                  <button className="text-[10px] border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded py-[1px]">Replace</button>
                </div>
              </div>
              <textarea className="flex-1 w-full border border-slate-300 rounded-sm p-1 text-[11px] outline-none resize-none mt-4"></textarea>
              <div className="flex justify-end mt-1">
                <a href="#" className="text-[10px] text-blue-700 hover:underline">Text Setup</a>
              </div>
            </div>

            {/* Note/Message */}
            <div className="border border-slate-300 p-2 relative rounded bg-transparent flex flex-col h-[110px]">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[10px] text-slate-600">Note/Message</span>
              <label className="flex items-center gap-1 text-[11px] text-slate-800 cursor-pointer mt-1 mb-1">
                <input type="checkbox" defaultChecked /> Print note with form
              </label>
              <textarea className="flex-1 w-full border border-slate-300 rounded-sm p-1 text-[11px] outline-none resize-none"></textarea>
            </div>

            {/* Authorized Rep */}
            <div className="border border-slate-300 p-2 relative rounded bg-transparent">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[10px] text-slate-600">Authorized Representative Signature:</span>
              <select className="w-[200px] text-[11px] border border-slate-300 rounded-sm px-1 py-0.5 mt-1 outline-none"></select>
            </div>

            <div className="flex gap-4 mt-1">
              <a href="#" className="text-[11px] text-blue-800 hover:underline font-medium">Holder Detail</a>
              <a href="#" className="text-[11px] text-blue-800 hover:underline font-medium">Copy Holder Detail</a>
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
