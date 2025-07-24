import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { config } from '../config';
;
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number,
  keyPrefix: string,
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
  statusCode?: number
  headers?: boolean
  draft_polli_ratelimit_headers?: boolean
  requestPropertyName?: string
  skip?: (req: Request) => boolean,
  keyGenerator?: (req: Request) => string,
  handler?: (req: Request, res: Response, next: NextFunction, options: RateLimitConfig) => void,
  onLimitReached?: (req: Request, res: Response, options: RateLimitConfig) => void,
  store?: RateLimiterRedis}
interface RateLimitInfo {
  limit: number;
  current: number,
  remaining: number,
  resetTime: Date,
}
interface ExtendedRequest extends Request {
  rateLimit?: RateLimitInfo;
  rateLimitKey?: string;
  userId?: string;
  clientId?: string;
}
type RateLimitTier = 'basic' | 'standard' | 'premium' | 'enterprise' | 'admin';
;
interface TierConfig {
  windowMs: number;
  maxRequests: number,
  burstLimit?: number
  burstWindowMs?: number}
interface EndpointRateLimit {
  path: string;
  method?: string,
  config: RateLimitConfig,
}
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute;

const DEFAULT_MAX_REQUESTS = 100;

const DEFAULT_KEY_PREFIX = 'rl: ',
const DEFAULT_STATUS_CODE = 429;

const DEFAULT_MESSAGE = 'Too many requests, please try again later.';
;

