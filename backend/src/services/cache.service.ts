import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { config } from '../config';
import { MetricsService } from './metrics.service';
import { CircuitBreaker } from '../utils/circuit-breaker';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  compress?: boolean;
  tags?: string[];
  staleWhileRevalidate?: number;
  lockTimeout?: number;
  retries?: number;
}

export interface CacheEntry<T = any> {
  value: T;
  metadata: CacheMetadata;
}

export interface CacheMetadata {
  key: string;
  createdAt: number;
  expiresAt: number;
  version: string;
  tags: string[];
  compressed: boolean;
  hitCount: number;
  lastAccessedAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  avgResponseTime: number;
  memoryUsage: number;
}

export interface CachePattern {
  pattern: string;
  ttl: number;
  tags: string[];
  compress: boolean;
}

export interface BatchOperation {
  operation: 'get' | 'set' | 'delete';
  key: string;
  value?: any;
  options?: CacheOptions;
}

export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    maxRetriesPerRequest: number;
    enableReadyCheck: boolean;
    lazyConnect: boolean;
  };
  defaults: {
    ttl: number;
    maxKeyLength: number;
    compressionThreshold: number;
    lockTimeout: number;
    staleWhileRevalidate: number;
  };
  patterns: CachePattern[];
  circuitBreaker: {
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

export type CacheKeyGenerator = (params: Record<string, any>) => string;
export type CacheSerializer<T> = (value: T) => string;
export type CacheDeserializer<T> = (value: string) => T;
export type CacheValidator<T> = (value: T) => boolean;

export const CacheEvents = {
  HIT: 'cache:hit',
  MISS: 'cache:miss',
  SET: 'cache:set',
  DELETE: 'cache:delete',
  ERROR: 'cache:error',
  INVALIDATE: 'cache:invalidate',
  EXPIRE: 'cache:expire',
} as const;

export const CachePrefixes = {
  USER: 'user:',
  CARD: 'card:',
  TRANSACTION: 'transaction:',
  SESSION: 'session:',
  API: 'api:',
  ANALYTICS: 'analytics:',
  TEMP: 'temp:',
  LOCK: 'lock:',
  TAG: 'tag:',
} as const;

export const CacheTTL = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
} as const;

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  redis: {
    host: config.redis.host || 'localhost',
    port: config.redis.port || 6379,
    password: config.redis.password,
    db: config.redis.db || 0,
    keyPrefix: 'boom:',
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  },
  defaults: {
    ttl: CacheTTL.HOUR,
    maxKeyLength: 250,
    compressionThreshold: 1024,
    lockTimeout: 5000,
    staleWhileRevalidate: CacheTTL.MINUTE * 5,
  },
  patterns: [
    {
      pattern: 'user:*',
      ttl: CacheTTL.DAY,
      tags: ['user'],
      compress: true,
    },
    {
      pattern: 'card:*',
      ttl: CacheTTL.WEEK,
      tags: ['card'],
      compress: true,
    },
    {
      pattern: 'transaction:*',
      ttl: CacheTTL.MONTH,
      tags: ['transaction'],
      compress: true,
    },
    {
      pattern: 'session:*',
      ttl: CacheTTL.HOUR * 2,
      tags: ['session'],
      compress: false,
    },
  ],
  circuitBreaker: {
    threshold: 5,
    timeout: 10000,
    resetTimeout: 30000,
  },
};

export const CacheMetrics = {
  OPERATION_DURATION: 'cache_operation_duration',
  HIT_RATE: 'cache_hit_rate',
  MEMORY_USAGE: 'cache_memory_usage',
  KEY_COUNT: 'cache_key_count',
  ERROR_COUNT: 'cache_error_count',
} as const;

export function Cacheable(options?: CacheOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cacheKey = generateCacheKey(target.constructor.name, propertyKey, args);
      const cacheService = (this as any).cacheService;
      
      if (!cacheService) {
        return originalMethod.apply(this, args);
      }

      try {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        await cacheService.set(cacheKey, result, options);
        return result;
      } catch (error) {
        logger.error('Cacheable decorator error', { error, cacheKey });
        return originalMethod.apply(this, args);
      };
    return descriptor;
  };
}

export function CacheInvalidate(keyPattern: string | CacheKeyGenerator) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function (...args: any[]) {
      
      if (!cacheService) {
        return result;
      }

      try {
        const pattern = typeof keyPattern === 'function' 
          ? keyPattern({ target: target.constructor.name, method: propertyKey, args })
          : keyPattern;
        await cacheService.invalidatePattern(pattern);
      } catch (error) {
        logger.error('CacheInvalidate decorator error', { error, keyPattern });
      }

      return result;
    };
    return descriptor;
  };
}

