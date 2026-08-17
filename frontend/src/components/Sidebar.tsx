/* eslint-disable */
"use client";

import React, { useState } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Shield
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
      className={`bg-bg-base border-r border-border-main flex flex-col transition-all duration-300 select-none font-sans shrink-0 ${
        isCollapsed ? "w-16" : "w-60"
      } h-[calc(100vh-64px)] sticky top-16 z-45`}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Section Header & Collapse Toggle */}
          <div className={`flex items-center mb-2 ${isCollapsed ? "justify-center" : "justify-between px-3"}`}>
            {!isCollapsed && (
              <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                Navigation
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-secondary transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
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
                        ? "bg-secondary text-primary font-bold border border-primary/10 shadow-xs"
                        : "text-text-muted hover:bg-secondary/50 hover:text-text-main"
                    }`}
                    title={link.name}
                  >
                    <IconComponent size={18} className={isActive ? "text-primary shrink-0" : "text-text-muted shrink-0"} />
                    {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{link.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

        </div>

        {/* Bottom Branding Badge */}
        <div className="pt-4 border-t border-border-main">
          <div className="bg-secondary/40 rounded-xl p-3 border border-border-main/50 text-center">
            {isCollapsed ? (
              <div className="h-5 w-5 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                S
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-extrabold">
                    S
                  </div>
                  <span className="text-xs font-bold text-text-main uppercase tracking-widest">
                    Sterling Box
                  </span>
                </div>
                <p className="text-[10px] text-text-muted font-medium">v1.0.0 Stable</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
