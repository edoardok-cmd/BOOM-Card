import { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ToastAnimation = 'slide' | 'fade' | 'pop' | 'none';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  animation?: ToastAnimation;
  closable?: boolean;
  pauseOnHover?: boolean;
  icon?: ReactNode | boolean;
  action?: ToastAction;
  onClose?: () => void;
  onOpen?: () => void;
  className?: string;
  progressBar?: boolean;
  autoClose?: boolean;
  closeOnClick?: boolean;
  draggable?: boolean;
  draggablePercent?: number;
  role?: 'alert' | 'status';
  ariaLive?: 'polite' | 'assertive' | 'off';
  rtl?: boolean;
  theme?: 'light' | 'dark' | 'colored';
  containerClassName?: string;
  bodyClassName?: string;
  progressClassName?: string;
  closeButtonClassName?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  progressStyle?: React.CSSProperties;
  data?: Record<string, any>;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
  pausedAt?: number;
  remainingTime?: number;
  isVisible: boolean;
}

export interface ToastContainerProps {
  position?: ToastPosition;
  autoClose?: number;
  closeButton?: boolean | ReactNode;
  transition?: ToastAnimation;
  hideProgressBar?: boolean;
  newestOnTop?: boolean;
  closeOnClick?: boolean;
  rtl?: boolean;
  pauseOnFocusLoss?: boolean;
  draggable?: boolean;
  draggablePercent?: number;
  pauseOnHover?: boolean;
  theme?: 'light' | 'dark' | 'colored' | 'auto';
  limit?: number;
  role?: 'alert' | 'status';
  containerId?: string;
  className?: string;
  style?: React.CSSProperties;
  toastClassName?: string;
  bodyClassName?: string;
  progressClassName?: string;
  enableMultiContainer?: boolean;
  icon?: boolean | ReactNode | ((props: { type: ToastType }) => ReactNode);
  stacked?: boolean;
}

export interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  containerPosition: ToastPosition;
  isIn: boolean;
  stacked?: boolean;
  collapseAll?: boolean;
  visibleToasts?: number;
  position?: number;
}

export interface ToastProgressBarProps {
  delay: number;
  isRunning: boolean;
  closeToast: () => void;
  type: ToastType;
  hide?: boolean;
  className?: string;
  style?: React.CSSProperties;
  controlledProgress?: boolean;
  progress?: number;
  rtl?: boolean;
  isIn?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

export interface ToastCloseButtonProps {
  closeToast: () => void;
  type: ToastType;
  className?: string;
  ariaLabel?: string;
}

export interface ToastIconProps {
  type: ToastType;
  theme?: 'light' | 'dark' | 'colored';
  icon?: ReactNode | boolean;
  iconClassName?: string;
}

export type ToastContent = ReactNode | string;

export type ToastPromiseParams<T = any> = {
  pending?: string | ToastOptions;
  success?: string | ToastOptions | ((data: T) => string | ToastOptions);
  error?: string | ToastOptions | ((error: any) => string | ToastOptions);
};

export interface ToastTransition {
  duration?: number;
  appendPosition?: boolean;
  collapse?: boolean;
  collapseDuration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
  clearToasts: () => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
}

export type ToastEventType = 
  | 'onChange'
  | 'onOpen' 
  | 'onClose'
  | 'onAdd'
  | 'onRemove'
  | 'onClear';

export interface ToastEventHandlers {
  onChange?: (toasts: Toast[]) => void;
  onOpen?: (toast: Toast) => void;
  onClose?: (toast: Toast) => void;
  onAdd?: (toast: Toast) => void;
  onRemove?: (toast: Toast) => void;
  onClear?: () => void;
}

export interface ToastQueueItem {
  options: ToastOptions;
  resolve: (id: string) => void;
  reject: (error: any) => void;
}

export interface ToastManagerOptions {
  maxToasts?: number;
  queueMode?: 'replace' | 'queue' | 'immediate';
  defaultOptions?: Partial<ToastOptions>;
  eventHandlers?: ToastEventHandlers;
}

export interface UseToastReturn {
  toast: {
    success: (message: string, options?: Partial<ToastOptions>) => string;
    error: (message: string, options?: Partial<ToastOptions>) => string;
    warning: (message: string, options?: Partial<ToastOptions>) => string;
    info: (message: string, options?: Partial<ToastOptions>) => string;
    loading: (message: string, options?: Partial<ToastOptions>) => string;
    promise: <T = any>(promise: Promise<T>, params: ToastPromiseParams<T>) => Promise<T>;
    custom: (content: ToastContent, options?: ToastOptions) => string;
    dismiss: (id?: string) => void;
    update: (id: string, options: Partial<ToastOptions>) => void;
    isActive: (id: string) => boolean;
  };
  toasts: Toast[];
}
