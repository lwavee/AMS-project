/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Check, X, FileText, Mail, Save, Printer, 
  Search, Paperclip, AlertCircle, ChevronDown
} from "lucide-react";

export default function NewEmailPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  
  // Dummy data for the table
  const recipients = [
    { id: 1, type: "Applicant", title: "Customer", firmName: "KH Interiors, Inc.", name: "Harreschou, Kolan", email: "khinteriorsinc@gmail.com", selected: true },
    { id: 2, type: "Brokerage", title: "First Nam...", firmName: "USG", name: "Addr Desc", email: "", selected: false },
    { id: 3, type: "Customer C...", title: "", firmName: "", name: "Kolan B. Harreschou", email: "", selected: false },
    { id: 4, type: "Dependent", title: "Insured", firmName: "", name: "Harreschou, Kolan B.", email: "", selected: false },
    { id: 5, type: "Policy Pers...", title: "Primary A...", firmName: "", name: "Weiner, Jake", email: "Jake@capcoinsurance...", selected: false },
    { id: 6, type: "Policy Pers...", title: "Primary A...", firmName: "", name: "Weiner, Jake", email: "Jake@capcoinsurance...", selected: false },
  ];

  useEffect(() => {
    document.title = `Email Recipients`;
    
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
          {["File", "Section", "Operation", "Toolbox", "Help"].map((item) => (
            <span key={item} className="text-xs font-semibold text-text-muted hover:text-primary cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50">
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-green-600 transition-all">
            <Check size={16} strokeWidth={3} />
          </button>
          <div className="w-px h-5 bg-border-main mx-1" />
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Save size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Printer size={16} />
          </button>
          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border-main hover:shadow-sm text-text-muted transition-all">
            <Paperclip size={16} />
          </button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
        <div className="bg-amber-500 w-2 h-2 rotate-45" />
        <span className="font-bold text-amber-900 text-sm">Recipient Selection</span>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Left Panel: Selection & Summary */}
        <div className="w-1/2 flex flex-col gap-4 min-w-[400px]">
          
          {/* Filters Card */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-primary w-16">Category:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                  <option>Customer/Policy</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-primary w-16">Name:</label>
              <input type="text" defaultValue="KH Interiors, Inc." className="flex-1 h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary" />
              <button className="text-xs font-bold text-primary hover:underline">Search</button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-primary w-16">Policy #:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-bg-base border border-border-main rounded-lg outline-none focus:border-primary appearance-none cursor-pointer">
                  <option>KHAU604377, 10/1/2025...</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Data Grid Card */}
          <div className="bg-white rounded-xl border border-border-main flex flex-col flex-1 shadow-sm overflow-hidden min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[11px] font-bold text-text-muted border-b border-border-main">
                    <th className="px-3 py-2 font-bold w-6 text-center"></th>
                    <th className="px-3 py-2 font-bold">Type</th>
                    <th className="px-3 py-2 font-bold">Title</th>
                    <th className="px-3 py-2 font-bold">Firm Name</th>
                    <th className="px-3 py-2 font-bold">Name</th>
                    <th className="px-3 py-2 font-bold">Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r, i) => (
                    <tr key={r.id} className={`text-[11px] font-semibold border-b border-slate-100 last:border-0 cursor-pointer ${r.selected ? "bg-primary/10" : "hover:bg-slate-50"}`}>
                      <td className="px-3 py-1.5 text-center">
                        <input type="checkbox" checked={r.selected} readOnly className="rounded text-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="px-3 py-1.5">{r.type}</td>
                      <td className="px-3 py-1.5 text-text-muted">{r.title}</td>
                      <td className="px-3 py-1.5">{r.firmName}</td>
                      <td className="px-3 py-1.5 text-text-muted">{r.name}</td>
                      <td className="px-3 py-1.5 text-primary">{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Information Card */}
          <div className="bg-white rounded-xl border border-border-main p-4 shadow-sm flex flex-col gap-2 shrink-0">
            <h3 className="text-xs font-bold text-primary border-b border-border-main/50 pb-1.5 mb-1.5">Summary Information</h3>
            <div className="flex gap-6">
              <div className="flex-1 text-xs text-text-main font-semibold leading-relaxed">
                KH Interiors, Inc.<br/>
                Kolan KH Interiors, Inc.<br/>
                15009 SE 94th Ave.<br/>
                Clackamas, OR 97015
              </div>
              <div className="flex-1 flex flex-col gap-1 text-xs">
                <div className="flex"><span className="w-20 font-bold text-text-muted">Email:</span><span className="font-semibold text-primary">khinteriorsinc@gmail.com</span></div>
                <div className="flex"><span className="w-20 font-bold text-text-muted">Residence:</span></div>
                <div className="flex"><span className="w-20 font-bold text-text-muted">Business:</span><span className="font-semibold">(503) 657-0028</span></div>
                <div className="flex"><span className="w-20 font-bold text-text-muted">Fax:</span><span className="font-semibold">(503) 657-7059</span></div>
                <div className="flex"><span className="w-20 font-bold text-text-muted">Cell:</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Mail Recipients */}
        <div className="w-1/2 flex flex-col bg-white rounded-xl border border-border-main p-5 shadow-sm min-w-[300px]">
          <h2 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            Mail Recipients
          </h2>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3">
              <button className="w-14 h-8 bg-secondary/50 text-text-muted text-xs font-bold rounded-lg border border-border-main flex items-center justify-center hover:bg-secondary transition-colors">To -{">"}</button>
              <textarea className="flex-1 h-16 border border-border-main rounded-lg bg-bg-base p-2 text-xs outline-none focus:border-primary resize-none font-semibold text-text-main" defaultValue="khinteriorsinc@gmail.com"></textarea>
            </div>
            <div className="flex gap-3">
              <button className="w-14 h-8 bg-secondary/50 text-text-muted text-xs font-bold rounded-lg border border-border-main flex items-center justify-center hover:bg-secondary transition-colors">Cc -{">"}</button>
              <textarea className="flex-1 h-16 border border-border-main rounded-lg bg-bg-base p-2 text-xs outline-none focus:border-primary resize-none font-semibold text-text-main"></textarea>
            </div>
            <div className="flex gap-3">
              <button className="w-14 h-8 bg-secondary/50 text-text-muted text-xs font-bold rounded-lg border border-border-main flex items-center justify-center hover:bg-secondary transition-colors">Bcc -{">"}</button>
              <textarea className="flex-1 h-16 border border-border-main rounded-lg bg-bg-base p-2 text-xs outline-none focus:border-primary resize-none font-semibold text-text-main"></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-xs font-bold text-primary">
              <span className="hover:underline cursor-pointer">Email</span>
              <span className="text-text-main">Includes Attachments</span>
            </div>
            <button className="px-4 py-1.5 border border-border-main rounded-lg text-xs font-bold text-text-muted hover:bg-secondary transition-colors bg-white shadow-sm">
              Clear
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-text-main mb-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary" />
            Send Using Plain Text Only
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-text-main mb-4 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary accent-primary" />
            Log Activity
          </label>

          {/* Activity Log Form */}
          <div className="bg-slate-50 border border-border-main rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="w-16 text-xs font-bold text-text-muted text-right">Center:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none">
                  <option>Customer</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 text-xs font-bold text-text-muted text-right">Name:</label>
              <input type="text" defaultValue="KH Interiors, Inc." className="flex-1 h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary" />
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Search</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 text-xs font-bold text-text-muted text-right">Policy #:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none">
                  <option>KHAU604377, 10/1/2025...</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 text-xs font-bold text-text-muted text-right">Eff Date:</label>
              <div className="relative flex-1">
                <select className="w-full h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary appearance-none">
                  <option>10/1/2025, Renew policy...</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 text-xs font-bold text-text-muted text-right">Claim:</label>
              <input type="text" className="flex-1 h-8 px-3 text-xs font-semibold bg-white border border-border-main rounded-lg outline-none focus:border-primary" />
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Search</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="bg-white border-t border-border-main h-7 px-4 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-green-600">Ready</span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-text-muted font-semibold">
            {customer?.division || "Gamaty Insurance Agency LLC"}
          </span>
          <div className="w-px h-3 bg-border-main" />
          <span className="text-[10px] font-bold text-primary">AOR</span>
        </div>
      </div>
    </div>
  );
}
