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
          text-[11px] font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer select-none
          ${isExpanded
            ? "text-text-main"
            : "text-text-muted hover:text-text-main"
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
              isExpanded ? "text-primary" : "text-text-muted"
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
        <div ref={contentRef} className="py-0.5 bg-bg-base/50">
          {children}
        </div>
      </div>
    </div>
  );
}
