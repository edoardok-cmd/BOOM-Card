import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const radioVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-full border border-gray-300 text-primary-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-600 data-[state=checked]:text-primary-600',
  {
    variants: {
      variant: {
        default: 'border-gray-300 text-primary-600',
        secondary: 'border-gray-300 text-secondary-600',
        success: 'border-gray-300 text-green-600',
        warning: 'border-gray-300 text-yellow-600',
        danger: 'border-gray-300 text-red-600',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const radioIndicatorVariants = cva(
  'absolute inset-0 flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-primary-600',
        secondary: 'text-secondary-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  indicatorClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      containerClassName,
      labelClassName,
      descriptionClassName,
      errorClassName,
      indicatorClassName,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className={cn('relative flex items-start', containerClassName)}>
        <div className="flex h-5 items-center">
          <div className="relative">
            <input
              type="radio"
              ref={ref}
              id={id}
              disabled={disabled}
              className={cn(
                radioVariants({ variant, size }),
                'absolute opacity-0',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${id}-error`
                  : description
                  ? `${id}-description`
                  : undefined
              }
              {...props}
            />
            <div
              className={cn(
                radioVariants({ variant, size }),
                'pointer-events-none relative',
                disabled && 'cursor-not-allowed opacity-50',
                className
              )}
              aria-hidden="true"
            >
              {props.checked && (
                <span
                  className={cn(
                    radioIndicatorVariants({ variant }),
                    indicatorClassName
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full bg-current',
                      size === 'sm' && 'h-1.5 w-1.5',
                      size === 'lg' && 'h-2.5 w-2.5'
                    )}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
        {(label || description || error) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'font-medium text-gray-900',
                  disabled && 'cursor-not-allowed opacity-50',
                  error && 'text-red-900',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${id}-description`}
                className={cn(
                  'text-gray-500',
                  disabled && 'opacity-50',
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
            {error && (
              <p
                id={`${id}-error`}
                className={cn('mt-1 text-red-600', errorClassName)}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// RadioGroup component for managing multiple radio options
export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      orientation = 'vertical',
      className,
      children,
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = React.useState(
      value || defaultValue || ''
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }, [value]);

    const handleChange = (newValue: string) => {
      if (!disabled) {
        setSelectedValue(newValue);
        onChange?.(newValue);
      };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-required={required}
        aria-disabled={disabled}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4',
          className
        )}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child as React.ReactElement<RadioProps>, {
              name,
              checked: selectedValue === child.props.value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e.target.value);
                child.props.onChange?.(e);
              },
              disabled: disabled || child.props.disabled,
              required: required && !selectedValue,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// Export variants for external use
export { radioVariants, radioIndicatorVariants };

}
}
