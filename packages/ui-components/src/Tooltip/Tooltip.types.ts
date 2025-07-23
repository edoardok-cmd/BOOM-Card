import { ReactNode, CSSProperties } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type TooltipVariant = 'default' | 'dark' | 'light' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type TooltipSize = 'small' | 'medium' | 'large';

export interface TooltipProps {
  /**
   * The content to be displayed inside the tooltip
   */
  content: ReactNode;
  
  /**
   * The element that triggers the tooltip
   */
  children: ReactNode;
  
  /**
   * Position of the tooltip relative to the trigger element
   * @default 'top'
   */
  position?: TooltipPosition;
  
  /**
   * How the tooltip is triggered
   * @default 'hover'
   */
  trigger?: TooltipTrigger;
  
  /**
   * Visual variant of the tooltip
   * @default 'default'
   */
  variant?: TooltipVariant;
  
  /**
   * Size of the tooltip
   * @default 'medium'
   */
  size?: TooltipSize;
  
  /**
   * Whether the tooltip is open (controlled mode)
   */
  open?: boolean;
  
  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean;
  
  /**
   * Callback when tooltip visibility changes
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * Delay in milliseconds before showing tooltip
   * @default 0
   */
  showDelay?: number;
  
  /**
   * Delay in milliseconds before hiding tooltip
   * @default 0
   */
  hideDelay?: number;
  
  /**
   * Whether to show arrow pointing to trigger element
   * @default true
   */
  showArrow?: boolean;
  
  /**
   * Maximum width of the tooltip
   * @default 300
   */
  maxWidth?: number;
  
  /**
   * Whether the tooltip should be disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Additional CSS class names for content
   */
  contentClassName?: string;
  
  /**
   * Additional CSS class names for arrow
   */
  arrowClassName?: string;
  
  /**
   * Inline styles for the tooltip container
   */
  style?: CSSProperties;
  
  /**
   * Inline styles for the tooltip content
   */
  contentStyle?: CSSProperties;
  
  /**
   * Z-index for the tooltip
   * @default 9999
   */
  zIndex?: number;
  
  /**
   * Offset from the trigger element in pixels
   * @default 8
   */
  offset?: number;
  
  /**
   * Whether tooltip should flip position when not enough space
   * @default true
   */
  flip?: boolean;
  
  /**
   * Whether tooltip content should be interactive (hoverable)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Portal container for the tooltip
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  
  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;
  
  /**
   * ID for accessibility purposes
   */
  id?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
  
  /**
   * Animation duration in milliseconds
   * @default 200
   */
  animationDuration?: number;
  
  /**
   * Whether to keep tooltip open on content hover (for interactive mode)
   * @default true when interactive is true
   */
  keepOpenOnContentHover?: boolean;
  
  /**
   * Custom render function for tooltip content
   */
  renderContent?: (content: ReactNode) => ReactNode;
  
  /**
   * Callback fired when tooltip is shown
   */
  onShow?: () => void;
  
  /**
   * Callback fired when tooltip is hidden
   */
  onHide?: () => void;
  
  /**
   * Callback fired when mouse enters tooltip area
   */
  onMouseEnter?: (event: React.MouseEvent) => void;
  
  /**
   * Callback fired when mouse leaves tooltip area
   */
  onMouseLeave?: (event: React.MouseEvent) => void;
  
  /**
   * Whether to close tooltip when clicking outside
   * @default true for click trigger
   */
  closeOnClickOutside?: boolean;
  
  /**
   * Whether to close tooltip when pressing Escape key
   * @default true
   */
  closeOnEscape?: boolean;
}

export interface TooltipContentProps {
  content: ReactNode;
  variant: TooltipVariant;
  size: TooltipSize;
  className?: string;
  style?: CSSProperties;
  showArrow: boolean;
  arrowClassName?: string;
  position: TooltipPosition;
  animationDuration: number;
  renderContent?: (content: ReactNode) => ReactNode;
}

export interface TooltipArrowProps {
  position: TooltipPosition;
  variant: TooltipVariant;
  className?: string;
}

export interface TooltipPosition2D {
  top: number;
  left: number;
}

export interface TooltipDimensions {
  width: number;
  height: number;
}

export interface TooltipBoundary {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface UseTooltipProps {
  trigger: TooltipTrigger;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export interface UseTooltipReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerProps: {
    ref: React.RefObject<HTMLElement>;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    'aria-describedby'?: string;
  };
  tooltipProps: {
    id?: string;
    role: string;
    'aria-hidden': boolean;
  };
}

export interface PositionCalculatorProps {
  triggerRect: DOMRect;
  tooltipRect: DOMRect;
  position: TooltipPosition;
  offset: number;
  flip: boolean;
  boundary?: TooltipBoundary;
}

export interface CalculatedPosition {
  position: TooltipPosition;
  coordinates: TooltipPosition2D;
}