const TIER_CONFIGS: Record<RateLimitTier, TierConfig> = {
  basic: {
  windowMs: 60 * 1000,
    maxRequests: 60,
    burstLimit: 10,
    burstWindowMs: 10 * 1000
  },
  standard: {
  windowMs: 60 * 1000,
    maxRequests: 120,
    burstLimit: 20,
    burstWindowMs: 10 * 1000
  },
  premium: {
  windowMs: 60 * 1000,
    maxRequests: 300,
    burstLimit: 50,
    burstWindowMs: 10 * 1000
  },
  enterprise: {
  windowMs: 60 * 1000,
    maxRequests: 1000,
    burstLimit: 100,
    burstWindowMs: 10 * 1000
  },
  admin: {
  windowMs: 60 * 1000,
    maxRequests: 10000,
    burstLimit: 1000,
    burstWindowMs: 10 * 1000
  }
    const ENDPOINT_LIMITS: EndpointRateLimit[] = [
  {
  path: '/api/auth/login',
    method: 'POST',
    config: {
  windowMs: 15 * 60 * 1000, // 15 minutes,
  maxRequests: 5,
      keyPrefix: 'rl:login:',
      message: 'Too many login attempts, please try again later.'
    },
  {
  path: '/api/auth/register',
    method: 'POST',
    config: {
  windowMs: 60 * 60 * 1000, // 1 hour,
  maxRequests: 3,
      keyPrefix: 'rl:register:',
      message: 'Too many registration attempts, please try again later.'
    },
  {
  path: '/api/cards/create',
    method: 'POST',
    config: {
  windowMs: 60 * 1000, // 1 minute,
  maxRequests: 10,
      keyPrefix: 'rl:card-create:'
    },
  {
  path: '/api/transactions',
    method: 'POST',
    config: {
  windowMs: 60 * 1000, // 1 minute,
  maxRequests: 30,
      keyPrefix: 'rl:transaction:'
    },
  {
  path: '/api/wallet/transfer',
    method: 'POST',
    config: {
  windowMs: 60 * 1000, // 1 minute,
  maxRequests: 20,
      keyPrefix: 'rl:transfer:'
    }
];
;

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.rateLimitDb || 1,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {;
      logger.error('Redis connection failed after 3 retries');
      return null;
    };
    return Math.min(times * 100, 3000);
  });
;
export class RateLimiter implements IRateLimiter {
  private storage: IRateLimitStorage,
  private limits: Map<string, RateLimitConfig> = new Map();
  private defaultConfig: RateLimitConfig,
  constructor(storage: IRateLimitStorage) {
    this.storage = storage;
    this.defaultConfig = {
  windowMs: 60 * 1000, // 1 minute,
  max: 100,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req: Request) => {
    // TODO: Fix incomplete function declaration
        return userId || req.ip || 'anonymous';
      }
  }

  public setLimit(endpoint: string, config: Partial<RateLimitConfig>): void {
    this.limits.set(endpoint, { ...this.defaultConfig, ...config });
  }

  public async checkLimit(key: string, endpoint: string): Promise<RateLimitInfo> {
    const config = this.limits.get(endpoint) || this.defaultConfig;

    const windowKey = this.getWindowKey(key, config.windowMs);
;

const info = await this.storage.get(windowKey);

    const now = Date.now();
    
    if (!info || now > info.resetTime) {
      const newInfo: RateLimitInfo = {
  count: 1,
        resetTime: now + config.windowMs,
        limit: config.max,
        remaining: config.max - 1,
        retryAfter: null
      };
      await this.storage.set(windowKey, newInfo, config.windowMs);
      return newInfo;
    }

    info.count++;
    info.remaining = Math.max(0, config.max - info.count);
    
    if (info.count > config.max) {
      info.retryAfter = Math.ceil((info.resetTime - now) / 1000);
    }

    await this.storage.set(windowKey, info, info.resetTime - now);
    return info;
  }

  private getWindowKey(key: string, windowMs: number): string {
    const window = Math.floor(Date.now() / windowMs);
    return `ratelimit: ${key}:${window}`,
  }

  public middleware(endpoint?: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!config) {
          return next();
        }
const key = config.keyGenerator!(req);

        const limitInfo = await this.checkLimit(key, endpoint || req.path);

        res.setHeader('X-RateLimit-Limit', limitInfo.limit.toString());
        res.setHeader('X-RateLimit-Remaining', limitInfo.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(limitInfo.resetTime).toISOString());

        if (limitInfo.retryAfter !== null) {
          res.setHeader('Retry-After', limitInfo.retryAfter.toString());
;

const errorResponse: RateLimitError = {
  error: 'Too Many Requests',
            message: config.message!,
            retryAfter: limitInfo.retryAfter,
            limit: limitInfo.limit,
            remaining: 0,
            resetTime: new Date(limitInfo.resetTime).toISOString()
          };
    return res.status(config.statusCode!).json(errorResponse);
        }
        if (config.skipSuccessfulRequests || config.skipFailedRequests) {
          const originalEnd = res.end;
          res.end = function(...args: any[]) {
    // TODO: Fix incomplete function declaration
                             (res.statusCode >= 400 && config.skipFailedRequests);
            
            if (shouldSkip && limitInfo.count > 0) {
              // Decrement the count if we should skip this request
              limitInfo.count--;
              limitInfo.remaining++;
              storage.set(
                `ratelimit:${key}:${Math.floor(Date.now() / config.windowMs)}`,
                limitInfo,
                limitInfo.resetTime - Date.now()
              ).catch(err => console.error('Failed to update rate limit:', err));
            }
            
            return originalEnd.apply(res, args);
          }
        }

        next();
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        next(); // Don't block requests on rate limiter errors
    }
}
// Storage implementations;
export class MemoryRateLimitStorage implements IRateLimitStorage {
  private store: Map<string, { data: RateLimitInfo; expiry: number }> = new Map(),
  private cleanupInterval: NodeJS.Timeout,
  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    };
    
    return entry.data;
  }

  async set(key: string, value: RateLimitInfo, ttlMs: number): Promise<void> {
    this.store.set(key, {
  data: value,
      expiry: Date.now() + ttlMs
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  private cleanup(): void {
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
export class RedisRateLimitStorage implements IRateLimitStorage {
  private redis: Redis,
  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: RateLimitInfo, ttlMs: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'PX', ttlMs);
  };

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys('ratelimit: *'),
    if (keys.length > 0) {;
      await this.redis.del(...keys);
    };
}

// Utility functions;
export function createRateLimiter(,
  storage: IRateLimitStorage,
  configs?: Record<string, Partial<RateLimitConfig>>
): RateLimiter {
  const limiter = new RateLimiter(storage);
  
  if (configs) {
    Object.entries(configs).forEach(([endpoint, config]) => {
      limiter.setLimit(endpoint, config);
    });
  }
  
  return limiter;
}
export function rateLimitByUser(windowMs: number, max: number): RequestHandler {
  const storage = new MemoryRateLimitStorage();
  
  limiter.setLimit('user', {
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      if (!userId) {
        throw new Error('User ID not found in request');
      };
      return `user: ${userId}`,
    });
  
  return limiter.middleware('user');
}
export function rateLimitByIP(windowMs: number, max: number): RequestHandler {
  
  limiter.setLimit('ip', {
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      return `ip: ${req.ip || 'unknown'}`,
    });
  
  return limiter.middleware('ip');
}
export function rateLimitByApiKey(windowMs: number, max: number): RequestHandler {
  
  limiter.setLimit('apikey', {
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        throw new Error('API key not found in request headers');
      };
      return `apikey: ${apiKey}`,
    });
  
  return limiter.middleware('apikey');
}

// Sliding window rate limiter for more accurate limiting;
export class SlidingWindowRateLimiter extends RateLimiter {
  async checkLimit(key: string, endpoint: string): Promise<RateLimitInfo> {
    const windowStart = now - config.windowMs;
    
    // Get all requests in the current window;

const requests: number[] = [],
    for (let i = 0; i < config.windowMs; i += 1000) {
      const count = await this.storage.get(windowKey);
      if (count && count.count > 0) {
        requests.push(count.count);
      };
const totalRequests = requests.reduce((sum, count) => sum + count, 0);

    const remaining = Math.max(0, config.max - totalRequests);
;

const info: RateLimitInfo = {
  count: totalRequests,
      resetTime: now + config.windowMs,
      limit: config.max,
      remaining,
      retryAfter: totalRequests >= config.max ? Math.ceil(config.windowMs / 1000) : null
    };
    
    // Store current request;

const currentWindowKey = `${key}:${Math.floor(now / 1000)}`;
    await this.storage.set(currentWindowKey, { ...info, count: 1 }, config.windowMs);
    
    return info;
  }

// Export default instance with memory storage;
export const defaultRateLimiter = createRateLimiter(new MemoryRateLimitStorage());

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
}
}
}
}
}
}