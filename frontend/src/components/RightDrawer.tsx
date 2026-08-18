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
    { name: "Sterling Suite", icon: Grid, hasSubmenu: true },
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
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[100] transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-screen w-80 bg-white border-l border-[#e5ddd5] shadow-2xl z-[101] flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog" 
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="bg-[#f5f1eb]/80 px-5 py-4 border-b border-[#e5ddd5] flex justify-between items-center shrink-0">
          <div className="font-extrabold text-sm text-[#2d2a26] tracking-tight">
            {currentView === "main" ? "Navigation Menu" : "Quick Actions"}
          </div>
          <button 
            className="bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] border border-[#e5ddd5] h-7 w-7 flex items-center justify-center rounded-lg transition-all font-bold text-xs cursor-pointer shadow-xs"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#FAF8F5]">
          
          {currentView === "main" ? (
            /* Main Navigation View */
            <ul className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200">
              {mainItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li 
                    key={item.name} 
                    onClick={item.onClick}
                    className="flex items-center justify-between p-3.5 bg-white hover:bg-[#f5f1eb] border border-[#e5ddd5] rounded-xl transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={16} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors stroke-[2.2]" />
                      <span className="text-xs font-bold text-[#2d2a26] group-hover:text-[#9A8B7A] transition-colors">
                        {item.name}
                      </span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight size={13} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors group-hover:translate-x-0.5 duration-200" />
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
                className="flex items-center gap-2 text-[#9A8B7A] font-bold text-xs hover:text-[#8a6f4d] transition-colors pb-2 cursor-pointer border-b border-[#e5ddd5] w-full text-left"
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
                      className="flex items-center gap-3 p-3.5 bg-white hover:bg-[#f5f1eb] border border-[#e5ddd5] rounded-xl transition-all cursor-pointer shadow-xs group"
                    >
                      <IconComponent size={16} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors stroke-[2.2]" />
                      <span className="text-xs font-bold text-[#2d2a26] group-hover:text-[#9A8B7A] transition-colors">
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
