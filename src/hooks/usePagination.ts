'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 25,
  totalCount = 0
}: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalCount);
  }, [startIndex, pageSize, totalCount]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    // Adjust current page to maintain roughly the same position
    const currentStartIndex = (currentPage - 1) * pageSize;
    const newPage = Math.max(1, Math.floor(currentStartIndex / newPageSize) + 1);
    setCurrentPage(newPage);
  }, [currentPage, pageSize]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const getPageNumbers = useCallback((maxVisible: number = 5) => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust range if too close to edges
      if (end - start + 1 < maxVisible - 2) {
        if (start === 2) {
          end = Math.min(totalPages - 1, start + maxVisible - 3);
        } else {
          start = Math.max(2, end - maxVisible + 3);
        }
      }

      // Add ellipsis before visible range if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add visible range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after visible range if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // State
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    startIndex,
    endIndex,
    
    // Computed
    hasNextPage,
    hasPreviousPage,
    
    // Actions
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    reset,
    
    // Utilities
    getPageNumbers,
    
    // For compatibility with components
    setPage: goToPage,
    setPageSize: changePageSize
  };
}
