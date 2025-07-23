import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  format?: '12h' | '24h';
  minTime?: string;
  maxTime?: string;
  step?: number;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  showSeconds?: boolean;
  clearable?: boolean;
  id?: string;
  name?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
  period?: 'AM' | 'PM';
}

const TimePicker: React.FC<TimePickerProps> = ({
  value = '',
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  helperText,
  label,
  required = false,
  format = '24h',
  minTime,
  maxTime,
  step = 1,
  className,
  inputClassName,
  popoverClassName,
  showSeconds = false,
  clearable = true,
  id,
  name,
  tabIndex,
  autoFocus = false,
  readOnly = false,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<TimeValue>(() => parseTimeString(value, format));
  const [inputValue, setInputValue] = useState(() => formatTimeString(parseTimeString(value, format), format, showSeconds));
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);

  // Parse time string to TimeValue object
  function parseTimeString(timeStr: string, timeFormat: '12h' | '24h'): TimeValue {
    if (!timeStr) {
      return { hours: 0, minutes: 0, seconds: 0, period: timeFormat === '12h' ? 'AM' : undefined };
    }

    const time12hRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i;
    const time24hRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

    let match;
    if (timeFormat === '12h') {
      match = timeStr.match(time12hRegex);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = match[3] ? parseInt(match[3], 10) : 0;
        const period = match[4].toUpperCase() as 'AM' | 'PM';

        // Convert 12h to 24h for internal use
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return { hours, minutes, seconds, period };
      } else {
      match = timeStr.match(time24hRegex);
      if (match) {
        return {
          hours: parseInt(match[1], 10),
          minutes: parseInt(match[2], 10),
          seconds: match[3] ? parseInt(match[3], 10) : 0,
        };
      }

    return { hours: 0, minutes: 0, seconds: 0, period: timeFormat === '12h' ? 'AM' : undefined };
  }

  // Format TimeValue object to time string
  function formatTimeString(time: TimeValue, timeFormat: '12h' | '24h', includeSeconds: boolean): string {
    let { hours, minutes, seconds } = time;

    if (timeFormat === '12h') {
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      
      const timeStr = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return includeSeconds 
        ? `${timeStr}:${seconds.toString().padStart(2, '0')} ${period}`
        : `${timeStr} ${period}`;
    }

    return includeSeconds 
      ? `${timeStr}:${seconds.toString().padStart(2, '0')}`
      : timeStr;
  }

  // Check if time is within min/max bounds
  const isTimeInBounds = useCallback((time: TimeValue): boolean => {
    const timeMinutes = time.hours * 60 + time.minutes;

    if (minTime) {
      const minTimeValue = parseTimeString(minTime, format);
      const minMinutes = minTimeValue.hours * 60 + minTimeValue.minutes;
      if (timeMinutes < minMinutes) return false;
    }

    if (maxTime) {
      const maxTimeValue = parseTimeString(maxTime, format);
      const maxMinutes = maxTimeValue.hours * 60 + maxTimeValue.minutes;
      if (timeMinutes > maxMinutes) return false;
    }

    return true;
  }, [minTime, maxTime, format]);

  // Update time component with bounds checking
  const updateTimeComponent = useCallback((component: 'hours' | 'minutes' | 'seconds', value: number) => {
    const newTime = { ...timeValue };
    
    if (component === 'hours') {
      newTime.hours = Math.max(0, Math.min(23, value));
    } else if (component === 'minutes') {
      newTime.minutes = Math.max(0, Math.min(59, value));
    } else if (component === 'seconds') {
      newTime.seconds = Math.max(0, Math.min(59, value));
    }

    if (isTimeInBounds(newTime)) {
      setTimeValue(newTime);
      const formattedTime = formatTimeString(newTime, format, showSeconds);
      setInputValue(formattedTime);
      onChange?.(formattedTime);
    }, [timeValue, format, showSeconds, onChange, isTimeInBounds]);

  // Toggle AM/PM
  const togglePeriod = useCallback(() => {
    if (format === '12h') {
      newTime.period = newTime.period === 'AM' ? 'PM' : 'AM';
      if (newTime.period === 'PM') {
        newTime.hours = newTime.hours < 12 ? newTime.hours + 12 : newTime.hours;
      } else {
        newTime.hours = newTime.hours >= 12 ? newTime.hours - 12 : newTime.hours;
      }

      if (isTimeInBounds(newTime)) {
        setTimeValue(newTime);
        setInputValue(formattedTime);
        onChange?.(formattedTime);
      }
  }, [timeValue, format, showSeconds, onChange, isTimeInBounds]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsedTime = parseTimeString(newValue, format);
    if (isTimeInBounds(parsedTime)) {
      setTimeValue(parsedTime);
      onChange?.(newValue);
    };

  // Handle clear
  const handleClear = () => {
    setTimeValue({ hours: 0, minutes: 0, seconds: 0, period: format === '12h' ? 'AM' : undefined });
    setInputValue('');
    onChange?.('');
    setIsOpen(false);
  };

  // Scroll to selected time
  const scrollToTime = useCallback(() => {
    setTimeout(() => {
      if (hoursRef.current) {
        const hourElement = hoursRef.current.querySelector(`[data-hour="${timeValue.hours}"]`) as HTMLElement;
        if (hourElement) {
          hoursRef.current.scrollTop = hourElement.offsetTop - hoursRef.current.offsetHeight / 2 + hourElement.offsetHeight / 2;
        }
      if (minutesRef.current) {
        const minuteElement = minutesRef.current.querySelector(`[data-minute="${timeValue.minutes}"]`) as HTMLElement;
        if (minuteElement) {
          minutesRef.current.scrollTop = minuteElement.offsetTop - minutesRef.current.offsetHeight / 2 + minuteElement.offsetHeight / 2;
        }
      if (showSeconds && secondsRef.current) {
        const secondElement = secondsRef.current.querySelector(`[data-second="${timeValue.seconds}"]`) as HTMLElement;
        if (secondElement) {
          secondsRef.current.scrollTop = secondElement.offsetTop - secondsRef.current.offsetHeight / 2 + secondElement.offsetHeight / 2;
        }
    }, 0);
  }, [timeValue, showSeconds]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected time when popover opens
  useEffect(() => {
    if (isOpen) {
      scrollToTime();
    }, [isOpen, scrollToTime]);

  // Update internal state when value prop changes
  useEffect(() => {
    setTimeValue(parsedTime);
    setInputValue(formatTimeString(parsedTime, format, showSeconds));
  }, [value, format, showSeconds]);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const renderTimeColumn = (
    type: 'hours' | 'minutes' | 'seconds',
    max: number,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const values = Array.from({ length: max + 1 }, (_, i) => i);
    const currentValue = timeValue[type];

    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          onClick={() => updateTimeComponent(type, currentValue - 1)}
          disabled={disabled}
          aria-label={t(`timePicker.decrease${type.charAt(0).toUpperCase() + type.slice(1)}`)}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div
          ref={ref}
          className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div className="py-14">
            {values.map((val) => (
              <button
                key={val}
                type="button"
                data-{`${type.slice(0, -1)}`}={val}
                className={cn(
                  'block w-full px-3 py-1 text-center hover:bg-primary-50 transition-colors',
            
}}}}
}
}
}
}
}
}
}
}
}
}
