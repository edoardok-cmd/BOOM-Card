import { useState, useEffect, useRef, useCallback } from 'react';

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for debouncing callbacks
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancel];
}

// Hook for throttling callbacks
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// Hook for debounced search
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
): {
  results: T[];
  isSearching: boolean;
  error: Error | null;
  search: (query: string) => void;
  clearResults: () => void;
} {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
  };
}