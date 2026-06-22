/* eslint-disable */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../components/Modal";
import Sidebar from "../../../components/Sidebar";
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
  ChevronDown
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
    } else {
      setUserRole(role || "agent");
      fetchCustomers();
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
      const confirmDelete = window.confirm(
        `AMS360 - Delete Record\n\nAre you sure you want to delete the selected customer(s)?\n- ${selectedNames}`
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
          alert("Error deleting customer: " + error);
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
    a.setAttribute("download", `ams360_customers_${new Date().toISOString().split('T')[0]}.csv`);
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
      alert("Error creating customer: " + error);
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
      alert("Error updating customer: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-bg-base min-h-screen text-text-main font-sans select-none h-screen relative">

      {/* Modern Top Header (DashboardHeader) */}
      <Header onToggleDrawer={() => setDrawerOpen(true)} />
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
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Right Workspace Frame */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg-base overflow-hidden">

          {/* Premium Page Title Bar */}
          <div className="px-6 pt-2 pb-2 flex items-center justify-between shrink-0 select-none">
            <h1 className="text-lg font-bold text-text-main">Customer Center</h1>
          </div>

          {/* Premium Summary Cards Row */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-2 shrink-0">
            <SummaryCard title="Total Customers" value={customers.length} icon={Users} />
            <SummaryCard title="Active Folders" value={customers.filter(c => c.status === "Active").length} icon={FolderOpen} iconColor="text-success" iconBg="bg-success/10" />
            <SummaryCard title="Commercial Accounts" value={customers.filter(c => c.type === "Commercial").length} icon={Briefcase} iconColor="text-primary" iconBg="bg-primary/10" />
            <SummaryCard title="Personal Policies" value={customers.filter(c => c.type === "Personal").length} icon={User} iconColor="text-warning" iconBg="bg-warning/10" />
          </div> */}

          {/* Search, Toolbar, and Table Wrapper */}
          <div className="flex-1 px-6 pb-6 pt-0 overflow-y-auto space-y-2 min-h-0">

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

    </div>
  );
}
