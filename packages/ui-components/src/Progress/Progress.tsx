import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
  barClassName?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const variantStyles = {
  default: 'bg-primary-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  info: 'bg-blue-600'
};

const animationStyles = {
  animated: 'transition-all duration-300 ease-in-out',
  striped: 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px] animate-[progress-stripes_1s_linear_infinite]',
  indeterminate: 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]'
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      className,
      barClassName,
      animated = true,
      striped = false,
      indeterminate = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    // Ensure value is within bounds
    const normalizedValue = Math.min(Math.max(0, value), max);
    const percentage = (normalizedValue / max) * 100;

    // Generate unique ID for accessibility
    const progressId = React.useId();
    const labelId = `${progressId}-label`;

    return (
      <div className={cn('w-full', className)} {...props}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <span id={labelId} className="text-sm font-medium text-gray-700">
                {label}
              </span>
            )}
            {showLabel && !indeterminate && (
              <span className="text-sm font-medium text-gray-700">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : normalizedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy || (label ? labelId : undefined)}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'w-full bg-gray-200 rounded-full overflow-hidden',
            sizeStyles[size]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full',
              variantStyles[variant],
              animated && animationStyles.animated,
              striped && animationStyles.striped,
              indeterminate && animationStyles.indeterminate,
              barClassName
            )}
            style={{
              width: indeterminate ? '100%' : `${percentage}%`,
              transformOrigin: 'left center'
            }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Compound components for more complex progress scenarios
export interface ProgressGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ProgressGroup: React.FC<ProgressGroupProps> = ({ children, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};

export interface MultiProgressProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const MultiProgress: React.FC<MultiProgressProps> = ({
  segments,
  max = 100,
  size = 'md',
  showTooltip = false,
  className
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(total, max)}
      className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden flex',
        sizeStyles[size],
        className
      )}
    >
      {segments.map((segment, index) => {
        
        return (
          <div
            key={index}
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              showTooltip && 'hover:opacity-80 cursor-pointer'
            )}
            style={{
              width: `${percentage}%`,
              backgroundColor: segment.color
            }}
            title={showTooltip ? `${segment.label || ''}: ${segment.value}` : undefined}
          />
        );
      })}
    </div>
  );
};

// Circular progress component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
  indeterminate?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className,
  indeterminate = false
}) => {
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const variantColors = {
    default: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };
  
  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className={cn(
          indeterminate && 'animate-spin',
          variantColors[variant]
        )}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {showLabel && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">
            {label || `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  );
};

// Export all components
export default Progress;
