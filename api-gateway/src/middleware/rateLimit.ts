import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { RateLimitConfig } from '../types/middleware';

// Rate limit configurations for different endpoints
const rateLimitConfigs: { [key: string]: RateLimitConfig } = {
  // Authentication endpoints
  '/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  '/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  '/auth/forgot-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: 'Too many password reset requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // API endpoints
  '/api/search': {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Too many search requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
  },
  '/api/partners': {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
  },
  '/api/transactions': {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 transaction requests per minute
    message: 'Too many transaction requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Payment endpoints
  '/payment/process': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 payment attempts per 5 minutes
    message: 'Too many payment attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // POS integration endpoints
  '/pos/validate': {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 validation requests per minute
    message: 'Too many validation requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Default rate limit for all other endpoints
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// Create rate limiter with Redis store
const createRateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    }),
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
      });
      
      throw new ApiError(429, config.message || 'Too many requests');
    },
    skip: (req: Request) => {
      // Skip rate limiting for health check endpoints
      return req.path === '/health' || req.path === '/metrics';
    },
    keyGenerator: (req: Request) => {
      // Use combination of IP and user ID (if authenticated) for rate limiting
      const userId = req.user?.id || 'anonymous';
      return `${req.ip}:${userId}`;
    },
  });
};

// Create rate limiters for each configuration
const rateLimiters: { [key: string]: any } = {};
Object.entries(rateLimitConfigs).forEach(([path, config]) => {
  rateLimiters[path] = createRateLimiter(config);
});

// Middleware to apply appropriate rate limiter based on request path
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find the most specific matching rate limiter
    let matchedPath = 'default';
    let matchedLength = 0;
    
    for (const path of Object.keys(rateLimitConfigs)) {
      if (path !== 'default' && req.path.startsWith(path) && path.length > matchedLength) {
        matchedPath = path;
        matchedLength = path.length;
      }
    
    // Apply the matched rate limiter
    const limiter = rateLimiters[matchedPath];
    limiter(req, res, next);
  } catch (error) {
    logger.error('Rate limit middleware error', error);
    next(error);
  };

// Create custom rate limiter for specific use cases
export const createCustomRateLimiter = (options: Partial<RateLimitConfig>) => {
  const config: RateLimitConfig = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: options.standardHeaders !== false,
    legacyHeaders: options.legacyHeaders || false,
  };
  
  return createRateLimiter(config);
};

// Rate limiter for partner-specific endpoints
export const partnerRateLimiter = createCustomRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute for partners
  message: 'Partner API rate limit exceeded',
});

// Rate limiter for admin endpoints
export const adminRateLimiter = createCustomRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute for admins
  message: 'Admin API rate limit exceeded',
});

// Dynamic rate limiting based on user tier
export const tierBasedRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userTier = req.user?.tier || 'basic';
  
  const tierLimits: { [key: string]: number } = {
    basic: 100,
    premium: 500,
    enterprise: 1000,
  };
  
  const limit = tierLimits[userTier] || tierLimits.basic;
  
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: limit,
    message: `Rate limit exceeded for ${userTier} tier`,
  });
  
  limiter(req, res, next);
};

// Middleware to check rate limit status without blocking
export const checkRateLimitStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `rl:${req.ip}:${userId}`;
    
    const current = await redisClient.get(key);
    
    res.setHeader('X-RateLimit-Current', current || '0');
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - (parseInt(current || '0'))).toString());
    
    next();
  } catch (error) {
    logger.error('Error checking rate limit status', error);
    next();
  };

// Clear rate limit for specific IP/user
export const clearRateLimit = async (ip: string, userId?: string) => {
  try {
    await redisClient.del(key);
    logger.info('Rate limit cleared', { ip, userId });
  } catch (error) {
    logger.error('Error clearing rate limit', error);
    throw error;
  };

// Get current rate limit status
export const getRateLimitStatus = async (ip: string, userId?: string, path: string = 'default') => {
  try {
    const config = rateLimitConfigs[path] || rateLimitConfigs.default;
    
    return {
      current: parseInt(current || '0'),
      limit: config.max,
      remaining: Math.max(0, config.max - parseInt(current || '0')),
      windowMs: config.windowMs,
      resetsAt: new Date(Date.now() + config.windowMs),
    };
  } catch (error) {
    logger.error('Error getting rate limit status', error);
    throw error;
  };

// Middleware for rate limit bypass tokens
export const rateLimitBypassMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const bypassToken = req.headers['x-ratelimit-bypass-token'];
  
  if (bypassToken && process.env.RATE_LIMIT_BYPASS_TOKENS?.split(',').includes(bypassToken as string)) {
    logger.info('Rate limit bypassed', { ip: req.ip, path: req.path });
    return next();
  }
  
  rateLimitMiddleware(req, res, next);
};

export default rateLimitMiddleware;

}
}
}
}
