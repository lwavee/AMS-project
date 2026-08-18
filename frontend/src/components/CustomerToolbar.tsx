"use client";

import React from "react";
import {
  Plus,
  Edit,
  FolderOpen,
  Trash2,
  RotateCw,
  Download
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
    <div
      className="bg-white border border-[#e5ddd5] rounded-2xl px-3 sm:px-6 py-3 flex items-center justify-between gap-2 select-none font-sans shrink-0 shadow-sm overflow-x-auto custom-scrollbar"
    >
      {/* Primary Actions Group */}
      <div className="flex items-center gap-2 shrink-0">

        {/* New Customer Button */}
        <button
          onClick={onNewCustomer}
          className="h-9 px-4 flex items-center gap-1.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm cursor-pointer active:scale-[0.98] transition-all border-none"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Customer</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#e5ddd5] mx-1"></div>

        {/* Edit Button */}
        {canEdit && (
          <button
            disabled={!isSingleSelection}
            onClick={onEdit}
            className={`h-9 px-4 flex items-center gap-1.5 border text-xs font-bold uppercase tracking-wider rounded-full transition-all ${isSingleSelection
              ? "bg-white border-[#e5ddd5] text-[#2d2a26] hover:bg-[#f5f1eb] hover:text-[#9A8B7A] cursor-pointer active:scale-[0.98] shadow-sm"
              : "bg-[#f5f1eb]/50 border-transparent text-[#6b5e52]/40 cursor-not-allowed"
              }`}
          >
            <Edit size={13} />
            <span>Edit</span>
          </button>
        )}

        {/* Open Details Button */}
        <button
          disabled={!isSingleSelection}
          onClick={onOpen}
          className={`h-9 px-4 flex items-center gap-1.5 border text-xs font-bold uppercase tracking-wider rounded-full transition-all ${isSingleSelection
            ? "bg-white border-[#e5ddd5] text-[#2d2a26] hover:bg-[#f5f1eb] hover:text-[#9A8B7A] cursor-pointer active:scale-[0.98] shadow-sm"
            : "bg-[#f5f1eb]/50 border-transparent text-[#6b5e52]/40 cursor-not-allowed"
            }`}
        >
          <FolderOpen size={13} className={isSingleSelection ? "text-[#9A8B7A]" : "text-[#6b5e52]/40"} />
          <span>Open Folder</span>
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            disabled={!hasSelection}
            onClick={onDelete}
            className={`h-9 px-4 flex items-center gap-1.5 border text-xs font-bold uppercase tracking-wider rounded-full transition-all ${hasSelection
              ? "bg-white border-[#e5ddd5] text-red-600 hover:bg-red-50 cursor-pointer active:scale-[0.98] shadow-sm"
              : "bg-[#f5f1eb]/50 border-transparent text-[#6b5e52]/40 cursor-not-allowed"
              }`}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        )}

      </div>

      {/* Auxiliary / Secondary Buttons Group */}
      <div className="flex items-center gap-2.5 ml-auto">

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="h-9 px-3.5 flex items-center justify-center border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] rounded-full transition-all cursor-pointer shadow-sm"
          title="Refresh grid data"
        >
          <RotateCw size={13} />
        </button>

        {/* Export CSV Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="h-9 px-4 flex items-center gap-1.5 border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#2d2a26] hover:text-[#9A8B7A] rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            title="Export CSV"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        )}

        {/* Selection indicator */}
        {hasSelection && (
          <div className="h-9 px-3.5 flex items-center justify-center bg-[#9A8B7A]/15 border border-[#9A8B7A]/30 rounded-full text-[#9A8B7A] font-bold text-xs uppercase tracking-wider">
            Selected: {selectedCount}
          </div>
        )}
      </div>
    </div>
  );
}
