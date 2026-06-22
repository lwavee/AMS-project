/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../lib/config";
import {
  Save,
  Printer,
  Search,
  Plus,
  X,
  Calendar,
  Clock,
  Paperclip,
  Info,
  CheckCircle,
  Loader2,
  AlertTriangle,
  FolderOpen,
  ArrowLeft,
  Users,
  Shield,
  Activity,
  User,
  Check
} from "lucide-react";

export default function NewActivityPage() {
  const params = useParams();
  const router = useRouter();
  
  // Starting customer ID from URL params (could be "search" if opened globally)
  const initialCustomerId = params?.id as string;
  const [customerId, setCustomerId] = useState<string>("");
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  
  // Modals and Search UI
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Form fields (top header of form)
  const [centerType, setCenterType] = useState("Customer");
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [selectedPolicyNum, setSelectedPolicyNum] = useState("");
  const [policyEffDate, setPolicyEffDate] = useState("");
  const [policyCompany, setPolicyCompany] = useState("");
  const [claimNum, setClaimNum] = useState("");
  
  // Activity form section
  const [isCreateActivity, setIsCreateActivity] = useState(true);
  const [activityAction, setActivityAction] = useState("Email");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityGroupType, setActivityGroupType] = useState("(All)");
  const [activityGroupName, setActivityGroupName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  
  // Suspense form section
  const [isCreateSuspense, setIsCreateSuspense] = useState(false);
  const [suspenseTo, setSuspenseTo] = useState("");
  const [suspenseCc, setSuspenseCc] = useState("");
  const [suspenseAction, setSuspenseAction] = useState("");
  const [suspenseDays, setSuspenseDays] = useState("");
  const [suspenseDueDate, setSuspenseDueDate] = useState("");
  const [suspensePriority, setSuspensePriority] = useState("Normal");
  const [suspenseComplete, setSuspenseComplete] = useState(false);
  const [suspenseDescription, setSuspenseDescription] = useState("");
  
  // Bottom fields
  const [enteredBy, setEnteredBy] = useState("KAPIL");
  const [completedBy, setCompletedBy] = useState("");
  const [enteredDate, setEnteredDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [timesRescheduled, setTimesRescheduled] = useState(0);
  const [personalSuspense, setPersonalSuspense] = useState(false);
  
  // UI Notification State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize entered by and current date/times
  useEffect(() => {
    const email = localStorage.getItem("email") || "KAPIL";
    setEnteredBy(email.split('@')[0].toUpperCase());
    
    // Set date defaults (YYYY-MM-DD)
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setActivityDate(formattedDate);
    setEnteredDate(formattedDate);
    
    // Set time default (e.g. 02:32 PM)
    let hours = today.getHours();
    const minutes = today.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    setActivityTime(`${strHours}:${strMinutes} ${ampm}`);
    
    // Set customerId if available
    if (initialCustomerId && initialCustomerId !== "search") {
      setCustomerId(initialCustomerId);
    } else {
      setShowSearchModal(true);
      setCustomerId("");
    }
  }, [initialCustomerId]);

  // Load customer info & policies when customerId changes
  useEffect(() => {
    if (!customerId) return;
    
    const fetchCustomerData = async () => {
      try {
        const token = localStorage.getItem("token");
        const custRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (custRes.ok) {
          const cust = await custRes.json();
          setCustomerName(cust.name || [cust.first_name, cust.last_name].filter(Boolean).join(" ") || "Unknown Customer");
        } else {
          setCustomerName("Unknown Customer");
        }
        
        // Fetch policies
        const policiesRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (policiesRes.ok) {
          const policiesList = await policiesRes.json();
          // Load policies list
          setPolicies(policiesList);
          
          // Select first policy by default if list is not empty
          if (policiesList.length > 0) {
            const firstPolicy = policiesList[0];
            setSelectedPolicyId(firstPolicy.id.toString());
            setSelectedPolicyNum(firstPolicy.policy_num);
            setPolicyEffDate(firstPolicy.eff_date || "");
            setPolicyCompany(firstPolicy.company || "");
          } else {
            setSelectedPolicyId("");
            setSelectedPolicyNum("");
            setPolicyEffDate("");
            setPolicyCompany("");
          }
        }
      } catch (err) {
        console.error("Failed to load customer/policies details", err);
      }
    };
    
    fetchCustomerData();
  }, [customerId]);

  // Fetch all customers for search popup
  const fetchAllCustomers = async () => {
    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        setSearchResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // Trigger loading customers once modal is opened
  useEffect(() => {
    if (showSearchModal) {
      fetchAllCustomers();
    }
  }, [showSearchModal]);

  // Handle Search Input filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(customers);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = customers.filter(c => {
      const name = (c.name || [c.first_name, c.last_name].join(" ")).toLowerCase();
      const code = (c.match_code || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
    setSearchResults(filtered);
  }, [searchQuery, customers]);

  // Handle policy selection dropdown change
  const handlePolicyChange = (policyIdVal: string) => {
    setSelectedPolicyId(policyIdVal);
    if (!policyIdVal) {
      setSelectedPolicyNum("");
      setPolicyEffDate("");
      setPolicyCompany("");
      return;
    }
    const policy = policies.find(p => p.id.toString() === policyIdVal);
    if (policy) {
      setSelectedPolicyNum(policy.policy_num);
      setPolicyEffDate(policy.eff_date || "");
      setPolicyCompany(policy.company || "");
    }
  };

  // Suspense Days <-> Due Date calculation logic
  const handleDaysChange = (daysVal: string) => {
    setSuspenseDays(daysVal);
    if (!daysVal || isNaN(Number(daysVal))) {
      setSuspenseDueDate("");
      return;
    }
    const days = parseInt(daysVal, 10);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + days);
    setSuspenseDueDate(dateObj.toISOString().split("T")[0]);
  };

  const handleDueDateChange = (dateVal: string) => {
    setSuspenseDueDate(dateVal);
    if (!dateVal) {
      setSuspenseDays("");
      return;
    }
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(dateVal);
    end.setHours(0,0,0,0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setSuspenseDays(diffDays >= 0 ? diffDays.toString() : "0");
  };

  // Submit and save the new Activity to localStorage
  const handleSave = () => {
    setError("");
    
    if (!customerId) {
      setError("Please search and select a Customer first.");
      return;
    }

    if (isCreateActivity && !activityAction) {
      setError("Please select an Action for the Activity.");
      return;
    }

    if (isCreateSuspense && !suspenseTo) {
      setError("Please select a target user ('To') for the Suspense.");
      return;
    }

    setLoading(true);
    
    try {
      // Load current activities log
      const logKey = `activities_log_${customerId}`;
      const stored = localStorage.getItem(logKey);
      const currentLog = stored ? JSON.parse(stored) : [];

      const newId = `act-${Date.now()}`;
      
      // Construct date string formatted like classic client
      const dateParts = activityDate.split("-");
      const displayDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}` : new Date().toLocaleDateString("en-US");

      // 1. Save Activity details
      if (isCreateActivity) {
        const newAct = {
          id: newId,
          date: displayDate,
          by: enteredBy,
          action: activityAction,
          description: activityDescription || "Activity Logged",
          policyNum: selectedPolicyNum || "N/A",
          effDate: policyEffDate || "N/A",
          trans: activityAction,
          group: activityGroupType,
          type: "Activity"
        };
        currentLog.unshift(newAct);
      }

      // 2. Save Suspense details if created
      if (isCreateSuspense) {
        const suspenseId = `sus-${Date.now()}`;
        const newSus = {
          id: suspenseId,
          date: displayDate,
          by: enteredBy,
          action: suspenseAction || "Follow-up",
          description: suspenseDescription || `Suspense to ${suspenseTo}`,
          policyNum: selectedPolicyNum || "N/A",
          effDate: policyEffDate || "N/A",
          trans: "Suspense",
          dueDate: suspenseDueDate,
          assignedTo: suspenseTo,
          priority: suspensePriority || "Normal",
          complete: suspenseComplete,
          type: "Suspense"
        };
        currentLog.unshift(newSus);
      }

      // Commit back to local storage
      localStorage.setItem(logKey, JSON.stringify(currentLog));

      // Trigger standard storage event for all other open tabs/windows
      window.dispatchEvent(new Event("storage"));

      setSuccess(true);
      setLoading(false);

      // Close the popup window after brief success message
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // Fallback if window cannot close automatically
          router.push(`/agency/customer/${customerId}`);
        }
      }, 1000);
      
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "Failed to save activity.");
    }
  };

  const handleCancel = () => {
    try {
      window.close();
    } catch (e) {
      if (customerId) {
        router.push(`/agency/customer/${customerId}`);
      } else {
        router.push("/agency/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans select-none text-text-main pb-24">
      {/* ── Premium Modern Header (matches website theme) ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-xl tracking-wider font-sans">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">Sterling Insurance Services</span>
            <span className="text-[9px] uppercase tracking-wider text-primary font-bold leading-none mt-0.5">Activity / Suspense Center</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
            title="Cancel"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="h-8 px-3.5 flex items-center gap-1.5 border border-border-main bg-white hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800 font-bold text-xs rounded-xl cursor-pointer hidden sm:flex"
            title="Print"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading || success}
            className="h-8 px-4 flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/90 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>Save & Close</span>
          </button>
        </div>
      </header>

      {/* ── Descriptive Instruction Box ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="bg-secondary/40 border border-border-main rounded-2xl p-4 flex gap-3.5 items-start">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1 font-medium">
            <p className="font-bold text-text-main">Log Activities and create Suspense Follow-ups for your agency customers.</p>
            <p>Select a policy to prefill effective dates and companies. Enabling "Create Suspense" allows assigning follow-up dates and tasks to representatives.</p>
          </div>
        </div>
      </div>

      {/* ── Forms Body ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        {/* Success Feedback Banner */}
        {success && (
          <div className="bg-success/5 border border-success/20 text-success p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle className="size-5 text-success shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-success">Activity Saved Successfully!</p>
              <p className="text-[11px] font-semibold text-success/80 mt-0.5">Syncing list and closing window...</p>
            </div>
          </div>
        )}

        {/* Error Feedback Banner */}
        {error && (
          <div className="bg-danger/5 border border-danger/20 text-danger p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <Info className="size-5 text-danger shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-danger">Validation Error</p>
              <p className="text-[11px] font-semibold text-danger/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          
          {/* CARD 1: Customer & Policy Context */}
          <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-primary" />
                Customer & Policy Information
              </span>
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="text-primary hover:underline font-bold text-[10px] flex items-center gap-1"
              >
                <Search size={11} />
                [Search Customers]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Box */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Center / Customer</label>
                <div className="flex gap-2">
                  <select
                    value={centerType}
                    onChange={(e) => setCenterType(e.target.value)}
                    className="h-10 px-2 bg-secondary/35 border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Policy">Policy</option>
                  </select>
                  <input
                    type="text"
                    readOnly
                    value={customerName || "No Customer Selected"}
                    className="flex-1 h-10 px-3.5 bg-secondary/35 border border-border-main text-text-main text-xs font-bold rounded-xl focus:outline-none opacity-80"
                  />
                </div>
              </div>

              {/* Policy Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => handlePolicyChange(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                >
                  {policies.length === 0 ? (
                    <option value="">No Active Policies</option>
                  ) : (
                    <>
                      <option value="">-- Select Policy --</option>
                      {policies.map(p => (
                        <option key={p.id} value={p.id.toString()}>{p.policyNum} ({p.company})</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Policy Fields (Eff Date & Company) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Effective Date</label>
                  <input
                    type="text"
                    readOnly
                    value={policyEffDate || "—"}
                    className="w-full h-10 px-3 bg-secondary/35 border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none opacity-80"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company</label>
                  <input
                    type="text"
                    readOnly
                    value={policyCompany || "—"}
                    className="w-full h-10 px-3 bg-secondary/35 border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none opacity-80"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Claim Number */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Claim # (If Applicable)</label>
                <input
                  type="text"
                  value={claimNum}
                  onChange={(e) => setClaimNum(e.target.value)}
                  placeholder="Enter related claim number"
                  className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Activity Form Section */}
          <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCreateActivity}
                onChange={(e) => setIsCreateActivity(e.target.checked)}
                className="rounded border-border-main text-primary focus:ring-primary/20 h-4 w-4 accent-primary"
              />
              <span className="flex items-center gap-1.5 font-black text-slate-500">
                <Activity size={12} className="text-primary" />
                Create Activity Log
              </span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300 ${isCreateActivity ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              {/* Action Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Action <span className="text-danger">*</span>
                </label>
                <select
                  value={activityAction}
                  onChange={(e) => setActivityAction(e.target.value)}
                  disabled={!isCreateActivity}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                >
                  <option value="Email">Email</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Rewrite">Rewrite</option>
                  <option value="Endorsement">Endorsement</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Cancellation">Cancellation</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Correspondence">Correspondence</option>
                  <option value="Quote">Quote</option>
                  <option value="Audit">Audit</option>
                  <option value="Binder">Binder</option>
                  <option value="Claims">Claims</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  disabled={!isCreateActivity}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Time</label>
                <input
                  type="text"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  disabled={!isCreateActivity}
                  placeholder="e.g. 02:32 PM"
                  className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              {/* Groups Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Group Type</label>
                  <select
                    value={activityGroupType}
                    onChange={(e) => setActivityGroupType(e.target.value)}
                    disabled={!isCreateActivity}
                    className="w-full h-10 px-2 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none text-[11px]"
                  >
                    <option value="(All)">(All)</option>
                    <option value="Underwriting">Underwriting</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Claims">Claims</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Group Name</label>
                  <select
                    value={activityGroupName}
                    onChange={(e) => setActivityGroupName(e.target.value)}
                    disabled={!isCreateActivity}
                    className="w-full h-10 px-2 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none text-[11px]"
                  >
                    <option value="">-- Select --</option>
                    <option value="Group 1">Group A</option>
                    <option value="Group 2">Group B</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-4 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <button type="button" className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>Attachments</span>
                  </button>
                </div>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  disabled={!isCreateActivity}
                  rows={4}
                  className="w-full bg-white border border-border-main p-3 rounded-xl text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary resize-y"
                  placeholder="Enter detailed activity log..."
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Suspense Form Section */}
          <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCreateSuspense}
                onChange={(e) => setIsCreateSuspense(e.target.checked)}
                className="rounded border-border-main text-primary focus:ring-primary/20 h-4 w-4 accent-primary"
              />
              <span className="flex items-center gap-1.5 font-black text-slate-500">
                <Clock size={12} className="text-primary" />
                Create Suspense Follow-Up
              </span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 transition-all duration-300 ${isCreateSuspense ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              {/* Target To User */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Assign To <span className="text-danger">*</span>
                </label>
                <select
                  value={suspenseTo}
                  onChange={(e) => setSuspenseTo(e.target.value)}
                  disabled={!isCreateSuspense}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                >
                  <option value="">-- Choose User --</option>
                  <option value="YOAV">Yoav Anatian</option>
                  <option value="JOANA">Joana Parungao</option>
                  <option value="KAPIL">Kapil</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              {/* CC User */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CC</label>
                <select
                  value={suspenseCc}
                  onChange={(e) => setSuspenseCc(e.target.value)}
                  disabled={!isCreateSuspense}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                >
                  <option value="">-- Choose User --</option>
                  <option value="YOAV">Yoav Anatian</option>
                  <option value="JOANA">Joana Parungao</option>
                  <option value="KAPIL">Kapil</option>
                </select>
              </div>

              {/* Suspense Action */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Action</label>
                <select
                  value={suspenseAction}
                  onChange={(e) => setSuspenseAction(e.target.value)}
                  disabled={!isCreateSuspense}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                >
                  <option value="">-- Choose Action --</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Review">Review</option>
                  <option value="Call customer">Call customer</option>
                  <option value="Send email">Send email</option>
                  <option value="Check status">Check status</option>
                </select>
              </div>

              {/* Days count */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider"># Days</label>
                <input
                  type="number"
                  min="0"
                  value={suspenseDays}
                  onChange={(e) => handleDaysChange(e.target.value)}
                  disabled={!isCreateSuspense}
                  className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={suspenseDueDate}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  disabled={!isCreateSuspense}
                  className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              {/* Priority & Complete checkbox */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
                  <select
                    value={suspensePriority}
                    onChange={(e) => setSuspensePriority(e.target.value)}
                    disabled={!isCreateSuspense}
                    className="w-full h-10 px-2.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none text-[11px]"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={suspenseComplete}
                      onChange={(e) => setSuspenseComplete(e.target.checked)}
                      disabled={!isCreateSuspense}
                      className="rounded border-border-main text-primary focus:ring-primary/20 accent-primary"
                    />
                    Complete
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-5 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suspense Details / Description</label>
                <textarea
                  value={suspenseDescription}
                  onChange={(e) => setSuspenseDescription(e.target.value)}
                  disabled={!isCreateSuspense}
                  rows={3}
                  className="w-full bg-white border border-border-main p-3 rounded-xl text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary resize-y"
                  placeholder="Task detail notes..."
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Bottom Metadata Info */}
          <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entered By</label>
              <input
                type="text"
                readOnly
                value={enteredBy}
                className="w-full h-10 px-3.5 bg-secondary/35 border border-border-main text-text-main text-xs font-bold rounded-xl focus:outline-none opacity-80"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entered Date</label>
              <input
                type="text"
                readOnly
                value={enteredDate}
                className="w-full h-10 px-3.5 bg-secondary/35 border border-border-main text-text-main text-xs font-bold rounded-xl focus:outline-none opacity-80"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Completed By</label>
              <input
                type="text"
                value={completedBy}
                onChange={(e) => setCompletedBy(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Completed Date</label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 col-span-1 md:col-span-2 lg:col-span-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Reschedules</label>
                <input
                  type="number"
                  min="0"
                  value={timesRescheduled}
                  onChange={(e) => setTimesRescheduled(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personalSuspense}
                    onChange={(e) => setPersonalSuspense(e.target.checked)}
                    className="rounded border-border-main text-primary focus:ring-primary/20 accent-primary h-4 w-4"
                  />
                  Personal
                </label>
              </div>
            </div>

            {/* Bottom Actions strip */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-2.5">
              <button
                type="button"
                className="h-9 px-4 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all"
              >
                Create Task
              </button>
              <button
                type="button"
                className="h-9 px-4 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all"
              >
                Create Appointment
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || success}
                className="h-9 px-5 bg-gradient-to-r from-primary to-primary/90 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                Save Activity
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── CUSTOMER SEARCH MODAL POPUP (rethemed modernly) ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[480px] bg-white border border-border-main shadow-2xl rounded-2xl overflow-hidden flex flex-col font-sans text-xs">
            {/* Modal Title bar */}
            <div className="bg-secondary/40 px-5 py-4 border-b border-border-main flex justify-between items-center select-none shrink-0">
              <span className="font-extrabold text-sm text-text-main tracking-tight">Search Agency Customers</span>
              <button
                onClick={() => {
                  if (customerId) setShowSearchModal(false);
                  else setError("Please select a customer before closing search.");
                }}
                className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-border-main h-7 w-7 flex items-center justify-center rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Search Input Box */}
            <div className="p-4 border-b border-border-main bg-secondary/10 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter Customer Name or Match Code:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-9 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                  placeholder="e.g. Verta Construction"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={fetchAllCustomers}
                  className="h-9 px-3.5 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Search Results list */}
            <div className="flex-1 max-h-[300px] overflow-y-auto bg-white p-2">
              {searching ? (
                <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <span className="text-[10px]">Fetching customer index...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium italic text-xs">
                  No customers found matching search filter.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border-main">
                      <th className="p-2.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Match Code</th>
                      <th className="p-2.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Customer Name</th>
                      <th className="p-2.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((cust) => {
                      const name = cust.name || [cust.first_name, cust.last_name].filter(Boolean).join(" ") || "Unnamed Customer";
                      return (
                        <tr key={cust.id} className="border-b border-border-main/50 hover:bg-primary/5 transition-colors duration-150">
                          <td className="p-2.5 font-mono text-[11px] font-bold text-slate-500">{cust.match_code || `CUST-${cust.id}`}</td>
                          <td className="p-2.5 font-bold text-text-main">{name}</td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerId(cust.id.toString());
                                setCustomerName(name);
                                setShowSearchModal(false);
                                setError("");
                              }}
                              className="h-7 px-3 bg-gradient-to-r from-primary to-primary/95 text-white font-bold rounded-lg text-[10px] shadow-sm hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Bottom buttons */}
            <div className="p-3.5 border-t border-border-main bg-secondary/20 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (customerId) setShowSearchModal(false);
                  else setError("Please select a customer before closing search.");
                }}
                className="h-8 px-4 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
