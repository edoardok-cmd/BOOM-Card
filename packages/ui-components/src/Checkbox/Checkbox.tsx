import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

const checkboxVariants = cva(
  'peer shrink-0 rounded border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        secondary: 'border-secondary bg-background data-[state=checked]:bg-secondary data-[state=checked]:border-secondary',
        destructive: 'border-destructive bg-background data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
      },
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const checkIconVariants = cva(
  'pointer-events-none text-current',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      indeterminate = false,
      checked,
      onChange,
      onCheckedChange,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState<boolean | 'indeterminate'>(
      indeterminate ? 'indeterminate' : checked || false
    );

    React.useEffect(() => {
      if (indeterminate) {
        setIsChecked('indeterminate');
      } else if (checked !== undefined) {
        setIsChecked(checked);
      }, [checked, indeterminate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      
      if (!indeterminate) {
        setIsChecked(newChecked);
      }

      // Call original onChange if provided
      if (onChange) {
        onChange(event);
      }

      // Call onCheckedChange if provided
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      };

    const checkboxId = id || `checkbox-${React.useId()}`;
    const dataState = isChecked === 'indeterminate' 
      ? 'indeterminate' 
      : isChecked 
      ? 'checked' 
      : 'unchecked';

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className={cn(
              checkboxVariants({ variant, size, className }),
              'appearance-none cursor-pointer',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            ref={ref}
            id={checkboxId}
            checked={isChecked === true}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            data-state={dataState}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
            }
            {...props}
          />
          <div
            className={cn(
              'absolute flex items-center justify-center',
              'pointer-events-none transition-opacity',
              isChecked === true || isChecked === 'indeterminate' ? 'opacity-100' : 'opacity-0'
            )}
          >
            {isChecked === 'indeterminate' ? (
              <div className={cn('bg-current', size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5')} />
            ) : (
              <Check className={checkIconVariants({ size })} strokeWidth={3} />
            )}
          </div>
        </div>
        
        {(label || description || error) && (
          <div className="flex flex-col space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  disabled && 'cursor-not-allowed opacity-70',
                  required && "after:content-['*'] after:ml-0.5 after:text-destructive"
                )}
              >
                {label}
              </label>
            )}
            
            {description && (
              <p
                id={`${checkboxId}-description`}
                className="text-sm text-muted-foreground"
              >
                {description}
              </p>
            )}
            
            {error && (
              <p
                id={`${checkboxId}-error`}
                className="text-sm text-destructive"
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

Checkbox.displayName = 'Checkbox';

}
}
