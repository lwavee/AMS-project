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

  // Tabs State - 1: Policies, 2: Uploaded Documents, 3: Notes, 4: Status History, 5: Contact Information
  const [activeTab, setActiveTab] = useState<
    "policies" | "documents" | "notes" | "status_history" | "contact_info"
  >("policies");

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
                  className="h-9 px-4 bg-[#7a523b] hover:bg-[#68432e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Edit3 size={13} className="text-white" />
                  Edit Customer
                </button>

                {/* 2 = E-Forms Manager */}
                <button
                  onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager`, "_blank")}
                  className="h-9 px-4 bg-[#7a523b] hover:bg-[#68432e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <FileText size={13} className="text-white" />
                  E-Forms Manager
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

          {/* ── Metric Cards Grid (Screenshot 2) ── */}
          <div className="pt-5 border-t border-[#f0e5d8] space-y-4">
            {/* Row 1: 4 Cards */}
            <div className="border border-[#ebe5df] rounded-2xl grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#ebe5df] bg-white">
              {/* Total Policies */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#edeefc] text-[#5e5cee] flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Total Policies</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5">
                    {policies.length}
                  </p>
                  <p className="text-[11px] text-[#8c827a] font-normal mt-0.5">Active policies</p>
                </div>
              </div>

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

              {/* Primary Executive */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#e8f3fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Primary Executive</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5 truncate" title={primaryExec}>
                    {primaryExec}
                  </p>
                  <p className="text-[11px] text-[#8c827a] font-normal mt-0.5">Account executive</p>
                </div>
              </div>
            </div>

            {/* Row 2: 2 Cards (aligned with first 2 columns) */}
            <div className="border border-[#ebe5df] rounded-2xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#ebe5df] bg-white w-full lg:w-1/2">
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
                </div>
              </div>

              {/* Agent Name */}
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#e6f7ef] text-[#10b981] flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8c827a] font-medium">Agent Name</p>
                  <p className="text-base font-bold text-[#1f1d1a] leading-tight mt-0.5 truncate" title={agentName}>
                    {agentName}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Tabs Navigation Bar Card (Screenshot 1) ── */}
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto w-full">
          {/* Tab 1: Policies (4) */}
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "policies"
              ? "bg-[#F5EDE5] text-[#795C46] border-b-2 border-[#795C46] shadow-2xs font-extrabold"
              : "text-[#6b5e52] hover:bg-[#FAF8F5] hover:text-[#2d2a26]"
              }`}
          >
            <Shield size={16} className={activeTab === "policies" ? "text-[#795C46]" : "text-[#795C46]"} />
            <span>Policies ({policies.length})</span>
          </button>

          {/* Tab 2: Uploaded Documents */}
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "documents"
              ? "bg-[#F5EDE5] text-[#795C46] border-b-2 border-[#795C46] shadow-2xs font-extrabold"
              : "text-[#6b5e52] hover:bg-[#FAF8F5] hover:text-[#2d2a26]"
              }`}
          >
            <FileText size={16} className={activeTab === "documents" ? "text-[#795C46]" : "text-blue-500"} />
            <span>Uploaded Documents {documents.length > 0 ? `(${documents.length})` : ""}</span>
          </button>

          {/* Tab 3: Notes */}
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "notes"
              ? "bg-[#F5EDE5] text-[#795C46] border-b-2 border-[#795C46] shadow-2xs font-extrabold"
              : "text-[#6b5e52] hover:bg-[#FAF8F5] hover:text-[#2d2a26]"
              }`}
          >
            <SquarePen size={16} className={activeTab === "notes" ? "text-[#795C46]" : "text-purple-500"} />
            <span>Notes</span>
          </button>

          {/* Tab 4: Status History */}
          <button
            onClick={() => setActiveTab("status_history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "status_history"
              ? "bg-[#F5EDE5] text-[#795C46] border-b-2 border-[#795C46] shadow-2xs font-extrabold"
              : "text-[#6b5e52] hover:bg-[#FAF8F5] hover:text-[#2d2a26]"
              }`}
          >
            <History size={16} className={activeTab === "status_history" ? "text-[#795C46]" : "text-emerald-500"} />
            <span>Status History</span>
          </button>

          {/* Tab 5: Contact Information */}
          <button
            onClick={() => setActiveTab("contact_info")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "contact_info"
              ? "bg-[#F5EDE5] text-[#795C46] border-b-2 border-[#795C46] shadow-2xs font-extrabold"
              : "text-[#6b5e52] hover:bg-[#FAF8F5] hover:text-[#2d2a26]"
              }`}
          >
            <Users size={16} className={activeTab === "contact_info" ? "text-[#795C46]" : "text-amber-600"} />
            <span>Contact Information</span>
          </button>
        </div>

        {/* ── Active Tab Content Card with Smooth Transition (Screenshot 1) ── */}
        <div key={activeTab} className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm w-full animate-tab-content transition-all duration-300">
          {/* ── TAB 1: POLICIES ── */}
          {activeTab === "policies" && (
            <div id="policies-section" className="space-y-6">
              {/* Policy Section Header + Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-[#F5EDE5] text-[#795C46] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                    <Shield size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1f1d1a]">
                      Policies & Coverage ({policies.length})
                    </h2>
                    <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                      Manage and view active policies, renewals, rewrites, and coverages
                    </p>
                  </div>
                </div>

                {/* Action Buttons matching Screenshot 1 */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => window.open(`/agency/customer/${customerId}/new-policy`, "_blank")}
                    className="h-9 px-4 bg-[#6d4c3d] hover:bg-[#5a3e31] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    New Policy
                  </button>

                  <button
                    onClick={() => showToast("Renew policy initiated for selected policy.", "success")}
                    className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={14} className="text-[#6b5e52]" />
                    Renew
                  </button>

                  <button
                    onClick={() => showToast("Rewrite policy initiated for selected policy.", "success")}
                    className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileText size={14} className="text-[#6b5e52]" />
                    Rewrite
                  </button>

                  <button
                    onClick={async () => {
                      if (await confirmDialog("Are you sure you want to cancel the selected policy?", "Cancel Policy")) {
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

              {/* Policy Table matching Screenshot 1 */}
              <div className="border border-[#e5ddd5] rounded-2xl overflow-hidden mt-6 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#e5ddd5]">
                    <tr>
                      <th className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          className="rounded-md border-[#e5ddd5] text-[#795C46] accent-[#795C46] h-4 w-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Policy # <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Status <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Term <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Line of Business <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Insurance Carrier <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Effective Date <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Expiration Date <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52] text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5ddd5]">
                    {activeLOBList.map((p, idx) => {
                      const isSelected = selectedPolicyIndex === idx;
                      return (
                        <tr
                          key={p.id || idx}
                          onClick={() => setSelectedPolicyIndex(idx)}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-[#FAF8F5]/80 font-medium" : "hover:bg-[#FAF8F5]/60"
                            }`}
                        >
                          <td className="text-center py-3.5 px-4">
                            <input
                              type="checkbox"
                              name="policy_select"
                              checked={isSelected}
                              onChange={() => setSelectedPolicyIndex(idx)}
                              className="rounded-md border-[#e5ddd5] accent-[#795C46] h-4 w-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5 font-extrabold text-[#1f1d1a]">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/agency/customer/${customerId}/policy/${p.id}`,
                                  "_blank",
                                  "width=1100,height=850"
                                );
                              }}
                              className="hover:text-[#795C46] hover:underline cursor-pointer"
                            >
                              {p.policyNum}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#12805C]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#12805C]"></span>
                              {p.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#2d2a26] font-medium">{p.term || "12 Months"}</td>
                          <td className="px-4 py-3.5 font-bold text-[#1f1d1a]">{p.type}</td>
                          <td className="px-4 py-3.5 text-[#4a423b] font-medium">{p.company}</td>
                          <td className="px-4 py-3.5 text-[#4a423b] font-medium">{p.effDate}</td>
                          <td className="px-4 py-3.5 text-[#4a423b] font-medium">{p.expDate}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/agency/customer/${customerId}/policy/${p.id}`,
                                    "_blank",
                                    "width=1100,height=850"
                                  );
                                }}
                                className="h-8 px-3.5 bg-[#795C46] hover:bg-[#634b39] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                              >
                                <Eye size={13} />
                                View Policy
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="h-8 w-8 flex items-center justify-center rounded-xl text-[#8c827a] hover:text-[#2d2a26] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 2: UPLOADED DOCUMENTS (Matching Photo) ── */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-[#F5EDE5] text-[#795C46] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                    <FileText size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1f1d1a]">
                      Uploaded Documents
                    </h2>
                    <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                      Upload and manage customer documents securely
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 bg-[#6d4c3d] hover:bg-[#5a3e31] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} className="stroke-[2.5]" />
                  Upload New File
                </button>
              </div>

              {/* Grid 2-columns (Dropzone left, Info cards right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left 70% - Drag & Drop Zone with Animated File Type Arc */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  onDrop={handleFileDrop}
                  className={`lg:col-span-8 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden bg-[#FAF8F5] ${isDragOver ? "border-[#795C46] bg-[#795C46]/5 scale-[0.99]" : "border-[#e5ddd5] hover:border-[#9A8B7A]"
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Cloud Icon & Floating File Type Icons Arc */}
                  <div className="relative mb-3 flex items-center justify-center w-full max-w-[280px] h-20">
                    {/* Subtle Curved connecting line */}
                    <svg className="absolute w-full h-14 top-2 text-[#e5ddd5]" viewBox="0 0 280 50" fill="none">
                      <path d="M 25 40 Q 140 0 255 40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                    </svg>

                    {/* PDF (Red) */}
                    <div className="absolute left-3 top-6 h-7 w-7 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                      PDF
                    </div>

                    {/* DOC (Blue) */}
                    <div className="absolute left-14 top-1 h-7 w-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                      DOC
                    </div>

                    {/* Center Cloud Badge */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative z-10 h-14 w-14 rounded-full bg-[#F5EDE5] border border-[#e5ddd5] text-[#795C46] flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                    >
                      <CloudUpload size={26} className="stroke-[2.2]" />
                    </div>

                    {/* PNG (Green) */}
                    <div className="absolute right-14 top-1 h-7 w-7 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                      PNG
                    </div>

                    {/* ZIP (Purple) */}
                    <div className="absolute right-3 top-6 h-7 w-7 rounded-full bg-[#FAF5FF] border border-[#F3E8FF] text-[#9333EA] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                      ZIP
                    </div>
                  </div>

                  <p className="text-sm font-bold text-[#1f1d1a]">
                    Drag & drop files here
                  </p>
                  <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                    or click to browse from your device
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#8c827a] font-medium mt-1.5">
                    <Info size={13} className="text-[#9A8B7A]" />
                    <span>Supports PDF, DOCX, PNG (Max size: 10MB per file)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-5 bg-[#6d4c3d] hover:bg-[#5a3e31] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 mt-4 cursor-pointer"
                  >
                    <Folder size={14} />
                    Browse Files
                  </button>
                </div>

                {/* Right 30% - Subjective Lines & Accepted File Types */}
                <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
                  {/* Card 1: Subjective Lines */}
                  <div className="bg-white border border-[#e5ddd5] rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#F5EDE5] text-[#795C46] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60">
                        <FileText size={15} />
                      </div>
                      <h4 className="text-xs font-extrabold text-[#1f1d1a]">Subjective Lines</h4>
                    </div>

                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex items-start gap-2.5">
                      <CheckSquare size={16} className="text-[#059669] shrink-0 mt-0.5 fill-[#059669] text-white rounded" />
                      <span className="text-[11px] font-medium text-[#065F46] leading-relaxed">
                        1 year of loss runs required, valued within 60 days of inception.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="border border-[#e5ddd5] rounded-2xl overflow-hidden mt-6 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#e5ddd5]">
                    <tr>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Filename <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Category <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Description <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                        Uploaded On <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                      </th>
                      <th className="px-4 py-3.5 font-bold text-[#6b5e52] text-center">
                        Manage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5ddd5]">
                    {docLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-[#6b5e52]">
                          <Loader2 className="animate-spin text-[#9A8B7A] mx-auto size-5 mb-1" />
                          Loading files...
                        </td>
                      </tr>
                    ) : documents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FileText size={34} className="text-[#c4b5a5] stroke-[1.5] mb-2" />
                            <p className="text-sm font-bold text-[#2d2a26]">No documents uploaded yet</p>
                            <p className="text-xs text-[#8c827a] mt-0.5 font-medium">Upload files to keep customer documents organized and accessible.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#FAF8F5] transition-colors group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-white border border-[#e5ddd5] flex items-center justify-center text-[#9A8B7A] shrink-0 shadow-2xs group-hover:border-[#795C46] group-hover:text-[#795C46] transition-colors">
                                {doc.fileName?.toLowerCase().endsWith('.pdf') ? <FileText size={15} /> :
                                  doc.fileName?.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? <ImageIcon size={15} /> :
                                    doc.fileName?.toLowerCase().endsWith('.zip') ? <FileArchive size={15} /> :
                                      <FileIcon size={15} />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#2d2a26] text-xs max-w-[200px] truncate" title={doc.fileName}>
                                  {doc.fileName || "Document"}
                                </span>
                                {doc.ext && <span className="text-[9px] uppercase tracking-wider text-[#9A8B7A] font-bold">{doc.ext.replace('.', '')}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[#6b5e52]">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${doc.action === 'Policy Attachment' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              doc.action === 'Loss Runs' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                doc.action === 'Signed Binder' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  'bg-[#f5f1eb] text-[#6b5e52] border-[#e5ddd5]'
                              }`}>
                              {doc.action || "Upload"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#6b5e52] max-w-[200px] truncate font-medium text-[11px]" title={doc.description}>
                            {doc.description || "—"}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-[#6b5e52] text-[11px]">
                            {doc.createdAt}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              {doc.url && (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-[#6b5e52] hover:text-[#795C46] hover:bg-white border border-transparent hover:border-[#e5ddd5] hover:shadow-2xs transition-all"
                                  title="View Document"
                                >
                                  <Eye size={14} />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1.5 rounded-lg text-[#6b5e52] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
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
          )}

          {/* ── TAB: NOTES (Matching Photo) ── */}
          {activeTab === "notes" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT 60% – ADD NOTE */}
              <div className="lg:col-span-7 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-1">
                  <div className="h-12 w-12 rounded-2xl bg-[#F5EDE5] text-[#795C46] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                    <FileText size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1f1d1a]">
                      Add Note
                    </h2>
                    <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                      Add internal notes and mentions to keep track of customer communication
                    </p>
                  </div>
                </div>

                {/* Notify Filters Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#2d2a26] mr-1">Notify:</span>
                  {[
                    { label: "Underwriter", icon: <Bell size={13} /> },
                    { label: "Accounting", icon: <Calculator size={13} /> },
                    { label: "Endorsements", icon: <FileText size={13} /> },
                    { label: "Cancellations", icon: <XCircle size={13} /> },
                    { label: "Audits", icon: <Shield size={13} /> },
                  ].map((item) => {
                    const isSelected = noteFilters.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => toggleNoteFilter(item.label)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${isSelected
                            ? "bg-[#6d4c3d] text-white shadow-xs"
                            : "bg-white border border-[#e5ddd5] hover:bg-[#FAF8F5] text-[#2d2a26]"
                          }`}
                      >
                        {React.cloneElement(item.icon, {
                          className: isSelected ? "text-white" : "text-[#6b5e52]",
                        })}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Chat/Note Input Box with Avatar */}
                <div className="flex gap-3.5 items-start pt-1">
                  {/* User Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#6d4c3d] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-1">
                    {displayName.charAt(0).toUpperCase() || "K"}
                  </div>

                  {/* Rich Editor Box */}
                  <div className="flex-1 border border-[#e5ddd5] rounded-2xl bg-white overflow-hidden shadow-2xs focus-within:border-[#9A8B7A] focus-within:ring-2 focus-within:ring-[#9A8B7A]/20 transition-all">
                    <textarea
                      rows={4}
                      className="w-full p-4 text-xs text-[#1f1d1a] placeholder:text-[#8c827a] resize-none outline-none border-none bg-transparent font-medium"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Write your note here..."
                      maxLength={1000}
                    />

                    {/* Toolbar */}
                    <div className="border-t border-[#f0e9df] px-3.5 py-2 flex items-center justify-between bg-[#FAF8F5]/60">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => prev ? `**${prev}**` : "**bold text**")}
                          className="h-6 w-6 flex items-center justify-center text-xs font-extrabold text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => prev ? `*${prev}*` : "*italic text*")}
                          className="h-6 w-6 flex items-center justify-center text-xs font-serif italic text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => prev ? `<u>${prev}</u>` : "<u>underline</u>")}
                          className="h-6 w-6 flex items-center justify-center text-xs underline text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Underline"
                        >
                          U
                        </button>
                        <div className="h-3.5 w-px bg-[#e5ddd5] mx-1" />
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => `${prev}\n• `)}
                          className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Bullet list"
                        >
                          <List size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => `${prev}\n1. `)}
                          className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Numbered list"
                        >
                          <ListOrdered size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteText((prev) => `${prev} [link](url)`)}
                          className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                          title="Add link"
                        >
                          <Link2 size={13} />
                        </button>
                      </div>

                      <span className="text-[11px] font-medium text-[#8c827a]">
                        {newNoteText.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={noteLoading || !newNoteText.trim()}
                    className="h-9 px-5 bg-[#6d4c3d] hover:bg-[#5a3e31] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    {noteLoading ? "Saving..." : "Add Note"}
                  </button>
                </div>
              </div>

              {/* RIGHT 40% – NOTES THREAD */}
              <div className="lg:col-span-5 bg-[#FAF8F5]/60 border border-[#e5ddd5] rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[360px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd5]/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-white border border-[#e5ddd5] text-[#795C46] flex items-center justify-center shrink-0 shadow-2xs">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1f1d1a]">
                        Notes Thread
                      </h3>
                      <p className="text-[11px] text-[#6b5e52] font-medium">
                        View all notes and conversations for this customer
                      </p>
                    </div>
                  </div>

                  {/* Filter Pill */}
                  <button
                    type="button"
                    className="bg-white border border-[#e5ddd5] hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <Filter size={12} className="text-[#6b5e52]" />
                    <span>All Notes</span>
                    <ChevronDown size={12} className="text-[#6b5e52]" />
                  </button>
                </div>

                {/* Body: Empty State or Notes List */}
                <div className="flex-1 flex flex-col justify-center py-6">
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center my-auto">
                      {/* Illustrated Overlapping Cards Graphic with Sparkle */}
                      <div className="relative w-36 h-20 mb-3 flex items-center justify-center">
                        {/* Left tilted card */}
                        <div className="absolute left-3 top-3 w-16 h-13 bg-white border border-[#e5ddd5] rounded-xl shadow-2xs -rotate-12 flex flex-col p-2 justify-center gap-1 opacity-70">
                          <div className="h-1.5 w-8 bg-[#e5ddd5] rounded-full" />
                          <div className="h-1.5 w-10 bg-[#f0e9df] rounded-full" />
                        </div>
                        {/* Right tilted card */}
                        <div className="absolute right-3 top-3 w-16 h-13 bg-white border border-[#e5ddd5] rounded-xl shadow-2xs rotate-12 flex flex-col p-2 justify-center gap-1 opacity-70">
                          <div className="h-1.5 w-10 bg-[#e5ddd5] rounded-full" />
                          <div className="h-1.5 w-6 bg-[#f0e9df] rounded-full" />
                        </div>
                        {/* Center prominent warm card */}
                        <div className="relative z-10 w-20 h-16 bg-[#F5EDE5] border border-[#d8c8ba] rounded-2xl shadow-xs flex flex-col items-center justify-center p-2.5 gap-1.5">
                          <div className="h-1.5 w-10 bg-[#795C46]/60 rounded-full" />
                          <div className="h-1.5 w-12 bg-[#795C46]/80 rounded-full" />
                          <div className="h-1.5 w-7 bg-[#795C46]/60 rounded-full" />
                        </div>
                        {/* Sparkle top right */}
                        <div className="absolute top-0 right-6 text-[#795C46] font-bold text-xs">
                          ✦
                        </div>
                      </div>

                      <p className="font-extrabold text-sm text-[#1f1d1a]">
                        No notes added yet
                      </p>
                      <p className="text-xs text-[#8c827a] mt-0.5 font-medium max-w-xs">
                        Drop in questions or comments to help us assist you.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {notes.map((n) => (
                        <div
                          key={n.id}
                          className="bg-white border border-[#e5ddd5] rounded-2xl p-3.5 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#6b5e52]">
                            <span className="font-bold uppercase text-[#795C46]">
                              {n.author || "Agent"} ({n.role || "staff"})
                            </span>
                            <span className="font-medium text-[#8c827a]">
                              {n.created_at || "Recent"}
                            </span>
                          </div>
                          <p className="text-xs text-[#2d2a26] font-medium whitespace-pre-wrap leading-relaxed">
                            {n.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ── TAB: STATUS HISTORY (Matching Screenshot) ── */}
          {activeTab === "status_history" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-[#F5EDE5] text-[#795C46] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60 shadow-2xs">
                    <Clock size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1f1d1a]">
                      Customer History & Activity Log
                    </h2>
                    <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                      View a complete history of all activities, notes, policy changes, and document actions for this customer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`/agency/customer/${customerId}/new-activity`, "_blank", "width=1000,height=900")}
                  className="h-9 px-4 bg-[#6d4c3d] hover:bg-[#5a3e31] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  Log Activity
                </button>
              </div>

              {/* Filter & Search Bar Row */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search activities */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search activities, users, or details..."
                    className="w-full pl-9 pr-4 py-2 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#1f1d1a] placeholder:text-[#8c827a] outline-none focus:border-[#795C46] shadow-2xs font-medium transition-all"
                  />
                </div>

                {/* Activity Type Filter */}
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

                {/* Users Filter */}
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

                {/* Date Range Selector */}
                <div className="flex items-center gap-2 px-3.5 py-2 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] bg-white shadow-2xs cursor-pointer hover:bg-[#FAF8F5] transition-all">
                  <Calendar size={13} className="text-[#6b5e52]" />
                  <span>Select Date Range</span>
                  <ChevronDown size={12} className="text-[#6b5e52]" />
                </div>

                {/* Refresh button */}
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

              {/* Activities Table matching Screenshot */}
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
                    {activities
                      .filter((item) => {
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
                      })
                      .map((item, idx) => {
                        const isNote = item.type?.includes("Note");
                        const isDoc = item.type?.includes("Document") || item.type?.includes("Attached");
                        const isCert = item.type?.includes("Master Certificate");
                        const isHolder = item.type?.includes("Holder");
                        const isPolicy = item.type?.includes("Policy");
                        const isDownload = item.type?.includes("Download");
                        const isUpdated = item.type?.includes("Updated");

                        return (
                          <tr key={item.id || idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* Date & Time */}
                            <td className="px-4 py-3.5 font-medium text-[#2d2a26] whitespace-nowrap">
                              {item.date}
                            </td>

                            {/* Activity / Event */}
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

                            {/* Description & Details */}
                            <td className="px-4 py-3.5 text-[#2d2a26] font-medium max-w-md">
                              {item.description}
                            </td>

                            {/* User / Agent */}
                            <td className="px-4 py-3.5 font-bold text-[#4a423b] whitespace-nowrap">
                              {item.user}
                            </td>

                            {/* Status */}
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

                            {/* Actions */}
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
        </div>

      </main>

      {/* ── Document Upload Modal ── */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a26]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl w-full max-w-md border border-[#e5ddd5] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-[#e5ddd5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#f5f1eb] text-[#795C46] flex items-center justify-center">
                  <CloudUpload size={16} />
                </div>
                <h3 className="text-sm font-extrabold text-[#2d2a26]">
                  Upload Document
                </h3>
              </div>
              <button onClick={() => {
                setShowDocModal(false);
                setPendingFile(null);
                setDocDescription("");
                setDocAction("Upload");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }} className="text-[#9A8B7A] hover:text-[#2d2a26] transition-colors p-1 rounded-full hover:bg-[#f5f1eb] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* File Attachment Card */}
              <div className="p-3.5 bg-white border border-[#e5ddd5] rounded-2xl flex items-center gap-3 shadow-2xs">
                <div className="h-10 w-10 bg-[#f5f1eb] rounded-xl flex items-center justify-center text-[#795C46] shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-[#2d2a26] truncate">{pendingFile?.name}</span>
                  <span className="text-[10px] font-bold text-[#9A8B7A] uppercase tracking-wider">{(pendingFile?.size ? (pendingFile.size / 1024 / 1024).toFixed(2) : "0.00")} MB</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b5e52] mb-1.5 ml-1">Action / Category</label>
                  <select
                    value={docAction}
                    onChange={(e) => setDocAction(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-bold text-[#2d2a26] outline-none focus:border-[#795C46] focus:ring-4 focus:ring-[#795C46]/10 bg-white transition-all shadow-2xs cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239A8B7A%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option value="Upload">Standard Upload</option>
                    <option value="Policy Attachment">Policy Attachment</option>
                    <option value="Customer File">Customer File</option>
                    <option value="Loss Runs">Loss Runs</option>
                    <option value="Signed Binder">Signed Binder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b5e52] mb-1.5 ml-1">Document Description</label>
                  <input
                    type="text"
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="E.g. 2026 Loss Runs for GL Policy"
                    className="w-full px-4 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] outline-none focus:border-[#795C46] focus:ring-4 focus:ring-[#795C46]/10 bg-white transition-all shadow-2xs placeholder:text-[#e5ddd5]"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#e5ddd5] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setPendingFile(null);
                  setDocDescription("");
                  setDocAction("Upload");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isUploading}
                className="px-5 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-bold text-[#6b5e52] hover:bg-[#f5f1eb] hover:text-[#2d2a26] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={isUploading}
                className="px-6 py-2.5 bg-[#795C46] hover:bg-[#634b39] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload size={14} />
                    Confirm Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
