"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = React.useMemo(() => {
    const result: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        result.push(i);
      }
      if (currentPage < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                page === currentPage
                  ? "border-[#C9A96E] bg-[#C9A96E] text-[#1A1A1A]"
                  : "border-gray-200 bg-white text-[#1A1A1A] hover:bg-gray-50"
              )}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export { Pagination };
