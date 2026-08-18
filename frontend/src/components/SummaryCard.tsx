"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  iconColor?: string;
  iconBg?: string;
}

export default function SummaryCard({
  title,
  value,
  icon: IconComponent,
  description,
  iconColor = "text-[#9A8B7A]",
  iconBg = "bg-[#9A8B7A]/15",
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-[#e5ddd5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between font-sans group">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#6b5e52] uppercase tracking-widest block">
          {title}
        </span>
        <h3 className="text-2xl font-extrabold text-[#2d2a26] leading-none">
          {value}
        </h3>
        {description && (
          <p className="text-[10px] text-[#6b5e52]/70 font-medium">
            {description}
          </p>
        )}
      </div>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${iconBg} ${iconColor} group-hover:scale-105`}>
        <IconComponent size={20} className="stroke-[2.2]" />
      </div>
    </div>
  );
}
