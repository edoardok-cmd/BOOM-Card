import { ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'button';
  className?: string;
  labelClassName?: string;
  optionClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  showErrorIcon?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export interface RadioProps {
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  icon?: ReactNode;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'button';
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export interface RadioContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'button';
}

export interface RadioIndicatorProps {
  checked: boolean;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface RadioLabelProps {
  children: ReactNode;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  description?: string;
  icon?: ReactNode;
}

export interface RadioCardProps extends RadioProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  image?: string;
  imageAlt?: string;
  footer?: ReactNode;
  showCheckmark?: boolean;
}

export interface RadioButtonProps extends RadioProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'default' | 'card' | 'button';
export type RadioOrientation = 'horizontal' | 'vertical';

export interface RadioTheme {
  sizes: {
    [key in RadioSize]: {
      radio: string;
      label: string;
      description: string;
      gap: string;
    };
  };
  variants: {
    [key in RadioVariant]: {
      container: string;
      input: string;
      label: string;
      checked: string;
      unchecked: string;
      disabled: string;
      error: string;
      focus: string;
      hover: string;
    };
  };
  colors: {
    primary: string;
    error: string;
    disabled: string;
    border: string;
    background: string;
    text: string;
    description: string;
  };
}
