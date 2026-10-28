/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
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
  Calendar,
  Edit3,
  X,
  Loader2,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Send,
  Info,
  Copy,
  Check,
  Unlink,
  User,
  ExternalLink
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
  const [invitations, setInvitations] = useState<any[]>([]);
  const [agentTab, setAgentTab] = useState<"agents" | "invitations">("agents");
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  // Add Agent Modal
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [agentFormLoading, setAgentFormLoading] = useState(false);
  const [agentFormError, setAgentFormError] = useState("");
  const [agentFormSuccess, setAgentFormSuccess] = useState("");
  const [addAgentForm, setAddAgentForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });

  // Invitation Email Modal
  const [isInvitationEmailModalOpen, setIsInvitationEmailModalOpen] = useState(false);
  const [currentInvitation, setCurrentInvitation] = useState<any>(null);
  const [invitationEmailRecipient, setInvitationEmailRecipient] = useState("");
  const [invitationEmailSubject, setInvitationEmailSubject] = useState("You're invited to join Sterling AMS");
  const [invitationEmailBody, setInvitationEmailBody] = useState("");
  const [outlookNoticeShown, setOutlookNoticeShown] = useState(false);
  const [emailCopiedFeedback, setEmailCopiedFeedback] = useState(false);
  const [emailModalViewMode, setEmailModalViewMode] = useState<"preview" | "text">("preview");

  // Mailbox integration state
  const [mailboxStatus, setMailboxStatus] = useState<MailboxStatus | null>(null);
  const [isConnectingMailbox, setIsConnectingMailbox] = useState(false);
  const [isDisconnectingMailbox, setIsDisconnectingMailbox] = useState(false);

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
    fetchInvitations();
  }, []);

  // Listen for OAuth completion broadcast from callback popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "OUTLOOK_CONNECTED") {
        showToast(`Microsoft Outlook successfully connected to ${event.data.email || "your mailbox"}!`, "success");
        if (profile?.email) {
          fetchMailboxStatus(profile.email);
        } else {
          fetchProfile();
        }
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

      setEditProfileForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
      });

      if (data.email) {
        fetchMailboxStatus(data.email);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
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

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setInvitations(data);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  const fetchMailboxStatus = async (emailOverride?: string) => {
    const targetEmail = emailOverride || profile?.email || localStorage.getItem("email");
    if (!targetEmail) return;

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
    }
  };

  const handleConnectOutlook = async () => {
    const targetEmail = profile?.email || localStorage.getItem("email");
    if (!targetEmail) {
      showToast("No email address found to connect.", "error");
      return;
    }

    setIsConnectingMailbox(true);
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
      if (!data.authorize_url) throw new Error("Missing authorization URL");

      const width = 600;
      const height = 720;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        data.authorize_url,
        "MicrosoftOutlookAuth",
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setIsConnectingMailbox(false);
          fetchMailboxStatus(targetEmail);
        }
      }, 1000);
    } catch (err: any) {
      showToast(err.message || "Failed to connect Outlook", "error");
      setIsConnectingMailbox(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    const targetEmail = profile?.email || localStorage.getItem("email");
    if (!targetEmail) return;

    const confirmed = await confirmDialog(
      `Are you sure you want to disconnect Outlook mailbox for ${targetEmail}?`,
      "Disconnect Outlook",
      "Disconnect",
      "danger"
    );
    if (!confirmed) return;

    setIsDisconnectingMailbox(true);
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

      showToast(`Mailbox ${targetEmail} disconnected.`, "success");
      fetchMailboxStatus(targetEmail);
    } catch (err: any) {
      showToast(err.message || "Failed to disconnect mailbox.", "error");
    } finally {
      setIsDisconnectingMailbox(false);
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editProfileForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      setIsEditProfileModalOpen(false);
      showToast("Agency profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentFormLoading(true);
    setAgentFormError("");
    setAgentFormSuccess("");

    const name = addAgentForm.name.trim();
    const email = addAgentForm.email.trim().toLowerCase();
    const phone = addAgentForm.phone.trim();
    const city = addAgentForm.city.trim();
    const state = addAgentForm.state.trim();

    if (!name || name.length < 2) {
      setAgentFormError("Agent Full Name is required (minimum 2 characters).");
      setAgentFormLoading(false);
      return;
    }
    if (!email) {
      setAgentFormError("Business Email is required.");
      setAgentFormLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAgentFormError("Please enter a valid business email address (e.g. agent@domain.com).");
      setAgentFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          city: city || null,
          state: state || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create agent invitation");
      }

      const invitationData = await res.json();
      setAgentFormSuccess("Agent invitation prepared successfully!");
      setAddAgentForm({ name: "", email: "", phone: "", city: "", state: "" });
      setIsAddAgentModalOpen(false);
      fetchInvitations();
      fetchAgents();
      openInvitationEmailModal(invitationData);
    } catch (error: any) {
      setAgentFormError(error.message || "Failed to prepare invitation");
    } finally {
      setAgentFormLoading(false);
    }
  };

  const openInvitationEmailModal = (invitation: any) => {
    setCurrentInvitation(invitation);
    const agentName = invitation.name || "Agent";
    const agencyName = invitation.agency_name || profile?.agency_name || profile?.name || "Our Agency";
    const adminName = invitation.admin_name || profile?.name || "Agency Administrator";
    const verificationLink = invitation.verification_url || `${window.location.origin}/verify-invitation?token=${invitation.token}&demo=true`;
    const verificationCode = invitation.code || "849201";

    const defaultBody = `Hello ${agentName},

${agencyName} has invited you to join Sterling AMS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 YOUR 6-DIGIT VERIFICATION CODE:
👉  ${verificationCode}  👈
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Enter this code on the verification page to activate your account)

Please click the button link below to open your account setup:

👉 [ VERIFY & SET UP ACCOUNT ]
${verificationLink}

After entering your verification code (${verificationCode}), you will be able to set your password and connect your Outlook email.

If you were not expecting this invitation, please contact your agency administrator.

Regards,
${adminName}
${agencyName}`;

    setInvitationEmailRecipient(invitation.email);
    setInvitationEmailSubject(`Invitation to join ${agencyName} on Sterling AMS`);
    setInvitationEmailBody(defaultBody);
    setOutlookNoticeShown(false);
    setEmailCopiedFeedback(false);
    setEmailModalViewMode("preview");
    setIsInvitationEmailModalOpen(true);
  };

  const handleCopyHtmlEmail = async () => {
    if (!currentInvitation) return;
    const agentName = currentInvitation.name || "Agent";
    const agencyName = currentInvitation.agency_name || profile?.agency_name || profile?.name || "Our Agency";
    const adminName = currentInvitation.admin_name || profile?.name || "Agency Administrator";
    const verificationLink = currentInvitation.verification_url || `${window.location.origin}/verify-invitation?token=${currentInvitation.token}&demo=true`;
    const verificationCode = currentInvitation.code || "849201";

    const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5ddd5; border-radius: 16px; background-color: #ffffff; color: #2d2a26;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #2d2a26; margin: 0 0 4px 0; font-size: 20px; font-weight: 800;">Sterling AMS</h2>
    <p style="color: #9A8B7A; margin: 0; font-size: 12px; font-weight: 600;">Insurance Agency Management Platform</p>
  </div>
  
  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 12px 0;">Hello <strong>${agentName}</strong>,</p>
  <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;"><strong>${agencyName}</strong> has invited you to join Sterling AMS as an authorized Insurance Agent.</p>
  
  <div style="background-color: #FDF6F0; border: 2px dashed #F5E6D8; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9A8B7A; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
    <div style="font-size: 32px; font-weight: 900; color: #c2a07e; letter-spacing: 6px; font-family: monospace;">${verificationCode}</div>
    <div style="font-size: 11px; color: #6b5e52; margin-top: 6px; font-weight: 500;">Enter this code on the verification page to activate your account</div>
  </div>

  <div style="text-align: center; margin: 26px 0;">
    <a href="${verificationLink}" style="background-color: #c2a07e; color: #ffffff; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 28px; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(194, 160, 126, 0.35);">
      Verify &amp; Set Up Account &rarr;
    </a>
  </div>

  <p style="font-size: 11px; color: #888888; line-height: 1.5; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px;">
    Button not clicking? Copy and paste this URL into your browser:<br/>
    <a href="${verificationLink}" style="color: #c2a07e; word-break: break-all;">${verificationLink}</a>
  </p>

  <p style="font-size: 13px; color: #555555; margin-top: 18px;">
    Best regards,<br/>
    <strong>${adminName}</strong><br/>
    ${agencyName}
  </p>
</div>
`;

    try {
      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobText = new Blob([invitationEmailBody], { type: "text/plain" });
      const data = [new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText })];
      await navigator.clipboard.write(data);
      setEmailCopiedFeedback(true);
      showToast("Formatted email copied to clipboard!", "success");
      setTimeout(() => setEmailCopiedFeedback(false), 3500);
    } catch {
      await navigator.clipboard.writeText(invitationEmailBody);
      showToast("Email text copied to clipboard!", "success");
    }
  };

  const handleOpenInOutlook = async () => {
    if (!currentInvitation) return;
    const to = invitationEmailRecipient.trim();
    const subject = invitationEmailSubject.trim();
    const body = invitationEmailBody.trim();
    const outlookWebUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookWebUrl, "_blank", "noopener,noreferrer");

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/agency/invitations/${currentInvitation.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Pending Verification" }),
      });
      fetchInvitations();
    } catch (err) {
      console.error("Failed to update status to Pending Verification:", err);
    }

    setOutlookNoticeShown(true);
    showToast("Outlook compose opened in a new tab.", "info");
  };

  const handleCancelInvitation = async (invitationId: number, agentName: string) => {
    const confirm = await confirmDialog(
      `Are you sure you want to cancel the invitation for "${agentName}"?`,
      "Cancel Invitation",
      "Cancel",
      "danger"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations/${invitationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel invitation");
      showToast("Invitation cancelled successfully", "success");
      fetchInvitations();
    } catch (error: any) {
      showToast("Error cancelling invitation: " + error.message, "error");
    }
  };

  const handleDeleteAgent = async (agentId: number, agentName: string) => {
    const confirmDelete = await confirmDialog(
      `Are you sure you want to permanently delete agent "${agentName}"? This agent will no longer be able to log in.`,
      "Delete Agent",
      "Delete Agent",
      "danger"
    );
    if (!confirmDelete) return;

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
      showToast(`Agent "${agentName}" deleted successfully.`, "success");
      fetchAgents();
    } catch (error: any) {
      showToast("Error deleting agent: " + error.message, "error");
    }
  };

  if (!mounted) return null;

  const isAgent = profile?.role === "agent" || userRole === "agent";
  const isMailConnected = mailboxStatus?.status === "Connected" && mailboxStatus?.has_token;

  return (
    <div suppressHydrationWarning className="flex flex-col bg-[#f5f1eb] min-h-screen text-text-main font-sans">
      <Header
        onToggleDrawer={() => {}}
        onProfileClick={() => router.push("/agency/agency-profile")}
      />

      {/* Main Workspace Card Container (Matching First Screenshot) */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 pb-12 pt-2 flex flex-col">
        <div className="bg-white rounded-3xl border border-[#e5ddd5] shadow-2xs flex flex-col flex-1 p-5 sm:p-7 space-y-4">

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Agency Information */}
            <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 border-b border-[#e5ddd5]/60 pb-4 mb-4">
                  <div className="h-10 w-10 bg-[#9A8B7A]/15 rounded-xl flex items-center justify-center text-[#9A8B7A]">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2a26]">Agency Information</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure your profile</p>
                  </div>
                </div>

                {profile ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Agency Name
                      </label>
                      <p className="text-sm font-bold text-[#2d2a26] mt-0.5">
                        {profile.agency_name || profile.name}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Outlook Email
                        </label>
                        {mailboxStatus && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            isMailConnected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {mailboxStatus.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#2d2a26] mt-0.5">
                        {profile.email}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {!isMailConnected ? (
                          <button
                            type="button"
                            onClick={handleConnectOutlook}
                            disabled={isConnectingMailbox}
                            className="text-[11px] font-bold text-[#0078D4] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
                          >
                            <Mail size={12} />
                            <span>{isConnectingMailbox ? "Connecting..." : "Connect Microsoft Outlook"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleDisconnectOutlook}
                            disabled={isDisconnectingMailbox}
                            className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
                          >
                            <Unlink size={11} />
                            <span>{isDisconnectingMailbox ? "Disconnecting..." : "Disconnect Outlook"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Authorized Domain
                      </label>
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9A8B7A] bg-[#9A8B7A]/10 px-2 py-0.5 rounded-lg border border-[#9A8B7A]/20 mt-1">
                          {profile.domain || "capco.com"}
                        </span>
                      </div>
                    </div>

                    {profile.phone && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Phone
                        </label>
                        <p className="text-xs font-medium text-[#2d2a26] mt-0.5">
                          {profile.phone}
                        </p>
                      </div>
                    )}

                    {(profile.address || profile.city) && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Address
                        </label>
                        <p className="text-xs font-medium text-[#2d2a26] mt-0.5">
                          {profile.address}
                          {profile.city && `, ${profile.city}`}
                          {profile.state && ` ${profile.state}`}
                          {profile.zip && ` ${profile.zip}`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="animate-spin text-[#9A8B7A] size-5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      Loading profile...
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (profile) {
                    setEditProfileForm({
                      name: profile.name || "",
                      phone: profile.phone || "",
                      address: profile.address || "",
                      city: profile.city || "",
                      state: profile.state || "",
                      zip: profile.zip || "",
                    });
                    setIsEditProfileModalOpen(true);
                  }
                }}
                className="w-full h-10 mt-6 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Edit Profile Details
              </button>
            </div>

            {/* Right Column: Agency Team */}
            <div className="lg:col-span-2 bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-[#e5ddd5]/60 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#9A8B7A]/15 rounded-xl flex items-center justify-center text-[#9A8B7A]">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2a26]">Agency Team</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {agents.length} Active {agents.length === 1 ? 'Agent' : 'Agents'} • {invitations.length} Pending {invitations.length === 1 ? 'Invitation' : 'Invitations'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAddAgentForm({ name: "", email: "", phone: "", city: "", state: "" });
                    setAgentFormError("");
                    setAgentFormSuccess("");
                    setIsAddAgentModalOpen(true);
                  }}
                  className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Plus size={14} />
                  + Add Agent
                </button>
              </div>

              {/* Segmented Sub-Tabs */}
              <div className="flex items-center gap-2 mb-4 bg-slate-100/80 p-1 rounded-xl w-fit border border-[#e5ddd5]/50">
                <button
                  type="button"
                  onClick={() => setAgentTab("agents")}
                  className={`h-8 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                    agentTab === "agents"
                      ? "bg-white text-[#9A8B7A] shadow-xs"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  <Users size={13} />
                  Active Agents
                  <span className="ml-1 text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                    {agents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAgentTab("invitations")}
                  className={`h-8 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                    agentTab === "invitations"
                      ? "bg-white text-[#9A8B7A] shadow-xs"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  <Mail size={13} />
                  Invitations
                  <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">
                    {invitations.length}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                    Demo
                  </span>
                </button>
              </div>

              {/* Tab 1: Active Agents Table */}
              {agentTab === "agents" && (
                <div className="flex-1 border border-[#e5ddd5]/60 rounded-xl bg-white min-h-[250px] overflow-hidden flex flex-col shadow-inner">
                  {agents.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                      <Users className="text-slate-300 size-8 mb-2" />
                      <span className="text-xs text-slate-400 font-bold">No Active Agents</span>
                      <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                        Invite agents to complete account setup and access the agency workspace.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#FAF8F5] border-b border-[#e5ddd5]">
                            <th className="w-[35%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="w-[40%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                            <th className="w-[15%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered</th>
                            <th className="w-[10%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-slate-50 transition-colors border-b border-[#e5ddd5]/40 last:border-b-0">
                              <td className="text-xs font-bold text-[#2d2a26] truncate px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/agency/agent/${agent.id}`)}
                                  className="text-[#9A8B7A] hover:text-[#8a6f4d] hover:underline font-bold transition-colors cursor-pointer text-left border-none bg-transparent p-0"
                                  title="View agent profile"
                                >
                                  {agent.name}
                                </button>
                              </td>
                              <td className="text-xs font-semibold text-slate-600 truncate px-4 py-3">
                                {agent.email}
                              </td>
                              <td className="text-xs font-medium text-slate-400 px-4 py-3">
                                {agent.created_date ? new Date(agent.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </td>
                              <td className="text-center px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                  title="Delete Agent Credentials"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Invitations Table (Demo Mode) */}
              {agentTab === "invitations" && (
                <div className="flex-1 border border-[#e5ddd5]/60 rounded-xl bg-white min-h-[250px] overflow-hidden flex flex-col shadow-inner">
                  {invitations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                      <Mail className="text-slate-300 size-8 mb-2" />
                      <span className="text-xs text-slate-400 font-bold">No Agent Invitations</span>
                      <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                        Click &ldquo;+ Add Agent&rdquo; above to invite an agent in Demo Mode.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#FAF8F5] border-b border-[#e5ddd5]">
                            <th className="w-[28%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Name & Location</th>
                            <th className="w-[28%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                            <th className="w-[20%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="w-[12%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                            <th className="w-[12%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitations.map((inv) => {
                            const isPrepared = inv.status === "Invitation Prepared";
                            const isPending = inv.status === "Pending Verification";
                            const isVerified = inv.status === "Verified";
                            const isCancelled = inv.status === "Cancelled";

                            return (
                              <tr key={inv.id} className="hover:bg-slate-50 transition-colors border-b border-[#e5ddd5]/40 last:border-b-0">
                                <td className="text-xs px-4 py-3">
                                  <div className="font-bold text-[#2d2a26]">{inv.name}</div>
                                  {inv.location && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <MapPin size={11} className="shrink-0" />
                                      <span>{inv.location}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="text-xs font-semibold text-slate-600 px-4 py-3">
                                  <div>{inv.email}</div>
                                  {inv.phone && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Phone size={11} className="shrink-0" />
                                      <span>{inv.phone}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                        isPrepared
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : isPending
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : isVerified
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : isCancelled
                                          ? "bg-slate-100 text-slate-500 border-slate-200"
                                          : "bg-slate-50 text-slate-600 border-slate-200"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {inv.status}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                      Demo Mode
                                    </span>
                                  </div>
                                </td>
                                <td className="text-xs font-medium text-slate-400 px-4 py-3">
                                  {inv.created_at ? new Date(inv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </td>
                                <td className="text-center px-4 py-3">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openInvitationEmailModal(inv)}
                                      className="px-2.5 py-1 text-[11px] font-bold bg-[#9A8B7A]/15 hover:bg-[#9A8B7A]/25 text-[#9A8B7A] rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                                      title="Review and send invitation in Outlook"
                                    >
                                      <Send size={11} />
                                      Review
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelInvitation(inv.id, inv.name)}
                                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                      title="Cancel Invitation"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ==================== EDIT PROFILE DETAILS MODAL ==================== */}
      {isEditProfileModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-[#e5ddd5] shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#e5ddd5] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center font-bold">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2a26]">Edit Profile Details</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Update Agency Information</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-slate-500 hover:text-[#2d2a26] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="p-6 space-y-4 text-left">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.address}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                    placeholder="Street address"
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editProfileForm.city}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, city: e.target.value })}
                      className="w-full h-10 px-3 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editProfileForm.state}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })}
                      className="w-full h-10 px-3 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={editProfileForm.zip}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, zip: e.target.value })}
                      className="w-full h-10 px-3 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5ddd5] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="h-9 px-4 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="h-9 px-5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all border-none"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================== ADD NEW AGENT DIALOG ==================== */}
      {isAddAgentModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-[#e5ddd5] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#e5ddd5] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center font-bold">
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#2d2a26]">Invite New Agent</span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Demo Mode
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAgentModalOpen(false)}
                  className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-slate-500 hover:text-[#2d2a26] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateAgentSubmit} className="p-6 space-y-4 text-left">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                  <Info size={15} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-bold">Agent Invitation Workflow (Phase 1): </span>
                    Enter the agent&apos;s details to validate and prepare their invitation email. An editable modal will open allowing you to review the message and open it in Outlook.
                  </div>
                </div>

                {agentFormError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{agentFormError}</span>
                  </div>
                )}

                {agentFormSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{agentFormSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addAgentForm.name}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Business Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addAgentForm.email}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    placeholder="e.g. jane.doe@agencyname.com"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    The agent will receive their verification link at this address.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={addAgentForm.phone}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, phone: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                    placeholder="e.g. (555) 019-2834"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={addAgentForm.city}
                      onChange={(e) => setAddAgentForm({ ...addAgentForm, city: e.target.value })}
                      className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                      placeholder="e.g. Dallas"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={addAgentForm.state}
                      onChange={(e) => setAddAgentForm({ ...addAgentForm, state: e.target.value })}
                      className="w-full h-10 px-3.5 border border-[#e5ddd5] rounded-xl text-xs bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] transition-colors"
                      placeholder="e.g. TX"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5ddd5] flex justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={agentFormLoading}
                    onClick={() => setIsAddAgentModalOpen(false)}
                    className="h-9 px-4 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={agentFormLoading}
                    className="h-9 px-5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none"
                  >
                    {agentFormLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={13} />
                        <span>Prepare Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================== INVITATION EMAIL MODAL (DEMO MODE) ==================== */}
      {isInvitationEmailModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-[#e5ddd5] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#e5ddd5] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#9A8B7A]/15 text-[#9A8B7A] flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#2d2a26]">Review Invitation Email</span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Demo Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Edit the email content below, then open in Outlook to review and send.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInvitationEmailModalOpen(false)}
                  className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-slate-500 hover:text-[#2d2a26] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto text-left">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                  <Info size={16} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-bold">How Outlook Demo Mode Works: </span>
                    Clicking <span className="font-semibold">&ldquo;Open in Outlook&rdquo;</span> will launch your Outlook Web compose window with recipient, subject, and invitation body pre-filled. You must review and click <span className="font-semibold">Send</span> inside Outlook.
                  </div>
                </div>

                {outlookNoticeShown && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                    <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Outlook compose window opened! </span>
                      The invitation status is now marked as <span className="font-semibold">Pending Verification (Demo Mode)</span>.
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        To (Agent Business Email)
                      </label>
                      <input
                        type="email"
                        value={invitationEmailRecipient}
                        onChange={(e) => setInvitationEmailRecipient(e.target.value)}
                        className="w-full mt-1 h-8 px-2.5 bg-white border border-[#e5ddd5] rounded-lg text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        From (Agency Administrator)
                      </label>
                      <div className="w-full mt-1 h-8 px-2.5 bg-[#FAF8F5] border border-[#e5ddd5] rounded-lg text-xs font-semibold text-slate-500 flex items-center">
                        {profile?.email || "office@capco.com"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={invitationEmailSubject}
                      onChange={(e) => setInvitationEmailSubject(e.target.value)}
                      className="w-full mt-1 h-8 px-2.5 bg-white border border-[#e5ddd5] rounded-lg text-xs font-semibold text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Invitation Message Body
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-lg border border-[#e5ddd5]">
                      <button
                        type="button"
                        onClick={() => setEmailModalViewMode("preview")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer border-none ${
                          emailModalViewMode === "preview"
                            ? "bg-white text-[#9A8B7A] shadow-xs"
                            : "text-slate-500 bg-transparent"
                        }`}
                      >
                        HTML Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailModalViewMode("text")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer border-none ${
                          emailModalViewMode === "text"
                            ? "bg-white text-[#9A8B7A] shadow-xs"
                            : "text-slate-500 bg-transparent"
                        }`}
                      >
                        Plain Text
                      </button>
                    </div>
                  </div>

                  {emailModalViewMode === "preview" ? (
                    <div className="border border-[#e5ddd5] rounded-xl p-4 bg-white max-h-60 overflow-y-auto space-y-3">
                      <div className="text-center pb-2 border-b border-[#e5ddd5]/60">
                        <span className="font-extrabold text-sm text-[#2d2a26]">Sterling AMS</span>
                        <p className="text-[10px] text-[#9A8B7A] font-bold">Insurance Agency Management Platform</p>
                      </div>
                      <p className="text-xs text-[#2d2a26]">Hello <strong>{currentInvitation?.name || "Agent"}</strong>,</p>
                      <p className="text-xs text-slate-600">
                        <strong>{profile?.agency_name || profile?.name}</strong> has invited you to join Sterling AMS.
                      </p>
                      <div className="bg-[#FAF8F5] border border-[#e5ddd5] rounded-xl p-3 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A8B7A]">Your Verification Code</div>
                        <div className="text-2xl font-mono font-black text-[#9A8B7A] tracking-widest mt-1">
                          {currentInvitation?.code || "849201"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      rows={8}
                      value={invitationEmailBody}
                      onChange={(e) => setInvitationEmailBody(e.target.value)}
                      className="w-full p-3 bg-white border border-[#e5ddd5] rounded-xl text-xs font-mono text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A]"
                    />
                  )}
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-[#e5ddd5] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyHtmlEmail}
                  className="h-8.5 px-3 bg-white hover:bg-[#FAF8F5] border border-[#e5ddd5] text-xs font-bold text-[#2d2a26] rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {emailCopiedFeedback ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{emailCopiedFeedback ? "Copied HTML!" : "Copy Formatted Email"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInvitationEmailModalOpen(false)}
                    className="h-8.5 px-4 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenInOutlook}
                    className="h-8.5 px-4.5 bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer border-none"
                  >
                    <ExternalLink size={13} />
                    <span>Open in Outlook Web</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
