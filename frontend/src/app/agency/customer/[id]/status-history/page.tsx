/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { showToast } from "@/components/ToastProvider";
import {
  Clock,
  ArrowLeft,
  Plus,
  RotateCcw,
  Search,
  ChevronDown,
  Calendar,
  FileText,
  Shield,
  Building2,
  Download,
  Edit3,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";

export default function CustomerStatusHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  const DEFAULT_ACTIVITIES = [
    {
      id: "act-1",
      date: "10/09/2026 11:26 AM",
      type: "Note Added",
      description: 'Added note: "Customer policy review completed"',
      user: "AGENCY",
      status: "NOTE CREATED",
      statusType: "success"
    },
    {
      id: "act-2",
      date: "10/07/2026 11:59 PM",
      type: "Note Added",
      description: 'Added note: "Renewal request sent to underwriter"',
      user: "AGENCY",
      status: "NOTE CREATED",
      statusType: "success"
    },
    {
      id: "act-3",
      date: "10/03/2026 11:43 PM",
      type: "Document Uploaded",
      description: "Attached document: PowerHosting_PreAdvance.pdf (1.9 MB)",
      user: "AGENCY",
      status: "DOC. ATTACHED",
      statusType: "info"
    },
    {
      id: "act-4",
      date: "04/17/2026 11:20 AM",
      type: "Master Certificate Created",
      description: "Created Master Certificate of Insurance: ACORD 25 for General Liability Policy #GLSISTC013411026",
      user: "TRAVEL DOLL",
      status: "CERT. GENERATED",
      statusType: "success"
    },
    {
      id: "act-5",
      date: "04/17/2026 10:44 AM",
      type: "Certificate Holder Created",
      description: "Added Holder: Travel Connection Co., 1000 Main St, Suite 101 - Los Angeles, CA",
      user: "KOLB, MONTGOM...",
      status: "HOLDER ADDED",
      statusType: "success"
    },
    {
      id: "act-6",
      date: "08/17/2026 09:50 AM",
      type: "New Policy Added",
      description: "Added Policy: GLSISTC013411026 Commercial Lines - $1,000,000 limit with ISC",
      user: "TRAVEL DOLL",
      status: "POLICY ADDED",
      statusType: "success"
    },
    {
      id: "act-7",
      date: "08/16/2026 02:16 PM",
      type: "Document Attached",
      description: "Attached document: ACORD_125_Commercial_Application.pdf (Application Document)",
      user: "JOANA SARMIENTO",
      status: "DOC. ATTACHED",
      statusType: "info"
    },
    {
      id: "act-8",
      date: "08/16/2026 01:18 PM",
      type: "Form Downloaded",
      description: "Downloaded PDF: ACORD 25 Certificate of Liability Insurance",
      user: "TRAVEL DOLL",
      status: "DOWNLOADED",
      statusType: "info"
    },
    {
      id: "act-9",
      date: "08/16/2026 11:48 AM",
      type: "Note Added",
      description: 'Added Note: "Customer request for updated invoice for policy renewal"',
      user: "KARIM",
      status: "NOTE CREATED",
      statusType: "success"
    },
    {
      id: "act-10",
      date: "08/15/2026 10:00 AM",
      type: "Customer Info Updated",
      description: "Updated customer address: 1234 Oak St, Orlando, FL 32801",
      user: "TRAVEL DOLL",
      status: "UPDATED",
      statusType: "warning"
    }
  ];

  const [activities, setActivities] = useState<any[]>(DEFAULT_ACTIVITIES);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("All Activity Types");
  const [activityUserFilter, setActivityUserFilter] = useState("All Users");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
        customer?.company_name ||
        "Customer";

  const filteredActivities = activities.filter((item) => {
    const q = activitySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.description?.toLowerCase().includes(q) ||
      item.user?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q);

    const matchesType =
      activityTypeFilter === "All Activity Types" ||
      item.type?.toLowerCase().includes(activityTypeFilter.toLowerCase());

    const matchesUser =
      activityUserFilter === "All Users" ||
      item.user?.toLowerCase().includes(activityUserFilter.toLowerCase());

    return matchesSearch && matchesType && matchesUser;
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2d2a26] pb-16 font-sans">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, "_blank", "width=1000,height=900")}
              className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              Log Activity
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-[#f0ece6] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0] shadow-2xs">
                <Clock size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#1f1d1a]">
                  Customer History & Activity Log ({activities.length})
                </h1>
                <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                  View complete history of all activities, notes, policy changes, and document actions
                </p>
              </div>
            </div>

            <button
              onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, "_blank", "width=1000,height=900")}
              className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} className="stroke-[2.5]" />
              Log Activity
            </button>
          </div>

          {/* Filter & Search Bar Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activities, users, or details..."
                className="w-full pl-9 pr-4 py-2 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#1f1d1a] placeholder:text-[#8c827a] outline-none focus:border-[#9A8B7A] shadow-2xs font-medium transition-all"
              />
            </div>

            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="px-3.5 py-2 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] bg-white shadow-2xs cursor-pointer outline-none hover:bg-[#FAF8F5] transition-all"
            >
              <option value="All Activity Types">All Activity Types</option>
              <option value="Note Added">Notes</option>
              <option value="Document">Documents</option>
              <option value="Certificate">Certificates</option>
              <option value="Policy">Policies</option>
              <option value="Updated">Customer Info</option>
            </select>

            <select
              value={activityUserFilter}
              onChange={(e) => setActivityUserFilter(e.target.value)}
              className="px-3.5 py-2 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] bg-white shadow-2xs cursor-pointer outline-none hover:bg-[#FAF8F5] transition-all"
            >
              <option value="All Users">All Users</option>
              <option value="AGENCY">AGENCY</option>
              <option value="TRAVEL DOLL">TRAVEL DOLL</option>
              <option value="KOLB, MONTGOM...">KOLB, MONTGOM...</option>
              <option value="JOANA SARMIENTO">JOANA SARMIENTO</option>
              <option value="KARIM">KARIM</option>
            </select>

            <div className="flex items-center gap-2 px-3.5 py-2 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] bg-white shadow-2xs cursor-pointer hover:bg-[#FAF8F5] transition-all">
              <Calendar size={13} className="text-[#6b5e52]" />
              <span>Select Date Range</span>
              <ChevronDown size={12} className="text-[#6b5e52]" />
            </div>

            <button
              type="button"
              onClick={() => {
                setActivitySearch("");
                setActivityTypeFilter("All Activity Types");
                setActivityUserFilter("All Users");
                showToast("Activity log refreshed", "success");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] bg-white hover:bg-[#FAF8F5] shadow-2xs cursor-pointer transition-all shrink-0"
            >
              <RotateCcw size={13} className="text-[#6b5e52]" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Activities Table */}
          <div className="border border-[#e5ddd5] rounded-2xl overflow-hidden mt-2 bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#e5ddd5]">
                <tr>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Date & Time <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Activity / Event <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Description & Details <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    User / Agent <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Status <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="w-10 px-2 py-3.5 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ddd5]">
                {filteredActivities.map((item, idx) => {
                  const isNote = item.type?.includes("Note");
                  const isDoc = item.type?.includes("Document") || item.type?.includes("Attached");
                  const isCert = item.type?.includes("Master Certificate");
                  const isHolder = item.type?.includes("Holder");
                  const isPolicy = item.type?.includes("Policy");
                  const isDownload = item.type?.includes("Download");
                  const isUpdated = item.type?.includes("Updated");

                  return (
                    <tr key={item.id || idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-[#2d2a26] whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isNote && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            <Plus size={11} className="stroke-[3]" />
                            {item.type}
                          </span>
                        )}
                        {isDoc && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                            <FileText size={12} />
                            {item.type}
                          </span>
                        )}
                        {isCert && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]">
                            <FileText size={12} />
                            {item.type}
                          </span>
                        )}
                        {isHolder && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                            <Building2 size={12} />
                            {item.type}
                          </span>
                        )}
                        {isPolicy && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FDF4EB] text-[#B45309] border border-[#FED7AA]">
                            <Shield size={12} />
                            {item.type}
                          </span>
                        )}
                        {isDownload && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]">
                            <Download size={12} />
                            {item.type}
                          </span>
                        )}
                        {isUpdated && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
                            <Edit3 size={12} />
                            {item.type}
                          </span>
                        )}
                        {!isNote && !isDoc && !isCert && !isHolder && !isPolicy && !isDownload && !isUpdated && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF8F5] text-[#6b5e52] border border-[#e5ddd5]">
                            {item.type}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[#2d2a26] font-medium max-w-md">
                        {item.description}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#4a423b] whitespace-nowrap">
                        {item.user}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.statusType === "success" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#ECFDF5] text-[#059669]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                            {item.status}
                          </span>
                        )}
                        {item.statusType === "info" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#EFF6FF] text-[#2563EB]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                            {item.status}
                          </span>
                        )}
                        {item.statusType === "warning" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FFFBEB] text-[#D97706]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                            {item.status}
                          </span>
                        )}
                        {!item.statusType && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FAF8F5] text-[#6b5e52]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6b5e52]" />
                            {item.status}
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-3.5 text-center">
                        <button
                          type="button"
                          className="p-1 rounded-lg text-[#8c827a] hover:text-[#2d2a26] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
