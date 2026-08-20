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
  AlertCircle
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
    password: ""
  });
  const [agentFormLoading, setAgentFormLoading] = useState(false);
  const [agentFormError, setAgentFormError] = useState("");
  const [agentFormSuccess, setAgentFormSuccess] = useState("");


  // Fetch customers from FastAPI
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

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

      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();

      // Map API fields (snake_case) to Frontend fields (camelCase)
      const mappedData = data.map((c: any) => ({
        ...c,
        matchCode: c.match_code,
        createdDate: c.created_date,
        primaryExec: c.primary_exec
      }));

      setCustomers(mappedData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
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
    return customers.filter((_, index) => selectedRowIds[index]);
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
          return customer.name.toLowerCase().includes(query);
        case "Email":
          return customer.email ? customer.email.toLowerCase().includes(query) : false;
        case "Policy #":
        case "Account #":
        case "Claim #":
          return customer.matchCode.toLowerCase().includes(query); // Mocking these to matchCode for now
        case "More":
        default:
          return (
            customer.name.toLowerCase().includes(query) ||
            customer.matchCode.toLowerCase().includes(query) ||
            customer.phone.toLowerCase().includes(query) ||
            customer.city.toLowerCase().includes(query) ||
            customer.address.toLowerCase().includes(query) ||
            customer.zip.toLowerCase().includes(query) ||
            customer.primaryExec.toLowerCase().includes(query)
          );
      }
    });
  }, [customers, filterState]);

  // Toolbar Handlers
  const handleNewCustomerClick = () => {
    router.push("/agency/new-customer");
  };

  const handleEditClick = () => {
    if (selectedCustomers.length === 1) {
      setFormCustomer({ ...selectedCustomers[0] });
      setIsEditModalOpen(true);
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
        try {
          for (const cust of selectedCustomers) {
            const res = await fetch(`${API_BASE_URL}/api/customers/${cust.id}`, {
              method: 'DELETE',
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            });
            if (!res.ok) throw new Error(`Failed to delete ${cust.name}`);
          }
          await fetchCustomers();
          setSelectedRowIds({});
        } catch (error) {
          showToast("Error deleting customer: " + error, "error");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleRefresh = () => {
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

  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentFormLoading(true);
    setAgentFormError("");
    setAgentFormSuccess("");

    if (!addAgentForm.name || !addAgentForm.email || !addAgentForm.password) {
      setAgentFormError("Agent Name, Email, and Password are required.");
      setAgentFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(addAgentForm)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create agent");
      }

      setAgentFormSuccess("Agent created successfully!");
      setAddAgentForm({ name: "", email: "", phone: "", password: "" });
      fetchAgents();
      // Auto close modal after a short delay
      setTimeout(() => {
        setIsAddAgentModalOpen(false);
        setAgentFormSuccess("");
      }, 1000);
    } catch (error: any) {
      setAgentFormError(error.message || "Failed to create agent");
    } finally {
      setAgentFormLoading(false);
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
                  <h3 className="text-sm font-bold text-text-main">Agency Agents</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manage your agents ({agents.length})</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddAgentForm({ name: "", email: "", phone: "", password: "" });
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

            {/* Agents Table Wrapper */}
            <div className="flex-1 border border-border-main/60 rounded-xl bg-white min-h-[250px] overflow-hidden flex flex-col shadow-inner">
              {agents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                  <Users className="text-slate-300 size-8 mb-2" />
                  <span className="text-xs text-slate-400 font-bold">No Agents Registered</span>
                  <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                    Add agents to let employees log in using auto-derived `@{domain}` emails.
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
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-bg-base min-h-screen text-text-main font-sans select-none h-screen relative">

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

      {/* Sleek Modern Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-[9999] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white px-8 py-6 rounded-2xl border border-border-main shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Accessing Database...</span>
          </div>
        </div>
      )}

      {/* Clean Premium Workspace Header Sub-band */}
      {/* <div className="bg-white border-b border-border-main h-10 flex items-center px-6 shrink-0 select-none">
        <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Active Workspace / Customer Center</span>
      </div> */}

      {/* 2. Main Area Split (Sidebar + Right Workspace) */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={userRole} />

        {/* Right Workspace Frame */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg-base overflow-hidden">

          {/* Premium Page Title Bar */}
          <div className="px-3 sm:px-6 pt-2 pb-2 flex items-center justify-between shrink-0 select-none">
            <h1 className="text-lg font-bold text-text-main">
              {currentTab === "Agent Control" && userRole === "agency" ? "Agency Profile & Agent Control" : "Customer Center"}
            </h1>
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 px-3 sm:px-6 pb-6 pt-0 overflow-y-auto space-y-2 min-h-0">
            {currentTab === "Agent Control" && userRole === "agency" ? (
              renderAgentControlView()
            ) : (
              <>
                {/* Searchbar Component */}
                <SearchBar
                  filters={filterState}
                  setFilters={setFilterState}
                  totalCount={filteredCustomers.length}
                />

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

        </main>

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

      {/* ==================== MODERN EDIT CUSTOMER DIALOG ==================== */}
      {isEditModalOpen && (
        <Modal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <span className="card-title">Edit Customer Properties</span>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  X
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditCustomerSubmit} className="p-5 space-y-5 flex-1 overflow-y-auto">
                <div className="space-y-4">

                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Customer Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      value={formCustomer.name}
                      onChange={(e) => setFormCustomer({ ...formCustomer, name: e.target.value })}
                      className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-10 px-5 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer active:scale-98 transition-all"
                  >
                    Save Changes
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
            <div className="bg-white rounded-2xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center">
                <span className="card-title">Add New Agent Credentials</span>
                <button
                  onClick={() => setIsAddAgentModalOpen(false)}
                  className="bg-white hover:bg-secondary text-text-muted hover:text-text-main border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
                >
                  X
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAgentSubmit} className="p-5 space-y-4 text-left">

                {agentFormError && (
                  <div className="bg-danger/5 border border-danger/20 text-danger text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{agentFormError}</span>
                  </div>
                )}

                {agentFormSuccess && (
                  <div className="bg-success/5 border border-success/20 text-success text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{agentFormSuccess}</span>
                  </div>
                )}

                {/* Agent Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Agent Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    value={addAgentForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const derivedEmail = newName.trim() ? `${newName.toLowerCase().trim().replace(/\s+/g, '')}@${agencyProfile?.domain || 'capco.com'}` : "";
                      setAddAgentForm((prev) => ({
                        ...prev,
                        name: newName,
                        email: prev.email && !prev.email.includes('@') ? derivedEmail : prev.email || derivedEmail
                      }));
                    }}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder="e.g. Kapil Sharma"
                  />
                </div>

                {/* Agent Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Agent Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    required
                    value={addAgentForm.email}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder={`e.g. kapil@${agencyProfile?.domain || 'capco.com'}`}
                  />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Contact Number</label>
                  <input
                    type="tel"
                    value={addAgentForm.phone}
                    onChange={(e) => setAddAgentForm({ ...addAgentForm, phone: e.target.value })}
                    className="w-full h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                    placeholder="e.g. (555) 019-2834"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Login Password <span className="text-danger">*</span></label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={addAgentForm.password}
                      onChange={(e) => setAddAgentForm({ ...addAgentForm, password: e.target.value })}
                      className="w-full h-10 pl-10 pr-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={agentFormLoading}
                    onClick={() => setIsAddAgentModalOpen(false)}
                    className="h-10 px-5 border border-border-main bg-white hover:bg-secondary/60 text-text-main font-bold text-xs rounded-xl cursor-pointer active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={agentFormLoading}
                    className="h-10 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none"
                  >
                    {agentFormLoading ? "Creating..." : "Save Agent"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
