import { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export interface TableColumn<T = any> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => any);
  cell?: (info: { row: T; value: any; index: number }) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  cellClassName?: string | ((row: T) => string);
  sticky?: 'left' | 'right';
  hidden?: boolean;
  exportable?: boolean;
  sortFn?: (rowA: T, rowB: T) => number;
  filterFn?: (row: T, filterValue: any) => boolean;
}

export interface TableSortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TableFilterState {
  columnId: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
}

export interface TablePaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableSelectionState {
  selectedRows: Set<string | number>;
  isAllSelected: boolean;
}

export interface TableExpandedState {
  expandedRows: Set<string | number>;
}

export interface TableProps<T = any> extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
  // Data
  data: T[];
  columns: TableColumn<T>[];
  
  // Row identification
  getRowId?: (row: T, index: number) => string | number;
  
  // Sorting
  sortable?: boolean;
  defaultSort?: TableSortState;
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState | undefined) => void;
  multiSort?: boolean;
  
  // Filtering
  filterable?: boolean;
  filters?: TableFilterState[];
  onFiltersChange?: (filters: TableFilterState[]) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  
  // Pagination
  pagination?: TablePaginationState;
  onPaginationChange?: (pagination: TablePaginationState) => void;
  totalRows?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  
  // Selection
  selectable?: boolean;
  selection?: TableSelectionState;
  onSelectionChange?: (selection: TableSelectionState) => void;
  selectOnRowClick?: boolean;
  
  // Expansion
  expandable?: boolean;
  expanded?: TableExpandedState;
  onExpandedChange?: (expanded: TableExpandedState) => void;
  renderExpandedRow?: (row: T) => ReactNode;
  
  // Row actions
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string);
  
  // Loading & empty states
  loading?: boolean;
  loadingComponent?: ReactNode;
  emptyMessage?: string | ReactNode;
  emptyComponent?: ReactNode;
  
  // Layout
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;
  responsive?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  
  // Export
  exportable?: boolean;
  onExport?: (data: T[], columns: TableColumn<T>[]) => void;
  exportFormats?: ('csv' | 'excel' | 'pdf')[];
  
  // Virtualization
  virtualized?: boolean;
  rowHeight?: number | ((index: number) => number);
  overscan?: number;
  
  // Custom components
  headerComponent?: ReactNode;
  footerComponent?: ReactNode;
  toolbarComponent?: ReactNode;
  
  // Localization
  locale?: 'en' | 'bg';
  translations?: TableTranslations;
}

export interface TableTranslations {
  noData: string;
  loading: string;
  search: string;
  filter: string;
  sort: string;
  sortAsc: string;
  sortDesc: string;
  clearSort: string;
  clearFilter: string;
  selectAll: string;
  deselectAll: string;
  selectedCount: string;
  showMore: string;
  showLess: string;
  page: string;
  of: string;
  rows: string;
  rowsPerPage: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  export: string;
  exportCSV: string;
  exportExcel: string;
  exportPDF: string;
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  column: TableColumn;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
  onSort?: () => void;
  filterable?: boolean;
  onFilter?: (value: any) => void;
  resizable?: boolean;
  onResize?: (width: number) => void;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  column: TableColumn;
  row: any;
  rowIndex: number;
  value: any;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  row: any;
  rowIndex: number;
  columns: TableColumn[];
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  expanded?: boolean;
  onExpand?: (expanded: boolean) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export interface TableToolbarProps {
  selectedCount?: number;
  onClearSelection?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  exportFormats?: ('csv' | 'excel' | 'pdf')[];
  customActions?: ReactNode;
}

export interface TablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  locale?: 'en' | 'bg';
  translations?: TableTranslations;
}

export interface TableFilterProps {
  column: TableColumn;
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
  locale?: 'en' | 'bg';
}

export interface TableExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
  visibleColumnsOnly?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  customHeaders?: Record<string, string>;
}

export interface TableVirtualizationOptions {
  enabled: boolean;
  rowHeight: number | ((index: number) => number);
  overscan: number;
  containerHeight: number;
  scrollTop: number;
  onScroll: (scrollTop: number) => void;
}

export interface TableState<T = any> {
  data: T[];
  processedData: T[];
  sort?: TableSortState;
  filters: TableFilterState[];
  globalFilter: string;
  pagination: TablePaginationState;
  selection: TableSelectionState;
  expanded: TableExpandedState;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
}

export interface UseTableOptions<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T, index: number) => string | number;
  initialState?: Partial<TableState<T>>;
  onStateChange?: (state: TableState<T>) => void;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  manualGlobalFilter?: boolean;
  autoResetSortBy?: boolean;
  autoResetFilters?: boolean;
  autoResetGlobalFilter?: boolean;
  autoResetSelectedRows?: boolean;
  autoResetExpanded?: boolean;
}

export interface UseTableReturn<T = any> {
  table: TableState<T>;
  getTableProps: () => HTMLAttributes<HTMLTableElement>;
  getTableBodyProps: () => HTMLAttributes<HTMLTableSectionElement>;
  headerGroups: TableColumn<T>[][];
  rows: T[];
  prepareRow: (row: T) => void;
  toggleSort: (columnId: string, multi?: boolean) => void;
  setFilter: (columnId: string, value: any) => void;
  setGlobalFilter: (value: string) => void;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  toggleRowSelected: (rowId: string | number) => void;
  toggleAllRowsSelected: (selected?: boolean) => void;
  toggleRowExpanded: (rowId: string | number) => void;
  toggleAllRowsExpanded: (expanded?: boolean) => void;
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  setColumnOrder: (columnOrder: string[]) => void;
  setColumnSizing: (columnId: string, size: number) => void;
  resetState: () => void;
}
