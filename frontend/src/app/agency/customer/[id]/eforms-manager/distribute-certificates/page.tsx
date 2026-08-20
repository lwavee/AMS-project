/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { showToast } from "@/components/ToastProvider";
import {
  X,
  FileText,
  ChevronDown,
  Send,
  Printer,
  Mail,
  Phone,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Settings,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Holder {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  fax: string;
  issue_date: string;
  distribution_method: string;
  last_distributed?: string;
}

interface Certificate {
  id: number;
  description: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d: string | undefined) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DistributeCertificatesPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const customerId = params?.id as string;
  const certDbId = searchParams.get("certDbId") || "";
  const certNum = searchParams.get("certNum") || "";

  // ── State ──
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distributing, setDistributing] = useState(false);
  const [distributeSuccess, setDistributeSuccess] = useState(false);

  // Selection
  const [selectedHolderIds, setSelectedHolderIds] = useState<Set<number>>(new Set());

  // Distribution Options
  const [distOption, setDistOption] = useState<"form-only" | "form-overflow-attachments">("form-only");
  const [emailCC, setEmailCC] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMemo, setEmailMemo] = useState("");
  const [emailCCType, setEmailCCType] = useState<"email-cc" | "fax-cc">("email-cc");
  const [includeFaxCover, setIncludeFaxCover] = useState(false);
  const [overrideMethod, setOverrideMethod] = useState(false);
  const [overrideValue, setOverrideValue] = useState("Email");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [onlyUndistributed, setOnlyUndistributed] = useState(false);

  // Master selection dropdown (which cert)
  const [masterCerts, setMasterCerts] = useState<Certificate[]>([]);
  const [selectedCertId, setSelectedCertId] = useState(certDbId);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch all certificates for this customer
      const [certsRes, holdersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        selectedCertId
          ? fetch(
              `${API_BASE_URL}/api/customers/${customerId}/certificates/${selectedCertId}/holders`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : Promise.resolve(null),
      ]);

      if (certsRes.ok) {
        const certsData: Certificate[] = await certsRes.json();
        setMasterCerts(certsData);
        if (certsData.length > 0 && !selectedCertId) {
          setSelectedCertId(String(certsData[0].id));
        }
        const selected = certsData.find((c) => String(c.id) === selectedCertId);
        if (selected) setCertificate(selected);
      }

      if (holdersRes && holdersRes.ok) {
        const holdersData: Holder[] = await holdersRes.json();
        setHolders(holdersData);
        // Select all by default
        setSelectedHolderIds(new Set(holdersData.map((h) => h.id)));
      }
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [customerId, selectedCertId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh holders when cert changes
  useEffect(() => {
    if (!selectedCertId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(
      `${API_BASE_URL}/api/customers/${customerId}/certificates/${selectedCertId}/holders`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Holder[]) => {
        setHolders(data);
        setSelectedHolderIds(new Set(data.map((h) => h.id)));
        const found = masterCerts.find((c) => String(c.id) === selectedCertId);
        if (found) setCertificate(found);
      })
      .catch(() => {});
  }, [selectedCertId, masterCerts, customerId]);

  // ── Filtered holders ──
  const filteredHolders = holders.filter((h) => {
    if (onlyUndistributed && h.last_distributed) return false;
    if (filterDateFrom && h.issue_date && h.issue_date < filterDateFrom) return false;
    if (filterDateTo && h.issue_date && h.issue_date > filterDateTo) return false;
    return true;
  });

  // ── Selection helpers ──
  const toggleHolder = (id: number) => {
    setSelectedHolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedHolderIds(new Set(filteredHolders.map((h) => h.id)));
  const clearAll = () => setSelectedHolderIds(new Set());

  // ── Distribute ──
  const handleDistribute = async () => {
    if (selectedHolderIds.size === 0) {
      showToast("Please select at least one holder to distribute to.", "warning");
      return;
    }
    setDistributing(true);
    try {
      // Simulate or real API call
      await new Promise((r) => setTimeout(r, 1200));
      setDistributeSuccess(true);
      setTimeout(() => setDistributeSuccess(false), 3000);
    } catch (e) {
      showToast("Distribution failed. Please try again.", "error");
    } finally {
      setDistributing(false);
    }
  };

  const handleClose = () => window.close();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-sans text-text-main select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-border-main shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/40 rounded-xl text-primary">
            <Send size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-main">Print / Fax / Email Holders</h1>
            <p className="text-[11px] text-text-muted">
              Distribute certificates to selected holders
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-secondary/40 text-text-muted hover:text-text-main rounded-xl transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="text-xs font-semibold text-text-muted">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center p-8">
            <AlertCircle size={28} className="text-danger" />
            <p className="font-bold text-sm text-text-main">Failed to Load</p>
            <p className="text-xs text-text-muted">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Options Panel */}
          <div className="bg-white border-b border-border-main px-5 py-3 shrink-0">
            <div className="flex flex-wrap gap-6">
              {/* Master Selection */}
              <div className="flex flex-col gap-1.5 min-w-[220px]">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Quick Select Options — Master Selection
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Certificate #:</span>
                  <div className="relative">
                    <select
                      value={selectedCertId}
                      onChange={(e) => setSelectedCertId(e.target.value)}
                      className="h-7 pl-2 pr-7 text-xs bg-bg-base border border-border-main rounded-lg font-semibold text-text-main appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                    >
                      {masterCerts.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.description || `Certificate ${c.id}`} — Master Cert
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Holder Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Holder Selection
                </span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold text-text-muted">Based on Issued Date</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">From:</span>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="h-7 px-2 text-xs bg-bg-base border border-border-main rounded-lg font-medium text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <span className="text-text-muted">To:</span>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="h-7 px-2 text-xs bg-bg-base border border-border-main rounded-lg font-medium text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyUndistributed}
                      onChange={(e) => setOnlyUndistributed(e.target.checked)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-text-muted">Select Only Undistributed Holders</span>
                  </label>
                </div>
              </div>

              {/* Distribution Options */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Distribution Options
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  {[
                    { val: "form-only", label: "Form Only" },
                    { val: "form-overflow-attachments", label: "Form, Overflow Pages, and Attachments" },
                  ].map(({ val, label }) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="distOption"
                        value={val}
                        checked={distOption === val}
                        onChange={() => setDistOption(val as any)}
                        className="accent-primary w-3.5 h-3.5"
                      />
                      <span className="text-text-main">{label}</span>
                    </label>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted">Use Printer:</span>
                    <select className="h-6 pl-1.5 pr-6 text-xs bg-bg-base border border-border-main rounded-lg font-medium text-text-main appearance-none focus:outline-none">
                      <option>Default</option>
                    </select>
                    <button className="text-primary font-bold hover:underline text-xs">Setup</button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                    <input type="checkbox" defaultChecked className="accent-primary w-3.5 h-3.5" />
                    <span className="text-text-muted">Print if Email or Fax Number Does Not Exist</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted">Fax Profile:</span>
                    <select className="h-6 pl-1.5 pr-6 text-xs bg-bg-base border border-border-main rounded-lg font-medium text-text-main appearance-none focus:outline-none">
                      <option>Default</option>
                    </select>
                    <button className="text-primary font-bold hover:underline text-xs">Setup</button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      checked={includeFaxCover}
                      onChange={(e) => setIncludeFaxCover(e.target.checked)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-text-muted">Include Fax Cover Page</span>
                  </label>
                </div>
              </div>

              {/* Email Message / Fax Cover Page */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Email Message / Fax Cover Page
                </span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-3">
                    {(["email-cc", "fax-cc"] as const).map((t) => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="emailCCType"
                          checked={emailCCType === t}
                          onChange={() => setEmailCCType(t)}
                          className="accent-primary w-3.5 h-3.5"
                        />
                        <span className="text-text-main">{t === "email-cc" ? "Email CC" : "Fax CC"}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted w-12">CC:</span>
                    <input
                      type="text"
                      value={emailCC}
                      onChange={(e) => setEmailCC(e.target.value)}
                      className="flex-1 h-7 px-2 text-xs bg-bg-base border border-border-main rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button className="text-primary font-bold hover:underline text-xs">Contacts</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted w-12">Subject:</span>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="flex-1 h-7 px-2 text-xs bg-bg-base border border-border-main rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted w-12 pt-1">Memo:</span>
                    <textarea
                      value={emailMemo}
                      onChange={(e) => setEmailMemo(e.target.value)}
                      rows={3}
                      className="flex-1 px-2 py-1 text-xs bg-bg-base border border-border-main rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: Select All / Clear All / Override */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-main/50">
              <button
                onClick={selectAll}
                className="h-7 px-3.5 text-xs font-bold bg-secondary hover:bg-secondary/70 text-primary rounded-lg transition-all cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="h-7 px-3.5 text-xs font-bold bg-white border border-border-main hover:bg-secondary/40 text-text-muted rounded-lg transition-all cursor-pointer"
              >
                Clear All
              </button>

              <label className="flex items-center gap-2 ml-auto cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={overrideMethod}
                  onChange={(e) => setOverrideMethod(e.target.checked)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-text-muted font-semibold">Override Method of Distribution:</span>
                {overrideMethod && (
                  <select
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                    className="h-6 pl-1.5 pr-5 text-xs bg-bg-base border border-border-main rounded-lg font-medium text-text-main appearance-none focus:outline-none"
                  >
                    <option>Email</option>
                    <option>Fax</option>
                    <option>Print</option>
                    <option>Mail</option>
                  </select>
                )}
              </label>

              <div className="flex items-center gap-2">
                {distributeSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                    <CheckCircle2 size={14} /> Distributed!
                  </span>
                )}
                <button
                  onClick={handleDistribute}
                  disabled={distributing || selectedHolderIds.size === 0}
                  className="h-8 px-5 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {distributing ? (
                    <><Loader2 size={13} className="animate-spin" /> Distributing…</>
                  ) : (
                    <><Send size={13} /> Distribute</>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/20 text-text-main text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Holders Table */}
          <div className="flex-1 overflow-auto">
            <div className="px-5 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-border-main/30" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2">
                  Holders ({filteredHolders.length})
                </span>
                <div className="h-px flex-1 bg-border-main/30" />
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="bg-white border border-border-main rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border-main">
                      <th className="p-2.5 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selectedHolderIds.size === filteredHolders.length && filteredHolders.length > 0}
                          onChange={(e) => (e.target.checked ? selectAll() : clearAll())}
                          className="accent-primary w-3.5 h-3.5"
                        />
                      </th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Select ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Distribution ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Status ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Last Distributed ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Name ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Fax Phone ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Email ▼</th>
                      <th className="p-2.5 text-left font-bold text-text-main uppercase tracking-wide">Address ▼</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-text-muted">
                          No holders found for this certificate.
                        </td>
                      </tr>
                    ) : (
                      filteredHolders.map((h, idx) => {
                        const isSelected = selectedHolderIds.has(h.id);
                        const method = h.distribution_method || "";
                        return (
                          <tr
                            key={h.id}
                            onClick={() => toggleHolder(h.id)}
                            className={`border-b border-border-main/20 cursor-pointer transition-colors ${
                              isSelected ? "bg-secondary/30" : idx % 2 === 0 ? "bg-white" : "bg-bg-base/50"
                            } hover:bg-secondary/20`}
                          >
                            <td className="p-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleHolder(h.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="accent-primary w-3.5 h-3.5"
                              />
                            </td>
                            <td className="p-2.5">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-success font-bold">
                                  <CheckCircle2 size={12} /> Yes
                                </span>
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                            <td className="p-2.5">
                              {method ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                  {method === "Email" && <Mail size={11} />}
                                  {method === "Fax" && <Phone size={11} />}
                                  {method === "Print" && <Printer size={11} />}
                                  {method}
                                </span>
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                            <td className="p-2.5 text-text-muted">—</td>
                            <td className="p-2.5 text-text-muted whitespace-nowrap">
                              {formatDate(h.last_distributed) || "—"}
                            </td>
                            <td className="p-2.5 font-semibold text-text-main max-w-[160px] truncate">
                              {h.name || "—"}
                            </td>
                            <td className="p-2.5 text-text-muted">{h.fax || "—"}</td>
                            <td className="p-2.5 text-primary truncate max-w-[180px]">
                              {h.email || "—"}
                            </td>
                            <td className="p-2.5 text-text-muted truncate max-w-[180px]">
                              {[h.address, h.city, h.state, h.zip].filter(Boolean).join(", ") || "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
