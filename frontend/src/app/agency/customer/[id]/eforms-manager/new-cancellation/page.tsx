/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useParams } from "next/navigation";
import { Save, Copy, Paperclip, Printer, Plus, Minus, ChevronLeft, ChevronRight, Play, Check } from "lucide-react";

export default function NewCancellationFormPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    document.title = `eForms - Policy #KHAU604377 Eff date 10/1/2025 to 10/1/2026`;
    
    const fetchCust = async () => {
      const token = localStorage.getItem("token");
      if (token && customerId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
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
        <button className="p-1 hover:bg-slate-200 rounded border border-transparent hover:border-slate-300 text-green-600">
          <Check size={14} className="stroke-[3]" />
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

      {/* ── Main Form Content ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-[#e0e0e0]">
        
        {/* Acord Form Container */}
        <div className="bg-white border-2 border-black w-[850px] shadow-lg flex flex-col shrink-0">
          
          {/* Header Row */}
          <div className="flex items-end justify-between p-3 pb-1 border-b-2 border-black">
            <div className="flex items-center gap-4 pl-2">
              <div className="font-bold text-2xl italic tracking-tighter">ACORD<span className="text-[10px] align-super">®</span></div>
            </div>
            <div className="flex-1 flex justify-center pb-2">
              <h1 className="text-xl font-bold tracking-wider">CANCELLATION REQUEST / POLICY RELEASE</h1>
            </div>
            <div className="flex flex-col border border-black w-32">
              <div className="text-[9px] font-bold text-center border-b border-black bg-slate-100">DATE (MM/DD/YYYY)</div>
              <input type="text" className="w-full text-center text-[11px] font-semibold h-5 outline-none bg-white" defaultValue="06/24/2026" />
            </div>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-[300px_1fr] border-b border-black">
            {/* PRODUCER */}
            <div className="border-r border-black flex flex-col">
              <div className="flex border-b border-black">
                <div className="w-[80px] text-[9px] font-bold p-1 bg-slate-100 border-r border-black">PRODUCER</div>
                <div className="flex-1 flex text-[9px] font-bold p-1 bg-slate-100">
                  <span className="w-24">PHONE<br/>(A/C, No, Ext):</span>
                  <input type="text" className="flex-1 bg-[#fff9d6] outline-none px-1" defaultValue="(310) 492-2007" />
                </div>
              </div>
              <div className="p-1 text-[11px] h-[75px] flex flex-col bg-white">
                <input type="text" className="bg-[#fff9d6] w-full outline-none" defaultValue="Gamaty Insurance Agency LLC" />
                <input type="text" className="bg-[#fff9d6] w-full outline-none" defaultValue="5455 Wilshire Blvd" />
                <input type="text" className="bg-[#fff9d6] w-full outline-none" defaultValue="Suite 1816" />
                <div className="flex gap-2">
                  <input type="text" className="bg-[#fff9d6] flex-1 outline-none" defaultValue="Los Angeles" />
                  <input type="text" className="bg-[#fff9d6] w-8 outline-none" defaultValue="CA" />
                  <input type="text" className="bg-[#fff9d6] w-16 outline-none" defaultValue="90036" />
                </div>
              </div>
            </div>
            {/* COMPANY NAME */}
            <div className="flex flex-col">
              <div className="flex border-b border-black text-[9px] font-bold p-1 bg-slate-100">
                <div className="flex-1">COMPANY NAME AND ADDRESS</div>
                <div className="flex border-l border-black pl-1">
                  <span className="mr-1">NAIC CODE:</span>
                  <input type="text" className="w-16 bg-[#fff9d6] outline-none px-1" defaultValue="42390" />
                </div>
              </div>
              <div className="p-1 text-[11px] h-[75px] flex flex-col bg-white">
                <input type="text" className="bg-[#fff9d6] w-full outline-none" defaultValue="AmGuard Insurance Company" />
                <input type="text" className="bg-[#fff9d6] w-full outline-none" />
                <input type="text" className="bg-[#fff9d6] w-full outline-none" />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-[300px_1fr] border-b border-black">
            <div className="flex border-r border-black">
              <div className="flex-1 flex border-r border-black text-[9px] font-bold p-1 bg-slate-100">
                <span className="mr-1">CODE:</span>
                <input type="text" className="flex-1 bg-[#fff9d6] outline-none px-1" />
              </div>
              <div className="flex-1 flex text-[9px] font-bold p-1 bg-slate-100">
                <span className="mr-1">SUB CODE:</span>
                <input type="text" className="flex-1 bg-[#fff9d6] outline-none px-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-[9px] font-bold px-1 bg-slate-100 border-b border-black">POLICY TYPE</div>
              <input type="text" className="w-full bg-[#fff9d6] text-[11px] px-1 outline-none h-5" defaultValue="Business Auto" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-[300px_1fr] border-b-2 border-black">
            <div className="flex border-r border-black text-[9px] font-bold p-1 bg-slate-100">
              <span className="w-24 leading-tight">AGENCY<br/>CUSTOMER ID:</span>
              <input type="text" className="flex-1 bg-[#fff9d6] outline-none px-1" defaultValue="00006248" />
            </div>
            <div className="text-[10px] font-bold px-1 py-1.5 bg-slate-100">CANCELLED POLICY INFORMATION</div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-[300px_1fr] border-b border-black">
            {/* INSURED */}
            <div className="border-r border-black flex flex-col h-[80px]">
              <div className="text-[9px] font-bold px-1 bg-slate-100">INSURED NAME AND ADDRESS</div>
              <div className="flex-1 p-1 pl-12 flex flex-col justify-center gap-1">
                <input type="text" className="bg-[#fff9d6] w-full outline-none text-[11px]" defaultValue="KH Interiors, Inc." />
                <input type="text" className="bg-[#fff9d6] w-full outline-none text-[11px]" defaultValue="15009 SE 94th Ave." />
                <div className="flex gap-2">
                  <input type="text" className="bg-white border border-slate-300 w-48 outline-none text-[9px] px-1" placeholder="Enter text: The named insured's mailing address line two." />
                  <input type="text" className="bg-[#fff9d6] w-8 outline-none text-[11px] text-center" defaultValue="OR" />
                  <input type="text" className="bg-[#fff9d6] w-12 outline-none text-[11px]" defaultValue="97015" />
                </div>
              </div>
            </div>
            
            {/* POLICY INFO */}
            <div className="flex flex-col">
              <div className="border-b border-black flex flex-col">
                <div className="text-[9px] font-bold px-1 bg-slate-100">POLICY NUMBER</div>
                <input type="text" className="bg-[#fff9d6] w-full outline-none text-[11px] px-1 h-5" defaultValue="KHAU604377" />
              </div>
              
              <div className="flex flex-1">
                <div className="w-[150px] border-r border-black flex flex-col items-center justify-center bg-slate-100 text-[9px] font-bold text-center leading-tight">
                  EFFECTIVE DATE AND<br/>HOUR OF CANCELLATION
                </div>
                <div className="w-[120px] border-r border-black flex flex-col">
                  <div className="text-[9px] font-bold px-1 bg-slate-100">CANCELLATION DATE</div>
                  <input type="text" className="bg-[#fff9d6] flex-1 outline-none text-[11px] text-center w-full" defaultValue="10/01/2025" />
                </div>
                <div className="w-[60px] border-r border-black flex flex-col">
                  <div className="text-[9px] font-bold px-1 bg-slate-100">TIME</div>
                  <input type="text" className="bg-[#fff9d6] flex-1 outline-none text-[11px] text-center w-full" />
                </div>
                <div className="w-[30px] flex flex-col bg-slate-100">
                  <div className="flex-1 flex items-center justify-center border-b border-black text-[9px] font-bold">AM</div>
                  <div className="flex-1 flex items-center justify-center text-[9px] font-bold">PM</div>
                </div>
              </div>

              <div className="flex flex-1 border-t border-black">
                <div className="w-[150px] border-r border-black flex items-center justify-center bg-slate-100 text-[9px] font-bold">
                  POLICY TERM
                </div>
                <div className="w-[120px] border-r border-black flex flex-col">
                  <div className="text-[9px] font-bold px-1 bg-slate-100">EFFECTIVE DATE</div>
                  <input type="text" className="bg-[#fff9d6] flex-1 outline-none text-[11px] text-center w-full" defaultValue="10/01/2025" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-[9px] font-bold px-1 bg-slate-100">EXPIRATION DATE</div>
                  <input type="text" className="bg-[#fff9d6] flex-1 outline-none text-[11px] text-center w-full" defaultValue="10/01/2026" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: CHECKBOXES */}
          <div className="grid grid-cols-[200px_1fr] border-b-2 border-black min-h-[60px]">
            <div className="border-r border-black p-2 flex items-start gap-2 bg-slate-100">
              <input type="checkbox" className="w-5 h-5 bg-[#fff9d6]" />
              <div className="text-[11px] font-bold leading-tight">CANCELLATION REQUEST<br/>(Policy attached)</div>
            </div>
            <div className="p-2 flex flex-col gap-1 bg-slate-100">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5 bg-[#fff9d6]" />
                <div className="text-[11px] font-bold">POLICY RELEASE (Complete SIGNATURES section below)</div>
              </div>
              <div className="text-[10px] pl-7">
                The undersigned agrees that:<br/>
                <span className="pl-6">The above referenced policy is lost, destroyed or being retained.</span><br/>
                <span className="pl-6">No claims of any type will be made against the Insurance Company, its agents or its representatives,</span><br/>
                <span className="pl-6">under this policy for losses which occur after the date of cancellation shown above.</span><br/>
                <span className="pl-6">Any premium adjustment will be made in accordance with the terms and conditions of the policy.</span>
              </div>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="border-b-2 border-black">
            <div className="text-[10px] font-bold bg-slate-100 px-1 border-b border-black">SIGNATURES</div>
            <div className="p-2 flex">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold">WITNESS</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold">WITNESS</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LIENHOLDER</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> MORTGAGEE</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LOSS PAYEE</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LENDER'S LOSS PAYABLE</label>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LIENHOLDER</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> MORTGAGEE</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LOSS PAYEE</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> LENDER'S LOSS PAYABLE</label>
                </div>
              </div>
              
              <div className="w-8"></div> {/* spacer */}
              
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold">SIGNATURE OF NAMED INSURED</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold">SIGNATURE OF NAMED INSURED</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
                <div className="flex gap-2 items-end mt-2">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold leading-tight">AUTHORIZED SIGNATURE<br/><span className="font-normal">(Not applicable in NH per RSA 412:5 I)</span></span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">TITLE</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold leading-tight">AUTHORIZED SIGNATURE<br/><span className="font-normal">(Not applicable in NH per RSA 412:5 I)</span></span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">TITLE</span>
                  </div>
                  <div className="w-24 flex flex-col">
                    <input type="text" className="bg-[#fff9d6] border-b border-black outline-none text-[11px]" />
                    <span className="text-[9px] font-bold text-center">DATE</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] font-bold pb-2">
              This representation is true and accurate, and I understand that any misrepresentation may be deemed a fraudulent act.
            </div>
          </div>

          {/* FOR AGENCY / COMPANY USE */}
          <div>
            <div className="text-[10px] font-bold bg-slate-100 px-1 border-b border-black">FOR AGENCY / COMPANY USE</div>
            <div className="grid grid-cols-[1fr_120px_1fr] border-b border-black">
              {/* REASON FOR CANCELLATION */}
              <div className="border-r border-black">
                <div className="text-[9px] font-bold text-center bg-slate-100 border-b border-black">REASON FOR CANCELLATION</div>
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="border-r border-black flex flex-col bg-slate-100">
                    <label className="flex items-center gap-1 text-[9px] font-bold border-b border-black px-1"><input type="checkbox" className="w-3 h-3"/> NOT TAKEN</label>
                    <label className="flex items-center gap-1 text-[9px] font-bold border-b border-black px-1"><input type="checkbox" className="w-3 h-3"/> REQUESTED BY INSURED</label>
                    <label className="flex items-center gap-1 text-[9px] font-bold leading-tight px-1 py-1"><input type="checkbox" className="w-3 h-3"/> REWRITTEN<br/>(Complete below)</label>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex border-b border-black text-[9px] bg-slate-100">
                      <label className="flex items-center gap-1 font-bold px-1 w-24 border-r border-black"><input type="checkbox" className="w-3 h-3"/> OTHER (Identify)</label>
                      <input type="text" className="bg-[#fff9d6] flex-1 outline-none px-1" />
                    </div>
                    <div className="text-[9px] font-bold bg-slate-100 px-1">COMPANY</div>
                    <input type="text" className="bg-[#fff9d6] flex-1 border-b border-black outline-none px-1 h-5" />
                    <div className="flex flex-1">
                      <div className="flex-1 border-r border-black">
                        <div className="text-[9px] font-bold bg-slate-100 px-1">POLICY NUMBER</div>
                        <input type="text" className="bg-[#fff9d6] w-full outline-none px-1 h-5" />
                      </div>
                      <div className="w-24">
                        <div className="text-[9px] font-bold bg-slate-100 px-1">EFFECTIVE DATE</div>
                        <input type="text" className="bg-[#fff9d6] w-full outline-none px-1 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* METHOD OF CANCELLATION */}
              <div className="border-r border-black flex flex-col">
                <div className="text-[9px] font-bold text-center bg-slate-100 border-b border-black">METHOD OF CANCELLATION</div>
                <div className="flex flex-col flex-1 bg-slate-100 px-1 pt-1 gap-1">
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> FLAT</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> SHORT RATE</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" className="w-3 h-3"/> PRO RATA</label>
                </div>
                <div className="text-[9px] font-bold px-1 pb-1 border-t border-black bg-slate-100 leading-tight">
                  <input type="checkbox" className="w-3 h-3 mr-1 align-middle"/> PREMIUM CALCULATION<br/>SUBJECT TO AUDIT
                </div>
              </div>

              {/* PREMIUM */}
              <div className="flex flex-col text-[9px] font-bold">
                <div className="flex items-center justify-between px-1 border-b border-black h-8 bg-slate-100">
                  FULL TERM PREMIUM <span>$</span> <input type="text" className="bg-[#fff9d6] w-32 outline-none px-1 h-5 ml-1" />
                </div>
                <div className="flex items-center justify-between px-1 border-b border-black h-8 bg-slate-100">
                  UNEARNED FACTOR <input type="text" className="bg-[#fff9d6] w-32 outline-none px-1 h-5 ml-1" />
                </div>
                <div className="flex items-center justify-between px-1 flex-1 bg-slate-100">
                  RETURN PREMIUM <span>$</span> <input type="text" className="bg-[#fff9d6] w-32 outline-none px-1 h-5 ml-1" />
                </div>
              </div>
            </div>

            {/* REMARKS */}
            <div className="border-b border-black">
              <div className="text-[9px] font-bold px-1 bg-slate-100">REMARKS (ACORD 101, Additional Remarks Schedule, may be attached if more space is required)</div>
              <textarea className="w-full bg-[#fff9d6] outline-none text-[11px] px-1 h-12 resize-none"></textarea>
            </div>

            <div className="text-[10px] p-2 bg-white border-b border-black leading-tight">
              New York Only: If you do not keep your auto insurance in force during the entire registration period, your motor vehicle registration will be suspended. If your vehicle is still uninsured after 90 days, your driver's license will be suspended. To avoid these penalties, you must surrender your registration certificate and plates before your insurance expires. By law, we must report the termination of auto insurance coverage to the Department of Motor Vehicles.
            </div>

            {/* DISTRIBUTION */}
            <div className="grid grid-cols-[1fr_400px]">
              <div className="border-r border-black flex flex-col">
                <div className="text-[9px] font-bold px-1 bg-slate-100 border-b border-black">NAME AND ADDRESS</div>
                <div className="flex-1 bg-slate-100 p-1 flex items-center justify-center">
                  <input type="text" className="w-[90%] bg-[#fff9d6] border-b border-black outline-none h-6" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-[9px] font-bold px-1 bg-slate-100 border-b border-black">REQUEST / RELEASE DISTRIBUTION</div>
                <div className="grid grid-cols-3 border-b border-black bg-slate-100 text-[9px] font-bold p-1">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> INSURED</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> MORTGAGEE</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> COMPANY</label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> LOSS PAYEE</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> LIENHOLDER</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> FINANCE COMPANY</label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3"/> LENDER'S LOSS PAYABLE</label>
                  </div>
                </div>
                <div className="flex bg-white">
                  <div className="flex-1 flex flex-col px-1 border-r border-black">
                    <div className="text-[9px] font-bold">PRODUCER'S SIGNATURE</div>
                    <input type="text" className="bg-[#fff9d6] w-full outline-none h-6 mt-2" />
                  </div>
                  <div className="w-32 flex flex-col px-1">
                    <div className="text-[9px] font-bold">DATE</div>
                    <input type="text" className="bg-[#fff9d6] w-full outline-none h-6 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex justify-between p-1 bg-white border-t border-black text-[10px] font-bold">
            <div>ACORD 35 (2017/05)</div>
            <div className="flex flex-col items-end">
              <div>© 1988-2017 ACORD CORPORATION. All rights reserved.</div>
              <div className="mt-1">The ACORD name and logo are registered marks of ACORD</div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Status Bar ── */}
      <div className="bg-[#f0f0f0] border-t border-slate-300 h-6 px-4 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-red-600">Last Saved: 6/24/2026, Last Printed: (not printed)</span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-600">View</span>
          <div className="w-px h-3 bg-slate-300" />
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
