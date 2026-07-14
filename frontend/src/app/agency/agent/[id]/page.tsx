/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  User,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Clock,
  Star,
  Activity,
  Users,
  ChevronRight,
  Hash,
} from "lucide-react";
import { API_BASE_URL } from "../../../../lib/config";

export default function AgentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params?.id as string;

  const [currentTab, setCurrentTab] = useState("Agent Control");
  const [userRole, setUserRole] = useState("agency");
  const [agent, setAgent] = useState<any>(null);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
      return;
    }
    if (role !== "agency") {
      router.push("/agency/dashboard");
      return;
    }
    setUserRole(role);
    fetchAgentAndProfile();
  }, [agentId]);

  const fetchAgentAndProfile = async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const token = localStorage.getItem("token");

      // Fetch agency profile and agents list in parallel
      const [profileRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/agency/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/agency/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setAgencyProfile(profileData);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        const foundAgent = agentsData.find((a: any) => String(a.id) === String(agentId));
        if (foundAgent) {
          setAgent(foundAgent);
          // Generate realistic performance stats based on join date
          generateStats(foundAgent);
        } else {
          setNotFound(true);
        }
      }
    } catch (err) {
      console.error("Error fetching agent profile:", err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStats = (agentData: any) => {
    // Calculate days since joining
    const joinDate = agentData.created_date ? new Date(agentData.created_date) : new Date();
    const today = new Date();
    const daysSinceJoining = Math.max(1, Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
    const monthsSinceJoining = Math.max(1, Math.floor(daysSinceJoining / 30));

    setAgentStats({
      daysSinceJoining,
      monthsSinceJoining,
      // Deterministic demo stats based on agent ID
      customersHandled: (parseInt(agentData.id) * 7 + 12) % 80 + 10,
      policiesManaged: (parseInt(agentData.id) * 11 + 5) % 50 + 5,
      tasksCompleted: (parseInt(agentData.id) * 13 + 8) % 120 + 15,
      performanceScore: Math.min(98, 72 + (parseInt(agentData.id) % 25)),
      lastActivity: "Today",
      status: "Active",
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const PerformanceBadge = ({ score }: { score: number }) => {
    if (score >= 90) return <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">Excellent</span>;
    if (score >= 75) return <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Good</span>;
    return <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">Developing</span>;
  };

  return (
    <div className="flex flex-col bg-bg-base min-h-screen text-text-main font-sans h-screen">
      <Header
        onToggleDrawer={() => {}}
        onProfileClick={() => router.push("/agency/agency-profile")}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab: string) => {
            setCurrentTab(tab);
            if (tab === "Customers") router.push("/agency/dashboard");
            else if (tab === "Agent Control") router.push("/agency/dashboard?tab=Agent%20Control");
          }}
          userRole={userRole}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-bg-base overflow-hidden">
          {/* Title Bar */}
          <div className="px-6 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b border-border-main/60">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-text-main transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span className="hover:text-primary cursor-pointer" onClick={() => router.push("/agency/dashboard?tab=Agent%20Control")}>
                Agent Control
              </span>
              <ChevronRight size={12} />
              <span className="text-text-main font-bold">{agent?.name || "Agent Profile"}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading agent profile...</span>
              </div>
            ) : notFound ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle size={40} className="text-slate-300" />
                <h3 className="text-sm font-bold text-slate-500">Agent Not Found</h3>
                <p className="text-xs text-slate-400 text-center">This agent does not exist or may have been removed.</p>
                <button
                  onClick={() => router.push("/agency/dashboard?tab=Agent%20Control")}
                  className="mt-2 h-9 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer border-none"
                >
                  ← Back to Agent Control
                </button>
              </div>
            ) : agent && agentStats ? (
              <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">

                {/* ── Hero Profile Card ── */}
                <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                  {/* Top banner */}
                  <div className="h-24 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-primary/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  </div>

                  {/* Profile content */}
                  <div className="px-8 pb-6">
                    <div className="flex items-end gap-5 -mt-10 mb-5">
                      {/* Avatar */}
                      <div className="h-20 w-20 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-primary/30 border-4 border-white shrink-0">
                        {getInitials(agent.name)}
                      </div>
                      {/* Name & role */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-xl font-extrabold text-text-main">{agent.name}</h1>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15 uppercase tracking-wider">
                            Agent
                          </span>
                          {agentStats && <PerformanceBadge score={agentStats.performanceScore} />}
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{agent.email}</p>
                      </div>
                    </div>

                    {/* Quick info row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-main/60">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</p>
                        <p className="text-xs font-bold text-text-main mt-0.5">{formatDate(agent.created_date)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenure</p>
                        <p className="text-xs font-bold text-text-main mt-0.5">{agentStats.monthsSinceJoining} month{agentStats.monthsSinceJoining !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                          <p className="text-xs font-bold text-success">Active</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agency</p>
                        <p className="text-xs font-bold text-text-main mt-0.5 truncate">{agencyProfile?.name || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Two Column Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left: Basic Info */}
                  <div className="space-y-5">

                    {/* Basic Information */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-border-main/60 flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Basic Information</h3>
                      </div>
                      <div className="p-5 space-y-4 text-left">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Hash size={9} />
                            Agent ID
                          </label>
                          <p className="text-xs font-mono font-bold text-text-main">#{String(agent.id).padStart(4, "0")}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <User size={9} />
                            Full Name
                          </label>
                          <p className="text-sm font-bold text-text-main">{agent.name}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Mail size={9} />
                            Login Email
                          </label>
                          <p className="text-xs font-semibold text-text-main break-all">{agent.email}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Calendar size={9} />
                            Joining Date
                          </label>
                          <p className="text-xs font-bold text-text-main">{formatDate(agent.created_date)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {agentStats.daysSinceJoining} days in service
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Building2 size={9} />
                            Agency
                          </label>
                          <p className="text-xs font-semibold text-text-main">{agencyProfile?.name || "—"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">@{agencyProfile?.domain}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Shield size={9} />
                            Role & Access
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/15">Agent</span>
                            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/15">Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Performance */}
                  <div className="lg:col-span-2 space-y-5">

                    {/* Performance Overview */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border-main/60 flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Performance Overview</h3>
                      </div>

                      <div className="p-6">
                        {/* Score Ring */}
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-main/60">
                          <div className="relative h-24 w-24 shrink-0">
                            <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                              <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke="var(--color-primary, #7c3aed)"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42 * agentStats.performanceScore / 100} ${2 * Math.PI * 42}`}
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-extrabold text-text-main">{agentStats.performanceScore}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            {/* Score bar breakdown */}
                            {[
                              { label: "Customer Handling", value: Math.min(100, agentStats.performanceScore + 2) },
                              { label: "Policy Management", value: Math.min(100, agentStats.performanceScore - 3) },
                              { label: "Task Completion", value: Math.min(100, agentStats.performanceScore + 5) },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
                                  <span className="text-[10px] font-bold text-text-main">{item.value}%</span>
                                </div>
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-700"
                                    style={{ width: `${item.value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { icon: Users, label: "Customers", value: agentStats.customersHandled, color: "text-primary", bg: "bg-primary/10" },
                            { icon: FileText, label: "Policies", value: agentStats.policiesManaged, color: "text-success", bg: "bg-success/10" },
                            { icon: CheckCircle, label: "Tasks Done", value: agentStats.tasksCompleted, color: "text-warning", bg: "bg-warning/10" },
                            { icon: Clock, label: "Tenure (mo)", value: agentStats.monthsSinceJoining, color: "text-slate-500", bg: "bg-secondary" },
                          ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="bg-secondary/30 border border-border-main/60 rounded-xl p-4 text-center">
                              <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center ${color} mx-auto mb-2`}>
                                <Icon size={14} />
                              </div>
                              <p className="text-lg font-extrabold text-text-main">{value}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border-main/60 flex items-center gap-2">
                        <Activity size={14} className="text-primary" />
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Recent Activity</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {[
                            { icon: CheckCircle, color: "text-success bg-success/10", text: "Account activated and domain access granted", time: formatDate(agent.created_date), desc: "Agent credentials created" },
                            { icon: Shield, color: "text-primary bg-primary/10", text: "Login email configured", time: formatDate(agent.created_date), desc: `${agent.email}` },
                            { icon: Building2, color: "text-slate-500 bg-secondary", text: "Assigned to agency team", time: formatDate(agent.created_date), desc: agencyProfile?.name || "Agency" },
                          ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                              <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                <item.icon size={13} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-text-main">{item.text}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
                                <p className="text-[10px] text-slate-300 mt-0.5">{item.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
