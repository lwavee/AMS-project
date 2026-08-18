/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
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
} from "lucide-react";
import { API_BASE_URL } from "../../../lib/config";

export default function AgencyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState("Agent Control");
  const [userRole, setUserRole] = useState("agency");
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/agency/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setAgencyProfile(data);
      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
      });
    } catch (err) {
      console.error("Error fetching agency profile:", err);
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
      setAgencyProfile(data);
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

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="flex flex-col bg-bg-base min-h-screen text-text-main font-sans h-screen">
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

        <main className="flex-1 flex flex-col min-w-0 bg-bg-base overflow-hidden">
          {/* Page Title Bar */}
          <div className="px-6 pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-border-main/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Building2 size={18} />
              </div>
              <div>
                <h1 className="text-base font-bold text-text-main leading-tight">Agency Profile</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {agencyProfile?.name || "Loading..."}
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-xl">
                <CheckCircle size={13} />
                <span>Profile saved successfully!</span>
              </div>
            )}

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={!agencyProfile}
                className="h-9 px-4 flex items-center gap-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 size={13} />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError("");
                    if (agencyProfile) {
                      setEditForm({
                        name: agencyProfile.name || "",
                        phone: agencyProfile.phone || "",
                        address: agencyProfile.address || "",
                        city: agencyProfile.city || "",
                        state: agencyProfile.state || "",
                        zip: agencyProfile.zip || "",
                      });
                    }
                  }}
                  className="h-9 px-4 flex items-center gap-2 border border-border-main bg-white hover:bg-secondary/60 text-text-main text-xs font-bold rounded-xl cursor-pointer active:scale-[0.98] transition-all"
                >
                  <X size={13} />
                  Cancel
                </button>
                <button
                  form="profile-form"
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-4 flex items-center gap-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading agency profile...</span>
              </div>
            ) : agencyProfile ? (
              <form id="profile-form" onSubmit={handleSave}>
                {saveError && (
                  <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger text-xs font-semibold px-3 py-2.5 rounded-xl mb-4">
                    <AlertCircle size={14} />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* ── Left Column: Core Info ── */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Agency Identity Card */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-border-main flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-primary/30">
                          {agencyProfile.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-text-main">
                            {agencyProfile.name}
                          </h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/15">
                              @{agencyProfile.domain}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agency Account</span>
                          </div>
                        </div>
                      </div>

                      {/* Identity Fields */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                        {/* Agency Name */}
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Building2 size={10} />
                            Agency Name *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              required
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm font-semibold bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-bold text-text-main">{agencyProfile.name}</p>
                          )}
                        </div>

                        {/* Outlook Email */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Mail size={10} />
                            Outlook Email
                          </label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-text-main">{agencyProfile.email}</p>
                            <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-md border border-success/20">Verified</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Login email — cannot be changed</p>
                        </div>

                        {/* Authorized Domain */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Globe size={10} />
                            Authorized Domain
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-mono font-bold text-primary">@{agencyProfile.domain}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">All agent emails auto-derive from this domain</p>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Phone size={10} />
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              placeholder="e.g. 555-0199"
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-text-main">
                              {agencyProfile.phone || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          )}
                        </div>

                        {/* Member Since */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={10} />
                            Member Since
                          </label>
                          <p className="text-sm font-semibold text-text-main">
                            {formatDate(agencyProfile.created_date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border-main flex items-center gap-2">
                        <MapPin size={15} className="text-primary" />
                        <h3 className="text-sm font-bold text-text-main">Office Address</h3>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                        {/* Street Address */}
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              placeholder="123 Main Street, Suite 400"
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-text-main">
                              {agencyProfile.address || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.city}
                              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                              placeholder="New York"
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-text-main">
                              {agencyProfile.city || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          )}
                        </div>

                        {/* State */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.state}
                              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                              placeholder="NY"
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-text-main">
                              {agencyProfile.state || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          )}
                        </div>

                        {/* ZIP */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ZIP Code</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.zip}
                              onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                              placeholder="10001"
                              className="h-10 px-3.5 border border-border-main rounded-xl text-sm bg-white text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-text-main">
                              {agencyProfile.zip || <span className="text-slate-300 italic">Not set</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Right Column: Stats + Agents ── */}
                  <div className="space-y-5">
                    {/* Quick Stats */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm p-5 space-y-4">
                      <h3 className="text-xs font-bold text-text-main uppercase tracking-wider border-b border-border-main/60 pb-3">Quick Stats</h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Users size={13} />
                            </div>
                            Total Agents
                          </div>
                          <span className="text-lg font-extrabold text-primary">{agents.length}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center text-success">
                              <CheckCircle size={13} />
                            </div>
                            Active Domain
                          </div>
                          <span className="text-xs font-bold text-success">Active</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <div className="h-7 w-7 rounded-lg bg-secondary/60 flex items-center justify-center text-slate-500">
                              <Calendar size={13} />
                            </div>
                            Member Since
                          </div>
                          <span className="text-xs font-bold text-text-main">
                            {agencyProfile.created_date ? new Date(agencyProfile.created_date).getFullYear() : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-border-main/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary" />
                          <h3 className="text-xs font-bold text-text-main">Team Members</h3>
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {agents.length}
                        </span>
                      </div>

                      <div className="divide-y divide-border-main/40 max-h-[320px] overflow-y-auto">
                        {agents.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <Users size={22} className="text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">No agents yet</p>
                          </div>
                        ) : agents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => router.push(`/agency/agent/${agent.id}`)}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors text-left group cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xs shrink-0">
                              {agent.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-text-main truncate">{agent.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                            </div>
                            <ChevronRight size={13} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>

                      <div className="px-5 py-3 border-t border-border-main/60">
                        <button
                          onClick={() => router.push("/agency/dashboard?tab=Agent%20Control")}
                          className="w-full text-center text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Manage All Agents →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <AlertCircle size={28} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Profile not found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
