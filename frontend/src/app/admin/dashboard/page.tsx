/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/config";
import Header from "../../../components/Header";
import { 
  Plus, 
  Trash2, 
  X, 
  UserPlus, 
  Users, 
  Building2, 
  Lock, 
  Mail, 
  Shield, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // User Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // New User Form State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("agent");
  const [newName, setNewName] = useState("");
  const [newAgencyId, setNewAgencyId] = useState("");

  // Fetch admin dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "admin") {
      router.push("/agency/dashboard");
      return;
    }

    fetchStats();
  }, [router]);

  // Load users & agencies from API
  const loadUsersAndAgencies = async () => {
    setModalLoading(true);
    setModalError("");
    const token = localStorage.getItem("token");
    try {
      // 1. Fetch Users
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("Failed to load users list");
      const usersData = await usersRes.json();
      setUsers(usersData);

      // 2. Fetch Agencies
      const agenciesRes = await fetch(`${API_BASE_URL}/api/admin/agencies`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!agenciesRes.ok) throw new Error("Failed to load agencies list");
      const agenciesData = await agenciesRes.json();
      setAgencies(agenciesData);

    } catch (err: any) {
      setModalError(err.message || "Failed to load management resources");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenUsersModal = () => {
    setIsModalOpen(true);
    loadUsersAndAgencies();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!newEmail || !newPassword || !newRole) {
      setModalError("All marked fields are required.");
      return;
    }

    setModalLoading(true);
    const token = localStorage.getItem("token");
    
    const payload = {
      email: newEmail.trim(),
      password: newPassword,
      role: newRole,
      name: newName.trim() || null,
      agency_id: newRole === "agent" && newAgencyId ? parseInt(newAgencyId) : null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create user in database");
      }

      setModalSuccess("User created successfully!");
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewAgencyId("");
      
      // Reload lists and dashboard stats
      loadUsersAndAgencies();
      fetchStats();

    } catch (err: any) {
      setModalError(err.message || "Operation failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    setModalLoading(true);
    setModalError("");
    setModalSuccess("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete user");
      }

      setModalSuccess("User deleted successfully!");
      loadUsersAndAgencies();
      fetchStats();
    } catch (err: any) {
      setModalError(err.message || "Failed to delete user");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-bg-base min-h-screen text-text-main font-sans select-none relative overflow-hidden">
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#E5E5E5_1px,transparent_1px)] [background-size:20px_20px] opacity-65"></div>

      <Header onToggleDrawer={() => {}} />

      {/* Title Band */}
      <div className="bg-[#4b575d] border-t border-[#B5A48A] h-8 flex items-center px-6 shrink-0 select-none shadow-sm">
        <span className="text-white font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
          <Shield size={11} className="text-[#B5A48A]" />
          Admin Center Control
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between border-b border-border-main pb-4 mb-6">
            <h1 className="page-title">
              System Administration Dashboard
            </h1>
            <span className="text-[10px] font-bold text-slate-400 bg-secondary/50 border border-border-main rounded-lg px-2.5 py-1">
              SUPABASE INTEGRATED
            </span>
          </div>

          {error && (
             <div className="bg-danger/5 border border-danger/20 text-danger px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-xs font-semibold">
               <AlertCircle size={15} />
               Error: {error}
             </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-main rounded-2xl shadow-sm">
              <Loader2 className="animate-spin text-primary size-8" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">Loading stats...</span>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Customers */}
              <div className="bg-white border border-border-main rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:scale-[1.01]">
                <Users className="text-slate-400 size-6 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
                <span className="text-3xl font-extrabold text-text-main mt-1.5">{stats.total_customers}</span>
              </div>

              {/* Total Agencies */}
              <div className="bg-white border border-border-main rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:scale-[1.01]">
                <Building2 className="text-slate-400 size-6 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agencies</span>
                <span className="text-3xl font-extrabold text-text-main mt-1.5">{stats.total_agencies}</span>
              </div>

              {/* Total Agents */}
              <div className="bg-white border border-border-main rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:scale-[1.01]">
                <Building2 className="text-slate-400 size-6 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agents</span>
                <span className="text-3xl font-extrabold text-text-main mt-1.5">{stats.total_agents}</span>
              </div>

            </div>
          ) : null}

          {/* Admin Actions Panel */}
          <div className="mt-8 bg-white border border-border-main rounded-2xl shadow-sm p-6 animate-in fade-in">
            <h2 className="section-title mb-4 border-b border-border-main pb-2">
              Administrative Operations
            </h2>
            <div className="flex gap-3.5 flex-wrap">
              <button 
                onClick={handleOpenUsersModal}
                className="h-10 px-5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/10 hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer border-none"
              >
                <UserPlus size={14} />
                Manage Users
              </button>
              <button className="h-10 px-5 border border-border-main bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                Manage Roles
              </button>
              <button className="h-10 px-5 border border-border-main bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                System Logs
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── USER MANAGEMENT MODAL ── */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-[100] transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-border-main rounded-2xl shadow-2xl z-[101] w-full max-w-4xl p-6 md:p-8 flex flex-col max-h-[90vh] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-border-main pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="card-title">User Account Management</h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">CREATE & MANAGE SUPABASE AUTHENTICATION ACCOUNTS</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border-main hover:bg-slate-50 text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Status Alerts */}
            {modalError && (
              <div className="bg-danger/5 border border-danger/20 text-danger rounded-xl p-3.5 mt-4 flex items-start gap-2.5 text-xs font-semibold shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="bg-success/5 border border-success/20 text-success rounded-xl p-3.5 mt-4 flex items-start gap-2.5 text-xs font-semibold shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Modal Body: Split view (Left: Create Form, Right: Users List) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 min-h-0">
              
              {/* LEFT COLUMN: CREATE USER FORM */}
              <div className="lg:col-span-2 flex flex-col min-h-0 overflow-y-auto pr-1">
                <h4 className="card-title text-primary border-b border-border-main/55 pb-1.5 mb-4 shrink-0">
                  Create New Account
                </h4>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. John Agent"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-9 px-3 bg-secondary/30 border border-border-main text-text-main text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 bg-secondary/30 border border-border-main text-text-main text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 bg-secondary/30 border border-border-main text-text-main text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Role Select */}
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Assign Role <span className="text-danger">*</span>
                    </label>
                    <select 
                      value={newRole}
                      onChange={(e) => {
                        setNewRole(e.target.value);
                        setNewAgencyId("");
                      }}
                      className="w-full h-9 px-2 bg-white border border-border-main text-text-main text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="agent">Agent (linked to agency)</option>
                      <option value="agency">Agency (owns portal)</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  {/* Agency Link Dropdown (Only visible if role == agent) */}
                  {newRole === "agent" && (
                    <div className="animate-in fade-in slide-in-from-top-1.5 duration-150">
                      <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Link to Agency <span className="text-danger">*</span>
                      </label>
                      <select 
                        required
                        value={newAgencyId}
                        onChange={(e) => setNewAgencyId(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-border-main text-text-main text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                      >
                        <option value="">-- Choose Agency --</option>
                        {agencies.map((agency) => (
                           <option key={agency.id} value={agency.id}>
                             {agency.name} ({agency.email})
                           </option>
                        ))}
                      </select>
                      {agencies.length === 0 && (
                        <p className="text-[10px] text-danger mt-1 font-semibold">
                          ⚠️ Create an Agency account first before linkable agents can be added!
                        </p>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={modalLoading || (newRole === "agent" && !newAgencyId)}
                    className="w-full h-9 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-primary/95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none mt-2 animate-in duration-200"
                  >
                    {modalLoading ? "Creating..." : "Create Account"}
                  </button>

                </form>
              </div>

              {/* RIGHT COLUMN: USERS GRID */}
              <div className="lg:col-span-3 flex flex-col min-h-0 bg-secondary/15 border border-border-main rounded-xl p-4 overflow-hidden">
                <h4 className="card-title text-primary border-b border-border-main/55 pb-1.5 mb-3.5 shrink-0 flex items-center justify-between">
                  <span>Registered Users ({users.length})</span>
                  <button 
                    onClick={loadUsersAndAgencies} 
                    className="text-[9px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider focus:outline-none cursor-pointer"
                  >
                    Refresh List
                  </button>
                </h4>

                <div className="flex-1 overflow-y-auto border border-border-main/60 rounded-xl bg-white min-h-0 shadow-inner">
                  {modalLoading && users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-primary size-5" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Loading users...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                      <span className="text-xs text-slate-400 font-bold">No Users Found</span>
                      <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">No users exist in the Supabase instance yet.</p>
                    </div>
                  ) : (
                    <table className="premium-table table-fixed">
                      <thead>
                        <tr>
                          <th className="w-[50%] table-header">Email</th>
                          <th className="w-[25%] table-header">Role</th>
                          <th className="w-[25%] table-header text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="table-body truncate" title={u.email}>
                              {u.email}
                            </td>
                            <td className="table-body">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                u.role === "admin" 
                                  ? "bg-danger/10 text-danger" 
                                  : u.role === "agency" 
                                    ? "bg-primary/10 text-primary" 
                                    : "bg-sky-100 text-sky-600"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="table-body text-center">
                              {u.role !== "admin" ? (
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-slate-400 hover:text-danger hover:bg-danger/5 p-1 rounded-lg transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : (
                                <span className="text-[9px] font-bold text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
