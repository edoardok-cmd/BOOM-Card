import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
      },
      inputSize: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
        false: '',
      },
    },
    defaultVariants: {
      required: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  showPasswordToggle?: boolean;
  formatValue?: (value: string) => string;
  validateOnBlur?: boolean;
  validator?: (value: string) => string | undefined;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      label,
      error,
      success,
      helperText,
      icon,
      iconPosition = 'left',
      clearable = false,
      onClear,
      containerClassName,
      labelClassName,
      wrapperClassName,
      showPasswordToggle = false,
      formatValue,
      validateOnBlur = false,
      validator,
      maxLength,
      showCharacterCount = false,
      disabled,
      required,
      value,
      onChange,
      onBlur,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    const [validationError, setValidationError] = useState<string | undefined>();
    const [isFocused, setIsFocused] = useState(false);

    // Generate unique ID if not provided
    const inputId = useMemo(() => id || `input-${Math.random().toString(36).substr(2, 9)}`, [id]);

    // Determine effective variant based on error/success state
    const effectiveVariant = useMemo(() => {
      if (error || validationError) return 'error';
      if (success) return 'success';
      return variant || 'default';
    }, [error, validationError, success, variant]);

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Apply formatting if provided
        if (formatValue) {
          newValue = formatValue(newValue);
        }

        // Enforce maxLength
        if (maxLength && newValue.length > maxLength) {
          newValue = newValue.slice(0, maxLength);
        }

        setInternalValue(newValue);

        // Clear validation error on change
        if (validationError) {
          setValidationError(undefined);
        }

        // Call original onChange
        if (onChange) {
          e.target.value = newValue;
          onChange(e);
        },
      [formatValue, maxLength, onChange, validationError]
    );

    // Handle blur validation
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        if (validateOnBlur && validator) {
          const errorMessage = validator(e.target.value);
          setValidationError(errorMessage);
        }

        if (onBlur) {
          onBlur(e);
        },
      [validateOnBlur, validator, onBlur]
    );

    // Handle clear button
    const handleClear = useCallback(() => {
      setInternalValue('');
      setValidationError(undefined);

      if (onClear) {
        onClear();
      }

      // Trigger onChange with empty value
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }, [onChange, onClear]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    // Handle focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    // Determine input type
    const inputType = useMemo(() => {
      if (type === 'password' && showPassword) {
        return 'text';
      }
      return type;
    }, [type, showPassword]);

    // Character count
    const characterCount = useMemo(() => {
      const currentValue = String(value ?? internalValue);
      return currentValue.length;
    }, [value, internalValue]);

    // Show clear button
    const showClearButton = useMemo(() => {
      return clearable && !disabled && (value || internalValue) && isFocused;
    }, [clearable, disabled, value, internalValue, isFocused]);

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ required }), labelClassName)}
          >
            {label}
          </label>
        )}

        <div className={cn('relative', wrapperClassName)}>
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              {
                'pl-10': icon && iconPosition === 'left',
                'pr-10': icon && iconPosition === 'right',
                'pr-20': showPasswordToggle && type === 'password',
                'pr-10': showClearButton && !showPasswordToggle,
                'pr-20': showClearButton && showPasswordToggle,
              },
              className
            )}
            disabled={disabled}
            required={required}
            value={value ?? internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={!!(error || validationError)}
            aria-describedby={
              error || validationError || helperText || success
                ? `${inputId}-description`
                : undefined
            }
            {...props}
          />

          {icon && iconPosition === 'right' && !showPasswordToggle && !showClearButton && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {(error || validationError || helperText || success || (showCharacterCount && maxLength)) && (
          <div id={`${inputId}-description`} className="space-y-1">
            {(error || validationError) && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{error || validationError}</span>
              </p>
            )}

            {success && !error && !validationError && (
              <p className="text-sm text-success">{success}</p>
            )}

            {helperText && !error && !validationError && !success && (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            )}

            {showCharacterCount && maxLength && (
              <p
                className={cn('text-xs text-muted-foreground text-right', {
                  'text-destructive': characterCount > maxLength,
                })}
              >
                {characterCount}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

}
}
}
