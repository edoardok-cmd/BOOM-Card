import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  progress?: boolean;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="toast-icon" size={20} />,
  error: <XCircle className="toast-icon" size={20} />,
  warning: <AlertCircle className="toast-icon" size={20} />,
  info: <Info className="toast-icon" size={20} />
};

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  dismissible = true,
  onDismiss,
  action,
  icon,
  className = '',
  pauseOnHover = true,
  progress = true
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (duration === 0 || isPaused) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [remainingTime, isPaused, duration]);

  useEffect(() => {
    if (pauseOnHover && isPaused) {
      const elapsed = Date.now() - startTime;
      setRemainingTime(Math.max(0, remainingTime - elapsed));
    } else if (pauseOnHover && !isPaused) {
      setStartTime(Date.now());
    }, [isPaused, pauseOnHover]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.(id);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    };

  const handleActionClick = () => {
    if (action?.onClick) {
      action.onClick();
      handleDismiss();
    };

  const getProgressWidth = () => {
    if (!progress || duration === 0 || isPaused) return '100%';
    return `${(remainingTime / duration) * 100}%`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`toast toast--${type} ${className}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="alert"
          aria-live="polite"
        >
          <div className="toast__content">
            <div className="toast__icon-wrapper">
              {icon || iconMap[type]}
            </div>
            
            <div className="toast__text">
              {title && (
                <h4 className="toast__title">{title}</h4>
              )}
              <p className="toast__message">{message}</p>
              
              {action && (
                <button
                  type="button"
                  className="toast__action"
                  onClick={handleActionClick}
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              )}
            </div>
            
            {dismissible && (
              <button
                type="button"
                className="toast__dismiss"
                onClick={handleDismiss}
                aria-label={t('common.dismiss')}
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {progress && duration > 0 && (
            <div className="toast__progress">
              <div
                className="toast__progress-bar"
                style={{
                  width: getProgressWidth(),
                  transition: isPaused ? 'none' : `width ${remainingTime}ms linear`
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  maxToasts?: number;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  maxToasts = 5,
  className = ''
}) => {
  const visibleToasts = toasts.slice(0, maxToasts);
  
  const getPositionClasses = () => {
    const positions: Record<ToastPosition, string> = {
      'top-right': 'toast-container--top-right',
      'top-left': 'toast-container--top-left',
      'bottom-right': 'toast-container--bottom-right',
      'bottom-left': 'toast-container--bottom-left',
      'top-center': 'toast-container--top-center',
      'bottom-center': 'toast-container--bottom-center'
    };
    
    return positions[position] || positions['top-right'];
  };
  
  return (
    <div 
      className={`toast-container ${getPositionClasses()} ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="sync">
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: 1000 - index }}
          >
            <Toast {...toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: (toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
        toast.onDismiss?.(toastId);
      };
    
    setToasts(prev => [newToast, ...prev]);
    
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAllToasts = () => {
    setToasts([]);
  };

  const success = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, type: 'success', message });
  };

  const error = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, type: 'error', message });
  };

  const warning = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, type: 'warning', message });
  };

  const info = (message: string, options?: Partial<ToastProps>) => {
    return showToast({ ...options, type: 'info', message });
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: Partial<ToastProps>
  ) => {
    const toastId = showToast({
      ...options,
      type: 'info',
      message: messages.loading,
      duration: 0,
      dismissible: false
    });

    promise
      .then((data) => {
        dismissToast(toastId);
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        success(successMessage, options);
      })
      .catch((error) => {
        dismissToast(toastId);
        const errorMessage = typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error;
        this.error(errorMessage, options);
      });

    return promise;
  };

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts,
    success,
    error,
    warning,
    info,
    promise
  };
};

export default Toast;

}
}
}
}
}
