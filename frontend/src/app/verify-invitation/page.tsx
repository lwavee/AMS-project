/* eslint-disable */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  ArrowRight,
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

function VerifyInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isDemo = searchParams.get("demo") === "true";

  // Page token verification state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);

  // Form input state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCodeHint, setShowCodeHint] = useState(false);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  // "Connect to your mail" Popup Modal state
  const [isConnectMailOpen, setIsConnectMailOpen] = useState(false);
  const [mailConnecting, setMailConnecting] = useState(false);
  const [mailConnected, setMailConnected] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setError("No invitation verification token was provided.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/agency/invitations/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Invitation verification failed.");
        }

        setInvitationData(data);
        if (data.email) {
          setEmail(data.email);
        }
        // Code is intentionally NOT auto-filled so the agent must enter the code from their email
      } catch (err: any) {
        setError(err.message || "Failed to verify invitation token.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Form submission: Validate inputs, activate agent account, and open "Connect to your mail" popup
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Please provide your business email address.");
      return;
    }

    if (!code.trim()) {
      setFormError("Please enter the verification code sent in your invitation email.");
      return;
    }

    // Strict code validation: if code is wrong, display error immediately
    if (invitationData?.code && code.trim() !== invitationData.code.trim()) {
      setFormError("Verification code is incorrect. The code you entered does not match the code sent in your email.");
      return;
    }

    if (!password) {
      setFormError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/agency/invitations/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          code: code.trim(),
          password: password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If already verified, allow opening the connect modal directly
        if (data.detail && data.detail.includes("already been verified")) {
          setIsActivated(true);
          setIsConnectMailOpen(true);
          return;
        }
        throw new Error(data.detail || "Account activation failed. Please try again.");
      }

      // Store auth session
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_email", data.email || email);
        localStorage.setItem("user_role", data.role || "agent");
        localStorage.setItem("user_name", data.name || invitationData?.name || "");
      }

      setIsActivated(true);
      // Automatically open the "Connect to your mail" popup modal
      setIsConnectMailOpen(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to complete account activation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate Microsoft Outlook OAuth Mailbox connection
  const handleConnectOutlookMail = () => {
    setMailConnecting(true);
    setTimeout(() => {
      setMailConnecting(false);
      setMailConnected(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-[#2d2a26] select-none">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#e5ddd5] shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#e5ddd5]/60">
          <div className="h-13 w-13 rounded-2xl bg-[#FDF6F0] border border-[#F5E6D8] text-[#c2a07e] flex items-center justify-center font-bold text-xl mb-2.5 shadow-xs">
            S
          </div>
          <h1 className="text-xl font-extrabold text-[#2d2a26] tracking-tight">Sterling AMS</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Insurance Agency Management System</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            AGENT ONBOARDING & ACTIVATION
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#c2a07e] size-8" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Validating invitation token...
            </span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-8 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-red-700">Invalid or Expired Invitation</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
            <div className="pt-4">
              <button
                onClick={() => router.push("/login")}
                className="h-10 px-6 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {/* Validated Token State: Display Verification Banner & Activation Form */}
        {!loading && !error && invitationData && (
          <div className="py-5 space-y-5">
            {/* Validated Notice Banner */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-950">
              <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Invitation Token Validated
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Verified Link
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                  Welcome, <span className="font-bold text-emerald-900">{invitationData.name}</span>. Complete your account setup for <span className="font-bold text-emerald-900">{invitationData.agency_name}</span>.
                </p>
              </div>
            </div>

            {/* Account Details Capsule */}
            <div className="bg-slate-50/80 border border-[#e5ddd5] rounded-2xl p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#9A8B7A] shrink-0" />
                <span className="text-slate-400 font-medium">Agent:</span>
                <span className="font-bold text-[#2d2a26] truncate">{invitationData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#9A8B7A] shrink-0" />
                <span className="text-slate-400 font-medium">Agency:</span>
                <span className="font-bold text-[#c2a07e] truncate">{invitationData.agency_name}</span>
              </div>
            </div>

            {/* Account Activation Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#e5ddd5]/60">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2d2a26] flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[#c2a07e]" />
                  Set Up Agent Credentials
                </span>
                <span className="text-[11px] text-[#9A8B7A] font-medium">
                  Step 1 of 2
                </span>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-start gap-2 text-xs font-semibold animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* FIELD 1: Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@agency.com"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50/60 border border-[#e5ddd5] text-[#2d2a26] text-xs font-semibold rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pre-filled with your invited agency business email.
                </p>
              </div>

              {/* FIELD 2: Verification Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#2d2a26] uppercase tracking-wider">
                    Verification Code <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#9A8B7A] font-semibold">
                    Sent in invitation email
                  </span>
                </div>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\s+/g, ""));
                      if (formError) setFormError(null);
                    }}
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#e5ddd5] text-[#2d2a26] text-sm font-mono font-bold tracking-widest rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-400">
                    Must match the 6-digit code sent in your invitation email.
                  </span>
                  {invitationData?.code && (
                    <button
                      type="button"
                      onClick={() => setShowCodeHint(!showCodeHint)}
                      className="text-[#c2a07e] hover:underline font-bold cursor-pointer"
                    >
                      {showCodeHint ? `Demo Code: ${invitationData.code}` : "Show Code Hint (Demo)"}
                    </button>
                  )}
                </div>
              </div>

              {/* FIELD 3: Set Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                  Set Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password (min. 6 characters)"
                    className="w-full h-11 pl-10 pr-10 bg-white border border-[#e5ddd5] text-[#2d2a26] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* FIELD 4: Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password to confirm"
                    className="w-full h-11 pl-10 pr-10 bg-white border border-[#e5ddd5] text-[#2d2a26] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin size-4" />
                      <span>Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate & Connect Mail</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              {/* Trigger popup manually if already activated */}
              {isActivated && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConnectMailOpen(true)}
                    className="text-xs text-[#c2a07e] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Mail size={13} />
                    <span>Open "Connect to your mail" popup</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        <div className="text-center pt-4 border-t border-[#e5ddd5]/60">
          <p className="text-[10px] text-slate-400">
            Sterling AMS • High-Security Commercial & Personal Insurance Platform
          </p>
        </div>

      </div>

      {/* =========================================================================
          POPUP MODAL: "Connect to your mail" (Microsoft Outlook OAuth Integration)
         ========================================================================= */}
      {isConnectMailOpen && (
        <>
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] transition-opacity duration-200 animate-in fade-in"
            onClick={() => !mailConnecting && setIsConnectMailOpen(false)}
          />

          {/* Modal Dialog */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#e5ddd5] rounded-3xl shadow-2xl z-[101] w-full max-w-[440px] p-6 sm:p-8 flex flex-col select-none animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={() => setIsConnectMailOpen(false)}
              disabled={mailConnecting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header with Microsoft 4-Color Tiles */}
            <div className="flex flex-col items-center mb-5 text-center">
              <div className="grid grid-cols-2 gap-1 size-8 mb-3 shadow-xs">
                <div className="bg-[#F25022] rounded-xs"></div>
                <div className="bg-[#7FBA00] rounded-xs"></div>
                <div className="bg-[#00A4EF] rounded-xs"></div>
                <div className="bg-[#FFB900] rounded-xs"></div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#2d2a26]">
                {mailConnected ? "Outlook Mailbox Connected!" : "Connect to your mail"}
              </h3>
              <p className="text-xs text-[#6b5e52] mt-1 font-medium max-w-[320px] leading-relaxed">
                {mailConnected
                  ? "Your corporate Outlook mailbox is now synchronized with Sterling AMS."
                  : "Connect your Microsoft Outlook or Office 365 mailbox to automatically sync emails, policy communications, and client updates."}
              </p>
            </div>

            {/* Connected Email Badge */}
            <div className="bg-slate-50 border border-[#e5ddd5] rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="size-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Mailbox</p>
                  <p className="text-xs font-bold text-[#2d2a26] truncate">{email || invitationData?.email}</p>
                </div>
              </div>
              {mailConnected ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <Check size={11} className="stroke-[3]" />
                  Active
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Pending Auth
                </span>
              )}
            </div>

            {!mailConnected ? (
              <div className="space-y-4">
                {/* Integration Feature Highlights */}
                <div className="space-y-2 bg-[#FDF6F0]/60 border border-[#F5E6D8] rounded-2xl p-3.5 text-xs text-[#6b5e52]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Two-way Email Sync:</strong> Automatically attach incoming customer emails to policies and claims.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Outlook Calendar:</strong> Sync policy renewals, inspections, and client meetings.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Enterprise OAuth 2.0:</strong> Bank-grade encryption without storing your Outlook password.
                    </span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={mailConnecting}
                    onClick={() => setIsConnectMailOpen(false)}
                    className="flex-1 h-11 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    disabled={mailConnecting}
                    onClick={handleConnectOutlookMail}
                    className="flex-1 h-11 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {mailConnecting ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Connect Outlook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success / Connected State */
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
                  <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={24} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Mail Connection Established!
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
                    Your Outlook mailbox has been linked successfully. Email threads and calendar events will sync automatically.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push("/agency/dashboard")}
                    className="flex-1 h-11 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="h-11 px-5 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default function VerifyInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#c2a07e] size-8" />
        </div>
      }
    >
      <VerifyInvitationContent />
    </Suspense>
  );
}
