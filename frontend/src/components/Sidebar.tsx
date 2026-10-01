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
  return null;
}
