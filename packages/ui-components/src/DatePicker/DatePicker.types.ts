import { ReactNode } from 'react';

export interface DatePickerProps {
  /**
   * The selected date value
   */
  value?: Date | null;
  
  /**
   * Callback fired when date is selected
   */
  onChange?: (date: Date | null) => void;
  
  /**
   * The minimum selectable date
   */
  minDate?: Date;
  
  /**
   * The maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  
  /**
   * Whether the date picker is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the date picker is read-only
   */
  readOnly?: boolean;
  
  /**
   * Whether the date picker is required
   */
  required?: boolean;
  
  /**
   * Error state of the date picker
   */
  error?: boolean;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Label for the date picker
   */
  label?: string;
  
  /**
   * Name attribute for the input element
   */
  name?: string;
  
  /**
   * ID attribute for the input element
   */
  id?: string;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Custom styles for the container
   */
  style?: React.CSSProperties;
  
  /**
   * Date format string (e.g., 'dd/MM/yyyy', 'MM-dd-yyyy')
   * @default 'dd/MM/yyyy'
   */
  format?: string;
  
  /**
   * Locale for date formatting and calendar
   * @default 'en'
   */
  locale?: 'en' | 'bg';
  
  /**
   * First day of the week (0 = Sunday, 1 = Monday, etc.)
   * @default 1 (Monday)
   */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * Whether to show week numbers
   * @default false
   */
  showWeekNumbers?: boolean;
  
  /**
   * Whether to close calendar on date selection
   * @default true
   */
  closeOnSelect?: boolean;
  
  /**
   * Whether to clear the selected date when clicking outside
   * @default false
   */
  clearable?: boolean;
  
  /**
   * Custom icon for the calendar trigger
   */
  icon?: ReactNode;
  
  /**
   * Position of the calendar relative to the input
   * @default 'bottom-start'
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  
  /**
   * Callback fired when the calendar is opened
   */
  onOpen?: () => void;
  
  /**
   * Callback fired when the calendar is closed
   */
  onClose?: () => void;
  
  /**
   * Callback fired when the input gains focus
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Callback fired when the input loses focus
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Array of dates that should be disabled
   */
  disabledDates?: Date[];
  
  /**
   * Function to determine if a date should be disabled
   */
  isDateDisabled?: (date: Date) => boolean;
  
  /**
   * Array of dates that should be highlighted
   */
  highlightedDates?: Date[];
  
  /**
   * Function to determine if a date should be highlighted
   */
  isDateHighlighted?: (date: Date) => boolean;
  
  /**
   * Custom render function for day cells
   */
  renderDay?: (date: Date, isSelected: boolean, isDisabled: boolean, isHighlighted: boolean) => ReactNode;
  
  /**
   * Whether to show today button
   * @default true
   */
  showTodayButton?: boolean;
  
  /**
   * Whether to show clear button
   * @default true if clearable is true
   */
  showClearButton?: boolean;
  
  /**
   * Custom text for today button
   */
  todayButtonText?: string;
  
  /**
   * Custom text for clear button
   */
  clearButtonText?: string;
  
  /**
   * ARIA label for the input element
   */
  ariaLabel?: string;
  
  /**
   * ARIA described by ID
   */
  ariaDescribedBy?: string;
  
  /**
   * Tab index for the input element
   */
  tabIndex?: number;
  
  /**
   * Whether to auto-focus the input on mount
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * Input size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Input variant style
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled' | 'standard';
  
  /**
   * Whether to show the calendar in full width
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Z-index for the calendar popover
   * @default 1000
   */
  zIndex?: number;
  
  /**
   * Whether to enable keyboard navigation
   * @default true
   */
  enableKeyboardNavigation?: boolean;
  
  /**
   * Custom validation function
   */
  validate?: (date: Date | null) => string | undefined;
  
  /**
   * Whether to show validation on blur
   * @default true
   */
  validateOnBlur?: boolean;
  
