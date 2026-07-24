"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { SearchInput } from "./search-input";
import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKey?: string;
  pageSize?: number;
  bulkSelect?: boolean;
  onRowSelectionChange?: (rows: TData[]) => void;
}

function DataTableInner<TData>({
  columns,
  data,
  loading = false,
  searchPlaceholder = "Search...",
  searchKey,
  pageSize = 10,
  bulkSelect = false,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const allColumns = React.useMemo<ColumnDef<TData, any>[]>(() => {
    if (!bulkSelect) return columns;
    return [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-[#C9A96E]"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-[#C9A96E]"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, bulkSelect]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selected = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
      onRowSelectionChange(selected);
    }
  }, [rowSelection]);

  const totalItems = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(val) => setGlobalFilter(val)}
            className="max-w-sm"
          />
          {bulkSelect && Object.keys(rowSelection).length > 0 && (
            <span className="text-sm text-gray-500">
              {Object.keys(rowSelection).length} row(s) selected
            </span>
          )}
        </div>
      )}
      <div className="rounded-xl border border-gray-100 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-100 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn(
                          "flex items-center gap-1 text-left",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3",
                                header.column.getIsSorted() === "asc"
                                  ? "text-[#7A6543]"
                                  : "text-gray-300"
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 -mt-1",
                                header.column.getIsSorted() === "desc"
                                  ? "text-[#7A6543]"
                                  : "text-gray-300"
                              )}
                            />
                          </span>
                        )}
                      </button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {allColumns.map((_, j) => (
                      <TableCell key={`skeleton-cell-${j}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        row.getIsSelected() && "bg-[#C9A96E]/5"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>
      {totalItems > pageSize && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={pageCount}
          totalItems={totalItems}
          itemsPerPage={table.getState().pagination.pageSize}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      )}
    </div>
  );
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  return <DataTableInner {...props} />;
}
