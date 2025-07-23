import { ReactNode, CSSProperties } from 'react';

export interface DropdownOption<T = any> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
  group?: string;
  metadata?: Record<string, any>;
}

export interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

export type DropdownSize = 'small' | 'medium' | 'large';
export type DropdownVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type DropdownPlacement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end' | 'left' | 'right';

export interface DropdownProps<T = any> {
  // Core props
  options: DropdownOption<T>[] | DropdownGroup[];
  value?: T | T[];
  defaultValue?: T | T[];
  onChange?: (value: T | T[], option: DropdownOption<T> | DropdownOption<T>[]) => void;
  onOpen?: () => void;
  onClose?: () => void;
  
  // Display props
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  
  // Styling props
  size?: DropdownSize;
  variant?: DropdownVariant;
  fullWidth?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  
  // Behavior props
  placement?: DropdownPlacement;
  closeOnSelect?: boolean;
  openOnFocus?: boolean;
  autoFocus?: boolean;
  virtualScroll?: boolean;
  maxHeight?: number | string;
  
  // Search props
  searchPlaceholder?: string;
  searchEmptyText?: string;
  onSearch?: (searchTerm: string) => void;
  filterOption?: (option: DropdownOption<T>, searchTerm: string) => boolean;
  
  // Custom render props
  renderOption?: (option: DropdownOption<T>, isSelected: boolean, isHighlighted: boolean) => ReactNode;
  renderValue?: (value: T | T[], options: DropdownOption<T> | DropdownOption<T>[]) => ReactNode;
  renderGroup?: (group: DropdownGroup) => ReactNode;
  
  // Icons and indicators
  dropdownIcon?: ReactNode;
  clearIcon?: ReactNode;
  loadingIcon?: ReactNode;
  checkIcon?: ReactNode;
  
  // Accessibility
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  
  // Form integration
  required?: boolean;
  form?: string;
  
  // Advanced features
  creatable?: boolean;
  onCreate?: (inputValue: string) => void;
  createLabel?: string | ((inputValue: string) => string);
  
  // Validation
  validate?: (value: T | T[]) => string | undefined;
  validateOnBlur?: boolean;
  
  // Performance
  debounceSearch?: number;
  lazyLoad?: boolean;
  pageSize?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  
  // Portal rendering
  portal?: boolean;
  portalTarget?: HTMLElement | string;
  
  // Custom components
  components?: {
    Option?: React.ComponentType<DropdownOptionProps<T>>;
    Value?: React.ComponentType<DropdownValueProps<T>>;
    Indicator?: React.ComponentType<DropdownIndicatorProps>;
    ClearIndicator?: React.ComponentType<DropdownClearIndicatorProps>;
    LoadingIndicator?: React.ComponentType<DropdownLoadingIndicatorProps>;
    NoOptions?: React.ComponentType<DropdownNoOptionsProps>;
    Group?: React.ComponentType<DropdownGroupProps>;
  };
}

export interface DropdownOptionProps<T = any> {
  option: DropdownOption<T>;
  isSelected: boolean;
  isHighlighted: boolean;
  isDisabled: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  searchTerm?: string;
}

export interface DropdownValueProps<T = any> {
  value: T | T[];
  options: DropdownOption<T> | DropdownOption<T>[];
  placeholder?: string;
  isMultiple: boolean;
  onClear?: () => void;
}

export interface DropdownIndicatorProps {
  isOpen: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

export interface DropdownClearIndicatorProps {
  onClick: (event: React.MouseEvent) => void;
  isDisabled: boolean;
}

export interface DropdownLoadingIndicatorProps {
  size: DropdownSize;
}

export interface DropdownNoOptionsProps {
  searchTerm: string;
  creatable?: boolean;
  createLabel?: string | ((inputValue: string) => string);
}

export interface DropdownGroupProps {
  group: DropdownGroup;
  children: ReactNode;
}

export interface DropdownState<T = any> {
  isOpen: boolean;
  searchTerm: string;
  highlightedIndex: number;
  selectedValues: T[];
  filteredOptions: DropdownOption<T>[];
}

export interface DropdownRef<T = any> {
  open: () => void;
  close: () => void;
  toggle: () => void;
  focus: () => void;
  blur: () => void;
  clear: () => void;
  reset: () => void;
  getValue: () => T | T[] | undefined;
  setValue: (value: T | T[]) => void;
  getOptions: () => DropdownOption<T>[];
  setOptions: (options: DropdownOption<T>[]) => void;
}

export interface UseDropdownProps<T = any> extends Omit<DropdownProps<T>, 'className' | 'style'> {
  ref?: React.Ref<DropdownRef<T>>;
}

export interface UseDropdownReturn<T = any> {
  state: DropdownState<T>;
  getDropdownProps: () => Record<string, any>;
  getInputProps: () => Record<string, any>;
  getOptionProps: (option: DropdownOption<T>, index: number) => Record<string, any>;
  getClearProps: () => Record<string, any>;
  getMenuProps: () => Record<string, any>;
  isOpen: boolean;
  selectedOption: DropdownOption<T> | DropdownOption<T>[] | null;
  highlightedOption: DropdownOption<T> | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  selectOption: (option: DropdownOption<T>) => void;
  clearSelection: () => void;
  setHighlightedIndex: (index: number) => void;
}

// Utility types for BOOM Card specific use cases
export interface CategoryDropdownOption extends DropdownOption<string> {
  count?: number;
  parentCategory?: string;
  subcategories?: string[];
}

export interface LocationDropdownOption extends DropdownOption<string> {
  coordinates?: {
    lat: number;
    lng: number;
  };
  region?: string;
  postalCode?: string;
}

export interface DiscountRangeDropdownOption extends DropdownOption<string> {
  min: number;
  max: number;
  displayFormat?: string;
}

export interface PartnerDropdownOption extends DropdownOption<string> {
  partnerId: string;
  partnerName: string;
  category: string;
  discountPercentage: number;
  logoUrl?: string;
  verified?: boolean;
}

export interface LanguageDropdownOption extends DropdownOption<string> {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

// Event types
export interface DropdownChangeEvent<T = any> {
  value: T | T[];
  option: DropdownOption<T> | DropdownOption<T>[];
  type: 'select' | 'deselect' | 'clear' | 'create';
}

export interface DropdownSearchEvent {
  searchTerm: string;
  filteredCount: number;
  totalCount: number;
}

export interface DropdownKeyboardEvent {
  key: string;
  isOpen: boolean;
  highlightedIndex: number;
  preventDefault: () => void;
}
