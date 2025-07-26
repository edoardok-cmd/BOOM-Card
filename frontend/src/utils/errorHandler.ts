// Centralized error handling utilities

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

// Common error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
} as const;

// Error messages in multiple languages
const errorMessages: Record<string, Record<string, string>> = {
  [ErrorTypes.VALIDATION_ERROR]: {
    en: 'Please check your input and try again',
    bg: 'Моля, проверете въведените данни и опитайте отново',
  },
  [ErrorTypes.AUTHENTICATION_ERROR]: {
    en: 'Invalid email or password',
    bg: 'Невалиден имейл или парола',
  },
  [ErrorTypes.AUTHORIZATION_ERROR]: {
    en: 'You do not have permission to perform this action',
    bg: 'Нямате разрешение да извършите това действие',
  },
  [ErrorTypes.NOT_FOUND]: {
    en: 'The requested resource was not found',
    bg: 'Търсеният ресурс не беше намерен',
  },
  [ErrorTypes.NETWORK_ERROR]: {
    en: 'Network error. Please check your connection',
    bg: 'Мрежова грешка. Моля, проверете връзката си',
  },
  [ErrorTypes.SERVER_ERROR]: {
    en: 'Something went wrong. Please try again later',
    bg: 'Нещо се обърка. Моля, опитайте отново по-късно',
  },
  [ErrorTypes.RATE_LIMIT_ERROR]: {
    en: 'Too many requests. Please try again later',
    bg: 'Твърде много заявки. Моля, опитайте отново по-късно',
  },
  [ErrorTypes.PAYMENT_ERROR]: {
    en: 'Payment processing failed. Please try again',
    bg: 'Обработката на плащането е неуспешна. Моля, опитайте отново',
  },
};

// Get localized error message
export function getErrorMessage(
  errorType: string,
  language: 'en' | 'bg' = 'bg',
  customMessage?: string
): string {
  if (customMessage) return customMessage;
  return errorMessages[errorType]?.[language] || errorMessages[ErrorTypes.SERVER_ERROR][language];
}

// Parse API errors
export function parseApiError(error: any, language: 'en' | 'bg' = 'bg'): AppError {
  // Network errors
  if (!error.response) {
    return new AppError(
      getErrorMessage(ErrorTypes.NETWORK_ERROR, language),
      ErrorTypes.NETWORK_ERROR,
      0
    );
  }

  const { status, data } = error.response;

  // Common HTTP status codes
  switch (status) {
    case 400:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.VALIDATION_ERROR, language),
        ErrorTypes.VALIDATION_ERROR,
        400,
        true,
        data?.errors
      );
    case 401:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.AUTHENTICATION_ERROR, language),
        ErrorTypes.AUTHENTICATION_ERROR,
        401
      );
    case 403:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.AUTHORIZATION_ERROR, language),
        ErrorTypes.AUTHORIZATION_ERROR,
        403
      );
    case 404:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.NOT_FOUND, language),
        ErrorTypes.NOT_FOUND,
        404
      );
    case 429:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.RATE_LIMIT_ERROR, language),
        ErrorTypes.RATE_LIMIT_ERROR,
        429
      );
    case 500:
    default:
      return new AppError(
        data?.message || getErrorMessage(ErrorTypes.SERVER_ERROR, language),
        ErrorTypes.SERVER_ERROR,
        status || 500
      );
  }
}

// Toast notification helper
export function showErrorToast(error: AppError | Error | string): void {
  const message = typeof error === 'string' 
    ? error 
    : error instanceof AppError 
      ? error.message 
      : 'An unexpected error occurred';

  // This can be replaced with your preferred toast library
  console.error('[Error]:', message);
  
  // If using a toast library like react-toastify:
  // toast.error(message);
}

// Log error for monitoring
export function logError(error: Error | AppError, context?: any): void {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details,
    }),
  };

  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
    console.error('[Production Error]:', errorData);
  } else {
    console.error('[Development Error]:', errorData);
  }
}