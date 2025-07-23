import React, { useEffect, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useClickOutside } from '../../hooks/useClickOutside';
import { IconButton } from '../IconButton';
import { Typography } from '../Typography';
import { AnimatePresence, motion } from 'framer-motion';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  /**
   * Controls whether the drawer is open or closed
   */
  isOpen: boolean;
  
  /**
   * Callback function called when the drawer should be closed
   */
  onClose: () => void;
  
  /**
   * The position from which the drawer slides in
   * @default 'right'
   */
  position?: DrawerPosition;
  
  /**
   * The size of the drawer
   * @default 'md'
   */
  size?: DrawerSize;
  
  /**
   * Optional title displayed in the drawer header
   */
  title?: ReactNode;
  
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: ReactNode;
  
  /**
   * The main content of the drawer
   */
  children: ReactNode;
  
  /**
   * Optional footer content
   */
  footer?: ReactNode;
  
  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Whether to close the drawer when clicking outside
   * @default true
   */
  closeOnClickOutside?: boolean;
  
  /**
   * Whether to close the drawer when pressing Escape
   * @default true
   */
  closeOnEscape?: boolean;
  
  /**
   * Whether to show an overlay behind the drawer
   * @default true
   */
  showOverlay?: boolean;
  
  /**
   * Custom overlay class name
   */
  overlayClassName?: string;
  
  /**
   * Custom drawer class name
   */
  className?: string;
  
  /**
   * Custom header class name
   */
  headerClassName?: string;
  
  /**
   * Custom body class name
   */
  bodyClassName?: string;
  
  /**
   * Custom footer class name
   */
  footerClassName?: string;
  
  /**
   * Custom close button aria-label
   */
  closeButtonAriaLabel?: string;
  
  /**
   * Z-index for the drawer
   * @default 50
   */
  zIndex?: number;
  
  /**
   * Callback fired after the drawer opens
   */
  onAfterOpen?: () => void;
  
  /**
   * Callback fired after the drawer closes
   */
  onAfterClose?: () => void;
  
  /**
   * Whether to lock body scroll when drawer is open
   * @default true
   */
  lockBodyScroll?: boolean;
  
  /**
   * Custom styles for the drawer
   */
  style?: CSSProperties;
  
  /**
   * Data test id for testing
   */
  dataTestId?: string;
}

const sizeClasses: Record<DrawerSize, Record<DrawerPosition, string>> = {
  sm: {
    left: 'w-80 h-full',
    right: 'w-80 h-full',
    top: 'w-full h-48',
    bottom: 'w-full h-48',
  },
  md: {
    left: 'w-96 h-full',
    right: 'w-96 h-full',
    top: 'w-full h-64',
    bottom: 'w-full h-64',
  },
  lg: {
    left: 'w-[448px] h-full',
    right: 'w-[448px] h-full',
    top: 'w-full h-80',
    bottom: 'w-full h-80',
  },
  xl: {
    left: 'w-[512px] h-full',
    right: 'w-[512px] h-full',
    top: 'w-full h-96',
    bottom: 'w-full h-96',
  },
  full: {
    left: 'w-full h-full',
    right: 'w-full h-full',
    top: 'w-full h-full',
    bottom: 'w-full h-full',
  },
};

const positionClasses: Record<DrawerPosition, string> = {
  left: 'left-0 top-0',
  right: 'right-0 top-0',
  top: 'top-0 left-0',
  bottom: 'bottom-0 left-0',
};

const getMotionProps = (position: DrawerPosition) => {
  const baseProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  };

  switch (position) {
    case 'left':
      return {
        ...baseProps,
        initial: { ...baseProps.initial, x: '-100%' },
        animate: { ...baseProps.animate, x: 0 },
        exit: { ...baseProps.exit, x: '-100%' },
      };
    case 'right':
      return {
        ...baseProps,
        initial: { ...baseProps.initial, x: '100%' },
        animate: { ...baseProps.animate, x: 0 },
        exit: { ...baseProps.exit, x: '100%' },
      };
    case 'top':
      return {
        ...baseProps,
        initial: { ...baseProps.initial, y: '-100%' },
        animate: { ...baseProps.animate, y: 0 },
        exit: { ...baseProps.exit, y: '-100%' },
      };
    case 'bottom':
      return {
        ...baseProps,
        initial: { ...baseProps.initial, y: '100%' },
        animate: { ...baseProps.animate, y: 0 },
        exit: { ...baseProps.exit, y: '100%' },
      };
    default:
      return baseProps;
  };

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  title,
  subtitle,
  children,
  footer,
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  showOverlay = true,
  overlayClassName,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  closeButtonAriaLabel,
  zIndex = 50,
  onAfterOpen,
  onAfterClose,
  lockBodyScroll = true,
  style,
  dataTestId = 'drawer',
}) => {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Lock body scroll when drawer is open
  useLockBodyScroll(isOpen && lockBodyScroll);

  // Handle escape key press
  useEscapeKey(() => {
    if (isOpen && closeOnEscape) {
      onClose();
    });

  // Trap focus within drawer
  useFocusTrap(drawerRef, isOpen);

  // Handle click outside
  useClickOutside(drawerRef, () => {
    if (isOpen && closeOnClickOutside && showOverlay) {
      onClose();
    });

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the drawer or first focusable element
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (drawerRef.current) {
        drawerRef.current.focus();
      }

      onAfterOpen?.();
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
      
      onAfterClose?.();
    }, [isOpen, onAfterOpen, onAfterClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Additional keyboard navigation can be implemented here
    if (event.key === 'Tab') {
      // Tab navigation is handled by useFocusTrap
    }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div)
          className="fixed inset-0"
          style={{ zIndex }}
          data-testid={`${dataTestId}-container`}
        >
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'absolute inset-0 bg-black/50 backdrop-blur-sm',
                overlayClassName
              )}
              onClick={() => closeOnClickOutside && onClose()}
              aria-hidden="true"
              data-testid={`${dataTestId}-overlay`}
            />
          )}

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            {...getMotionProps(position)}
            className={cn(
              'fixed bg-white dark:bg-gray-900 shadow-xl flex flex-col',
              sizeClasses[size][position],
              positionClasses[position],)
              className
            )}
            style={style}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? `${dataTestId}-title` : undefined}
            aria-describedby={subtitle ? `${dataTestId}-subtitle` : undefined}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            data-testid={dataTestId}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700',
                  headerClassName
                )}
                data-testid={`${dataTestId}-header`}
              >
                <div className="flex-1">
                  {title && (
                    <Typography
                      variant="h3"
                      id={`${dataTestId}-title`}
                      className="text-gray-900 dark:text-white"
                    >
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography
                      variant="body2"
                      id={`${dataTestId}-subtitle`}
                      className="mt-1 text-gray-600 dark:text-gray-400"
                    >
                      {subtitle}
                    </Typography>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    icon={X}
                    onClick={onClose}
                    aria-label={closeButtonAriaLabel || t('common.close')}
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    d
}}}}
}
}
}
}
}
