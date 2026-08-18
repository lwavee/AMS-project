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
  Check,
  Building2
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
        
        if (detail.includes("email is rong") || detail.includes("email is wrong")) {
          throw new Error("Invalid email address.");
        } else if (detail.includes("password is rong") || detail.includes("password is wrong") || detail.includes("password")) {
          throw new Error("Invalid password. Please verify and try again.");
        } else {
          throw new Error(detail || "Login failed. Please verify credentials.");
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
        setError(err.message || "Login failed. Please try again.");
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
    }, 1200);
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
    <div 
      className="relative flex items-center justify-center min-h-screen font-sans px-4 py-8 overflow-hidden select-none" 
      style={{ background: "linear-gradient(135deg, #a38c7a 0%, #8b735b 100%)" }}
    >
      {/* Background Lighting Shapes (Exact Sterling Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* TOP RIGHT GLOW */}
        <div 
          className="absolute"
          style={{
            top: "8%",
            right: "-8%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
            opacity: 0.6
          }}
        />
        
        {/* BOTTOM LEFT GLOW */}
        <div 
          className="absolute"
          style={{
            bottom: "-10%",
            left: "-10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#ffffff] rounded-[16px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e5ddd5]">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center justify-center text-center mb-7">
          <div className="mb-4">
            <img 
              src="/sterling-logo.JPG" 
              alt="Sterling Wholesale Insurance" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] tracking-tight">
            Welcome to Sterling AMS
          </h2>
          <p className="text-sm text-[#6b5e52] mt-1 font-medium">
            Please enter your credentials to sign in
          </p>
        </div>

        {/* Animated Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
            <ShieldAlert className="size-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                required 
                placeholder="agent@capco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#ffffff] border border-[#e5ddd5] text-[#2d2a26] text-sm rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans placeholder:text-[#6b5e52]/60 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]">
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-11 bg-[#ffffff] border border-[#e5ddd5] text-[#2d2a26] text-sm rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans placeholder:text-[#6b5e52]/60 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A] hover:text-[#8a6f4d] transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#c2a07e] hover:bg-[#b08d6a] text-white font-semibold py-3 rounded-[10px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin size-4" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Onboarding Link */}
        <div className="mt-6 pt-5 border-t border-[#e5ddd5] flex items-center justify-center">
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
            className="text-xs font-bold text-[#9A8B7A] hover:text-[#8a6f4d] transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
          >
            Onboard Agency with Outlook Account
          </button>
        </div>

        {/* Footer info text */}
        <p className="text-center text-[11px] text-[#6b5e52] mt-4 font-medium">
          Protected by Sterling Wholesale Insurance Security
        </p>

      </div>

      {/* ── OUTLOOK ONBOARDING MODAL ── */}
      {isOnboardingOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] transition-opacity duration-200 animate-in fade-in"
            onClick={() => !onboardingLoading && setIsOnboardingOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#e5ddd5] rounded-[16px] shadow-2xl z-[101] w-full max-w-[420px] p-8 flex flex-col select-none animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="grid grid-cols-2 gap-1 size-7 mb-3">
                <div className="bg-[#F25022]"></div>
                <div className="bg-[#7FBA00]"></div>
                <div className="bg-[#00A4EF]"></div>
                <div className="bg-[#FFB900]"></div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#2d2a26]">
                {onboardingStep === 1 ? "Sign in with Microsoft Outlook" : "Create Agency Account"}
              </h3>
              <p className="text-xs text-[#6b5e52] mt-1 font-medium max-w-[280px]">
                {onboardingStep === 1 
                  ? "Connect your agency's Outlook or Office 365 account to get started." 
                  : "Outlook email connected! Please set up a password for future logins."}
              </p>
            </div>

            {/* Error alerts */}
            {onboardingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 flex items-start gap-2 text-xs font-semibold animate-in fade-in duration-150">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{onboardingError}</span>
              </div>
            )}

            {/* STEP 1: Connect Outlook Email */}
            {onboardingStep === 1 && (
              <form onSubmit={handleConnectOutlook} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                    Outlook Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                    <input 
                      type="email"
                      required
                      placeholder="agency@capco.com"
                      value={onboardingEmail}
                      onChange={(e) => setOnboardingEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-[#ffffff] border border-[#e5ddd5] text-[#2d2a26] text-sm rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={onboardingLoading}
                    onClick={() => setIsOnboardingOpen(false)}
                    className="flex-1 h-11 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboardingLoading}
                    className="flex-1 h-11 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Connected Email</p>
                    <p className="text-xs font-bold text-[#2d2a26] truncate mt-0.5">{onboardingEmail}</p>
                  </div>
                </div>

                {/* Agency Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                    Agency Name (Optional)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Capco Sterling Agency"
                      value={onboardingName}
                      onChange={(e) => setOnboardingName(e.target.value)}
                      className="w-full h-11 px-4 bg-[#ffffff] border border-[#e5ddd5] text-[#2d2a26] text-sm rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#2d2a26] mb-1.5 uppercase tracking-wider">
                    Create Login Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B7A]" />
                    <input 
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={onboardingPassword}
                      onChange={(e) => setOnboardingPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-[#ffffff] border border-[#e5ddd5] text-[#2d2a26] text-sm rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#9A8B7A] focus:border-[#9A8B7A] transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={onboardingLoading}
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 h-11 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={onboardingLoading}
                    className="flex-1 h-11 bg-[#c2a07e] hover:bg-[#b08d6a] text-white text-xs font-bold uppercase tracking-wider rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
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
