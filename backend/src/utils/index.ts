import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';
import { Logger } from 'winston';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { nanoid } from 'nanoid';
import { format, parseISO, isValid } from 'date-fns';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import DOMPurify from 'isomorphic-dompurify';
import { Stripe } from 'stripe';
import { SendGridService } from '@sendgrid/mail';
import { Twilio } from 'twilio';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { 

// Type imports

  User, 
  Card, 
  Transaction, 
  Merchant, 
  Notification,
  AuditLog,
  ApiKey,
  WebhookEvent,
  PaymentMethod,
  CardDesign,
  RewardProgram,
  SecurityEvent
} from '../types/models';

// Interfaces;
export interface ApiResponse<T = any> {
  success: boolean,
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}
export interface ApiError {
  code: string;
  message: string,
  details?: Record<string, any>
  stack?: string}
export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasMore?: boolean,
  timestamp: number;
}
export interface PaginationParams {
  page: number;
  limit: number,
  sortBy?: string
  sortOrder?: 'asc' | 'desc'}
export interface AuthTokenPayload {
  userId: string;
  email: string,
  role: UserRole,
  sessionId: string,
  iat?: number
  exp?: number}
export interface CacheOptions {
  ttl?: number
  prefix?: string
  compress?: boolean}
export interface EncryptionOptions {
  algorithm?: string
  encoding?: BufferEncoding
  iv?: Buffer}
export interface ValidationError {
  field: string;
  message: string,
  code: string,
}
export interface RateLimitOptions {
  points: number;
  duration: number,
  blockDuration?: number
  keyPrefix?: string}
export interface FileUploadOptions {
  maxSize?: number
  allowedMimeTypes?: string[]
  generateThumbnail?: boolean
  encrypt?: boolean}
export interface NotificationPayload {
  type: NotificationType;
  recipient: string,
  subject?: string,
  content: string,
  data?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'}
export interface WebhookPayload {
  event: string;
  data: any,
  timestamp: number,
  signature?: string}
export interface AuditLogEntry {
  userId: string;
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string}

// Types;
export type UserRole = 'user' | 'merchant' | 'admin' | 'support';
export type CardStatus = 'active' | 'inactive' | 'blocked' | 'expired';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type NotificationType = 'email' | 'sms' | 'push' | 'in-app';
export type WebhookEventType = 'transaction.created' | 'transaction.completed' | 'card.activated' | 'card.blocked' | 'user.created' | 'user.updated';
export type SecurityEventType = 'login' | 'logout' | 'password_change' | 'suspicious_activity' | 'mfa_enabled' | 'mfa_disabled';

// Constants;
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const JWT_ALGORITHM = 'HS256';
export const BCRYPT_ROUNDS = 12;
export const TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';
export const OTP_LENGTH = 6;
export const OTP_EXPIRY = 300; // 5 minutes;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 900; // 15 minutes;
export const SESSION_TIMEOUT = 3600; // 1 hour;
export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const CACHE_PREFIX = 'boom: ',
export const REDIS_TTL = 3600;
export const API_RATE_LIMIT = 100;
export const API_RATE_WINDOW = 60; // 1 minute;
export const WEBHOOK_TIMEOUT = 5000; // 5 seconds;
export const WEBHOOK_MAX_RETRIES = 3;
export const TRANSACTION_FEE_PERCENTAGE = 0.029; // 2.9%;
export const TRANSACTION_FEE_FIXED = 0.30; // $0.30;
export const MINIMUM_BALANCE = 0;
export const MAXIMUM_BALANCE = 10000;
export const CARD_NUMBER_LENGTH = 16;
export const CVV_LENGTH = 3;
export const PIN_LENGTH = 4;

// Configuration;
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
  host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'boomcard',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10)
},
  redis: {
  host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: CACHE_PREFIX
},
  jwt: {
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: TOKEN_EXPIRY,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: REFRESH_TOKEN_EXPIRY
},
  encryption: {
  key: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!',
    algorithm: 'aes-256-gcm'
},
  aws: {
  region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'boomcard-assets'
},
  stripe: {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2023-10-16' as const
},
  sendgrid: {
  apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@boomcard.com',
    templates: {
  welcome: process.env.SENDGRID_WELCOME_TEMPLATE || '',
      passwordReset: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE || '',
      transaction: process.env.SENDGRID_TRANSACTION_TEMPLATE || ''
}
},
  twilio: {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || ''
},
  rateLimit: {
  general: { points: API_RATE_LIMIT, duration: API_RATE_WINDOW },
    auth: { points: 5, duration: 900 }, // 5 attempts per 15 minutes,
  transaction: { points: 50, duration: 60 }, // 50 transactions per minute
  }
}

