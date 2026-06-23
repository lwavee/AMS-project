"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { Save } from "lucide-react";

export default function NewAutoIdPage() {
  const params = useParams();
  const customerId = params?.id;

  useEffect(() => {
    // In a real app, fetch customer and policies
    document.title = "Auto Id Cards - eForms";
  }, [customerId]);

  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans overflow-hidden select-none">
      
      {/* ── Modern Form Header ── */}
      <div className="bg-white border-b border-border-main px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-extrabold text-text-main tracking-tight">Auto Id Cards</h2>
          <p className="text-[11px] font-semibold text-text-muted mt-0.5">DGI Builders, LLC • Policy #ISCSP000016763 • Eff: 5/5/2026 to 5/5/2027</p>
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
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-text-muted font-medium max-w-[800px] leading-relaxed">
            Select Default Information and appropriate Vehicle(s) you wish to create auto id cards for.
          </p>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
            <input type="checkbox" className="accent-primary w-4 h-4" /> Delete card(s) when eForms closes
          </label>
        </div>

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          
          {/* Left Panel: Default Information */}
          <div className="w-full lg:w-[350px] bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-6 shrink-0">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Default Information to use</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Policy #:</label>
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="ISCSP000016763" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Eff Date:</label>
                  <input type="date" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="2026-05-05" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-main">Exp Date:</label>
                  <input type="date" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="2027-05-05" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">Company:</label>
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="SiriusPoint Specialty Insurance Corporatio" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-main">NAIC #:</label>
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="16820" />
              </div>
            </div>

            <div className="border-t border-border-main pt-4 flex flex-col gap-3">
              <h4 className="text-[12px] font-bold text-text-main">Insured Name</h4>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredName" className="accent-primary" defaultChecked /> Customer Name</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredName" className="accent-primary" /> First Named Insured</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredName" className="accent-primary" /> Supplemental Name(s)</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredName" className="accent-primary" /> Co-Insured</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredName" className="accent-primary" /> Driver(s)</label>
                <label className="flex items-center gap-2 text-[12px] font-semibold text-text-muted cursor-pointer"><input type="checkbox" className="accent-primary" /> Print Primary Driver for each Vehicle</label>
              </div>
              <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer mt-1">
                <option>DGI Builders, LLC</option>
              </select>
            </div>

            <div className="border-t border-border-main pt-4 flex flex-col gap-3">
              <h4 className="text-[12px] font-bold text-text-main">Insured Address</h4>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredAddress" className="accent-primary" defaultChecked /> Garaging Address</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredAddress" className="accent-primary" /> Customer</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="insuredAddress" className="accent-primary" /> First Named Insured</label>
              <div className="flex flex-col gap-2 mt-2">
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" disabled />
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" disabled />
                <div className="grid grid-cols-[1fr_80px_100px] gap-2">
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" disabled />
                  <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none appearance-none cursor-not-allowed" disabled></select>
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" disabled />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Issuer, Form Selection, Medical */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            
            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-5">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Card Issuer Name/Address</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="issuer" className="accent-primary" defaultChecked /> Agency</label>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer"><input type="radio" name="issuer" className="accent-primary" /> Company</label>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_250px] gap-4">
                <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="Gamaty Insurance Agency LLC" />
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-main w-14">Phone:</span>
                  <input type="text" className="flex-1 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="(310)492-2007" />
                  <span className="text-[13px] font-semibold text-text-main">Ext:</span>
                  <input type="text" className="w-16 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_250px] gap-4">
                <select className="w-full text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option>Select Address:</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-main w-14">Web Addr:</span>
                  <input type="text" className="flex-1 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="www.capcoinsurance.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_250px] gap-4">
                <div className="flex flex-col gap-4">
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="5455 Wilshire Blvd" />
                  <input type="text" className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="Suite 1816" />
                  <div className="grid grid-cols-[1fr_80px_100px] gap-2">
                    <input type="text" className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="Los Angeles" />
                    <select className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option>CA</option>
                    </select>
                    <input type="text" className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" defaultValue="90036" />
                  </div>
                </div>
                <div className="hidden xl:block"></div>
              </div>
            </div>

            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Form Selection</h3>
              <div className="flex items-start gap-3">
                <label className="flex items-start gap-2 text-[13px] font-semibold text-text-main cursor-pointer mt-2"><input type="radio" name="formSel" className="accent-primary mt-0.5" defaultChecked /> <span className="flex-1">Use State specific Id Card with most current form for the</span></label>
                <select className="text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer w-[150px] shrink-0">
                  <option>Garaging State</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer shrink-0"><input type="radio" name="formSel" className="accent-primary" /> Use State:</label>
                <select className="w-[100px] text-[13px] font-semibold text-text-main bg-secondary/30 border border-border-main rounded-xl px-3 py-2 outline-none appearance-none cursor-not-allowed" disabled></select>
                <span className="text-[13px] font-semibold text-text-main">With Form Edition:</span>
                <select className="flex-1 text-[13px] font-semibold text-text-main bg-secondary/30 border border-border-main rounded-xl px-3 py-2 outline-none appearance-none cursor-not-allowed" disabled></select>
              </div>
            </div>

            <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Name and Address for commencement of medical treatment</h3>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-text-main w-12">State:</span>
                <select className="w-[100px] text-[13px] font-semibold text-text-main bg-bg-base border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"></select>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                <div className="flex flex-col gap-2">
                  <input type="text" className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  <input type="text" className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  <input type="text" className="w-full min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-main w-12 shrink-0">Phone:</span>
                    <input type="text" className="flex-1 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                    <span className="text-[13px] font-semibold text-text-main shrink-0">Ext:</span>
                    <input type="text" className="w-14 min-w-0 shrink-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-main w-12 shrink-0">Fax:</span>
                    <input type="text" className="flex-1 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                    <span className="text-[13px] font-semibold text-text-main shrink-0">Ext:</span>
                    <input type="text" className="w-14 min-w-0 shrink-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-main w-12 shrink-0">Email:</span>
                    <input type="text" className="flex-1 min-w-0 text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-text-muted mt-2 max-w-[600px] leading-relaxed">
                This information is not applicable for all state specific auto id cards and therefore may not integrate to the selected form.
              </p>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="flex flex-col flex-1 min-h-[250px]">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
              <input type="checkbox" className="accent-primary w-4 h-4" /> &apos;Fleet&apos; Cards
            </label>
            <div className="flex gap-2">
              <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Select All</button>
              <button className="text-[12px] font-bold border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary rounded-xl px-4 py-1.5 transition-all">Clear All</button>
            </div>
          </div>
          
          <div className="bg-white border border-border-main rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-secondary/30 border-b border-border-main text-[11px] font-bold text-text-muted uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-[60px] text-center border-r border-border-main/50">Select</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Veh #</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Year</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Make/Model</th>
                    <th className="px-4 py-3 border-r border-border-main/50">VIN</th>
                    <th className="px-4 py-3 border-r border-border-main/50">State</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Zip</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Commercial</th>
                    <th className="px-4 py-3 border-r border-border-main/50">Personal</th>
                    <th className="px-4 py-3">DMV#</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] font-semibold text-text-main divide-y divide-border-main/50">
                  {/* Empty state or rows go here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
