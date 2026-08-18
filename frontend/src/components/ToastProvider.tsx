"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X, ShieldCheck, Trash2, HelpCircle } from "lucide-react";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

export interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "danger" | "primary";
  resolve?: (val: boolean) => void;
}

export function showToast(message: string, type: "success" | "error" | "info" | "warning" = "success") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sterling-toast", {
        detail: { message, type },
      })
    );
  }
}

export function confirmDialog(
  message: string,
  title = "Confirmation",
  confirmText?: string,
  variant?: "danger" | "primary"
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sterling-confirm", {
          detail: { message, title, confirmText, variant, resolve },
        })
      );
    } else {
      resolve(false);
    }
  });
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  });

  const addToast = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, timestamp: Date.now() };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Override native alert calls
      window.alert = (msg?: any) => {
        const text = String(msg || "");
        const isError =
          text.toLowerCase().includes("error") ||
          text.toLowerCase().includes("fail") ||
          text.toLowerCase().includes("invalid");
        addToast(text, isError ? "error" : "success");
      };

      const handleToastEvent = (e: Event) => {
        const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" | "info" | "warning" }>;
        if (customEvent.detail && customEvent.detail.message) {
          addToast(customEvent.detail.message, customEvent.detail.type || "success");
        }
      };

      const handleConfirmEvent = (e: Event) => {
        const customEvent = e as CustomEvent<{
          message: string;
          title: string;
          confirmText?: string;
          variant?: "danger" | "primary";
          resolve: (val: boolean) => void;
        }>;
        if (customEvent.detail) {
          const isDelete =
            (customEvent.detail.title || "").toLowerCase().includes("delete") ||
            (customEvent.detail.title || "").toLowerCase().includes("remove") ||
            (customEvent.detail.message || "").toLowerCase().includes("delete");

          setConfirmState({
            open: true,
            title: customEvent.detail.title || "Confirm Action",
            message: customEvent.detail.message,
            confirmText: customEvent.detail.confirmText || (isDelete ? "Delete" : "Confirm"),
            variant: customEvent.detail.variant || (isDelete ? "danger" : "primary"),
            resolve: customEvent.detail.resolve,
          });
        }
      };

      window.addEventListener("sterling-toast", handleToastEvent);
      window.addEventListener("sterling-confirm", handleConfirmEvent);
      return () => {
        window.removeEventListener("sterling-toast", handleToastEvent);
        window.removeEventListener("sterling-confirm", handleConfirmEvent);
      };
    }
  }, [addToast]);

  const handleConfirmChoice = (choice: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(choice);
    }
    setConfirmState({ open: false, title: "", message: "" });
  };

  const isDanger = confirmState.variant === "danger";

  return (
    <>
      {/* ── 1. Floating Toast Banners ── */}
      {toasts.length > 0 && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-2.5 max-w-md w-[92vw] pointer-events-none select-none">
          {toasts.map((toast) => {
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            return (
              <div
                key={toast.id}
                className={`
                  pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md
                  transition-all duration-300 ease-out transform animate-in fade-in slide-in-from-top-4
                  ${
                    isError
                      ? "bg-red-900/90 text-white border-red-700/50 shadow-red-950/20"
                      : isWarning
                      ? "bg-amber-900/90 text-white border-amber-700/50 shadow-amber-950/20"
                      : "bg-[#2d2a26]/95 text-[#faf8f5] border-[#9A8B7A]/40 shadow-black/25"
                  }
                `}
              >
                <div className="shrink-0 mt-0.5">
                  {isError ? (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-400/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
                    </div>
                  ) : isWarning ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                      <Info className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#9A8B7A]/30 flex items-center justify-center border border-[#bfa27a]/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#bfa27a]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#bfa27a] mb-0.5">
                    {isError ? "System Notice" : "Sterling AMS"}
                  </p>
                  <p className="text-xs font-semibold leading-snug break-words">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. Modern Confirmation Modal Dialog ── */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[9999999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-white border border-[#e5ddd5] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isDanger
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                {isDanger ? <Trash2 className="size-5" /> : <HelpCircle className="size-5" />}
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-base text-[#2d2a26] leading-tight">
                  {confirmState.title || "Confirm Action"}
                </h3>
                <span className="text-[10px] font-extrabold text-[#9A8B7A] uppercase tracking-widest mt-0.5">
                  Sterling AMS Action
                </span>
              </div>
            </div>

            {/* Message Content */}
            <p className="text-xs font-semibold text-slate-600 leading-relaxed pl-1">
              {confirmState.message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmChoice(false)}
                className="h-9 px-5 bg-white border border-[#e5ddd5] text-[#2d2a26] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmChoice(true)}
                className={`h-9 px-6 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer border-none ${
                  isDanger
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                    : "bg-[#2d2a26] hover:bg-[#1a1816] shadow-black/20"
                }`}
              >
                {confirmState.confirmText || (isDanger ? "Delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
