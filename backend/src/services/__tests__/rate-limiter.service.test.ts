import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { RateLimiterService } from '../rate-limiter.service';
import { RedisService } from '../redis.service';
import { LoggerService } from '../logger.service';
import { ConfigService } from '../config.service';
import { MetricsService } from '../metrics.service';
import { RateLimitExceededException } from '../../exceptions/rate-limit-exceeded.exception';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { InternalServerErrorException } from '../../exceptions/internal-server-error.exception';

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

interface MockRedisClient {
  get: jest.Mock;
  set: jest.Mock;
  incr: jest.Mock;
  expire: jest.Mock;
  ttl: jest.Mock;
  del: jest.Mock;
  multi: jest.Mock;
}

interface RateLimitKey {
  identifier: string;
  action: string;
  metadata?: Record<string, any>;
}

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_KEY_PREFIX = 'rate-limit:';
const TEST_IDENTIFIER = 'test-user-123';
const TEST_ACTION = 'api:test-endpoint';
const TEST_IP = '192.168.1.1';
const REDIS_ERROR_MESSAGE = 'Redis connection error';
const RATE_LIMIT_HEADER_LIMIT = 'X-RateLimit-Limit';
const RATE_LIMIT_HEADER_REMAINING = 'X-RateLimit-Remaining';
const RATE_LIMIT_HEADER_RESET = 'X-RateLimit-Reset';
const RETRY_AFTER_HEADER = 'Retry-After';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let mockRedisClient: MockRedisClient;
  let mockLogger: jest.Mocked<Logger>;
  let mockEventBus: jest.Mocked<EventEmitter>;
  let mockConfigService: MockConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockRedisClient = new MockRedisClient();
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
    
    mockEventBus = new EventEmitter() as jest.Mocked<EventEmitter>;
    jest.spyOn(mockEventBus, 'emit');
    jest.spyOn(mockEventBus, 'on');
    
    mockConfigService = new MockConfigService({
      'RATE_LIMIT_WINDOW_MS': '60000',
      'RATE_LIMIT_MAX_REQUESTS': '100',
      'RATE_LIMIT_BURST_MULTIPLIER': '1.5',
      'RATE_LIMIT_CLEANUP_INTERVAL_MS': '300000',
      'RATE_LIMIT_REDIS_TTL_BUFFER': '300',
    });

    service = new RateLimiterService(
      mockRedisClient as any,
      mockLogger,
      mockEventBus,
      mockConfigService as any
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined();
      expect(service['windowMs']).toBe(60000);
      expect(service['maxRequests']).toBe(100);
      expect(service['burstMultiplier']).toBe(1.5);
    });

    it('should start cleanup interval', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      new RateLimiterService(
        mockRedisClient as any,
        mockLogger,
        mockEventBus,
        mockConfigService as any
      );
      
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        300000
      );
    });

    it('should register event listeners', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith(
        'rateLimiter:reset',
        expect.any(Function)
      );
      expect(mockEventBus.on).toHaveBeenCalledWith(
        'rateLimiter:updateConfig',
        expect.any(Function)
      );
    });
  });

  describe('checkLimit', () => {
    const testIdentifier = 'test-user-123';
    const testEndpoint = '/api/v1/test';
    const testKey = `rate_limit:${testIdentifier}:${testEndpoint}`;

    it('should allow request when under limit', async () => {
      mockRedisClient.get.mockResolvedValue('50');
      mockRedisClient.multi.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK', 51], ['OK', 1]]),
      } as any);

      const result = await service.checkLimit(testIdentifier, testEndpoint);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(49);
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(mockRedisClient.get).toHaveBeenCalledWith(testKey);
    });

    it('should deny request when over limit', async () => {
      mockRedisClient.get.mockResolvedValue('100');
      mockRedisClient.ttl.mockResolvedValue(30);


      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(30);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Rate limit exceeded',
        expect.objectContaining({
          identifier: testIdentifier,
          endpoint: testEndpoint,
          currentCount: 100,
          limit: 100,
        })
      );
    });

    it('should allow burst traffic', async () => {
      mockRedisClient.get.mockResolvedValue('120');
      mockRedisClient.multi.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK', 121], ['OK', 1]]),
      } as any);

        allowBurst: true,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(29);
      expect(result.burstMode).toBe(true);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection error'));


      expect(result.allowed).toBe(true);
      expect(result.error).toBe('Rate limiter unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Rate limiter error',
        expect.any(Error)
      );
    });

    it('should handle custom limits', async () => {
      mockRedisClient.get.mockResolvedValue('40');
      mockRedisClient.multi.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK', 41], ['OK', 1]]),
      } as any);

        customLimit: 50,
        customWindow: 30000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(50);
    });

    it('should emit events on rate limit exceeded', async () => {
      mockRedisClient.get.mockResolvedValue('100');
      mockRedisClient.ttl.mockResolvedValue(30);

      await service.checkLimit(testIdentifier, testEndpoint);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'rateLimiter:exceeded',
        expect.objectContaining({
          identifier: testIdentifier,
          endpoint: testEndpoint,
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('resetLimit', () => {
    it('should reset rate limit for identifier', async () => {
      const identifier = 'test-user-123';
      mockRedisClient.keys.mockResolvedValue([
        'rate_limit:test-user-123:/api/v1/test1',
        'rate_limit:test-user-123:/api/v1/test2',
      ]);
      mockRedisClient.del.mockResolvedValue(2);


      expect(result).toBe(2);
      expect(mockRedisClient.keys).toHaveBeenCalledWith(`rate_limit:${identifier}:*`);
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'rate_limit:test-user-123:/api/v1/test1',
        'rate_limit:test-user-123:/api/v1/test2'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Rate limits reset',
        expect.objectContaining({
          identifier,
          keysDeleted: 2,
        })
      );
    });

    it('should reset specific endpoint', async () => {
      const endpoint = '/api/v1/test';
      mockRedisClient.del.mockResolvedValue(1);


      expect(result).toBe(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        `rate_limit:${identifier}:${endpoint}`
      );
    });

    it('should handle reset errors', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));


      expect(result).toBe(0);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to reset rate limits',
        expect.any(Error)
      );
    });
  });

  describe('getStats', () => {
    it('should return rate limit statistics', async () => {
      mockRedisClient.keys.mockResolvedValue([
        'rate_limit:test-user-123:/api/v1/test1',
        'rate_limit:test-user-123:/api/v1/test2',
      ]);
      mockRedisClient.mget.mockResolvedValue(['75', '25']);
      mockRedisClient.ttl.mockResolvedValueOnce(30).mockResolvedValueOnce(45);

      const stats = await service.getStats(identifier);

      expect(stats).toEqual({
        identifier,
        endpoints: [
          {
            endpoint: '/api/v1/test1',
            count: 75,
            limit: 100,
            remaining: 25,
            resetIn: 30,
            percentUsed: 75,
          },
          {
            endpoint: '/api/v1/test2',
            count: 25,
            limit: 100,
            remaining: 75,
            resetIn: 45,
            percentUsed: 25,
          },
        ],
        totalRequests: 100,
        averageUsage: 50,
      });
    });

    it('should handle missing stats gracefully', async () => {
      mockRedisClient.keys.mockResolvedValue([]);


      expect(stats).toEqual({
        identifier: 'unknown-user',
        endpoints: [],
        totalRequests: 0,
        averageUsage: 0,
      });
    });
  });

  describe('middleware', () => {
    it('should create rate limiting middleware', () => {
      const middleware = service.middleware();
      const req = {
        ip: '192.168.1.1',
        path: '/api/v1/test',
        user: { id: 'user-123' },
      } as any;
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      // Mock checkLimit to return allowed
      jest.spyOn(service, 'checkLimit').mockResolvedValue({
        allowed: true,
        limit: 100,
        remaining: 50,
        resetAt: new Date(Date.now() + 60000),
      });

      middleware(req, res, next);

      // Wait for async operations
      setImmediate(() => {
        expect(service.checkLimit).toHaveBeenCalledWith(
          'user-123',
          '/api/v1/test',
          undefined
        );
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 50);
        expect(res.setHeader).toHaveBeenCalledWith(
          'X-RateLimit-Reset',
          expect.any(String)
        );
        expect(next).toHaveBeenCalled();
      });
    });

    it('should block requests when rate limit exceeded', () => {
     
}}}