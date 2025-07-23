import { ReactNode } from 'react';

export interface SwitchProps {
  /**
   * The controlled checked state of the switch
   */
  checked?: boolean;

  /**
   * The default checked state when uncontrolled
   */
  defaultChecked?: boolean;

  /**
   * Callback fired when the switch state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;

  /**
   * Whether the switch is in a loading state
   */
  loading?: boolean;

  /**
   * The name attribute of the input element
   */
  name?: string;

  /**
   * The value attribute of the input element
   */
  value?: string;

  /**
   * The id of the input element
   */
  id?: string;

  /**
   * Size variant of the switch
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color variant of the switch when checked
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Label text to display next to the switch
   */
  label?: string;

  /**
   * Position of the label relative to the switch
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether the switch is required
   */
  required?: boolean;

  /**
   * Tab index for keyboard navigation
   */
  tabIndex?: number;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * ARIA labelledby for accessibility
   */
  ariaLabelledBy?: string;

  /**
   * ARIA describedby for accessibility
   */
  ariaDescribedBy?: string;

  /**
   * Custom icon for the checked state
   */
  checkedIcon?: ReactNode;

  /**
   * Custom icon for the unchecked state
   */
  uncheckedIcon?: ReactNode;

  /**
   * Text to display when checked
   */
  checkedText?: string;

  /**
   * Text to display when unchecked
   */
  uncheckedText?: string;

  /**
   * Whether to show text inside the switch
   */
  showInlineText?: boolean;

  /**
   * Callback fired when the switch receives focus
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Callback fired when the switch loses focus
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Additional props for the input element
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;

  /**
   * Additional props for the label element
   */
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Helper text to display below the switch
   */
  helperText?: string;

  /**
   * Whether to persist the switch state in localStorage
   */
  persistState?: boolean;

  /**
   * Key to use for localStorage persistence
   */
  persistKey?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface SwitchThumbProps {
  /**
   * Whether the switch is checked
   */
  checked: boolean;

  /**
   * Whether the switch is disabled
   */
  disabled: boolean;

  /**
   * Whether the switch is in a loading state
   */
  loading?: boolean;

  /**
   * Size of the switch
   */
  size: 'small' | 'medium' | 'large';

  /**
   * Color variant
   */
  color: SwitchProps['color'];

  /**
   * Whether the switch has an error
   */
  error?: boolean;
}

export interface SwitchTrackProps {
  /**
   * Whether the switch is checked
   */
  checked: boolean;

  /**
   * Whether the switch is disabled
   */
  disabled: boolean;

  /**
   * Size of the switch
   */
  size: 'small' | 'medium' | 'large';

  /**
   * Color variant
   */
  color: SwitchProps['color'];

  /**
   * Whether the switch has an error
   */
  error?: boolean;

  /**
   * Text to display when checked
   */
  checkedText?: string;

  /**
   * Text to display when unchecked
   */
  uncheckedText?: string;

  /**
   * Whether to show inline text
   */
  showInlineText?: boolean;
}

export interface SwitchSizes {
  small: {
    width: number;
    height: number;
    thumbSize: number;
    thumbOffset: number;
    fontSize: string;
  };
  medium: {
    width: number;
    height: number;
    thumbSize: number;
    thumbOffset: number;
    fontSize: string;
  };
  large: {
    width: number;
    height: number;
    thumbSize: number;
    thumbOffset: number;
    fontSize: string;
  };
}

export interface SwitchColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface SwitchState {
  /**
   * Current checked state
   */
  isChecked: boolean;

  /**
   * Whether the switch is focused
   */
  isFocused: boolean;

  /**
   * Whether the switch is hovered
   */
  isHovered: boolean;
}

export interface UseSwitchProps {
  /**
   * Controlled checked state
   */
  checked?: boolean;

  /**
   * Default checked state
   */
  defaultChecked?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;

  /**
   * Whether to persist state
   */
  persistState?: boolean;

  /**
   * Key for persistence
   */
  persistKey?: string;
}

export interface UseSwitchReturn {
  /**
   * Current checked state
   */
  checked: boolean;

  /**
   * Toggle the switch state
   */
  toggle: () => void;

  /**
   * Set the switch state
   */
  setChecked: (checked: boolean) => void;

  /**
   * Input props to spread on the input element
   */
  inputProps: {
    type: 'checkbox';
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  };
}
