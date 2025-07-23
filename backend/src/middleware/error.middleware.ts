import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import winston from 'winston';
import { AppError } from '../utils/errors';
import { ErrorCode, ErrorSeverity } from '../constants/errors';
import { config } from '../config';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
    timestamp: string;
    requestId?: string;
  };
}

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
  severity?: ErrorSeverity;
}

type ErrorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const isDevelopment = config.NODE_ENV === 'development';
const isProduction = config.NODE_ENV === 'production';

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Authentication failed',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',
  REDIS_ERROR: 'Cache operation failed',
  EXTERNAL_SERVICE_ERROR: 'External service error',
} as const;

const HTTP_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

/**
 * Global error handler middleware
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    user: (req as any).user?.id
  });

  // Handle known error types
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    return;
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.details) {
    const errors = err.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        errors
      });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`
      });
    return;
  }

  // Handle MongoDB cast errors
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid ${err.path}: ${err.value}`
      });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token'
      });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Token expired'
      });
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field';
    }

    res.status(400).json({
      success: false,
      error: { message });
    return;
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Something went wrong' 
        : message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        error: err 
      })
    });
};

/**
 * Not found handler middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter for express-validator
 */
export const validationErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        errors: formattedErrors
      });
    return;
  }
  
  next();
};

/**
 * Rate limit error handler
 */
export const rateLimitHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  options: any
): void => {
  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      retryAfter: options.windowMs
    });
};

/**
 * MongoDB connection error handler
 */
export const dbErrorHandler = (error: Error): void => {
  logger.error('Database connection error:', error);
  process.exit(1);
};

/**
 * Unhandled rejection handler
 */
export const unhandledRejectionHandler = (
  reason: any,
  promise: Promise<any>
): void => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
};

/**
 * Uncaught exception handler
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  logger.error('Uncaught Exception:', error);
  // Close server & exit process
  process.exit(1);
};

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
