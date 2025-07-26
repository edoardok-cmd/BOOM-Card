import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { AppError, parseApiError, showErrorToast } from '../utils/errorHandler';

interface UseApiState<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

// Custom hook for API calls with loading and error states
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
    showError?: boolean;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        let appError: AppError;
        
        if (error instanceof AppError) {
          appError = error;
        } else if (error instanceof AxiosError) {
          appError = parseApiError(error);
        } else {
          appError = new AppError(
            'An unexpected error occurred',
            'UNKNOWN_ERROR',
            500
          );
        }
        
        setState({ data: null, error: appError, isLoading: false });
        
        if (options?.showError !== false) {
          showErrorToast(appError);
        }
        
        if (options?.onError) {
          options.onError(appError);
        }
        
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for paginated API calls
interface UsePaginatedApiReturn<T> extends UseApiState<T[]> {
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; pageSize: number }) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  pageSize: number = 20,
  options?: {
    onSuccess?: (data: T[]) => void;
    onError?: (error: AppError) => void;
    showError?: boolean;
  }
): UsePaginatedApiReturn<T> {
  const [state, setState] = useState<{
    data: T[];
    error: AppError | null;
    isLoading: boolean;
    page: number;
    totalPages: number;
    total: number;
  }>({
    data: [],
    error: null,
    isLoading: false,
    page: 1,
    totalPages: 0,
    total: 0,
  });

  const loadPage = useCallback(
    async (page: number): Promise<void> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction({ page, pageSize });
        
        setState({
          data: result.data,
          error: null,
          isLoading: false,
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        });
        
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        }
      } catch (error) {
        let appError: AppError;
        
        if (error instanceof AppError) {
          appError = error;
        } else if (error instanceof AxiosError) {
          appError = parseApiError(error);
        } else {
          appError = new AppError(
            'Failed to load data',
            'LOAD_FAILED',
            500
          );
        }
        
        setState(prev => ({ ...prev, error: appError, isLoading: false }));
        
        if (options?.showError !== false) {
          showErrorToast(appError);
        }
        
        if (options?.onError) {
          options.onError(appError);
        }
      }
    },
    [apiFunction, pageSize, options]
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (state.page < state.totalPages) {
      await loadPage(state.page + 1);
    }
  }, [state.page, state.totalPages, loadPage]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadPage(1);
  }, [loadPage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      error: null,
      isLoading: false,
      page: 1,
      totalPages: 0,
      total: 0,
    });
  }, []);

  return {
    ...state,
    hasMore: state.page < state.totalPages,
    loadMore,
    loadPage,
    refresh,
    reset,
  };
}

// Hook for infinite scroll
export function useInfiniteScroll<T>(
  apiFunction: (params: { page: number; pageSize: number }) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  pageSize: number = 20,
  options?: {
    onSuccess?: (data: T[]) => void;
    onError?: (error: AppError) => void;
    showError?: boolean;
  }
): UsePaginatedApiReturn<T> & { allData: T[] } {
  const paginatedApi = usePaginatedApi(apiFunction, pageSize, options);
  const [allData, setAllData] = useState<T[]>([]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (paginatedApi.page < paginatedApi.totalPages && !paginatedApi.isLoading) {
      const nextPage = paginatedApi.page + 1;
      await paginatedApi.loadPage(nextPage);
      
      // Append new data to existing data
      setAllData(prev => [...prev, ...paginatedApi.data]);
    }
  }, [paginatedApi]);

  const refresh = useCallback(async (): Promise<void> => {
    setAllData([]);
    await paginatedApi.refresh();
    setAllData(paginatedApi.data);
  }, [paginatedApi]);

  const reset = useCallback(() => {
    setAllData([]);
    paginatedApi.reset();
  }, [paginatedApi]);

  return {
    ...paginatedApi,
    allData,
    loadMore,
    refresh,
    reset,
  };
}