/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../lib/config";
import { confirmDialog } from "@/components/ToastProvider";
import {
  ArrowLeft,
  User,
  FileText,
  Activity,
  StickyNote,
  AlertTriangle,
  Download,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Calendar,
  Shield,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Home,
  Bell,
  ChevronDown,
  Edit3,
  ExternalLink,
  Briefcase
} from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Policies State
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);

  // Bottom Tabs - Default to "notes" as requested in screenshot 3
  const [activeTab, setActiveTab] = useState<
    "notes" | "status_history" | "contact_info" | "rating_info" | "all_policies" | "eforms"
  >("notes");

  // Notify Filter Pills for Notes (Screenshot 3)
  const [noteFilters, setNoteFilters] = useState<string[]>(["Underwriter"]);
  const toggleNoteFilter = (filter: string) => {
    setNoteFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  // Documents State (Screenshot 4)
  const [documents, setDocuments] = useState<any[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [docAction, setDocAction] = useState("Upload");
  const [docDescription, setDocDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  // Activities State
  const [activities, setActivities] = useState<any[]>([]);

  // Action Menu Dropdown
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // ── Fetch Customer Data ──
  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        setError("Customer not found.");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  // ── Fetch Policies ──
  const loadPolicies = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.id.toString(),
          policyNum: p.policy_num || "Not Bound",
          status: p.status || "Active",
          term: p.term || "1 Year",
          type: p.type || "General Liability",
          company: p.company || "Kinsale Insurance Company",
          description: p.description || "Policy Coverage",
          effDate: p.eff_date || "08/17/2026",
          expDate: p.exp_date || "08/17/2027",
          cost: p.cost || "$3,304.03",
        }));
        setPolicies(formatted);
      }
    } catch (e) {
      console.error("Error loading policies", e);
    }
  }, [customerId]);

  // ── Fetch Documents ──
  const loadDocuments = useCallback(async () => {
    setDocLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({
          id: d.id,
          fileName: d.file_name,
          ext: d.ext,
          action: d.action,
          description: d.description,
          refNum: d.ref_num,
          url: d.url,
          author: d.author,
          createdAt: d.created_at || new Date().toISOString().split("T")[0],
        }));
        setDocuments(formatted);
      }
    } catch (e) {
      console.error("Error loading documents:", e);
    } finally {
      setDocLoading(false);
    }
  }, [customerId]);

  // ── Fetch Notes ──
  const loadNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  }, [customerId]);

  // ── Fetch Activities ──
  const loadActivities = useCallback(() => {
    const defaultMocks = [
      {
        id: "act-1",
        date: "08/17/2026 11:20 AM",
        action: "Master Certificate Created",
        description: "Created Master Certificate of Insurance ACORD 25 for General Liability Policy #POL-GL-101",
        by: "TRAVIS BELL",
        trans: "Certificate Issued",
      },
      {
        id: "act-2",
        date: "08/17/2026 10:45 AM",
        action: "Certificate Holder Created",
        description: "Added Holder: Turner Construction Co. (1000 Main St, Dallas TX) - Loss Payee Attached",
        by: "KEILA MONTOYA",
        trans: "Holder Active",
      },
      {
        id: "act-3",
        date: "08/17/2026 09:30 AM",
        action: "New Policy Added",
        description: "Added Policy #POL-GL-101 (General Liability - $3,304.03 Premium) written by Kinsale Insurance Company",
        by: "TRAVIS BELL",
        trans: "Policy Active",
      },
      {
        id: "act-4",
        date: "08/16/2026 03:40 PM",
        action: "Document Attached",
        description: "Attached Document: ACORD_125_Commercial_Application.pdf (Uploaded to Document Repository)",
        by: "JOANA PARUNGAO",
        trans: "Doc Attached",
      },
      {
        id: "act-5",
        date: "08/16/2026 01:15 PM",
        action: "eForm Downloaded",
        description: "Downloaded PDF: ACORD 25 Certificate of Liability Insurance",
        by: "TRAVIS BELL",
        trans: "Downloaded",
      },
      {
        id: "act-6",
        date: "08/15/2026 04:50 PM",
        action: "Note Added",
        description: "Added Note: 'Underwriter requested updated loss runs for prior 3 years'",
        by: "KAPIL",
        trans: "Note Created",
      },
      {
        id: "act-7",
        date: "08/14/2026 10:00 AM",
        action: "Customer Profile Created",
        description: "New Commercial Customer Account Initialized in Sterling AMS",
        by: "TRAVIS BELL",
        trans: "Active",
      },
    ];

    const stored = localStorage.getItem(`activities_log_${customerId}`);
    if (stored) {
      try {
        const storedList = JSON.parse(stored);
        setActivities(storedList.length > 0 ? storedList : defaultMocks);
      } catch (e) {
        setActivities(defaultMocks);
      }
    } else {
      setActivities(defaultMocks);
      localStorage.setItem(`activities_log_${customerId}`, JSON.stringify(defaultMocks));
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      loadPolicies();
      loadDocuments();
      loadNotes();
      loadActivities();
    }
  }, [customerId, fetchCustomer, loadPolicies, loadDocuments, loadNotes, loadActivities]);

  // ── Upload Document Handler ──
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setPendingFile(e.dataTransfer.files[0]);
      setDocDescription(e.dataTransfer.files[0].name);
      setShowDocModal(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFile(e.target.files[0]);
      setDocDescription(e.target.files[0].name);
      setShowDocModal(true);
    }
  };

  const handleSaveDocument = async () => {
    if (!pendingFile) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("action", docAction);
      formData.append("description", docDescription || pendingFile.name);

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      await loadDocuments();
      setShowDocModal(false);

      // Log Activity to Status History
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const newAct = {
        id: `act-doc-${Date.now()}`,
        date: dateStr,
        action: "Document Attached",
        description: `Attached Document: ${docDescription || pendingFile.name} (${docAction})`,
        by: (localStorage.getItem("email") || "Agent").split("@")[0].toUpperCase(),
        trans: "Doc Attached"
      };
      const key = `activities_log_${customerId}`;
      const stored = localStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newAct, ...list];
      localStorage.setItem(key, JSON.stringify(updated));
      setActivities(updated);

      setPendingFile(null);
    } catch (err: any) {
      alert("Document upload failed: " + err.message);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!(await confirmDialog("Are you sure you want to delete this document?", "Delete Document"))) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));

        // Log Activity to Status History
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newAct = {
          id: `act-doc-del-${Date.now()}`,
          date: dateStr,
          action: "Document Deleted",
          description: `Deleted Document (ID #${docId})`,
          by: (localStorage.getItem("email") || "Agent").split("@")[0].toUpperCase(),
          trans: "Doc Deleted"
        };
        const key = `activities_log_${customerId}`;
        const stored = localStorage.getItem(key);
        const list = stored ? JSON.parse(stored) : [];
        const updated = [newAct, ...list];
        localStorage.setItem(key, JSON.stringify(updated));
        setActivities(updated);
      }
    } catch (e) {
      console.error("Failed to delete document", e);
    }
  };

  // ── Add Note Handler (Screenshot 3) ──
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setNoteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("email") || "Agent";
      const userName = userEmail.split("@")[0].toUpperCase();
      const userRole = localStorage.getItem("role") || "agent";

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newNoteText.trim(),
          author: userName,
          role: userRole,
          notify: noteFilters.join(", "),
        }),
      });

      if (res.ok) {
        const textSnippet = newNoteText.trim();
        setNewNoteText("");
        loadNotes();

        // Log Activity to Status History
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newAct = {
          id: `act-note-${Date.now()}`,
          date: dateStr,
          action: "Note Added",
          description: `Added Note: "${textSnippet.slice(0, 50)}${textSnippet.length > 50 ? '...' : ''}"`,
          by: userName,
          trans: "Note Created"
        };
        const key = `activities_log_${customerId}`;
        const stored = localStorage.getItem(key);
        const list = stored ? JSON.parse(stored) : [];
        const updated = [newAct, ...list];
        localStorage.setItem(key, JSON.stringify(updated));
        setActivities(updated);
      }
    } catch (e) {
      console.error("Failed to add note", e);
    } finally {
      setNoteLoading(false);
    }
  };

  // ── Export CSV Handler ──
  const handleExport = () => {
    if (!customer) return;
    const rows = Object.entries(customer)
      .map(([k, v]) => `"${k}","${String(v || "").replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sterling_ams_customer_${customer.id}_${(customer.name || "profile").replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div suppressHydrationWarning className="flex flex-col h-screen bg-[#f5f1eb] font-sans items-center justify-center">
        <div className="bg-white px-8 py-6 rounded-2xl border border-[#e5ddd5] shadow-md flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#9A8B7A]" size={32} />
          <span className="font-bold text-xs uppercase tracking-widest text-[#6b5e52]">
            Loading Customer Profile...
          </span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div suppressHydrationWarning className="flex flex-col h-screen bg-[#f5f1eb] font-sans items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#e5ddd5] shadow-lg max-w-md text-center">
          <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#2d2a26] mb-1">Customer Not Found</h2>
          <p className="text-xs text-[#6b5e52] mb-5">{error || "The requested customer profile could not be loaded."}</p>
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="px-5 py-2 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Display Fields
  const displayName = customer.name || customer.firm_name || [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Bell Welding & Construction LLC";
  const customerIdFormatted = customer.id || "26";
  const primaryExec = customer.primary_exec || customer.representative || "Travis Bell";
  const fullAddress = [customer.address, customer.address2, customer.city, customer.state, customer.zip].filter(Boolean).join(", ") || "1325 Woodbine Cliff Dr, Fort Worth, Texas, 76179";
  const displayPhone = customer.phone || customer.phone_business || customer.cell || "(682) 351-8069";
  const displayEmail = customer.email || customer.email2 || "bellwelding1@gmail.com";
  const customerStatus = (customer.status || "Active").toUpperCase();
  const customerType = customer.type || "Commercial";
  const createDate = customer.customer_added_date || customer.created_date || "2026-07-24";
  const agencyDivision = customer.division || "Gamaty Insurance Agency LLC DBA Capital & Co";
  const preferredMethod = customer.preferred_method || customer.electronic_delivery || "Direct / Email";

  // Policies List
  const activeLOBList = policies.length > 0 ? policies : [
    {
      id: "lob-default",
      type: "General Liability",
      company: "Kinsale Insurance Company",
      policyNum: "Not Bound",
      cost: "$3,304.03",
      effDate: "08/17/2026 - 08/17/2027",
      description: "General Liability Policy",
    }
  ];
  const currentLOB = activeLOBList[selectedPolicyIndex] || activeLOBList[0];

  return (
    <div suppressHydrationWarning className="flex flex-col min-h-screen bg-[#f5f1eb] font-sans text-[#2d2a26] antialiased select-none w-full">

      {/* ── Top Header (Back Button & Sterling Signature Icons) ── */}
      <header className="bg-white border-b border-[#e5ddd5] px-6 py-3 flex items-center justify-between shrink-0 shadow-xs sticky top-0 z-40 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push("/agency/dashboard")}
          className="h-8 w-8 rounded-full border border-[#e5ddd5] hover:bg-[#f5f1eb] flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
        </button>

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
            {primaryExec.charAt(0).toUpperCase() || "G"}
          </button>
        </div>
      </header>

      {/* ── Main Customer Body ── */}
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 space-y-6">

        {/* ── 1. Customer Basic Detail Card (Screenshot 2) ── */}
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm space-y-5 w-full">

          {/* Header Title + ID */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[#2d2a26] tracking-tight">
                  {displayName}
                </h1>
                <span className={`px-2.5 py-0.5 border text-[11px] font-bold uppercase rounded-md tracking-wider ${customerStatus === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-[#f5f1eb] text-[#6b5e52] border-[#e5ddd5]"
                  }`}>
                  {customerStatus}
                </span>
                <span className="px-2.5 py-0.5 bg-[#f5f1eb] border border-[#e5ddd5] text-[#6b5e52] text-[11px] font-semibold rounded-md">
                  {customerType}
                </span>
              </div>
              <p className="text-xs text-[#6b5e52] font-semibold mt-1">
                Customer ID: {customerIdFormatted}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-xs font-semibold text-[#6b5e52]">
                Customer #{customerIdFormatted}
              </span>
            </div>
          </div>

          {/* Meta Info Row: Exec, Address, Phone, Email */}
          <div className="flex items-center gap-6 flex-wrap text-xs text-[#6b5e52] pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <User size={14} className="text-[#9A8B7A]" />
              <span>{primaryExec}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-[#9A8B7A]" />
              <span>{fullAddress}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Phone size={14} className="text-[#9A8B7A]" />
              <span>{displayPhone}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Mail size={14} className="text-[#9A8B7A]" />
              {displayEmail !== "—" ? (
                <a href={`mailto:${displayEmail}`} className="hover:underline text-[#2d2a26]">
                  {displayEmail}
                </a>
              ) : (
                <span>No email</span>
              )}
            </div>
          </div>

          {/* ── Top Action Buttons (Screenshot 1 & Screenshot 2) ── */}
          <div className="pt-4 border-t border-[#f0e5d8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

            {/* Left Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2d2a26]">Customer Profile</span>
              <span className="px-2.5 py-0.5 bg-[#f5f1eb] border border-[#e5ddd5] text-[#6b5e52] text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                {customerStatus}
              </span>
            </div>

            {/* Right Action Button Group (Screenshot 1 Pill Buttons) */}
            <div className="flex items-center gap-2.5 flex-wrap relative">

              {/* Divider */}
              <div className="h-6 w-px bg-[#e5ddd5] mx-1 hidden sm:block" />


              {/* Edit Customer */}
              <button
                onClick={() => router.push(`/agency/new-customer`)}
                className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Edit3 size={13} className="text-[#6b5e52]" />
                Edit Customer
              </button>

            </div>

          </div>

          {/* Customer Summary Grid (Screenshot 2) */}
          <div className="pt-4 border-t border-[#f0e5d8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-[#6b5e52]">Total Policies:</p>
              <p className="text-base font-extrabold text-[#2d2a26] mt-0.5">
                {policies.length} {policies.length === 1 ? "Policy" : "Policies"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#6b5e52]">Customer Since:</p>
              <p className="text-sm font-semibold text-[#2d2a26] mt-0.5">{createDate}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#6b5e52]">Agency / Division:</p>
              <p className="text-xs font-semibold text-[#2d2a26] mt-0.5 leading-snug">{agencyDivision}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#6b5e52]">Primary Executive:</p>
              <p className="text-sm font-semibold text-[#2d2a26] mt-0.5">{primaryExec}</p>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 pt-1">
              <p className="text-xs font-bold text-[#6b5e52]">Delivery Preference:</p>
              <p className="text-sm font-semibold text-[#2d2a26] mt-0.5">{preferredMethod}</p>
            </div>
          </div>

        </div>

        {/* ── 2. Policy Detail & Active Policies Section ── */}
        <div id="policies-section" className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm space-y-6 w-full">

          {/* Policy Section Header + Action Pill Buttons */}
          <div className="border-b border-[#e5ddd5] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#2d2a26] flex items-center gap-2">
                <Shield size={18} className="text-[#795C46]" />
                Policies & Coverage ({policies.length})
              </h2>
              <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                Manage and view active policies, renewals, rewrites, and coverages
              </p>
            </div>

            {/* Action Pill Buttons on Policy Table Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => window.open(`/agency/customer/${customerId}/new-policy`, "_blank")}
                className="h-8 px-4 bg-[#795C46] hover:bg-[#634b39] text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
              >
                <Plus size={13} />
                New Policy
              </button>

              <button
                onClick={() => alert("Renew policy initiated for selected policy.")}
                className="h-8 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Renew
              </button>

              <button
                onClick={() => alert("Rewrite policy initiated for selected policy.")}
                className="h-8 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Rewrite
              </button>

              <button
                onClick={async () => {
                  if (await confirmDialog("Are you sure you want to cancel the selected policy?", "Cancel Policy")) {
                    alert("Cancellation request submitted.");
                  }
                }}
                className="h-8 px-4 bg-white border border-[#e5ddd5] hover:bg-red-50 hover:text-red-700 text-[#2d2a26] text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* ── Policy Table ── */}
          <div className="border border-[#e5ddd5] rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] text-[#6b5e52] font-bold border-b border-[#e5ddd5]">
                <tr>
                  <th className="w-12 text-center py-2.5 px-3">Select</th>
                  <th className="px-4 py-2.5">Policy #</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Term</th>
                  <th className="px-4 py-2.5">Line of Business</th>
                  <th className="px-4 py-2.5">Insurance Carrier</th>
                  <th className="px-4 py-2.5">Effective Date</th>
                  <th className="px-4 py-2.5">Expiration Date</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ddd5]">
                {activeLOBList.map((p, idx) => {
                  const isSelected = selectedPolicyIndex === idx;
                  return (
                    <tr
                      key={p.id || idx}
                      onClick={() => setSelectedPolicyIndex(idx)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#FAF8F5] font-semibold" : "hover:bg-[#FAF8F5]/60"
                        }`}
                    >
                      <td className="text-center py-3 px-3">
                        <input
                          type="radio"
                          name="policy_select"
                          checked={isSelected}
                          onChange={() => setSelectedPolicyIndex(idx)}
                          className="accent-[#795C46] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `/agency/customer/${customerId}/policy/${p.id}`,
                              "_blank",
                              "width=1100,height=850"
                            );
                          }}
                          className="text-[#795C46] hover:underline cursor-pointer"
                        >
                          {p.policyNum}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#2d2a26]">{p.term}</td>
                      <td className="px-4 py-3 font-semibold text-[#2d2a26]">{p.type}</td>
                      <td className="px-4 py-3 text-[#6b5e52]">{p.company}</td>
                      <td className="px-4 py-3 text-[#6b5e52]">{p.effDate}</td>
                      <td className="px-4 py-3 text-[#6b5e52]">{p.expDate}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `/agency/customer/${customerId}/policy/${p.id}`,
                              "_blank",
                              "width=1100,height=850"
                            );
                          }}
                          className="px-2.5 py-1 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] rounded text-[11px] font-bold cursor-pointer shadow-2xs"
                        >
                          View Policy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* ── 3. Uploaded Documents Section (Screenshot 4) ── */}
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2d2a26]">Uploaded Documents</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-[#795C46] hover:text-[#634b39] flex items-center gap-1 cursor-pointer"
            >
              <Upload size={13} />
              Upload New File
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 70% - Dashed Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`lg:col-span-8 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragOver
                  ? "border-[#9A8B7A] bg-[#f5f1eb]"
                  : "border-[#e5ddd5] hover:border-[#9A8B7A] bg-[#FAF8F5]"
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-white border border-[#e5ddd5] flex items-center justify-center text-[#795C46] mb-3 shadow-xs">
                <Upload size={22} />
              </div>
              <p className="text-xs font-bold text-[#2d2a26]">
                Click or drag files here to upload
              </p>
              <p className="text-[11px] text-[#6b5e52] mt-1">
                Support for PDF, DOC, ZIP up to 10MB
              </p>
            </div>

            {/* Right 30% - Subjective Lines */}
            <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#e5ddd5] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#2d2a26]">Subjective Lines</h4>
              <label className="flex items-start gap-2 text-[11px] text-[#6b5e52] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 accent-[#795C46] rounded cursor-pointer"
                />
                <span>1 year of loss runs required, valued within 60 days of inception.</span>
              </label>
            </div>
          </div>

          {/* Documents Table */}
          <div className="border border-[#e5ddd5] rounded-xl overflow-hidden mt-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] text-[#6b5e52] font-bold border-b border-[#e5ddd5]">
                <tr>
                  <th className="px-4 py-2.5">Filename</th>
                  <th className="px-4 py-2.5">Uploaded On</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ddd5]">
                {docLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-[#6b5e52]">
                      <Loader2 className="animate-spin text-[#9A8B7A] mx-auto size-5 mb-1" />
                      Loading files...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[#6b5e52]/70 font-medium">
                      No documents uploaded yet
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#2d2a26]">
                        {doc.fileName || doc.description}
                      </td>
                      <td className="px-4 py-3 text-[#6b5e52]">
                        {doc.createdAt}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-[#6b5e52] hover:text-[#9A8B7A] hover:bg-[#f5f1eb]"
                              title="View Document"
                            >
                              <Eye size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 rounded text-[#6b5e52] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* ── 4. Bottom Tabbed Section (Screenshot 3 Notes Thread Layout) ── */}
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm space-y-6 w-full">

          {/* Bottom Tabs Nav */}
          <div className="border-b border-[#e5ddd5] flex items-center gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("notes")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "notes"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              Notes
            </button>

            <button
              onClick={() => setActiveTab("status_history")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "status_history"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              Status History
            </button>

            <button
              onClick={() => setActiveTab("contact_info")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "contact_info"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              Contact Information
            </button>

            <button
              onClick={() => setActiveTab("rating_info")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "rating_info"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              Rating Information
            </button>

            <button
              onClick={() => setActiveTab("all_policies")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "all_policies"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              All Policies ({policies.length})
            </button>

            <button
              onClick={() => setActiveTab("eforms")}
              className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === "eforms"
                  ? "text-[#2d2a26] border-b-2 border-black font-extrabold"
                  : "text-[#6b5e52] hover:text-[#2d2a26]"
                }`}
            >
              eForms Library
            </button>
          </div>

          {/* ── TAB: NOTES (Exact Screenshot 3 Layout) ── */}
          {activeTab === "notes" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT 65% – ADD NOTE */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-[#2d2a26]">
                  Add Note
                </h3>

                {/* Notify Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#6b5e52] mr-1">Notify:</span>
                  {[
                    "Underwriter",
                    "Accounting",
                    "Endorsements",
                    "Cancellations",
                    "Audits",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleNoteFilter(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${noteFilters.includes(item)
                          ? "bg-black text-white border-black"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Chat/Note Input Box */}
                <div className="flex gap-3.5 items-start pt-1">
                  {/* User Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#795C46] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {primaryExec.charAt(0).toUpperCase() || "G"}
                  </div>

                  {/* Textarea */}
                  <div className="flex-1 space-y-3">
                    <textarea
                      rows={5}
                      className="w-full border border-[#e5ddd5] rounded-xl p-3.5 text-xs text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#9A8B7A] bg-white resize-none shadow-2xs"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Leave a note..."
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading || !newNoteText.trim()}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#795C46] hover:bg-[#634b39] text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <Plus size={14} />
                        {noteLoading ? "Saving..." : "Add Note"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 35% – NOTES THREAD */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <h3 className="text-sm font-bold text-[#2d2a26]">
                  Notes Thread
                </h3>

                {/* Chat Container */}
                <div className="border border-[#e5ddd5] rounded-2xl bg-[#f8fafc] min-h-[300px] max-h-[450px] overflow-y-auto p-4 flex flex-col gap-3.5 shadow-inner relative">
                  {notes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
                      <div className="w-12 h-10 bg-gray-200 rounded-lg mb-3 opacity-60 flex items-center justify-center text-gray-400">
                        <StickyNote size={20} />
                      </div>
                      <p className="font-bold text-xs text-gray-600 mb-0.5">No notes added yet</p>
                      <p className="text-[11px] text-gray-400 max-w-xs">Drop in questions or comments to help us assist you.</p>
                    </div>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="bg-white border border-[#e5ddd5] rounded-xl p-3.5 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#6b5e52]">
                          <span className="font-bold uppercase text-[#795C46]">
                            {n.author || "Agent"} ({n.role || "staff"})
                          </span>
                          <span>{n.created_at || "Recent"}</span>
                        </div>
                        <p className="text-xs text-[#2d2a26] font-medium whitespace-pre-wrap">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ── TAB: STATUS HISTORY ── */}
          {activeTab === "status_history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2a26]">Customer History & Activity Log</h3>
                  <p className="text-xs text-[#6b5e52]">
                    Chronological audit log of all activities including policies added, documents attached, certificate holders created, eForms issued, and agent updates.
                  </p>
                </div>
                <button
                  onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, "_blank", "width=1000,height=900")}
                  className="h-8 px-3.5 bg-[#795C46] hover:bg-[#634b39] text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={13} />
                  Log Activity
                </button>
              </div>

              <div className="border border-[#e5ddd5] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-[#6b5e52] font-bold border-b border-[#e5ddd5]">
                    <tr>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Action / Event</th>
                      <th className="px-4 py-2.5">Description & Details</th>
                      <th className="px-4 py-2.5">User / Agent</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5ddd5]">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6b5e52]">
                          No activity history logged yet.
                        </td>
                      </tr>
                    ) : (
                      activities.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#6b5e52] whitespace-nowrap">
                            {item.date || item.changedAt || "08/17/2026"}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#795C46] whitespace-nowrap">
                            <span className="inline-block px-2.5 py-0.5 bg-[#f5f1eb] border border-[#e5ddd5] rounded-md text-[11px] font-bold text-[#2d2a26]">
                              {item.action || item.program || "Activity"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#2d2a26] font-medium">
                            {item.description || item.status || "—"}
                          </td>
                          <td className="px-4 py-3 text-[#2d2a26] font-semibold whitespace-nowrap">
                            {item.by || item.user || "TRAVIS BELL"}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {item.trans || item.status || "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: CONTACT INFORMATION ── */}
          {activeTab === "contact_info" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#e5ddd5]">
                <h4 className="font-bold text-[#795C46] uppercase text-[10px] tracking-wider border-b border-[#e5ddd5] pb-1">
                  General Information
                </h4>
                <p><strong>Customer Name:</strong> {displayName}</p>
                <p><strong>Customer Type:</strong> {customer.customer_type || "Commercial Customer"}</p>
                <p><strong>Business Type:</strong> {customer.type || "Commercial"}</p>
                <p><strong>Division:</strong> {customer.division || "Sterling Wholesale Insurance"}</p>
              </div>

              <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#e5ddd5]">
                <h4 className="font-bold text-[#795C46] uppercase text-[10px] tracking-wider border-b border-[#e5ddd5] pb-1">
                  Phone & Contact
                </h4>
                <p><strong>Primary Phone:</strong> {customer.phone || "—"}</p>
                <p><strong>Business Phone:</strong> {customer.phone_business || "—"}</p>
                <p><strong>Email Address:</strong> {displayEmail}</p>
                <p><strong>Website:</strong> {customer.web || "—"}</p>
              </div>

              <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#e5ddd5]">
                <h4 className="font-bold text-[#795C46] uppercase text-[10px] tracking-wider border-b border-[#e5ddd5] pb-1">
                  Address & Settings
                </h4>
                <p><strong>Street Address:</strong> {customer.address || "—"}</p>
                <p><strong>City / State / Zip:</strong> {[customer.city, customer.state, customer.zip].filter(Boolean).join(", ") || "—"}</p>
                <p><strong>Delivery Method:</strong> {customer.electronic_delivery || "Direct / Email"}</p>
              </div>
            </div>
          )}

          {/* ── TAB: RATING INFORMATION ── */}
          {activeTab === "rating_info" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#795C46] uppercase text-[10px] tracking-wider border-b border-[#e5ddd5] pb-1">
                    Rating Classification
                  </h4>
                  <p><strong>Business Origin:</strong> {customer.business_origin || "Direct"}</p>
                  <p><strong>Acquisition:</strong> {customer.acquisition || "Direct"}</p>
                  <p><strong>Multiple Entity:</strong> {customer.multiple_entity_customer_type || "Standard"}</p>
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#795C46] uppercase text-[10px] tracking-wider border-b border-[#e5ddd5] pb-1">
                    Coverage Lines
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[#2d2a26]">
                      <CheckCircle size={13} className="text-[#795C46]" /> Commercial
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#2d2a26]">
                      <CheckCircle size={13} className="text-[#795C46]" /> General Liability
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: ALL POLICIES ── */}
          {activeTab === "all_policies" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#6b5e52]">Policies Directory</span>
                <button
                  onClick={() => window.open(`/agency/customer/${customerId}/new-policy`, "_blank")}
                  className="h-8 px-3.5 bg-[#795C46] hover:bg-[#634b39] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  Add New Policy
                </button>
              </div>

              <div className="border border-[#e5ddd5] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-[#6b5e52] font-bold border-b border-[#e5ddd5]">
                    <tr>
                      <th className="px-4 py-2.5">Policy Number</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Insurance Company</th>
                      <th className="px-4 py-2.5">Term</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5ddd5]">
                    {policies.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#6b5e52]/70 font-medium">
                          No policies created yet. Click "Add New Policy" to create one.
                        </td>
                      </tr>
                    ) : (
                      policies.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-4 py-3 font-bold text-[#2d2a26]">
                            <span
                              onClick={() => window.open(`/agency/customer/${customerId}/policy/${p.id}`, "_blank", "width=1100,height=850")}
                              className="text-[#795C46] hover:underline cursor-pointer"
                            >
                              {p.policyNum}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#2d2a26]">{p.type}</td>
                          <td className="px-4 py-3 text-[#6b5e52]">{p.company}</td>
                          <td className="px-4 py-3 text-[#6b5e52]">{p.effDate} — {p.expDate}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: EFORMS LIBRARY ── */}
          {activeTab === "eforms" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#6b5e52]">Quick Launch Insurance eForms</span>
                <button
                  onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager`, "_blank")}
                  className="h-8 px-3.5 bg-[#795C46] hover:bg-[#634b39] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText size={13} />
                  Open Full eForms Manager
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  "Commercial Application",
                  "Certificate of Liability",
                  "Certificate of Property",
                  "Binder of Insurance",
                  "Auto ID Card",
                  "Change Request",
                  "Cancellation Request",
                  "Property Loss Notice",
                ].map((formTitle) => (
                  <button
                    key={formTitle}
                    onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager`, "_blank")}
                    className="p-3.5 bg-[#FAF8F5] border border-[#e5ddd5] hover:border-[#9A8B7A] hover:bg-white rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group shadow-2xs"
                  >
                    <div className="h-8 w-8 rounded-lg bg-white border border-[#e5ddd5] flex items-center justify-center text-[#795C46] shrink-0 group-hover:bg-[#795C46] group-hover:text-white transition-colors">
                      <FileText size={15} />
                    </div>
                    <span className="text-xs font-bold text-[#2d2a26] group-hover:text-[#795C46] transition-colors leading-tight">
                      {formTitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ── Document Upload Modal ── */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#e5ddd5] space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-[#2d2a26] border-b border-[#e5ddd5] pb-3">
              Upload Customer Document
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#6b5e52] mb-1">Selected File</label>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] truncate">
                {pendingFile?.name}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#6b5e52] mb-1">Document Description</label>
              <input
                type="text"
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#e5ddd5] rounded-xl text-xs font-medium outline-none focus:border-[#9A8B7A]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#6b5e52] mb-1">Action / Category</label>
              <select
                value={docAction}
                onChange={(e) => setDocAction(e.target.value)}
                className="w-full px-3 py-2 border border-[#e5ddd5] rounded-xl text-xs font-medium outline-none focus:border-[#9A8B7A] bg-white"
              >
                <option value="Upload">Upload</option>
                <option value="Policy Attachment">Policy Attachment</option>
                <option value="Customer File">Customer File</option>
                <option value="Loss Runs">Loss Runs</option>
                <option value="Signed Binder">Signed Binder</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#e5ddd5]">
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setPendingFile(null);
                }}
                className="px-4 py-2 border border-[#e5ddd5] rounded-xl text-xs font-bold text-[#6b5e52] hover:bg-[#f5f1eb] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                className="px-5 py-2 bg-[#795C46] hover:bg-[#634b39] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
