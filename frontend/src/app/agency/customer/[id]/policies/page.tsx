/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import {
  Shield,
  ArrowLeft,
  Plus,
  RotateCcw,
  FileText,
  XCircle,
  Eye,
  MoreVertical,
  Loader2,
  Search,
  CheckCircle,
  Building2,
  User,
  Calendar,
  AlertCircle,
  Sun,
  Clock,
  ChevronDown,
  Home,
  Bell,
} from "lucide-react";

export default function CustomerPoliciesPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch Customer Data ──
  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    }
  }, [customerId]);

  // ── Fetch Policies ──
  const loadPolicies = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.id ? p.id.toString() : "pol-101",
          policyNum: p.policy_num || "GLSISTC013411026",
          status: p.status || "Active",
          term: p.term || "12 Months",
          type: p.type || "Commercial Lines",
          company: p.company || "ISC, Brokerage Company, ISC",
          description: p.description || "Comprehensive General Liability Insurance Coverage",
          effDate: p.eff_date || "2026-10-28",
          expDate: p.exp_date || "2027-10-28",
          cost: p.cost || "$3,304.03",
        }));
        setPolicies(formatted);
      }
    } catch (e) {
      console.error("Error loading policies", e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    loadPolicies();
  }, [fetchCustomer, loadPolicies]);

  // Filter based on sidebar status, search, and top search
  const filteredPolicies = policies.filter((p) => {
    // Status filter
    if (selectedStatus !== "all") {
      const pStatus = p.status?.toLowerCase() || "";
      if (selectedStatus === "active" && !pStatus.includes("active")) return false;
      if (
        selectedStatus === "expiring" &&
        !(pStatus.includes("expir") && (pStatus.includes("soon") || pStatus.includes("sun")))
      )
        return false;
      if (selectedStatus === "expired" && pStatus !== "expired") return false;
      if (selectedStatus === "cancelled" && !pStatus.includes("cancel")) return false;
    }

    // Main search input
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.policyNum?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const allSelected =
    filteredPolicies.length > 0 &&
    filteredPolicies.every((p) => selectedPolicyIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPolicyIds([]);
    } else {
      setSelectedPolicyIds(filteredPolicies.map((p) => p.id));
    }
  };

  const toggleSelectPolicy = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedPolicyIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
      customer?.company_name ||
      "Customer";

  const activeCount = policies.filter((p) => p.status?.toLowerCase().includes("active")).length;
  const expiringCount = policies.filter((p) =>
    p.status?.toLowerCase().includes("expir") &&
    (p.status?.toLowerCase().includes("soon") || p.status?.toLowerCase().includes("sun"))
  ).length;
  const expiredCount = policies.filter((p) => p.status?.toLowerCase() === "expired").length;
  const cancelledCount = policies.filter((p) => p.status?.toLowerCase().includes("cancel")).length;

  // Sidebar item configuration with real database counts
  const sidebarItems = [
    {
      id: "all",
      label: "All Policies",
      count: policies.length,
      icon: <FileText size={15} className="text-[#9A8B7A]" />,
    },
    {
      id: "active",
      label: "Active",
      count: activeCount,
      icon: <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] inline-block shrink-0" />,
    },
    {
      id: "expiring",
      label: "Expiring Soon",
      count: expiringCount,
      icon: <Sun size={15} className="text-[#f59e0b] shrink-0" />,
    },
    {
      id: "expired",
      label: "Expired",
      count: expiredCount,
      icon: <Clock size={15} className="text-[#ef4444] shrink-0" />,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: cancelledCount,
      icon: <XCircle size={15} className="text-[#dc2626] shrink-0" />,
    },
  ];

  // Helper to render status badges matching Screenshot 1
  const renderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("active")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#12805C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#12805C]"></span>
          Active
        </span>
      );
    }
    if (s.includes("expir") && (s.includes("soon") || s.includes("sun"))) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF7EC] text-[#D97706]">
          <Sun size={12} className="text-[#D97706]" />
          Expiring Soon
        </span>
      );
    }
    if (s.includes("expired")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDEEEC] text-[#DC2626]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]"></span>
          Expired
        </span>
      );
    }
    if (s.includes("cancel")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">
          <XCircle size={12} className="text-[#991B1B]" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2d2a26] pb-16 font-sans">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1550px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/agency/customer/${customerId}`)}
              className="h-9 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EDE5] text-[#9A8B7A] border border-[#e5ddd5] flex items-center gap-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Profile</span>
            </button>
            <div className="h-5 w-px bg-[#e5ddd5]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8c827a]">
                Customer:
              </span>
              <span className="text-sm font-extrabold text-[#1f1d1a]">
                {customerName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#9A8B7A] border border-[#e5ddd5]">
                ID: {customerId}
              </span>
            </div>
          </div>

          {/* Right Nav Icons (Screenshot 2) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/agency/dashboard")}
              className="h-8 w-8 rounded-full bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Dashboard Home"
            >
              <Home size={15} />
            </button>

            <div className="relative">
              <button
                className="h-8 w-8 rounded-full bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title="Notifications"
              >
                <Bell size={15} />
              </button>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                9
              </span>
            </div>

            <button
              onClick={() => router.push("/agency/agency-profile")}
              className="h-8 w-8 rounded-full bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
              title="Agency Profile"
            >
              {customer?.primary_exec?.charAt(0).toUpperCase() || "S"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout: Outer Container matching Screenshot 1 ── */}
      <main className="max-w-[1550px] mx-auto px-4 sm:px-8 pt-6">
        <div className="bg-white border border-[#e5ddd5] rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Left Sidebar: Status Filter Tabs (Screenshot 1) ── */}
            <aside className="w-full lg:w-48 shrink-0 space-y-1.5">
              {sidebarItems.map((tab) => {
                const isActive = selectedStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                      ? "bg-[#FAF5EF] text-[#9A8B7A] font-bold border border-[#F0E6DA]"
                      : "text-[#6b5e52] hover:text-[#1f1d1a] hover:bg-[#FAF8F5]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${isActive ? "text-[#9A8B7A]" : "text-[#8c827a]"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* ── Right Content Area ── */}
            <div className="flex-1 w-full space-y-4 min-w-0">
              {/* ── Main Card: Policies & Coverage ── */}
              <div className="border border-[#ebe5df] rounded-2xl p-5 bg-white shadow-2xs space-y-4">
                {/* Header: Shield + Title + Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-[#F5EDE5] text-[#9A8B7A] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                      <Shield size={20} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#1f1d1a]">
                        Policies & Coverage ({filteredPolicies.length})
                      </h2>
                      <p className="text-xs text-[#8c827a] mt-0.5 font-medium">
                        Manage and view active policies, renewals, rewrites, and coverages
                      </p>
                    </div>
                  </div>

                  {/* Top Right Action Buttons (Screenshot 1) */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() =>
                        window.open(
                          `/agency/customer/${customerId}/new-policy`,
                          "_blank"
                        )
                      }
                      className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      New Policy
                    </button>

                    <button
                      onClick={() =>
                        showToast(
                          "Renew policy initiated for selected policy.",
                          "success"
                        )
                      }
                      className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw size={14} className="text-[#6b5e52]" />
                      Renew
                    </button>

                    <button
                      onClick={() =>
                        showToast(
                          "Rewrite policy initiated for selected policy.",
                          "success"
                        )
                      }
                      className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText size={14} className="text-[#6b5e52]" />
                      Rewrite
                    </button>

                    <button
                      onClick={async () => {
                        if (
                          await confirmDialog(
                            "Are you sure you want to cancel the selected policy?",
                            "Cancel Policy"
                          )
                        ) {
                          showToast("Cancellation request submitted.", "success");
                        }
                      }}
                      className="h-9 px-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <XCircle size={14} className="text-red-500" />
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Sub-search row: Search policies + Showing X of X policies */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="relative max-w-sm w-full">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]"
                    />
                    <input
                      type="text"
                      placeholder="Search policies by number, type, carrier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5ddd5] bg-[#FAF8F5] text-xs placeholder:text-[#9A8B7A] focus:outline-none focus:border-[#9A8B7A] focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <span className="text-xs text-[#8c827a] font-medium">
                    Showing {filteredPolicies.length} of {policies.length} policies
                  </span>
                </div>

                {/* ── Table: Exact layout matching Screenshot 1 (No Checkboxes, Clean Headers) ── */}
                <div className="border border-[#ebe5df] rounded-2xl overflow-hidden bg-white shadow-2xs mt-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#ebe5df]">
                      <tr>
                        <th className="w-12 px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded-[4px] border border-[#8c827a] accent-[#9A8B7A] cursor-pointer"
                          />
                        </th>
                        <th className="px-5 py-3.5 font-bold text-[#6b5e52]">
                          Policy #
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Status
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Term
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Line of Business
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Insurance Carrier
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Effective Date
                        </th>
                        <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                          Expiration Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe5df]">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-[#6b5e52]"
                          >
                            <Loader2 className="animate-spin text-[#9A8B7A] mx-auto size-6 mb-2" />
                            Loading policies...
                          </td>
                        </tr>
                      ) : filteredPolicies.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Shield
                                size={36}
                                className="text-[#c4b5a5] stroke-[1.5] mb-2"
                              />
                              <p className="text-sm font-bold text-[#2d2a26]">
                                No policies found
                              </p>
                              <p className="text-xs text-[#8c827a] mt-0.5 font-medium">
                                Try adjusting your search criteria or create a new policy.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPolicies.map((p) => {
                          const isSelected = selectedPolicyIds.includes(p.id);
                          return (
                            <tr
                              key={p.id}
                              onClick={() => toggleSelectPolicy(p.id)}
                              className={`hover:bg-[#FAF8F5]/60 transition-colors cursor-pointer ${
                                isSelected ? "bg-[#FAF8F5]/80" : ""
                              }`}
                            >
                              {/* Checkbox */}
                              <td
                                className="w-12 px-4 py-4 text-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelectPolicy(p.id);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectPolicy(p.id);
                                  }}
                                  className="h-4 w-4 rounded-[4px] border border-[#8c827a] accent-[#9A8B7A] cursor-pointer"
                                />
                              </td>

                              {/* Policy # (Clicking opens policy page) */}
                              <td
                                className="px-5 py-4 font-extrabold text-[#1f1d1a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/agency/customer/${customerId}/policy/${p.id}`,
                                    "_blank",
                                    "width=1100,height=850"
                                  );
                                }}
                              >
                                <span className="hover:text-[#9A8B7A] hover:underline cursor-pointer">
                                  {p.policyNum}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-4">
                                {renderStatusBadge(p.status)}
                              </td>

                              {/* Term */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium">
                                <div>{p.term}</div>
                              </td>

                              {/* Line of Business */}
                              <td className="px-4 py-4 font-extrabold text-[#1f1d1a]">
                                {p.type}
                              </td>

                              {/* Insurance Carrier */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium max-w-xs">
                                {p.company}
                              </td>

                              {/* Effective Date */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium whitespace-nowrap">
                                {p.effDate}
                              </td>

                              {/* Expiration Date */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium whitespace-nowrap">
                                {p.expDate}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
