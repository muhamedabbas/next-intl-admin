'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  UseTranslationManagerOptions, 
  UseTranslationManagerReturn, 
  Translation,
  PaginatedResponse
} from '../types';
import { APIError } from '../types';

export function useTranslationManager({
  apiEndpoint,
  pageSize = 25,
  apiHeaders = {},
  onError
}: UseTranslationManagerOptions): UseTranslationManagerReturn {
  // State
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API helper function
  const apiCall = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders,
          ...options.headers
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null; // Request was cancelled
      }
      throw err;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [apiEndpoint, apiHeaders]);

  // Fetch translations with pagination and search
  const fetchTranslations = useCallback(async (
    page: number = currentPage,
    size: number = currentPageSize,
    search: string = searchTerm
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: size.toString(),
        ...(search && { search })
      });

      const response = await apiCall(`?${params}`);
      
      if (response) {
        // Handle different response formats
        let translationsArray: Translation[] = [];
        let total = 0;

        if (Array.isArray(response)) {
          // Direct array response
          translationsArray = response;
          total = response.length;
        } else if (response.results && Array.isArray(response.results)) {
          // Paginated response (Django REST Framework style)
          translationsArray = response.results;
          total = response.count || 0;
        } else if (response.data && Array.isArray(response.data)) {
          // Wrapped response
          translationsArray = response.data;
          total = response.total || response.data.length;
        }

        setTranslations(translationsArray);
        setTotalCount(total);
        setTotalPages(Math.ceil(total / size));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentPageSize, searchTerm, apiCall, onError]);

  // Create translation
  const createTranslation = useCallback(async (
    translation: Omit<Translation, 'id'>
  ): Promise<Translation> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall('', {
        method: 'POST',
        body: JSON.stringify(translation)
      });

      if (response) {
        // Refresh the list to show the new translation
        await fetchTranslations();
        return response;
      }
      
      throw new Error('Failed to create translation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create translation';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchTranslations, onError]);

  // Update translation
  const updateTranslation = useCallback(async (
    id: string | number,
    translation: Partial<Translation>
  ): Promise<Translation> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(translation)
      });

      if (response) {
        // Update the translation in the current list
        setTranslations(prev => prev.map(t => 
          t.id === id ? { ...t, ...response } : t
        ));
        return response;
      }
      
      throw new Error('Failed to update translation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update translation';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onError]);

  // Delete translation
  const deleteTranslation = useCallback(async (id: string | number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiCall(`/${id}`, {
        method: 'DELETE'
      });

      // Remove the translation from the current list
      setTranslations(prev => prev.filter(t => t.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete translation';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onError]);

  // Bulk delete translations
  const bulkDeleteTranslations = useCallback(async (
    ids: (string | number)[]
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiCall('/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });

      // Remove the translations from the current list
      setTranslations(prev => prev.filter(t => !ids.includes(t.id!)));
      setTotalCount(prev => prev - ids.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onError]);

  // Import translations
  const importTranslations = useCallback(async (
    importedTranslations: Translation[]
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiCall('/import', {
        method: 'POST',
        body: JSON.stringify({ translations: importedTranslations })
      });

      // Refresh the list to show imported translations
      await fetchTranslations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchTranslations, onError]);

  // Export translations
  const exportTranslations = useCallback(async (format: string = 'json'): Promise<Blob> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        format,
        ...(searchTerm && { search: searchTerm })
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(`${apiEndpoint}/export?${params}`, {
        headers: apiHeaders,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, apiHeaders, searchTerm, onError]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchTranslations();
  }, [fetchTranslations]);

  // Handle search term changes with debouncing
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchTranslations(1, currentPageSize, term);
    }, 300);
  }, [currentPageSize, fetchTranslations]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTranslations(page, currentPageSize, searchTerm);
  }, [currentPageSize, searchTerm, fetchTranslations]);

  // Handle page size changes
  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page
    fetchTranslations(1, size, searchTerm);
  }, [searchTerm, fetchTranslations]);

  // Initial data fetch
  useEffect(() => {
    fetchTranslations();
  }, []); // Only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    translations,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      pageSize: currentPageSize
    },
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    bulkDeleteTranslations,
    importTranslations,
    exportTranslations,
    refresh
  };
}
