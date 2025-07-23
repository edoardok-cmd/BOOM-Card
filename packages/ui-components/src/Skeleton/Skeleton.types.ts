import { HTMLAttributes, CSSProperties } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The width of the skeleton
   * @default '100%'
   */
  width?: string | number;

  /**
   * The height of the skeleton
   * @default '1.2em'
   */
  height?: string | number;

  /**
   * The border radius of the skeleton
   * @default '4px'
   */
  borderRadius?: string | number;

  /**
   * The variant of the skeleton
   * @default 'text'
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';

  /**
   * The animation type
   * @default 'pulse'
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * The animation duration in milliseconds
   * @default 1500
   */
  animationDuration?: number;

  /**
   * The background color of the skeleton
   * @default 'rgba(0, 0, 0, 0.08)'
   */
  backgroundColor?: string;

  /**
   * The highlight color for wave animation
   * @default 'rgba(255, 255, 255, 0.05)'
   */
  highlightColor?: string;

  /**
   * Number of skeleton lines to render (for text variant)
   * @default 1
   */
  lines?: number;

  /**
   * Spacing between skeleton lines (for multi-line text)
   * @default '8px'
   */
  lineSpacing?: string | number;

  /**
   * Whether to show the skeleton inline
   * @default false
   */
  inline?: boolean;

  /**
   * Custom styles to apply to the skeleton
   */
  style?: CSSProperties;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;

  /**
   * Whether the skeleton is loading
   * @default true
   */
  loading?: boolean;

  /**
   * Children to render when not loading
   */
  children?: React.ReactNode;

  /**
   * Delay before showing the skeleton (in milliseconds)
   * @default 0
   */
  delay?: number;

  /**
   * Whether to enable smooth transitions
   * @default true
   */
  enableTransition?: boolean;

  /**
   * Custom transition duration (in milliseconds)
   * @default 300
   */
  transitionDuration?: number;
}

export interface SkeletonContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the container is loading
   * @default true
   */
  loading?: boolean;

  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;

  /**
   * Spacing between skeleton items
   * @default '16px'
   */
  spacing?: string | number;

  /**
   * Direction of skeleton items
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Children to render when not loading
   */
  children?: React.ReactNode;

  /**
   * Custom skeleton component to render
   */
  skeleton?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: CSSProperties;
}

export interface SkeletonCardProps extends SkeletonProps {
  /**
   * Show avatar skeleton
   * @default false
   */
  showAvatar?: boolean;

  /**
   * Avatar size
   * @default 40
   */
  avatarSize?: number;

  /**
   * Show media skeleton (image/video placeholder)
   * @default false
   */
  showMedia?: boolean;

  /**
   * Media height
   * @default '200px'
   */
  mediaHeight?: string | number;

  /**
   * Show actions skeleton
   * @default false
   */
  showActions?: boolean;

  /**
   * Number of action buttons
   * @default 2
   */
  actionCount?: number;

  /**
   * Card padding
   * @default '16px'
   */
  padding?: string | number;

  /**
   * Show title skeleton
   * @default true
   */
  showTitle?: boolean;

  /**
   * Show description skeleton
   * @default true
   */
  showDescription?: boolean;

  /**
   * Number of description lines
   * @default 3
   */
  descriptionLines?: number;
}

export interface SkeletonTableProps extends SkeletonProps {
  /**
   * Number of rows to render
   * @default 5
   */
  rows?: number;

  /**
   * Number of columns to render
   * @default 4
   */
  columns?: number;

  /**
   * Show table header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Row height
   * @default '52px'
   */
  rowHeight?: string | number;

  /**
   * Column widths (array or single value)
   */
  columnWidths?: (string | number)[] | string | number;

  /**
   * Cell padding
   * @default '16px'
   */
  cellPadding?: string | number;

  /**
   * Table border radius
   * @default '8px'
   */
  tableBorderRadius?: string | number;
}

export interface SkeletonListProps extends SkeletonProps {
  /**
   * Number of list items
   * @default 3
   */
  items?: number;

  /**
   * Show item avatar
   * @default false
   */
  showAvatar?: boolean;

  /**
   * Avatar position
   * @default 'start'
   */
  avatarPosition?: 'start' | 'end';

  /**
   * Show secondary text
   * @default false
   */
  showSecondaryText?: boolean;

  /**
   * Show item actions
   * @default false
   */
  showActions?: boolean;

  /**
   * Item spacing
   * @default '8px'
   */
  itemSpacing?: string | number;

  /**
   * Item padding
   * @default '12px'
   */
  itemPadding?: string | number;
}

export interface SkeletonFormProps extends SkeletonProps {
  /**
   * Number of form fields
   * @default 3
   */
  fields?: number;

  /**
   * Show field labels
   * @default true
   */
  showLabels?: boolean;

  /**
   * Field height
   * @default '40px'
   */
  fieldHeight?: string | number;

  /**
   * Label width
   * @default '80px'
   */
  labelWidth?: string | number;

  /**
   * Field spacing
   * @default '16px'
   */
  fieldSpacing?: string | number;

  /**
   * Show submit button
   * @default true
   */
  showSubmitButton?: boolean;

  /**
   * Button width
   * @default '120px'
   */
  buttonWidth?: string | number;
}

export interface SkeletonImageProps extends SkeletonProps {
  /**
   * Aspect ratio (width/height)
   */
  aspectRatio?: number;

  /**
   * Show image icon overlay
   * @default true
   */
  showIcon?: boolean;

  /**
   * Icon size
   * @default 48
   */
  iconSize?: number;

  /**
   * Image fit behavior
   * @default 'cover'
   */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';
export type SkeletonDirection = 'horizontal' | 'vertical';
