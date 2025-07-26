// Validation utilities for forms and data

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Additional check for consecutive dots
  if (email.includes('..')) return false;
  return emailRegex.test(email);
};

// Phone validation (Bulgarian format)
export const isValidPhone = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Bulgarian phone patterns
  // Mobile: 087/088/089 + 7 digits or +359 87/88/89 + 7 digits
  // Landline: 02/032/etc + 6-7 digits or +359 2/32/etc + 6-7 digits
  const bgMobileRegex = /^(\+359|0)(87|88|89)\d{7}$/;
  const bgLandlineRegex = /^(\+359|0)(2|32|42|52|56|58|62|64|68|73|76|82|84|86|92|94|96)\d{6,7}$/;
  
  return bgMobileRegex.test(cleaned) || bgLandlineRegex.test(cleaned);
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const isValidName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, and common diacritics
  const nameRegex = /^[a-zA-ZА-Яа-я\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

// Bulgarian EGN (personal ID) validation
export const isValidEGN = (egn: string): boolean => {
  if (!/^\d{10}$/.test(egn)) return false;
  
  // Extract date components
  const year = parseInt(egn.substring(0, 2));
  const month = parseInt(egn.substring(2, 4));
  const day = parseInt(egn.substring(4, 6));
  
  // Determine century based on month
  let fullYear: number;
  let actualMonth: number;
  
  if (month >= 1 && month <= 12) {
    fullYear = 1900 + year;
    actualMonth = month;
  } else if (month >= 21 && month <= 32) {
    fullYear = 1800 + year;
    actualMonth = month - 20;
  } else if (month >= 41 && month <= 52) {
    fullYear = 2000 + year;
    actualMonth = month - 40;
  } else {
    return false;
  }
  
  // Validate date
  const date = new Date(fullYear, actualMonth - 1, day);
  if (date.getFullYear() !== fullYear || 
      date.getMonth() !== actualMonth - 1 || 
      date.getDate() !== day) {
    return false;
  }
  
  // Validate checksum
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(egn[i]) * weights[i];
  }
  
  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit === 10 ? 0 : checkDigit;
  
  return parseInt(egn[9]) === expectedCheckDigit;
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const isValidDate = (date: string, format: 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'): boolean => {
  let regex: RegExp;
  let day: number, month: number, year: number;
  
  if (format === 'DD/MM/YYYY') {
    regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(regex);
    if (!match) return false;
    day = parseInt(match[1]);
    month = parseInt(match[2]);
    year = parseInt(match[3]);
  } else {
    regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = date.match(regex);
    if (!match) return false;
    year = parseInt(match[1]);
    month = parseInt(match[2]);
    day = parseInt(match[3]);
  }
  
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getDate() === day;
};

// Form validation helper
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule | ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string[];
}

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: ValidationRules
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = data[field];
    const fieldErrors: string[] = [];
    
    fieldRules.forEach(rule => {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        fieldErrors.push(rule.message || `${field} is required`);
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(rule.message || `${field} must be at least ${rule.minLength} characters`);
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(rule.message || `${field} must be no more than ${rule.maxLength} characters`);
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || `${field} is invalid`);
      }
      
      if (value && rule.custom) {
        const result = rule.custom(value);
        if (typeof result === 'string') {
          fieldErrors.push(result);
        } else if (!result) {
          fieldErrors.push(rule.message || `${field} is invalid`);
        }
      }
    });
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = validatePassword(value);
      return result.isValid || result.errors.join('. ');
    }
  },
  
  phone: {
    required: true,
    custom: (value: string) => isValidPhone(value) || 'Please enter a valid phone number'
  },
  
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => isValidName(value) || 'Please enter a valid name'
  },
  
  egn: {
    required: true,
    custom: (value: string) => isValidEGN(value) || 'Please enter a valid EGN'
  },
  
  creditCard: {
    required: true,
    custom: (value: string) => isValidCreditCard(value) || 'Please enter a valid credit card number'
  },
  
  url: {
    required: true,
    custom: (value: string) => isValidURL(value) || 'Please enter a valid URL'
  }
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

export const sanitizeCreditCard = (cardNumber: string): string => {
  return cardNumber.replace(/[^\d]/g, '');
};

// Format helpers
export const formatPhone = (phone: string): string => {
  const cleaned = sanitizePhone(phone);
  
  if (cleaned.startsWith('+359')) {
    // +359 88 123 4567
    return cleaned.replace(/(\+359)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  } else if (cleaned.startsWith('0')) {
    // 0888 123 456
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return cleaned;
};

export const formatCreditCard = (cardNumber: string): string => {
  const cleaned = sanitizeCreditCard(cardNumber);
  // 1234 5678 9012 3456
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const formatEGN = (egn: string): string => {
  const cleaned = egn.replace(/[^\d]/g, '');
  // 123456 7890
  return cleaned.replace(/(\d{6})(\d{4})/, '$1 $2');
};