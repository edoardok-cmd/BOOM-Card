import { ReactNode, HTMLAttributes, CSSProperties } from 'react';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /**
   * The content to display inside the popover
   */
  content: ReactNode;

  /**
   * The element that triggers the popover
   */
  children: ReactNode;

  /**
   * Placement of the popover relative to the trigger element
   * @default 'bottom'
   */
  placement?: PopoverPlacement;

  /**
   * How the popover is triggered
   * @default 'click'
   */
  trigger?: PopoverTrigger;

  /**
   * Whether the popover is open (controlled mode)
   */
  open?: boolean;

  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when the popover requests to be opened
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the popover should close when clicking outside
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * Whether the popover should close when pressing Escape
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Delay in milliseconds before showing the popover (hover trigger only)
   * @default 0
   */
  showDelay?: number;

  /**
   * Delay in milliseconds before hiding the popover (hover trigger only)
   * @default 0
   */
  hideDelay?: number;

  /**
   * Offset from the trigger element in pixels
   * @default 8
   */
  offset?: number;

  /**
   * Whether to show an arrow pointing to the trigger
   * @default true
   */
  showArrow?: boolean;

  /**
   * Custom arrow element
   */
  arrow?: ReactNode;

  /**
   * Maximum width of the popover content
   * @default 320
   */
  maxWidth?: number | string;

  /**
   * Maximum height of the popover content
   */
  maxHeight?: number | string;

  /**
   * Whether the popover should have the same width as the trigger
   * @default false
   */
  matchTriggerWidth?: boolean;

  /**
   * Z-index of the popover
   * @default 1000
   */
  zIndex?: number;

  /**
   * Whether to disable the popover
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to animate the popover entrance/exit
   * @default true
   */
  animated?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 200
   */
  animationDuration?: number;

  /**
   * Container element for the popover portal
   * @default document.body
   */
  container?: HTMLElement | null;

  /**
   * Whether to render the popover in a portal
   * @default true
   */
  usePortal?: boolean;

  /**
   * Custom class name for the popover content
   */
  contentClassName?: string;

  /**
   * Custom styles for the popover content
   */
  contentStyle?: CSSProperties;

  /**
   * Custom class name for the arrow
   */
  arrowClassName?: string;

  /**
   * Custom styles for the arrow
   */
  arrowStyle?: CSSProperties;

  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;

  /**
   * ID of the element that describes the popover
   */
  ariaDescribedby?: string;

  /**
   * Role of the popover for accessibility
   * @default 'tooltip'
   */
  role?: string;

  /**
   * Whether to trap focus within the popover
   * @default false
   */
  trapFocus?: boolean;

  /**
   * Whether to restore focus to the trigger when closing
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * Callback fired before the popover opens
   */
  onBeforeOpen?: () => void;

  /**
   * Callback fired after the popover opens
   */
  onAfterOpen?: () => void;

  /**
   * Callback fired before the popover closes
   */
  onBeforeClose?: () => void;

  /**
   * Callback fired after the popover closes
   */
  onAfterClose?: () => void;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the popover is currently open
   */
  isOpen: boolean;

  /**
   * Placement of the popover
   */
  placement: PopoverPlacement;

  /**
   * Whether to show the arrow
   */
  showArrow: boolean;

  /**
   * Arrow element
   */
  arrow?: ReactNode;

  /**
   * Animation duration
   */
  animationDuration: number;

  /**
   * Whether animations are enabled
   */
  animated: boolean;

  /**
   * Maximum width constraint
   */
  maxWidth?: number | string;

  /**
   * Maximum height constraint
   */
  maxHeight?: number | string;

  /**
   * Z-index value
   */
  zIndex: number;

  /**
   * Position styles for the popover
   */
  positionStyles?: CSSProperties;

  /**
   * Arrow position styles
   */
  arrowStyles?: CSSProperties;
}

export interface PopoverArrowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Placement of the popover
   */
  placement: PopoverPlacement;

  /**
   * Custom arrow content
   */
  children?: ReactNode;
}

export interface UsePopoverOptions {
  /**
   * Initial open state
   */
  defaultOpen?: boolean;

  /**
   * Controlled open state
   */
  open?: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Trigger type
   */
  trigger?: PopoverTrigger;

  /**
   * Show delay for hover trigger
   */
  showDelay?: number;

  /**
   * Hide delay for hover trigger
   */
  hideDelay?: number;

  /**
   * Whether the popover is disabled
   */
  disabled?: boolean;

  /**
   * Close on outside click
   */
  closeOnClickOutside?: boolean;

  /**
   * Close on escape key
   */
  closeOnEscape?: boolean;
}

export interface UsePopoverReturn {
  /**
   * Whether the popover is open
   */
  isOpen: boolean;

  /**
   * Open the popover
   */
  open: () => void;

  /**
   * Close the popover
   */
  close: () => void;

  /**
   * Toggle the popover
   */
  toggle: () => void;

  /**
   * Set open state
   */
  setOpen: (open: boolean) => void;

  /**
   * Props to spread on the trigger element
   */
  triggerProps: {
    ref: React.RefCallback<HTMLElement>;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    'aria-expanded'?: boolean;
    'aria-haspopup'?: boolean;
    'aria-controls'?: string;
  };

  /**
   * Props to spread on the popover content
   */
  popoverProps: {
    ref: React.RefCallback<HTMLElement>;
    id: string;
    role: string;
    'aria-hidden': boolean;
  };
}

export interface PopoverPosition {
  /**
   * Top position in pixels
   */
  top: number;

  /**
   * Left position in pixels
   */
  left: number;

  /**
   * Transform origin for animations
   */
  transformOrigin: string;
}

export interface PopoverBoundary {
  /**
   * Top boundary
   */
  top: number;

  /**
   * Right boundary
   */
  right: number;

  /**
   * Bottom boundary
   */
  bottom: number;

  /**
   * Left boundary
   */
  left: number;
}
