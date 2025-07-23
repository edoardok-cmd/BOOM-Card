import { ReactNode, FormEvent, ChangeEvent, FocusEvent } from 'react';
import { ValidationRule } from '../types/validation';

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface FormConfig<T = any> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
  preserveValues?: boolean;
  onSubmit: (values: T, helpers: FormHelpers<T>) => void | Promise<void>;
  onReset?: (values: T, helpers: FormHelpers<T>) => void;
  onValueChange?: (values: T) => void;
}

export interface FormHelpers<T = any> {
  setFieldValue: (field: keyof T | string, value: any) => void;
  setFieldError: (field: keyof T | string, error: string) => void;
  setFieldTouched: (field: keyof T | string, touched: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: (nextState?: Partial<FormState<T>>) => void;
  validateField: (field: keyof T | string) => Promise<string | undefined>;
  validateForm: () => Promise<Record<string, string>>;
}

export interface ValidationSchema<T = any> {
  [K in keyof T]?: ValidationRule | ValidationRule[];
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'file' | 'search';
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  helperText?: string;
  errorMessage?: string;
  value?: any;
  defaultValue?: any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'standard';
  icon?: ReactNode;
  endIcon?: ReactNode;
  maxLength?: number;
  minLength?: number;
  max?: number | string;
  min?: number | string;
  step?: number | string;
  pattern?: string;
  accept?: string;
  multiple?: boolean;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface SelectFieldProps extends Omit<FormFieldProps, 'type'> {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  onChange?: (value: any) => void;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
}

export interface CheckboxFieldProps extends Omit<FormFieldProps, 'type' | 'placeholder'> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface RadioFieldProps extends Omit<FormFieldProps, 'type' | 'placeholder'> {
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface TextareaFieldProps extends Omit<FormFieldProps, 'type'> {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  maxLength?: number;
  showCount?: boolean;
}

export interface FileFieldProps extends Omit<FormFieldProps, 'type' | 'value'> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  onDrop?: (files: File[]) => void;
  preview?: boolean;
  dragAndDrop?: boolean;
  uploadProgress?: number;
  uploadText?: string;
}

export interface DateFieldProps extends Omit<FormFieldProps, 'type'> {
  format?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  disabledDates?: (Date | string)[];
  locale?: string;
  showTime?: boolean;
  timeFormat?: '12' | '24';
}

export interface FormGroupProps {
  children: ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
}

export interface FormArrayFieldProps<T = any> {
  name: string;
  label?: string;
  description?: string;
  minItems?: number;
  maxItems?: number;
  defaultItem?: T;
  renderItem: (item: T, index: number, helpers: FormArrayHelpers<T>) => ReactNode;
  addButtonText?: string;
  removeButtonText?: string;
  emptyStateText?: string;
  className?: string;
}

export interface FormArrayHelpers<T = any> {
  add: (item?: T) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, item: T) => void;
  replace: (index: number, item: T) => void;
  push: (item: T) => void;
  pop: () => void;
  unshift: (item: T) => void;
  shift: () => void;
}

export interface FormProps<T = any> extends FormConfig<T> {
  children: ReactNode | ((props: FormRenderProps<T>) => ReactNode);
  className?: string;
  noValidate?: boolean;
  autoComplete?: 'on' | 'off';
  name?: string;
  id?: string;
  method?: 'get' | 'post';
  action?: string;
  encType?: string;
  target?: string;
  acceptCharset?: string;
  onSubmitCapture?: (e: FormEvent<HTMLFormElement>) => void;
}

export interface FormRenderProps<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  handleReset: (e?: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<any>) => void;
  handleBlur: (e: FocusEvent<any>) => void;
  getFieldProps: (name: string) => FieldInputProps;
  getFieldMeta: (name: string) => FieldMetaProps;
  getFieldHelpers: (name: string) => FieldHelperProps;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
}

export interface FieldInputProps {
  name: string;
  value: any;
  onChange: (e: ChangeEvent<any>) => void;
  onBlur: (e: FocusEvent<any>) => void;
}

export interface FieldMetaProps {
  value: any;
  error?: string;
  touched: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

export interface FieldHelperProps {
  setValue: (value: any) => void;
  setError: (error: string) => void;
  setTouched: (touched: boolean) => void;
}

export interface FormSubmitEvent<T = any> {
  values: T;
  formData: FormData;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface FormResetEvent<T = any> {
  values: T;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface FormFieldValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormValidationResult<T = any> {
  valid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export type FormFieldValue = string | number | boolean | Date | File | File[] | null | undefined;

export type FormValues = Record<string, FormFieldValue | FormFieldValue[] | FormValues>;

export interface FormLocalization {
  required: string;
  minLength: string;
  maxLength: string;
  min: string;
  max: string;
  pattern: string;
  email: string;
  url: string;
  number: string;
  integer: string;
  date: string;
  minDate: string;
  maxDate: string;
  fileSize: string;
  fileType: string;
  fileCount: string;
  custom: Record<string, string>;
}

export interface FormTheme {
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    text: string;
    textSecondary: string;
    border: string;
    background: string;
    backgroundHover: string;
    disabled: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface FormContextValue<T = any> extends FormState<T>, FormHelpers<T> {
  config: FormConfig<T>;
  getFieldProps: (name: string) => FieldInputProps;
  getFieldMeta: (name: string) => FieldMetaProps;
  getFieldHelpers: (name: string) => FieldHelperProps;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  handleReset: (e?: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<any>) => void;
  handleBlur: (e: FocusEvent<any>) => void;
  registerField: (name: string, validate?: ValidationRule | ValidationRule[]) => void;
  unregisterField: (name: string) => void;
}
