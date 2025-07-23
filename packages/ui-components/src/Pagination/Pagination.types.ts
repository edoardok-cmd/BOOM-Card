import { ReactNode } from 'react';

export interface PaginationProps {
  /**
   * Current active page number (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Number of items per page
   */
  itemsPerPage: number;

  /**
   * Callback fired when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Number of page buttons to show on each side of current page
   * @default 1
   */
  siblingCount?: number;

  /**
   * Show first/last navigation buttons
   * @default true
   */
  showFirstLast?: boolean;

  /**
   * Show previous/next navigation buttons
   * @default true
   */
  showPrevNext?: boolean;

  /**
   * Show page size selector
   * @default false
   */
  showPageSizeSelector?: boolean;

  /**
   * Available page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];

  /**
   * Callback fired when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Show jump to page input
   * @default false
   */
  showJumpToPage?: boolean;

  /**
   * Show total items count
   * @default true
   */
  showTotalCount?: boolean;

  /**
   * Custom class name for the root element
   */
  className?: string;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Responsive configuration
   */
  responsive?: PaginationResponsiveConfig;

  /**
   * Internationalization labels
   */
  labels?: PaginationLabels;

  /**
   * Custom render functions
   */
  customRenders?: PaginationCustomRenders;

  /**
   * Accessibility props
   */
  ariaLabel?: string;
  ariaLabelledBy?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

export interface PaginationResponsiveConfig {
  /**
   * Hide certain elements on mobile
   */
  mobile?: {
    hideTotalCount?: boolean;
    hidePageSizeSelector?: boolean;
    hideJumpToPage?: boolean;
    siblingCount?: number;
  };

  /**
   * Tablet-specific configuration
   */
  tablet?: {
    siblingCount?: number;
  };
}

export interface PaginationLabels {
  /**
   * Label for previous button
   * @default 'Previous'
   */
  previous?: string;

  /**
   * Label for next button
   * @default 'Next'
   */
  next?: string;

  /**
   * Label for first page button
   * @default 'First'
   */
  first?: string;

  /**
   * Label for last page button
   * @default 'Last'
   */
  last?: string;

  /**
   * Label for page
   * @default 'Page'
   */
  page?: string;

  /**
   * Label for "of" (as in "Page 1 of 10")
   * @default 'of'
   */
  of?: string;

  /**
   * Label for items per page selector
   * @default 'Items per page'
   */
  itemsPerPage?: string;

  /**
   * Label for jump to page
   * @default 'Go to page'
   */
  jumpToPage?: string;

  /**
   * Function to generate total count label
   * @param start - Start index of current page items
   * @param end - End index of current page items
   * @param total - Total number of items
   */
  totalCount?: (start: number, end: number, total: number) => string;

  /**
   * Aria label for pagination navigation
   * @default 'Pagination Navigation'
   */
  ariaLabel?: string;

  /**
   * Aria label for page button
   * @param page - Page number
   */
  pageAriaLabel?: (page: number) => string;
}

export interface PaginationCustomRenders {
  /**
   * Custom render for page button
   */
  renderPageButton?: (props: PageButtonRenderProps) => ReactNode;

  /**
   * Custom render for navigation button
   */
  renderNavButton?: (props: NavButtonRenderProps) => ReactNode;

  /**
   * Custom render for ellipsis
   */
  renderEllipsis?: () => ReactNode;

  /**
   * Custom render for total count
   */
  renderTotalCount?: (props: TotalCountRenderProps) => ReactNode;
}

export interface PageButtonRenderProps {
  page: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}

export interface NavButtonRenderProps {
  type: 'first' | 'previous' | 'next' | 'last';
  isDisabled: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  'aria-label'?: string;
}

export interface TotalCountRenderProps {
  start: number;
  end: number;
  total: number;
  label: string;
}

export type PaginationItem = 
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; position: 'start' | 'end' }
  | { type: 'first' }
  | { type: 'previous' }
  | { type: 'next' }
  | { type: 'last' };

export interface UsePaginationOptions {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

export interface UsePaginationReturn {
  items: PaginationItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  startPage: number;
  endPage: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

export type PaginationContextValue = PaginationState & PaginationActions;
