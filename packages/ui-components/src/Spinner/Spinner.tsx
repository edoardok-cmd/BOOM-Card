import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface SpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color variant of the spinner
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'white';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Loading text to display below spinner
   */
  loadingText?: string;
  
  /**
   * Show spinner overlay
   * @default false
   */
  overlay?: boolean;
  
  /**
   * Overlay background opacity
   * @default 0.5
   */
  overlayOpacity?: number;
  
  /**
   * Spinner thickness
   * @default 'normal'
   */
  thickness?: 'thin' | 'normal' | 'thick';
  
  /**
   * Animation speed
   * @default 1
   */
  speed?: number;
  
  /**
   * Accessibility label
   */
  ariaLabel?: string;
  
  /**
   * Custom spinner content (for branded spinners)
   */
  customContent?: React.ReactNode;
  
  /**
   * Show percentage progress
   */
  progress?: number;
  
  /**
   * Center spinner in viewport
   * @default false
   */
  centered?: boolean;
  
  /**
   * Spinner style
   * @default 'circular'
   */
  style?: 'circular' | 'dots' | 'pulse' | 'bars';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const variantClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  white: 'text-white'
};

const thicknessClasses = {
  thin: 'border-2',
  normal: 'border-4',
  thick: 'border-8'
};

const dotSizes = {
  xs: 'h-1 w-1',
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4'
};

const barSizes = {
  xs: 'h-3 w-1',
  sm: 'h-4 w-1.5',
  md: 'h-8 w-2',
  lg: 'h-12 w-3',
  xl: 'h-16 w-4'
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  loadingText,
  overlay = false,
  overlayOpacity = 0.5,
  thickness = 'normal',
  speed = 1,
  ariaLabel = 'Loading',
  customContent,
  progress,
  centered = false,
  style = 'circular'
}) => {
  const spinnerContent = (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center',
        centered && 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      {customContent ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {customContent}
        </motion.div>
      ) : (
        <>
          {style === 'circular' && (
            <div className="relative">
              <motion.div
                className={cn(
                  sizeClasses[size],
                  'rounded-full border-t-transparent',
                  thicknessClasses[thickness],
                  variantClasses[variant],
                  'border-current'
                )}
                animate={{ rotate: 360 }}
                transition={{
                  duration: speed,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              {progress !== undefined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn('font-semibold', textSizeClasses[size], variantClasses[variant])}>
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </div>
          )}
          
          {style === 'dots' && (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    dotSizes[size],
                    'rounded-full',
                    variantClasses[variant],
                    'bg-current'
                  )}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: speed * 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          )}
          
          {style === 'pulse' && (
            <motion.div
              className={cn(
                sizeClasses[size],
                'rounded-full',
                variantClasses[variant],
                'bg-current'
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: speed * 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
          
          {style === 'bars' && (
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    barSizes[size],
                    'rounded-sm',
                    variantClasses[variant],
                    'bg-current'
                  )}
                  animate={{
                    scaleY: [1, 0.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: speed,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {loadingText && (
        <motion.p
          className={cn(
            'mt-2',
            textSizeClasses[size],
            variantClasses[variant]
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loadingText}
        </motion.p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <>
        <motion.div
          className="fixed inset-0 bg-black z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: overlayOpacity }}
          exit={{ opacity: 0 }}
        />
        {spinnerContent}
      </>
    );
  }

  return spinnerContent;
};

// Preset spinner configurations for common use cases
export const PageSpinner: React.FC<Partial<SpinnerProps>> = (props) => (
  <Spinner
    size="lg"
    centered
    overlay
    loadingText="Loading page..."
    {...props}
  />
);

export const ButtonSpinner: React.FC<Partial<SpinnerProps>> = (props) => (
  <Spinner
    size="sm"
    variant="white"
    thickness="thin"
    {...props}
  />
);

export const InlineSpinner: React.FC<Partial<SpinnerProps>> = (props) => (
  <Spinner
    size="xs"
    thickness="thin"
    {...props}
  />
);

export const CardSpinner: React.FC<Partial<SpinnerProps>> = (props) => (
  <Spinner
    size="md"
    centered
    loadingText="Loading content..."
    {...props}
  />
);

export const FormSpinner: React.FC<Partial<SpinnerProps>> = (props) => (
  <Spinner
    size="md"
    overlay
    overlayOpacity={0.7}
    loadingText="Submitting..."
    {...props}
  />
);
