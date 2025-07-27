import { useState, useEffect, useCallback, useRef } from 'react';
import { APICache, PerformanceMonitor } from '@/utils/performance';

interface FetchOptions {
  cacheKey?: string;
  cacheTTL?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOptimizedFetch<T>(
  url: string,
  options: FetchOptions = {}
): FetchState<T> {
  const {
    cacheKey = url,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    timeout = 10000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWithTimeout = useCallback(async (
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'private, max-age=300',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  const fetchData = useCallback(async (attempt = 0): Promise<void> => {
    // Check cache first
    const cachedData = APICache.get(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    try {
      const timerName = `fetch-${cacheKey}`;
      PerformanceMonitor.startTimer(timerName);

      const response = await fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Cache the response
      APICache.set(cacheKey, responseData, cacheTTL);
      
      setData(responseData);
      PerformanceMonitor.endTimer(timerName);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't set error
        return;
      }

      console.error(`Fetch error (attempt ${attempt + 1}):`, err);
      
      if (attempt < retries - 1) {
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        setTimeout(() => fetchData(attempt + 1), delay);
        return;
      }

      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheTTL, retries, retryDelay, timeout, fetchWithTimeout]);

  const refetch = useCallback(async () => {
    // Clear cache for this key
    APICache.delete(cacheKey);
    await fetchData();
  }, [fetchData, cacheKey]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

// Hook למספר בקשות מקבילות
export function useOptimizedMultiFetch<T>(
  urls: string[],
  options: FetchOptions = {}
): {
  data: (T | null)[];
  loading: boolean;
  errors: (string | null)[];
  refetchAll: () => Promise<void>;
} {
  const [data, setData] = useState<(T | null)[]>(urls.map(() => null));
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<(string | null)[]>(urls.map(() => null));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    
    try {
      const fetchPromises = urls.map(async (url, index) => {
        const cacheKey = options.cacheKey ? `${options.cacheKey}-${index}` : url;
        
        // Check cache first
        const cachedData = APICache.get(cacheKey);
        if (cachedData) {
          return { index, data: cachedData, error: null };
        }

        try {
          const response = await fetch(url, {
            headers: {
              'Cache-Control': 'private, max-age=300'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseData = await response.json();
          APICache.set(cacheKey, responseData, options.cacheTTL || 5 * 60 * 1000);
          
          return { index, data: responseData, error: null };
        } catch (error) {
          return { 
            index, 
            data: null, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results = await Promise.all(fetchPromises);
      
      const newData = [...data];
      const newErrors = [...errors];
      
      results.forEach(({ index, data: resultData, error }) => {
        newData[index] = resultData;
        newErrors[index] = error;
      });
      
      setData(newData);
      setErrors(newErrors);
      
    } catch (error) {
      console.error('Multi-fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [urls, options.cacheKey, options.cacheTTL]);

  const refetchAll = useCallback(async () => {
    // Clear all caches
    urls.forEach((url, index) => {
      const cacheKey = options.cacheKey ? `${options.cacheKey}-${index}` : url;
      APICache.delete(cacheKey);
    });
    await fetchAll();
  }, [fetchAll, urls, options.cacheKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    errors,
    refetchAll
  };
} 