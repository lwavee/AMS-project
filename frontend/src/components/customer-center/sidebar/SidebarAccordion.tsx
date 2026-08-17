"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileSignature,
  User,
  Shield,
  FolderOpen,
  Activity,
  AlertTriangle,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";

const STORAGE_KEY = "ams-sidebar-sections";
const COLLAPSED_KEY = "ams-sidebar-collapsed";

interface SidebarAccordionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  customerId: string;
}

/** The full set of tab IDs that the main page handles */
export const ALL_TAB_IDS = [
  "overview",
  "policies",
  "documents",
  "activities",
  "claims",
  "notes",
  "reports",
  "settings",
] as const;

export default function SidebarAccordion({
  activeTab,
  setActiveTab,
  customerId,
}: SidebarAccordionProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const collapsed = localStorage.getItem(COLLAPSED_KEY);
        if (collapsed) return JSON.parse(collapsed);
      } catch {}
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Expanded sections state — default: Views and Forms open
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {
      views: true,
      forms: true,
    };
  });

  // Persist sections state
  const persistSections = useCallback((next: Record<string, boolean>) => {
    setExpandedSections(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = useCallback(
    (key: string) => {
      const next = { ...expandedSections, [key]: !expandedSections[key] };
      persistSections(next);
    },
    [expandedSections, persistSections]
  );

  const handleCollapse = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  // Auto-expand Views section if a view tab is active
  useEffect(() => {
    const viewTabs = ["overview", "policies", "documents", "activities", "claims", "notes"];
    if (viewTabs.includes(activeTab) && !expandedSections.views) {
      const timer = setTimeout(() => {
        persistSections({ ...expandedSections, views: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, expandedSections, persistSections]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleActionNavigate = (url: string) => {
    window.open(url, "_blank");
    setIsMobileOpen(false);
  };

  // ── Render sidebar content ──
  const renderContent = () => (
    <>
      {/* ═══ Views ═══ */}
      <SidebarSection
        title="Views"
        icon={Eye}
        isExpanded={expandedSections.views}
        onToggle={() => toggleSection("views")}
      >
        <SidebarItem
          label="Customer Overview"
          icon={User}
          isActive={activeTab === "overview"}
          onClick={() => handleTabClick("overview")}
        />
        <SidebarItem
          label="Policies"
          icon={Shield}
          isActive={activeTab === "policies"}
          onClick={() => handleTabClick("policies")}
        />
        <SidebarItem
          label="Documents"
          icon={FolderOpen}
          isActive={activeTab === "documents"}
          onClick={() => handleTabClick("documents")}
        />
        <SidebarItem
          label="Activities"
          icon={Activity}
          isActive={activeTab === "activities"}
          onClick={() => handleTabClick("activities")}
        />
        <SidebarItem
          label="Claims"
          icon={AlertTriangle}
          isActive={activeTab === "claims"}
          onClick={() => handleTabClick("claims")}
        />
        <SidebarItem
          label="Notes"
          icon={StickyNote}
          isActive={activeTab === "notes"}
          onClick={() => handleTabClick("notes")}
        />
      </SidebarSection>


      {/* ═══ FORMS ═══ */}
      <SidebarSection
        title="FORMS"
        icon={FileSignature}
        isExpanded={expandedSections.forms}
        onToggle={() => toggleSection("forms")}
      >
        <SidebarItem
          label="Launch eForm..."
          icon={Rocket}
          isAction
          onClick={() => handleActionNavigate(`/agency/customer/${customerId}/eforms-manager`)}
        />
      </SidebarSection>
    </>
  );

  // ── Collapsed state: show only section icons ──
  if (isCollapsed) {
    const sectionIcons = [
      { key: "views", icon: Eye, label: "Views" },
      { key: "forms", icon: FileSignature, label: "FORMS" },
    ];

    return (
      <aside className="sidebar-accordion sidebar-accordion--collapsed w-12 bg-bg-base border-r border-border-main flex flex-col shrink-0 h-full relative z-20">
        {/* Expand button */}
        <div className="h-12 flex items-center justify-center shrink-0 pt-3 pb-1">
          <button
            onClick={handleCollapse}
            className="h-7 w-7 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-secondary rounded-md transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Section icon buttons */}
        <div className="flex-1 flex flex-col py-1 gap-0.5">
          {sectionIcons.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setIsCollapsed(false);
                try {
                  localStorage.setItem(COLLAPSED_KEY, JSON.stringify(false));
                } catch { /* ignore */ }
                const next = { ...expandedSections };
                Object.keys(next).forEach((k) => (next[k] = k === key));
                persistSections(next);
              }}
              title={label}
              className={`h-10 flex items-center justify-center transition-all cursor-pointer ${
                expandedSections[key]
                  ? "text-primary bg-secondary"
                  : "text-text-muted hover:text-text-main hover:bg-secondary/50"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Mobile toggle button ── */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 left-4 z-50 lg:hidden h-10 w-10 rounded-xl bg-white border border-border-main text-text-main shadow-lg flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
        title="Toggle Menu"
      >
        {isMobileOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* ── Sidebar ── */}
      <aside
        className={`
          sidebar-accordion
          bg-bg-base border-r border-border-main flex flex-col shrink-0
          h-full relative z-30
          transition-all duration-300

          /* Desktop: always visible */
          w-[220px]

          /* Mobile: overlay drawer */
          max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-screen max-lg:w-[260px]
          max-lg:shadow-2xl max-lg:z-50
          ${isMobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        `}
      >
        {/* Collapse button container */}
        <div className="h-12 flex items-center justify-between px-3 shrink-0 pt-3 pb-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
            Customer
          </span>
          <button
            onClick={handleCollapse}
            className="h-7 w-7 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-secondary rounded-md transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </div>

        {/* Bottom branding */}
        <div className="shrink-0 p-3 mt-auto">
          <div className="bg-secondary/50 rounded-xl p-3 border border-border-main/50 text-center">
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
          </div>
        </div>
      </aside>
    </>
  );
}
