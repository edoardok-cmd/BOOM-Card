import { InputHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'small' | 'medium' | 'large';
export type InputVariant = 'outlined' | 'filled' | 'underlined';
export type InputStatus = 'default' | 'error' | 'success' | 'warning';
export type InputType = 
  | 'text' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /**
   * The size of the input field
   * @default 'medium'
   */
  size?: InputSize;
  
  /**
   * The visual variant of the input
   * @default 'outlined'
   */
  variant?: InputVariant;
  
  /**
   * The current status of the input field
   * @default 'default'
   */
  status?: InputStatus;
  
  /**
   * The input type
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * Label text for the input field
   */
  label?: string;
  
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  
  /**
   * Error message to display when status is 'error'
   */
  errorMessage?: string;
  
  /**
   * Success message to display when status is 'success'
   */
  successMessage?: string;
  
  /**
   * Warning message to display when status is 'warning'
   */
  warningMessage?: string;
  
  /**
   * Whether the input field is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Whether the input field is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the input field is read-only
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Whether to show a clear button when input has value
   * @default false
   */
  clearable?: boolean;
  
  /**
   * Icon to display at the start of the input
   */
  startIcon?: ReactNode;
  
  /**
   * Icon to display at the end of the input
   */
  endIcon?: ReactNode;
  
  /**
   * Additional CSS classes for the input container
   */
  containerClassName?: string;
  
  /**
   * Additional CSS classes for the input element
   */
  inputClassName?: string;
  
  /**
   * Additional CSS classes for the label
   */
  labelClassName?: string;
  
  /**
   * Additional CSS classes for helper/error text
   */
  helperTextClassName?: string;
  
  /**
   * Whether the input should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Whether to auto-focus the input on mount
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * Callback fired when the clear button is clicked
   */
  onClear?: () => void;
  
  /**
   * Callback fired when the input value changes
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired when the input is focused
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired when the input loses focus
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired on key press
   */
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired on key down
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired on key up
   */
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /**
   * Maximum number of characters allowed
   */
  maxLength?: number;
  
  /**
   * Whether to show character count
   * @default false
   */
  showCharacterCount?: boolean;
  
  /**
   * Whether to show password visibility toggle for password type
   * @default true
   */
  showPasswordToggle?: boolean;
  
  /**
   * Custom validation function
   */
  validate?: (value: string) => boolean | string;
  
  /**
   * Whether to validate on blur
   * @default true
   */
  validateOnBlur?: boolean;
  
  /**
   * Whether to validate on change
   * @default false
   */
  validateOnChange?: boolean;
  
  /**
   * Debounce delay for onChange in milliseconds
   */
  debounceDelay?: number;
  
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  
  /**
   * ARIA described by for accessibility
   */
  ariaDescribedBy?: string;
  
  /**
   * Whether the input is part of a form group
   * @default false
   */
  inFormGroup?: boolean;
  
  /**
   * Loading state for async operations
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom loading indicator
   */
  loadingIndicator?: ReactNode;
  
  /**
   * Whether to trim whitespace on blur
   * @default false
   */
  trimOnBlur?: boolean;
  
  /**
   * Locale for formatting (e.g., number inputs)
   */
  locale?: 'en' | 'bg';
  
  /**
   * Currency code for currency formatting
   */
  currency?: string;
  
  /**
   * Whether to format as currency (for number type)
   * @default false
   */
  formatCurrency?: boolean;
  
  /**
   * Number of decimal places for number inputs
   */
  decimalPlaces?: number;
  
  /**
   * Whether to allow negative numbers
   * @default true
   */
  allowNegative?: boolean;
  
  /**
   * Custom pattern for validation
   */
  pattern?: string;
  
  /**
   * Tooltip text to display on hover
   */
  tooltip?: string;
  
  /**
   * Tooltip placement
   * @default 'top'
   */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface InputStyleProps {
  size: InputSize;
  variant: InputVariant;
  status: InputStatus;
  disabled: boolean;
  readOnly: boolean;
  fullWidth: boolean;
  hasStartIcon: boolean;
  hasEndIcon: boolean;
  isFocused: boolean;
  hasValue: boolean;
  isLoading: boolean;
}

export interface InputRef {
  /**
   * Focus the input element
   */
  focus: () => void;
  
  /**
   * Blur the input element
   */
  blur: () => void;
  
  /**
   * Clear the input value
   */
  clear: () => void;
  
  /**
   * Get the current input value
   */
  getValue: () => string;
  
  /**
   * Set the input value programmatically
   */
  setValue: (value: string) => void;
  
  /**
   * Validate the input and return validation result
   */
  validate: () => boolean | string;
  
  /**
   * Reset the input to its initial state
   */
  reset: () => void;
  
  /**
   * Get the native input element
   */
  getInputElement: () => HTMLInputElement | null;
}

export type InputValidationResult = {
  isValid: boolean;
  message?: string;
};

export interface InputTheme {
  sizes: {
    small: {
      padding: string;
      fontSize: string;
      height: string;
      iconSize: string;
    };
    medium: {
      padding: string;
      fontSize: string;
      height: string;
      iconSize: string;
    };
    large: {
      padding: string;
      fontSize: string;
      height: string;
      iconSize: string;
    };
  };
  variants: {
    outlined: {
      borderWidth: string;
      borderStyle: string;
      borderRadius: string;
    };
    filled: {
      backgroundColor: string;
      borderRadius: string;
    };
    underlined: {
      borderBottomWidth: string;
      borderBottomStyle: string;
    };
  };
  colors: {
    default: {
      border: string;
      background: string;
      text: string;
      placeholder: string;
      label: string;
      helperText: string;
    };
    error: {
      border: string;
      background: string;
      text: string;
      message: string;
    };
    success: {
      border: string;
      background: string;
      text: string;
      message: string;
    };
    warning: {
      border: string;
      background: string;
      text: string;
      message: string;
    };
    disabled: {
      border: string;
      background: string;
      text: string;
    };
    focus: {
      border: string;
      shadow: string;
    };
  };
  transitions: {
    duration: string;
    easing: string;
  };
}
