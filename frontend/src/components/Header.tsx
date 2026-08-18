/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  LogOut, 
  Bell, 
  User, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Zap, 
  Users, 
  Building2, 
  Search, 
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
import { useRouter } from "next/navigation";

interface HeaderProps {
  onToggleDrawer?: () => void;
  onProfileClick?: () => void;
}

export default function Header({ onToggleDrawer, onProfileClick }: HeaderProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [profileView, setProfileView] = useState<"main" | "quick-actions">("main");

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("email") || "agent@capco.com");
      setUserRole(localStorage.getItem("role") || "agent");
    }
  }, []);

  // Click outside to dismiss profile menu or notifications popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isProfileOpen || isNotificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, isNotificationsOpen]);

  // Reset profile dropdown to main view when closed
  useEffect(() => {
    if (!isProfileOpen) {
      setProfileView("main");
    }
  }, [isProfileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  };

  // Main menu navigation items
  const mainItems = [
    { name: "Profile", icon: User, hasSubmenu: false },
    { name: "Quick Actions", icon: Zap, hasSubmenu: true, onClick: () => setProfileView("quick-actions") },
    { name: "Customer", icon: Users, hasSubmenu: false },
    { name: "Broker", icon: User, hasSubmenu: false },
    { name: "Company", icon: Building2, hasSubmenu: false },
    { name: "Unified Search", icon: Search, hasSubmenu: true },
    { name: "Notifications", icon: Bell, hasSubmenu: false },
    { name: "Help", icon: HelpCircle, hasSubmenu: true },
    { name: "AOR", icon: Award, hasSubmenu: true },
    { name: "Sterling Suite", icon: Grid, hasSubmenu: true },
  ];

  // Quick Action Submenu items
  const quickActionsItems = [
    { name: "New Activity", icon: Calendar },
    { name: "New Suspense", icon: Clock },
    { name: "eForms", icon: FileText },
    { name: "New Note", icon: StickyNote },
    { name: "Form Letters", icon: Mail },
    { name: "Daily Process", icon: RefreshCw },
  ];

  return (
    <header className="bg-white border-b border-[#e5ddd5] h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm select-none">
      
      {/* Brand Logo & Title */}
      <div 
        onClick={() => router.push(userRole === "admin" ? "/admin/dashboard" : "/agency/dashboard")}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
      >
        <img 
          src="/sterling-logo.JPG" 
          alt="Sterling Wholesale Insurance" 
          className="h-7 sm:h-9 w-auto object-contain bg-white rounded"
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-sm sm:text-lg tracking-tight text-[#2d2a26] leading-tight font-sans">
            Sterling AMS
          </span>
          <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#9A8B7A] font-bold leading-none mt-0.5">
            Wholesale Insurance
          </span>
        </div>
      </div>

      {/* Right Actions Toolbar */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Notification Bell Menu Button */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="h-10 w-10 rounded-full bg-[#f5f1eb] hover:bg-[#ede5db] text-[#6b5e52] hover:text-[#2d2a26] flex items-center justify-center transition-all relative cursor-pointer border border-[#e5ddd5]"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          {/* Notification Dropdown Menu */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e5ddd5] rounded-2xl shadow-xl py-2 z-[999] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5ddd5] bg-[#f5f1eb]/60 flex items-center justify-between">
                <span className="font-bold text-xs text-[#2d2a26] uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[10px] font-bold bg-[#9A8B7A] text-white px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#e5ddd5]/50">
                <div className="px-4 py-3 hover:bg-[#f5f1eb] transition-colors cursor-pointer">
                  <p className="text-xs text-[#2d2a26] font-semibold">New policy document attached</p>
                  <span className="text-[11px] text-[#6b5e52]">Just now</span>
                </div>
                <div className="px-4 py-3 hover:bg-[#f5f1eb] transition-colors cursor-pointer">
                  <p className="text-xs text-[#2d2a26] font-semibold">Customer record synced</p>
                  <span className="text-[11px] text-[#6b5e52]">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#e5ddd5]"></div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#f5f1eb] transition-all border border-transparent hover:border-[#e5ddd5] cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-[#9A8B7A] text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase">
              {userEmail ? userEmail.charAt(0) : "S"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2d2a26] leading-tight truncate max-w-[130px]">
                {userEmail}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#9A8B7A] font-extrabold leading-none mt-0.5">
                {userRole}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#6b5e52]" />
          </button>

          {/* User Profile Dropdown */}
          {isProfileOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white border border-[#e5ddd5] rounded-2xl shadow-xl py-3 z-[999] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
            >
              {/* Profile Header */}
              <div className="px-4 pb-3 border-b border-[#e5ddd5] bg-[#f5f1eb]/50 -mt-3 pt-3 mb-2 flex flex-col">
                <span className="text-xs font-bold text-[#2d2a26] truncate">{userEmail}</span>
                <span className="text-[10px] uppercase font-bold text-[#9A8B7A] tracking-wider mt-0.5">{userRole}</span>
              </div>

              {profileView === "main" ? (
                /* MAIN NAVIGATION MENU */
                <div className="space-y-1 animate-in fade-in duration-150">
                  <div className="px-4 py-1 text-[10px] font-bold text-[#6b5e52] uppercase tracking-widest">
                    Quick Menu
                  </div>
                  <ul className="space-y-0.5 max-h-[300px] overflow-y-auto px-2">
                    {mainItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => {
                              if (item.name === "Profile") {
                                if (onProfileClick) {
                                  onProfileClick();
                                } else {
                                  router.push("/agency/dashboard?tab=Agent%20Control");
                                }
                                setIsProfileOpen(false);
                              } else if (item.onClick) {
                                item.onClick();
                              } else {
                                setIsProfileOpen(false);
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2d2a26] hover:bg-[#f5f1eb] hover:text-[#9A8B7A] rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon size={14} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors" />
                              <span>{item.name}</span>
                            </div>
                            {item.hasSubmenu && (
                              <ChevronRight size={13} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                /* QUICK ACTIONS SUBMENU */
                <div className="space-y-2 animate-in fade-in duration-150 px-2">
                  <button
                    onClick={() => setProfileView("main")}
                    className="flex items-center gap-1.5 text-[#9A8B7A] font-bold text-[11px] uppercase tracking-wider hover:text-[#8a6f4d] transition-colors px-3 py-1 cursor-pointer w-full text-left"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                    <span>Back to main</span>
                  </button>
                  
                  <div className="h-px bg-[#e5ddd5]/60 mx-2"></div>

                  <div className="px-3 py-0.5 text-[10px] font-bold text-[#6b5e52] uppercase tracking-widest">
                    Quick Actions
                  </div>

                  <ul className="space-y-0.5 max-h-[280px] overflow-y-auto">
                    {quickActionsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              if (item.name === "New Activity") {
                                const match = window.location.pathname.match(/\/agency\/customer\/([^\/]+)/);
                                const cid = match ? match[1] : "search";
                                window.open(`/agency/customer/${cid}/new-activity`, '_blank', 'width=1000,height=900');
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2d2a26] hover:bg-[#f5f1eb] hover:text-[#9A8B7A] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer group"
                          >
                            <Icon size={14} className="text-[#6b5e52] group-hover:text-[#9A8B7A] transition-colors" />
                            <span>{item.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Separator */}
              <div className="h-px bg-[#e5ddd5] my-2"></div>

              {/* Log Out Action */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          className="p-2 text-[#6b5e52] hover:text-[#2d2a26] hover:bg-[#f5f1eb] rounded-lg md:hidden cursor-pointer"
          onClick={onToggleDrawer}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

      </div>
    </header>
  );
}
