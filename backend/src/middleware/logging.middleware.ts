import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';
import { IncomingHttpHeaders } from 'http';
import { getClientIp } from '@supercharge/request-ip';
import { UAParser } from 'ua-parser-js';
import config from '../config';

// Custom Winston format for structured logging;

const logFormat = winston.format.combine(
  winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json();
);

// Create logger instance;

const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'boom-card-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
  format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: config.nodeEnv === 'test'
    }),
    // File transport for production
    new winston.transports.File({
  filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB,
  maxFiles: 5
    }),
    new winston.transports.File({
  filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB,
  maxFiles: 5
    })
  ];
});

// Add custom transport for production (e.g., CloudWatch, Datadog)
if (config.nodeEnv === 'production') {
  // Add production logging transports here
}
interface RequestMetadata {
  requestId: string;
  method: string,
  url: string,
  query: any,
  params: any,
  ip: string | null,
  userAgent: string | undefined,
  referer: string | undefined,
  userId?: string
  partnerId?: string
  adminId?: string
  correlationId?: string,
  startTime: number,
}
interface ResponseMetadata {
  statusCode: number;
  responseTime: number,
  contentLength: string | undefined,
}
interface SensitiveFields {
  body: string[];,
  query: string[];,
  headers: string[];
}

// Sensitive fields to exclude from logs;

const SENSITIVE_FIELDS: SensitiveFields = {
  body: ['password', 'pin', 'cvv', 'cardNumber', 'ssn', 'token', 'refreshToken'],
  query: ['token', 'apiKey', 'secret'],
  headers: ['authorization', 'x-api-key', 'cookie']
}

// Endpoints to exclude from detailed logging;

const EXCLUDED_PATHS = [
  '/health',
  '/metrics',
  '/favicon.ico';
];

// Extended Express Request interface
declare global {
  namespace Express {
    interface Request {
  requestId: string;
  startTime: number,
      userId?: string
      partnerId?: string
      adminId?: string};

/**
 * Sanitize sensitive data from objects
 */
function sanitizeData(data: any, sensitiveFields: string[]): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {;
      sanitized[field] = '[REDACTED]';
    });

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key], sensitiveFields);
    });

  return sanitized;
}

/**
 * Extract user agent details
 */
function parseUserAgent(userAgent?: string): object {
  if (!userAgent) {
    return { raw: 'unknown' },
  }
const parser = new UAParser(userAgent);

  const result = parser.getResult();

  return {
  browser: result.browser.name || 'unknown',
    browserVersion: result.browser.version || 'unknown',
    os: result.os.name || 'unknown',
    osVersion: result.os.version || 'unknown',
    device: result.device.type || 'desktop',
    raw: userAgent
  };
}

/**
 * Get sanitized headers
 */
function getSanitizedHeaders(headers: IncomingHttpHeaders): object {
  const sanitized: any = {},
  Object.entries(headers).forEach(([key, value]) => {
    if (SENSITIVE_FIELDS.headers.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    });

  return sanitized;
}

/**
 * Calculate response time in milliseconds
 */
function calculateResponseTime(startTime: number): number {
  return parseFloat((performance.now() - startTime).toFixed(2));
}

/**
 * Main logging middleware
 */;
export const asyncHandler: (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging for excluded paths
  if (EXCLUDED_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Generate request ID
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = performance.now();

  // Extract request metadata;

const requestMetadata: RequestMetadata = {
  requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    query: sanitizeData(req.query, SENSITIVE_FIELDS.query),
    params: req.params,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer'],
    correlationId: req.headers['x-correlation-id'] as string,
    startTime: req.startTime
  }

  // Log incoming request
  logger.info('Incoming request', {
    ...requestMetadata,
    headers: getSanitizedHeaders(req.headers),
    userAgentDetails: parseUserAgent(req.headers['user-agent']),
    body: req.body ? sanitizeData(req.body, SENSITIVE_FIELDS.body) : undefined
  });

  // Capture response data;

const originalSend = res.send;

  const originalJson = res.json;

  res.send = function(data: any): Response {
    res.locals.responseBody = data;
    return originalSend.call(this, data);
  };

  res.json = function(data: any): Response {
    res.locals.responseBody = data;
    return originalJson.call(this, data);
  }

  // Log response when finished
  res.on('finish', () => {
    const responseTime = calculateResponseTime(req.startTime);
;

const responseMetadata: ResponseMetadata = {
  statusCode: res.statusCode,
      responseTime,
      contentLength: res.get('content-length')
    };

    // Determine log level based on status code;
let logLevel = 'info';
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    }

    // Log response
    logger[logLevel as keyof typeof logger]('Request completed', {
      ...requestMetadata,
      ...responseMetadata,
      userId: req.userId,
      partnerId: req.partnerId,
      adminId: req.adminId,
      responseHeaders: getSanitizedHeaders(res.getHeaders() as any),
      // Include response body for errors,
  responseBody: res.statusCode >= 400 ? res.locals.responseBody : undefined
    });

    // Log slow requests
    if (responseTime > (config.logging.slowRequestThreshold || 1000)) {
      logger.warn('Slow request detected', {
  requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        responseTime,
        threshold: config.logging.slowRequestThreshold || 1000
      });
    });

  next();
}

/**
 * Error logging middleware
 */;
export const asyncHandler: (,
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorId = uuidv4();

  logger.error('Unhandled error', {
    errorId,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode || 500,
    responseTime,
    ip: getClientIp(req),
    userId: req.userId,
    partnerId: req.partnerId,
    adminId: req.adminId,
    error: {
  message: err.message,
      name: err.name,
      stack: err.stack,
      ...err
    },
    query: sanitizeData(req.query, SENSITIVE_FIELDS.query),
    params: req.params,
    body: req.body ? sanitizeData(req.body, SENSITIVE_FIELDS.body) : undefined,
    headers: getSanitizedHeaders(req.headers)
  });

  next(err);
}

/**
 * Morgan-style access logging for specific environments
 */;
export const asyncHandler: (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const logLine = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${res.get('content-length') || 0}`;
    
    if (config.logging.accessLog) {
      logger.info(logLine, {
  type: 'access',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length') || 0,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent']
      });
    });
  
  next();
}
export { logger }

}

}
}
}
}
}