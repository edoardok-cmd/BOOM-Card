import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-lg border p-4 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      },
      size: {
        sm: 'text-sm p-3',
        default: 'text-base p-4',
        lg: 'text-lg p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const iconMap = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  default: InformationCircleIcon,
};

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  default: 'text-foreground',
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  action?: React.ReactNode;
  banner?: boolean;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      title,
      description,
      icon,
      showIcon = true,
      closable = false,
      onClose,
      autoClose = false,
      autoCloseDelay = 5000,
      action,
      banner = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const IconComponent = iconMap[variant || 'default'];
    const iconColor = iconColorMap[variant || 'default'];

    useEffect(() => {
      if (autoClose && !isHovered) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }, [autoClose, autoCloseDelay, isHovered]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 200); // Wait for animation to complete
    };

    const renderIcon = () => {
      if (!showIcon) return null;

      if (icon) {
        return <div className="flex-shrink-0">{icon}</div>;
      }

      return (
        <IconComponent
          className={cn('h-5 w-5 flex-shrink-0', iconColor)}
          aria-hidden="true"
        />
      );
    };

    const renderCloseButton = () => {
      if (!closable) return null;

      return (
        <button
          type="button"
          onClick={handleClose}
          className={cn(
            'absolute top-4 right-4 inline-flex rounded-md p-1.5',
            'hover:bg-black/5 dark:hover:bg-white/5',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150',
            variant === 'success' && 'focus:ring-green-600',
            variant === 'warning' && 'focus:ring-yellow-600',
            variant === 'error' && 'focus:ring-red-600',
            variant === 'info' && 'focus:ring-blue-600',
            variant === 'default' && 'focus:ring-primary'
          )}
          aria-label="Close alert"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              alertVariants({ variant, size }),
              banner && 'rounded-none border-x-0 border-t-0',
              closable && 'pr-12',
              className
            )}
            role="alert"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            {renderIcon()}
            
            <div className="flex-1">
              {title && (
                <h3 className="font-semibold mb-1 leading-tight">
                  {title}
                </h3>
              )}
              
              {description && (
                <div className="text-sm opacity-90">
                  {description}
                </div>
              )}
              
              {children && (
                <div className={cn(
                  'mt-2',
                  !title && !description && 'mt-0'
                )}>
                  {children}
                </div>
              )}
              
              {action && (
                <div className="mt-3 flex gap-2">
                  {action}
                </div>
              )}
            </div>
            
            {renderCloseButton()}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Alert.displayName = 'Alert';

// Alert Title component for semantic structure
export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('font-semibold leading-tight tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
);

AlertTitle.displayName = 'AlertTitle';

// Alert Description component
export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = 'AlertDescription';

// Compound component exports
export default Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription,
});

}
