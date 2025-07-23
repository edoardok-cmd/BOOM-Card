import { ReactNode } from 'react';

export interface SliderProps {
  /**
   * Current value of the slider
   */
  value?: number;
  
  /**
   * Default value when uncontrolled
   */
  defaultValue?: number;
  
  /**
   * Callback fired when value changes
   */
  onChange?: (value: number) => void;
  
  /**
   * Callback fired on mouse/touch release
   */
  onChangeEnd?: (value: number) => void;
  
  /**
   * Minimum value
   */
  min?: number;
  
  /**
   * Maximum value
   */
  max?: number;
  
  /**
   * Step interval
   */
  step?: number;
  
  /**
   * Marks to display on the slider
   */
  marks?: SliderMark[] | boolean;
  
  /**
   * Whether to display value label
   */
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  
  /**
   * Format function for value label
   */
  valueLabelFormat?: (value: number) => string;
  
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
  
  /**
   * Orientation of the slider
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Color variant
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Track display mode
   */
  track?: 'normal' | 'inverted' | false;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Accessible label
   */
  'aria-label'?: string;
  
  /**
   * Accessible label by ID
   */
  'aria-labelledby'?: string;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
  
  /**
   * Custom thumb component
   */
  ThumbComponent?: React.ElementType;
  
  /**
   * Props for thumb component
   */
  thumbProps?: Record<string, any>;
  
  /**
   * Custom value label component
   */
  ValueLabelComponent?: React.ElementType;
  
  /**
   * Props for value label component
   */
  valueLabelProps?: Record<string, any>;
  
  /**
   * Whether to show tooltip on hover
   */
  showTooltip?: boolean;
  
  /**
   * Tooltip placement
   */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Custom styles
   */
  sx?: Record<string, any>;
}

export interface SliderMark {
  /**
   * The value at which the mark is placed
   */
  value: number;
  
  /**
   * The label to display
   */
  label?: ReactNode;
}

export interface SliderThumbProps {
  /**
   * Current value
   */
  value: number;
  
  /**
   * Whether the thumb is being dragged
   */
  isDragging: boolean;
  
  /**
   * Whether the thumb is focused
   */
  isFocused: boolean;
  
  /**
   * Whether the slider is disabled
   */
  disabled: boolean;
  
  /**
   * Size variant
   */
  size: 'small' | 'medium' | 'large';
  
  /**
   * Color variant
   */
  color: string;
  
  /**
   * Style object
   */
  style?: React.CSSProperties;
  
  /**
   * Additional props
   */
  [key: string]: any;
}

export interface SliderValueLabelProps {
  /**
   * The value to display
   */
  value: number;
  
  /**
   * Formatted value string
   */
  formattedValue: string;
  
  /**
   * Whether the label is open
   */
  open: boolean;
  
  /**
   * Children to render
   */
  children: ReactNode;
  
  /**
   * Placement of the label
   */
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface SliderRailProps {
  /**
   * Orientation of the slider
   */
  orientation: 'horizontal' | 'vertical';
  
  /**
   * Size variant
   */
  size: 'small' | 'medium' | 'large';
  
  /**
   * Whether the slider is disabled
   */
  disabled: boolean;
}

export interface SliderTrackProps {
  /**
   * Track offset percentage
   */
  offset: number;
  
  /**
   * Track length percentage
   */
  length: number;
  
  /**
   * Orientation of the slider
   */
  orientation: 'horizontal' | 'vertical';
  
  /**
   * Size variant
   */
  size: 'small' | 'medium' | 'large';
  
  /**
   * Color variant
   */
  color: string;
  
  /**
   * Whether the slider is disabled
   */
  disabled: boolean;
  
  /**
   * Track display mode
   */
  track: 'normal' | 'inverted' | false;
}

export interface SliderState {
  /**
   * Current value
   */
  value: number;
  
  /**
   * Whether the slider is being dragged
   */
  isDragging: boolean;
  
  /**
   * Whether the slider is focused
   */
  isFocused: boolean;
  
  /**
   * Active thumb index (for range sliders)
   */
  activeThumb: number | null;
}

export interface UseSliderProps {
  /**
   * Ref to the root element
   */
  rootRef: React.RefObject<HTMLDivElement>;
  
  /**
   * Current value
   */
  value: number;
  
  /**
   * Minimum value
   */
  min: number;
  
  /**
   * Maximum value
   */
  max: number;
  
  /**
   * Step interval
   */
  step: number;
  
  /**
   * Whether the slider is disabled
   */
  disabled: boolean;
  
  /**
   * Orientation
   */
  orientation: 'horizontal' | 'vertical';
  
  /**
   * Change handler
   */
  onChange?: (value: number) => void;
  
  /**
   * Change end handler
   */
  onChangeEnd?: (value: number) => void;
}

export interface UseSliderReturn {
  /**
   * Slider state
   */
  state: SliderState;
  
  /**
   * Root element props
   */
  getRootProps: () => Record<string, any>;
  
  /**
   * Rail element props
   */
  getRailProps: () => Record<string, any>;
  
  /**
   * Track element props
   */
  getTrackProps: () => Record<string, any>;
  
  /**
   * Thumb element props
   */
  getThumbProps: () => Record<string, any>;
  
  /**
   * Input element props
   */
  getInputProps: () => Record<string, any>;
}

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderSize = 'small' | 'medium' | 'large';
export type SliderColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type SliderTrackMode = 'normal' | 'inverted' | false;
export type SliderValueLabelDisplay = 'on' | 'auto' | 'off';
