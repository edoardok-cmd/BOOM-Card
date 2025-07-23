import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter, Download, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import clsx from 'clsx';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: Error | null;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  responsive?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  pageSize?: number;
  pageSizes?: number[];
  showPagination?: boolean;
  showExport?: boolean;
  exportFilename?: string;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  rowKey?: keyof T | ((row: T) => string | number);
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  selectable?: boolean;
  selectAll?: boolean;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  className,
  striped = false,
  hoverable = true,
  compact = false,
  bordered = false,
  responsive = true,
  sortable = true,
  filterable = false,
  searchable = false,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  errorMessage,
  pageSize = 10,
  pageSizes = [10, 25, 50, 100],
  showPagination = true,
  showExport = false,
  exportFilename = 'table-export',
  onRowClick,
  onSort,
  onFilter,
  onSearch,
  onExport,
  rowKey,
  selectedRows = [],
  onSelectionChange,
  selectable = false,
  selectAll = true,
}: TableProps<T>) {
  const { t, i18n } = useTranslation();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [showFilters, setShowFilters] = useState(false);
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>(selectedRows);

  const dateLocale = i18n.language === 'bg' ? bg : enUS;

  // Update internal selected rows when prop changes
  useEffect(() => {
    setInternalSelectedRows(selectedRows);
  }, [selectedRows]);

  // Get row key
  const getRowKey = useCallback((row: T, index: number): string | number => {
    if (rowKey) {
      return typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
    }
    return index;
  }, [rowKey]);

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    if (!sortable) return;

    const newDirection = 
      sortConfig?.column === column && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';

    setSortConfig({ column, direction: newDirection });
    
    if (onSort) {
      onSort(column, newDirection);
    }, [sortable, sortConfig, onSort]);

  // Handle filtering
  const handleFilter = useCallback((column: string, value: string) => {
    const newFilters = { ...filterConfig, [column]: value };
    
    if (!value) {
      delete newFilters[column];
    }
    
    setFilterConfig(newFilters);
    setCurrentPage(1);
    
    if (onFilter) {
      onFilter(newFilters);
    }, [filterConfig, onFilter]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (onSearch) {
      onSearch(query);
    }, [onSearch]);

  // Handle row selection
  const handleRowSelection = useCallback((row: T) => {
    const rowId = getRowKey(row, 0);
    const isSelected = internalSelectedRows.some(
      r => getRowKey(r, 0) === rowId
    );

    let newSelection: T[];
    
    if (isSelected) {
      newSelection = internalSelectedRows.filter(
        r => getRowKey(r, 0) !== rowId
      );
    } else {
      newSelection = [...internalSelectedRows, row];
    }

    setInternalSelectedRows(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }, [internalSelectedRows, getRowKey, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allSelected = processedData.length === internalSelectedRows.length &&
      processedData.every(row => 
        internalSelectedRows.some(r => getRowKey(r, 0) === getRowKey(row, 0))
      );

    let newSelection: T[];
    
    if (allSelected) {
      newSelection = [];
    } else {
      newSelection = [...processedData];
    }

    setInternalSelectedRows(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }, [processedData, internalSelectedRows, getRowKey, onSelectionChange]);

  // Process data with filtering and sorting
  const processedData = useMemo(() => {
    let processed = [...data];

    // Apply search
    if (searchQuery && !onSearch) {
      processed = processed.filter(row => 
        columns.some(column => {)
          const value = typeof column.accessor === 'function' 
            ? column.accessor(row) 
            : row[column.accessor];
          
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply filters
    if (Object.keys(filterConfig).length > 0 && !onFilter) {
      processed = processed.filter(row => 
        Object.entries(filterConfig).every(([key, filterValue]) => {
          const column = columns.find(c => c.key === key);
          if (!column) return true;

            ? column.accessor(row) 
            : row[column.accessor];
          
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig && !onSort) {
      if (column) {
        processed.sort((a, b) => {
          const aValue = typeof column.accessor === 'function' 
            ? column.accessor(a) 
            : a[column.accessor];
          const bValue = typeof column.accessor === 'function' 
            ? column.accessor(b) 
            : b[column.accessor];

          if (aValue === bValue) return 0;
          
          const comparison = aValue < bValue ? -1 : 1;
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }

    return processed;
  }, [data, searchQuery, filterConfig, sortConfig, columns, onSearch, onFilter, onSort]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const paginatedData = showPagination 
    ? processedData.slice(startIndex, endIndex) 
    : processedData;

  // Export functionality
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
      return;
    }

    // Default CSV export
    const headers = columns.map(c => c.header).join(',');
    const rows = processedData.map(row => 
      columns.map(column => {)
          ? column.accessor(row) 
          : row[column.accessor];
        
        // Handle special characters in CSV
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${exportFilename}-${format(new Date(), 'yyyy-MM-dd', { locale: dateLocale })}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedData, columns, exportFilename, dateLocale, onExport]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loadingMessage || t('common.loading', 'Loading...')}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {errorMessage || t('common.error', 'An error occurred')}
        </p>
        {error.message && (
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
        )}
      </div>
    );
  }

  // Render empty state
  if (processedData.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-500">
          {emptyMessage || t('common.noData', 'No data available')}
        </p>
      </div>
    );
  }

  const tableClasses = clsx(
    'w-full',
    {
      'border-collapse': bordered,
      'table-auto': true,
    },)
    className
  );

  const wrapperClasses = clsx({
    'overflow-x-auto': responsive,
    'rounded-lg shadow-sm': true,
    'border border-gray-200': bordered,
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      {(searchable || filterable || showExport) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || t('common.search', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
            
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  showFilters 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Filter className="h-4 w-4" />
                {t('common.filters', 'Filters')}
              </button>
            )}
          </div>

          {showExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('common.export', 'Export')}
 
}
}
}
}
}
}
}
}
}
