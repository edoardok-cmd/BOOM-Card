import React, { useEffect, useRef, useCallback, ReactNode, MouseEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  preventScroll?: boolean;
  animationDuration?: number;
  zIndex?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  testId?: string;
  onOverlayClick?: () => void;
  onEscapePress?: () => void;
  onAnimationComplete?: () => void;
  customHeader?: ReactNode;
  position?: 'center' | 'top' | 'bottom';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

const positionClasses = {
  center: 'items-center',
  top: 'items-start pt-20',
  bottom: 'items-end pb-20'
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20
  };

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 };

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  footer,
  preventScroll = true,
  animationDuration = 0.2,
  zIndex = 50,
  ariaLabel,
  ariaDescribedBy,
  testId = 'modal',
  onOverlayClick,
  onEscapePress,
  onAnimationComplete,
  customHeader,
  position = 'center'
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const portalRoot = useRef<HTMLElement | null>(null);

  // Get or create portal root
  useEffect(() => {
    portalRoot.current = document.getElementById('modal-root');
    if (!portalRoot.current) {
      const root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
      portalRoot.current = root;
    }, []);

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onEscapePress?.();
      onClose();
    }, [closeOnEscape, onClose, onEscapePress]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onOverlayClick?.();
      onClose();
    }, [closeOnOverlayClick, onClose, onOverlayClick]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const timer = setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements?.[0] as HTMLElement;
        firstFocusableElement?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        // Return focus to previously focused element
        previousActiveElement.current?.focus();
      };
    }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (preventScroll && isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }, [isOpen, preventScroll]);

  // Add event listeners
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event: KeyboardEvent) => handleEscapeKey(event);
      document.addEventListener('keydown', handleKeyDown as any);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown as any);
      };
    }, [isOpen, handleEscapeKey]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event: KeyboardEvent) => {
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
      };

    document.addEventListener('keydown', handleTabKey as any);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey as any);
    };
  }, [isOpen]);

  if (!portalRoot.current) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn('fixed inset-0', `z-${zIndex}`)}
          data-testid={testId}
        >
          {/* Overlay */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            transition={{ duration: animationDuration }}
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-sm',
              overlayClassName
            )}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className={cn(
              'fixed inset-0 flex overflow-y-auto',
              positionClasses[position]
            )}
          >
            <motion.div
              ref={modalRef}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ 
                duration: animationDuration,
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              onAnimationComplete={onAnimationComplete}
              className={cn(
                'relative w-full mx-auto my-auto',
                sizeClasses[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel || title}
              aria-describedby={ariaDescribedBy || (description ? 'modal-description' : undefined)}
            >
              <div
                className={cn(
                  'relative bg-white dark:bg-gray-900 rounded-lg shadow-xl',
                  'max-h-[90vh] flex flex-col',
                  contentClassName
                )}
              >
                {/* Header */}
                {(title || customHeader || showCloseButton) && (
                  <div
                    className={cn(
                      'flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700',
                      headerClassName
                    )}
                  >
                    {customHeader || (
                      <div className="flex-1">
                        {title && (
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                          </h2>
                        )}
                        {description && (
                          <p
                            id="modal-description"
                            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                          >
                            {description}
                          </p>
                        )}
                      </div>
                    )}

                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                          'ml-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                          'rounded-lg p-1 transition-colors duration-200'
                        )}
                        aria-label={t('common.close')}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Body */}
                <div
                  className={cn(
                    'flex-1 overflow-y-auto p-4',
                    bodyClassName
                  )}
                >
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div
                    className={cn(
                      'flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700',
                      'space-x-2',
                      footerClassName
                    )}
                  >
                    {footer}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot.current
  );
};

// Compound components for better composition
export const ModalHeader: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const ModalBody: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('flex-1', className)}>{children}</div>
);

export const ModalFooter: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('mt-4 flex items-center justify-end space-x-2', className)}>
    {children}
  </div>
);

// Export everything
export default Modal;

}
}
}
}
}
}
}
}
}
