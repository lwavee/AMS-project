"use client";

import React from "react";
import SidebarAccordion from "./sidebar/SidebarAccordion";

/**
 * NAV_ITEMS kept for backward compatibility —
 * the label lookup in page.tsx uses this to show the active tab name.
 */
export const NAV_ITEMS = [
  { id: "overview", label: "Customer Overview" },
  { id: "policies", label: "Policies" },
  { id: "activities", label: "Activities" },
  { id: "claims", label: "Claims" },
  { id: "notes", label: "Notes" },
  { id: "eforms", label: "eForms" },
  { id: "documents", label: "Documents" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

interface CustomerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  customerId: string;
}

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
  customerId,
}: CustomerSidebarProps) {
  return (
    <SidebarAccordion
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customerId={customerId}
    />
  );
}
