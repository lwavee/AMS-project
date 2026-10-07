"use client";

import React from "react";
import {
  Plus,
  Edit3,
  FolderOpen,
  Trash2,
  RotateCw,
  Download,
  ChevronDown
} from "lucide-react";

interface CustomerToolbarProps {
  selectedCount: number;
  onNewCustomer: () => void;
  onEdit: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onExport?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function CustomerToolbar({
  selectedCount,
  onNewCustomer,
  onEdit,
  onOpen,
  onDelete,
  onRefresh,
  onExport,
  canEdit = true,
  canDelete = true,
}: CustomerToolbarProps) {
  const hasSelection = selectedCount > 0;
  const isSingleSelection = selectedCount === 1;

  return (
    <div className="flex items-center justify-between gap-3 select-none font-sans shrink-0 flex-wrap">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* + New Customer Button */}
        <button
          type="button"
          onClick={onNewCustomer}
          className="h-9 px-4 flex items-center gap-1.5 bg-[#795C46] hover:bg-[#684e3a] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-[0.98] transition-all border-none"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>New Customer</span>
        </button>

        {/* Edit Button */}
        {canEdit && (
          <button
            type="button"
            disabled={!isSingleSelection}
            onClick={onEdit}
            className={`h-9 px-3.5 flex items-center gap-1.5 border rounded-xl text-xs font-semibold transition-all shadow-2xs ${
              isSingleSelection
                ? "bg-white border-[#e5ddd5] text-[#2d2a26] hover:bg-[#FAF8F5] cursor-pointer"
                : "bg-[#FAF8F5]/50 border-[#e5ddd5]/60 text-[#8c827a]/60 cursor-not-allowed"
            }`}
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
        )}

        {/* Open Folder Button */}
        <button
          type="button"
          disabled={!isSingleSelection}
          onClick={onOpen}
          className={`h-9 px-3.5 flex items-center gap-1.5 border rounded-xl text-xs font-semibold transition-all shadow-2xs ${
            isSingleSelection
              ? "bg-white border-[#e5ddd5] text-[#2d2a26] hover:bg-[#FAF8F5] cursor-pointer"
              : "bg-[#FAF8F5]/50 border-[#e5ddd5]/60 text-[#8c827a]/60 cursor-not-allowed"
          }`}
        >
          <FolderOpen size={13} />
          <span>Open Folder</span>
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            type="button"
            disabled={!hasSelection}
            onClick={onDelete}
            className={`h-9 px-3.5 flex items-center gap-1.5 border rounded-xl text-xs font-bold transition-all shadow-2xs ${
              hasSelection
                ? "bg-[#FEF2F2] border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] cursor-pointer"
                : "bg-[#FAF8F5]/50 border-[#e5ddd5]/60 text-[#8c827a]/60 cursor-not-allowed"
            }`}
          >
            <Trash2 size={13} className={hasSelection ? "text-[#DC2626]" : "text-[#8c827a]/60"} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="h-9 w-9 flex items-center justify-center border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#2d2a26] rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Refresh customers"
        >
          <RotateCw size={13} />
        </button>

        {/* Export Button */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="h-9 px-3.5 flex items-center gap-1.5 border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#2d2a26] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Export CSV"
          >
            <Download size={13} />
            <span>Export</span>
            <ChevronDown size={12} className="text-[#6b5e52]" />
          </button>
        )}
      </div>
    </div>
  );
}
