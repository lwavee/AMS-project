/* eslint-disable */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../components/Modal";
import Sidebar from "../../../components/Sidebar";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import SearchBar, { AdvancedFilterState, defaultFilterState } from "../../../components/SearchBar";
import CustomerToolbar from "../../../components/CustomerToolbar";
import CustomerTable from "../../../components/CustomerTable";
import Header from "../../../components/Header";
import RightDrawer from "../../../components/RightDrawer";
import { Customer } from "../../../data/customers";
import { RowSelectionState } from "@tanstack/react-table";
import {
  Users,
  X,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FolderOpen,
  Loader2,
  Briefcase,
  ChevronDown,
  Shield,
  Trash2,
  Plus,
  Lock,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  Send,
  Info
} from "lucide-react";

import { API_BASE_URL } from "../../../lib/config";
import SummaryCard from "../../../components/SummaryCard";

export default function Page() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filtering State
  const [filterState, setFilterState] = useState<AdvancedFilterState>(defaultFilterState);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  // Right drawer state for quick actions
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("agent");

  // Agency Profile & Agent Control Dashboard State
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });
  const [addAgentForm, setAddAgentForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: ""
  });
  const [agentFormLoading, setAgentFormLoading] = useState(false);
  const [agentFormError, setAgentFormError] = useState("");
  const [agentFormSuccess, setAgentFormSuccess] = useState("");

  // Agent Invitations & Workflow State (Demo Mode)
  const [invitations, setInvitations] = useState<any[]>([]);
  const [agentTab, setAgentTab] = useState<"agents" | "invitations">("agents");
  const [isInvitationEmailModalOpen, setIsInvitationEmailModalOpen] = useState(false);
  const [currentInvitation, setCurrentInvitation] = useState<any>(null);
  const [invitationEmailRecipient, setInvitationEmailRecipient] = useState("");
  const [invitationEmailSubject, setInvitationEmailSubject] = useState("You're invited to join Sterling AMS");
  const [invitationEmailBody, setInvitationEmailBody] = useState("");
  const [outlookNoticeShown, setOutlookNoticeShown] = useState(false);
  const [emailCopiedFeedback, setEmailCopiedFeedback] = useState(false);
  const [emailModalViewMode, setEmailModalViewMode] = useState<"preview" | "text">("preview");


  // Fetch customers from FastAPI with retry resilience
  // Fetch customers from FastAPI with instant cache hydration & background revalidation
  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Instant Hydration: display cached data immediately if available (0ms loading time)
    try {
      const cached = sessionStorage.getItem("cached_customers");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomers(parsed);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
      } else {
        setIsLoading(true);
      }
    } catch {
      setIsLoading(true);
    }

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(API_BASE_URL + "/api/customers/", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Map API fields (snake_case) to Frontend fields (camelCase)
        const mappedData = data.map((c: any) => ({
          ...c,
          matchCode: c.match_code,
          createdDate: c.created_date,
          primaryExec: c.primary_exec,
          firmName: c.firm_name || c.firmName,
        }));

        setCustomers(mappedData);
        try {
          sessionStorage.setItem("cached_customers", JSON.stringify(mappedData));
        } catch { }
        setIsLoading(false);
        return;
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} fetching customers failed:`, error);
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 1200));
        }
      }
    }
    setIsLoading(false);
  };

  const fetchAgencyProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch agency profile");
      const data = await res.json();
      setAgencyProfile(data);
      setEditProfileForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || ""
      });
    } catch (error) {
      console.error("Error fetching agency profile:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      const data = await res.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
    } else {
      setUserRole(role || "agent");
      fetchCustomers();
      if (role === "agency") {
        fetchAgencyProfile();
        fetchAgents();
        fetchInvitations();

        // Check if tab parameter is specified in the URL
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam) {
          setCurrentTab(tabParam);
        }
      }
    }
  }, []);

  // Temp form states
  const [formCustomer, setFormCustomer] = useState<Partial<Customer>>({
    name: "",
    matchCode: "",
    type: "Commercial",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    status: "Active",
    primaryExec: ""
  });

  // Detailed view state
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Helper to get selected customer objects
  const selectedCustomers = useMemo(() => {
    return customers.filter((c, index) => selectedRowIds[String(c.id)] || selectedRowIds[index]);
  }, [selectedRowIds, customers]);

  // Handle Search & Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 1. Filter by Status
      if (filterState.statusFilter !== "All" && customer.status !== filterState.statusFilter) {
        return false;
      }

      // 2. Filter by Search Query
      if (!filterState.searchQuery.trim()) {
        return true;
      }

      const query = filterState.searchQuery.toLowerCase();

      switch (filterState.searchBy) {
        case "Name":
          return (
            (customer.name && customer.name.toLowerCase().includes(query)) ||
            (customer.firmName && customer.firmName.toLowerCase().includes(query)) ||
            (Boolean((customer as any).firm_name && (customer as any).firm_name.toLowerCase().includes(query)))
          );
        case "Email":
          return customer.email ? customer.email.toLowerCase().includes(query) : false;
        case "Policy #":
        case "Account #":
        case "Claim #":
          return customer.matchCode.toLowerCase().includes(query); // Mocking these to matchCode for now
        case "More":
        default:
          return (
            (customer.name && customer.name.toLowerCase().includes(query)) ||
            (customer.firmName && customer.firmName.toLowerCase().includes(query)) ||
            (Boolean((customer as any).firm_name && (customer as any).firm_name.toLowerCase().includes(query))) ||
            (customer.matchCode && customer.matchCode.toLowerCase().includes(query)) ||
            (customer.phone && customer.phone.toLowerCase().includes(query)) ||
            (customer.city && customer.city.toLowerCase().includes(query)) ||
            (customer.address && customer.address.toLowerCase().includes(query)) ||
            (customer.zip && customer.zip.toLowerCase().includes(query)) ||
            (customer.primaryExec && customer.primaryExec.toLowerCase().includes(query))
          );
      }
    });
  }, [customers, filterState]);

  // Toolbar Handlers
  const handleNewCustomerClick = () => {
    window.open("/agency/new-customer", "_blank");
  };

  const handleEditClick = () => {
    if (selectedCustomers.length === 1) {
      router.push(`/agency/new-customer?edit=${selectedCustomers[0].id}`);
    }
  };

  const handleOpenClick = () => {
    if (selectedCustomers.length === 1) {
      router.push(`/agency/customer/${selectedCustomers[0].id}`);
    }
  };

  const handleDeleteClick = async () => {
    if (selectedCustomers.length > 0) {
      const selectedNames = selectedCustomers.map(c => c.name).join(", ");
      const confirmDelete = await confirmDialog(
        `Are you sure you want to delete the selected customer(s)?\n${selectedNames}`,
        "Delete Record"
      );
      if (confirmDelete) {
        setIsLoading(true);
        const deletedIds = new Set<string | number>();
        try {
          for (const cust of selectedCustomers) {
            const res = await fetch(`${API_BASE_URL}/api/customers/${cust.id}`, {
              method: 'DELETE',
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            });
            // If already deleted / not found (404), treat as gone
            if (!res.ok && res.status !== 404) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.detail || `Failed to delete ${cust.name}`);
            }
            deletedIds.add(cust.id);
          }
          // Optimistically remove from state immediately
          setCustomers(prev => prev.filter(c => !deletedIds.has(c.id)));
          showToast(`Successfully deleted ${selectedCustomers.length} customer(s).`, "success");
        } catch (error: any) {
          showToast("Error deleting customer: " + (error?.message || error), "error");
        } finally {
          try {
            sessionStorage.removeItem("cached_customers");
          } catch {}
          await fetchCustomers();
          setSelectedRowIds({});
          setIsLoading(false);
        }
      }
    }
  };

  const handleRefresh = () => {
    try {
      sessionStorage.removeItem("cached_customers");
    } catch {}
    fetchCustomers();
    setSelectedRowIds({});
    setFilterState(defaultFilterState);
  };

  const handleExport = () => {
    const headers = "ID,Match Code,Name,Type,Address,City,State,Zip,Phone,Email,Status,Primary Exec,Created Date\n";
    const rows = customers.map(c =>
      `"${c.id}","${c.matchCode}","${c.name}","${c.type}","${c.address}","${c.city}","${c.state}","${c.zip}","${c.phone}","${c.email}","${c.status}","${c.primaryExec}","${c.createdDate}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `sterling_ams_customers_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // Form Submit Handlers linking to Backend
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name: formCustomer.name || "Unnamed Customer",
        match_code: formCustomer.matchCode || `${formCustomer.name?.substring(0, 6).toUpperCase() || "CUST"}`,
        type: formCustomer.type || "Commercial",
        address: formCustomer.address || "",
        city: formCustomer.city || "",
        state: formCustomer.state || "",
        zip: formCustomer.zip || "",
        phone: formCustomer.phone || "",
        email: formCustomer.email || undefined,
        status: formCustomer.status || "Active",
        primary_exec: formCustomer.primaryExec || "Sarah Jenkins"
      };

      console.log("FRONTEND PAYLOAD", payload);

      const response = await fetch(API_BASE_URL + "/api/customers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create customer");

      await fetchCustomers();
      setIsNewModalOpen(false);
      setSelectedRowIds({});
    } catch (error) {
      showToast("Error creating customer: " + error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer.id) return;

    setIsLoading(true);
    try {
      const payload = {
        name: formCustomer.name,
        match_code: formCustomer.matchCode,
        type: formCustomer.type,
        address: formCustomer.address,
        city: formCustomer.city,
        state: formCustomer.state,
        zip: formCustomer.zip,
        phone: formCustomer.phone,
        email: formCustomer.email,
        status: formCustomer.status,
        primary_exec: formCustomer.primaryExec
      };

      const response = await fetch(`${API_BASE_URL}/api/customers/${formCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to update customer");

      await fetchCustomers();
      setIsEditModalOpen(false);
      setSelectedRowIds({});
    } catch (error) {
      showToast("Error updating customer: " + error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editProfileForm)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setAgencyProfile(data);
      setIsEditProfileModalOpen(false);
    } catch (error: any) {
      showToast("Error updating profile: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openInvitationEmailModal = (invitation: any) => {
    setCurrentInvitation(invitation);
    const agentName = invitation.name || "Agent";
    const agencyName = invitation.agency_name || agencyProfile?.name || "Our Agency";
    const adminName = invitation.admin_name || agencyProfile?.name || "Agency Administrator";
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
    const agencyName = currentInvitation.agency_name || agencyProfile?.name || "Our Agency";
    const adminName = currentInvitation.admin_name || agencyProfile?.name || "Agency Administrator";
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
      showToast("Formatted email with interactive button copied to clipboard! Paste directly into Outlook.", "success");
      setTimeout(() => setEmailCopiedFeedback(false), 3500);
    } catch {
      await navigator.clipboard.writeText(invitationEmailBody);
      showToast("Email text copied to clipboard!", "success");
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

    // Client-side validations
    if (!name) {
      setAgentFormError("Agent Full Name is required.");
      setAgentFormLoading(false);
      return;
    }
    if (name.length < 2) {
      setAgentFormError("Full Name must be at least 2 characters.");
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
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        setAgentFormError("Phone number must contain between 7 and 15 digits.");
        setAgentFormLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          city: city || null,
          state: state || null,
        })
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

      // Open Invitation Email Modal directly
      openInvitationEmailModal(invitationData);
    } catch (error: any) {
      setAgentFormError(error.message || "Failed to prepare invitation");
    } finally {
      setAgentFormLoading(false);
    }
  };

  const handleOpenInOutlook = async () => {
    if (!currentInvitation) return;

    const to = invitationEmailRecipient.trim();
    const subject = invitationEmailSubject.trim();
    const body = invitationEmailBody.trim();

    // Outlook Web compose deeplink with correctly URL-encoded parameters
    const outlookWebUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(outlookWebUrl, "_blank", "noopener,noreferrer");

    // Transition invitation status to 'Pending Verification' (Demo Mode)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations/${currentInvitation.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Pending Verification" })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentInvitation(updated);
        fetchInvitations();
      }
    } catch (err) {
      console.error("Failed to update status to Pending Verification:", err);
    }

    setOutlookNoticeShown(true);
    showToast("Outlook compose opened in a new tab. Review and send the email from Outlook.", "info");
  };

  const handleOpenInDesktopMail = () => {
    const to = invitationEmailRecipient.trim();
    const subject = invitationEmailSubject.trim();
    const body = invitationEmailBody.trim();
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyEmailContent = async () => {
    const fullText = `To: ${invitationEmailRecipient}\nSubject: ${invitationEmailSubject}\n\n${invitationEmailBody}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setEmailCopiedFeedback(true);
      showToast("Email content copied to clipboard!", "success");
      setTimeout(() => setEmailCopiedFeedback(false), 3000);
    } catch {
      showToast("Could not copy automatically. Please select the text manually.", "error");
    }
  };

  const handleCancelInvitation = async (invitationId: number, agentName: string) => {
    const confirm = await confirmDialog(
      `Are you sure you want to cancel the invitation for "${agentName}"?`,
      "Cancel Invitation"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations/${invitationId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
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
      "Delete Agent"
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents/${agentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete agent");
      }
      fetchAgents();
    } catch (error: any) {
      showToast("Error deleting agent: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgentControlView = () => {
    const domain = agencyProfile?.domain || "capco.com";
    return (
      <div className="space-y-6 animate-in fade-in duration-200">

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Agency Profile details */}
          <div className="bg-white border border-border-main rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-3 border-b border-border-main/60 pb-4 mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Agency Information</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure your profile</p>
                </div>
              </div>

              {agencyProfile ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agency Name</label>
                    <p className="text-sm font-bold text-text-main mt-0.5">{agencyProfile.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outlook Email</label>
                    <p className="text-sm font-semibold text-text-main mt-0.5">{agencyProfile.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Domain</label>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 mt-1">
                        {agencyProfile.domain}
                      </span>
                    </div>
                  </div>
                  {agencyProfile.phone && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                      <p className="text-xs font-medium text-text-main mt-0.5">{agencyProfile.phone}</p>
                    </div>
                  )}
                  {(agencyProfile.address || agencyProfile.city) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                      <p className="text-xs font-medium text-text-main mt-0.5">
                        {agencyProfile.address}
                        {agencyProfile.city && `, ${agencyProfile.city}`}
                        {agencyProfile.state && ` ${agencyProfile.state}`}
                        {agencyProfile.zip && ` ${agencyProfile.zip}`}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="animate-spin text-primary size-5" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Loading profile...</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (agencyProfile) {
                  setEditProfileForm({
                    name: agencyProfile.name || "",
                    phone: agencyProfile.phone || "",
                    address: agencyProfile.address || "",
                    city: agencyProfile.city || "",
                    state: agencyProfile.state || "",
                    zip: agencyProfile.zip || ""
                  });
                  setIsEditProfileModalOpen(true);
                }
              }}
              className="w-full h-10 mt-6 border border-border-main bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
            >
              Edit Profile Details
            </button>
          </div>

          {/* Right Column: Agents List */}
          <div className="lg:col-span-2 bg-white border border-border-main rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-border-main/60 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Agency Team</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {agents.length} Active {agents.length === 1 ? 'Agent' : 'Agents'} • {invitations.length} Pending {invitations.length === 1 ? 'Invitation' : 'Invitations'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddAgentForm({ name: "", email: "", phone: "", city: "", state: "" });
                  setAgentFormError("");
                  setAgentFormSuccess("");
                  setIsAddAgentModalOpen(true);
                }}
                className="h-9 px-4 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/10 hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                <Plus size={14} />
                Add Agent
              </button>
            </div>

            {/* Segmented Sub-Tabs */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100/80 p-1 rounded-xl w-fit border border-border-main/50">
              <button
                onClick={() => setAgentTab("agents")}
                className={`h-8 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                  agentTab === "agents"
                    ? "bg-white text-primary shadow-xs"
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
                onClick={() => setAgentTab("invitations")}
                className={`h-8 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                  agentTab === "invitations"
                    ? "bg-white text-primary shadow-xs"
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
              <div className="flex-1 border border-border-main/60 rounded-xl bg-white min-h-[250px] overflow-hidden flex flex-col shadow-inner">
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
                    <table className="premium-table w-full text-left">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border-main">
                          <th className="table-header w-[35%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="table-header w-[40%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                          <th className="table-header w-[15%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered</th>
                          <th className="table-header w-[10%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent.id} className="hover:bg-slate-50 transition-colors border-b border-border-main/40 last:border-b-0">
                            <td className="table-body text-xs font-bold text-text-main truncate px-4 py-3">
                              <button
                                onClick={() => router.push(`/agency/agent/${agent.id}`)}
                                className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors cursor-pointer text-left"
                                title="View agent profile"
                              >
                                {agent.name}
                              </button>
                            </td>
                            <td className="table-body text-xs font-semibold text-slate-600 truncate px-4 py-3">
                              {agent.email}
                            </td>
                            <td className="table-body text-xs font-medium text-slate-400 px-4 py-3">
                              {agent.created_date ? new Date(agent.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td className="table-body text-center px-4 py-3">
                              <button
                                onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                className="text-slate-400 hover:text-danger hover:bg-danger/5 p-1.5 rounded-lg transition-colors cursor-pointer"
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
              <div className="flex-1 border border-border-main/60 rounded-xl bg-white min-h-[250px] overflow-hidden flex flex-col shadow-inner">
                {invitations.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                    <Mail className="text-slate-300 size-8 mb-2" />
                    <span className="text-xs text-slate-400 font-bold">No Agent Invitations</span>
                    <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                      Click &ldquo;Add Agent&rdquo; above to invite an agent in Demo Mode.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="premium-table w-full text-left">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border-main">
                          <th className="table-header w-[28%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Name & Location</th>
                          <th className="table-header w-[28%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                          <th className="table-header w-[20%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="table-header w-[12%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                          <th className="table-header w-[12%] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((inv) => {
                          const isPrepared = inv.status === "Invitation Prepared";
                          const isPending = inv.status === "Pending Verification";
                          const isVerified = inv.status === "Verified";
                          const isCancelled = inv.status === "Cancelled";

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors border-b border-border-main/40 last:border-b-0">
                              <td className="table-body text-xs px-4 py-3">
                                <div className="font-bold text-text-main">{inv.name}</div>
                                {inv.location && (
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} className="shrink-0" />
                                    <span>{inv.location}</span>
                                  </div>
                                )}
                              </td>
                              <td className="table-body text-xs font-semibold text-slate-600 px-4 py-3">
                                <div>{inv.email}</div>
                                {inv.phone && (
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Phone size={11} className="shrink-0" />
                                    <span>{inv.phone}</span>
                                  </div>
                                )}
                              </td>
                              <td className="table-body px-4 py-3">
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
                              <td className="table-body text-xs font-medium text-slate-400 px-4 py-3">
                                {inv.created_at ? new Date(inv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </td>
                              <td className="table-body text-center px-4 py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openInvitationEmailModal(inv)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                                    title="Review and send invitation in Outlook"
                                  >
                                    <Send size={11} />
                                    Review
                                  </button>
                                  <button
                                    onClick={() => handleCancelInvitation(inv.id, inv.name)}
                                    className="text-slate-400 hover:text-danger hover:bg-danger/5 p-1.5 rounded-lg transition-colors cursor-pointer border-none"
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
    );
  };

  return (
    <div className="flex flex-col bg-[#f5f1eb] min-h-screen text-text-main font-sans select-none relative">

      {/* Modern Top Header (DashboardHeader) */}
      <Header
        onToggleDrawer={() => setDrawerOpen(true)}
        onProfileClick={() => {
          if (userRole === "agency") {
            router.push("/agency/agency-profile");
          }
        }}
      />
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Sleek Modern Loading Overlay (only blocks if no cached customers yet) */}
      {isLoading && customers.length === 0 && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-[9999] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white px-8 py-6 rounded-2xl border border-border-main shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Accessing Database...</span>
          </div>
        </div>
      )}

      {/* Main Workspace Card Container (Matching Second Photo) */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 pb-12 pt-2 flex flex-col">
        <div className="bg-white rounded-3xl border border-[#e5ddd5] shadow-2xs flex flex-col flex-1 p-5 sm:p-7 space-y-4">
          {currentTab === "Agent Control" && userRole === "agency" ? (
            renderAgentControlView()
          ) : (
            <>
              {/* Header Row: Customers Title & Total Badge (Matching Second Photo) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-[#FDF6F0] border border-[#F5E6D8] text-[#9A8B7A] flex items-center justify-center shrink-0 shadow-2xs">
                    <Users size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-[#1f1d1a] tracking-tight">
                      Customers
                    </h1>
                    <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                      Manage your customers and grow your business
                    </p>
                  </div>
                </div>

                {/* Total Customers Indicator Badge on Top Right */}
                <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#e5ddd5] px-3.5 py-2 rounded-2xl shadow-2xs shrink-0 self-start sm:self-auto">
                  <div className="h-8 w-8 rounded-xl bg-[#F5EDE5] text-[#9A8B7A] flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1f1d1a]">
                      {customers.length || 18} Total Customers
                    </span>
                    <span className="text-[10px] text-[#8c827a] font-medium">
                      Showing 1–{Math.min(10, customers.length || 18)} of {customers.length || 18}
                    </span>
                  </div>
                </div>
              </div>

              {/* Searchbar & Filters Component */}
              <SearchBar
                filters={filterState}
                setFilters={setFilterState}
                totalCount={filteredCustomers.length}
              />

              {/* 4 KPI Summary Stat Cards Matching Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Total Customers */}
                <div className="bg-[#FAF8F5] border border-[#e5ddd5] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="h-11 w-11 rounded-xl bg-[#F5EDE5] text-[#9A8B7A] flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#1f1d1a] leading-none">
                      {customers.length || 18}
                    </div>
                    <div className="text-xs font-semibold text-[#6b5e52] mt-1">
                      Total Customers
                    </div>
                  </div>
                </div>

                {/* Active */}
                <div className="bg-[#F0FDF4]/80 border border-[#DCFCE7] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="h-11 w-11 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                    <CheckCircle size={20} className="fill-[#16A34A] text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#1f1d1a] leading-none">
                      {customers.filter((c) => c.status !== "Inactive").length || 15}
                    </div>
                    <div className="text-xs font-semibold text-[#16A34A] mt-1">
                      Active
                    </div>
                  </div>
                </div>

                {/* Inactive */}
                <div className="bg-[#FAF5FF]/90 border border-[#F3E8FF] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="h-11 w-11 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#1f1d1a] leading-none">
                      {customers.filter((c) => c.status === "Inactive").length || 2}
                    </div>
                    <div className="text-xs font-semibold text-[#9333EA] mt-1">
                      Inactive
                    </div>
                  </div>
                </div>

                {/* Cancelled */}
                <div className="bg-[#FEF2F2]/90 border border-[#FEE2E2] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="h-11 w-11 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                    <XCircle size={20} className="fill-[#DC2626] text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#1f1d1a] leading-none">
                      1
                    </div>
                    <div className="text-xs font-semibold text-[#DC2626] mt-1">
                      Cancelled
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar Actions Component */}
              <CustomerToolbar
                selectedCount={selectedCustomers.length}
                onNewCustomer={handleNewCustomerClick}
                onEdit={handleEditClick}
                onOpen={handleOpenClick}
                onDelete={handleDeleteClick}
                onRefresh={handleRefresh}
                onExport={handleExport}
                canDelete={userRole !== "agent"}
              />

              {/* Customers Table Component */}
              <div className="min-h-0 flex-1">
                <CustomerTable
                  data={filteredCustomers}
                  selectedRowIds={selectedRowIds}
                  setSelectedRowIds={setSelectedRowIds}
                  onRowClick={(customer) => { }}
                  onRefresh={handleRefresh}
                  inactiveColor={filterState.inactiveColor}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== MODERN ADD CUSTOMER DIALOG ==================== */}
      {isNewModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <span className="card-title">Add New Customer Folder</span>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  X
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-2 gap-4">

                  {/* Name field */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      value={formCustomer.name}
                      onChange={(e) => setFormCustomer({ ...formCustomer, name: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. Acme Corporation"
                    />
                  </div>

                  {/* Match code field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Match Code</label>
                    <input
                      type="text"
                      value={formCustomer.matchCode}
                      onChange={(e) => setFormCustomer({ ...formCustomer, matchCode: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. ACMECORP"
                    />
                  </div>

                  {/* Executive field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Executive <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      value={formCustomer.primaryExec}
                      onChange={(e) => setFormCustomer({ ...formCustomer, primaryExec: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. John Agent"
                    />
                  </div>

                  {/* Type Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Type</label>
                    <div className="relative">
                      <select
                        value={formCustomer.type}
                        onChange={(e) => setFormCustomer({ ...formCustomer, type: e.target.value as any })}
                        className="w-full h-10 pl-3 pr-8 border border-border-main rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-bold text-text-main transition-all appearance-none cursor-pointer"
                      >
                        <option value="Commercial">Commercial</option>
                        <option value="Personal">Personal</option>
                      </select>
                      <ChevronDown size={14} className="text-text-muted absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Status</label>
                    <div className="relative">
                      <select
                        value={formCustomer.status}
                        onChange={(e) => setFormCustomer({ ...formCustomer, status: e.target.value as any })}
                        className="w-full h-10 pl-3 pr-8 border border-border-main rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-bold text-text-main transition-all appearance-none cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown size={14} className="text-text-muted absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="h-10 px-5 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer active:scale-98 transition-all"
                  >
                    Save Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}


      {/* ==================== MODERN CUSTOMER DETAILS DIALOG ==================== */}
      {isOpenModalOpen && activeCustomer && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <span className="card-title">Customer Profile Details</span>
                <button
                  onClick={() => setIsOpenModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  X
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div className="bg-secondary/35 border border-border-main rounded-2xl p-4 space-y-3.5 shadow-inner">

                  {/* Grid fields */}
                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-extrabold">Name</span>
                    <span className="text-sm font-extrabold text-text-main">{activeCustomer.name}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-extrabold">Match Code</span>
                    <span className="text-sm font-mono font-bold text-text-main bg-white px-2 py-0.5 rounded-lg border border-border-main">{activeCustomer.matchCode}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-extrabold">Account Type</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCustomer.type === "Commercial" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"
                      }`}>{activeCustomer.type}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-extrabold">Folder Status</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCustomer.status === "Active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}>{activeCustomer.status}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-extrabold">Account Exec</span>
                    <span className="text-sm font-semibold text-text-main">{activeCustomer.primaryExec}</span>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsOpenModalOpen(false)}
                    className="h-10 px-6 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all shadow-sm"
                  >
                    Close Profile
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Modal>
      )}
      {/* ==================== EDIT AGENCY PROFILE DIALOG ==================== */}
      {isEditProfileModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <span className="card-title">Edit Agency Profile</span>
                <button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  X
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateProfileSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-2 gap-4 text-left">

                  {/* Agency Name */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Agency Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. 555-0199"
                    />
                  </div>

                  {/* Address */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      value={editProfileForm.address}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={editProfileForm.city}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, city: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* State */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      value={editProfileForm.state}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* Zip */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">ZIP Code</label>
                    <input
                      type="text"
                      value={editProfileForm.zip}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, zip: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="h-10 px-5 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer active:scale-98 transition-all border-none text-center"
                  >
                    Save Profile
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
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="card-title">Invite New Agent</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Demo Mode
                  </span>
                </div>
                <button
                  onClick={() => {
                    const isDirty = Boolean(addAgentForm.name || addAgentForm.email || addAgentForm.phone || addAgentForm.city || addAgentForm.state);
                    if (isDirty && !window.confirm("You have unsaved agent details. Are you sure you want to discard them?")) {
                      return;
                    }
                    setIsAddAgentModalOpen(false);
                  }}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAgentSubmit} className="p-5 space-y-4 text-left">

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                  <Info size={15} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-bold">Agent Invitation Workflow (Phase 1): </span>
                    Enter the agent&apos;s details to validate and prepare their invitation email. An editable modal will open allowing you to review the message and open it in Outlook.
                  </div>
                </div>

                {agentFormError && (
                  <div className="bg-danger/5 border border-danger/20 text-danger text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{agentFormError}</span>
                  </div>
                )}

                {agentFormSuccess && (
                  <div className="bg-success/5 border border-success/20 text-success text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{agentFormSuccess}</span>
                  </div>
                )}

                {/* Agent Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addAgentForm.name}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                {/* Agent Business Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                    Business Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addAgentForm.email}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder="e.g. jane.doe@agencyname.com"
                  />
                  <span className="text-[10px] text-slate-400">
                    The agent will receive their verification link at this address.
                  </span>
                </div>

                {/* Contact Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={addAgentForm.phone}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, phone: e.target.value })}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder="e.g. (555) 019-2834"
                  />
                </div>

                {/* Location (City & State) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                      City
                    </label>
                    <input
                      type="text"
                      value={addAgentForm.city}
                      onChange={(e) => setAddAgentForm({ ...addAgentForm, city: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. Dallas"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                      State
                    </label>
                    <input
                      type="text"
                      value={addAgentForm.state}
                      onChange={(e) => setAddAgentForm({ ...addAgentForm, state: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="e.g. TX"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={agentFormLoading}
                    onClick={() => {
                      const isDirty = Boolean(addAgentForm.name || addAgentForm.email || addAgentForm.phone || addAgentForm.city || addAgentForm.state);
                      if (isDirty && !window.confirm("You have unsaved agent details. Are you sure you want to discard them?")) {
                        return;
                      }
                      setIsAddAgentModalOpen(false);
                    }}
                    className="h-10 px-5 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={agentFormLoading}
                    className="h-10 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none"
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
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/50 px-6 py-4 border-b border-border-main flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-sm">Review Invitation Email</span>
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
                  onClick={() => setIsInvitationEmailModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto text-left">

                {/* Demo Mode Notice */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                  <Info size={16} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-bold">How Outlook Demo Mode Works: </span>
                    Clicking <span className="font-semibold">&ldquo;Open in Outlook&rdquo;</span> will launch your Outlook Web compose window with recipient, subject, and invitation body pre-filled. You must review and click <span className="font-semibold">Send</span> inside Outlook. Opening Outlook does not send the email automatically and does not mark the agent as verified.
                  </div>
                </div>

                {outlookNoticeShown && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                    <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Outlook compose window opened! </span>
                      The invitation status is now marked as <span className="font-semibold">Pending Verification (Demo Mode)</span>. Remember to click Send inside Outlook to deliver the message.
                    </div>
                  </div>
                )}

                {/* Email Metadata Grid */}
                <div className="bg-slate-50/80 border border-border-main/70 rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        To (Agent Business Email)
                      </label>
                      <input
                        type="email"
                        value={invitationEmailRecipient}
                        onChange={(e) => setInvitationEmailRecipient(e.target.value)}
                        className="w-full mt-1 h-8 px-2.5 bg-white border border-border-main rounded-lg text-xs font-semibold text-text-main focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        From (Agency Administrator)
                      </label>
                      <div className="mt-1 h-8 px-2.5 bg-white border border-border-main rounded-lg text-xs font-medium text-slate-600 flex items-center truncate">
                        {agencyProfile?.email
                          ? `${agencyProfile.name || 'Agency Admin'} <${agencyProfile.email}>`
                          : (agencyProfile?.name || 'Authorized Agency Administrator')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={invitationEmailSubject}
                      onChange={(e) => setInvitationEmailSubject(e.target.value)}
                      className="w-full mt-1 h-8 px-2.5 bg-white border border-border-main rounded-lg text-xs font-semibold text-text-main focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* View Mode Toggle: Interactive Button Preview vs Plain Text Editor */}
                <div className="flex items-center justify-between border-b border-border-main/70 pb-2">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEmailModalViewMode("preview")}
                      className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        emailModalViewMode === "preview"
                          ? "bg-white text-primary shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Email Preview (with Button)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailModalViewMode("text")}
                      className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        emailModalViewMode === "text"
                          ? "bg-white text-primary shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Plain Text / Compose
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {emailModalViewMode === "preview" ? "Includes styled CTA button and verification code" : "Editable raw text"}
                  </span>
                </div>

                {/* VIEW 1: Interactive Email Button Preview */}
                {emailModalViewMode === "preview" && (
                  <div className="bg-[#FAF8F5] border border-[#e5ddd5] rounded-2xl p-5 space-y-4 shadow-xs">
                    {/* Branded Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd5]/60">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#FDF6F0] border border-[#F5E6D8] text-[#c2a07e] flex items-center justify-center font-bold text-xs">
                          S
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-[#2d2a26]">Sterling AMS</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Agency Onboarding</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Agent Invitation
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-[#2d2a26]">
                      <p>
                        Hello <strong className="text-text-main">{currentInvitation?.name || "Agent"}</strong>,
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        <strong className="text-[#2d2a26]">{currentInvitation?.agency_name || agencyProfile?.name || "Our Agency"}</strong> has invited you to join Sterling AMS as an Insurance Agent.
                      </p>
                    </div>

                    {/* Verification Code Highlight Card */}
                    <div className="bg-white border-2 border-dashed border-[#c2a07e]/40 rounded-xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[#9A8B7A] uppercase tracking-wider block mb-1">
                        Your 6-Digit Verification Code
                      </span>
                      <span className="text-2xl font-black font-mono tracking-[0.25em] text-[#c2a07e] block my-1">
                        {currentInvitation?.code || "849201"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Enter this code on the verification page to verify and set your password
                      </span>
                    </div>

                    {/* Styled Invitation Action Button */}
                    <div className="text-center pt-2">
                      <a
                        href={currentInvitation?.verification_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 h-11 px-7 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-[#c2a07e]/30 transition-all cursor-pointer"
                      >
                        <span>Verify &amp; Set Up Account</span>
                        <ExternalLink size={14} />
                      </a>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        Clicking this button will open the account setup form in your browser.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e5ddd5]/60 text-[11px] text-slate-500 space-y-1">
                      <p>Best regards,</p>
                      <p className="font-bold text-[#2d2a26]">{agencyProfile?.name || "Agency Administrator"}</p>
                    </div>
                  </div>
                )}

                {/* VIEW 2: Plain Text Editor */}
                {emailModalViewMode === "text" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                        Invitation Message Body (Editable)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Editable before opening in Outlook
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={invitationEmailBody}
                      onChange={(e) => setInvitationEmailBody(e.target.value)}
                      className="w-full p-3.5 border border-border-main rounded-xl text-xs font-mono leading-relaxed bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm resize-y"
                    />
                  </div>
                )}

                {/* Verification Link Callout */}
                {currentInvitation?.verification_url && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Direct Verification Link:
                      </span>
                      <span className="font-mono text-[11px] text-primary truncate select-all block mt-0.5">
                        {currentInvitation.verification_url}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">Verification Code:</span>
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                          {currentInvitation.code || "849201"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentInvitation.verification_url);
                        showToast("Verification link copied!", "success");
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-border-main rounded-lg text-[11px] font-bold text-slate-700 transition-colors shrink-0 cursor-pointer self-start sm:self-center"
                    >
                      Copy Link
                    </button>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/80 px-6 py-4 border-t border-border-main flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyHtmlEmail}
                    className="h-9 px-3.5 bg-white hover:bg-slate-100 border border-border-main text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Copy formatted email with styled button to clipboard"
                  >
                    <Copy size={13} />
                    <span>{emailCopiedFeedback ? "Copied!" : "Copy Styled Button"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEmailContent}
                    className="h-9 px-3 bg-white hover:bg-slate-100 border border-border-main text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Copy plain text"
                  >
                    <Copy size={12} />
                    <span className="hidden md:inline">Plain Text</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsInvitationEmailModalOpen(false)}
                    className="h-9 px-4 border border-border-main bg-white hover:bg-secondary text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCopyHtmlEmail();
                      handleOpenInOutlook();
                    }}
                    className="h-9 px-5 bg-[#0078D4] hover:bg-[#006cbd] text-white font-bold text-xs rounded-xl shadow-md shadow-[#0078D4]/25 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none"
                  >
                    <Send size={13} />
                    <span>Open in Outlook</span>
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
