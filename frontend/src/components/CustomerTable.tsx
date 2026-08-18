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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown
} from "lucide-react";

interface CustomerTableProps {
  data: Customer[];
  selectedRowIds: RowSelectionState;
  setSelectedRowIds: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  onRowClick?: (customer: Customer) => void;
  onRefresh?: () => void;
  inactiveColor?: string;
}

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

  // Define columns matching Sterling AMS specifications with modern presentation
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      // Select Checkbox Column
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#e5ddd5] text-[#9A8B7A] focus:ring-[#9A8B7A] focus:ring-opacity-25 focus:ring-offset-0 cursor-pointer accent-[#9A8B7A]"
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
              className="h-4 w-4 rounded border-[#e5ddd5] text-[#9A8B7A] focus:ring-[#9A8B7A] focus:ring-opacity-25 focus:ring-offset-0 cursor-pointer accent-[#9A8B7A]"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        size: 40,
      },
      // ID (#)
      {
        accessorKey: "id",
        header: "#",
        cell: (info) => <span className="text-[#2d2a26] font-bold">{info.getValue() as string}</span>,
        size: 40,
      },
      // Match Code
      {
        accessorKey: "matchCode",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#2d2a26] hover:text-[#9A8B7A] transition-colors outline-none w-full text-left uppercase tracking-wider text-[10px]"
          >
            <span>Match</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp size={11} className="text-[#9A8B7A]" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown size={11} className="text-[#9A8B7A]" />
            ) : (
              <ArrowUpDown size={11} className="text-[#6b5e52]/50" />
            )}
          </button>
        ),
        cell: (info) => <span className="font-mono text-[#2d2a26] font-bold">{info.getValue() as string}</span>,
        size: 90,
      },
      // Customer Name
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-[#2d2a26] hover:text-[#9A8B7A] transition-colors outline-none w-full text-left uppercase tracking-wider text-[10px]"
          >
            <span>Name</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp size={11} className="text-[#9A8B7A]" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown size={11} className="text-[#9A8B7A]" />
            ) : (
              <ArrowUpDown size={11} className="text-[#6b5e52]/50" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const name = row.original.name;
          const type = row.original.type;
          const isCom = type === "Commercial";
          return (
            <div className="flex items-center gap-2 truncate">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/agency/customer/${row.original.id}`);
                }}
                className="font-bold text-[#2d2a26] hover:text-[#9A8B7A] hover:underline cursor-pointer"
                title="Click to open customer folder"
              >
                {name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 tracking-wider ${
                isCom ? "bg-[#9A8B7A]/15 text-[#9A8B7A]" : "bg-emerald-100 text-emerald-800"
              }`}>
                {isCom ? "COM" : "PERS"}
              </span>
            </div>
          );
        },
        size: 160,
      },
      // Address
      {
        accessorKey: "address",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">Address</span>,
        cell: (info) => <span className="text-[#2d2a26] truncate">{info.getValue() as string}</span>,
        size: 140,
      },
      // City
      {
        accessorKey: "city",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">City</span>,
        cell: (info) => <span className="text-[#2d2a26] truncate">{info.getValue() as string}</span>,
        size: 100,
      },
      // State
      {
        accessorKey: "state",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">St</span>,
        cell: (info) => <span className="text-[#2d2a26] font-bold">{info.getValue() as string}</span>,
        size: 45,
      },
      // Zip
      {
        accessorKey: "zip",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">Zip</span>,
        cell: (info) => <span className="text-[#2d2a26] font-mono">{info.getValue() as string}</span>,
        size: 55,
      },
      // Phone
      {
        accessorKey: "phone",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">Phone</span>,
        cell: (info) => <span className="text-[#2d2a26] font-semibold font-mono">{info.getValue() as string}</span>,
        size: 110,
      },
      // Executive
      {
        accessorKey: "primaryExec",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">Exec</span>,
        cell: (info) => <span className="text-[#2d2a26] truncate">{info.getValue() as string}</span>,
        size: 120,
      },
      // Primary Type
      {
        accessorKey: "type",
        header: () => <span className="uppercase tracking-wider text-[10px] text-[#2d2a26] font-bold">Type</span>,
        cell: (info) => <span className="text-[#2d2a26] font-medium">{info.getValue() as string}</span>,
        size: 90,
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

  return (
    <div
      className="border border-[#e5ddd5] rounded-2xl bg-white flex flex-col font-sans select-none shrink-0 shadow-sm overflow-hidden"
    >
      {/* Table grid wrapper */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="premium-table table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#e5ddd5]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-r border-[#e5ddd5]/30 last:border-r-0 align-middle select-none sticky top-0 z-30 font-semibold table-header bg-[#FAF8F5]"
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
                      // Exclusive single select on row click: unselect previous, select current
                      setSelectedRowIds((prev) => {
                        if (prev[row.id] && Object.keys(prev).filter(k => prev[k]).length === 1) {
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
                        ? "!bg-[#ede5db] text-[#2d2a26] font-bold ring-2 ring-inset ring-[#9A8B7A]/40 shadow-sm border-l-4 border-l-[#9A8B7A]"
                        : "hover:bg-[#f5f1eb] odd:bg-white even:bg-[#f5f1eb]/20"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border-r border-[#e5ddd5]/30 last:border-r-0 truncate align-middle table-body">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr className="bg-white">
                <td colSpan={columns.length} className="text-center py-20 text-[#6b5e52] font-medium table-body">
                  No customer records found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginated Footer */}
      <div
        className="px-6 py-4 bg-white border-t border-[#e5ddd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6b5e52] shrink-0 select-none shadow-sm"
      >
        {/* Left section: Records Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-wider text-[#6b5e52] font-bold">Show:</span>
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 pl-3 pr-8 border border-[#e5ddd5] rounded-full bg-white text-[#2d2a26] focus:outline-none focus:border-[#9A8B7A] text-xs font-bold transition-all appearance-none cursor-pointer"
            >
              {[10, 15, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} rows
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-[#6b5e52] absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <span className="text-[#e5ddd5]">|</span>
          <span className="text-[#6b5e52] font-medium">
            Total: <strong className="text-[#2d2a26]">{table.getFilteredRowModel().rows.length}</strong> records
          </span>
        </div>

        {/* Center: Pagination controls */}
        <div className="flex items-center gap-1.5 font-bold justify-center">
          {/* Double left */}
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all shadow-sm"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Single left */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all shadow-sm"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page Indicator */}
          <div className="flex items-center gap-1 px-4 py-1.5 bg-[#f5f1eb] border border-[#e5ddd5] rounded-full text-xs text-[#2d2a26]">
            <span>Page</span>
            <strong className="text-[#9A8B7A]">{table.getState().pagination.pageIndex + 1}</strong>
            <span>of</span>
            <strong>{Math.max(1, table.getPageCount())}</strong>
          </div>

          {/* Single right */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all shadow-sm"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          {/* Double right */}
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all shadow-sm"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>

          {/* Refresh double-arrow */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-2 h-8 w-8 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#f5f1eb] text-[#6b5e52] hover:text-[#2d2a26] flex items-center justify-center cursor-pointer transition-all shadow-sm"
              title="Reload current page"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
