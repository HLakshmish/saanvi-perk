import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  // Calculate entry boundaries
  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalRecords);

  // Generate page number sequence with ellipses for larger sets
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Base styling for paginator buttons to ignore system dark theme
  const btnBaseClass =
    "h-8 w-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const btnOutlineClass =
    "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-300";
  const btnPrimaryClass =
    "bg-brand-primary border-brand-primary text-white shadow-xs hover:bg-brand-primary-hover hover:border-brand-primary-hover";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1 w-full text-xs sm:text-sm text-gray-500",
        className
      )}
    >
      {/* Left: Entries selector & Stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 pr-6 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
        <span className="text-gray-400 font-medium">
          Showing <span className="font-semibold text-gray-900">{startEntry}</span> to{" "}
          <span className="font-semibold text-gray-900">{endEntry}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalRecords}</span> entries
        </span>
      </div>

      {/* Right: Previous / Page Numbers / Next navigation */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(btnBaseClass, btnOutlineClass)}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numeric Page Buttons */}
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-gray-400 font-medium select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page as number)}
              className={cn(
                btnBaseClass,
                isCurrent ? btnPrimaryClass : btnOutlineClass
              )}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(btnBaseClass, btnOutlineClass)}
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
