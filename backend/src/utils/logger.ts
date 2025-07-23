import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';

// Types and Interfaces
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  correlationId?: string;
  service?: string;
  environment?: string;
  [key: string]: any;
}

export interface ErrorLogContext extends LogContext {
  error: Error | any;
  stack?: string;
  code?: string;
  statusCode?: number;
}

export interface PerformanceLogContext extends LogContext {
  operation: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  metadata?: Record<string, any>;
}

export interface AuditLogContext extends LogContext {
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  actor?: string;
  timestamp: Date;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerConfig {
  level: LogLevel;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
  exitOnError?: boolean;
  silent?: boolean;
}

export interface LogMetadata {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  [key: string]: any;
}

// Constants
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
} as const;

const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray'
} as const;

const DEFAULT_LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const DEFAULT_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVICE_NAME = process.env.SERVICE_NAME || 'boom-card-api';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'cvv',
  'ssn',
  'pin',
  'authorization'
];

const LOG_ROTATION_CONFIG = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
};

// Ensure log directory exists
if (!fs.existsSync(DEFAULT_LOG_DIR)) {
  fs.mkdirSync(DEFAULT_LOG_DIR, { recursive: true });
}

export class Logger {
  private static instance: Logger;
  private winston: winston.Logger;
  private requestId?: string;

  private constructor() {
    this.winston = winston.createLogger({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const reqId = this.requestId || meta.requestId || 'system';
          return JSON.stringify({
            timestamp,
            level,
            requestId: reqId,
            message,
            ...meta
          });
        })
      ),
      defaultMeta: { service: 'boom-card-api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Add file transport in production
    if (config.nodeEnv === 'production') {
      this.winston.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }));
      this.winston.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }));
    }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  clearRequestId(): void {
    this.requestId = undefined;
  }

  // Core logging methods
  info(message: string, meta?: LogMeta): void {
    this.winston.info(message, this.prepareMeta(meta));
  }

  warn(message: string, meta?: LogMeta): void {
    this.winston.warn(message, this.prepareMeta(meta));
  }

  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorMeta = this.prepareErrorMeta(error, meta);
    this.winston.error(message, errorMeta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.winston.debug(message, this.prepareMeta(meta));
  }

  // Specialized logging methods
  http(req: Request, res: Response, responseTime: number): void {
    const meta: HttpLogMeta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id
    };
    this.info(`HTTP ${req.method} ${req.originalUrl}`, meta);
  }

  audit(action: string, userId: string, details?: any): void {
    const meta: AuditLogMeta = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      details
    };
    this.info(`AUDIT: ${action}`, meta);
  }

  performance(operation: string, duration: number, meta?: LogMeta): void {
    const perfMeta: PerformanceLogMeta = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...meta
    };
    this.info(`PERFORMANCE: ${operation} took ${duration}ms`, perfMeta);
  }

  // Helper methods
  private prepareMeta(meta?: LogMeta): any {
    return {
      ...meta,
      requestId: this.requestId || meta?.requestId
    };
  }

  private prepareErrorMeta(error?: Error | unknown, meta?: LogMeta): any {
    const errorDetails: ErrorLogMeta = {
      ...this.prepareMeta(meta)
    };

    if (error instanceof Error) {
      errorDetails.errorName = error.name;
      errorDetails.errorMessage = error.message;
      errorDetails.errorStack = error.stack;
    } else if (error) {
      errorDetails.errorMessage = String(error);
    }

    return errorDetails;
  }

  // Create child logger with context
  child(context: LogContext): LoggerInterface {
    const childWinston = this.winston.child(context);
    return {
      info: (message: string, meta?: LogMeta) => 
        childWinston.info(message, this.prepareMeta(meta)),
      warn: (message: string, meta?: LogMeta) => 
        childWinston.warn(message, this.prepareMeta(meta)),
      error: (message: string, error?: Error | unknown, meta?: LogMeta) => 
        childWinston.error(message, this.prepareErrorMeta(error, meta)),
      debug: (message: string, meta?: LogMeta) => 
        childWinston.debug(message, this.prepareMeta(meta)),
      http: this.http.bind(this),
      audit: this.audit.bind(this),
      performance: this.performance.bind(this)
    };
  }

// Export singleton instance
export const logger = Logger.getInstance();

// Express middleware for request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  // Attach request ID to request object
  (req as any).requestId = requestId;
  
  // Set request ID in logger
  logger.setRequestId(requestId);
  
  // Log request
  logger.info(`Incoming ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    logger.http(req, res, responseTime);
    logger.clearRequestId();
    return originalSend.call(this, data);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logger.error(`Error handling ${req.method} ${req.originalUrl}`, err, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode
  });
  next(err);
};

// Performance tracking decorator
export function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const className = target.constructor.name;
    const methodName = propertyKey;
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.performance(`${className}.${methodName}`, duration);
      return result;
    } catch (error) {
      logger.performance(`${className}.${methodName} (failed)`, duration);
      throw error;
    };
  
  return descriptor;
}

// Audit logging decorator
export function auditLog(action: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    
    descriptor.value = async function(...args: any[]) {
      const req = args.find(arg => arg && arg.user);
      const userId = req?.user?.id || 'unknown';
      
      try {
        logger.audit(action, userId, { method: propertyKey, success: true });
        return result;
      } catch (error) {
        logger.audit(action, userId, { method: propertyKey, success: false, error: String(error) });
        throw error;
      };
    
    return descriptor;
  };
}

}
}
}
}
