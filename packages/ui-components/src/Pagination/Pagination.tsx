import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showFirstLast?: boolean;
  showPageInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'ghost';
  align?: 'left' | 'center' | 'right';
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: {
    button: 'h-8 w-8 text-xs',
    select: 'h-8 text-xs px-2',
    info: 'text-xs',
  },
  md: {
    button: 'h-10 w-10 text-sm',
    select: 'h-10 text-sm px-3',
    info: 'text-sm',
  },
  lg: {
    button: 'h-12 w-12 text-base',
    select: 'h-12 text-base px-4',
    info: 'text-base',
  },
};

const variantClasses = {
  default: {
    button: 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700',
    activeButton: 'bg-primary-600 hover:bg-primary-700 border-primary-600 text-white',
    disabled: 'opacity-50 cursor-not-allowed hover:bg-white',
  },
  bordered: {
    button: 'bg-transparent hover:bg-gray-50 border-2 border-gray-300 text-gray-700',
    activeButton: 'bg-transparent border-2 border-primary-600 text-primary-600',
    disabled: 'opacity-50 cursor-not-allowed hover:bg-transparent',
  },
  ghost: {
    button: 'bg-transparent hover:bg-gray-100 text-gray-700',
    activeButton: 'bg-gray-200 text-gray-900',
    disabled: 'opacity-50 cursor-not-allowed hover:bg-transparent',
  },
};

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  showFirstLast = true,
  showPageInfo = false,
  maxVisiblePages = 7,
  className,
  buttonClassName,
  activeButtonClassName,
  disabled = false,
  size = 'md',
  variant = 'default',
  align = 'center',
  showItemsPerPage = false,
  itemsPerPageOptions = [10, 20, 50, 100],
  onItemsPerPageChange,
  ariaLabel,
}) => {
  const { t } = useTranslation();

  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - halfVisible);
    let end = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust range if too close to start or end
    if (currentPage <= halfVisible + 1) {
      end = maxVisiblePages - 1;
    } else if (currentPage >= totalPages - halfVisible) {
      start = totalPages - maxVisiblePages + 2;
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Handle page change with validation
  const handlePageChange = useCallback(
    (page: number) => {
      if (disabled || page < 1 || page > totalPages || page === currentPage) {
        return;
      }
      onPageChange(page);
    },
    [currentPage, totalPages, onPageChange, disabled]
  );

  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newItemsPerPage = parseInt(event.target.value, 10);
      if (onItemsPerPageChange && !isNaN(newItemsPerPage)) {
        onItemsPerPageChange(newItemsPerPage);
      },
    [onItemsPerPageChange]
  );

  // Calculate current items range
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];

  const buttonBaseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    sizes.button,)
    variants.button,
    buttonClassName
  );

  const activeClasses = cn(
    buttonBaseClasses,)
    variants.activeButton,
    activeButtonClassName
  );

  const disabledClasses = cn(
    buttonBaseClasses,)
    variants.disabled
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex flex-col gap-4', className)}
      aria-label={ariaLabel || t('pagination.ariaLabel')}
    >
      {/* Page info and items per page selector */}
      {(showPageInfo || showItemsPerPage) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {showPageInfo && totalItems && (
            <span className={cn('text-gray-700', sizes.info)}>
              {t('pagination.showingItems', {
                start: startItem,
                end: endItem,
                total: totalItems,
              })}
            </span>
          )}
          
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="items-per-page"
                className={cn('text-gray-700', sizes.info)}
              >
                {t('pagination.itemsPerPage')}:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                disabled={disabled}
                className={cn(
                  'rounded-md border border-gray-300 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                  sizes.select,
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className={cn('flex items-center gap-1', alignClasses[align])}>
        {/* First page button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            className={currentPage === 1 || disabled ? disabledClasses : buttonBaseClasses}
            aria-label={t('pagination.firstPage')}
            title={t('pagination.firstPage')}
          >
            {t('pagination.first')}
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={currentPage === 1 || disabled ? disabledClasses : buttonBaseClasses}
          aria-label={t('pagination.previousPage')}
          title={t('pagination.previousPage')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={cn('inline-flex items-center justify-center', sizes.button)}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              disabled={disabled}
              className={isActive ? activeClasses : disabled ? disabledClasses : buttonBaseClasses}
              aria-label={t('pagination.goToPage', { page: pageNumber })}
              aria-current={isActive ? 'page' : undefined}
              title={t('pagination.goToPage', { page: pageNumber })}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={currentPage === totalPages || disabled ? disabledClasses : buttonBaseClasses}
          aria-label={t('pagination.nextPage')}
          title={t('pagination.nextPage')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            className={currentPage === totalPages || disabled ? disabledClasses : buttonBaseClasses}
            aria-label={t('pagination.lastPage')}
            title={t('pagination.lastPage')}
          >
            {t('pagination.last')}
          </button>
        )}
      </div>

      {/* Page indicator for mobile */}
      <div className={cn('text-center sm:hidden', sizes.info)}>
        <span className="text-g
}
}
