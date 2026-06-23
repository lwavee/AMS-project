"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

export interface SidebarItemProps {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  isActive?: boolean;
  onClick?: () => void;
  /** If true, shows an external-link indicator (for actions that navigate away) */
  isAction?: boolean;
  /** If true, the item is visually disabled and shows "Coming Soon" on hover */
  disabled?: boolean;
}

export default function SidebarItem({
  label,
  icon: Icon,
  isActive = false,
  onClick,
  isAction = false,
  disabled = false,
}: SidebarItemProps) {
  return (
    <button
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
      title={disabled ? `${label} — Coming Soon` : label}
      className={`
        sidebar-item
        w-full text-left flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl mx-2 !w-[calc(100%-16px)]
        transition-all duration-200 cursor-pointer relative group
        ${isActive
          ? "bg-secondary text-primary"
          : disabled
            ? "text-text-muted/50 cursor-not-allowed hover:bg-transparent"
            : "text-text-muted hover:bg-secondary/50 hover:text-text-main"
        }
      `}
    >
      {Icon && (
        <Icon
          size={18}
          className={`shrink-0 transition-colors duration-200 ${
            isActive
              ? "text-primary"
              : disabled
                ? "text-text-muted/30"
                : "text-text-muted/60 group-hover:text-primary"
          }`}
        />
      )}
      <span className="truncate flex-1">{label}</span>
      {isAction && !disabled && (
        <ExternalLink
          size={10}
          className="shrink-0 text-text-muted/30 group-hover:text-primary/50 transition-colors"
        />
      )}
      {disabled && (
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted/40 bg-secondary/60 px-1.5 py-0.5 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          Soon
        </span>
      )}
    </button>
  );
}
