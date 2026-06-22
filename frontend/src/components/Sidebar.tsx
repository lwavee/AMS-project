/* eslint-disable */
"use client";

import React, { useState } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  FolderClosed,
  BarChart3,
  FileText,
  Clock,
  Target,
  Calendar,
  Briefcase,
  TrendingUp,
  Settings,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ currentTab = "Customers", onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (name: string) => {
    if (onTabChange) {
      onTabChange(name);
    }
  };

  // Nav Links with Icons
  const actionLinks = [
    { name: "Customers", tab: "Customers", icon: Users },
    { name: "Activity", tab: "Activity", icon: Calendar },
    { name: "Notes", tab: "Notes", icon: FileText },
    { name: "Suspense", tab: "Suspense", icon: Clock },
    { name: "Target List", tab: "Target List", icon: Target }
  ];

  return (
    <aside
      className={`bg-bg-base border-r border-border-main flex flex-col transition-all duration-300 select-none font-sans shrink-0 ${
        isCollapsed ? "w-16" : "w-60"
      } h-[calc(100vh-64px)] sticky top-16 z-45`}
    >
      {/* Sidebar Links Scrollable Wrapper */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Action List Section */}
          <div className="space-y-1.5">
            <div className={`flex items-center mb-2 ${isCollapsed ? "justify-center" : "justify-between px-3"}`}>
              {!isCollapsed && (
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Actions
                </span>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-main hover:bg-secondary transition-colors cursor-pointer"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
              </button>
            </div>
            <ul className="space-y-1">
              {actionLinks.map((link) => {
                const isActive = currentTab === link.tab;
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <button
                      onClick={() => handleTabClick(link.tab)}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left sidebar-item ${
                        isActive
                          ? "bg-secondary text-primary font-bold"
                          : "text-text-muted hover:bg-secondary/50 hover:text-text-main"
                      }`}
                      title={link.name}
                    >
                      <IconComponent size={18} className={isActive ? "text-primary" : "text-text-muted"} />
                      {!isCollapsed && <span>{link.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Reports Section */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                Reports
              </span>
            )}
            <ul className="space-y-1">
              {[
                { name: "Customer Register", icon: BarChart3 },
                { name: "Production Summary", icon: TrendingUp }
              ].map((report) => {
                const isActive = currentTab === "Reports";
                const IconComponent = report.icon;
                return (
                  <li key={report.name}>
                    <button
                      onClick={() => handleTabClick("Reports")}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left sidebar-item ${
                        isActive
                          ? "bg-secondary text-primary font-bold"
                          : "text-text-muted hover:bg-secondary/50 hover:text-text-main"
                      }`}
                      title={report.name}
                    >
                      <IconComponent size={18} className={isActive ? "text-primary" : "text-text-muted"} />
                      {!isCollapsed && <span className="truncate">{report.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Bottom Utility Items */}
        <div className="space-y-4 pt-4 border-t border-border-main">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleTabClick("Customers")}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-text-muted hover:bg-secondary/50 hover:text-text-main transition-all text-left sidebar-item cursor-pointer"
                title="Contacts"
              >
                <FolderClosed size={18} className="text-text-muted" />
                {!isCollapsed && <span>Contacts</span>}
              </button>
            </li>
          </ul>

          {/* Collapsible Toolbox / Branding Logo */}
          <div className="bg-secondary/50 rounded-xl p-3 border border-border-main/50 text-center">
            {isCollapsed ? (
              <div className="h-5 w-5 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                S
              </div>
            ) : (
              <div className="space-y-1">
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
