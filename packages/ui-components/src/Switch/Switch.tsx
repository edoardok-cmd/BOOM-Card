import React, { forwardRef, useId, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Size variant of the switch */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant of the switch */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Label text for the switch */
  label?: string;
  /** Helper text displayed below the switch */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Whether the switch is in a loading state */
  loading?: boolean;
  /** Icon to display when switch is on */
  onIcon?: string;
  /** Icon to display when switch is off */
  offIcon?: string;
  /** Tooltip content */
  tooltip?: string;
  /** Position of the label */
  labelPosition?: 'left' | 'right';
  /** Whether to show on/off text inside the switch */
  showStateText?: boolean;
  /** Custom on text */
  onText?: string;
  /** Custom off text */
  offText?: string;
  /** Whether the switch is indeterminate */
  indeterminate?: boolean;
  /** Callback when switch state changes */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Whether to animate the switch */
  animated?: boolean;
  /** Custom class for the switch container */
  containerClassName?: string;
  /** Custom class for the label */
  labelClassName?: string;
  /** Whether the switch is required */
  required?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Accessibility description */
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: {
    container: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    text: 'text-xs',
    icon: 'w-2 h-2',
    padding: 'p-0.5'
  },
  md: {
    container: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    text: 'text-sm',
    icon: 'w-3 h-3',
    padding: 'p-0.5'
  },
  lg: {
    container: 'w-14 h-8',
    thumb: 'w-7 h-7',
    translate: 'translate-x-6',
    text: 'text-base',
    icon: 'w-4 h-4',
    padding: 'p-0.5'
  };

const variantClasses = {
  primary: {
    checked: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    unchecked: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600'
  },
  secondary: {
    checked: 'bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500',
    unchecked: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600'
  },
  success: {
    checked: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    unchecked: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600'
  },
  warning: {
    checked: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    unchecked: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600'
  },
  danger: {
    checked: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    unchecked: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600'
  };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  size = 'md',
  variant = 'primary',
  label,
  helperText,
  error,
  loading = false,
  onIcon,
  offIcon,
  tooltip,
  labelPosition = 'right',
  showStateText = false,
  onText = 'ON',
  offText = 'OFF',
  indeterminate = false,
  onChange,
  animated = true,
  containerClassName,
  labelClassName,
  required = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  ...props
}, ref) => {
  const id = useId();
  const inputId = props.id || id;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  
  // Handle controlled/uncontrolled state
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  // Handle indeterminate state
  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = indeterminate;
    }, [indeterminate, ref]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked, event);
  }, [isControlled, onChange]);

  const sizeConfig = sizeClasses[size];
  const variantConfig = variantClasses[variant];
  const isDisabled = disabled || loading;

  const switchButton = (
    <button
      type="button"
      role="switch"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      aria-describedby={cn(
        helperText && helperTextId,
        error && errorId,
        ariaDescribedBy
      )}
      aria-required={required}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeConfig.container,
        sizeConfig.padding,
        checked ? variantConfig.checked : variantConfig.unchecked,
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'cursor-pointer',
        error && 'ring-2 ring-red-500',)
        className
      )}
      onClick={() => {
        if (!isDisabled) {
          const syntheticEvent = {
            target: { checked: !checked },
            currentTarget: { checked: !checked } as React.ChangeEvent<HTMLInputElement>;
          handleChange(syntheticEvent);
        }}
    >
      {/* Background icons or text */}
      {(showStateText || onIcon || offIcon) && (
        <span className="absolute inset-0 flex items-center justify-between px-1">
          {checked ? (
            <>
              {showStateText && !onIcon && (
                <span className={cn('text-white font-medium ml-1', sizeConfig.text)}>
                  {onText}
                </span>
              )}
              {onIcon && (
                <Icon name={onIcon} className={cn('text-white ml-1', sizeConfig.icon)} />
              )}
            </>
          ) : (
            <>
              <span />
              {showStateText && !offIcon && (
                <span className={cn('text-gray-500 font-medium mr-1', sizeConfig.text)}>
                  {offText}
                </span>
              )}
              {offIcon && (
                <Icon name={offIcon} className={cn('text-gray-500 mr-1', sizeConfig.icon)} />
              )}
            </>
          )}
        </span>
      )}

      {/* Switch thumb */}
      <motion.span
        className={cn(
          'pointer-events-none relative inline-block rounded-full bg-white shadow-lg ring-0 transition-transform',
          sizeConfig.thumb,
          indeterminate && 'bg-gray-400'
        )}
        animate={{
          x: checked ? sizeConfig.translate.replace('translate-x-', '') : '0'
        }}
        initial={false}
        transition={animated ? { type: 'spring', stiffness: 500, damping: 30 } : { duration: 0 }}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4'
            )} />
          </motion.div>
        )}

        {/* Indeterminate indicator */}
        {indeterminate && !loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'bg-white rounded-full',
              size === 'sm' && 'w-1 h-1',
              size === 'md' && 'w-1.5 h-1.5',
              size === 'lg' && 'w-2 h-2'
            )} />
          </span>
        )}
      </motion.span>

      {/* Hidden input for form compatibility */}
      <input
        ref={ref}
        type="checkbox"
        id={inputId}
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={isDisabled}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    </button>
  );

  const switchWithTooltip = tooltip ? (
    <Tooltip content={tooltip}>
      {switchButton}
    </Tooltip>
  ) : switchButton;

  if (!label && !helperText && !error) {
    return switchWithTooltip;
  }

  return (
    <div className={cn('flex items-start', containerClassName)}>
      {label && labelPosition === 'left' && (
        <label
          htmlFor={inputId}
          className={cn(
            'flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 cursor-pointer',
            isDisabled && 'opacity-50 cursor-not-allowed',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex flex-col items-start">
        {switchWithTooltip}

        {(helperText || error) && (
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                id={errorId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1 text-sm text-red-600 d
}}}
}
}
}
}
}
