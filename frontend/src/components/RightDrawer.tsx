/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  User, 
  Users, 
  Building2, 
  Search, 
  Bell, 
  HelpCircle, 
  Award, 
  Grid,
  Calendar,
  Clock,
  FileText,
  StickyNote,
  Mail,
  RefreshCw
} from "lucide-react";

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function RightDrawer({ open, onClose }: RightDrawerProps) {
  const [currentView, setCurrentView] = useState<"main" | "quick-actions">("main");

  // Reset to main navigation when drawer is closed
  useEffect(() => {
    if (!open) {
      setCurrentView("main");
    }
  }, [open]);

  // Main menu items with icons and indicator if they have submenus
  const mainItems = [
    { name: "Profile", icon: User, hasSubmenu: false },
    { name: "Quick Actions", icon: Zap, hasSubmenu: true, onClick: () => setCurrentView("quick-actions") },
    { name: "Customer", icon: Users, hasSubmenu: false },
    { name: "Broker", icon: User, hasSubmenu: false },
    { name: "Company", icon: Building2, hasSubmenu: false },
    { name: "Unified Search", icon: Search, hasSubmenu: true },
    { name: "Notifications", icon: Bell, hasSubmenu: false },
    { name: "Help", icon: HelpCircle, hasSubmenu: true },
    { name: "AOR", icon: Award, hasSubmenu: true },
    { name: "Vertafore Suite", icon: Grid, hasSubmenu: true },
  ];

  // Quick actions items with icons
  const quickActionsItems = [
    { name: "New Activity", icon: Calendar },
    { name: "New Suspense", icon: Clock },
    { name: "eForms", icon: FileText },
    { name: "New Note", icon: StickyNote },
    { name: "Form Letters", icon: Mail },
    { name: "Daily Process", icon: RefreshCw },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-[100] transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-screen w-80 bg-white border-l border-border-main shadow-2xl z-[101] flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog" 
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center shrink-0">
          <div className="font-extrabold text-sm text-text-main tracking-tight">
            {currentView === "main" ? "Navigation Menu" : "Quick Actions"}
          </div>
          <button 
            className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm animate-in fade-in"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-bg-base/30">
          
          {currentView === "main" ? (
            /* Main Navigation View */
            <ul className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200">
              {mainItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li 
                    key={item.name} 
                    onClick={item.onClick}
                    className="flex items-center justify-between p-3.5 bg-white hover:bg-secondary/40 border border-border-main rounded-xl transition-all cursor-pointer shadow-sm group hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={16} className="text-slate-400 group-hover:text-primary transition-colors stroke-[2.2]" />
                      <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight size={13} className="text-slate-400 group-hover:text-primary transition-colors group-hover:translate-x-0.5 duration-200" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Quick Actions View */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              
              {/* Back Button */}
              <button
                onClick={() => setCurrentView("main")}
                className="flex items-center gap-2 text-primary font-bold text-xs hover:text-primary/80 transition-colors pb-2 cursor-pointer border-b border-border-main/55 w-full text-left"
              >
                <ChevronLeft size={14} className="stroke-[2.5]" />
                <span>Back to main navigation</span>
              </button>

              {/* Submenu List */}
              <ul className="space-y-2">
                {quickActionsItems.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <li 
                      key={action.name}
                      onClick={() => {
                        if (action.name === "New Activity") {
                          const match = window.location.pathname.match(/\/agency\/customer\/([^\/]+)/);
                          const cid = match ? match[1] : "search";
                          window.open(`/agency/customer/${cid}/new-activity`, '_blank', 'width=1000,height=900');
                          onClose();
                        }
                      }}
                      className="flex items-center gap-3 p-3.5 bg-white hover:bg-secondary/40 border border-border-main rounded-xl transition-all cursor-pointer shadow-sm group hover:scale-[1.01]"
                    >
                      <IconComponent size={16} className="text-slate-400 group-hover:text-primary transition-colors stroke-[2.2]" />
                      <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">
                        {action.name}
                      </span>
                    </li>
                  );
                })}
              </ul>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
