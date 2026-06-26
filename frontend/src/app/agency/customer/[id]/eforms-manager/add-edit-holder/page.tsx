"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface CertificateHolder {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  issueDate: string;
  jobType: string;
  jobNum: string;
  projectEndDate: string;
  descOfOps: string;
}

export default function AddEditHolderPage() {
  const searchParams = useSearchParams();
  const certificateId = searchParams.get("certId") || "Unknown Certificate";

  const [holders, setHolders] = useState<CertificateHolder[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newHolder, setNewHolder] = useState<Partial<CertificateHolder>>({});

  const handleAddHolder = () => {
    if (!newHolder.name) return;
    const holder: CertificateHolder = {
      id: Date.now().toString(),
      name: newHolder.name || "",
      address: newHolder.address || "",
      city: newHolder.city || "",
      state: newHolder.state || "",
      zip: newHolder.zip || "",
      issueDate: newHolder.issueDate || new Date().toLocaleDateString(),
      jobType: newHolder.jobType || "",
      jobNum: newHolder.jobNum || "",
      projectEndDate: newHolder.projectEndDate || "",
      descOfOps: newHolder.descOfOps || "",
    };
    setHolders([...holders, holder]);
    setIsAddingNew(false);
    setNewHolder({});
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f4cc7c] border-b border-[#e1b452] shrink-0">
        <h2 className="text-sm font-bold text-slate-800">Add/Edit Certificate Holders</h2>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
          {isAddingNew ? (
            <>
              <button onClick={handleAddHolder} className="hover:text-primary">Add</button>
              <button onClick={() => setIsAddingNew(false)} className="hover:text-red-600">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsAddingNew(true)} className="hover:text-primary text-blue-800 font-bold">New</button>
              <button className="hover:text-primary">Edit</button>
              <button className="hover:text-red-600">Delete</button>
            </>
          )}
          <button onClick={handleClose} className="ml-2 hover:bg-black/10 rounded-full p-1"><X size={16} /></button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto flex flex-col bg-slate-50">
        {/* Certificate Header Info */}
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <span className="text-sm font-semibold text-slate-700 w-24">Certificate #</span>
          <input type="text" value={certificateId} readOnly className="border border-slate-300 rounded px-2 py-1 text-sm bg-white w-48" />
          <a href="#" className="text-blue-600 hover:underline text-xs ml-auto">Copy multiple holders</a>
        </div>

        {/* Data Table */}
        <div className="border border-slate-300 bg-white rounded-sm mb-4 max-h-[300px] overflow-y-auto shrink-0 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-200 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Name</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Addr</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">City</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">State</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Zip</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Issue Date</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Job Type</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Job #</th>
                <th className="p-1 border-r border-slate-300 font-semibold text-slate-600">Project End Date</th>
                <th className="p-1 font-semibold text-slate-600">Desc of Ops/Special Conds</th>
              </tr>
            </thead>
            <tbody>
              {holders.length === 0 ? (
                <tr><td colSpan={10} className="p-4 text-center text-slate-500 italic">No holders added yet. Click New to add one.</td></tr>
              ) : (
                holders.map((holder, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-1 border-r border-slate-200 truncate max-w-[120px]">{holder.name}</td>
                    <td className="p-1 border-r border-slate-200 truncate max-w-[120px]">{holder.address}</td>
                    <td className="p-1 border-r border-slate-200">{holder.city}</td>
                    <td className="p-1 border-r border-slate-200">{holder.state}</td>
                    <td className="p-1 border-r border-slate-200">{holder.zip}</td>
                    <td className="p-1 border-r border-slate-200">{holder.issueDate}</td>
                    <td className="p-1 border-r border-slate-200">{holder.jobType}</td>
                    <td className="p-1 border-r border-slate-200">{holder.jobNum}</td>
                    <td className="p-1 border-r border-slate-200">{holder.projectEndDate}</td>
                    <td className="p-1 truncate max-w-[200px]">{holder.descOfOps}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isAddingNew && (
          <div className="flex justify-center my-8">
            <button className="px-6 py-1 bg-slate-100 border border-slate-300 rounded text-slate-500 text-xs shadow-sm font-semibold opacity-50 cursor-not-allowed">Create/Refresh Forms</button>
            <button onClick={handleClose} className="px-6 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs shadow-sm ml-8 font-semibold hover:bg-slate-200">Cancel</button>
          </div>
        )}

        {/* Form */}
        {isAddingNew && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-100 p-2 rounded border border-slate-300 shrink-0 mb-4 shadow-sm">
            {/* Left Column */}
            <div className="flex flex-col gap-2">
              <div className="border border-slate-300 rounded p-2 bg-white mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase -mt-4 bg-white w-max px-1">Name Selection</h3>
                <div className="flex flex-col gap-1 text-xs mt-1">
                  <label className="flex items-center gap-2"><input type="radio" name="nameSelection" /> Additional Named Insureds</label>
                  <label className="flex items-center gap-2"><input type="radio" name="nameSelection" defaultChecked /> Certificate Holder Master List</label>
                  <label className="flex items-center gap-2"><input type="radio" name="nameSelection" /> Customer Certificate Holder List</label>
                  <label className="flex items-center gap-2"><input type="radio" name="nameSelection" /> Policy Additional Interests</label>
                  <label className="flex items-center gap-2"><input type="radio" name="nameSelection" /> Setup Additional Interests</label>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className="w-16">Name Filter:</span>
                  <div className="flex-1 border border-blue-400 flex items-center bg-white rounded-sm">
                    <input type="text" className="w-full p-1 outline-none" />
                    <Search size={14} className="text-slate-400 mr-1" />
                  </div>
                  <button className="p-1 bg-slate-200 border border-slate-300 rounded-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 14.73-10.74l3.14 1.17" /><path d="M2.5 22v-6h6M21.87 8.43a10 10 0 1 0-14.73 10.74l-3.14-1.17" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-red-600">Name:</span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" value={newHolder.name || ""} onChange={(e) => setNewHolder({...newHolder, name: e.target.value})} />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="w-16">Contact:</span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16">Address:</span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" value={newHolder.address || ""} onChange={(e) => setNewHolder({...newHolder, address: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16"></span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16">City:</span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" value={newHolder.city || ""} onChange={(e) => setNewHolder({...newHolder, city: e.target.value})} />
                  <span className="w-8 ml-2">State:</span>
                  <select className="border border-slate-300 p-1 rounded-sm w-16 bg-slate-200" value={newHolder.state || ""} onChange={(e) => setNewHolder({...newHolder, state: e.target.value})}>
                    <option></option>
                    <option value="OR">OR</option>
                    <option value="TX">TX</option>
                    <option value="NY">NY</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16">Zip:</span>
                  <input type="text" className="w-24 border border-slate-300 p-1 rounded-sm" value={newHolder.zip || ""} onChange={(e) => setNewHolder({...newHolder, zip: e.target.value})} />
                  <span className="w-8 ml-2">Email:</span>
                  <input type="text" className="flex-1 border border-slate-300 p-1 rounded-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16">Fax:</span>
                  <input type="text" className="w-24 border border-slate-300 p-1 rounded-sm" />
                  <span className="w-8 ml-2">Ext:</span>
                  <input type="text" className="w-16 border border-slate-300 p-1 rounded-sm" />
                </div>
              </div>

              <div className="border border-slate-300 rounded p-2 bg-white mt-3 relative">
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="font-semibold">Write to Cust Cert Holder List</span>
                  <span className="ml-auto">Method of Distribution:</span>
                  <select className="border border-slate-300 rounded bg-slate-200 w-24 p-0.5"><option></option></select>
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase bg-white px-1">Additional Insured and Waiver of Subrogation</h3>
                <table className="w-full text-[10px] mt-1 text-center">
                  <thead>
                    <tr>
                      <th className="text-left font-normal">Type of Insurance</th>
                      <th className="font-normal">Additional Insured?</th>
                      <th className="font-normal">Waiver of Subrogation?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['General Liability', 'Automobile Liability', 'Garage Liability', 'Garage Keepers Liability', 'Umbrella/Excess Liability'].map(type => (
                      <tr key={type}>
                        <td className="text-left">{type}:</td>
                        <td><input type="radio" name={`${type}-AI`} className="mr-1"/>Y <input type="radio" name={`${type}-AI`} defaultChecked className="ml-1 mr-1"/>N</td>
                        <td><input type="radio" name={`${type}-WS`} className="mr-1"/>Y <input type="radio" name={`${type}-WS`} defaultChecked className="ml-1 mr-1"/>N</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="text-left">Work Comp:</td>
                      <td>N/A</td>
                      <td><input type="radio" name={`WC-WS`} className="mr-1"/>Y <input type="radio" name={`WC-WS`} defaultChecked className="ml-1 mr-1"/>N</td>
                    </tr>
                    <tr>
                      <td className="text-left">Other:</td>
                      <td><input type="radio" name={`Other-AI`} className="mr-1"/>Y <input type="radio" name={`Other-AI`} defaultChecked className="ml-1 mr-1"/>N</td>
                      <td><input type="radio" name={`Other-WS`} className="mr-1"/>Y <input type="radio" name={`Other-WS`} defaultChecked className="ml-1 mr-1"/>N</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Middle Column */}
            <div className="flex flex-col gap-2">
              <div className="border border-slate-300 rounded p-2 bg-white flex flex-col gap-2 text-xs mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase -mt-4 bg-white w-max px-1">Issue Date</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red-600">Date Issued:</span>
                  <input type="date" className="border border-slate-300 rounded p-1" value={newHolder.issueDate || ""} onChange={(e) => setNewHolder({...newHolder, issueDate: e.target.value})} />
                </div>
                <div className="mt-2 text-slate-700">Written Notice</div>
                <div className="flex items-center gap-2">
                  <span># of Days:</span>
                  <input type="number" defaultValue={10} className="border border-slate-300 rounded p-1 w-16" />
                </div>
              </div>

              <div className="border border-slate-300 rounded p-2 bg-white flex flex-col gap-2 text-xs flex-1 mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase -mt-4 bg-white w-max px-1">Description of Operations</h3>
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" defaultChecked /> <span>Same as Master Description</span>
                  <button className="ml-auto bg-slate-200 border border-slate-300 px-3 py-0.5 rounded shadow-sm text-[10px]">Insert</button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Text:</span>
                  <select className="flex-1 border border-slate-300 bg-slate-200 rounded p-1"><option></option></select>
                  <button className="bg-slate-200 border border-slate-300 px-3 py-0.5 rounded shadow-sm text-[10px]">Replace</button>
                </div>
                <textarea 
                  className="w-full border border-slate-300 rounded mt-1 flex-1 min-h-[100px] p-1 text-slate-700" 
                  value={newHolder.descOfOps || "Verification of Insurance Coverage (Subject to all policy terms, exclusions and conditions)"}
                  onChange={(e) => setNewHolder({...newHolder, descOfOps: e.target.value})}
                />
                <div className="text-right mt-1 text-blue-600 hover:underline cursor-pointer">Text Setup</div>
              </div>

              <div className="border border-slate-300 rounded p-2 bg-white flex flex-col gap-1 text-xs mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase -mt-4 bg-white w-max px-1">Note/Message</h3>
                <label className="flex items-center gap-1 mt-1"><input type="checkbox" defaultChecked /> Print note with form</label>
                <textarea className="w-full border border-slate-300 rounded min-h-[60px] p-1"></textarea>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2">
              <div className="bg-white flex-1 border border-slate-300 rounded" />
              <div className="border border-slate-300 rounded p-2 bg-white flex flex-col gap-2 text-xs mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase -mt-4 bg-white w-max px-1">Additional Information</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-24 text-right">Job Type:</span>
                  <input type="text" className="border border-slate-300 rounded p-1 flex-1" value={newHolder.jobType || ""} onChange={(e) => setNewHolder({...newHolder, jobType: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right">Job #:</span>
                  <input type="text" className="border border-slate-300 rounded p-1 flex-1" value={newHolder.jobNum || ""} onChange={(e) => setNewHolder({...newHolder, jobNum: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right">Project End Date:</span>
                  <input type="date" className="border border-slate-300 rounded p-1 w-32" value={newHolder.projectEndDate || ""} onChange={(e) => setNewHolder({...newHolder, projectEndDate: e.target.value})} />
                </div>
                <div className="flex items-center gap-4 mt-2 justify-center">
                  <label className="flex items-center gap-1"><input type="checkbox" /> Licensed</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> Bonded</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
