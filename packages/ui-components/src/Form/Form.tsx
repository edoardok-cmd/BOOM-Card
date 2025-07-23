import React, { FormEvent, ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert } from '../Alert';
import { Button } from '../Button';
import styles from './Form.module.scss';

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
  id?: string;
  noValidate?: boolean;
  autoComplete?: 'on' | 'off';
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  method?: 'get' | 'post' | 'dialog';
  target?: '_self' | '_blank' | '_parent' | '_top';
  action?: string;
  showErrorSummary?: boolean;
  errorSummaryPosition?: 'top' | 'bottom';
  successMessage?: string;
  errorMessage?: string;
  submitButton?: {
    text?: string;
    loadingText?: string;
    successText?: string;
    errorText?: string;
    position?: 'left' | 'center' | 'right';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    hide?: boolean;
  };
  resetButton?: {
    text?: string;
    show?: boolean;
    variant?: 'outline' | 'ghost';
    onClick?: () => void;
  };
  onReset?: () => void;
  onError?: (errors: any) => void;
  onSuccess?: (data: TFieldValues) => void;
  preventDefaultSubmit?: boolean;
  scrollToError?: boolean;
  focusFirstError?: boolean;
  persistData?: boolean;
  persistKey?: string;
  clearOnSuccess?: boolean;
  validateOnMount?: boolean;
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  submitOnEnter?: boolean;
  customSubmitHandler?: (e: FormEvent<HTMLFormElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
  noValidate = true,
  autoComplete = 'on',
  encType,
  method = 'post',
  target,
  action,
  showErrorSummary = true,
  errorSummaryPosition = 'top',
  successMessage,
  errorMessage,
  submitButton = {},
  resetButton = {},
  onReset,
  onError,
  onSuccess,
  preventDefaultSubmit = false,
  scrollToError = true,
  focusFirstError = true,
  persistData = false,
  persistKey,
  clearOnSuccess = true,
  validateOnMount = false,
  reValidateMode = 'onChange',
  submitOnEnter = true,
  customSubmitHandler,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: FormProps<TFieldValues>) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    formState: { errors, isSubmitting, isValid, isDirty },
    handleSubmit,
    reset,
    getValues,
    setValue,
  } = form;

  // Persist form data to localStorage
  useEffect(() => {
    if (persistData && persistKey) {
      const savedData = localStorage.getItem(`form_${persistKey}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          Object.keys(parsed).forEach((key) => {
            setValue(key as any, parsed[key]);
          });
        } catch (error) {
          console.error('Failed to restore form data:', error);
        }
    }, [persistData, persistKey, setValue]);

  // Save form data on change
  useEffect(() => {
    if (persistData && persistKey && isDirty) {
      const values = getValues();
      localStorage.setItem(`form_${persistKey}`, JSON.stringify(values));
    }, [persistData, persistKey, isDirty, getValues]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      form.trigger();
    }, [validateOnMount, form]);

  // Handle form submission
  const handleFormSubmit = async (data: TFieldValues) => {
    setSubmitError(null);
    setIsSubmitSuccessful(false);

    try {
      await onSubmit(data);
      setIsSubmitSuccessful(true);
      
      if (onSuccess) {
        onSuccess(data);
      }

      if (clearOnSuccess) {
        reset();
        if (persistData && persistKey) {
          localStorage.removeItem(`form_${persistKey}`);
        }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('form.submitError');
      setSubmitError(errorMsg);
      
      if (onError) {
        onError(error);
      }
  };

  // Handle form errors
  const handleFormError = (errors: any) => {
    if (onError) {
      onError(errors);
    }

    // Scroll to first error
    if (scrollToError && formRef.current) {
      const firstError = formRef.current.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        if (focusFirstError && firstError instanceof HTMLElement) {
          setTimeout(() => firstError.focus(), 100);
        }
    };

  // Handle form reset
  const handleFormReset = () => {
    reset();
    setIsSubmitSuccessful(false);
    setSubmitError(null);
    
    if (persistData && persistKey) {
      localStorage.removeItem(`form_${persistKey}`);
    }
    
    if (onReset) {
      onReset();
    };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleSubmit(handleFormSubmit, handleFormError)();
      }
  };

  // Custom submit handler
  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (preventDefaultSubmit) {
      e.preventDefault();
    }

    if (customSubmitHandler) {
      customSubmitHandler(e);
    } else {
      e.preventDefault();
      handleSubmit(handleFormSubmit, handleFormError)();
    };

  // Error summary
  const errorSummary = showErrorSummary && Object.keys(errors).length > 0 && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Alert
          type="error"
          title={t('form.errorSummaryTitle')}
          className={styles.errorSummary}
        >
          <ul className={styles.errorList}>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error?.message || t('form.fieldError')}
              </li>
            ))}
          </ul>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );

  // Submit button configuration
  const submitButtonConfig = {
    text: submitButton.text || t('form.submit'),
    loadingText: submitButton.loadingText || t('form.submitting'),
    successText: submitButton.successText || t('form.submitted'),
    errorText: submitButton.errorText || t('form.submitFailed'),
    position: submitButton.position || 'right',
    variant: submitButton.variant || 'primary',
    size: submitButton.size || 'md',
    fullWidth: submitButton.fullWidth || false,
    disabled: submitButton.disabled || (!isValid && validateOnMount),
    hide: submitButton.hide || false,
  };

  // Form controls
  const formControls = !submitButtonConfig.hide && (
    <div
      className={classNames(styles.formControls, {
        [styles.controlsLeft]: submitButtonConfig.position === 'left',
        [styles.controlsCenter]: submitButtonConfig.position === 'center',
        [styles.controlsRight]: submitButtonConfig.position === 'right',
      })}
    >
      {resetButton.show && (
        <Button
          type="button"
          variant={resetButton.variant || 'outline'}
          size={submitButtonConfig.size}
          onClick={resetButton.onClick || handleFormReset}
          disabled={!isDirty || isSubmitting}
        >
          {resetButton.text || t('form.reset')}
        </Button>
      )}
      
      <Button
        type="submit"
        variant={submitButtonConfig.variant}
        size={submitButtonConfig.size}
        fullWidth={submitButtonConfig.fullWidth}
        disabled={submitButtonConfig.disabled || isSubmitting}
        loading={isSubmitting}
        icon={
          isSubmitting ? (
            <Loader2 className={styles.spinIcon} />
          ) : isSubmitSuccessful ? (
            <CheckCircle />
          ) : submitError ? (
            <AlertCircle />
          ) : undefined
        }
      >
        {isSubmitting
          ? submitButtonConfig.loadingText
          : isSubmitSuccessful
          ? submitButtonConfig.successText
          : submitError
          ? submitButtonConfig.errorText
          : submitButtonConfig.text}
      </Button>
    </div>
  );

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        id={id}
        className={classNames(styles.form, className)}
        onSubmit={onFormSubmit}
        onKeyDown={handleKeyDown}
        noValidate={noValidate}
        autoComplete={autoComplete}
        encType={encType}
        method={method}
        target={target}
        action={action}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {errorSummaryPosition === 'top' && errorSummary}
        
        {submitError && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert type="error" className={styles.submitError}>
                {errorMessage || submitErr
}}}
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
}
