// Central export for all utilities

// Error handling utilities
export {
  AppError,
  ErrorTypes,
  getErrorMessage,
  parseApiError,
  showErrorToast,
  logError
} from './errorHandler';

// Validation utilities
export {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidName,
  isValidEGN,
  isValidCreditCard,
  isValidURL,
  isValidDate,
  validateForm,
  commonValidationRules,
  sanitizeInput,
  sanitizePhone,
  sanitizeCreditCard,
  formatPhone,
  formatCreditCard,
  formatEGN
} from './validation';

// Formatting utilities
export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatName,
  formatInitials,
  formatAddress,
  truncateText,
  pluralize,
  formatDiscount,
  formatMembershipType,
  formatStatus,
  formatRating
} from './format';

// Re-export types used by utilities
export type {
  ValidationRule,
  ValidationRules,
  ValidationErrors
} from './validation';