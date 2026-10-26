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
  Layers,
  AlertTriangle,
  RefreshCw,
  Unlink,
  Link2
} from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

type ConnectionState = "Not Connected" | "Connecting" | "Connected" | "Connection Expired" | "Connection Error";

function VerifyInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isDemo = searchParams.get("demo") === "true";

  // URL query params from OAuth callback
  const mailStatusParam = searchParams.get("mail_status");
  const errorMsgParam = searchParams.get("error_msg");
  const emailParam = searchParams.get("email");

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

  // Mailbox Connection State (Task 5: exact states & Connect Email button)
  const [isConnectMailOpen, setIsConnectMailOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("Not Connected");
  const [mailboxEmail, setMailboxEmail] = useState<string | null>(null);
  const [mailboxDisplayName, setMailboxDisplayName] = useState<string | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Query backend mailbox connection status
  const checkMailboxStatus = async (targetEmail: string) => {
    if (!targetEmail) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/agency/mail/status?email=${encodeURIComponent(targetEmail)}`
      );
      const data = await res.json();
      setOauthConfigured(Boolean(data.configured));

      if (data.status) {
        setConnectionState(data.status as ConnectionState);
      }
      if (data.email) {
        setMailboxEmail(data.email);
      }
      if (data.display_name) {
        setMailboxDisplayName(data.display_name);
      }
      if (!data.configured) {
        setConfigMessage(
          data.message ||
          "Microsoft OAuth 2.0 credentials are not configured in backend environment variables (MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET)."
        );
      } else {
        setConfigMessage(null);
      }
      if (data.message && data.status !== "Connected") {
        setStatusMessage(data.message);
      }
    } catch (err: any) {
      console.error("Failed to query mailbox status:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Verify invitation token on mount
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
        const agentEmail = data.email || "";
        if (agentEmail) {
          setEmail(agentEmail);
          checkMailboxStatus(agentEmail);
        }

        // If invitation was already verified in the past, mark as activated
        if (data.status === "Verified") {
          setIsActivated(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify invitation token.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Handle return from OAuth callback (redirect with query params)
  useEffect(() => {
    if (mailStatusParam === "connected") {
      setConnectionState("Connected");
      setIsActivated(true);
      setIsConnectMailOpen(true);
      if (emailParam) {
        setMailboxEmail(emailParam);
        checkMailboxStatus(emailParam);
      }
    } else if (mailStatusParam === "error") {
      setConnectionState("Connection Error");
      setStatusMessage(errorMsgParam || "OAuth connection failed. Please try again.");
      setIsActivated(true);
      setIsConnectMailOpen(true);
    }
  }, [mailStatusParam, errorMsgParam, emailParam]);

  // Form submission: Validate inputs, activate agent credentials, and open Connect Email modal
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

    // Strict code validation
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
        if (data.detail && data.detail.includes("already been verified")) {
          setIsActivated(true);
          setIsConnectMailOpen(true);
          await checkMailboxStatus(email);
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
      // Check mailbox status and open modal
      await checkMailboxStatus(email);
      setIsConnectMailOpen(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to complete account activation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Real OAuth 2.0 authorization code flow trigger
  // Visible label on button: "Connect Email"
  const handleConnectEmail = async () => {
    const targetEmail = mailboxEmail || email || invitationData?.email;
    if (!targetEmail) {
      setStatusMessage("No agent business email address found to connect.");
      return;
    }

    setConnectionState("Connecting");
    setStatusMessage(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/agency/mail/oauth/authorize?email=${encodeURIComponent(targetEmail)}`
      );
      const data = await res.json();

      if (!res.ok) {
        // Clear configuration notice if credentials missing - DO NOT fake live connection
        setConnectionState("Not Connected");
        const errMsg =
          data.detail ||
          data.error ||
          "Microsoft OAuth 2.0 credentials are not configured on the backend.";
        setConfigMessage(errMsg);
        setStatusMessage(errMsg);
        setOauthConfigured(false);
        return;
      }

      if (data.authorize_url) {
        // Redirect agent to real Microsoft OAuth consent screen
        window.location.href = data.authorize_url;
      } else {
        setConnectionState("Connection Error");
        setStatusMessage("Failed to obtain OAuth authorization URL from server.");
      }
    } catch (err: any) {
      setConnectionState("Connection Error");
      setStatusMessage(err.message || "Network error while initiating email connection.");
    }
  };

  // Disconnect business mailbox
  const handleDisconnectEmail = async () => {
    const targetEmail = mailboxEmail || email || invitationData?.email;
    if (!targetEmail) return;

    setDisconnecting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/agency/mail/disconnect?email=${encodeURIComponent(targetEmail)}`,
        { method: "POST" }
      );
      if (res.ok) {
        setConnectionState("Not Connected");
        setMailboxEmail(null);
        setMailboxDisplayName(null);
        setStatusMessage("Business mailbox disconnected.");
      }
    } catch (err: any) {
      console.error("Failed to disconnect mailbox:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (state: ConnectionState) => {
    switch (state) {
      case "Connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check size={12} className="stroke-[3]" />
            Connected
          </span>
        );
      case "Connecting":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Loader2 size={12} className="animate-spin" />
            Connecting
          </span>
        );
      case "Connection Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle size={12} />
            Connection Expired
          </span>
        );
      case "Connection Error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle size={12} />
            Connection Error
          </span>
        );
      case "Not Connected":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="size-1.5 rounded-full bg-slate-400"></span>
            Not Connected
          </span>
        );
    }
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

            {/* Step Indicator */}
            <div className="flex items-center justify-between pb-1 border-b border-[#e5ddd5]/60">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d2a26] flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#c2a07e]" />
                {isActivated ? "Credentials Configured" : "Step 1: Set Up Password"}
              </span>
              <span className="text-[11px] text-[#9A8B7A] font-semibold">
                {isActivated ? "Step 2: Connect Business Mailbox" : "Step 1 of 2"}
              </span>
            </div>

            {/* Account Activation Form */}
            {!isActivated ? (
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
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
                    Business Email Address
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
                        <span>Verifying & Setting Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Password & Continue</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2 Inline View: Connect Business Mailbox */
              <div className="space-y-4 pt-1">
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-emerald-900">
                      Password Successfully Set
                    </h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your agent account is active. Now connect your business mailbox to sync communications and policy documents.
                    </p>
                  </div>
                </div>

                {/* Mailbox Status Card */}
                <div className="bg-slate-50 border border-[#e5ddd5] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Mailbox Connection Status
                      </span>
                      <p className="text-xs font-bold text-[#2d2a26]">
                        {mailboxEmail || email}
                      </p>
                    </div>
                    {renderStatusBadge(connectionState)}
                  </div>

                  {/* Configuration Warning Notice if OAuth is unconfigured */}
                  {oauthConfigured === false && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle size={15} className="shrink-0 text-amber-700 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">OAuth 2.0 Credentials Not Configured: </span>
                        <span>
                          Microsoft OAuth 2.0 credentials (<code className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">MICROSOFT_CLIENT_ID</code>, <code className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">MICROSOFT_CLIENT_SECRET</code>) are not configured in backend environment variables. Real email connection requires your agency administrator to complete setup.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Connected Success Message */}
                  {connectionState === "Connected" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <span className="font-bold">Connected Mailbox: </span>
                        <span className="font-mono">{mailboxEmail || email}</span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Verified identity confirmed. Outgoing policy certificates and messages will be sent from this authorized mailbox.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Connection Error Message */}
                  {connectionState === "Connection Error" && statusMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    {connectionState !== "Connected" ? (
                      <button
                        type="button"
                        onClick={handleConnectEmail}
                        disabled={connectionState === "Connecting"}
                        className="flex-1 h-11 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
                      >
                        {connectionState === "Connecting" ? (
                          <>
                            <Loader2 className="animate-spin size-4" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Link2 size={15} />
                            {/* EXACT VISIBLE LABEL: Connect Email */}
                            <span>Connect Email</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDisconnectEmail}
                        disabled={disconnecting}
                        className="h-11 px-4 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {disconnecting ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                        <span>Disconnect</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => router.push("/agency/dashboard")}
                      className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsConnectMailOpen(true)}
                    className="text-xs text-[#c2a07e] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Mail size={13} />
                    <span>Open Mailbox Connection Modal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-4 border-t border-[#e5ddd5]/60">
          <p className="text-[10px] text-slate-400">
            Sterling AMS • High-Security Commercial & Personal Insurance Platform
          </p>
        </div>

      </div>

      {/* =========================================================================
          POPUP MODAL: "Connect Business Mailbox" (Task 5: exact Connect Email button)
         ========================================================================= */}
      {isConnectMailOpen && (
        <>
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] transition-opacity duration-200 animate-in fade-in"
            onClick={() => connectionState !== "Connecting" && setIsConnectMailOpen(false)}
          />

          {/* Modal Dialog */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#e5ddd5] rounded-3xl shadow-2xl z-[101] w-[calc(100%-2rem)] max-w-[480px] max-h-[88vh] overflow-y-auto p-5 sm:p-7 flex flex-col select-none animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={() => setIsConnectMailOpen(false)}
              disabled={connectionState === "Connecting"}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center mb-4 text-center">
              <div className="size-10 rounded-2xl bg-[#FDF6F0] border border-[#F5E6D8] text-[#c2a07e] flex items-center justify-center font-bold mb-2 shadow-xs shrink-0">
                <Mail size={20} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#2d2a26]">
                {connectionState === "Connected" ? "Business Mailbox Connected!" : "Connect Business Mailbox"}
              </h3>
              <p className="text-xs text-[#6b5e52] mt-0.5 font-medium max-w-[340px] leading-relaxed">
                {connectionState === "Connected"
                  ? "Your corporate mailbox is securely linked with Sterling AMS. Real-time correspondence and policy certificates are synchronized."
                  : "Connect your official agency business mailbox to send policy quotes, certificates of insurance, and track client correspondence directly."}
              </p>
            </div>

            {/* Target Mailbox & Connection State Row */}
            <div className="bg-slate-50 border border-[#e5ddd5] rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="size-8 rounded-xl bg-[#FDF6F0] text-[#c2a07e] border border-[#F5E6D8] flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Mailbox</p>
                  <p className="text-xs font-bold text-[#2d2a26] truncate font-mono">
                    {mailboxEmail || email || invitationData?.email}
                  </p>
                </div>
              </div>
              {renderStatusBadge(connectionState)}
            </div>

            {/* Configuration Message Notice if unconfigured */}
            {oauthConfigured === false && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <span className="font-bold">OAuth 2.0 Credentials Not Configured</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Microsoft OAuth 2.0 credentials are not configured in backend environment variables (<code className="font-mono bg-amber-100 px-1 py-0.2 rounded">MICROSOFT_CLIENT_ID</code>, <code className="font-mono bg-amber-100 px-1 py-0.2 rounded">MICROSOFT_CLIENT_SECRET</code>).
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                    Live email connection requires credentials. Please notify your agency administrator.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {connectionState === "Connection Error" && statusMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}

            {connectionState !== "Connected" ? (
              <div className="space-y-4">
                {/* Integration Feature Highlights */}
                <div className="space-y-2 bg-[#FDF6F0]/60 border border-[#F5E6D8] rounded-2xl p-3.5 text-xs text-[#6b5e52]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Direct Policy Dispatch:</strong> Send insurance certificates and endorsements directly from your authorized mailbox.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Agency Audit History:</strong> Automatically log email timestamps, recipients, and message IDs in Sterling AMS.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={14} className="text-[#c2a07e] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Secure OAuth 2.0:</strong> Enterprise authorization-code flow with encrypted refresh tokens stored at rest.
                    </span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={connectionState === "Connecting"}
                    onClick={() => setIsConnectMailOpen(false)}
                    className="flex-1 h-11 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    disabled={connectionState === "Connecting"}
                    onClick={handleConnectEmail}
                    className="flex-1 h-11 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {connectionState === "Connecting" ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Link2 size={14} />
                        {/* EXACT VISIBLE LABEL: Connect Email */}
                        <span>Connect Email</span>
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
                    Mailbox Connected Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
                    Verified address: <span className="font-mono font-bold">{mailboxEmail || email}</span>
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    Your business email account is authorized to dispatch quotes and certificates from Sterling AMS.
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
