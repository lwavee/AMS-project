/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("email") || "agent@capco.com");
      setUserRole(localStorage.getItem("role") || "agent");
    }
  }, []);

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
    { name: "Vertafore Suite", icon: Grid, hasSubmenu: true },
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
    <header className="bg-bg-base/90 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm select-none">
      
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
          <span className="text-white font-bold text-xl tracking-wider font-sans">S</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-text-main leading-tight font-sans">
            Sterling Insurance Services
          </span>
          <span className="text-[11px] uppercase tracking-widest text-primary font-bold leading-none mt-0.5">
            Agency Management System
          </span>
        </div>
      </div>

      {/* Right Actions Toolbar */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            onBlur={() => setTimeout(() => setIsNotificationsOpen(false), 200)}
            className="p-2 text-text-muted hover:text-primary hover:bg-secondary/40 rounded-full transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger animate-pulse"></span>
          </button>

          {/* Notification Dropdown Menu */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-border-main rounded-xl shadow-xl py-2 z-[999] animate-in fade-in slide-in-from-top-2 duration-155">
              <div className="px-4 py-2 border-b border-border-main font-bold text-xs text-text-muted uppercase tracking-wider">
                Notifications
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border-main/50">
                  <p className="text-xs text-text-main font-semibold">New customer folder created</p>
                  <span className="text-[11px] text-text-muted">Just now</span>
                </div>
                <div className="px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <p className="text-xs text-text-main font-semibold">System backup completed</p>
                  <span className="text-[11px] text-text-muted">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border-main"></div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => {
              // Only auto-close if the user is not clicking items in the menu
              setTimeout(() => {
                // We use document.activeElement checks or simple timeouts
                // Safe check: do not close if profileView has changed
              }, 250);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-secondary/40 transition-all border border-transparent hover:border-border-main cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-sm border border-border-main shadow-inner uppercase">
              {userEmail ? userEmail.charAt(0) : "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-text-main leading-tight truncate max-w-[120px]">
                {userEmail}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-extrabold leading-none mt-0.5">
                {userRole}
              </span>
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {/* Redesigned User Profile Dropdown holding Unified Navigation Menu */}
          {isProfileOpen && (
            <div 
              onMouseDown={(e) => e.preventDefault()} // Prevents blur event from closing the dropdown when clicking items
              className="absolute right-0 mt-2 w-64 bg-white border border-border-main rounded-2xl shadow-2xl py-3.5 z-[999] animate-in fade-in slide-in-from-top-2 duration-150"
            >
              
              {/* Profile Details Header */}
              <div className="px-4 pb-3 border-b border-border-main flex flex-col mb-2">
                <span className="text-sm font-extrabold text-text-main truncate">{userEmail}</span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-0.5">{userRole}</span>
              </div>

              {profileView === "main" ? (
                /* MAIN NAVIGATION MENU */
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="px-4 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    Main Menu
                  </div>
                  <ul className="space-y-0.5 max-h-[320px] overflow-y-auto px-2">
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
                                // Default clicks close the menu
                                setIsProfileOpen(false);
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-text-main hover:bg-secondary/50 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon size={14} className="text-text-muted group-hover:text-primary transition-colors stroke-[2.2]" />
                              <span>{item.name}</span>
                            </div>
                            {item.hasSubmenu && (
                              <ChevronRight size={13} className="text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-0.5 duration-200" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                /* QUICK ACTIONS SUBMENU */
                <div className="space-y-2.5 animate-in fade-in slide-in-from-right-2 duration-150 px-2">
                  {/* Back Link */}
                  <button
                    onClick={() => setProfileView("main")}
                    className="flex items-center gap-1.5 text-primary font-extrabold text-[11px] uppercase tracking-wider hover:text-primary/80 transition-colors px-3 py-1 cursor-pointer w-full text-left"
                  >
                    <ChevronLeft size={13} className="stroke-[2.5]" />
                    <span>Back to main navigation</span>
                  </button>
                  
                  {/* Divider */}
                  <div className="h-px bg-border-main/50 mx-2"></div>

                  <div className="px-3 py-0.5 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    Quick Actions
                  </div>

                  <ul className="space-y-0.5 max-h-[300px] overflow-y-auto">
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
                            className="w-full text-left px-3 py-2 text-xs font-bold text-text-main hover:bg-secondary/50 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group"
                          >
                            <Icon size={14} className="text-text-muted group-hover:text-primary transition-colors stroke-[2.2]" />
                            <span>{item.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Bottom Separator */}
              <div className="h-px bg-border-main my-2"></div>

              {/* Log Out Action */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-xs font-extrabold text-danger hover:bg-danger/5 hover:text-danger flex items-center gap-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={14} className="stroke-[2.2]" />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          className="p-2 text-text-muted hover:text-primary hover:bg-secondary/40 rounded-lg md:hidden cursor-pointer"
          onClick={onToggleDrawer}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

      </div>
    </header>
  );
}
