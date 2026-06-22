/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Zap,
  FileSignature,
  BarChart3,
  DollarSign,
  User,
  Shield,
  Activity,
  AlertTriangle,
  StickyNote,
  Plus,
  Edit3,
  UserPlus,
  Upload,
  FileText,
  FilePlus,
  FileCheck,
  FilePen,
  FileWarning,
  ClipboardList,
  BookOpen,
  FolderOpen,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Car,
  FileBox,
  Ban,
  ShieldCheck,
  Building,
  RefreshCw,
  Zap as ZapIcon,
  TriangleAlert,
  Files,
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
  "activities",
  "claims",
  "notes",
  "documents",
  "reports",
  "settings",
] as const;

export default function SidebarAccordion({
  activeTab,
  setActiveTab,
  customerId,
}: SidebarAccordionProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Expanded sections state — default: Views open
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    views: true,
    actions: false,
    eforms: false,
    quickReports: false,
    accounting: false,
  });

  // Load persisted state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpandedSections(JSON.parse(stored));
      }
      const collapsed = localStorage.getItem(COLLAPSED_KEY);
      if (collapsed) {
        setIsCollapsed(JSON.parse(collapsed));
      }
    } catch {
      // ignore
    }
  }, []);

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

  // Auto-expand the section containing the active tab
  useEffect(() => {
    const viewTabs = ["overview", "policies", "activities", "claims", "notes"];
    if (viewTabs.includes(activeTab) && !expandedSections.views) {
      persistSections({ ...expandedSections, views: true });
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleActionNavigate = (url: string) => {
    window.open(url, "_blank");
    setIsMobileOpen(false);
  };

  // ── Coming Soon toast ──
  const showComingSoon = (label: string) => {
    // Create a temporary toast element
    const toast = document.createElement("div");
    toast.className = "ams-coming-soon-toast";
    toast.innerHTML = `<span style="font-weight:700;">${label}</span> — Coming Soon`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("visible");
    });
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
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

      {/* ═══ Actions ═══ */}
      <SidebarSection
        title="Actions"
        icon={Zap}
        isExpanded={expandedSections.actions}
        onToggle={() => toggleSection("actions")}
      >
        <SidebarItem
          label="New Policy"
          icon={Plus}
          isAction
          onClick={() => handleActionNavigate(`/agency/customer/${customerId}/new-policy`)}
        />
        <SidebarItem
          label="Edit Customer"
          icon={Edit3}
          isAction
          onClick={() => router.push("/agency/new-customer")}
        />
        <SidebarItem
          label="Add Contact"
          icon={UserPlus}
          onClick={() => {
            handleTabClick("overview");
            // Scroll to contacts after a brief delay to allow tab switch
            setTimeout(() => {
              const el = document.querySelector('[class*="Contacts"]') ||
                document.querySelector('span.section-title');
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);
          }}
        />
        <SidebarItem
          label="Upload Document"
          icon={Upload}
          onClick={() => handleTabClick("documents")}
        />
      </SidebarSection>

      {/* ═══ eForms ═══ */}
      <SidebarSection
        title="eForms"
        icon={FileSignature}
        isExpanded={expandedSections.eforms}
        onToggle={() => toggleSection("eforms")}
      >
        {/* Launch eForms Manager */}
        <SidebarItem
          label="Launch eForms Manager"
          icon={Rocket}
          isAction
          onClick={() => handleActionNavigate(`/agency/customer/${customerId}/eforms-manager`)}
        />

        {/* "New" sub-header */}
        <div className="px-4 pt-2 pb-1">
          <span className="text-[11px] font-extrabold text-text-main uppercase tracking-wide">
            New
          </span>
        </div>

        <SidebarItem
          label="Applications"
          icon={FilePlus}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Auto ID Card"
          icon={Car}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Binder"
          icon={FileBox}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Cancellation"
          icon={Ban}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Certificate of Liability"
          icon={ShieldCheck}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Certificate of Property"
          icon={Building}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Change Request"
          icon={RefreshCw}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="EPI"
          icon={ZapIcon}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Loss Notice"
          icon={TriangleAlert}
          onClick={() => handleTabClick("eforms")}
        />
        <SidebarItem
          label="Additional Forms"
          icon={Files}
          onClick={() => handleTabClick("eforms")}
        />
      </SidebarSection>

      {/* ═══ Quick Reports ═══ */}
      <SidebarSection
        title="Quick Reports"
        icon={BarChart3}
        isExpanded={expandedSections.quickReports}
        onToggle={() => toggleSection("quickReports")}
      >
        <SidebarItem
          label="Customer Summary"
          icon={ClipboardList}
          isActive={activeTab === "reports"}
          onClick={() => handleTabClick("reports")}
        />
        <SidebarItem
          label="Policy Summary"
          icon={BookOpen}
          onClick={() => handleTabClick("policies")}
        />
        <SidebarItem
          label="Document Report"
          icon={FolderOpen}
          onClick={() => handleTabClick("documents")}
        />
      </SidebarSection>

      {/* ═══ Accounting ═══ */}
      <SidebarSection
        title="Accounting"
        icon={DollarSign}
        isExpanded={expandedSections.accounting}
        onToggle={() => toggleSection("accounting")}
      >
        <SidebarItem
          label="Invoices"
          icon={Receipt}
          disabled
          onClick={() => showComingSoon("Invoices")}
        />
        <SidebarItem
          label="Payments"
          icon={CreditCard}
          disabled
          onClick={() => showComingSoon("Payments")}
        />
        <SidebarItem
          label="Statements"
          icon={FileSpreadsheet}
          disabled
          onClick={() => showComingSoon("Statements")}
        />
      </SidebarSection>
    </>
  );

  // ── Collapsed state: show only section icons ──
  if (isCollapsed) {
    const sectionIcons = [
      { key: "views", icon: Eye, label: "Views" },
      { key: "actions", icon: Zap, label: "Actions" },
      { key: "eforms", icon: FileSignature, label: "eForms" },
      { key: "quickReports", icon: BarChart3, label: "Quick Reports" },
      { key: "accounting", icon: DollarSign, label: "Accounting" },
    ];

    return (
      <aside className="sidebar-accordion sidebar-accordion--collapsed w-12 bg-[#5C4A3E] flex flex-col shrink-0 h-full relative z-20 shadow-[2px_0_12px_rgb(0,0,0,0.08)]">
        {/* Expand button */}
        <button
          onClick={handleCollapse}
          className="h-9 flex items-center justify-center text-[#D4C4B5] hover:text-white hover:bg-[#4A3B32] transition-colors cursor-pointer"
          title="Expand Sidebar"
        >
          <PanelLeftOpen size={15} />
        </button>

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
                // Collapse all, expand only clicked
                Object.keys(next).forEach((k) => (next[k] = k === key));
                persistSections(next);
              }}
              title={label}
              className={`h-10 flex items-center justify-center transition-all cursor-pointer ${expandedSections[key]
                  ? "text-white bg-[#4A3B32]"
                  : "text-[#A99585] hover:text-[#E6D9CC] hover:bg-[#4A3B32]/60"
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
        className="fixed bottom-4 left-4 z-50 lg:hidden h-10 w-10 rounded-xl bg-[#4A3B32] text-white shadow-lg flex items-center justify-center hover:bg-[#3E2C20] transition-colors cursor-pointer"
        title="Toggle Menu"
      >
        {isMobileOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* ── Sidebar ── */}
      <aside
        className={`
          sidebar-accordion
          bg-white border-r border-border-main flex flex-col shrink-0
          h-full relative z-30 shadow-[2px_0_12px_rgb(0,0,0,0.04)]
          transition-all duration-300

          /* Desktop: always visible */
          w-[220px]

          /* Mobile: overlay drawer */
          max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-screen max-lg:w-[260px]
          max-lg:shadow-2xl max-lg:z-50
          ${isMobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        `}
      >
        {/* Collapse button header */}
        <div className="h-9 flex items-center justify-between px-3 bg-[#4A3B32] shrink-0">
          <span className="text-[10px] font-extrabold text-[#D4C4B5] uppercase tracking-[0.15em]">
            Customer
          </span>
          <button
            onClick={handleCollapse}
            className="h-6 w-6 flex items-center justify-center text-[#A99585] hover:text-white rounded transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </div>

        {/* Bottom branding */}
        <div className="shrink-0 border-t border-border-main bg-secondary/30 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-extrabold">
              S
            </div>
            <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">
              Sterling
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
