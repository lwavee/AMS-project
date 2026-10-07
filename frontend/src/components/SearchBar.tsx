"use client";

import React from "react";
import { Search, ChevronDown, User, Layers } from "lucide-react";

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
  const updateFilter = <K extends keyof AdvancedFilterState>(
    key: K,
    value: AdvancedFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full font-sans select-none">
      {/* Search Input with Ctrl + K */}
      <div className="relative flex-1 min-w-[280px]">
        <Search
          size={15}
          className="text-[#8c827a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter("searchQuery", e.target.value)}
          className="w-full h-10 pl-9 pr-20 border border-[#e5ddd5] rounded-xl bg-white text-xs font-medium text-[#1f1d1a] placeholder:text-[#8c827a] focus:outline-none focus:border-[#795C46] transition-all shadow-2xs"
          placeholder="Search by name, email, phone, address..."
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <span className="text-[10px] font-semibold text-[#8c827a] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#e5ddd5]">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* Filter Dropdown 1: All Names */}
      <div className="relative">
        <select
          value={filters.searchBy}
          onChange={(e) => updateFilter("searchBy", e.target.value)}
          className="h-10 pl-8 pr-8 border border-[#e5ddd5] rounded-xl bg-white text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#795C46] appearance-none cursor-pointer shadow-2xs hover:bg-[#FAF8F5] transition-all"
        >
          <option value="Name">All Names</option>
          <option value="Policy #">Policy #</option>
          <option value="Account #">Account #</option>
          <option value="Claim #">Claim #</option>
          <option value="Email">Email</option>
          <option value="More">All Fields</option>
        </select>
        <User
          size={13}
          className="text-[#6b5e52] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <ChevronDown
          size={13}
          className="text-[#6b5e52] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      {/* Filter Dropdown 2: All Statuses */}
      <div className="relative">
        <select
          value={filters.statusFilter}
          onChange={(e) =>
            updateFilter(
              "statusFilter",
              e.target.value as AdvancedFilterState["statusFilter"]
            )
          }
          className="h-10 pl-8 pr-8 border border-[#e5ddd5] rounded-xl bg-white text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#795C46] appearance-none cursor-pointer shadow-2xs hover:bg-[#FAF8F5] transition-all"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <Layers
          size={13}
          className="text-[#6b5e52] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <ChevronDown
          size={13}
          className="text-[#6b5e52] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>
    </div>
  );
}
