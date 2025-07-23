import { ReactNode, CSSProperties } from 'react';
import { AnimationProps } from '../Animation/Animation.types';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;

  /**
   * Callback fired when the drawer should be closed
   */
  onClose: () => void;

  /**
   * The content to be displayed in the drawer
   */
  children: ReactNode;

  /**
   * Position of the drawer
   * @default 'right'
   */
  position?: DrawerPosition;

  /**
   * Size of the drawer
   * @default 'md'
   */
  size?: DrawerSize;

  /**
   * Title displayed in the drawer header
   */
  title?: ReactNode;

  /**
   * Whether to show the header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether to show the overlay
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Whether clicking the overlay closes the drawer
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether pressing ESC closes the drawer
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Custom footer content
   */
  footer?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Additional CSS class for the overlay
   */
  overlayClassName?: string;

  /**
   * Additional CSS class for the content
   */
  contentClassName?: string;

  /**
   * Additional CSS class for the header
   */
  headerClassName?: string;

  /**
   * Additional CSS class for the body
   */
  bodyClassName?: string;

  /**
   * Additional CSS class for the footer
   */
  footerClassName?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Z-index of the drawer
   * @default 1000
   */
  zIndex?: number;

  /**
   * Animation configuration
   */
  animation?: AnimationProps;

  /**
   * Whether to lock body scroll when drawer is open
   * @default true
   */
  lockBodyScroll?: boolean;

  /**
   * Whether to focus the drawer when opened
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to restore focus when closed
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * ARIA label for the drawer
   */
  ariaLabel?: string;

  /**
   * ARIA labelledby ID
   */
  ariaLabelledBy?: string;

  /**
   * ARIA describedby ID
   */
  ariaDescribedBy?: string;

  /**
   * Whether the drawer is loading
   */
  loading?: boolean;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Whether to enable swipe gestures on mobile
   * @default true
   */
  enableSwipeGestures?: boolean;

  /**
   * Minimum swipe distance to trigger close
   * @default 50
   */
  swipeThreshold?: number;

  /**
   * Whether drawer content is scrollable
   * @default true
   */
  scrollable?: boolean;

  /**
   * Callback fired after the drawer opens
   */
  onAfterOpen?: () => void;

  /**
   * Callback fired after the drawer closes
   */
  onAfterClose?: () => void;

  /**
   * Custom width for left/right drawers (overrides size)
   */
  width?: string | number;

  /**
   * Custom height for top/bottom drawers (overrides size)
   */
  height?: string | number;

  /**
   * Whether to show a backdrop shadow
   * @default true
   */
  showShadow?: boolean;

  /**
   * Border radius for the drawer
   */
  borderRadius?: string | number;

  /**
   * Whether to enable keyboard navigation
   * @default true
   */
  enableKeyboardNavigation?: boolean;

  /**
   * Container element for portal rendering
   * @default document.body
   */
  container?: HTMLElement | null;

  /**
   * Whether to render drawer in a portal
   * @default true
   */
  usePortal?: boolean;

  /**
   * Custom transition duration in milliseconds
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Data test ID for testing
   */
  dataTestId?: string;
}

export interface DrawerHeaderProps {
  /**
   * Title content
   */
  title?: ReactNode;

  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;

  /**
   * Close button click handler
   */
  onClose?: () => void;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Close button aria-label
   */
  closeButtonAriaLabel?: string;

  /**
   * Custom close button icon
   */
  closeIcon?: ReactNode;

  /**
   * Header actions (rendered on the right side)
   */
  actions?: ReactNode;
}

export interface DrawerBodyProps {
  /**
   * Body content
   */
  children: ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Whether content is scrollable
   */
  scrollable?: boolean;

  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface DrawerFooterProps {
  /**
   * Footer content
   */
  children: ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Footer alignment
   */
  align?: 'left' | 'center' | 'right' | 'space-between';

  /**
   * Whether to show a top border
   */
  showBorder?: boolean;
}

export interface DrawerOverlayProps {
  /**
   * Whether overlay is visible
   */
  isVisible: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Overlay opacity
   */
  opacity?: number;

  /**
   * Blur amount for backdrop
   */
  blur?: number;

  /**
   * Z-index
   */
  zIndex?: number;
}

export interface DrawerContextValue {
  /**
   * Current open state
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Drawer position
   */
  position: DrawerPosition;

  /**
   * Drawer size
   */
  size: DrawerSize;

  /**
   * Whether drawer is in loading state
   */
  loading?: boolean;
}

export interface UseDrawerOptions {
  /**
   * Initial open state
   */
  initialOpen?: boolean;

  /**
   * Callback when drawer opens
   */
  onOpen?: () => void;

  /**
   * Callback when drawer closes
   */
  onClose?: () => void;

  /**
   * Whether to prevent closing
   */
  preventClose?: boolean;
}

export interface UseDrawerReturn {
  /**
   * Current open state
   */
  isOpen: boolean;

  /**
   * Open the drawer
   */
  open: () => void;

  /**
   * Close the drawer
   */
  close: () => void;

  /**
   * Toggle the drawer
   */
  toggle: () => void;

  /**
   * Set open state directly
   */
  setIsOpen: (open: boolean) => void;
}

export interface DrawerSizeConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface DrawerAnimationConfig {
  duration: number;
  easing: string;
  slideDistance: string;
}
