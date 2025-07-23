import { Test, TestingModule } from '@nestjs/testing';
import { CacheManagerService } from '../cache-manager.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';
import * as Redis from 'ioredis';

interface MockCache extends Cache {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  reset: jest.Mock;
  wrap: jest.Mock;
  store: {
    getClient: () => Redis.Redis;
    keys: jest.Mock;
    mget: jest.Mock;
    mset: jest.Mock;
    ttl: jest.Mock;
  };
}

interface CacheTestData {
  id: string;
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

interface CacheKeyPattern {
  pattern: string;
  regex: RegExp;
  ttl: number;
}

const DEFAULT_TTL = 3600;
const SHORT_TTL = 300;
const LONG_TTL = 86400;

const CACHE_KEY_PATTERNS: Record<string, CacheKeyPattern> = {
  USER: {
    pattern: 'user:*',
    regex: /^user:[\w-]+$/,
    ttl: DEFAULT_TTL
  },
  CARD: {
    pattern: 'card:*',
    regex: /^card:[\w-]+$/,
    ttl: SHORT_TTL
  },
  TRANSACTION: {
    pattern: 'transaction:*',
    regex: /^transaction:[\w-]+$/,
    ttl: LONG_TTL
  },
  SESSION: {
    pattern: 'session:*',
    regex: /^session:[\w-]+$/,
    ttl: SHORT_TTL
  };

const TEST_CACHE_VALUES = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    roles: ['user', 'admin']
  },
  card: {
    id: 'test-card-456',
    cardNumber: '**** **** **** 1234',
    balance: 1000
  },
  transaction: {
    id: 'test-txn-789',
    amount: 50,
    status: 'completed'
  };

const REDIS_ERROR_CODES = {
  CONNECTION_REFUSED: 'ECONNREFUSED',
  TIMEOUT: 'ETIMEDOUT',
  NO_AUTH: 'NOAUTH',
  WRONG_TYPE: 'WRONGTYPE'
};

const CACHE_NAMESPACE = 'boom-card';
const CACHE_VERSION = 'v1';

describe('CacheManagerService', () => {
  let service: CacheManagerService;
  let redisClient: jest.Mocked<RedisClient>;
  let memcachedClient: jest.Mocked<MemcachedClient>;
  let localCache: jest.Mocked<NodeCache>;
  let cacheStats: jest.Mocked<CacheStatistics>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheManagerService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient(),
        },
        {
          provide: 'MEMCACHED_CLIENT',
          useValue: mockMemcachedClient(),
        },
        {
          provide: 'LOCAL_CACHE',
          useValue: mockLocalCache(),
        },
        {
          provide: CacheStatisticsService,
          useValue: mockCacheStats(),
        },
      ],
    }).compile();

    service = module.get<CacheManagerService>(CacheManagerService);
    redisClient = module.get('REDIS_CLIENT');
    memcachedClient = module.get('MEMCACHED_CLIENT');
    localCache = module.get('LOCAL_CACHE');
    cacheStats = module.get(CacheStatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return value from local cache if exists', async () => {
      const key = 'test-key';
      const value = { data: 'test' };
      localCache.get.mockReturnValue(value);

      const result = await service.get(key);

      expect(result).toEqual(value);
      expect(localCache.get).toHaveBeenCalledWith(key);
      expect(redisClient.get).not.toHaveBeenCalled();
      expect(cacheStats.recordHit).toHaveBeenCalledWith('local');
    });

    it('should fallback to Redis if not in local cache', async () => {
      localCache.get.mockReturnValue(undefined);
      redisClient.get.mockResolvedValue(JSON.stringify(value));


      expect(result).toEqual(value);
      expect(localCache.get).toHaveBeenCalledWith(key);
      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(localCache.set).toHaveBeenCalledWith(key, value, DEFAULT_TTL);
      expect(cacheStats.recordMiss).toHaveBeenCalledWith('local');
      expect(cacheStats.recordHit).toHaveBeenCalledWith('redis');
    });

    it('should fallback to Memcached if not in Redis', async () => {
      localCache.get.mockReturnValue(undefined);
      redisClient.get.mockResolvedValue(null);
      memcachedClient.get.mockResolvedValue(value);


      expect(result).toEqual(value);
      expect(memcachedClient.get).toHaveBeenCalledWith(key);
      expect(redisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        DEFAULT_TTL
      );
      expect(cacheStats.recordHit).toHaveBeenCalledWith('memcached');
    });

    it('should return null if not found in any cache', async () => {
      localCache.get.mockReturnValue(undefined);
      redisClient.get.mockResolvedValue(null);
      memcachedClient.get.mockResolvedValue(null);


      expect(result).toBeNull();
      expect(cacheStats.recordMiss).toHaveBeenCalledTimes(3);
    });

    it('should handle Redis errors gracefully', async () => {
      localCache.get.mockReturnValue(undefined);
      redisClient.get.mockRejectedValue(new Error('Redis error'));
      memcachedClient.get.mockResolvedValue({ data: 'fallback' });


      expect(result).toEqual({ data: 'fallback' });
      expect(cacheStats.recordError).toHaveBeenCalledWith('redis', 'Redis error');
    });
  });

  describe('set', () => {
    it('should set value in all cache layers', async () => {
      const ttl = 3600;

      await service.set(key, value, ttl);

      expect(localCache.set).toHaveBeenCalledWith(key, value, ttl);
      expect(redisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        ttl
      );
      expect(memcachedClient.set).toHaveBeenCalledWith(key, value, ttl);
    });

    it('should use default TTL if not provided', async () => {

      await service.set(key, value);

      expect(localCache.set).toHaveBeenCalledWith(key, value, DEFAULT_TTL);
      expect(redisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        DEFAULT_TTL
      );
    });

    it('should continue setting in other caches if one fails', async () => {
      redisClient.set.mockRejectedValue(new Error('Redis error'));

      await service.set(key, value);

      expect(localCache.set).toHaveBeenCalled();
      expect(memcachedClient.set).toHaveBeenCalled();
      expect(cacheStats.recordError).toHaveBeenCalledWith('redis', 'Redis error');
    });
  });

  describe('delete', () => {
    it('should delete from all cache layers', async () => {

      await service.delete(key);

      expect(localCache.del).toHaveBeenCalledWith(key);
      expect(redisClient.del).toHaveBeenCalledWith(key);
      expect(memcachedClient.del).toHaveBeenCalledWith(key);
    });

    it('should continue deleting from other caches if one fails', async () => {
      redisClient.del.mockRejectedValue(new Error('Redis error'));

      await service.delete(key);

      expect(localCache.del).toHaveBeenCalled();
      expect(memcachedClient.del).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all cache layers', async () => {
      await service.clear();

      expect(localCache.flushAll).toHaveBeenCalled();
      expect(redisClient.flushdb).toHaveBeenCalled();
      expect(memcachedClient.flush).toHaveBeenCalled();
    });

    it('should handle errors during clear', async () => {
      redisClient.flushdb.mockRejectedValue(new Error('Redis error'));

      await expect(service.clear()).resolves.not.toThrow();
      expect(cacheStats.recordError).toHaveBeenCalled();
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate keys matching pattern', async () => {
      const pattern = 'user:*';
      const keys = ['user:1', 'user:2', 'user:3'];
      redisClient.keys.mockResolvedValue(keys);

      await service.invalidatePattern(pattern);

      expect(redisClient.keys).toHaveBeenCalledWith(pattern);
      expect(redisClient.del).toHaveBeenCalledWith(...keys);
      keys.forEach(key => {
        expect(localCache.del).toHaveBeenCalledWith(key);
        expect(memcachedClient.del).toHaveBeenCalledWith(key);
      });
    });

    it('should handle empty pattern results', async () => {
      redisClient.keys.mockResolvedValue([]);

      await service.invalidatePattern(pattern);

      expect(redisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const stats: CacheStats = {
        hits: 100,
        misses: 20,
        errors: 5,
        hitRate: 0.83,
        size: {
          local: 1024,
          redis: 2048,
          memcached: 4096,
        },
      };
      cacheStats.getStats.mockReturnValue(stats);


      expect(result).toEqual(stats);
    });
  });

  describe('warmup', () => {
    it('should preload frequently accessed data', async () => {
      const frequentKeys = ['config:app', 'user:popular', 'data:common'];
      const mockData = {
        'config:app': { setting: 'value' },
        'user:popular': { id: 1, name: 'Popular User' },
        'data:common': { info: 'Common Data' },
      };

      // Mock implementation to simulate warmup
      service.getFrequentKeys = jest.fn().mockResolvedValue(frequentKeys);
      service.loadFromSource = jest.fn().mockImplementation((key) => mockData[key]);

      await service.warmup();

      frequentKeys.forEach(key => {
        expect(localCache.set).toHaveBeenCalledWith(
          key,
          mockData[key],
          expect.any(Number)
        );
      });
    });
  });

  describe('setWithTags', () => {
    it('should set value with associated tags', async () => {
      const tags = ['product', 'inventory'];

      await service.setWithTags(key, value, tags);

      expect(redisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        DEFAULT_TTL
      );
      tags.forEach(tag => {
        expect(redisClient.sadd).toHaveBeenCalledWith(`tag:${tag}`, key);
      });
    });
  });

  describe('invalidateByTag', () => {
    it('should invalidate all keys with specific tag', async () => {
      const tag = 'product';
      redisClient.smembers.mockResolvedValue(keys);

      await service.invalidateByTag(tag);

      expect(redisClient.smembers).toHaveBeenCalledWith(`tag:${tag}`);
      keys.forEach(key => {
        expect(service.delete).toHaveBeenCalledWith(key);
      });
      expect(redisClient.del).toHaveBeenCalledWith(`tag:${tag}`);
    });
  });

  describe('getMultiple', () => {
    it('should get multiple values efficiently', async () => {
      const values = {
        key1: { data: 'value1' },
        key2: { data: 'value2' },
        key3: { data: 'value3' },
      };

      localCache.get.mockImplementation(key => values[key]);


      expect(result).toEqual(values);
     
}
}
}
}
}
