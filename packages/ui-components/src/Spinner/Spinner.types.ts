import { CSSProperties } from 'react';

export interface SpinnerProps {
  /**
   * Size of the spinner
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | number;
  
  /**
   * Color of the spinner
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'white' | 'black' | string;
  
  /**
   * Thickness of the spinner stroke
   * @default 2
   */
  thickness?: number;
  
  /**
   * Speed of the spinner animation in seconds
   * @default 0.8
   */
  speed?: number;
  
  /**
   * Whether to show the spinner
   * @default true
   */
  show?: boolean;
  
  /**
   * Whether the spinner should be centered in its container
   * @default false
   */
  centered?: boolean;
  
  /**
   * Whether to show a fullscreen overlay with the spinner
   * @default false
   */
  fullscreen?: boolean;
  
  /**
   * Background color for fullscreen overlay
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  overlayColor?: string;
  
  /**
   * Loading text to display below the spinner
   */
  label?: string;
  
  /**
   * Position of the label relative to the spinner
   * @default 'bottom'
   */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Custom inline styles
   */
  style?: CSSProperties;
  
  /**
   * Accessibility label for screen readers
   * @default 'Loading'
   */
  ariaLabel?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
  
  /**
   * Whether to add a delay before showing the spinner
   * Useful to prevent flash of spinner for quick operations
   * @default 0
   */
  delay?: number;
  
  /**
   * Type of spinner animation
   * @default 'circular'
   */
  variant?: 'circular' | 'dots' | 'bars' | 'pulse';
  
  /**
   * Whether the spinner should block user interaction
   * @default false
   */
  blocking?: boolean;
  
  /**
   * Z-index for overlay mode
   * @default 9999
   */
  zIndex?: number;
  
  /**
   * Whether to show progress percentage (requires progress prop)
   * @default false
   */
  showProgress?: boolean;
  
  /**
   * Progress value (0-100) for determinate spinners
   */
  progress?: number;
  
  /**
   * Whether to animate the appearance/disappearance
   * @default true
   */
  animate?: boolean;
  
  /**
   * Custom animation duration in milliseconds
   * @default 200
   */
  animationDuration?: number;
  
  /**
   * Callback when spinner becomes visible
   */
  onShow?: () => void;
  
  /**
   * Callback when spinner becomes hidden
   */
  onHide?: () => void;
}

export interface SpinnerSizes {
  small: number;
  medium: number;
  large: number;
}

export interface SpinnerColors {
  primary: string;
  secondary: string;
  white: string;
  black: string;
}

export interface SpinnerVariantStyles {
  circular: CSSProperties;
  dots: CSSProperties;
  bars: CSSProperties;
  pulse: CSSProperties;
}

export interface SpinnerOverlayProps {
  show: boolean;
  color: string;
  zIndex: number;
  blocking: boolean;
  animate: boolean;
  animationDuration: number;
  children: React.ReactNode;
}

export interface SpinnerLabelProps {
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
  className?: string;
}

export interface SpinnerProgressProps {
  value: number;
  size: number;
  thickness: number;
  color: string;
  showLabel?: boolean;
  labelFormat?: (value: number) => string;
}

export type SpinnerTheme = {
  sizes: SpinnerSizes;
  colors: SpinnerColors;
  variants: SpinnerVariantStyles;
  defaultProps: Partial<SpinnerProps>;
};
