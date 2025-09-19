'use client';

import { useState, useCallback } from 'react';
import type { Translation } from '../types';

export interface UseTranslationAPIOptions {
  apiEndpoint: string;
  apiHeaders?: Record<string, string>;
  onError?: (error: Error) => void;
}

export function useTranslationAPI({
  apiEndpoint,
  apiHeaders = {},
  onError
}: UseTranslationAPIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiEndpoint}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, apiHeaders, onError]);

  const get = useCallback((endpoint: string, params?: Record<string, string>) => {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return apiCall(url);
  }, [apiCall]);

  const post = useCallback((endpoint: string, data: any) => {
    return apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const put = useCallback((endpoint: string, data: any) => {
    return apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const del = useCallback((endpoint: string) => {
    return apiCall(endpoint, {
      method: 'DELETE'
    });
  }, [apiCall]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    apiCall
  };
}
