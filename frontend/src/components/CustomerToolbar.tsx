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
      className="bg-white border border-border-main rounded-2xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 select-none font-sans shrink-0 shadow-sm"
    >
      {/* Primary Actions Group */}
      <div className="flex flex-wrap items-center gap-2">

        {/* New Customer Button */}
        <button
          onClick={onNewCustomer}
          className="h-9 px-4 flex items-center gap-1.5 bg-white hover:bg-secondary text-primary font-bold text-sm rounded-full border border-border-main shadow-sm cursor-pointer active:scale-[0.98] transition-all"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>New Customer</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border-main mx-1"></div>

        {/* Edit Button */}
        {canEdit && (
          <button
            disabled={!isSingleSelection}
            onClick={onEdit}
            className={`h-9 px-4 flex items-center gap-2 border text-sm font-bold rounded-full transition-all ${isSingleSelection
              ? "bg-white border-border-main text-text-muted hover:bg-secondary hover:text-primary cursor-pointer active:scale-[0.98] shadow-sm"
              : "bg-secondary/30 border-transparent text-border-main cursor-not-allowed"
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
          className={`h-9 px-4 flex items-center gap-2 border text-xs font-bold rounded-full transition-all ${isSingleSelection
            ? "bg-white border-border-main text-text-muted hover:bg-secondary hover:text-primary cursor-pointer active:scale-[0.98] shadow-sm"
            : "bg-secondary/30 border-transparent text-border-main cursor-not-allowed"
            }`}
        >
          <FolderOpen size={13} className={isSingleSelection ? "text-primary" : "text-border-main"} />
          <span>Open Folder</span>
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            disabled={!hasSelection}
            onClick={onDelete}
            className={`h-9 px-4 flex items-center gap-2 border text-sm font-bold rounded-full transition-all ${hasSelection
              ? "bg-white border-border-main text-danger hover:bg-danger/5 cursor-pointer active:scale-[0.98] shadow-sm"
              : "bg-secondary/30 border-transparent text-border-main cursor-not-allowed"
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
          className="h-9 px-3.5 flex items-center justify-center border border-border-main bg-white hover:bg-secondary text-text-muted hover:text-primary rounded-full transition-all cursor-pointer shadow-sm"
          title="Refresh grid data"
        >
          <RotateCw size={13} />
        </button>

        {/* Export CSV Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="h-9 px-4 flex items-center gap-2 border border-border-main bg-white hover:bg-secondary text-text-muted hover:text-primary rounded-full font-bold text-sm transition-all cursor-pointer shadow-sm"
            title="Export CSV"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        )}

        {/* Selection indicators */}
        {hasSelection && (
          <div className="h-9 px-4 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-sm tracking-wider">
            SELECTED: {selectedCount}
          </div>
        )}
      </div>
    </div>
  );
}
