/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
  Users,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Send
} from "lucide-react";

export default function CustomerContactInfoPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
        customer?.company_name ||
        "Customer";

  const displayEmail =
    customer?.email ||
    (customer?.first_name && customer?.last_name
      ? `${customer.first_name.toLowerCase()}.${customer.last_name.toLowerCase()}@client.com`
      : "info@business.com");

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/agency/new-customer?edit=${customerId}`)}
              className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={14} className="stroke-[2.5]" />
              Edit Customer Profile
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#f0ece6]">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5] shadow-2xs">
                <Users size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#1f1d1a]">
                  Contact & Profile Information
                </h1>
                <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                  Complete customer address, communication channels, and account details
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/agency/new-customer?edit=${customerId}`)}
              className="h-9 px-4 bg-white border border-[#e5ddd5] hover:bg-[#f5f1eb] text-[#2d2a26] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 size={14} className="text-[#6b5e52]" />
              Edit Details
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* General Info Card */}
            <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#e5ddd5] shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#e5ddd5] pb-2.5">
                <Building2 size={16} className="text-[#9A8B7A]" />
                <h2 className="font-bold text-[#9A8B7A] uppercase text-[11px] tracking-wider">
                  General Information
                </h2>
              </div>
              <div className="space-y-2.5 text-[#2d2a26]">
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Customer Name</span> <strong className="text-sm font-extrabold">{customerName}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Customer Type</span> <strong className="font-bold">{customer?.customer_type || "Commercial Customer"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Business Type</span> <strong className="font-bold">{customer?.type || "Commercial"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Agency Division</span> <strong className="font-bold">{customer?.division || "Sterling Wholesale Insurance"}</strong></p>
              </div>
            </div>

            {/* Phone & Contact Card */}
            <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#e5ddd5] shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#e5ddd5] pb-2.5">
                <Phone size={16} className="text-[#9A8B7A]" />
                <h2 className="font-bold text-[#9A8B7A] uppercase text-[11px] tracking-wider">
                  Phone & Contact
                </h2>
              </div>
              <div className="space-y-2.5 text-[#2d2a26]">
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Primary Phone</span> <strong className="font-bold">{customer?.phone || "—"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Business Phone</span> <strong className="font-bold">{customer?.phone_business || "—"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Email Address</span> <strong className="font-bold text-blue-600 hover:underline"><a href={`mailto:${displayEmail}`}>{displayEmail}</a></strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Website</span> <strong className="font-bold">{customer?.web || "—"}</strong></p>
              </div>
            </div>

            {/* Address & Settings Card */}
            <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#e5ddd5] shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#e5ddd5] pb-2.5">
                <MapPin size={16} className="text-[#9A8B7A]" />
                <h2 className="font-bold text-[#9A8B7A] uppercase text-[11px] tracking-wider">
                  Address & Settings
                </h2>
              </div>
              <div className="space-y-2.5 text-[#2d2a26]">
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Street Address</span> <strong className="font-bold">{customer?.address || "—"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">City / State / Zip</span> <strong className="font-bold">{[customer?.city, customer?.state, customer?.zip].filter(Boolean).join(", ") || "—"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Delivery Method</span> <strong className="font-bold">{customer?.electronic_delivery || "Direct / Email"}</strong></p>
                <p><span className="text-[#8c827a] font-medium block text-[11px]">Account Status</span> <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ECFDF5] text-[#059669]"><span className="h-1.5 w-1.5 rounded-full bg-[#059669]"></span> Active</span></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
