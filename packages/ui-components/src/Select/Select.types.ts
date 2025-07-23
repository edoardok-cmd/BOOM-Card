import { ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { ComponentSize, ComponentVariant, ComponentStatus } from '../types/common';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
  group?: string;
  meta?: Record<string, any>;
}

export interface SelectGroup<T = string> {
  label: string;
  options: SelectOption<T>[];
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  // Basic props
  id?: string;
  name?: string;
  value?: T | T[];
  defaultValue?: T | T[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  className?: string;
  
  // Options
  options?: SelectOption<T>[];
  groups?: SelectGroup<T>[];
  
  // Multiple selection
  multiple?: boolean;
  maxSelections?: number;
  minSelections?: number;
  
  // Appearance
  size?: ComponentSize;
  variant?: ComponentVariant;
  status?: ComponentStatus;
  fullWidth?: boolean;
  
  // Features
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  virtualized?: boolean;
  createable?: boolean;
  
  // Labels and messages
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  loadingText?: string;
  noOptionsText?: string;
  searchPlaceholder?: string;
  
  // Icons
  icon?: ReactNode;
  clearIcon?: ReactNode;
  dropdownIcon?: ReactNode;
  loadingIcon?: ReactNode;
  
  // Callbacks
  onChange?: (value: T | T[] | null, option?: SelectOption<T> | SelectOption<T>[]) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onSearch?: (searchTerm: string) => void;
  onCreate?: (inputValue: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  
  // Custom rendering
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => ReactNode;
  renderValue?: (value: T | T[], options: SelectOption<T> | SelectOption<T>[]) => ReactNode;
  renderGroup?: (group: SelectGroup<T>) => ReactNode;
  
  // Validation
  validateOption?: (option: SelectOption<T>) => boolean;
  compareOptions?: (a: SelectOption<T>, b: SelectOption<T>) => number;
  
  // Async
  loadOptions?: (searchTerm: string) => Promise<SelectOption<T>[]>;
  loadingOptions?: boolean;
  cacheOptions?: boolean;
  defaultOptions?: boolean | SelectOption<T>[];
  
  // Position
  menuPlacement?: 'auto' | 'top' | 'bottom';
  menuPosition?: 'fixed' | 'absolute';
  menuPortalTarget?: HTMLElement;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
  
  // Custom styles
  styles?: SelectStyles;
  classNames?: SelectClassNames;
  
  // Localization
  locale?: 'en' | 'bg';
  translations?: SelectTranslations;
}

export interface SelectStyles {
  container?: React.CSSProperties;
  control?: React.CSSProperties;
  valueContainer?: React.CSSProperties;
  indicatorsContainer?: React.CSSProperties;
  menu?: React.CSSProperties;
  menuList?: React.CSSProperties;
  option?: React.CSSProperties;
  group?: React.CSSProperties;
  groupHeading?: React.CSSProperties;
  placeholder?: React.CSSProperties;
  singleValue?: React.CSSProperties;
  multiValue?: React.CSSProperties;
  multiValueLabel?: React.CSSProperties;
  multiValueRemove?: React.CSSProperties;
  input?: React.CSSProperties;
  loadingIndicator?: React.CSSProperties;
  loadingMessage?: React.CSSProperties;
  noOptionsMessage?: React.CSSProperties;
}

export interface SelectClassNames {
  container?: string;
  control?: string;
  valueContainer?: string;
  indicatorsContainer?: string;
  menu?: string;
  menuList?: string;
  option?: string;
  group?: string;
  groupHeading?: string;
  placeholder?: string;
  singleValue?: string;
  multiValue?: string;
  multiValueLabel?: string;
  multiValueRemove?: string;
  input?: string;
  loadingIndicator?: string;
  loadingMessage?: string;
  noOptionsMessage?: string;
}

export interface SelectTranslations {
  placeholder?: string;
  noOptions?: string;
  loading?: string;
  search?: string;
  clear?: string;
  clearAll?: string;
  selectAll?: string;
  create?: string;
  selected?: string;
  of?: string;
}

export interface SelectState<T = string> {
  isOpen: boolean;
  isFocused: boolean;
  isLoading: boolean;
  searchTerm: string;
  highlightedIndex: number;
  selectedOptions: SelectOption<T>[];
  filteredOptions: SelectOption<T>[];
  menuHeight: number;
  menuWidth: number;
}

export interface SelectRef<T = string> {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  getValue: () => T | T[] | null;
  getOptions: () => SelectOption<T>[];
  setOptions: (options: SelectOption<T>[]) => void;
}

export type SelectSize = 'small' | 'medium' | 'large';
export type SelectVariant = 'outlined' | 'filled' | 'standard';
export type SelectStatus = 'default' | 'error' | 'warning' | 'success';

export interface UseSelectProps<T = string> extends Omit<SelectProps<T>, 'ref'> {
  inputRef?: React.RefObject<HTMLInputElement>;
  menuRef?: React.RefObject<HTMLDivElement>;
}

export interface UseSelectReturn<T = string> {
  // State
  isOpen: boolean;
  isFocused: boolean;
  searchTerm: string;
  highlightedIndex: number;
  selectedOptions: SelectOption<T>[];
  filteredOptions: SelectOption<T>[];
  
  // Handlers
  handleToggle: () => void;
  handleOpen: () => void;
  handleClose: () => void;
  handleFocus: (event: FocusEvent<HTMLElement>) => void;
  handleBlur: (event: FocusEvent<HTMLElement>) => void;
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  handleOptionClick: (option: SelectOption<T>) => void;
  handleClear: () => void;
  handleCreate: () => void;
  
  // Refs
  inputRef: React.RefObject<HTMLInputElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  
  // Computed
  displayValue: string;
  hasValue: boolean;
  isMultiple: boolean;
  isSearchable: boolean;
  isClearable: boolean;
  isCreateable: boolean;
  
  // Helpers
  getOptionLabel: (option: SelectOption<T>) => string;
  getOptionValue: (option: SelectOption<T>) => T;
  isOptionSelected: (option: SelectOption<T>) => boolean;
  isOptionDisabled: (option: SelectOption<T>) => boolean;
}
