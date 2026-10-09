/* eslint-disable */
"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
  SortingState
} from "@tanstack/react-table";
import { Customer } from "../data/customers";
import {
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  RotateCw
} from "lucide-react";

interface CustomerTableProps {
  data: Customer[];
  selectedRowIds: RowSelectionState;
  setSelectedRowIds: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  onRowClick?: (customer: Customer) => void;
  onRefresh?: () => void;
  inactiveColor?: string;
}

const AVATAR_PALETTES = [
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" }, // AA - light blue
  { bg: "bg-[#F3E8FF]", text: "text-[#9333EA]" }, // AC - light purple
  { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" }, // SB - light green
  { bg: "bg-[#FFE4E6]", text: "text-[#E11D48]" }, // CC - light pink
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" }, // HP - cyan
  { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" }, // NA - violet
  { bg: "bg-[#FFEDD5]", text: "text-[#EA580C]" }, // FL - orange
  { bg: "bg-[#CCFBF1]", text: "text-[#0D9488]" }, // PC - teal
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" }, // AA - light blue
  { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" }, // AK - amber
];

const getInitials = (name: string) => {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function CustomerTable({
  data,
  selectedRowIds,
  setSelectedRowIds,
  onRowClick,
  onRefresh,
  inactiveColor,
}: CustomerTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Columns definition matching Second Photo
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      // Select Checkbox Column
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#e5ddd5] text-[#9A8B7A] focus:ring-[#9A8B7A] focus:ring-offset-0 cursor-pointer accent-[#9A8B7A]"
              checked={table.getIsAllPageRowsSelected()}
              ref={(input) => {
                if (input) {
                  input.indeterminate = table.getIsSomePageRowsSelected();
                }
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#e5ddd5] text-[#9A8B7A] focus:ring-[#9A8B7A] focus:ring-offset-0 cursor-pointer accent-[#9A8B7A]"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        size: 38,
      },
      // ID (#)
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>#</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => <span className="text-[#1f1d1a] font-bold text-xs">{info.getValue() as string}</span>,
        size: 40,
      },
      // Match Code
      {
        accessorKey: "matchCode",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>MATCH</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-[#1f1d1a] font-bold text-xs">
            {info.getValue() as string}
          </span>
        ),
        size: 95,
      },
      // Customer Name with Initials Avatar & Tag
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>NAME</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: ({ row }) => {
          const name = row.original.name;
          const type = row.original.type;
          const isCom = type === "Commercial" || !type;
          const initials = getInitials(name);
          const palette = AVATAR_PALETTES[row.index % AVATAR_PALETTES.length];

          return (
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Circular Avatar */}
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${palette.bg} ${palette.text}`}
              >
                {initials}
              </div>

              {/* Name text */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/agency/customer/${row.original.id}`);
                }}
                className="font-bold text-xs text-[#1f1d1a] hover:text-[#9A8B7A] hover:underline cursor-pointer truncate"
                title="Click to open customer folder"
              >
                {name}
              </span>

              {/* COM / PERS pill badge */}
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#FAF8F5] text-[#8c827a] border border-[#e5ddd5] shrink-0">
                {isCom ? "COM" : "PERS"}
              </span>
            </div>
          );
        },
        size: 190,
      },
      // Address
      {
        accessorKey: "address",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>ADDRESS</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="text-[#2d2a26] text-xs font-medium truncate block max-w-[150px]">
            {info.getValue() as string || "—"}
          </span>
        ),
        size: 150,
      },
      // City
      {
        accessorKey: "city",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>CITY</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="text-[#2d2a26] text-xs font-medium truncate block">
            {info.getValue() as string || "—"}
          </span>
        ),
        size: 110,
      },
      // State (ST)
      {
        accessorKey: "state",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>ST</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => {
          const val = (info.getValue() as string || "").toUpperCase();
          const isSpecialState = val === "CA" || val === "WA";
          if (isSpecialState) {
            return (
              <span className="inline-block bg-[#EBF5FF] text-[#2563EB] font-bold text-[10px] px-1.5 py-0.5 rounded">
                {val}
              </span>
            );
          }
          return <span className="text-[#2d2a26] text-xs font-medium">{val || "—"}</span>;
        },
        size: 50,
      },
      // Zip
      {
        accessorKey: "zip",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>ZIP</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="text-[#2d2a26] font-mono text-xs">
            {info.getValue() as string || "—"}
          </span>
        ),
        size: 65,
      },
      // Phone
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>PHONE</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="text-[#2d2a26] font-medium text-xs whitespace-nowrap">
            {info.getValue() as string || "—"}
          </span>
        ),
        size: 115,
      },
      // Executive (EXEC)
      {
        accessorKey: "primaryExec",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>EXEC</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="text-[#2d2a26] text-xs font-medium truncate block">
            {info.getValue() as string || "Unassigned"}
          </span>
        ),
        size: 130,
      },
      // Type (Commercial)
      {
        accessorKey: "type",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#6b5e52] hover:text-[#1f1d1a] transition-colors outline-none uppercase tracking-wider text-[10px]"
          >
            <span>TYPE</span>
            <ArrowUpDown size={10} className="text-[#9A8B7A]" />
          </button>
        ),
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF5FF] text-[#2563EB]">
            {info.getValue() as string || "Commercial"}
          </span>
        ),
        size: 100,
      },
      // Action Column
      {
        id: "action",
        header: () => (
          <span className="uppercase tracking-wider text-[10px] text-[#6b5e52] font-bold">
            ACTION
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/agency/customer/${row.original.id}`);
              }}
              className="p-1 rounded-lg text-[#8c827a] hover:text-[#2d2a26] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        ),
        size: 50,
      },
    ],
    [router]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection: selectedRowIds,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRowIds,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <div className="border border-[#e5ddd5] rounded-2xl bg-white flex flex-col font-sans select-none shrink-0 shadow-2xs overflow-hidden">
      {/* Table grid wrapper */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#e5ddd5] bg-white">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3.5 py-3 align-middle select-none font-bold text-[#6b5e52]"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#e5ddd5]/60 bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (onRowClick) onRowClick(row.original);
                      setSelectedRowIds((prev) => {
                        if (prev[row.id] && Object.keys(prev).filter((k) => prev[k]).length === 1) {
                          return {};
                        }
                        return { [row.id]: true };
                      });
                    }}
                    style={
                      row.original.status === "Inactive" && inactiveColor
                        ? { backgroundColor: inactiveColor, color: "#1a1a1a" }
                        : {}
                    }
                    className={`transition-all cursor-pointer ${
                      isSelected
                        ? "!bg-[#FAF6EE] text-[#1f1d1a]"
                        : "hover:bg-[#FAF8F5]/80"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3.5 py-3 align-middle truncate text-xs"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr className="bg-white">
                <td colSpan={columns.length} className="text-center py-20 text-[#6b5e52] font-medium">
                  No customer records found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginated Footer Matching Screenshot */}
      <div className="px-5 py-3.5 bg-white border-t border-[#e5ddd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6b5e52] shrink-0 select-none">
        {/* Left section: Records Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#6b5e52] font-medium">Show:</span>
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 pl-3 pr-7 border border-[#e5ddd5] rounded-xl bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] text-xs font-semibold transition-all appearance-none cursor-pointer"
            >
              {[10, 15, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} rows
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-[#6b5e52] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <span className="text-[#e5ddd5]">|</span>
          <span className="text-[#6b5e52] font-medium">
            Total: <strong className="text-[#2d2a26] font-bold">{table.getFilteredRowModel().rows.length}</strong> records
          </span>
        </div>

        {/* Right: Pagination controls */}
        <div className="flex items-center gap-1.5 font-bold justify-center">
          {/* Double left */}
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#1f1d1a] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all"
            title="First Page"
          >
            <ChevronsLeft size={13} />
          </button>

          {/* Single left */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#1f1d1a] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all"
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          {/* Page numbers: 1, 2, ... */}
          {Array.from({ length: Math.min(pageCount || 1, 5) }).map((_, pIdx) => {
            const isCurrent = currentPage === pIdx;
            return (
              <button
                key={pIdx}
                onClick={() => table.setPageIndex(pIdx)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-[#9A8B7A] text-white shadow-xs"
                    : "text-[#2d2a26] hover:bg-[#FAF8F5] border border-transparent hover:border-[#e5ddd5]"
                }`}
              >
                {pIdx + 1}
              </button>
            );
          })}

          {/* Single right */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#1f1d1a] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all"
            title="Next Page"
          >
            <ChevronRight size={13} />
          </button>

          {/* Double right */}
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#1f1d1a] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all"
            title="Last Page"
          >
            <ChevronsRight size={13} />
          </button>

          {/* Refresh icon */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-1 h-7 w-7 rounded-lg border border-[#e5ddd5] bg-white hover:bg-[#FAF8F5] text-[#6b5e52] hover:text-[#1f1d1a] flex items-center justify-center cursor-pointer transition-all"
              title="Refresh table"
            >
              <RotateCw size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