  /**
   * Whether to show validation on change
   * @default false
   */
  validateOnChange?: boolean;
  
  /**
   * Custom date parser function
   */
  parseDate?: (value: string, format: string) => Date | null;
  
  /**
   * Custom date formatter function
   */
  formatDate?: (date: Date, format: string) => string;
  
  /**
   * Whether to allow manual input
   * @default true
   */
  allowManualInput?: boolean;
  
  /**
   * Input mask pattern
   */
  mask?: string;
  
  /**
   * Whether to animate the calendar opening/closing
   * @default true
   */
  animated?: boolean;
  
  /**
   * Theme variant
   * @default 'light'
   */
  theme?: 'light' | 'dark';
  
  /**
   * Custom CSS classes for different parts
   */
  classes?: {
    root?: string;
    input?: string;
    calendar?: string;
    header?: string;
    weekDays?: string;
    days?: string;
    day?: string;
    today?: string;
    selected?: string;
    disabled?: string;
    highlighted?: string;
    footer?: string;
  };
  
  /**
   * Data test ID for testing
   */
  dataTestId?: string;
}

export interface DatePickerRef {
  /**
   * Focus the input element
   */
  focus: () => void;
  
  /**
   * Blur the input element
   */
  blur: () => void;
  
  /**
   * Clear the selected date
   */
  clear: () => void;
  
  /**
   * Open the calendar
   */
  open: () => void;
  
  /**
   * Close the calendar
   */
  close: () => void;
  
  /**
   * Get the current value
   */
  getValue: () => Date | null;
  
  /**
   * Set a new value
   */
  setValue: (date: Date | null) => void;
  
  /**
   * Validate the current value
   */
  validate: () => boolean;
  
  /**
   * Get validation errors
   */
  getErrors: () => string[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isHighlighted: boolean;
  isWeekend: boolean;
}

export interface CalendarWeek {
  weekNumber?: number;
  days: CalendarDay[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

export interface DatePickerLocale {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  today: string;
  clear: string;
  close: string;
  selectMonth: string;
  selectYear: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  dateFormat: string;
  dateTimeFormat: string;
  firstDayOfWeek: number;
}

export type DatePickerView = 'days' | 'months' | 'years';

export interface DatePickerState {
  isOpen: boolean;
  view: DatePickerView;
  viewDate: Date;
  selectedDate: Date | null;
  inputValue: string;
  focusedDate: Date | null;
  error: string | undefined;
}

export interface DatePickerAction {
  type: DatePickerActionType;
  payload?: any;
}

export enum DatePickerActionType {
  SET_OPEN = 'SET_OPEN',
  SET_VIEW = 'SET_VIEW',
  SET_VIEW_DATE = 'SET_VIEW_DATE',
  SET_SELECTED_DATE = 'SET_SELECTED_DATE',
  SET_INPUT_VALUE = 'SET_INPUT_VALUE',
  SET_FOCUSED_DATE = 'SET_FOCUSED_DATE',
  SET_ERROR = 'SET_ERROR',
  NAVIGATE_MONTH = 'NAVIGATE_MONTH',
  NAVIGATE_YEAR = 'NAVIGATE_YEAR',
  RESET = 'RESET',
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  /**
   * The selected date range
   */
  value?: DateRange;
  
  /**
   * Callback fired when date range is selected
   */
  onChange?: (range: DateRange) => void;
  
  /**
   * Whether to allow same day selection
   * @default true
   */
  allowSameDaySelection?: boolean;
  
  /**
   * Maximum range span in days
   */
  maxRangeSpan?: number;
  
  /**
   * Minimum range span in days
   * @default 1
   */
  minRangeSpan?: number;
  
  /**
   * Custom text for range separator
   * @default ' - '
   */
  rangeSeparator?: string;
  
  /**
   * Whether to show range preview on hover
   * @default true
   */
  showRangePreview?: boolean;
}
