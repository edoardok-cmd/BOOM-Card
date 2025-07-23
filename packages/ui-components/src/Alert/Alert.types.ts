import { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps {
  /**
   * The variant of the alert which determines its color and icon
   */
  variant?: AlertVariant;
  
  /**
   * The size of the alert
   */
  size?: AlertSize;
  
  /**
   * The title of the alert
   */
  title?: string;
  
  /**
   * The main content of the alert
   */
  children: ReactNode;
  
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  
  /**
   * Callback fired when the alert is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Custom icon to display instead of the default variant icon
   */
  icon?: ReactNode;
  
  /**
   * Whether to show the default icon for the variant
   */
  showIcon?: boolean;
  
  /**
   * Additional CSS classes to apply to the alert
   */
  className?: string;
  
  /**
   * Whether the alert should have a border
   */
  bordered?: boolean;
  
  /**
   * Whether the alert should have a solid background
   */
  solid?: boolean;
  
  /**
   * Actions to display in the alert (buttons, links, etc.)
   */
  actions?: ReactNode;
  
  /**
   * Accessibility label for the alert
   */
  ariaLabel?: string;
  
  /**
   * Accessibility live region setting
   */
  ariaLive?: 'polite' | 'assertive' | 'off';
  
  /**
   * Whether the alert should automatically dismiss after a timeout
   */
  autoClose?: boolean;
  
  /**
   * Duration in milliseconds before auto-closing (default: 5000)
   */
  autoCloseDelay?: number;
  
  /**
   * Whether to animate the alert on mount/unmount
   */
  animate?: boolean;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface AlertIconProps {
  variant: AlertVariant;
  className?: string;
}

export interface AlertCloseButtonProps {
  onClose: () => void;
  ariaLabel?: string;
  className?: string;
}

export interface AlertTitleProps {
  children: ReactNode;
  className?: string;
}

export interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export interface AlertActionsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Configuration for alert variants
 */
export interface AlertVariantConfig {
  icon: ReactNode;
  colorClass: string;
  borderClass: string;
  solidClass: string;
  iconColorClass: string;
}

/**
 * Configuration for alert sizes
 */
export interface AlertSizeConfig {
  padding: string;
  fontSize: string;
  iconSize: string;
  titleSize: string;
}

/**
 * Alert context for compound components
 */
export interface AlertContextValue {
  variant: AlertVariant;
  size: AlertSize;
  dismissible: boolean;
  onDismiss?: () => void;
}
