import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-100',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-100',
        info:
          'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-100',
        premium:
          'border-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md hover:shadow-lg',
        discount:
          'border-transparent bg-red-500 text-white font-bold hover:bg-red-600',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * The content to be displayed in the badge
   */
  children: React.ReactNode;
  /**
   * Icon to display before the badge content
   */
  icon?: React.ReactNode;
  /**
   * Icon to display after the badge content
   */
  endIcon?: React.ReactNode;
  /**
   * Whether the badge should have a pulsing animation (useful for notifications)
   */
  pulse?: boolean;
  /**
   * Custom dot indicator color (for status badges)
   */
  dotColor?: 'green' | 'red' | 'yellow' | 'blue';
  /**
   * Whether to show a dot indicator
   */
  showDot?: boolean;
  /**
   * Maximum width for the badge content (useful for long text)
   */
  maxWidth?: string;
  /**
   * Whether the badge content should be truncated with ellipsis
   */
  truncate?: boolean;
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

const dotColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
};

/**
 * Badge component for displaying labels, statuses, or small pieces of information
 * Used throughout the BOOM Card platform for discount percentages, partner statuses, etc.
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      children,
      icon,
      endIcon,
      pulse = false,
      showDot = false,
      dotColor = 'green',
      maxWidth,
      truncate = false,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const badgeContent = (
      <>
        {showDot && (
          <span
            className={cn(
              'mr-1.5 h-2 w-2 rounded-full',
              dotColors[dotColor],
              pulse && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}
        {icon && <span className="mr-1.5" aria-hidden="true">{icon}</span>}
        <span
          className={cn(
            truncate && 'truncate',
            maxWidth && `max-w-[${maxWidth}]`
          )}
        >
          {children}
        </span>
        {endIcon && <span className="ml-1.5" aria-hidden="true">{endIcon}</span>}
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && !showDot && 'animate-pulse',
          maxWidth && 'max-w-fit',
          className
        )}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        {badgeContent}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Specialized badge components for common use cases in BOOM Card

interface DiscountBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  percentage: number;
  /**
   * Whether to show the % symbol
   */
  showPercentSymbol?: boolean;
}

/**
 * Specialized badge for displaying discount percentages
 */
export const DiscountBadge = React.forwardRef<HTMLDivElement, DiscountBadgeProps>(
  ({ percentage, showPercentSymbol = true, className, ...props }, ref) => {
    const formattedPercentage = showPercentSymbol ? `${percentage}%` : percentage.toString();
    
    return (
      <Badge
        ref={ref}
        variant="discount"
        className={cn('font-mono', className)}
        ariaLabel={`${percentage} percent discount`}
        {...props}
      >
        -{formattedPercentage}
      </Badge>
    );
  }
);

DiscountBadge.displayName = 'DiscountBadge';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'expired';
}

/**
 * Specialized badge for displaying partner or subscription status
 */
export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusConfig = {
      active: { variant: 'success' as const, dotColor: 'green' as const },
      inactive: { variant: 'secondary' as const, dotColor: 'red' as const },
      pending: { variant: 'warning' as const, dotColor: 'yellow' as const },
      expired: { variant: 'destructive' as const, dotColor: 'red' as const },
    };

    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        showDot
        dotColor={config.dotColor}
        className={className}
        ariaLabel={`Status: ${status}`}
        {...props}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

interface CategoryBadgeProps extends Omit<BadgeProps, 'variant'> {
  category: string;
  /**
   * Optional icon for the category
   */
  categoryIcon?: React.ReactNode;
}

/**
 * Specialized badge for displaying venue categories
 */
export const CategoryBadge = React.forwardRef<HTMLDivElement, CategoryBadgeProps>(
  ({ category, categoryIcon, className, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="outline"
        icon={categoryIcon}
        className={className}
        ariaLabel={`Category: ${category}`}
        {...props}
      >
        {category}
      </Badge>
    );
  }
);

CategoryBadge.displayName = 'CategoryBadge';

// Export all components and types
export { badgeVariants };
export type { DiscountBadgeProps, StatusBadgeProps, CategoryBadgeProps };
