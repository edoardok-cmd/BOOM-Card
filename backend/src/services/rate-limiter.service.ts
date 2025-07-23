import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Redis from 'ioredis';
import { createHash } from 'crypto';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

interface RateLimitOptions {
  key?: string;
  cost?: number;
  skipIf?: (req: Request) => boolean;
}

type RateLimitKeyGenerator = (req: Request) => string;

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_KEY_PREFIX = 'rate_limit:';
const SCRIPT_SHA_KEY = 'rate_limit:script:sha';

const LUA_SCRIPT = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local max_requests = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local cost = tonumber(ARGV[4] or 1)
  
  local current = redis.call('GET', key)
  if current == false then
    redis.call('SET', key, cost, 'PX', window)
    return {1, max_requests, max_requests - cost, now + window}
  else
    local count = tonumber(current)
    if count + cost > max_requests then
      local ttl = redis.call('PTTL', key)
      return {0, max_requests, 0, now + ttl}
    else
      redis.call('INCRBY', key, cost)
      local ttl = redis.call('PTTL', key)
      return {1, max_requests, max_requests - (count + cost), now + ttl}
    end
  end
`;

@Injectable()
export class RateLimiterService {
  private redis: Redis;
  private scriptSha: string | null = null;
  private readonly configs: Map<string, RateLimitConfig> = new Map();

export class RateLimiterService {
  private limiter: RateLimiter;
  private storage: RateLimiterStorage;
  private redis?: Redis;

  constructor(config: RateLimiterConfig) {
    this.storage = this.initializeStorage(config);
    this.limiter = this.initializeLimiter(config);
    this.redis = config.storage === 'redis' ? config.redis : undefined;
  }

  private initializeStorage(config: RateLimiterConfig): RateLimiterStorage {
    if (config.storage === 'redis' && config.redis) {
      return new RateLimiterRedis({
        storeClient: config.redis,
        keyPrefix: config.keyPrefix || 'rl:',
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration || 0,
      });
    }

    return new RateLimiterMemory({
      keyPrefix: config.keyPrefix || 'rl:',
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration || 0,
    });
  }

  private initializeLimiter(config: RateLimiterConfig): RateLimiter {
    const limiterConfig: RateLimiterAbstract = this.storage as any;
    
    if (config.skipSuccessfulRequests || config.skipFailedRequests) {
      return new RateLimiterFlexible(limiterConfig, {
        skipSuccessfulRequests: config.skipSuccessfulRequests,
        skipFailedRequests: config.skipFailedRequests,
      });
    }

    return limiterConfig as RateLimiter;
  }

  async consume(key: string, points: number = 1): Promise<RateLimiterResult> {
    try {
      const result = await this.limiter.consume(key, points);
      return {
        remainingPoints: result.remainingPoints,
        msBeforeNext: result.msBeforeNext,
        consumedPoints: result.consumedPoints,
        isFirstInDuration: result.isFirstInDuration,
      };
    } catch (error) {
      if (error instanceof Error && 'remainingPoints' in error) {
        const rateLimiterError = error as any;
        throw new RateLimitExceededError({
          remainingPoints: rateLimiterError.remainingPoints,
          msBeforeNext: rateLimiterError.msBeforeNext,
          consumedPoints: rateLimiterError.consumedPoints,
        });
      }
      throw error;
    }

  async reward(key: string, points: number = 1): Promise<RateLimiterResult> {
    return {
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
      consumedPoints: result.consumedPoints,
      isFirstInDuration: result.isFirstInDuration,
    };
  }

  async penalty(key: string, points: number = 1): Promise<RateLimiterResult> {
    return {
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
      consumedPoints: result.consumedPoints,
      isFirstInDuration: result.isFirstInDuration,
    };
  }

  async block(key: string, secDuration: number): Promise<RateLimiterResult> {
    return {
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
      consumedPoints: result.consumedPoints,
      isFirstInDuration: result.isFirstInDuration,
    };
  }

  async delete(key: string): Promise<boolean> {
    return await this.limiter.delete(key);
  }

  async reset(key: string): Promise<boolean> {
    return await this.limiter.delete(key);
  }

  async get(key: string): Promise<RateLimiterResult | null> {
    if (!result) return null;

    return {
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
      consumedPoints: result.consumedPoints,
      isFirstInDuration: result.isFirstInDuration,
    };
  }

  getKey(identifier: string, prefix?: string): string {
    const basePrefix = this.limiter.keyPrefix || 'rl:';
    return `${basePrefix}${prefix ? `${prefix}:` : ''}${identifier}`;
  }

export function createRateLimiterMiddleware(
  options: RateLimiterMiddlewareOptions
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const service = new RateLimiterService(options);
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;
  const pointsExtractor = options.pointsExtractor || (() => 1);
  const onLimitReached = options.onLimitReached || defaultOnLimitReached;
  const onSuccess = options.onSuccess || (() => {});
  const onError = options.onError || defaultOnError;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const points = pointsExtractor(req);
      
      
      res.setHeader('X-RateLimit-Limit', options.points.toString());
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints.toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());
      
      await onSuccess(req, res, result);
      next();
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        res.setHeader('X-RateLimit-Limit', options.points.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + error.msBeforeNext).toISOString());
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());
        
        await onLimitReached(req, res, error);
      } else {
        await onError(req, res, error as Error);
      }
  };
}

function defaultKeyGenerator(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress || 'unknown';
  
  return ip;
}

function defaultOnLimitReached(req: Request, res: Response, error: RateLimitExceededError): void {
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(error.msBeforeNext / 1000),
  });
}

function defaultOnError(req: Request, res: Response, error: Error): void {
  console.error('Rate limiter error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An error occurred while processing your request.',
  });
}

export function createUserRateLimiter(config: Partial<RateLimiterConfig> = {}): RateLimiterService {
  return new RateLimiterService({
    points: 100,
    duration: 900, // 15 minutes
    blockDuration: 900, // 15 minutes
    keyPrefix: 'user:',
    ...config,
  });
}

export function createApiRateLimiter(config: Partial<RateLimiterConfig> = {}): RateLimiterService {
  return new RateLimiterService({
    points: 1000,
    duration: 3600, // 1 hour
    blockDuration: 3600, // 1 hour
    keyPrefix: 'api:',
    ...config,
  });
}

export function createLoginRateLimiter(config: Partial<RateLimiterConfig> = {}): RateLimiterService {
  return new RateLimiterService({
    points: 5,
    duration: 900, // 15 minutes
    blockDuration: 1800, // 30 minutes
    keyPrefix: 'login:',
    skipSuccessfulRequests: true,
    ...config,
  });
}

export function createPasswordResetRateLimiter(config: Partial<RateLimiterConfig> = {}): RateLimiterService {
  return new RateLimiterService({
    points: 3,
    duration: 3600, // 1 hour
    blockDuration: 3600, // 1 hour
    keyPrefix: 'reset:',
    ...config,
  });
}

export class RateLimiterManager {
  private limiters: Map<string, RateLimiterService> = new Map();

  register(name: string, config: RateLimiterConfig): void {
    this.limiters.set(name, new RateLimiterService(config));
  }

  get(name: string): RateLimiterService | undefined {
    return this.limiters.get(name);
  }

  middleware(name: string, options?: Partial<RateLimiterMiddlewareOptions>): ReturnType<typeof createRateLimiterMiddleware> {
    const limiter = this.get(name);
    if (!limiter) {
      throw new Error(`Rate limiter "${name}" not found`);
    }

    return createRateLimiterMiddleware({
      ...(limiter as any).config,
      ...options,
    });
  }

export const rateLimiterManager = new RateLimiterManager();

// Pre-configured limiters
rateLimiterManager.register('user', {
  points: 100,
  duration: 900,
  blockDuration: 900,
  keyPrefix: 'user:',
  storage: 'memory',
});

rateLimiterManager.register('api', {
  points: 1000,
  duration: 3600,
  blockDuration: 3600,
  keyPrefix: 'api:',
  storage: 'memory',
});

rateLimiterManager.register('login', {
  points: 5,
  duration: 900,
  blockDuration: 1800,
  keyPrefix: 'login:',
  storage: 'memory',
  skipSuccessfulRequests: true,
});

rateLimiterManager.register('passwordReset', {
  points: 3,
  duration: 3600,
  blockDuration: 3600,
  keyPrefix: 'reset:',
  storage: 'memory',
});

  /**
   * Check if rate limit is exceeded for a given key
   */
  async isRateLimited(key: string): Promise<boolean> {
    const limit = await this.checkRateLimit(key);
    return limit.remaining <= 0;
  }

  /**
   * Get rate limit configuration for a key
   */
  getRateLimitConfig(key: string): RateLimitConfig | undefined {
    // Extract rule type from key
    const ruleType = key.split(':')[0] as keyof typeof this.rules;
    return this.rules[ruleType];
  }

  /**
   * Clear rate limit for a specific key
   */
  async clearRateLimit(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Clear all rate limits for a user
   */
  async clearUserRateLimits(userId: string): Promise<void> {
    const keys = await this.redis.keys(`*:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

  /**
   * Clear all rate limits for an IP
   */
  async clearIPRateLimits(ip: string): Promise<void> {
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

  /**
   * Get all active rate limits for debugging
   */
  async getAllRateLimits(): Promise<Record<string, RateLimitInfo>> {
    const result: Record<string, RateLimitInfo> = {};

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      const count = await this.redis.get(key);
      const config = this.getRateLimitConfig(key);

      if (config && count) {
        result[key] = {
          count: parseInt(count),
          limit: config.points,
          remaining: Math.max(0, config.points - parseInt(count)),
          resetTime: ttl > 0 ? new Date(Date.now() + ttl * 1000) : new Date()
        };
      }

    return result;
  }

  /**
   * Format rate limit error message
   */
  private formatRateLimitError(info: RateLimitInfo, rule: string): string {
    const resetIn = Math.ceil((info.resetTime.getTime() - Date.now()) / 1000);
    return `Rate limit exceeded for ${rule}. Try again in ${resetIn} seconds.`;
  }

  /**
   * Create rate limit headers for HTTP response
   */
  createRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
    return {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(info.resetTime.getTime() / 1000).toString(),
      'Retry-After': Math.ceil((info.resetTime.getTime() - Date.now()) / 1000).toString()
    };
  }

  /**
   * Handle rate limit exceeded error
   */
  handleRateLimitExceeded(key: string, info: RateLimitInfo): void {
    const [rule] = key.split(':');
    const error = new RateLimitError(this.formatRateLimitError(info, rule));
    error.retryAfter = Math.ceil((info.resetTime.getTime() - Date.now()) / 1000);
    error.headers = this.createRateLimitHeaders(info);
    throw error;
  }

/**
 * Custom error class for rate limit errors
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
    public headers?: Record<string, string>
  ) {
    super(message);
    this.name = 'RateLimitError';
  }

// Export types
export type { RateLimitConfig, RateLimitInfo, RateLimitResult };

// Export service
export default RateLimiterService;

}
}
}
}
}
}
}
}
}
