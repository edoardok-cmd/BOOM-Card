import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  maxHeight?: number;
  className?: string;
  optionClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
  renderOption?: (option: SelectOption) => React.ReactNode;
  filterOption?: (option: SelectOption, searchQuery: string) => boolean;
  noOptionsMessage?: string;
  loadingMessage?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm px-2',
  md: 'h-10 text-base px-3',
  lg: 'h-12 text-lg px-4'
};

const variantClasses = {
  outline: 'border border-gray-300 bg-white hover:border-gray-400 focus:border-primary-500',
  filled: 'bg-gray-100 border border-transparent hover:bg-gray-200 focus:bg-white focus:border-primary-500',
  ghost: 'border border-transparent hover:bg-gray-100 focus:bg-gray-100 focus:border-gray-300'
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  label,
  helperText,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  loading = false,
  maxHeight = 300,
  className,
  optionClassName,
  labelClassName,
  size = 'md',
  variant = 'outline',
  renderOption,
  filterOption,
  noOptionsMessage,
  loadingMessage,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalValue, setInternalValue] = useState<string | string[]>(
    value ?? defaultValue ?? (multiple ? [] : '')
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update internal value when prop value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }, [value]);

  // Handle click outside
  useClickOutside(selectRef, () => {
    setIsOpen(false);
    setSearchQuery('');
  });

  // Get current value(s) as array for easier handling
  const currentValues = useMemo(() => {
    if (Array.isArray(internalValue)) {
      return internalValue;
    }
    return internalValue ? [internalValue] : [];
  }, [internalValue]);

  // Get selected options
  const selectedOptions = useMemo(() => {
    return options.filter(option => currentValues.includes(option.value));
  }, [options, currentValues]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;

    if (filterOption) {
      return options.filter(option => filterOption(option, searchQuery));
    }

    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, filterOption]);

  // Group options by group property
  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];

    filteredOptions.forEach(option => {)
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      });

    return { groups, ungrouped };
  }, [filteredOptions]);

  // Handle option selection
  const handleOptionClick = useCallback((option: SelectOption) => {
    if (option.disabled) return;

    let newValue: string | string[];

    if (multiple) {
      const currentArray = currentValues;
      if (currentArray.includes(option.value)) {
        newValue = currentArray.filter(v => v !== option.value);
      } else {
        newValue = [...currentArray, option.value];
      } else {
      newValue = option.value;
      setIsOpen(false);
    }

    setInternalValue(newValue);
    onChange?.(newValue);
    setSearchQuery('');
  }, [currentValues, multiple, onChange]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : '';
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [multiple, onChange]);

  // Handle keyboard navigation
  const { highlightedIndex, setHighlightedIndex } = useKeyboardNavigation({
    isOpen,
    itemCount: filteredOptions.length,
    onSelect: (index) => {
      handleOptionClick(filteredOptions[index]);
    },
    onClose: () => setIsOpen(false)
  });

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
  }, [highlightedIndex]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(0);
  };

  // Render option content
  const renderOptionContent = (option: SelectOption) => {
    if (renderOption) {
      return renderOption(option);
    }

    return (
      <div className="flex items-center space-x-2">
        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
        <div className="flex-1">
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-xs text-gray-500">{option.description}</div>
          )}
        </div>
        {multiple && currentValues.includes(option.value) && (
          <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
        )}
      </div>
    );
  };

  // Get display text
  const displayText = useMemo(() => {
    if (selectedOptions.length === 0) {
      return placeholder || t('select.placeholder', 'Select an option');
    }

    if (multiple) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return t('select.multipleSelected', '{{count}} selected', { count: selectedOptions.length });
    }

    return selectedOptions[0].label;
  }, [selectedOptions, placeholder, multiple, t]);

  const showClearButton = clearable && currentValues.length > 0 && !disabled;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block mb-1 text-sm font-medium text-gray-700',
            error && 'text-red-600',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={selectRef}
        className={cn(
          'relative rounded-md transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={error}
          aria-required={required}
          className={cn(
            'w-full flex items-center justify-between rounded-md transition-all duration-200',
            sizeClasses[size],)
            variantClasses[variant],
            error && 'border-red-500 focus:border-red-500',
            isOpen && 'ring-2 ring-primary-500 ring-opacity-50',
            disabled && 'cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50'
          )}
        >
          <span className={cn(
            'flex-1 text-left truncate',
            !selectedOptions.length && 'text-gray-500'
          )}>
            {displayText}
          </span>
          <div className="flex items-center space-x-1">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
            )}
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                aria-label={t('select.clear', 'Clear selection')}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200',
              'animate-in fade-in-0 zoom-in-95'
            )}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('select.search', 'Search...')}
                    className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <ul
              ref={listRef}
              role="listbox"
              aria-label={label}
              className="overflow-auto py-1"
              style={{ maxHeight: searchable ? `${maxHeight - 50}px` : `${maxHeight}px` }}
            >
              {loading ? (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">
                  {loadingMessage || t('select.loading', 'Loading...')}
                </li>
              ) : filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">
                  {noOptionsMessage || t('select.noOptions', 'No options found')}
                </li>
              ) : (
                <>
                  {groupedOptions.ungrouped.map((option, index) => (
                    <li
                      key={option.value}
                      role=
}}}}
}
}
}
}