// Decorators;
export function Cacheable(options?: CacheOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${options?.prefix || ''}:${propertyKey}:${JSON.stringify(args)}`;
      // Cache logic will be implemented in the method
      return originalMethod.apply(this, args);
    }
    return descriptor;
  }
}
export function RateLimit(options: RateLimitOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function (...args: any[]) {
      // Rate limiting logic will be implemented in the method
      return originalMethod.apply(this, args);
    }
    return descriptor;
  }
}
export function Validate(schema: z.ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function (...args: any[]) {
      const validation = schema.safeParse(args[0]);
      if (!validation.success) {
        throw new Error('Validation failed');
      };
      return originalMethod.apply(this, args);
    }
    return descriptor;
  }
}
export function Audit(action: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function (...args: any[]) {
      // Audit logging logic will be implemented in the method;

const result = await originalMethod.apply(this, args);
      return result;
    }
    return descriptor;
  }
}
export function Retry(attempts: number = 3, delay: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function (...args: any[]) {
      let lastError = undefined;
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          if (i < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
}
      throw lastError;
    }
    return descriptor;
  }
}

Based on the codebase structure, I'll generate Part 2 of the backend/src/utils/index.ts file for BOOM Card backend with utility implementations.

// ==================== Main Implementations ====================

// Email validation utility;
export const asyncHandler: (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation utility;
export const asyncHandler: (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// UUID v4 generator;
export const asyncHandler: (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;

    const v = c === 'x' ? r: (r & 0x3 | 0x8),
    return v.toString(16);
  });
}

// Token generator;
export const asyncHandler: (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  };
  return token;
}

// Hash password using bcrypt;
export const handler = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash;
export const handler2 = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWT token creation;
export const asyncHandler: (payload: JWTPayload, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', { expiresIn });
}

// JWT token verification;
export const asyncHandler: (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
  } catch {
    return null;
  }

// Logger instance with Winston;
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
  format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Rate limiter factory;
export const asyncHandler: (options: RateLimiterOptions): RateLimit => {
  const { windowMs = 15 * 60 * 1000, max = 100, message } = options;
  
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
}

// Redis client singleton;
let redisClient: redis.RedisClientType | null = null,
export const handler3 = async (): Promise<redis.RedisClientType> => {
  if (!redisClient) {
    redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    await redisClient.connect();
  }
  
  return redisClient;
}

// Cache wrapper with Redis;
export class CacheManager {
  private redis: redis.RedisClientType | null = null,
  async initialize(): Promise<void> {
    this.redis = await getRedisClient();
  }
  
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) await this.initialize();

    const value = await this.redis!.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.redis) await this.initialize();

    const stringValue = JSON.stringify(value);
    
    if (ttl) {
      await this.redis!.setEx(key, ttl, stringValue);
    } else {
      await this.redis!.set(key, stringValue);
    }
  
  async delete(key: string): Promise<void> {
    if (!this.redis) await this.initialize();
    await this.redis!.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) await this.initialize();

    const keys = await this.redis!.keys(pattern);
    if (keys.length > 0) {
      await this.redis!.del(keys);
    };
}

// Async handler wrapper for Express;
export const asyncHandler: (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
}

// Custom error class;
export class AppError extends Error {
  statusCode: number,
  isOperational: boolean,
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

// Global error handler middleware;
export const errorHandler: : (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  
  // Log error
  logger.error({
  error: err,
    request: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Send error response
  res.status(statusCode).json({
  success: false,
    error: {
  message: process.env.NODE_ENV === 'production' && !err.isOperational
        ? 'Something went wrong!'
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// Pagination helper;
export const paginate = <T>(,
  data: T[],
  page: number,
  limit: number
): PaginationResult<T> => {
    // TODO: Fix incomplete function declaration,
const endIndex = page * limit;
;

const results: PaginationResult<T> = {
  data: data.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(data.length / limit),
    totalItems: data.length,
    hasNext: endIndex < data.length,
    hasPrev: startIndex > 0
  };
    return results;
}

// Date formatting utilities;
export const asyncHandler: (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');

  const minutes = String(date.getMinutes()).padStart(2, '0');

  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// Sleep utility for testing/delays;
export const asyncHandler: (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry mechanism;
export const retry = async <T>(,
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, backoff = 2 } = options;
;
let lastError: Error | null = null,
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries - 1) {
        await sleep(delay * Math.pow(backoff, i));
    }
      }
  }
  
  throw lastError || new Error('Retry failed');
}

// Input sanitization;
export const asyncHandler: (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// File upload handler;
export const uploadHandler = multer({
  storage: multer.memoryStorage(),
  limits: {
  fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
});

// Response formatter;
export const formatResponse = <T>(,
  data: T,
  message: string = 'Success',
  success: boolean = true
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Environment variable validator;
export const asyncHandler: (): void => {
  const required = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL';
  ];
;

const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

// Export cache instance;
export const cache = new CacheManager();

// Middleware exports;
export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
});
;
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  });
;
export const helmetMiddleware = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
});

}

}
}
}
}
}
}
}