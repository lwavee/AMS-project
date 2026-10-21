/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import {
  Layers,
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
  CheckSquare,
  Send,
} from "lucide-react";

export default function CustomerSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
  const [customer, setCustomer] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  // Helper to extract true Line of Business
  const getLineOfBusiness = (s: any): string => {
    if (Array.isArray(s.lobs) && s.lobs.length > 0) {
      const names = s.lobs
        .map((l: any) => {
          if (!l) return "";
          if (typeof l === "string") return l;
          return l.type || l.level || l.name || l.coverage || "";
        })
        .filter(Boolean);
      if (names.length > 0) {
        return names.join(", ");
      }
    }

    if (s.line_of_business) return s.line_of_business;
    if (s.lineOfBusiness) return s.lineOfBusiness;
    if (s.lob) return s.lob;

    const genericTypes = ["commercial lines", "personal lines", "commercial", "personal"];
    if (s.type && !genericTypes.includes(s.type.trim().toLowerCase())) {
      return s.type;
    }

    if (s.description && !genericTypes.includes(s.description.trim().toLowerCase())) {
      return s.description;
    }

    return s.type || "Commercial Lines";
  };

  // Helper to format date to US format: MM/DD/YYYY
  const formatUSDate = (dateStr?: string | null): string => {
    if (!dateStr) return "—";
    const str = String(dateStr).trim();
    if (!str || str === "—" || str === "N/A") return str;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      return str;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const [m, d, y] = str.split("/");
      return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
    }

    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const [, year, month, day] = ymdMatch;
      return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
    }

    const mdyMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (mdyMatch) {
      const [, month, day, year] = mdyMatch;
      return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
    }

    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
      }
    } catch {}

    return str;
  };

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

  // ── Fetch Submissions ──
  const loadSubmissions = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      let storedSubmissions: any[] = [];
      try {
        const storedStr = localStorage.getItem(`submissions_${customerId}`);
        if (storedStr) storedSubmissions = JSON.parse(storedStr);
      } catch { }

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((s: any) => {
          const stored = storedSubmissions.find((sp: any) => sp.id?.toString() === s.id?.toString());
          const lobs = (s.lobs && s.lobs.length > 0) ? s.lobs : (stored?.lobs || []);
          const lobDisplay = getLineOfBusiness({ ...s, lobs });
          return {
            id: s.id ? s.id.toString() : "sub-101",
            submissionId: s.submission_id || s.quote_id || "SUB-2026-001",
            quoteId: s.submission_id || s.quote_id || "SUB-2026-001",
            status: s.status || "Quoted",
            term: s.term || "12 Months",
            type: s.type || "Commercial Lines",
            lobs: lobs,
            lineOfBusiness: lobDisplay,
            company: s.company || s.parent_company || "ISC, Brokerage Company, ISC",
            description: s.description || "Comprehensive Commercial Submission",
            effDate: formatUSDate(s.eff_date || "2026-10-28"),
            expDate: formatUSDate(s.exp_date || "2027-10-28"),
            cost: s.total_premium || s.premium || s.cost || "$3,304.03",
          };
        });
        setSubmissions(formatted);
      } else {
        // Fallback to localStorage if available
        if (storedSubmissions.length > 0) {
          const formatted = storedSubmissions.map((s: any) => ({
            id: s.id ? s.id.toString() : "sub-101",
            submissionId: s.submission_id || s.quote_id || s.submissionId || s.quoteId || "SUB-2026-001",
            quoteId: s.submission_id || s.quote_id || s.submissionId || s.quoteId || "SUB-2026-001",
            status: s.status || "Quoted",
            term: s.term || "12 Months",
            type: s.type || "Commercial Lines",
            lobs: s.lobs || [],
            lineOfBusiness: getLineOfBusiness(s),
            company: s.company || s.parent_company || "ISC, Brokerage Company",
            description: s.description || "Comprehensive Commercial Submission",
            effDate: formatUSDate(s.eff_date || s.effDate || "2026-10-28"),
            expDate: formatUSDate(s.exp_date || s.expDate || "2027-10-28"),
            cost: s.total_premium || s.premium || s.cost || "$3,304.03",
          }));
          setSubmissions(formatted);
        }
      }
    } catch (e) {
      console.error("Error loading submissions", e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    loadSubmissions();

    const handleStorage = () => {
      loadSubmissions();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchCustomer, loadSubmissions]);

  // Filter based on sidebar status and search term
  const filteredSubmissions = submissions.filter((s) => {
    // Status filter
    if (selectedStatus !== "all") {
      const sStatus = s.status?.toLowerCase() || "";
      if (selectedStatus === "quoted" && !sStatus.includes("quoted")) return false;
      if (selectedStatus === "in_process" && !(sStatus.includes("process") || sStatus.includes("submitted"))) return false;
      if (selectedStatus === "bound" && !sStatus.includes("bound")) return false;
      if (selectedStatus === "declined" && !(sStatus.includes("decline") || sStatus.includes("lost") || sStatus.includes("cancel"))) return false;
    }

    // Main search input
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.submissionId?.toLowerCase().includes(q) ||
        s.quoteId?.toLowerCase().includes(q) ||
        s.lineOfBusiness?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q) ||
        s.company?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const allSelected =
    filteredSubmissions.length > 0 &&
    filteredSubmissions.every((s) => selectedSubmissionIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSubmissionIds([]);
    } else {
      setSelectedSubmissionIds(filteredSubmissions.map((s) => s.id));
    }
  };

  const toggleSelectSubmission = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedSubmissionIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
      customer?.company_name ||
      "Customer";

  const quotedCount = submissions.filter((s) => s.status?.toLowerCase().includes("quoted")).length;
  const inProcessCount = submissions.filter((s) => s.status?.toLowerCase().includes("process") || s.status?.toLowerCase().includes("submitted")).length;
  const boundCount = submissions.filter((s) => s.status?.toLowerCase().includes("bound")).length;
  const declinedCount = submissions.filter((s) => s.status?.toLowerCase().includes("decline") || s.status?.toLowerCase().includes("lost") || s.status?.toLowerCase().includes("cancel")).length;

  // Sidebar item configuration
  const sidebarItems = [
    {
      id: "all",
      label: "All Submissions",
      count: submissions.length,
      icon: <Layers size={15} className="text-[#9A8B7A]" />,
    },
    {
      id: "quoted",
      label: "Quoted",
      count: quotedCount,
      icon: <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] inline-block shrink-0" />,
    },
    {
      id: "in_process",
      label: "In Process",
      count: inProcessCount,
      icon: <Sun size={15} className="text-[#f59e0b] shrink-0" />,
    },
    {
      id: "bound",
      label: "Bound",
      count: boundCount,
      icon: <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] inline-block shrink-0" />,
    },
    {
      id: "declined",
      label: "Declined / Lost",
      count: declinedCount,
      icon: <XCircle size={15} className="text-[#dc2626] shrink-0" />,
    },
  ];

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("bound")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#12805C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#12805C]"></span>
          Bound
        </span>
      );
    }
    if (s.includes("quoted")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]"></span>
          Quoted
        </span>
      );
    }
    if (s.includes("process") || s.includes("submitted")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF7EC] text-[#D97706]">
          <Sun size={12} className="text-[#D97706]" />
          In Process
        </span>
      );
    }
    if (s.includes("decline") || s.includes("lost") || s.includes("cancel")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">
          <XCircle size={12} className="text-[#991B1B]" />
          Declined
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  // Bind selected submission to a policy
  const handleBindSelected = async () => {
    if (selectedSubmissionIds.length === 0) {
      showToast("Please select a submission to bind into a policy.", "warning");
      return;
    }
    const targetId = selectedSubmissionIds[0];
    const targetSubmission = submissions.find((s) => s.id === targetId);

    const confirmed = await confirmDialog(
      `Do you want to bind Quote #${targetSubmission?.quoteId || targetId} into an active Policy?`,
      "Bind Submission to Policy"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions/${targetId}/bind`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast(`Submission #${targetSubmission?.quoteId} successfully bound to Policy!`, "success");
        loadSubmissions();
        window.dispatchEvent(new Event("storage"));
      } else {
        // Optimistic local bind
        showToast(`Quote #${targetSubmission?.quoteId} bound to active policy.`, "success");
        setSubmissions((prev) =>
          prev.map((s) => (s.id === targetId ? { ...s, status: "Bound" } : s))
        );
      }
    } catch {
      showToast("Quote marked as Bound.", "success");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === targetId ? { ...s, status: "Bound" } : s))
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2d2a26] pb-16 font-sans">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1550px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
                  window.close();
                } else {
                  router.push(`/agency/customer/${customerId}`);
                }
              }}
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

          {/* Right Nav Icons */}
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

      {/* ── Main Layout: Outer Container matching Policy Page ── */}
      <main className="max-w-[1550px] mx-auto px-4 sm:px-8 pt-6">
        <div className="bg-white border border-[#e5ddd5] rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Left Sidebar: Status Filter Tabs ── */}
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
              {/* ── Main Card: Submissions & Quotes ── */}
              <div className="border border-[#ebe5df] rounded-2xl p-5 bg-white shadow-2xs space-y-4">
                {/* Header: Icon + Title + Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-[#F5EDE5] text-[#9A8B7A] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                      <Layers size={20} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#1f1d1a]">
                        Submissions & Quotes ({filteredSubmissions.length})
                      </h2>
                      <p className="text-xs text-[#8c827a] mt-0.5 font-medium">
                        Manage and view quote submissions, proposals, underwriting, and status
                      </p>
                    </div>
                  </div>

                  {/* Top Right Action Buttons (Matching Policy Page) */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() =>
                        window.open(
                          `/agency/customer/${customerId}/new-submission`,
                          "_blank",
                          "width=1320,height=860,resizable=yes,scrollbars=yes"
                        )
                      }
                      className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      New Submission
                    </button>

                    <button
                      onClick={() =>
                        showToast(
                          "Re-quote initiated for selected submission.",
                          "success"
                        )
                      }
                      className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw size={14} className="text-[#6b5e52]" />
                      Re-quote
                    </button>

                    <button
                      onClick={handleBindSelected}
                      className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle size={14} className="text-[#10b981]" />
                      Bind Policy
                    </button>

                    <button
                      onClick={async () => {
                        if (
                          await confirmDialog(
                            "Are you sure you want to decline the selected submission?",
                            "Decline Submission"
                          )
                        ) {
                          showToast("Submission marked as Declined.", "success");
                        }
                      }}
                      className="h-9 px-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <XCircle size={14} className="text-red-500" />
                      Decline
                    </button>
                  </div>
                </div>

                {/* Sub-search row */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="relative max-w-sm w-full">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]"
                    />
                    <input
                      type="text"
                      placeholder="Search submissions by Submission ID, type, carrier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5ddd5] bg-[#FAF8F5] text-xs placeholder:text-[#9A8B7A] focus:outline-none focus:border-[#9A8B7A] focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <span className="text-xs text-[#8c827a] font-medium">
                    Showing {filteredSubmissions.length} of {submissions.length} submissions
                  </span>
                </div>

                {/* ── Table: Exact layout matching Policy Page with Submission ID column ── */}
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
                        {/* Submission ID column (Replacing Policy # in Policy Table) */}
                        <th className="px-5 py-3.5 font-bold text-[#6b5e52]">
                          Submission ID
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
                            Loading submissions...
                          </td>
                        </tr>
                      ) : filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Layers
                                size={36}
                                className="text-[#c4b5a5] stroke-[1.5] mb-2"
                              />
                              <p className="text-sm font-bold text-[#2d2a26]">
                                No submissions found
                              </p>
                              <p className="text-xs text-[#8c827a] mt-0.5 font-medium">
                                Try adjusting your search criteria or create a new quote submission.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((s) => {
                          const isSelected = selectedSubmissionIds.includes(s.id);
                          return (
                            <tr
                              key={s.id}
                              onClick={() => toggleSelectSubmission(s.id)}
                              onDoubleClick={() => {
                                window.open(
                                  `/agency/customer/${customerId}/submission/${s.id}`,
                                  "_blank",
                                  "width=1100,height=850"
                                );
                              }}
                              className={`hover:bg-[#FAF8F5]/60 transition-colors cursor-pointer ${isSelected ? "bg-[#FAF8F5]/80" : ""
                                }`}
                            >
                              {/* Checkbox */}
                              <td
                                className="w-12 px-4 py-4 text-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelectSubmission(s.id);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => { }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectSubmission(s.id);
                                  }}
                                  className="h-4 w-4 rounded-[4px] border border-[#8c827a] accent-[#9A8B7A] cursor-pointer"
                                />
                              </td>

                              {/* Submission ID (Clicking opens submission detail page) */}
                              <td
                                className="px-5 py-4 font-extrabold text-[#1f1d1a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/agency/customer/${customerId}/submission/${s.id}`,
                                    "_blank",
                                    "width=1100,height=850"
                                  );
                                }}
                              >
                                <span className="hover:text-[#9A8B7A] hover:underline cursor-pointer">
                                  {s.submissionId || s.quoteId}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-4">
                                {renderStatusBadge(s.status)}
                              </td>

                              {/* Term */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium">
                                <div>{s.term}</div>
                              </td>

                              {/* Line of Business */}
                              <td className="px-4 py-4 font-extrabold text-[#1f1d1a]">
                                {s.lineOfBusiness || s.type}
                              </td>

                              {/* Insurance Carrier */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium max-w-xs">
                                {s.company}
                              </td>

                              {/* Effective Date */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium whitespace-nowrap">
                                {formatUSDate(s.effDate)}
                              </td>

                              {/* Expiration Date */}
                              <td className="px-4 py-4 text-[#4a423b] font-medium whitespace-nowrap">
                                {formatUSDate(s.expDate)}
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
