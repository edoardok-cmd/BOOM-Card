import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'square';

export interface BadgeProps {
  /**
   * Content to be displayed inside the badge
   */
  children: ReactNode;
  
  /**
   * Visual style variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;
  
  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;
  
  /**
   * Shape of the badge
   * @default 'rounded'
   */
  shape?: BadgeShape;
  
  /**
   * Icon to display before the badge content
   */
  icon?: ReactNode;
  
  /**
   * Icon to display after the badge content
   */
  iconEnd?: ReactNode;
  
  /**
   * Whether the badge should be displayed as an outline style
   * @default false
   */
  outline?: boolean;
  
  /**
   * Whether the badge should have a subtle appearance
   * @default false
   */
  subtle?: boolean;
  
  /**
   * Whether the badge should have a dot indicator
   * @default false
   */
  dot?: boolean;
  
  /**
   * Position of the dot indicator when used with dot prop
   * @default 'start'
   */
  dotPosition?: 'start' | 'end';
  
  /**
   * Whether the badge is clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Click handler for clickable badges
   */
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  
  /**
   * Whether the badge can be removed/dismissed
   * @default false
   */
  removable?: boolean;
  
  /**
   * Handler called when the remove button is clicked
   */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Maximum width of the badge content before truncation
   */
  maxWidth?: string | number;
  
  /**
   * Whether to truncate overflowing text with ellipsis
   * @default false
   */
  truncate?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
  
  /**
   * Data attribute for testing
   */
  'data-testid'?: string;
  
  /**
   * Accessibility label
   */
  'aria-label'?: string;
  
  /**
   * Whether the badge represents a live/dynamic value
   * @default false
   */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  
  /**
   * Role for accessibility
   */
  role?: string;
  
  /**
   * Tab index for keyboard navigation
   */
  tabIndex?: number;
}

export interface BadgeGroupProps {
  /**
   * Badge components to group together
   */
  children: ReactNode;
  
  /**
   * Spacing between badges
   * @default 'sm'
   */
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  
  /**
   * Maximum number of badges to show before collapsing
   */
  max?: number;
  
  /**
   * Text to show for collapsed badges count
   * @example "+{count} more"
   */
  moreText?: (count: number) => string;
  
  /**
   * Whether to wrap badges to new line
   * @default true
   */
  wrap?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Data attribute for testing
   */
  'data-testid'?: string;
}

export interface BadgeCountProps extends Omit<BadgeProps, 'children'> {
  /**
   * Numeric value to display
   */
  count: number;
  
  /**
   * Maximum count to display before showing overflow
   * @default 99
   */
  max?: number;
  
  /**
   * Whether to show zero count
   * @default false
   */
  showZero?: boolean;
  
  /**
   * Custom overflow indicator
   * @default '+'
   */
  overflowIndicator?: string;
}

export interface BadgeStatusProps extends Omit<BadgeProps, 'children' | 'variant'> {
  /**
   * Status type
   */
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'new' | 'verified' | 'featured';
  
  /**
   * Custom status text (overrides default)
   */
  text?: string;
  
  /**
   * Whether to show a pulsing animation for certain statuses
   * @default false
   */
  pulse?: boolean;
}

export interface BadgeDiscountProps extends Omit<BadgeProps, 'children'> {
  /**
   * Discount percentage value
   */
  value: number;
  
  /**
   * Currency symbol for fixed discounts
   */
  currency?: string;
  
  /**
   * Whether it's a percentage or fixed amount discount
   * @default 'percentage'
   */
  type?: 'percentage' | 'fixed';
  
  /**
   * Prefix text
   * @default 'Save'
   */
  prefix?: string;
  
  /**
   * Whether to show the prefix
   * @default true
   */
  showPrefix?: boolean;
}
