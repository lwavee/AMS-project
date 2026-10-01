"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";

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
  inactiveColor: "#fce8e8",
};

interface SearchBarProps {
  filters: AdvancedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
  totalCount: number;
}

export default function SearchBar({
  filters,
  setFilters,
  totalCount,
}: SearchBarProps) {
  const updateFilter = <K extends keyof AdvancedFilterState>(key: K, value: AdvancedFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white border border-[#e5ddd5] rounded-2xl font-sans shrink-0 select-none shadow-sm p-3 sm:px-5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input & Filter Dropdowns */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="w-full h-9 pl-9 pr-3 border border-[#e5ddd5] rounded-full bg-[#FAF8F5] text-xs font-semibold text-[#2d2a26] placeholder:text-[#9A8B7A] focus:outline-none focus:border-[#9A8B7A] focus:bg-white transition-all shadow-xs"
            placeholder="Search..."
          />
          <Search size={14} className="text-[#9A8B7A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search By Dropdown */}
        <div className="relative">
          <select
            value={filters.searchBy}
            onChange={(e) => updateFilter("searchBy", e.target.value)}
            className="h-9 pl-3.5 pr-8 border border-[#e5ddd5] rounded-full bg-white text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] appearance-none cursor-pointer shadow-xs hover:border-[#9A8B7A]/60 transition-colors"
          >
            <option value="Name">All Names</option>
            <option value="Policy #">Policy #</option>
            <option value="Account #">Account #</option>
            <option value="Claim #">Claim #</option>
            <option value="Email">Email</option>
            <option value="More">All Fields</option>
          </select>
          <ChevronDown size={13} className="text-[#9A8B7A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={filters.statusFilter}
            onChange={(e) => updateFilter("statusFilter", e.target.value as AdvancedFilterState["statusFilter"])}
            className="h-9 pl-3.5 pr-8 border border-[#e5ddd5] rounded-full bg-white text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] appearance-none cursor-pointer shadow-xs hover:border-[#9A8B7A]/60 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown size={13} className="text-[#9A8B7A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Side: Total Count */}
      <div className="flex items-center justify-end shrink-0">
        <span className="text-xs font-bold text-[#6b5e52] tracking-wide">
          {totalCount} Total
        </span>
      </div>
    </div>
  );
}
