/* eslint-disable */
"use client";

import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: string;
  setSearchType: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  totalCount: number;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  totalCount,
}: SearchBarProps) {
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  return (
    <div className="bg-white border border-border-main rounded-2xl font-sans shrink-0 select-none shadow-sm">

      {/* Top Search Controls Row */}
      <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Left Inputs Group */}
        <div className="flex flex-wrap items-center gap-4 flex-1">

          {/* Search Input Box */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[240px] max-w-md">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">Search Customers</span>
            <div className="flex items-center border border-border-main bg-white rounded-full shadow-sm h-10 w-full focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all px-4">
              <Search size={15} className="text-text-muted mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent text-text-main text-sm h-full w-full"
                placeholder="Search name, match code, phone, city..."
              />
            </div>
          </div>

          {/* Search By Filter */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">Search By</span>
            <div className="relative">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full h-10 pl-4 pr-8 border border-border-main rounded-full bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-semibold text-text-main transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="all">All Fields</option>
                <option value="name">Customer Name</option>
                <option value="matchCode">Match Code</option>
                <option value="phone">Phone Number</option>
                <option value="city">City / State</option>
              </select>
              <ChevronDown size={14} className="text-text-muted absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Pick Controls (Legacy compatibility with premium styling) */}
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">Quick Pick</span>
            <div className="flex items-center border border-border-main bg-secondary/50 rounded-full h-10 overflow-hidden w-32 shadow-sm">
              <input
                type="text"
                disabled
                className="w-full px-3 outline-none bg-transparent text-text-muted text-[11px] h-full"
                placeholder="None selected"
              />
              <button
                type="button"
                className="px-3 text-text-muted hover:text-primary hover:bg-secondary border-l border-border-main flex items-center justify-center h-full transition-colors cursor-pointer"
                title="Reload Pick items"
              >
                <RefreshCw size={11} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Toggle Options Button */}
        <div className="flex items-center gap-3 shrink-0 pt-5">
          <button
            onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
            className={`flex items-center gap-2 px-5 h-10 rounded-full border text-sm font-bold transition-all cursor-pointer shadow-sm ${isOptionsExpanded
                ? "bg-primary/5 border-primary text-primary"
                : "bg-white border-border-main text-text-muted hover:bg-secondary hover:text-primary"
              }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {isOptionsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

      </div>

      {/* Expanded options dropdown matching original Win32 fieldset layout but styled as beautiful cards */}
      {isOptionsExpanded && (
        <div className="border-t border-border-main p-6 bg-secondary/30 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Status Box */}
          <div className="bg-white border border-border-main rounded-2xl p-4 shadow-sm relative pt-6">
            <span className="absolute -top-3 left-4 bg-primary text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Filter Status
            </span>
            <div className="flex items-center gap-2 py-1 flex-wrap">
              {["All", "Active", "Inactive"].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all cursor-pointer flex-1 text-center ${isActive
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-white border-border-main text-text-muted hover:bg-secondary"
                      }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Box */}
          <div className="bg-white border border-border-main rounded-2xl p-4 shadow-sm relative pt-6">
            <span className="absolute -top-3 left-4 bg-primary text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Customer Type
            </span>
            <div className="flex items-center gap-2 py-1 flex-wrap">
              {["All", "Commercial", "Personal"].map((type) => {
                const isActive = typeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all cursor-pointer flex-1 text-center ${isActive
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-white border-border-main text-text-muted hover:bg-secondary"
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
