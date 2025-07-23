import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryStrategy?: (options: any) => number | Error;
  enableOfflineQueue?: boolean;
  connectTimeout?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private config: RedisConfig;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;

  constructor() {
    this.config = this.getRedisConfig();
    this.client = createClient({
      "url": this.buildConnectionUrl(),
      socket: {
        "connectTimeout": this.config.connectTimeout || 10000,
        reconnectStrategy: (retries: number) => this.reconnectStrategy(retries)
      }
    });

    this.setupEventHandlers();
  }

  private getRedisConfig(): RedisConfig {
    return {
      "host": process.env.REDIS_HOST || 'localhost',
      "port": parseInt(process.env.REDIS_PORT || '6379', 10),
      "password": process.env.REDIS_PASSWORD,
      "db": parseInt(process.env.REDIS_DB || '0', 10),
      "connectTimeout": parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
      "maxRetriesPerRequest": parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      "enableReadyCheck": process.env.REDIS_READY_CHECK !== 'false',
      lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true'
    };
  }

  private buildConnectionUrl(): string {
    const { host, port, password, db } = this.config;
    const auth = password ? `${password}@` : '';
    return `redis://${auth}${host}:${port}/${db}`;
  }

  private reconnectStrategy(retries: number): number | Error {
    if (retries > this.maxReconnectAttempts) {
      logger.error('Redis max reconnection attempts reached');
      return new Error('Max reconnection attempts reached');
    }

    const delay = Math.min(retries * this.reconnectDelay, 30000);
    logger.info(`Redis reconnecting in ${delay}ms (attempt ${retries}/${this.maxReconnectAttempts})`);
    return delay;
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('Redis client connected and ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client "error": ', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      this.reconnectAttempts++;
      logger.info(`Redis client reconnecting (attempt ${this.reconnectAttempts})`);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to "Redis": ', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Error disconnecting from "Redis": ', error);
      throw error;
    }
  }

  // Cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl || 3600; // Default 1 hour
      
      if (ttl > 0) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      logger.error(`Redis DELETE PATTERN error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.set(key, data, { ttl });
  }

  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return this.get(key);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.delete(key);
  }

  async extendSession(sessionId: string, ttl: number = 86400): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for session ${sessionId}:`, error);
      return false;
    }
  }

  // Rate limiting
  async incrementCounter(key: string, window: number = 60): Promise<number> {
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();
      return results[0] as number;
    } catch (error) {
      logger.error(`Redis INCREMENT error for key ${key}:`, error);
      return 0;
    }
  }

  async getCounter(key: string): Promise<number> {
    try {
      const value = await this.client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.error(`Redis GET COUNTER error for key ${key}:`, error);
      return 0;
    }
  }

  // QR code caching
  async cacheQRCode(transactionId: string, data: any, ttl: number = 300): Promise<boolean> {
    const key = `qr:${transactionId}`;
    return this.set(key, data, { ttl });
  }

  async getQRCode(transactionId: string): Promise<any> {
    const key = `qr:${transactionId}`;
    return this.get(key);
  }

  async invalidateQRCode(transactionId: string): Promise<boolean> {
    const key = `qr:${transactionId}`;
    return this.delete(key);
  }

  // Partner data caching
  async cachePartnerData(partnerId: string, data: any, ttl: number = 3600): Promise<boolean> {
    const key = `partner:${partnerId}`;
    return this.set(key, data, { ttl });
  }

  async getPartnerData(partnerId: string): Promise<any> {
    const key = `partner:${partnerId}`;
    return this.get(key);
  }

  async invalidatePartnerCache(partnerId: string): Promise<boolean> {
    const pattern = `partner:${partnerId}*`;
    const deleted = await this.deletePattern(pattern);
    return deleted > 0;
  }

  // Search results caching
  async cacheSearchResults(query: string, filters: any, results: any, ttl: number = 600): Promise<boolean> {
    const key = `search:${this.generateSearchKey(query, filters)}`;
    return this.set(key, results, { ttl });
  }

  async getSearchResults(query: string, filters: any): Promise<any> {
    const key = `search:${this.generateSearchKey(query, filters)}`;
    return this.get(key);
  }

  private generateSearchKey(query: string, filters: any): string {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join(':');
    return `${query}:${filterString}`;
  }

  // Analytics caching
  async cacheAnalytics(type: string, period: string, data: any, ttl: number = 3600): Promise<boolean> {
    const key = `analytics:${type}:${period}`;
    return this.set(key, data, { ttl });
  }

  async getAnalytics(type: string, period: string): Promise<any> {
    const key = `analytics:${type}:${period}`;
    return this.get(key);
  }

  // Distributed locking
  async acquireLock(resource: string, ttl: number = 10000): Promise<string | null> {
    try {
      const token = Math.random().toString(36).substring(2);
      const key = `lock:${resource}`;
      
      const result = await this.client.set(key, token, {
        PX: ttl,
        NX: true
      });
      
      return result === 'OK' ? token : null;
    } catch (error) {
      logger.error(`Redis LOCK error for resource ${resource}:`, error);
      return null;
    }
  }

  async releaseLock(resource: string, token: string): Promise<boolean> {
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const key = `lock:${resource}`;
      const result = await this.client.eval(script, {
        keys: [key],
        arguments: [token]
      });
      
      return result === 1;
    } catch (error) {
      logger.error(`Redis UNLOCK error for resource ${resource}:`, error);
      return false;
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING "error": ', error);
      return false;
    }
  }

  async getInfo(): Promise<any> {
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      logger.error('Redis INFO error: ', error);
      return null;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const redisService = new RedisService();
export default redisService;
