/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../lib/config";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import {
  ArrowLeft,
  User,
  FileText,
  FileSignature,
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
  ChevronRight,
  Edit3,
  ExternalLink,
  Briefcase,
  CloudUpload,
  FileArchive,
  Image as ImageIcon,
  File as FileIcon,
  X,
  MoreVertical,
  RotateCcw,
  ArrowUpDown,
  History,
  Users,
  SquarePen,
  Folder,
  Layers,
  Info,
  CheckSquare,
  Calculator,
  List,
  ListOrdered,
  Link2,
  MessageSquare,
  Filter,
  Search,
  Clock
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

  // Tabs State - Documents, Notes, Status History, Contact Information (Policies opens on separate dedicated page)
  const [activeTab, setActiveTab] = useState<
    "documents" | "notes" | "status_history" | "contact_info" | null
  >(null);

  // Read tab parameter on initial load or URL change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam &&
        ["documents", "notes", "status_history", "contact_info"].includes(tabParam)
      ) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  // Activities / History State (Matching Screenshot)
  const DEFAULT_ACTIVITIES = [
    {
      id: "act-1",
      date: "10/09/2026 11:26 AM",
      type: "Note Added",
      description: 'Added note: "hy hghghg"',
      user: "AGENCY",
      status: "NOTE CREATED",
      statusType: "success"
    },
    {
      id: "act-2",
      date: "10/07/2026 11:59 PM",
      type: "Note Added",
      description: 'Added note: "hy"',
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
      description: "Created Master Certificate of Insurance: ACORD 25 for General Liability Policy #POL-GL-100",
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
      description: "Added Policy: BAPC-GL-101 General Liability - $1,000,000 limit with XYZ Insurance Company",
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

  // Action Menu Dropdown
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // ── Fetch Customer Data (Instant Cache Hydration) ──
  const fetchCustomer = useCallback(async () => {
    const cacheKey = `cached_cust_${customerId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          setCustomer(parsed);
          setLoading(false);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
    } catch {
      setLoading(true);
    }

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
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch { }
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
          url: d.url ? (d.url.startsWith("http") ? d.url : `${API_BASE_URL}${d.url.startsWith("/") ? "" : "/"}${d.url}`) : "",
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
    setIsUploading(true);
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
      setDocDescription("");
      setDocAction("Upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      showToast("Document upload failed: " + err.message, "error");
    } finally {
      setIsUploading(false);
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
  const displayName = customer.firm_name || customer.firmName || customer.company_name || customer.companyName || customer.dba || customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Bell Welding & Construction LLC";
  const customerIdFormatted = customer.id || "26";
  const primaryExec = customer.primary_exec || customer.representative || "Travis Bell";
  const customerFullName = [customer.first_name || customer.firstName, customer.last_name || customer.lastName].filter(Boolean).join(" ") || (customer.name && customer.name !== (customer.firm_name || customer.firmName) ? customer.name : "") || primaryExec || "Travis Bell";
  const agentName = customer.agent || customer.agent_name || customer.agentName || customer.representative || customer.executive || customer.primary_exec || "Parungao, Joana";
  const fullAddress = [customer.address, customer.address2, customer.city, customer.state, customer.zip].filter(Boolean).join(", ") || "1325 Woodbine Cliff Dr, Fort Worth, Texas, 76179";
  const displayPhone = customer.phone || customer.phone_business || customer.cell || "(682) 351-8069";
  const displayEmail = customer.email || customer.email2 || "bellwelding1@gmail.com";
  const customerStatus = (customer.status || "Active").toUpperCase();
  const customerType = customer.type || "Commercial";
  const createDate = customer.customer_added_date || customer.created_date || "2026-07-24";
  const agencyDivision = customer.division || "Gamaty Insurance Agency LLC DBA Capital & Co";
  const preferredMethod = customer.preferred_method || customer.electronic_delivery || "Direct / Email";

  const initials = (() => {
    const raw = (customerFullName || displayName || "CU").trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  })();

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
        <div className="bg-white border border-[#e5ddd5] rounded-3xl p-6 md:p-7 shadow-xs space-y-6 w-full">

          {/* Header Row: Left (Avatar + Details) | Right (Customer #ID + Actions) */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            {/* Left Avatar + Info */}
            <div className="flex items-start gap-4">
              {/* Avatar Box */}
              <div className="w-16 h-16 rounded-2xl bg-[#faeedd] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="text-xl font-bold text-[#5c3e28] tracking-tight">
                  {initials}
                </span>
              </div>

              {/* Title, Badges, ID, Meta Row */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-[#1f1d1a] tracking-tight">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#e8f8f0] text-[#059669]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    {customer.status ? (customer.status.charAt(0).toUpperCase() + customer.status.slice(1).toLowerCase()) : "Active"}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f7efe6] text-[#8c6b4b]">
                    {customerType}
                  </span>
                </div>

                <p className="text-xs text-[#8c827a] font-medium">
                  Customer ID: {customerIdFormatted}
                </p>

                {/* Contact Meta Row */}
                <div className="flex items-center gap-6 flex-wrap text-xs text-[#6b5e52] pt-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User size={14} className="text-[#8c6b4b]" />
                    <span>{customerFullName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-[#8c6b4b]" />
                    <span>{fullAddress}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-[#8c6b4b]" />
                    <span>{displayPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <Mail size={14} className="text-[#8c6b4b]" />
                    {displayEmail !== "—" ? (
                      <a href={`mailto:${displayEmail}`} className="hover:underline text-[#2d2a26]">
                        {displayEmail}
                      </a>
                    ) : (
                      <span>No email</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Customer # + Action Buttons */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <span className="text-xs font-semibold text-[#8c827a]">
                Customer #{customerIdFormatted}
              </span>

              <div className="flex items-center gap-2">
                {/* 1 = Edit Customer */}
                <button
                  onClick={() => router.push(`/agency/new-customer?edit=${customerId}`)}
                  className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Edit3 size={13} className="text-white" />
                  Edit Customer
                </button>

                {/* 3 = Three dots */}
                <button
                  onClick={() => router.push(`/agency/customer/${customerId}/new-activity`)}
                  className="h-9 w-9 rounded-xl border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="More Options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Metric Cards Grid ── */}
          <div className="pt-5 border-t border-[#f0e5d8]">
            <div className="border border-[#ebe5df] rounded-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#ebe5df] bg-white">
              {/* Customer Since */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#e6f7ef] text-[#10b981] flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Customer Since</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5">
                    {createDate}
                  </p>
                  <p className="text-[11px] text-[#8c827a] font-normal mt-0.5">Client with us</p>
                </div>
              </div>

              {/* Agency / Division */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#fef3e7] text-[#d97706] flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Agency / Division</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5 truncate" title={agencyDivision}>
                    {agencyDivision}
                  </p>
                  <p className="text-[11px] text-[#8c827a] font-normal mt-0.5">Assigned agency</p>
                </div>
              </div>

              {/* Delivery Preference */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#fdeeed] text-[#ef4444] flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Delivery Preference</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5 truncate">
                    {preferredMethod}
                  </p>
                  <p className="text-[11px] text-[#8c827a] font-normal mt-0.5">Preferred contact</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {[
              {
                id: "policies" as const,
                name: `Policies (${policies.length})`,
                shortName: "Policies",
                description: "View and manage active policies, renewals & coverage",
                icon: Shield,
                iconBg: "bg-[#9A8B7A]", // Screenshot 2 Card 1: Warm Taupe / Brown
                badge: policies.length.toString(),
                badgeColor: "bg-[#F5EDE5] text-[#9A8B7A]",
                bubbleColor: "bg-[#F5EDE5]/70",
                href: `/agency/customer/${customerId}/policies`,
                openInNewTab: false,
              },
              {
                id: "eforms_manager" as const,
                name: "eForms Manager",
                shortName: "eForms Manager",
                description: "Manage, issue and distribute ACORD forms & certificates",
                icon: FileSignature,
                iconBg: "bg-[#0284c7]", // Vibrant Sky Blue
                badge: undefined,
                badgeColor: "bg-sky-100/70 text-sky-700",
                bubbleColor: "bg-sky-50/70",
                href: `/agency/customer/${customerId}/eforms-manager`,
                openInNewTab: true,
              },
              {
                id: "documents" as const,
                name: `Uploaded Documents${documents.length > 0 ? ` (${documents.length})` : ""}`,
                shortName: "Uploaded Documents",
                description: "View, upload, and organize customer documents & files",
                icon: FileText,
                iconBg: "bg-[#2563eb]", // Screenshot 2 Card 2: Vibrant Blue
                badge: documents.length > 0 ? documents.length.toString() : undefined,
                badgeColor: "bg-blue-100/70 text-blue-600",
                bubbleColor: "bg-blue-50/70",
                href: `/agency/customer/${customerId}/documents`,
                openInNewTab: false,
              },
              {
                id: "notes" as const,
                name: `Notes${notes.length > 0 ? ` (${notes.length})` : ""}`,
                shortName: "Notes",
                description: "Customer notes, internal logs, and communication memos",
                icon: SquarePen,
                iconBg: "bg-[#9333ea]", // Screenshot 2 Card 4: Purple
                badge: notes.length > 0 ? notes.length.toString() : undefined,
                badgeColor: "bg-purple-100/70 text-purple-600",
                bubbleColor: "bg-purple-50/70",
                href: `/agency/customer/${customerId}/notes`,
                openInNewTab: false,
              },
              {
                id: "status_history" as const,
                name: `Status History${activities.length > 0 ? ` (${activities.length})` : ""}`,
                shortName: "Status History",
                description: "Track timeline, audit events, and status updates",
                icon: History,
                iconBg: "bg-[#059669]", // Screenshot 2 Card 6: Emerald Green
                badge: activities.length > 0 ? activities.length.toString() : undefined,
                badgeColor: "bg-emerald-100/70 text-emerald-700",
                bubbleColor: "bg-emerald-50/70",
                href: `/agency/customer/${customerId}/status-history`,
                openInNewTab: false,
              },
              {
                id: "contact_info" as const,
                name: "Contact Information",
                shortName: "Contact Information",
                description: "Customer address, contact points, and profile info",
                icon: Users,
                iconBg: "bg-[#ea580c]", // Screenshot 2 Card 5: Warm Orange
                badge: undefined,
                badgeColor: "bg-orange-100/70 text-orange-700",
                bubbleColor: "bg-orange-50/70",
                href: `/agency/customer/${customerId}/contact-info`,
                openInNewTab: false,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isNewTab = Boolean(tab.openInNewTab);
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  target={isNewTab ? "_blank" : undefined}
                  rel={isNewTab ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!isNewTab) {
                      e.preventDefault();
                      router.push(tab.href);
                    }
                  }}
                  className="relative bg-white rounded-2xl p-5 border border-[#e5ddd5] hover:border-[#c5b8ac] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs"
                >
                  {/* Decorative background shape in top right (Screenshot 2) */}
                  <div
                    className={`absolute -top-7 -right-7 w-28 h-28 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-110 ${tab.bubbleColor}`}
                  />

                  <div>
                    {/* Top Row: Colored Icon Box (left) & Badge Pill (right) */}
                    <div className="flex items-start justify-between relative z-10">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${tab.iconBg}`}
                      >
                        <Icon size={22} className="stroke-[2.2]" />
                      </div>

                      {tab.badge !== undefined && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${tab.badgeColor}`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="mt-4 relative z-10">
                      <h3 className="text-base font-bold text-[#1f1d1a] group-hover:text-[#9A8B7A] transition-colors leading-snug">
                        {tab.name}
                      </h3>
                      <p className="text-xs text-[#8c827a] font-medium mt-1 leading-relaxed">
                        {tab.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom link: Go to [Tab] > */}
                  <div className="mt-4 pt-1 flex items-center text-xs font-semibold text-[#8c827a] group-hover:text-[#1f1d1a] transition-colors relative z-10">
                    <span className="flex items-center gap-1">
                      Go to {tab.shortName}
                      <ChevronRight size={14} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

      </main>

    </div>
  );
}
