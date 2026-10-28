/* eslint-disable */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import Modal from "../../../components/Modal";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Hash,
  ArrowLeft,
  Lock,
  ExternalLink,
  RefreshCw,
  Unlink,
  Check,
  User,
  LayoutDashboard,
  UserPlus,
  Plus,
  Search,
  Trash2,
  Copy,
  Eye
} from "lucide-react";
import { API_BASE_URL } from "../../../lib/config";

interface MailboxStatus {
  configured: boolean;
  provider: string;
  status: "Connected" | "Not Connected" | "Connecting" | "Connection Expired" | "Connection Error";
  has_token: boolean;
  email: string | null;
  display_name: string | null;
  connected_at: string | null;
  message?: string;
  last_error?: string | null;
}

export default function AgencyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState("Agent Control");
  const [userRole, setUserRole] = useState("agency");
  const [profile, setProfile] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Mailbox integration state
  const [mailboxStatus, setMailboxStatus] = useState<MailboxStatus | null>(null);
  const [isCheckingMailbox, setIsCheckingMailbox] = useState(false);
  const [isConnectingMailbox, setIsConnectingMailbox] = useState(false);
  const [isDisconnectingMailbox, setIsDisconnectingMailbox] = useState(false);
  const [mailboxActionMsg, setMailboxActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Agent management modals & search state
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isViewAllAgentsModalOpen, setIsViewAllAgentsModalOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [addAgentError, setAddAgentError] = useState("");
  const [addAgentSuccess, setAddAgentSuccess] = useState("");
  const [copiedAgentId, setCopiedAgentId] = useState<number | null>(null);
  const [newAgentForm, setNewAgentForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
      return;
    }
    setUserRole(role || "agency");
    fetchProfile();
    fetchAgents();
  }, []);

  // Listen for OAuth completion broadcast from callback popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "OUTLOOK_CONNECTED") {
        setMailboxActionMsg({
          type: "success",
          text: `Microsoft Outlook successfully connected to ${event.data.email || "your mailbox"}!`,
        });
        if (profile?.email) {
          fetchMailboxStatus(profile.email);
        } else {
          fetchProfile();
        }
        setTimeout(() => setMailboxActionMsg(null), 6000);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [profile?.email]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      if (data.role) setUserRole(data.role);

      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
      });

      // Fetch live mailbox status for this user's email
      if (data.email) {
        fetchMailboxStatus(data.email);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMailboxStatus = async (emailOverride?: string) => {
    const targetEmail = emailOverride || profile?.email || localStorage.getItem("email") || localStorage.getItem("user_email");
    if (!targetEmail) return;

    setIsCheckingMailbox(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/mail/status?email=${encodeURIComponent(targetEmail)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: MailboxStatus = await res.json();
        setMailboxStatus(data);
      }
    } catch (err) {
      console.error("Error fetching mailbox status:", err);
    } finally {
      setIsCheckingMailbox(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const handleConnectOutlook = async () => {
    const targetEmail = profile?.email || localStorage.getItem("email") || localStorage.getItem("user_email");
    if (!targetEmail) {
      setMailboxActionMsg({ type: "error", text: "No email address found to connect." });
      return;
    }

    setIsConnectingMailbox(true);
    setMailboxActionMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/mail/oauth/authorize?email=${encodeURIComponent(targetEmail)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start Microsoft authorization");
      }

      const data = await res.json();
      if (!data.authorize_url) {
        throw new Error("Missing authorization URL from server");
      }

      // Open OAuth in centered popup window
      const width = 600;
      const height = 720;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        data.authorize_url,
        "MicrosoftOutlookAuth",
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      // Fallback timer to poll status when popup finishes or closes
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setIsConnectingMailbox(false);
          fetchMailboxStatus(targetEmail);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Failed to connect Outlook:", err);
      setMailboxActionMsg({
        type: "error",
        text: err.message || "Failed to initiate Microsoft Outlook connection.",
      });
      setIsConnectingMailbox(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    const targetEmail = profile?.email || localStorage.getItem("email") || localStorage.getItem("user_email");
    if (!targetEmail) return;

    if (!confirm(`Are you sure you want to disconnect Outlook mailbox for ${targetEmail}? Outgoing emails will pause until re-authorized.`)) {
      return;
    }

    setIsDisconnectingMailbox(true);
    setMailboxActionMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/mail/disconnect?email=${encodeURIComponent(targetEmail)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to disconnect mailbox");
      }

      setMailboxActionMsg({
        type: "success",
        text: `Mailbox ${targetEmail} has been disconnected.`,
      });
      fetchMailboxStatus(targetEmail);
      setTimeout(() => setMailboxActionMsg(null), 5000);
    } catch (err: any) {
      console.error("Error disconnecting mailbox:", err);
      setMailboxActionMsg({
        type: "error",
        text: err.message || "Failed to disconnect mailbox.",
      });
    } finally {
      setIsDisconnectingMailbox(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredAgents = useMemo(() => {
    if (!agentSearchTerm.trim()) return agents || [];
    const term = agentSearchTerm.toLowerCase().trim();
    return (agents || []).filter(
      (a: any) =>
        (a.name && a.name.toLowerCase().includes(term)) ||
        (a.email && a.email.toLowerCase().includes(term))
    );
  }, [agents, agentSearchTerm]);

  const handleAddAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAgentError("");
    setAddAgentSuccess("");

    const name = newAgentForm.name.trim();
    const email = newAgentForm.email.trim().toLowerCase();
    const phone = newAgentForm.phone.trim();
    const password = newAgentForm.password.trim();

    if (!name || name.length < 2) {
      setAddAgentError("Agent full name is required (minimum 2 characters).");
      return;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setAddAgentError("Please enter a valid email address (e.g. agent@capco.com).");
        return;
      }
    }

    setIsAddingAgent(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email: email || undefined,
          password: password || undefined,
          phone: phone || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create agent");
      }

      const createdAgent = await res.json();
      setAddAgentSuccess(`Agent "${createdAgent.name}" added successfully!`);
      showToast(`Agent "${createdAgent.name}" added successfully!`, "success");
      setNewAgentForm({ name: "", email: "", password: "", phone: "" });
      await fetchAgents();
      setTimeout(() => {
        setIsAddAgentModalOpen(false);
        setAddAgentSuccess("");
      }, 1000);
    } catch (err: any) {
      setAddAgentError(err.message || "Failed to add agent.");
    } finally {
      setIsAddingAgent(false);
    }
  };

  const handleDeleteAgent = async (agentId: number, agentName: string) => {
    const confirmed = await confirmDialog(
      `Are you sure you want to remove agent "${agentName}"? This will deactivate their login and remove them from the agency team roster.`,
      "Remove Agent",
      "Delete Agent",
      "danger"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents/${agentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete agent");
      }
      showToast(`Agent "${agentName}" removed successfully.`, "success");
      fetchAgents();
    } catch (err: any) {
      showToast(err.message || "Failed to remove agent.", "error");
    }
  };

  const handleCopyEmail = async (agentId: number, email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedAgentId(agentId);
      showToast(`Copied ${email} to clipboard!`, "info");
      setTimeout(() => setCopiedAgentId(null), 2500);
    } catch {
      showToast("Unable to copy to clipboard", "error");
    }
  };

  if (!mounted) return null;

  const isAgent = profile?.role === "agent" || userRole === "agent";
  const isMailConnected = mailboxStatus?.status === "Connected" && mailboxStatus?.has_token;

  return (
    <div suppressHydrationWarning className="flex flex-col bg-[#f5f1eb] min-h-screen text-text-main font-sans h-screen">
      <Header
        onToggleDrawer={() => {}}
        onProfileClick={() => router.push("/agency/agency-profile")}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === "Customers") router.push("/agency/dashboard");
          else if (tab === "Agent Control") router.push("/agency/agency-profile");
        }} userRole={userRole} />

        <main className="flex-1 flex flex-col min-w-0 bg-[#f5f1eb] overflow-hidden">
          {/* Top Title Bar */}
          <div className="px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-[#e5ddd5] bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/agency/dashboard")}
                className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-bold text-[#6b5e52] hover:text-[#2d2a26] bg-[#f5f1eb] hover:bg-[#ebe5dd] rounded-lg transition-colors cursor-pointer border border-[#e5ddd5]"
                title="Return to Dashboard"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <div className="h-4 w-px bg-[#e5ddd5]" />

              <div className="h-9 w-9 bg-[#9A8B7A]/15 rounded-xl flex items-center justify-center text-[#9A8B7A]">
                {isAgent ? <User size={19} /> : <Building2 size={19} />}
              </div>
              <div>
                <h1 className="text-base font-bold text-[#2d2a26] leading-tight">
                  {isAgent ? "Agent Profile & Mailbox Overview" : "Agency Profile & Settings"}
                </h1>
                <p className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider">
                  {profile?.name || (isLoading ? "Loading..." : "Account Overview")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                  <CheckCircle size={13} />
                  <span>Profile updated</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push("/agency/dashboard")}
                className="h-8.5 px-3 flex items-center gap-1.5 bg-white border border-[#e5ddd5] text-[#2d2a26] hover:bg-[#FAF8F5] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <LayoutDashboard size={13} className="text-[#9A8B7A]" />
                <span>Go to Dashboard</span>
              </button>

              {!isAgent && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAgentSearchTerm("");
                      setIsViewAllAgentsModalOpen(true);
                    }}
                    className="h-8.5 px-3 flex items-center gap-1.5 bg-white border border-[#e5ddd5] text-[#2d2a26] hover:bg-[#FAF8F5] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    title="View all agency team agents"
                  >
                    <Users size={13} className="text-[#9A8B7A]" />
                    <span>View All Agents</span>
                    {agents.length > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-[#9A8B7A]/15 text-[#9A8B7A] px-1.5 py-0.2 rounded-full">
                        {agents.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewAgentForm({ name: "", email: "", password: "", phone: "" });
                      setAddAgentError("");
                      setAddAgentSuccess("");
                      setIsAddAgentModalOpen(true);
                    }}
                    className="h-8.5 px-3 flex items-center gap-1.5 bg-[#9A8B7A]/15 border border-[#9A8B7A]/30 text-[#9A8B7A] hover:bg-[#9A8B7A]/25 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    title="Add new agent to agency"
                  >
                    <UserPlus size={13} />
                    <span>Add Agent</span>
                  </button>
                </>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={!profile}
                  className="h-8.5 px-3.5 flex items-center gap-1.5 bg-[#9A8B7A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8a6f4d] active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError("");
                      if (profile) {
                        setEditForm({
                          name: profile.name || "",
                          phone: profile.phone || "",
                          address: profile.address || "",
                          city: profile.city || "",
                          state: profile.state || "",
                          zip: profile.zip || "",
                        });
                      }
                    }}
                    className="h-8.5 px-3 flex items-center gap-1.5 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                  <button
                    form="profile-form"
                    type="submit"
                    disabled={isSaving}
                    className="h-8.5 px-3.5 flex items-center gap-1.5 bg-[#9A8B7A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8a6f4d] active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action alerts */}
          {mailboxActionMsg && (
            <div className={`mx-6 mt-4 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              mailboxActionMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center gap-2">
                {mailboxActionMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                <span>{mailboxActionMsg.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setMailboxActionMsg(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Main content scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-72 gap-3">
                <Loader2 className="animate-spin text-[#9A8B7A]" size={36} />
                <span className="text-xs font-bold text-[#6b5e52] uppercase tracking-widest">
                  Loading account profile...
                </span>
              </div>
            ) : profile ? (
              <form id="profile-form" onSubmit={handleSave} className="space-y-6 max-w-[1400px] mx-auto">
                {saveError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    <AlertCircle size={15} />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* ── TOP HERO CARD: Identity & Overview ── */}
                <div className="bg-white border border-[#e5ddd5] rounded-2xl shadow-xs overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FAF8F5] via-[#f5f1eb] to-[#FAF8F5] px-6 py-5 border-b border-[#e5ddd5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-[#9A8B7A] text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-[#9A8B7A]/25 shrink-0">
                        {profile.name?.charAt(0)?.toUpperCase() || (isAgent ? "A" : "O")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-black text-[#2d2a26] leading-snug">
                            {profile.name}
                          </h2>
                          <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#9A8B7A]/15 text-[#9A8B7A] border border-[#9A8B7A]/25">
                            {isAgent ? "Licensed Agent" : "Agency Principal"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Account
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#6b5e52] mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail size={13} className="text-[#9A8B7A]" />
                            <span className="font-semibold text-[#2d2a26]">{profile.email}</span>
                          </span>
                          {profile.agency_name && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Building2 size={13} className="text-[#9A8B7A]" />
                              <span>{profile.agency_name}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar size={13} className="text-[#9A8B7A]" />
                            <span>Member since {formatDate(profile.created_date)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                          Agency Domain
                        </span>
                        <span className="text-xs font-mono font-bold text-[#9A8B7A] bg-[#9A8B7A]/10 px-2.5 py-1 rounded-lg inline-block border border-[#9A8B7A]/20 mt-0.5">
                          @{profile.domain || "capco.com"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── GRID: Main Outlook Connection Card + Overview & Agency Info ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Column: Outlook Mailbox Integration & Contact Info (2 Cols) */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* ══════════════════════════════════════════════════════════
                        MICROSOFT OUTLOOK MAILBOX INTEGRATION CARD (HIGHLIGHT)
                       ══════════════════════════════════════════════════════════ */}
                    <div className="bg-white border-2 border-[#0078D4]/20 rounded-2xl shadow-sm overflow-hidden relative">
                      {/* Microsoft Brand Header Bar */}
                      <div className="bg-gradient-to-r from-[#0078D4]/10 via-[#0078D4]/5 to-transparent px-6 py-4 border-b border-[#0078D4]/15 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#0078D4] text-white flex items-center justify-center shadow-md shadow-[#0078D4]/30 shrink-0">
                            {/* Official Outlook / M365 Mailbox Icon */}
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-extrabold text-[#2d2a26]">
                                Microsoft Outlook Mailbox Integration
                              </h3>
                              <span className="text-[10px] font-bold bg-[#0078D4]/10 text-[#0078D4] px-2 py-0.5 rounded-full border border-[#0078D4]/20">
                                Microsoft 365
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6b5e52]">
                              Direct agent email authorization for Certificates of Insurance & Client dispatch
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fetchMailboxStatus()}
                          disabled={isCheckingMailbox}
                          className="h-8 w-8 rounded-lg border border-[#e5ddd5] hover:bg-[#FAF8F5] flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] transition-colors cursor-pointer"
                          title="Refresh mailbox status"
                        >
                          <RefreshCw size={13} className={isCheckingMailbox ? "animate-spin" : ""} />
                        </button>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Status banner */}
                        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isMailConnected
                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                            : "bg-amber-50/80 border-amber-200 text-amber-950"
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isMailConnected ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                            }`}>
                              {isMailConnected ? <Check size={16} strokeWidth={3} /> : <AlertCircle size={16} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs">
                                  {isMailConnected ? "Outlook Mailbox Connected & Verified" : "Outlook Mailbox Not Connected"}
                                </span>
                                <span className={`h-2 w-2 rounded-full ${
                                  isMailConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                }`} />
                              </div>
                              <p className="text-[11px] text-[#6b5e52] mt-0.5 leading-relaxed">
                                {isMailConnected
                                  ? `Authorized to dispatch real client emails and Certificates of Insurance directly from ${mailboxStatus?.email || profile.email}. Sent emails will appear in your Microsoft Outlook Sent Items.`
                                  : `Connect your official Microsoft Outlook / 365 business mailbox (${profile.email}) so Certificate of Insurance emails send directly from you.`}
                              </p>
                            </div>
                          </div>

                          {/* Connection Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isMailConnected ? (
                              <button
                                type="button"
                                onClick={handleDisconnectOutlook}
                                disabled={isDisconnectingMailbox}
                                className="h-9 px-3.5 flex items-center gap-1.5 border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isDisconnectingMailbox ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                                <span>{isDisconnectingMailbox ? "Disconnecting..." : "Disconnect Mailbox"}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleConnectOutlook}
                                disabled={isConnectingMailbox}
                                className="h-9.5 px-4.5 flex items-center gap-2 bg-[#0078D4] hover:bg-[#006bbd] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#0078D4]/25 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
                              >
                                {isConnectingMailbox ? <Loader2 size={14} className="animate-spin" /> : (
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                                  </svg>
                                )}
                                <span>{isConnectingMailbox ? "Authorizing..." : "Connect Microsoft Outlook"}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Integration Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                            <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                              Assigned Email
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold text-[#2d2a26] truncate">
                                {profile.email}
                              </span>
                              <span title="Fixed Agency Email" className="inline-flex items-center">
                                <Lock size={11} className="text-[#9A8B7A] shrink-0" />
                              </span>
                            </div>
                            <span className="text-[9px] text-[#6b5e52] block mt-0.5">
                              Fixed by Agency (Outlook identity)
                            </span>
                          </div>

                          <div className="p-3 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                            <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                              Microsoft Provider
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold text-[#2d2a26]">
                                Microsoft Graph API
                              </span>
                            </div>
                            <span className="text-[9px] text-[#6b5e52] block mt-0.5">
                              OAuth 2.0 / OIDC Verified
                            </span>
                          </div>

                          <div className="p-3 bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                            <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                              Audit Logging
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 text-emerald-700">
                              <CheckCircle size={13} />
                              <span className="text-xs font-bold">
                                Compliant & Logged
                              </span>
                            </div>
                            <span className="text-[9px] text-[#6b5e52] block mt-0.5">
                              Every dispatch recorded
                            </span>
                          </div>
                        </div>

                        {/* Informational Guidance */}
                        <div className="text-[11px] text-[#6b5e52] bg-white p-3.5 rounded-xl border border-dashed border-[#e5ddd5] space-y-1">
                          <div className="font-bold text-[#2d2a26] flex items-center gap-1.5">
                            <Shield size={12} className="text-[#9A8B7A]" />
                            <span>Agency Email Isolation & Security Policy:</span>
                          </div>
                          <p>
                            Each agent operates their own dedicated Microsoft mailbox. When you send Certificates of Insurance, emails are dispatched directly through Microsoft's secure Graph API using your verified token, ensuring 100% genuine sender reputation, deliverability to customer inboxes, and automatic preservation in your Sent Items folder.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════
                        INFORMATION OVERVIEW & EDITABLE PROFILE CARD
                       ══════════════════════════════════════════════════════════ */}
                    <div className="bg-white border border-[#e5ddd5] rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#e5ddd5] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-[#9A8B7A]/10 text-[#9A8B7A] flex items-center justify-center">
                            <User size={15} />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#2d2a26] uppercase tracking-wider">
                              Information Overview
                            </h3>
                            <p className="text-[10px] text-[#6b5e52]">
                              {isAgent ? "Agent profile and agency affiliation details" : "Official agency credentials and contact info"}
                            </p>
                          </div>
                        </div>
                        {isEditing && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            Editing Mode
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                          {/* Full Name */}
                          <div>
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              {isAgent ? "Agent Full Name" : "Agency Name"}
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                                className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                              />
                            ) : (
                              <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                                {profile.name || "—"}
                              </div>
                            )}
                          </div>

                          {/* Email (Always Read-Only per Agency Policy) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                                Official Email Address
                              </label>
                              <span className="text-[9px] font-bold text-[#9A8B7A] flex items-center gap-1">
                                <Lock size={10} /> Fixed
                              </span>
                            </div>
                            <div className="h-9.5 px-3 flex items-center justify-between text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                              <span className="truncate">{profile.email}</span>
                              <Lock size={12} className="text-[#9A8B7A] shrink-0" />
                            </div>
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              Contact Phone
                            </label>
                            {isEditing && !isAgent ? (
                              <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                placeholder="(555) 000-0000"
                                className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                              />
                            ) : (
                              <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                                <Phone size={13} className="text-[#9A8B7A] mr-2 shrink-0" />
                                {profile.phone || "—"}
                              </div>
                            )}
                          </div>

                          {/* Agency Name */}
                          <div>
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              Affiliated Agency
                            </label>
                            <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                              <Building2 size={13} className="text-[#9A8B7A] mr-2 shrink-0" />
                              <span>{profile.agency_name || "Sterling Insurance Agency"}</span>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              Agency Office Address
                            </label>
                            {isEditing && !isAgent ? (
                              <input
                                type="text"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                placeholder="Street address"
                                className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                              />
                            ) : (
                              <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                                <MapPin size={13} className="text-[#9A8B7A] mr-2 shrink-0" />
                                {profile.address || "—"}
                              </div>
                            )}
                          </div>

                          {/* City, State, Zip */}
                          <div>
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              City
                            </label>
                            {isEditing && !isAgent ? (
                              <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                              />
                            ) : (
                              <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                                {profile.city || "—"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                              State & Zip Code
                            </label>
                            {isEditing && !isAgent ? (
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editForm.state}
                                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                  placeholder="State"
                                  className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                                />
                                <input
                                  type="text"
                                  value={editForm.zip}
                                  onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                                  placeholder="Zip"
                                  className="w-full h-9.5 px-3 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                                />
                              </div>
                            ) : (
                              <div className="h-9.5 px-3 flex items-center text-xs font-semibold text-[#2d2a26] bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl">
                                {[profile.state, profile.zip].filter(Boolean).join(" ") || "—"}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Actions & Team / Agency Details (1 Col) */}
                  <div className="space-y-6">

                    {/* Quick Access Card */}
                    <div className="bg-white border border-[#e5ddd5] rounded-2xl shadow-xs p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard size={16} className="text-[#9A8B7A]" />
                        <h3 className="text-xs font-extrabold text-[#2d2a26] uppercase tracking-wider">
                          Agent Navigation
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => router.push("/agency/dashboard")}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#f5f1eb] border border-[#e5ddd5] text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Users size={15} className="text-[#9A8B7A]" />
                            <div>
                              <p className="text-xs font-bold text-[#2d2a26]">Customer Roster</p>
                              <p className="text-[10px] text-[#6b5e52]">Manage clients and policies</p>
                            </div>
                          </div>
                          <ChevronRight size={13} className="text-[#6b5e52] group-hover:text-[#2d2a26] transition-colors" />
                        </button>

                        <button
                          type="button"
                          onClick={() => router.push("/agency/dashboard?tab=Customers")}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#f5f1eb] border border-[#e5ddd5] text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Mail size={15} className="text-[#9A8B7A]" />
                            <div>
                              <p className="text-xs font-bold text-[#2d2a26]">E-Forms & Certificates</p>
                              <p className="text-[10px] text-[#6b5e52]">Issue COI via Outlook</p>
                            </div>
                          </div>
                          <ChevronRight size={13} className="text-[#6b5e52] group-hover:text-[#2d2a26] transition-colors" />
                        </button>

                        {!isAgent && (
                          <button
                            type="button"
                            onClick={() => {
                              setAgentSearchTerm("");
                              setIsViewAllAgentsModalOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#f5f1eb] border border-[#e5ddd5] text-left transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Users size={15} className="text-[#9A8B7A]" />
                              <div>
                                <p className="text-xs font-bold text-[#2d2a26]">All Agents Roster</p>
                                <p className="text-[10px] text-[#6b5e52]">View & manage {agents.length} active agents</p>
                              </div>
                            </div>
                            <ChevronRight size={13} className="text-[#6b5e52] group-hover:text-[#2d2a26] transition-colors" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Agency Office Summary Card */}
                    <div className="bg-white border border-[#e5ddd5] rounded-2xl shadow-xs overflow-hidden">
                      <div className="bg-[#FAF8F5] px-5 py-3.5 border-b border-[#e5ddd5] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 size={15} className="text-[#9A8B7A]" />
                          <h3 className="text-xs font-bold text-[#2d2a26]">Agency Details</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#9A8B7A] bg-[#9A8B7A]/10 px-2 py-0.5 rounded-md">
                          ID: #{profile.agency_id || profile.id}
                        </span>
                      </div>

                      <div className="p-5 space-y-3.5 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                            Agency Name
                          </span>
                          <span className="font-bold text-[#2d2a26] text-sm">
                            {profile.agency_name || profile.name}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                            Agency Office Email
                          </span>
                          <span className="font-semibold text-[#2d2a26]">
                            {profile.agency_email || (profile.domain ? `office@${profile.domain}` : "info@sterlinginsurance.com")}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-wider block">
                            Main Office Address
                          </span>
                          <span className="text-[#2d2a26]">
                            {[profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(", ") || "Main Office, San Antonio, TX"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Team Members List (If agency or agents available) */}
                    {!isAgent && (
                      <div className="bg-white border border-[#e5ddd5] rounded-2xl shadow-xs overflow-hidden">
                        <div className="bg-[#FAF8F5] px-5 py-3.5 border-b border-[#e5ddd5] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users size={15} className="text-[#9A8B7A]" />
                            <h3 className="text-xs font-bold text-[#2d2a26]">Agency Team</h3>
                            <span className="text-[10px] font-bold bg-[#9A8B7A] text-white px-2 py-0.5 rounded-full">
                              {agents.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {agents.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAgentSearchTerm("");
                                  setIsViewAllAgentsModalOpen(true);
                                }}
                                className="text-[11px] font-bold text-[#9A8B7A] hover:text-[#8a6f4d] hover:underline px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-0.5"
                              >
                                <span>View All</span>
                                <ChevronRight size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNewAgentForm({ name: "", email: "", password: "", phone: "" });
                                setAddAgentError("");
                                setAddAgentSuccess("");
                                setIsAddAgentModalOpen(true);
                              }}
                              className="h-7 px-2.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer border-none"
                              title="Add new agent"
                            >
                              <UserPlus size={12} />
                              <span>Add Agent</span>
                            </button>
                          </div>
                        </div>

                        {agents.length === 0 ? (
                          <div className="p-6 text-center space-y-2">
                            <Users size={24} className="text-[#9A8B7A]/50 mx-auto" />
                            <p className="text-xs font-bold text-[#2d2a26]">No agents in your team yet</p>
                            <p className="text-[10px] text-[#6b5e52]">
                              Add agents to allow team members to access client rosters and issue policies.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setNewAgentForm({ name: "", email: "", password: "", phone: "" });
                                setAddAgentError("");
                                setAddAgentSuccess("");
                                setIsAddAgentModalOpen(true);
                              }}
                              className="mt-2 h-7 px-3 bg-[#9A8B7A] text-white text-[11px] font-bold rounded-lg hover:bg-[#8a6f4d] cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              <UserPlus size={12} />
                              <span>Add Your First Agent</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="divide-y divide-[#e5ddd5]/60 max-h-[260px] overflow-y-auto">
                              {agents.map((agent) => (
                                <div
                                  key={agent.id}
                                  onClick={() => router.push(`/agency/agent/${agent.id}`)}
                                  className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                                  title={`View ${agent.name}'s profile`}
                                >
                                  <div className="h-7 w-7 rounded-full bg-[#9A8B7A]/15 flex items-center justify-center text-[#9A8B7A] font-extrabold text-[11px] shrink-0 group-hover:bg-[#9A8B7A] group-hover:text-white transition-colors">
                                    {agent.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#2d2a26] truncate group-hover:text-[#9A8B7A] transition-colors">
                                      {agent.name}
                                    </p>
                                    <p className="text-[10px] text-[#6b5e52] truncate">{agent.email}</p>
                                  </div>
                                  <ChevronRight size={13} className="text-slate-300 group-hover:text-[#9A8B7A] group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              ))}
                            </div>

                            {/* Card Footer: View All Agents Button */}
                            <div className="p-2.5 bg-[#FAF8F5] border-t border-[#e5ddd5] flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAgentSearchTerm("");
                                  setIsViewAllAgentsModalOpen(true);
                                }}
                                className="flex-1 py-1.5 px-3 bg-white hover:bg-[#FAF8F5] border border-[#e5ddd5] text-xs font-bold text-[#2d2a26] hover:text-[#9A8B7A] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              >
                                <Users size={13} className="text-[#9A8B7A]" />
                                <span>View All Agents ({agents.length})</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 gap-3 bg-white border border-[#e5ddd5] rounded-2xl p-8 max-w-md mx-auto text-center">
                <AlertCircle size={32} className="text-[#9A8B7A]" />
                <h3 className="text-sm font-bold text-[#2d2a26]">Profile Not Found</h3>
                <p className="text-xs text-[#6b5e52]">
                  Unable to load your profile information. Please ensure you are logged in.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-2 px-4 py-2 bg-[#9A8B7A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8a6f4d] cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MODAL: ADD AGENT ── */}
      {isAddAgentModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-[#e5ddd5] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#e5ddd5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center font-bold">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#2d2a26]">Add New Agent</h3>
                    <p className="text-[10px] text-[#6b5e52]">Create credentials for a new team member</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAgentModalOpen(false)}
                  className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#2d2a26] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddAgentSubmit} className="p-6 space-y-4">
                {addAgentError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{addAgentError}</span>
                  </div>
                )}

                {addAgentSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{addAgentSuccess}</span>
                  </div>
                )}

                {/* Agent Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                    placeholder="e.g. Sarah Connor"
                    className="w-full h-10 px-3.5 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                </div>

                {/* Business Email */}
                <div>
                  <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                    Business Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newAgentForm.email}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, email: e.target.value })}
                    placeholder={`e.g. sarah@${profile?.domain || "capco.com"}`}
                    className="w-full h-10 px-3.5 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                  <p className="text-[10px] text-[#6b5e52] mt-1">
                    Agent will use this email address to log into their agency workspace.
                  </p>
                </div>

                {/* Password (Optional) */}
                <div>
                  <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                    Temporary Password <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={newAgentForm.password}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, password: e.target.value })}
                    placeholder="Leave blank to auto-generate password"
                    className="w-full h-10 px-3.5 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                  <p className="text-[10px] text-[#6b5e52] mt-1">
                    If left blank, a secure random password will be assigned automatically.
                  </p>
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label className="text-[11px] font-bold text-[#6b5e52] uppercase tracking-wider block mb-1.5">
                    Direct Phone <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={newAgentForm.phone}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full h-10 px-3.5 text-xs bg-white border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-[#e5ddd5] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddAgentModalOpen(false)}
                    className="h-9 px-4 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingAgent}
                    className="h-9 px-4.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border-none disabled:opacity-50"
                  >
                    {isAddingAgent ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Creating Agent...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} />
                        <span>Add Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: VIEW ALL AGENTS ── */}
      {isViewAllAgentsModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-[#e5ddd5] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#e5ddd5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#2d2a26]">All Agency Agents</h3>
                      <span className="text-[10px] font-bold bg-[#9A8B7A] text-white px-2 py-0.5 rounded-full">
                        {agents.length} Total
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b5e52]">
                      Complete team roster for {profile?.agency_name || profile?.name || "your agency"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isAgent && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewAgentForm({ name: "", email: "", password: "", phone: "" });
                        setAddAgentError("");
                        setAddAgentSuccess("");
                        setIsAddAgentModalOpen(true);
                      }}
                      className="h-8 px-3 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border-none"
                    >
                      <UserPlus size={13} />
                      <span>Add Agent</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsViewAllAgentsModalOpen(false)}
                    className="h-8 w-8 rounded-xl border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#2d2a26] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-[#e5ddd5] bg-white">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={agentSearchTerm}
                    onChange={(e) => setAgentSearchTerm(e.target.value)}
                    placeholder="Search agents by name or email address..."
                    className="w-full h-9 pl-9 pr-8 text-xs bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl focus:outline-none focus:border-[#9A8B7A] focus:bg-white transition-all"
                  />
                  {agentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setAgentSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Agent Roster List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#e5ddd5]/60">
                {filteredAgents.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-2">
                    <Users size={28} className="text-[#9A8B7A]/40 mx-auto" />
                    <p className="text-xs font-bold text-[#2d2a26]">
                      {agentSearchTerm ? `No agents found matching "${agentSearchTerm}"` : "No agents registered yet"}
                    </p>
                    <p className="text-[10px] text-[#6b5e52]">
                      {agentSearchTerm ? "Try searching by another name or email." : "Click 'Add Agent' to add your first team member."}
                    </p>
                  </div>
                ) : (
                  filteredAgents.map((agent: any) => (
                    <div
                      key={agent.id}
                      className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center font-extrabold text-sm shrink-0">
                          {agent.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsViewAllAgentsModalOpen(false);
                                router.push(`/agency/agent/${agent.id}`);
                              }}
                              className="text-xs font-black text-[#2d2a26] hover:text-[#9A8B7A] hover:underline truncate cursor-pointer text-left"
                            >
                              {agent.name}
                            </button>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#6b5e52] mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail size={11} className="text-[#9A8B7A]" />
                              <span>{agent.email}</span>
                            </span>
                            {agent.created_date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} className="text-[#9A8B7A]" />
                                <span>Joined {new Date(agent.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(agent.id, agent.email)}
                          className="h-8 px-2.5 text-xs font-bold text-[#6b5e52] hover:text-[#2d2a26] bg-white hover:bg-[#ebe5dd] border border-[#e5ddd5] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy email to clipboard"
                        >
                          {copiedAgentId === agent.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span className="hidden sm:inline">{copiedAgentId === agent.id ? "Copied" : "Copy"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsViewAllAgentsModalOpen(false);
                            router.push(`/agency/agent/${agent.id}`);
                          }}
                          className="h-8 px-3 text-xs font-bold text-[#2d2a26] bg-white hover:bg-[#FAF8F5] border border-[#e5ddd5] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="View Agent Profile"
                        >
                          <Eye size={12} className="text-[#9A8B7A]" />
                          <span>Profile</span>
                        </button>

                        {!isAgent && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAgent(agent.id, agent.name)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                            title="Remove agent from agency"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 px-6 border-t border-[#e5ddd5] bg-[#FAF8F5] flex items-center justify-between text-xs font-semibold text-[#6b5e52]">
                <span>
                  Showing {filteredAgents.length} of {agents.length} {agents.length === 1 ? "agent" : "agents"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsViewAllAgentsModalOpen(false)}
                  className="h-8 px-4 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
