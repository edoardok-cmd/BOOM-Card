import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { z } from 'zod';

interface ValidationRule {
  field: string;
  rules: ValidationChain[];
}

interface ValidationSchema {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}

interface ValidatedRequest<TBody = any, TParams = any, TQuery = any> extends Request {
  validatedBody?: TBody;
  validatedParams?: TParams;
  validatedQuery?: TQuery;
}

type ValidationMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
const DEFAULT_ERROR_STATUS = 400;

const commonValidationMessages = {
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `${field} is invalid`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  email: 'Must be a valid email address',
  numeric: 'Must be a numeric value',
  alphanumeric: 'Must contain only letters and numbers',
  uuid: 'Must be a valid UUID',
  date: 'Must be a valid date',
  url: 'Must be a valid URL',
  phoneNumber: 'Must be a valid phone number',
  postalCode: 'Must be a valid postal code',
};

const sanitizationOptions = {
  trim: true,
  escape: true,
  normalizeEmail: true,
  toLowerCase: false,
};

// Main validation middleware factory
export const validate = (
  schema: ValidationSchema,
  options: ValidationOptions = {}
): RequestHandler => {
  const validationOptions: ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,
    ...options
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];

    // Validate each schema target
    for (const [target, targetSchema] of Object.entries(schema)) {
      if (!targetSchema) continue;

      const source = req[target as keyof ValidationSchema];
      if (!source) continue;

      try {
        const validated = await targetSchema.validate(source, validationOptions);
        // Replace original data with validated (stripped/transformed) data
        (req as any)[target] = validated;
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          errors.push(...error.inner.map(err => ({
            field: err.path || 'unknown',
            message: err.message,
            value: err.value,
            type: err.type || 'validation'
          })));
        }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Pre-built validation schemas
export const validationSchemas = {
  // User registration
  userRegistration: {
    body: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required(),
      firstName: Yup.string().required(),
      lastName: Yup.string().required(),
      phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/).optional()
    })
  },

  // User login
  userLogin: {
    body: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().required()
    })
  },

  // Card creation
  cardCreation: {
    body: Yup.object({
      cardNumber: Yup.string().matches(/^\d{16}$/).required(),
      expiryMonth: Yup.number().min(1).max(12).required(),
      expiryYear: Yup.number().min(new Date().getFullYear()).required(),
      cvv: Yup.string().matches(/^\d{3,4}$/).required(),
      cardholderName: Yup.string().required(),
      billingAddress: Yup.object({
        street: Yup.string().required(),
        city: Yup.string().required(),
        state: Yup.string().required(),
        zipCode: Yup.string().required(),
        country: Yup.string().required()
      })
    })
  },

  // Transaction
  transaction: {
    body: Yup.object({
      amount: Yup.number().positive().required(),
      currency: Yup.string().oneOf(['USD', 'EUR', 'GBP']).required(),
      cardId: Yup.string().uuid().required(),
      merchantId: Yup.string().uuid().required(),
      description: Yup.string().optional()
    })
  },

  // Pagination
  pagination: {
    query: Yup.object({
      page: Yup.number().min(1).default(1),
      limit: Yup.number().min(1).max(100).default(20),
      sortBy: Yup.string().optional(),
      sortOrder: Yup.string().oneOf(['asc', 'desc']).default('desc')
    })
  },

  // ID parameter
  idParam: {
    params: Yup.object({
      id: Yup.string().uuid().required()
    })
  },

  // Search
  search: {
    query: Yup.object({
      q: Yup.string().min(1).required(),
      type: Yup.string().oneOf(['user', 'card', 'transaction']).optional()
    })
  };

// Validation error handler middleware
export const handleValidationError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof Yup.ValidationError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.inner.map(err => ({
        field: err.path || 'unknown',
        message: err.message,
        value: err.value,
        type: err.type || 'validation'
      }))
    });
  } else {
    next(error);
  };

// Custom validation rules
export const customValidators = {
  // Validate card number using Luhn algorithm
  isValidCardNumber: (value: string): boolean => {
    if (!/^\d{16}$/.test(value)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Validate CVV
  isValidCVV: (value: string, cardType?: string): boolean => {
    if (cardType === 'AMEX') {
      return /^\d{4}$/.test(value);
    }
    return /^\d{3}$/.test(value);
  },

  // Validate expiry date
  isValidExpiryDate: (month: number, year: number): boolean => {
    const now = new Date();
    const expiry = new Date(year, month - 1);
    return expiry > now;
  };

// Add custom validation methods to Yup
Yup.addMethod(Yup.string, 'cardNumber', function() {
  return this.test('cardNumber', 'Invalid card number', function(value) {
    if (!value) return false;
    return customValidators.isValidCardNumber(value);
  });
});

Yup.addMethod(Yup.string, 'cvv', function(cardType?: string) {
  return this.test('cvv', 'Invalid CVV', function(value) {
    if (!value) return false;
    return customValidators.isValidCVV(value, cardType);
  });
});

// Sanitization middleware
export const sanitize = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query) {
      req.query = sanitizeObject(req.query as any);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  };
};

// Helper function to sanitize objects
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }

  return sanitized;
};

// Helper function to sanitize strings
const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
};

// Export validation middleware for specific routes
export const validationMiddleware = {
  userRegistration: validate(validationSchemas.userRegistration),
  userLogin: validate(validationSchemas.userLogin),
  cardCreation: validate(validationSchemas.cardCreation),
  transaction: validate(validationSchemas.transaction),
  pagination: validate(validationSchemas.pagination),
  idParam: validate(validationSchemas.idParam),
  search: validate(validationSchemas.search)
};

}
}
}
}
}
