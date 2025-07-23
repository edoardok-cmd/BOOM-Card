import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  INTERNAL = 'INTERNAL',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  PAYMENT = 'PAYMENT',
  NETWORK = 'NETWORK'
}

// HTTP status codes mapping
export const ERROR_STATUS_CODES: Record<ErrorCategory, number> = {
  [ErrorCategory.VALIDATION]: 400,
  [ErrorCategory.AUTHENTICATION]: 401,
  [ErrorCategory.AUTHORIZATION]: 403,
  [ErrorCategory.NOT_FOUND]: 404,
  [ErrorCategory.CONFLICT]: 409,
  [ErrorCategory.RATE_LIMIT]: 429,
  [ErrorCategory.EXTERNAL_SERVICE]: 502,
  [ErrorCategory.DATABASE]: 500,
  [ErrorCategory.INTERNAL]: 500,
  [ErrorCategory.BUSINESS_LOGIC]: 422,
  [ErrorCategory.PAYMENT]: 402,
  [ErrorCategory.NETWORK]: 503
};

// Error metadata interface
export interface ErrorMetadata {
  timestamp: Date;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  stack?: string;
  context?: Record<string, any>;
}

// Error details interface
export interface ErrorDetails {
  field?: string;
  value?: any;
  constraint?: string;
  message: string;
}

// Custom error options
export interface CustomErrorOptions {
  statusCode?: number;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  details?: ErrorDetails[];
  metadata?: Partial<ErrorMetadata>;
  isOperational?: boolean;
  shouldLog?: boolean;
  originalError?: Error;
}

// Error response interface
export interface ErrorResponse {
  error: {
    id: string;
    code: string;
    message: string;
    category: ErrorCategory;
    timestamp: Date;
    details?: ErrorDetails[];
    path?: string;
    requestId?: string;
  };
}

// Validation error options
export interface ValidationErrorOptions {
  field: string;
  value?: any;
  constraint?: string;
  message?: string;
}

// Database error options
export interface DatabaseErrorOptions {
  operation?: string;
  table?: string;
  constraint?: string;
  originalError?: Error;
}

// External service error options
export interface ExternalServiceErrorOptions {
  service: string;
  endpoint?: string;
  statusCode?: number;
  responseTime?: number;
  originalError?: Error;
}

// Rate limit error options
export interface RateLimitErrorOptions {
  limit: number;
  windowMs: number;
  retryAfter?: number;
  identifier?: string;
}

// Error handler middleware type
export type ErrorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Error logger interface
export interface ErrorLogger {
  log(error: Error, metadata?: ErrorMetadata): void;
}

// Constants
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';
export const DEFAULT_VALIDATION_MESSAGE = 'Validation failed';
export const DEFAULT_AUTH_MESSAGE = 'Authentication required';
export const DEFAULT_FORBIDDEN_MESSAGE = 'Access denied';
export const DEFAULT_NOT_FOUND_MESSAGE = 'Resource not found';
export const DEFAULT_CONFLICT_MESSAGE = 'Resource conflict';
export const DEFAULT_RATE_LIMIT_MESSAGE = 'Too many requests';

// Error code prefixes
export const ERROR_CODE_PREFIXES: Record<ErrorCategory, string> = {
  [ErrorCategory.VALIDATION]: 'VAL',
  [ErrorCategory.AUTHENTICATION]: 'AUTH',
  [ErrorCategory.AUTHORIZATION]: 'AUTHZ',
  [ErrorCategory.NOT_FOUND]: 'NOTFOUND',
  [ErrorCategory.CONFLICT]: 'CONFLICT',
  [ErrorCategory.RATE_LIMIT]: 'RATELIMIT',
  [ErrorCategory.EXTERNAL_SERVICE]: 'EXTERNAL',
  [ErrorCategory.DATABASE]: 'DB',
  [ErrorCategory.INTERNAL]: 'INTERNAL',
  [ErrorCategory.BUSINESS_LOGIC]: 'BUSINESS',
  [ErrorCategory.PAYMENT]: 'PAYMENT',
  [ErrorCategory.NETWORK]: 'NETWORK'
};

Execution error