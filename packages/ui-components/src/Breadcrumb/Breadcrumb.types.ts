import { ReactNode } from 'react';

export interface BreadcrumbItem {
  /**
   * Unique identifier for the breadcrumb item
   */
  id: string;
  
  /**
   * Display label for the breadcrumb item
   */
  label: string;
  
  /**
   * URL path for the breadcrumb item
   */
  href?: string;
  
  /**
   * Icon component to display before the label
   */
  icon?: ReactNode;
  
  /**
   * Whether this is the current/active page
   */
  isActive?: boolean;
  
  /**
   * Whether the breadcrumb item is disabled
   */
  isDisabled?: boolean;
  
  /**
   * Additional metadata for the breadcrumb item
   */
  metadata?: Record<string, any>;
  
  /**
   * Aria label for accessibility
   */
  ariaLabel?: string;
}

export interface BreadcrumbSeparator {
  /**
   * Type of separator
   */
  type: 'icon' | 'text' | 'custom';
  
  /**
   * Content of the separator
   */
  content?: ReactNode | string;
  
  /**
   * Custom class name for separator styling
   */
  className?: string;
}

export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[];
  
  /**
   * Custom separator between breadcrumb items
   */
  separator?: BreadcrumbSeparator;
  
  /**
   * Maximum number of items to display before collapsing
   */
  maxItems?: number;
  
  /**
   * Whether to show home icon as first item
   */
  showHome?: boolean;
  
  /**
   * Custom home item configuration
   */
  homeItem?: Partial<BreadcrumbItem>;
  
  /**
   * Callback when a breadcrumb item is clicked
   */
  onItemClick?: (item: BreadcrumbItem, event: React.MouseEvent) => void;
  
  /**
   * Custom class name for the breadcrumb container
   */
  className?: string;
  
  /**
   * Size variant of the breadcrumb
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Color scheme for the breadcrumb
   */
  variant?: 'light' | 'dark' | 'primary' | 'secondary';
  
  /**
   * Whether to show tooltips on hover
   */
  showTooltips?: boolean;
  
  /**
   * Position of tooltips
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Whether breadcrumb items should wrap on small screens
   */
  responsive?: boolean;
  
  /**
   * Custom render function for breadcrumb items
   */
  renderItem?: (item: BreadcrumbItem, index: number) => ReactNode;
  
  /**
   * Whether to animate breadcrumb transitions
   */
  animated?: boolean;
  
  /**
   * Schema.org structured data configuration
   */
  structuredData?: boolean;
  
  /**
   * ARIA label for the breadcrumb navigation
   */
  ariaLabel?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface BreadcrumbItemProps extends BreadcrumbItem {
  /**
   * Whether this is the last item in the breadcrumb
   */
  isLast?: boolean;
  
  /**
   * Click handler for the item
   */
  onClick?: (event: React.MouseEvent) => void;
  
  /**
   * Custom class name for the item
   */
  className?: string;
  
  /**
   * Size inherited from parent
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Variant inherited from parent
   */
  variant?: 'light' | 'dark' | 'primary' | 'secondary';
}

export interface BreadcrumbCollapsedProps {
  /**
   * Items that are collapsed
   */
  items: BreadcrumbItem[];
  
  /**
   * Callback when expanded
   */
  onExpand?: () => void;
  
  /**
   * Custom label for collapsed indicator
   */
  label?: string;
  
  /**
   * Custom class name
   */
  className?: string;
}

export interface BreadcrumbConfig {
  /**
   * Default separator configuration
   */
  defaultSeparator?: BreadcrumbSeparator;
  
  /**
   * Default max items before collapse
   */
  defaultMaxItems?: number;
  
  /**
   * Default home configuration
   */
  defaultHome?: Partial<BreadcrumbItem>;
  
  /**
   * Route mapping for automatic breadcrumb generation
   */
  routeMapping?: Record<string, string>;
  
  /**
   * Custom route parser function
   */
  routeParser?: (path: string) => BreadcrumbItem[];
  
  /**
   * Localization configuration
   */
  i18n?: {
    locale: 'en' | 'bg';
    translations?: Record<string, string>;
  };
}

export type BreadcrumbTheme = {
  container: string;
  item: string;
  activeItem: string;
  disabledItem: string;
  separator: string;
  icon: string;
  collapsed: string;
  sizes: {
    small: string;
    medium: string;
    large: string;
  };
  variants: {
    light: string;
    dark: string;
    primary: string;
    secondary: string;
  };
};
