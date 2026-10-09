/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { showToast } from "@/components/ToastProvider";
import {
  SquarePen,
  ArrowLeft,
  Bell,
  Calculator,
  FileText,
  XCircle,
  Shield,
  Plus,
  MessageSquare,
  Filter,
  ChevronDown,
  List,
  ListOrdered,
  Link2
} from "lucide-react";

export default function CustomerNotesPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteFilters, setNoteFilters] = useState<string[]>(["Underwriter"]);

  const toggleNoteFilter = (filter: string) => {
    setNoteFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch Customer ──
  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    }
  }, [customerId]);

  // ── Fetch Notes ──
  const loadNotes = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((n: any) => ({
          id: n.id,
          text: n.text,
          author: n.author_name || "Agency Staff",
          role: n.author_role || "Agent",
          created_at: n.created_at ? new Date(n.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"
        }));
        setNotes(formatted);
      }
    } catch (e) {
      console.error("Error loading notes", e);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    loadNotes();
  }, [fetchCustomer, loadNotes]);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setNoteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newNoteText,
          notify: noteFilters.join(", ")
        })
      });

      if (res.ok) {
        showToast("Note added successfully", "success");
        setNewNoteText("");
        loadNotes();
      } else {
        showToast("Failed to add note", "error");
      }
    } catch (e) {
      console.error("Error adding note", e);
      showToast("Error adding note", "error");
    } finally {
      setNoteLoading(false);
    }
  };

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
        customer?.company_name ||
        "Customer";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2d2a26] pb-16 font-sans">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/agency/customer/${customerId}`)}
              className="h-9 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EDE5] text-[#9A8B7A] border border-[#e5ddd5] flex items-center gap-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Profile</span>
            </button>
            <div className="h-5 w-px bg-[#e5ddd5]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8c827a]">
                Customer:
              </span>
              <span className="text-sm font-extrabold text-[#1f1d1a]">
                {customerName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#9A8B7A] border border-[#e5ddd5]">
                ID: {customerId}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 60% – ADD NOTE */}
            <div className="lg:col-span-7 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3.5 pb-1 border-b border-[#f0ece6] pb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0 border border-[#F3E8FF] shadow-2xs">
                  <SquarePen size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-[#1f1d1a]">
                    Customer Notes & Logs ({notes.length})
                  </h1>
                  <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                    Add internal notes and mentions to keep track of customer communication
                  </p>
                </div>
              </div>

              {/* Notify Filters Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-[#2d2a26] mr-1">Notify:</span>
                {[
                  { label: "Underwriter", icon: <Bell size={13} /> },
                  { label: "Accounting", icon: <Calculator size={13} /> },
                  { label: "Endorsements", icon: <FileText size={13} /> },
                  { label: "Cancellations", icon: <XCircle size={13} /> },
                  { label: "Audits", icon: <Shield size={13} /> },
                ].map((item) => {
                  const isSelected = noteFilters.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => toggleNoteFilter(item.label)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? "bg-[#9A8B7A] text-white shadow-xs"
                          : "bg-white border border-[#e5ddd5] hover:bg-[#FAF8F5] text-[#2d2a26]"
                      }`}
                    >
                      {React.cloneElement(item.icon, {
                        className: isSelected ? "text-white" : "text-[#6b5e52]",
                      })}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Rich Editor Box */}
              <div className="border border-[#e5ddd5] rounded-2xl bg-white overflow-hidden shadow-2xs focus-within:border-[#9A8B7A] focus-within:ring-2 focus-within:ring-[#9A8B7A]/20 transition-all">
                <textarea
                  rows={5}
                  className="w-full p-4 text-xs text-[#1f1d1a] placeholder:text-[#8c827a] resize-none outline-none border-none bg-transparent font-medium"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Write your customer note here..."
                  maxLength={1000}
                />

                {/* Toolbar */}
                <div className="border-t border-[#f0e9df] px-3.5 py-2 flex items-center justify-between bg-[#FAF8F5]/60">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => prev ? `**${prev}**` : "**bold text**")}
                      className="h-6 w-6 flex items-center justify-center text-xs font-extrabold text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => prev ? `*${prev}*` : "*italic text*")}
                      className="h-6 w-6 flex items-center justify-center text-xs font-serif italic text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => prev ? `<u>${prev}</u>` : "<u>underline</u>")}
                      className="h-6 w-6 flex items-center justify-center text-xs underline text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Underline"
                    >
                      U
                    </button>
                    <div className="h-3.5 w-px bg-[#e5ddd5] mx-1" />
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => `${prev}\n• `)}
                      className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Bullet list"
                    >
                      <List size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => `${prev}\n1. `)}
                      className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Numbered list"
                    >
                      <ListOrdered size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteText((prev) => `${prev} [link](url)`)}
                      className="h-6 w-6 flex items-center justify-center text-[#6b5e52] hover:text-[#2d2a26] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Add link"
                    >
                      <Link2 size={13} />
                    </button>
                  </div>

                  <span className="text-[11px] font-medium text-[#8c827a]">
                    {newNoteText.length}/1000
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={noteLoading || !newNoteText.trim()}
                  className="h-9 px-5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  {noteLoading ? "Saving..." : "Add Note"}
                </button>
              </div>
            </div>

            {/* RIGHT 40% – NOTES THREAD */}
            <div className="lg:col-span-5 bg-[#FAF8F5]/60 border border-[#e5ddd5] rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ddd5]/60">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-white border border-[#e5ddd5] text-[#9A8B7A] flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1f1d1a]">
                      Notes Thread
                    </h3>
                    <p className="text-[11px] text-[#6b5e52] font-medium">
                      All notes and conversations for this customer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-white border border-[#e5ddd5] hover:bg-[#FAF8F5] text-[#2d2a26] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Filter size={12} className="text-[#6b5e52]" />
                  <span>All Notes</span>
                  <ChevronDown size={12} className="text-[#6b5e52]" />
                </button>
              </div>

              {/* Body: Empty State or Notes List */}
              <div className="flex-1 flex flex-col justify-center py-6">
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center my-auto">
                    <div className="relative w-36 h-20 mb-3 flex items-center justify-center">
                      <div className="absolute left-3 top-3 w-16 h-13 bg-white border border-[#e5ddd5] rounded-xl shadow-2xs -rotate-12 flex flex-col p-2 justify-center gap-1 opacity-70">
                        <div className="h-1.5 w-8 bg-[#e5ddd5] rounded-full" />
                        <div className="h-1.5 w-10 bg-[#f0e9df] rounded-full" />
                      </div>
                      <div className="absolute right-3 top-3 w-16 h-13 bg-white border border-[#e5ddd5] rounded-xl shadow-2xs rotate-12 flex flex-col p-2 justify-center gap-1 opacity-70">
                        <div className="h-1.5 w-10 bg-[#e5ddd5] rounded-full" />
                        <div className="h-1.5 w-6 bg-[#f0e9df] rounded-full" />
                      </div>
                      <div className="relative z-10 w-20 h-16 bg-[#F5EDE5] border border-[#d8c8ba] rounded-2xl shadow-xs flex flex-col items-center justify-center p-2.5 gap-1.5">
                        <div className="h-1.5 w-10 bg-[#9A8B7A]/60 rounded-full" />
                        <div className="h-1.5 w-12 bg-[#9A8B7A]/80 rounded-full" />
                        <div className="h-1.5 w-7 bg-[#9A8B7A]/60 rounded-full" />
                      </div>
                      <div className="absolute top-0 right-6 text-[#9A8B7A] font-bold text-xs">
                        ✦
                      </div>
                    </div>

                    <p className="font-extrabold text-sm text-[#1f1d1a]">
                      No notes added yet
                    </p>
                    <p className="text-xs text-[#8c827a] mt-0.5 font-medium max-w-xs">
                      Drop in questions or comments to keep record.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white border border-[#e5ddd5] rounded-2xl p-3.5 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#6b5e52]">
                          <span className="font-bold uppercase text-[#9A8B7A]">
                            {n.author || "Agent"} ({n.role || "staff"})
                          </span>
                          <span className="font-medium text-[#8c827a]">
                            {n.created_at || "Recent"}
                          </span>
                        </div>
                        <p className="text-xs text-[#2d2a26] font-medium whitespace-pre-wrap leading-relaxed">
                          {n.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
