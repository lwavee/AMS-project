"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw, SlidersHorizontal } from "lucide-react";

export interface AdvancedFilterState {
  searchQuery: string;
  searchBy: string;
  searchByMoreOption: string;
  includeAgency: boolean;
  includeBroker: boolean;
  statusFilter: "Active" | "Inactive" | "All";
  customerTypeCustomers: boolean;
  customerTypeProspects: boolean;
  customerTypeSuspects: boolean;
  scopeNameCustomer: boolean;
  scopeNameDBA: boolean;
  scopeNameNamedInsureds: boolean;
  scopeNameDependents: boolean;
  scopeNameContact: boolean;
  scopeNameClaimant: boolean;
  scopeNameXRef: boolean;
  scopeNameDriver: boolean;
  scopeNameCertHolder: boolean;
  scopeCustomerStandard: boolean;
  scopeCustomerMaster: boolean;
  scopeCustomerSub: boolean;
  scopeCustomerLimitAccess: boolean;
  matchOn: "Prefix" | "Keyword";
  autoOpenSingle: boolean;
  inactiveColor: string;
}

export const defaultFilterState: AdvancedFilterState = {
  searchQuery: "",
  searchBy: "Name",
  searchByMoreOption: "Account # on Policy",
  includeAgency: true,
  includeBroker: false,
  statusFilter: "All",
  customerTypeCustomers: true,
  customerTypeProspects: true,
  customerTypeSuspects: false,
  scopeNameCustomer: true,
  scopeNameDBA: true,
  scopeNameNamedInsureds: true,
  scopeNameDependents: true,
  scopeNameContact: true,
  scopeNameClaimant: true,
  scopeNameXRef: true,
  scopeNameDriver: true,
  scopeNameCertHolder: true,
  scopeCustomerStandard: true,
  scopeCustomerMaster: true,
  scopeCustomerSub: true,
  scopeCustomerLimitAccess: false,
  matchOn: "Prefix",
  autoOpenSingle: false,
  inactiveColor: "#fce8e8", // Very light pastel red
};

interface SearchBarProps {
  filters: AdvancedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
  totalCount: number;
}

