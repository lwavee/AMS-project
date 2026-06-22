/* eslint-disable */
"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SidebarSectionProps {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: SidebarSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);

  return (
    <div className="sidebar-accordion-section">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center gap-2 px-3 py-[9px]
          text-[11.5px] font-extrabold uppercase tracking-[0.12em]
          transition-all duration-200 cursor-pointer select-none
          ${isExpanded
            ? "bg-[#4A3B32] text-[#F0E5D8] shadow-sm"
            : "bg-[#5C4A3E] text-[#D4C4B5] hover:bg-[#4A3B32] hover:text-[#F0E5D8]"
          }
        `}
      >
        {/* Chevron */}
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-300 ease-out ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />

        {/* Icon */}
        {Icon && (
          <Icon
            size={14}
            className={`shrink-0 ${
              isExpanded ? "text-[#E6D9CC]" : "text-[#A99585]"
            }`}
          />
        )}

        {/* Title */}
        <span className="flex-1 text-left">{title}</span>
      </button>

      {/* Collapsible Content */}
      <div
        className="accordion-content overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="py-0.5 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
