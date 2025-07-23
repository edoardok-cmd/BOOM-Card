import { ReactNode } from 'react';

export interface TimePickerProps {
  /**
   * Current selected time value
   */
  value?: Date | null;
  
  /**
   * Callback fired when the time value changes
   */
  onChange?: (time: Date | null) => void;
  
  /**
   * Label for the time picker input
   */
  label?: string;
  
  /**
   * Placeholder text when no time is selected
   */
  placeholder?: string;
  
  /**
   * Additional CSS classes for styling
   */
  className?: string;
  
  /**
   * Whether the time picker is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the time picker is read-only
   */
  readOnly?: boolean;
  
  /**
   * Whether the time picker is required
   */
  required?: boolean;
  
  /**
   * Error state of the time picker
   */
  error?: boolean;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Name attribute for the input element
   */
  name?: string;
  
  /**
   * ID for the input element
   */
  id?: string;
  
  /**
   * Time format (12-hour or 24-hour)
   */
  format?: '12' | '24';
  
  /**
   * Minimum selectable time
   */
  minTime?: Date;
  
  /**
   * Maximum selectable time
   */
  maxTime?: Date;
  
  /**
   * Step interval in minutes for time selection
   */
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  
  /**
   * Whether to show seconds selector
   */
  showSeconds?: boolean;
  
  /**
   * Custom icon for the time picker trigger
   */
  icon?: ReactNode;
  
  /**
   * Position of the time picker popover
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  
  /**
   * Whether to clear the input when clicking outside
   */
  clearable?: boolean;
  
  /**
   * Callback fired when the input loses focus
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired when the input gains focus
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Whether to auto-focus the input on mount
   */
  autoFocus?: boolean;
  
  /**
   * Tab index for keyboard navigation
   */
  tabIndex?: number;
  
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  
  /**
   * ARIA described by ID for accessibility
   */
  ariaDescribedBy?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
  
  /**
   * Size variant of the time picker
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Variant style of the time picker
   */
  variant?: 'outlined' | 'filled' | 'standard';
  
  /**
   * Whether to show the clear button
   */
  showClearButton?: boolean;
  
  /**
   * Custom render function for time display
   */
  renderValue?: (time: Date | null) => string;
  
  /**
   * Locale for time formatting
   */
  locale?: 'en' | 'bg';
  
  /**
   * Whether to use native time input on mobile
   */
  useNativeOnMobile?: boolean;
  
  /**
   * Z-index for the popover
   */
  zIndex?: number;
  
  /**
   * Whether the popover should be portal-ed
   */
  disablePortal?: boolean;
  
  /**
   * Container element for the portal
   */
  portalContainer?: HTMLElement | null;
  
  /**
   * Callback fired when the popover opens
   */
  onOpen?: () => void;
  
  /**
   * Callback fired when the popover closes
   */
  onClose?: () => void;
  
  /**
   * Whether the popover is controlled externally
   */
  open?: boolean;
  
  /**
   * Default open state for uncontrolled mode
   */
  defaultOpen?: boolean;
}

export interface TimePickerState {
  isOpen: boolean;
  selectedHour: number | null;
  selectedMinute: number | null;
  selectedSecond: number | null;
  selectedPeriod: 'AM' | 'PM';
  inputValue: string;
  focusedElement: 'hour' | 'minute' | 'second' | null;
}

export interface TimeOption {
  value: number;
  label: string;
  disabled?: boolean;
}

export interface TimePickerContextValue {
  value: Date | null;
  onChange: (time: Date | null) => void;
  format: '12' | '24';
  minuteStep: number;
  showSeconds: boolean;
  minTime?: Date;
  maxTime?: Date;
  locale: 'en' | 'bg';
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedHour: number | null;
  selectedMinute: number | null;
  selectedSecond: number | null;
  selectedPeriod: 'AM' | 'PM';
  setSelectedHour: (hour: number | null) => void;
  setSelectedMinute: (minute: number | null) => void;
  setSelectedSecond: (second: number | null) => void;
  setSelectedPeriod: (period: 'AM' | 'PM') => void;
  handleTimeChange: () => void;
}

export interface TimePickerInputProps {
  value: Date | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClick: () => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  name?: string;
  id?: string;
  className?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  showClearButton?: boolean;
  clearable?: boolean;
  icon?: ReactNode;
  format: '12' | '24';
  showSeconds: boolean;
  locale: 'en' | 'bg';
  renderValue?: (time: Date | null) => string;
}

export interface TimePickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  zIndex?: number;
  disablePortal?: boolean;
  portalContainer?: HTMLElement | null;
  children: ReactNode;
}

export interface TimePickerClockProps {
  type: 'hour' | 'minute' | 'second';
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: '12' | '24';
  disabled?: boolean;
}

export interface TimePickerListProps {
  type: 'hour' | 'minute' | 'second' | 'period';
  value: number | string | null;
  onChange: (value: number | string) => void;
  options: TimeOption[];
  disabled?: boolean;
  className?: string;
}

export interface TimeValidationResult {
  isValid: boolean;
  error?: string;
  parsedTime?: Date;
}

export interface TimeFormatOptions {
  format: '12' | '24';
  showSeconds: boolean;
  locale: 'en' | 'bg';
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TimePickerTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  disabled: string;
  hover: string;
  focus: string;
  selected: string;
}
