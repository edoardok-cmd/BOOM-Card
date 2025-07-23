import Redis from 'ioredis';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

export class CacheManagerService {
  private redis: Redis;
  private defaultTTL: number;
  private stats: CacheStats;
  private connected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    this.defaultTTL = config.cache.defaultTTL || 3600;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.connected = true;
      logger.info('Redis connection established');
    });

    this.redis.on('error', (error: Error) => {
      this.connected = false;
      this.stats.errors++;
      logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.connected = false;
      logger.warn('Redis connection closed');
    });
  }

  private generateKey(key: string, namespace?: string): string {
    const prefix = namespace || 'boom';
    return `${prefix}:${key}`;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      if (!this.connected) {
        logger.warn('Cache miss due to disconnected Redis');
        this.stats.misses++;
        return null;
      }

      const cacheKey = this.generateKey(key, options?.namespace);
      const value = await this.redis.get(cacheKey);

      if (!value) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      const parsed = JSON.parse(value);

      if (options?.compress) {
        // Implement decompression logic if needed
        return parsed.data as T;
      }

      return parsed as T;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache get error:', error);
      return null;
    }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.connected) {
        logger.warn('Cache set skipped due to disconnected Redis');
        return false;
      }

      const ttl = options?.ttl || this.defaultTTL;
      
      let dataToStore: any = value;
      if (options?.compress) {
        // Implement compression logic if needed
        dataToStore = { compressed: true, data: value };
      }

      const serialized = JSON.stringify(dataToStore);
      
      if (ttl > 0) {
        await this.redis.setex(cacheKey, ttl, serialized);
      } else {
        await this.redis.set(cacheKey, serialized);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache set error:', error);
      return false;
    }

  async delete(key: string, namespace?: string): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      const result = await this.redis.del(cacheKey);
      
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete error:', error);
      return false;
    }

  async deletePattern(pattern: string, namespace?: string): Promise<number> {
    try {
      if (!this.connected) {
        return 0;
      }

      const searchPattern = this.generateKey(pattern, namespace);
      const keys = await this.redis.keys(searchPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      
      const results = await pipeline.exec();
      const deletedCount = results?.filter(([err]) => !err).length || 0;
      
      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete pattern error:', error);
      return 0;
    }

  async flush(namespace?: string): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      if (namespace) {
        const pattern = `${namespace}:*`;
        await this.deletePattern(pattern);
      } else {
        await this.redis.flushdb();
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache flush error:', error);
      return false;
    }

  async mget<T>(keys: string[], namespace?: string): Promise<Map<string, T>> {
    try {
      if (!this.connected || keys.length === 0) {
        return new Map();
      }

      const cacheKeys = keys.map(key => this.generateKey(key, namespace));
      const values = await this.redis.mget(...cacheKeys);
      
      values.forEach((value, index) => {
        if (value) {
          try {
            result.set(keys[index], parsed);
            this.stats.hits++;
          } catch (parseError) {
            this.stats.errors++;
            logger.error('Cache mget parse error:', parseError);
          } else {
          this.stats.misses++;
        });

      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mget error:', error);
      return new Map();
    }

  async mset<T>(items: Map<string, T>, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.connected || items.size === 0) {
        return false;
      }


      items.forEach((value, key) => {
        
        if (ttl > 0) {
          pipeline.setex(cacheKey, ttl, serialized);
        } else {
          pipeline.set(cacheKey, serialized);
        });

      const successCount = results?.filter(([err]) => !err).length || 0;
      
      this.stats.sets += successCount;
      return successCount === items.size;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mset error:', error);
      return false;
    }

  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      const exists = await this.redis.exists(cacheKey);
      return exists > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache exists error:', error);
      return false;
    }

  async ttl(key: string, namespace?: string): Promise<number> {
    try {
      if (!this.connected) {
        return -1;
      }

      return await this.redis.ttl(cacheKey);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache ttl error:', error);
      return -1;
    }

  async expire(key: string, ttl: number, namespace?: string): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache expire error:', error);
      return false;
    }

  async increment(key: string, value: number = 1, namespace?: string): Promise<number> {
    try {
      if (!this.connected) {
        return 0;
      }

      return await this.redis.incrby(cacheKey, value);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache increment error:', error);
      return 0;
    }

  async decrement(key: string, value: number = 1, namespace?: string): Promise<number> {
    try {
      if (!this.connected) {
        return 0;
      }

      return await this.redis.decrby(cacheKey, value);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache decrement error:', error);
      return 0;
    }

  // List operations
  async lpush(key: string, values: string[], namespace?: string): Promise<number> {
    try {
      if (!this.connected || values.length === 0) {
        return 0;
      }

      return await this.redis.lpush(cacheKey, ...values);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache lpush error:', error);
      return 0;
    }

  async lrange(key: string, start: number, stop: number, namespace?: string): Promise<string[]> {
    try {
      if (!this.connected) {
        return [];
      }

      return await this.redis.lrange(cacheKey, start, stop);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache lrange error:', error);
      return
}}}
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
