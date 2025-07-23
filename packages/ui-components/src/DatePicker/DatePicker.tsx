import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, isAfter, addMonths, subMonths, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import clsx from 'clsx';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  format?: string;
  className?: string;
  id?: string;
  name?: string;
  clearable?: boolean;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  highlightedDates?: { date: Date; className?: string; tooltip?: string }[];
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dateRange?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  label,
  required = false,
  format: dateFormat = 'dd/MM/yyyy',
  className,
  id,
  name,
  clearable = true,
  disabledDates = [],
  disabledDaysOfWeek = [],
  highlightedDates = [],
  showYearDropdown = true,
  showMonthDropdown = true,
  dateRange = false,
  startDate,
  endDate,
  onRangeChange,
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || startDate || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(startDate || null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(endDate || null);
  const [selectingRangeEnd, setSelectingRangeEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = i18n.language === 'bg' ? bg : enUS;

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDateClick = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;

    if (dateRange) {
      if (!selectingRangeEnd) {
        setRangeStart(date);
        setRangeEnd(null);
        setSelectingRangeEnd(true);
      } else {
        if (date < rangeStart!) {
          setRangeStart(date);
          setRangeEnd(rangeStart);
        } else {
          setRangeEnd(date);
        }
        setSelectingRangeEnd(false);
        if (onRangeChange) {
          onRangeChange(rangeStart, date < rangeStart! ? rangeStart : date);
        }
        setIsOpen(false);
      } else {
      onChange(date);
      setIsOpen(false);
    }, [dateRange, selectingRangeEnd, rangeStart, onChange, onRangeChange]);

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (disabled) return true;
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    if (disabledDaysOfWeek.includes(date.getDay())) return true;
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) return true;
    return false;
  }, [disabled, minDate, maxDate, disabledDaysOfWeek, disabledDates]);

  const isDateInRange = useCallback((date: Date): boolean => {
    if (!dateRange || !rangeStart) return false;
    
    if (selectingRangeEnd && hoveredDate) {
      const start = hoveredDate < rangeStart ? hoveredDate : rangeStart;
      const end = hoveredDate < rangeStart ? rangeStart : hoveredDate;
      return isWithinInterval(date, { start, end });
    }
    
    if (rangeEnd) {
      return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
    }
    
    return false;
  }, [dateRange, rangeStart, rangeEnd, selectingRangeEnd, hoveredDate]);

  const getHighlightedDateInfo = useCallback((date: Date) => {
    return highlightedDates.find(highlighted => isSameDay(date, highlighted.date));
  }, [highlightedDates]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const handleClear = () => {
    if (dateRange) {
      setRangeStart(null);
      setRangeEnd(null);
      if (onRangeChange) {
        onRangeChange(null, null);
      } else {
      onChange(null);
    };

  const formatDisplayValue = (): string => {
    if (dateRange) {
      if (rangeStart && rangeEnd) {
        return `${format(rangeStart, dateFormat, { locale })} - ${format(rangeEnd, dateFormat, { locale })}`;
      }
      return '';
    }
    return value ? format(value, dateFormat, { locale }) : '';
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale });
    const calendarEnd = endOfWeek(monthEnd, { locale });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((day, index) => {
      const isDisabled = isDateDisabled(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isSelected = dateRange 
        ? (rangeStart && isSameDay(day, rangeStart)) || (rangeEnd && isSameDay(day, rangeEnd))
        : value && isSameDay(day, value);
      const isInRange = isDateInRange(day);
      const highlightInfo = getHighlightedDateInfo(day);

      return (
        <button
          key={index}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => dateRange && selectingRangeEnd && setHoveredDate(day)}
          onMouseLeave={() => setHoveredDate(null)}
          className={clsx(
            'relative h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            {
              'text-gray-400': !isCurrentMonth,
              'text-gray-900': isCurrentMonth && !isDisabled,
              'text-gray-300 cursor-not-allowed': isDisabled,
              'bg-primary-600 text-white hover:bg-primary-700': isSelected,
              'bg-primary-100': isInRange && !isSelected,
              'ring-2 ring-primary-600': isToday(day) && !isSelected,
              [highlightInfo?.className || '']: !!highlightInfo,
            }
          )}
          title={highlightInfo?.tooltip}
        >
          {day.getDate()}
          {highlightInfo && (
            <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-600" />
          )}
        </button>
      );
    });
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            'mb-1 block text-sm font-medium',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          readOnly
          disabled={disabled}
          value={formatDisplayValue()}
          placeholder={placeholder || t('datePicker.selectDate')}
          onClick={() => !disabled && setIsOpen(true)}
          className={clsx(
            'w-full rounded-lg border px-4 py-2 text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
            {
              'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error,
              'border-red-600 focus:border-red-600 focus:ring-red-600': error,
              'bg-gray-50 cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
              'pr-20': clearable && formatDisplayValue(),
              'pr-12': !clearable || !formatDisplayValue(),
            }
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {clearable && formatDisplayValue() && !disabl
}}
}
}
}
}
}
}
