import { ReactNode } from 'react';

export interface ProgressProps {
  /**
   * Current progress value (0-100)
   */
  value: number;
  
  /**
   * Maximum value for progress calculation
   * @default 100
   */
  max?: number;
  
  /**
   * Progress bar size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Progress bar color variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Whether to show the progress label
   * @default false
   */
  showLabel?: boolean;
  
  /**
   * Custom label format function
   * @param value Current progress value
   * @param max Maximum value
   * @returns Formatted label string
   */
  labelFormatter?: (value: number, max: number) => string;
  
  /**
   * Label position relative to progress bar
   * @default 'inside'
   */
  labelPosition?: 'inside' | 'outside' | 'top' | 'bottom';
  
  /**
   * Whether to animate the progress bar
   * @default true
   */
  animated?: boolean;
  
  /**
   * Whether to show striped pattern
   * @default false
   */
  striped?: boolean;
  
  /**
   * Progress bar shape
   * @default 'linear'
   */
  shape?: 'linear' | 'circular';
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
  
  /**
   * Progress bar height (for linear) or size (for circular)
   */
  height?: number | string;
  
  /**
   * Background color for unfilled portion
   */
  backgroundColor?: string;
  
  /**
   * Progress bar color (overrides variant)
   */
  color?: string;
  
  /**
   * Whether the progress is in loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether the progress is indeterminate
   * @default false
   */
  indeterminate?: boolean;
  
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;
  
  /**
   * Callback when progress completes (reaches max)
   */
  onComplete?: () => void;
  
  /**
   * Accessibility label
   */
  ariaLabel?: string;
  
  /**
   * Whether to show percentage in tooltip on hover
   * @default false
   */
  showTooltip?: boolean;
  
  /**
   * Custom tooltip content
   */
  tooltipContent?: ReactNode | ((value: number, max: number) => ReactNode);
  
  /**
   * Progress segments for multi-part progress
   */
  segments?: ProgressSegment[];
  
  /**
   * Whether to round the progress bar corners
   * @default true
   */
  rounded?: boolean;
  
  /**
   * Border radius size
   */
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  
  /**
   * Whether to show buffer progress (for streaming/buffering scenarios)
   */
  bufferValue?: number;
  
  /**
   * Custom icon to show when progress is complete
   */
  completeIcon?: ReactNode;
  
  /**
   * Whether to show success state when complete
   * @default false
   */
  showSuccessState?: boolean;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

export interface ProgressSegment {
  /**
   * Segment value
   */
  value: number;
  
  /**
   * Segment color
   */
  color?: string;
  
  /**
   * Segment label
   */
  label?: string;
  
  /**
   * Segment variant
   */
  variant?: ProgressProps['variant'];
}

export interface CircularProgressProps extends Omit<ProgressProps, 'shape' | 'height' | 'striped'> {
  /**
   * Circle diameter in pixels
   * @default 120
   */
  size?: number;
  
  /**
   * Stroke width in pixels
   * @default 8
   */
  strokeWidth?: number;
  
  /**
   * Starting angle in degrees
   * @default -90
   */
  startAngle?: number;
  
  /**
   * Whether to show inner content
   * @default true
   */
  showInnerContent?: boolean;
  
  /**
   * Custom inner content
   */
  innerContent?: ReactNode;
  
  /**
   * Track color (background circle)
   */
  trackColor?: string;
  
  /**
   * Whether to use gradient color
   * @default false
   */
  useGradient?: boolean;
  
  /**
   * Gradient colors [start, end]
   */
  gradientColors?: [string, string];
  
  /**
   * Circle line cap style
   * @default 'round'
   */
  lineCap?: 'butt' | 'round' | 'square';
}

export interface ProgressBarStyles {
  container: string;
  track: string;
  bar: string;
  label: string;
  buffer: string;
  stripe: string;
  tooltip: string;
}

export interface ProgressState {
  isComplete: boolean;
  isAnimating: boolean;
  displayValue: number;
  previousValue: number;
}

export type ProgressContextValue = {
  value: number;
  max: number;
  percentage: number;
  isComplete: boolean;
  variant: ProgressProps['variant'];
  size: ProgressProps['size'];
};
