import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  position?: 'auto' | 'top' | 'bottom';
  maxHeight?: number;
  renderOption?: (option: DropdownOption) => React.ReactNode;
  renderValue?: (value: string | number | (string | number)[]) => React.ReactNode;
  onSearch?: (query: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  loading = false,
  searchable = false,
  clearable = false,
  multiple = false,
  className,
  dropdownClassName,
  optionClassName,
  size = 'md',
  variant = 'default',
  position = 'auto',
  maxHeight = 300,
  renderOption,
  renderValue,
  onSearch,
  onOpen,
  onClose,
  id,
  name,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
    if (multiple && Array.isArray(value)) return value;
    if (!multiple && value !== undefined) return [value];
    return [];
  });
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Group options by group property
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    if (position !== 'auto' || !triggerRef.current || !isOpen) {
      setDropdownPosition(position === 'top' ? 'top' : 'bottom');
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    if (spaceBelow < maxHeight && spaceAbove > spaceBelow) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }, [position, maxHeight, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculatePosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, calculatePosition]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }, [isOpen]);

  // Handle option selection
  const handleOptionClick = useCallback((optionValue: string | number) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange?.(newValues as any);
    } else {
      setSelectedValues([optionValue]);
      onChange?.(optionValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    }, [multiple, selectedValues, onChange]);

  // Handle clear
  const handleClear = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedValues([]);
    onChange?.(multiple ? [] : undefined as any);
  }, [multiple, onChange]);

  // Handle search
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  // Handle dropdown open/close
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      searchInputRef.current?.focus();
    } else {
      onClose?.();
      setSearchQuery('');
    }, [isOpen, onOpen, onClose]);

  // Get display value
  const getDisplayValue = () => {
    if (renderValue) {
      return renderValue(multiple ? selectedValues : selectedValues[0]);
    }

    if (selectedValues.length === 0) {
      return placeholder || t('dropdown.placeholder');
    }

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || '';
      }
      return t('dropdown.multipleSelected', { count: selectedValues.length });
    }

    return option?.label || '';
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const variantClasses = {
    default: 'bg-white border-gray-300 hover:border-gray-400',
    outlined: 'bg-transparent border-2 border-gray-300 hover:border-gray-400',
    filled: 'bg-gray-100 border-transparent hover:bg-gray-200',
  };

  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : '';

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            'block mb-2 text-sm font-medium',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={!!error}
        className={clsx(
          'relative w-full rounded-md border shadow-sm',
          'flex items-center justify-between',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          sizeClasses[size],)
          variantClasses[variant],
          errorClasses,
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'cursor-wait'
        )}
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <div className="flex items-center gap-2">
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors"
              aria-label={t('dropdown.clear')}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <ChevronDownIcon
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}

      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg',
            'border border-gray-200 overflow-hidden',
            dropdownPosition === 'top' && 'bottom-full mb-1 mt-0',
            dropdownClassName
          )}
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t('dropdown.search')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - (searchable ? 50 : 0)}px` }}>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {t('dropdown.noOptions')}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== 'default' && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleOptionClick(option.value)}
                      className={clsx(
                        'w-full text-left px-4 py-2',
                        'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                        'transition-colors duration-150',
                        option.disabled && 'opacity-50 cursor-not-allowed',
                        selectedValues.includes(option.value) && 'bg-blue-50 text-blue-700',
                        optionClassName
                      )}
                      role="option"
                      aria-selected={selectedValues.includes(option.value)}
                    >
                    
}}}}
}
}
}
}
}
