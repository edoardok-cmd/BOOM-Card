import { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /**
   * The controlled checked state of the checkbox
   */
  checked?: boolean;

  /**
   * Default checked state for uncontrolled usage
   */
  defaultChecked?: boolean;

  /**
   * Callback fired when the checked state changes
   */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * The label content for the checkbox
   */
  label?: ReactNode;

  /**
   * Additional description text below the label
   */
  description?: string;

  /**
   * The size variant of the checkbox
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The color variant of the checkbox
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Position of the label relative to the checkbox
   */
  labelPosition?: 'left' | 'right';

  /**
   * Whether the checkbox is in an error state
   */
  error?: boolean;

  /**
   * Error message to display below the checkbox
   */
  errorMessage?: string;

  /**
   * Whether the checkbox is required
   */
  required?: boolean;

  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;

  /**
   * Custom icon for the checked state
   */
  checkedIcon?: ReactNode;

  /**
   * Custom icon for the unchecked state
   */
  uncheckedIcon?: ReactNode;

  /**
   * Custom icon for the indeterminate state
   */
  indeterminateIcon?: ReactNode;

  /**
   * Additional CSS classes for the root element
   */
  className?: string;

  /**
   * Additional CSS classes for the input element
   */
  inputClassName?: string;

  /**
   * Additional CSS classes for the label element
   */
  labelClassName?: string;

  /**
   * Additional CSS classes for the description element
   */
  descriptionClassName?: string;

  /**
   * Whether to show a ripple effect on interaction
   */
  ripple?: boolean;

  /**
   * Whether the checkbox should take up the full width of its container
   */
  fullWidth?: boolean;

  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;

  /**
   * ID of the element that describes this checkbox
   */
  ariaDescribedBy?: string;

  /**
   * ID of the element that labels this checkbox
   */
  ariaLabelledBy?: string;

  /**
   * Data attributes for testing
   */
  dataTestId?: string;
}

export interface CheckboxGroupProps {
  /**
   * Array of checkbox options
   */
  options: CheckboxOption[];

  /**
   * The controlled value array of checked checkbox values
   */
  value?: string[];

  /**
   * Default value array for uncontrolled usage
   */
  defaultValue?: string[];

  /**
   * Callback fired when the value changes
   */
  onChange?: (value: string[]) => void;

  /**
   * The name attribute for all checkboxes in the group
   */
  name?: string;

  /**
   * Label for the checkbox group
   */
  label?: ReactNode;

  /**
   * Description for the checkbox group
   */
  description?: string;

  /**
   * Whether the group is required
   */
  required?: boolean;

  /**
   * Whether the group is disabled
   */
  disabled?: boolean;

  /**
   * Whether the group is in an error state
   */
  error?: boolean;

  /**
   * Error message to display below the group
   */
  errorMessage?: string;

  /**
   * The layout direction of the checkboxes
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Spacing between checkboxes
   */
  spacing?: 'tight' | 'normal' | 'loose';

  /**
   * The size variant for all checkboxes
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The color variant for all checkboxes
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Maximum number of checkboxes that can be selected
   */
  maxSelections?: number;

  /**
   * Minimum number of checkboxes that must be selected
   */
  minSelections?: number;

  /**
   * Additional CSS classes for the root element
   */
  className?: string;

  /**
   * Data attributes for testing
   */
  dataTestId?: string;
}

export interface CheckboxOption {
  /**
   * The unique value for this option
   */
  value: string;

  /**
   * The label to display for this option
   */
  label: ReactNode;

  /**
   * Additional description for this option
   */
  description?: string;

  /**
   * Whether this specific option is disabled
   */
  disabled?: boolean;

  /**
   * Whether this option is required when the group has minSelections
   */
  required?: boolean;

  /**
   * Custom data attributes for this option
   */
  dataTestId?: string;
}

export interface CheckboxStyles {
  root?: string;
  input?: string;
  label?: string;
  description?: string;
  error?: string;
  icon?: string;
  ripple?: string;
}

export interface CheckboxTheme {
  sizes: {
    small: {
      checkbox: number;
      fontSize: string;
      spacing: string;
    };
    medium: {
      checkbox: number;
      fontSize: string;
      spacing: string;
    };
    large: {
      checkbox: number;
      fontSize: string;
      spacing: string;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  borderRadius: string;
  borderWidth: string;
  transitionDuration: string;
}