export default function SearchBar({
  filters,
  setFilters,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalCount,
}: SearchBarProps) {
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);
  const [savedViews, setSavedViews] = useState<Record<string, AdvancedFilterState>>({});
  const [currentViewName, setCurrentViewName] = useState("User Default");
  const [newViewName, setNewViewName] = useState("");

  // Load saved views from localStorage on mount
  useEffect(() => {
    let initialViews: Record<string, AdvancedFilterState> = { "User Default": defaultFilterState };
    const loaded = localStorage.getItem("ams360_saved_views");
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        if (Object.keys(parsed).length > 0) {
          initialViews = parsed;
        }
      } catch {
        // ignore
      }
    }
    
    // Defer state updates to avoid synchronous cascade warnings
    setTimeout(() => {
      setSavedViews(initialViews);
      if (initialViews["User Default"]) {
        setFilters(initialViews["User Default"]);
      }
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = <K extends keyof AdvancedFilterState>(key: K, value: AdvancedFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveView = () => {
    const nameToSave = newViewName.trim() || currentViewName || "User Default";
    const updatedViews = { ...savedViews, [nameToSave]: filters };
    setSavedViews(updatedViews);
    localStorage.setItem("ams360_saved_views", JSON.stringify(updatedViews));
    setCurrentViewName(nameToSave);
    setNewViewName("");
    alert(`View "${nameToSave}" saved successfully!`);
  };

  const handleApplyView = () => {
    if (savedViews[currentViewName]) {
      setFilters(savedViews[currentViewName]);
    }
  };

  // Build the dynamic summary text based on active filters
  const buildSummaryText = () => {
    const parts = [];
    parts.push(`Search By: ${filters.searchBy === 'More' ? filters.searchByMoreOption : filters.searchBy}`);
    parts.push(`Include: ${filters.statusFilter}`);
    if (filters.includeAgency) parts.push("Agency");
    if (filters.includeBroker) parts.push("Broker");
    
    const custTypes = [];
    if (filters.customerTypeCustomers) custTypes.push("Customers");
    if (filters.customerTypeProspects) custTypes.push("Prospects");
    if (filters.customerTypeSuspects) custTypes.push("Suspects");
    
    if (custTypes.length > 0) {
      parts.push(`Customer Type: ${custTypes.join(", ")}`);
    }

    return parts.join(" | ");
  };

  return (
    <div className="bg-white border border-border-main rounded-2xl font-sans shrink-0 select-none shadow-sm flex flex-col transition-all duration-300">

      {/* TOP ROW: Mimicking screenshot 1 */}
      <div className="px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-main/50 bg-secondary/10 rounded-t-2xl">
        
        {/* Left Side: Search & Pick */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted">Search for:</span>
            <div className="flex items-center border border-border-main bg-white shadow-sm h-8 w-64 px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
                className="flex-1 outline-none bg-transparent text-text-main text-sm h-full w-full"
                placeholder=""
              />
              <Search size={14} className="text-primary shrink-0 ml-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted">Pick:</span>
            <div className="flex items-center border border-border-main bg-white h-8 w-32 shadow-sm overflow-hidden">
              <input type="text" className="w-full px-2 outline-none bg-transparent text-sm h-full" disabled />
              <button className="px-2 text-text-muted hover:text-primary bg-secondary/50 border-l border-border-main h-full flex items-center justify-center cursor-pointer">
                <RefreshCw size={12} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Summary Text */}
        <div className="hidden lg:flex items-center gap-2 max-w-lg">
          <span className="text-[11px] font-bold text-text-main truncate" title={buildSummaryText()}>
            {buildSummaryText()}
          </span>
          <button className="text-danger hover:text-danger/80" onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}>
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* VIEW OPTIONS BAR */}
      <div className="px-6 py-2 flex items-center justify-between bg-white border-b border-border-main/50 rounded-b-2xl">
        <button
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
          className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-text-main hover:text-primary transition-colors cursor-pointer outline-none"
        >
          {isOptionsExpanded ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-text-muted" />}
          View Options
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider font-bold text-text-main">Select View:</span>
          <div className="relative">
            <select
              value={currentViewName}
              onChange={(e) => setCurrentViewName(e.target.value)}
              className="h-7 pl-3 pr-8 border border-border-main bg-white text-xs font-semibold text-text-main focus:outline-none focus:border-primary appearance-none cursor-pointer w-48 shadow-sm"
            >
              {Object.keys(savedViews).map((vName) => (
                <option key={vName} value={vName}>{vName}</option>
              ))}
            </select>
            <ChevronDown size={12} className="text-text-muted absolute right-2 top-2 pointer-events-none" />
          </div>
          <button 
            onClick={handleApplyView}
            className="h-7 px-4 bg-[#4a5568] hover:bg-[#2d3748] text-white text-[11px] uppercase tracking-wider font-bold rounded shadow-sm transition-colors cursor-pointer"
          >
            Apply View
          </button>
        </div>
      </div>

      {/* EXPANDED VIEW OPTIONS */}
      {isOptionsExpanded && (
        <div className="p-6 bg-[#faf9f8] grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 text-sm animate-in slide-in-from-top-2 fade-in duration-200 rounded-b-2xl border-t border-border-main">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Search By */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Search By:</span>
              {["Name", "Policy #", "Account #", "Claim #", "Email"].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="searchBy" 
                    checked={filters.searchBy === opt}
                    onChange={() => updateFilter("searchBy", opt)}
                    className="accent-primary w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[13px] font-semibold text-black">{opt}</span>
                </label>
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="searchBy" 
                  checked={filters.searchBy === "More"}
                  onChange={() => updateFilter("searchBy", "More")}
                  className="accent-primary w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[13px] font-semibold text-black">More:</span>
                <select 
                  value={filters.searchByMoreOption}
                  onChange={(e) => updateFilter("searchByMoreOption", e.target.value)}
                  disabled={filters.searchBy !== "More"}
                  className="border border-border-main bg-white h-6 w-40 px-1 disabled:bg-secondary/50 text-xs text-black focus:outline-none"
                >
                  {[
                    "Account # on Policy", "Address", "Broker Last Name", "City", 
                    "Customer Notation", "Federal ID #", "Invoice #", 
                    "Location Address", "NAICS #", "Phone #", "Policy Notation", "Zip Code"
                  ].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Include */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Include:</span>
              <div className="flex items-center gap-4 pl-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.includeAgency}
                    onChange={(e) => updateFilter("includeAgency", e.target.checked)}
                    className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm"
                  />
                  <span className="text-[13px] font-semibold text-black">Agency</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.includeBroker}
                    onChange={(e) => updateFilter("includeBroker", e.target.checked)}
                    className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm"
                  />
                  <span className="text-[13px] font-semibold text-black">Broker</span>
                </label>
              </div>
              <div className="flex items-center gap-4 pl-1">
                {["Active", "Inactive", "All"].map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="statusFilter" 
                      checked={filters.statusFilter === opt}
                      onChange={() => updateFilter("statusFilter", opt as AdvancedFilterState["statusFilter"])}
                      className="accent-primary w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[13px] font-semibold text-black">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Scope of Name Search */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Scope of Name Search:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pl-1">
                {[
                  { label: "Customer - Last Name/Firm Name", key: "scopeNameCustomer" },
                  { label: "DBA Name", key: "scopeNameDBA" },
                  { label: "Named Insureds", key: "scopeNameNamedInsureds" },
                  { label: "Dependents Last Name", key: "scopeNameDependents" },
                  { label: "Contact Name", key: "scopeNameContact" },
                  { label: "Claimant", key: "scopeNameClaimant" },
                  { label: "X-Reference", key: "scopeNameXRef" },
                  { label: "Driver Name", key: "scopeNameDriver" },
                  { label: "Cert Holder Name", key: "scopeNameCertHolder" },
                ].map(({ label, key }) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters[key as keyof AdvancedFilterState] as boolean}
                      onChange={(e) => updateFilter(key as keyof AdvancedFilterState, e.target.checked)}
                      className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className="text-[12px] font-medium text-black">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Customer Type */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Customer Type:</span>
              <div className="flex flex-col gap-2 pl-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.customerTypeCustomers} onChange={(e) => updateFilter("customerTypeCustomers", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[13px] font-semibold text-black">Customers</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.customerTypeProspects} onChange={(e) => updateFilter("customerTypeProspects", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[13px] font-semibold text-black">Prospects</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.customerTypeSuspects} onChange={(e) => updateFilter("customerTypeSuspects", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[13px] font-semibold text-black">Suspects</span>
                </label>
              </div>
            </div>

            {/* Scope of Customer Search */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Scope of Customer Search:</span>
              <div className="flex flex-col gap-2 pl-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.scopeCustomerStandard} onChange={(e) => updateFilter("scopeCustomerStandard", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[12px] font-medium text-black">Standard</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.scopeCustomerMaster} onChange={(e) => updateFilter("scopeCustomerMaster", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[12px] font-medium text-black">Master/Multiple Entities</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.scopeCustomerSub} onChange={(e) => updateFilter("scopeCustomerSub", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[12px] font-medium text-black">Sub/Multiple Entities</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filters.scopeCustomerLimitAccess} onChange={(e) => updateFilter("scopeCustomerLimitAccess", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                  <span className="text-[12px] font-medium text-black">Limit to only customers I have access to</span>
                </label>
              </div>
            </div>

            {/* Match On */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1">
                <span className="font-bold text-black text-[11px] uppercase tracking-wider">Match On:</span>
                <div className="h-3.5 w-3.5 bg-primary/20 rounded-full flex items-center justify-center text-[9px] font-bold text-primary cursor-help" title="Help text here">?</div>
              </div>
              <div className="flex items-center gap-4 pl-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="matchOn" checked={filters.matchOn === "Prefix"} onChange={() => updateFilter("matchOn", "Prefix")} className="accent-primary w-3.5 h-3.5 cursor-pointer" />
                  <span className="text-[13px] font-semibold text-black">Prefix</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="matchOn" checked={filters.matchOn === "Keyword"} onChange={() => updateFilter("matchOn", "Keyword")} className="accent-primary w-3.5 h-3.5 cursor-pointer" />
                  <span className="text-[13px] font-semibold text-black">Keyword</span>
                </label>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer mt-1 pl-1">
                <input type="checkbox" checked={filters.autoOpenSingle} onChange={(e) => updateFilter("autoOpenSingle", e.target.checked)} className="accent-primary w-3.5 h-3.5 cursor-pointer rounded-sm" />
                <span className="text-[12px] font-medium text-black">Automatically open single customer search result</span>
                <div className="h-3.5 w-3.5 bg-primary/20 rounded-full flex items-center justify-center text-[9px] font-bold text-primary cursor-help" title="Help text here">?</div>
              </label>
            </div>

            {/* Color Setup */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-black text-[11px] uppercase tracking-wider">Color Setup:</span>
              <div className="flex items-center gap-2 pl-1">
                <span className="text-[13px] font-semibold text-black">Inactive Customer:</span>
                <input 
                  type="color" 
                  value={filters.inactiveColor} 
                  onChange={(e) => updateFilter("inactiveColor", e.target.value)}
                  className="w-10 h-7 p-0.5 border border-border-main rounded cursor-pointer bg-white"
                />
              </div>
            </div>

          </div>

          {/* BOTTOM SAVE ROW */}
          <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main/50 bg-secondary/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
            <span className="text-[11px] uppercase tracking-wider font-bold text-black mt-4">Save View As:</span>
            <input 
              type="text" 
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="Enter view name..."
              className="border border-border-main bg-white h-8 w-48 px-3 text-xs text-black focus:outline-none focus:border-primary shadow-sm mt-4 rounded"
            />
            <button 
              onClick={handleSaveView}
              className="h-8 px-6 bg-[#4a5568] hover:bg-[#2d3748] text-white text-[11px] uppercase tracking-wider font-bold rounded shadow-sm transition-colors cursor-pointer mt-4"
            >
              Save
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
