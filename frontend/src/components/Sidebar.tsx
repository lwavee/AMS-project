/* eslint-disable */
"use client";

import React, { useState } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileSpreadsheet,
  Settings
} from "lucide-react";

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  userRole?: string;
}

export default function Sidebar({ currentTab = "Customers", onTabChange, userRole = "agent" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (name: string) => {
    if (onTabChange) {
      onTabChange(name);
    }
  };

  // Nav Links - Clean & Functional
  const navLinks = [
    { name: "Customers", tab: "Customers", icon: Users }
  ];

  if (userRole === "agency") {
    navLinks.push({ name: "Agent Control", tab: "Agent Control", icon: Shield });
  }

  return (
    <aside
      className={`bg-white border-r border-[#e5ddd5] flex flex-col transition-all duration-300 select-none font-sans shrink-0 ${
        isCollapsed ? "w-16" : "w-60"
      } h-[calc(100vh-64px)] sticky top-16 z-40`}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">
        <div className="space-y-3">
          
          {/* Section Header & Collapse Toggle */}
          <div className={`flex items-center mb-1 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-widest">
                Main Menu
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-[#6b5e52] hover:text-[#2d2a26] hover:bg-[#f5f1eb] transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} strokeWidth={2.2} /> : <ChevronLeft size={16} strokeWidth={2.2} />}
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.tab;
              const IconComponent = link.icon;
              return (
                <li key={link.name}>
                  <button
                    onClick={() => handleTabClick(link.tab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-[#f5f1eb] text-[#9A8B7A] font-bold border border-[#e5ddd5]/60 shadow-xs"
                        : "text-[#6b5e52] hover:bg-[#f5f1eb] hover:text-[#2d2a26]"
                    }`}
                    title={link.name}
                  >
                    <IconComponent size={18} className={isActive ? "text-[#9A8B7A] shrink-0" : "text-[#6b5e52] shrink-0"} />
                    {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{link.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

        </div>

        {/* Bottom Branding Badge */}
        <div className="pt-4 border-t border-[#e5ddd5]">
          <div className="bg-[#f5f1eb]/80 rounded-xl p-3 border border-[#e5ddd5] text-center">
            {isCollapsed ? (
              <div className="h-6 w-6 mx-auto rounded-full bg-[#9A8B7A] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                S
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-[#9A8B7A] text-white flex items-center justify-center text-[11px] font-extrabold shadow-sm">
                    S
                  </div>
                  <span className="text-xs font-bold text-[#2d2a26] uppercase tracking-wider">
                    Sterling AMS
                  </span>
                </div>
                <p className="text-[10px] text-[#6b5e52] font-medium">Wholesale Insurance</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
