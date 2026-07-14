/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Lock, 
  Mail, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Onboarding (Register with Outlook) State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1 = Microsoft email input, 2 = Set password
  const [onboardingEmail, setOnboardingEmail] = useState("");
  const [onboardingPassword, setOnboardingPassword] = useState("");
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");


  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/agency/dashboard");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData.detail || "";
        
        // Map the backend error detail or handle it
        if (detail.includes("email is rong") || detail.includes("email is wrong")) {
          throw new Error("email is wrong");
        } else if (detail.includes("password is rong") || detail.includes("password is wrong") || detail.includes("password")) {
          throw new Error("your password is wrong");
        } else {
          throw new Error(detail || "Login failed");
        }
      }

      const data = await response.json();
      
      // Store token and role
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/agency/dashboard");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Make sure the backend server is running on port 8000.");
      } else {
        const msg = err.message || "";
        if (msg.toLowerCase().includes("email is rong") || msg.toLowerCase().includes("email is wrong")) {
          setError("email is wrong");
        } else if (msg.toLowerCase().includes("password is rong") || msg.toLowerCase().includes("password is wrong") || msg.toLowerCase().includes("password")) {
          setError("your password is wrong");
        } else {
          setError(msg || "Login failed. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectOutlook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingEmail.includes("@")) {
      setOnboardingError("Please enter a valid Outlook or corporate email address.");
      return;
    }
    setOnboardingLoading(true);
    setOnboardingError("");
    
    // Simulate secure Microsoft OAuth connection delay
    setTimeout(() => {
      setOnboardingLoading(false);
      setOnboardingStep(2);
    }, 1500);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingPassword || onboardingPassword.length < 6) {
      setOnboardingError("Password must be at least 6 characters long.");
      return;
    }

    setOnboardingLoading(true);
    setOnboardingError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register-outlook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: onboardingEmail.trim(),
          password: onboardingPassword,
          name: onboardingName.trim() || null
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to complete onboarding");
      }

      const data = await response.json();

      // Successfully onboarded & logged in!
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      // Redirect to agency dashboard
      router.push("/agency/dashboard");
      setIsOnboardingOpen(false);
    } catch (err: any) {
      setOnboardingError(err.message || "Something went wrong. Please try again.");
    } finally {
      setOnboardingLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-base relative overflow-hidden font-sans">
      
      {/* Decorative Premium Grid Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#E5E5E5_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
      
      {/* Soft Glow Background Accents */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>

      <div className="w-full max-w-[420px] mx-4">
        
        {/* Main Glassmorphic Login Card */}
        <div className="bg-white border border-border-main rounded-2xl shadow-xl shadow-slate-100 p-8 md:p-10 relative overflow-hidden">
          
          {/* Top Decorative Branding Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-3.5">
              <span className="text-white font-bold text-2xl tracking-wider font-sans">S</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main font-sans">
              Sterling
            </h1>
            <p className="text-xs tracking-widest text-primary font-bold uppercase mt-1">
              Insurance Services
            </p>
            <h2 className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">
              System Authentication
            </h2>
          </div>
          
          {/* Animated Error Alerts */}
          {error && (
            <div className="bg-danger/5 border border-danger/20 text-danger rounded-xl p-3.5 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <ShieldAlert className="size-5 text-danger shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-danger/80">
                  Authentication Failed
                </p>
                <p className="text-xs font-bold text-danger mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Address Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  required 
                  placeholder="agent@capco.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-secondary/35 border border-border-main text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-sans placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 bg-secondary/35 border border-border-main text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-sans placeholder:text-slate-400 font-medium"
                />
                
                {/* Show/Hide Password Option */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/10 hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Onboarding trigger link */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setIsOnboardingOpen(true);
                setOnboardingStep(1);
                setOnboardingEmail("");
                setOnboardingPassword("");
                setOnboardingName("");
                setOnboardingError("");
              }}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
            >
              Onboard Agency with Outlook Account
            </button>
          </div>

        </div>

        {/* Footer info text */}
        <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">
          Sterling Insurance Portal is protected by secure authentication.
        </p>

      </div>

      {/* ── OUTLOOK ONBOARDING MODAL ── */}
      {isOnboardingOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-[100] transition-opacity duration-300 animate-in fade-in"
            onClick={() => !onboardingLoading && setIsOnboardingOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-border-main rounded-2xl shadow-2xl z-[101] w-full max-w-[420px] p-8 flex flex-col select-none animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              {/* Simulated Microsoft Grid Logo */}
              <div className="grid grid-cols-2 gap-1 size-8 mb-4">
                <div className="bg-[#F25022]"></div>
                <div className="bg-[#7FBA00]"></div>
                <div className="bg-[#00A4EF]"></div>
                <div className="bg-[#FFB900]"></div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-text-main">
                {onboardingStep === 1 ? "Sign in with Microsoft Outlook" : "Create Agency Account"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium max-w-[280px]">
                {onboardingStep === 1 
                  ? "Connect your agency's Microsoft Outlook or Office 365 account to get started." 
                  : "Outlook email connected! Please set up a password for future logins."}
              </p>
            </div>

            {/* Error alerts */}
            {onboardingError && (
              <div className="bg-danger/5 border border-danger/20 text-danger rounded-xl p-3 mb-4 flex items-start gap-2 text-xs font-semibold animate-in fade-in duration-150">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{onboardingError}</span>
              </div>
            )}

            {/* STEP 1: Connect Outlook Email */}
            {onboardingStep === 1 && (
              <form onSubmit={handleConnectOutlook} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Outlook Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email"
                      required
                      placeholder="agency@capco.com"
                      value={onboardingEmail}
                      onChange={(e) => setOnboardingEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-secondary/35 border border-border-main text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={onboardingLoading}
                    onClick={() => setIsOnboardingOpen(false)}
                    className="flex-1 h-11 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboardingLoading}
                    className="flex-1 h-11 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {onboardingLoading ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect Account</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Password and Name Setup */}
            {onboardingStep === 2 && (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                {/* Display connected email read-only */}
                <div className="bg-success/5 border border-success/15 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="size-6 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-success/80">Connected Email</p>
                    <p className="text-xs font-bold text-text-main truncate mt-0.5">{onboardingEmail}</p>
                  </div>
                </div>

                {/* Agency Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Agency Name (Optional)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Capco Sterling Agency"
                      value={onboardingName}
                      onChange={(e) => setOnboardingName(e.target.value)}
                      className="w-full h-11 px-4 bg-secondary/35 border border-border-main text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Create Login Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={onboardingPassword}
                      onChange={(e) => setOnboardingPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-secondary/35 border border-border-main text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={onboardingLoading}
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 h-11 border border-border-main bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={onboardingLoading}
                    className="flex-1 h-11 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {onboardingLoading ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Complete Account</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </>
      )}

    </div>
  );
}