function generateCacheKey(className: string, methodName: string, args: any[]): string {
  const keyParts = [className, methodName, ...args.map(arg => JSON.stringify(arg))];
  return createHash('sha256').update(keyParts.join(':')).digest('hex');
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly maxMemorySize: number;
  private currentMemorySize: number = 0;
  private cleanupInterval: NodeJS.Timeout;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(private redisClient: RedisClientType, private config: CacheConfig) {
    this.maxMemorySize = config.maxMemoryBytes || 100 * 1024 * 1024; // 100MB default
    this.startCleanupInterval();
  }

  async get<T>(key: string, options?: GetOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.namespace);
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(fullKey);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      this.hitCount++;
      this.updateAccessTime(fullKey);
      return memoryEntry.data;
    }

    // Check Redis
    try {
      const redisData = await this.redisClient.get(fullKey);
      if (redisData) {
        const entry: CacheEntry<T> = JSON.parse(redisData);
        if (!this.isExpired(entry)) {
          this.hitCount++;
          // Warm memory cache
          if (options?.warmMemory !== false) {
            this.setMemoryCache(fullKey, entry);
          }
          return entry.data;
        }
    } catch (error) {
      logger.error('Redis get error:', error);
    }

    this.missCount++;
    return null;
  }

  async set<T>(
    key: string, 
    data: T, 
    options?: SetOptions
  ): Promise<void> {
    const ttl = options?.ttl || this.config.defaultTTL;
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    
    const entry: CacheEntry<T> = {
      data,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessedAt: Date.now(),
        expiry,
        size: this.calculateSize(data),
        version: options?.version || 1,
        tags: options?.tags || []
      };

    // Set in memory cache
    if (options?.skipMemory !== true) {
      this.setMemoryCache(fullKey, entry);
    }

    // Set in Redis
    if (options?.skipRedis !== true) {
      try {
        const serialized = JSON.stringify(entry);
        if (ttl) {
          await this.redisClient.setEx(fullKey, ttl, serialized);
        } else {
          await this.redisClient.set(fullKey, serialized);
        } catch (error) {
        logger.error('Redis set error:', error);
        throw new Error(`Cache set failed: ${error.message}`);
      }
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    
    // Remove from memory
    const memoryDeleted = this.memoryCache.delete(fullKey);
    
    // Remove from Redis
    let redisDeleted = false;
    try {
      redisDeleted = result > 0;
    } catch (error) {
      logger.error('Redis delete error:', error);
    }

    return memoryDeleted || redisDeleted;
  }

  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      // Clear specific namespace
      
      // Clear from memory
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }

      // Clear from Redis
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        } catch (error) {
        logger.error('Redis clear error:', error);
      } else {
      // Clear all
      this.memoryCache.clear();
      this.currentMemorySize = 0;
      
      try {
        await this.redisClient.flushDb();
      } catch (error) {
        logger.error('Redis flush error:', error);
      }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0;
    
    // Invalidate in memory
    for (const [key, entry] of this.memoryCache.entries()) {
      if (tags.some(tag => entry.metadata.tags?.includes(tag))) {
        this.memoryCache.delete(key);
        invalidatedCount++;
      }

    // Invalidate in Redis (requires tag indexing)
    try {
      for (const tag of tags) {
        const tagKey = `cache:tag:${tag}`;
        const members = await this.redisClient.sMembers(tagKey);
        
        if (members.length > 0) {
          await this.redisClient.del(members);
          await this.redisClient.del(tagKey);
          invalidatedCount += members.length;
        }
    } catch (error) {
      logger.error('Redis tag invalidation error:', error);
    }

    return invalidatedCount;
  }

  async mget<T>(keys: string[], namespace?: string): Promise<(T | null)[]> {
    const fullKeys = keys.map(key => this.buildKey(key, namespace));
    const results: (T | null)[] = [];

    // Check memory cache first
    const memoryResults = new Map<string, T>();
    const missingKeys: string[] = [];

    for (const fullKey of fullKeys) {
      const entry = this.memoryCache.get(fullKey);
      if (entry && !this.isExpired(entry)) {
        memoryResults.set(fullKey, entry.data);
        this.hitCount++;
      } else {
        missingKeys.push(fullKey);
      }

    // Fetch missing keys from Redis
    if (missingKeys.length > 0) {
      try {
        const redisResults = await this.redisClient.mGet(missingKeys);
        
        for (let i = 0; i < missingKeys.length; i++) {
          if (redisData) {
            const entry: CacheEntry<T> = JSON.parse(redisData);
            if (!this.isExpired(entry)) {
              memoryResults.set(missingKeys[i], entry.data);
              this.hitCount++;
              // Warm memory cache
              this.setMemoryCache(missingKeys[i], entry);
            } else {
              this.missCount++;
            } else {
            this.missCount++;
          }
      } catch (error) {
        logger.error('Redis mget error:', error);
        missingKeys.forEach(() => this.missCount++);
      }

    // Build final results in order
    for (const fullKey of fullKeys) {
      results.push(memoryResults.get(fullKey) || null);
    }

    return results;
  }

  async mset<T>(items: Array<{ key: string; data: T; options?: SetOptions }>): Promise<void> {
    const multi = this.redisClient.multi();
    
    for (const item of items) {
      
      const entry: CacheEntry<T> = {
        data: item.data,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          accessedAt: Date.now(),
          expiry,
          size: this.calculateSize(item.data),
          version: item.options?.version || 1,
          tags: item.options?.tags || []
        };

      // Set in memory
      if (item.options?.skipMemory !== true) {
        this.setMemoryCache(fullKey, entry);
      }

      // Prepare Redis command
      if (ttl) {
        multi.setEx(fullKey, ttl, serialized);
      } else {
        multi.set(fullKey, serialized);
      }

      // Handle tags
      if (entry.metadata.tags && entry.metadata.tags.length > 0) {
        for (const tag of entry.metadata.tags) {
          multi.sAdd(`cache:tag:${tag}`, fullKey);
        }
    }

    try {
      await multi.exec();
    } catch (error) {
      logger.error('Redis mset error:', error);
      throw new Error(`Cache mset failed: ${error.message}`);
    }

  async exists(key: string, namespace?: string): Promise<boolean> {
    
    // Check memory first
    if (this.memoryCache.has(fullKey)) {
      if (!this.isExpired(entry)) {
        return true;
      }

    // Check Redis
    try {
      return await this.redisClient.exists(fullKey) > 0;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }

  async ttl(key: string, namespace?: string): Promise<number> {
    
    // Check memory first
    if (memoryEntry && memoryEntry.metadata.expiry) {
      return ttl > 0 ? ttl : -1;
    }

    // Check Redis
    try {
      return await this.redisClient.ttl(fullKey);
    } catch (error) {
      logger.error('Redis ttl error:', error);
      return -1;
    }

  async expire(key: string, ttl: number, namespace?: string): Promise<boolean> {
    
    // Update memory cache
    if (memoryEntry) {
      memoryEntry.metadata.expiry = Date.now() + ttl * 1000;
    }

    // Update Redis
    try {
      return await this.redisClient.expire(fullKey, ttl);
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }

  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate,
      memoryUsage: this.currentMemorySize,
      memoryLimit: this.maxMemorySize,
      entriesCount: this.memoryCache.size,
      avgEntrySize: this.memoryCache.size > 0 
        ? Math.floor(this.currentMemorySize / this.memoryCache.size) 
        : 0
    };
  }

  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Private helper methods
  private buildKey(key: string, namespace?: string): string {
    const prefix = namespace || this.config.keyPrefix || 'cache';
    return `${prefix}:${key}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.metadata.expiry) return false;
    return Date.now() > entry.metadata.expiry;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }

  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    const size = entry.metadata.size || this.calculateSize(entry.data);
    
    // Evict if necessary
    while (this.currentMemorySize + size > this.maxMemorySize && this.memoryCache.size > 0) {
      this.evictLRU();
    }

    // Update or add entry
    if (this.memoryCache.has(key)) {
      const oldEntry = this.memoryCache.get(key)!;
      this.currentMemorySize -= oldEntry.metadata.size || 0;
    }

    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.metadata.accessedAt < oldestTime) {
        oldestTime = entry.metadata.accessedAt;
        oldestKey = key;
      }

    if (oldestKey) {
      this.currentMemorySize -= entry.metadata.size || 0;
      this.memoryCache.delete(oldestKey);
    }

  private updateAccessTime(key: string): void {
    if (entry) {
      entry.metadata.accessedAt = Date.now();
    }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupInterval || 60000); // 1 minute default
  }

  private cleanupExpired(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }

    for (const key of keysToDelete) {
      this.currentMemorySize -= entry.metadata.size || 0;
      this.memoryCache.delete(key);
    }

  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
    this.currentMemorySize = 0;
  }

// Factory function
export function createCacheService(
  redisClient: RedisClientType,
  config: CacheConfig
): CacheService {
  return new CacheService(redisClient, config);
}

// Cache middleware
export function cacheMiddleware(
  cacheService: CacheService,
  options: CacheMiddlewareOptions = {}
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || options.skip?.(req)) {
      return next();
    }

    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : `${req.path}:${JSON.stringify(req.query)}`;

    try {
      // Check cache
        namespace: options.namespace || 'http'
      });

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        res.setHeader('X-Cache', 'MISS');
        
        // Cache the response
        cacheService.set(key, data, {
          ttl: options.ttl || 300, // 5 minutes default
          namespace: options.namespace || 'http',
          tags: options.tags
        }).catch(err => {
          logger.error('Cache middleware set error:', err);
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    };
}

// Export types for middleware
export interface CacheMiddlewareOptions {
  namespace?: string;
  ttl?: number;
  keyGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
  tags?: string[];
}

export interface GetOptions {
  namespace?: string;
  warmMemory?: boolean;
}

export interface SetOptions {
  namespace?: string;
  ttl?: number;
  skipMemory?: boolean;
  skipRedis?: boolean;
  version?: number;
  tags?: string[];
}

// Type definitions needed for the service
type RedisClientType = any; // Replace with actual Redis client type
type Request = any; // Replace with Express Request type
type Response = any; // Replace with Express Response type
type NextFunction = any; // Replace with Express NextFunction type
type RequestHandler = any; // Replace with Express RequestHandler type

// Export the cache service singleton
export const cacheService = new CacheService(
  null as any, // Redis client will be injected
  DEFAULT_CACHE_CONFIG
);

// Default export
export default CacheService;

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
