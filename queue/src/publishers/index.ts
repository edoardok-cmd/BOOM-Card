import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { z } from 'zod';
import { 
  QueueConfig, 
  PublisherOptions, 
  RetryOptions,
  EventMetadata,
  PublishResult,
  EventPriority,
  EventStatus
} from '../types';
import { createLogger } from '../../utils/logger';
import { MetricsCollector } from '../../monitoring/metrics';
import { CircuitBreaker } from '../../utils/circuit-breaker';
import { RateLimiter } from '../../utils/rate-limiter';

// Event type definitions
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  version: string;
  correlationId?: string;
  causationId?: string;
  metadata: EventMetadata;
}

export interface CardEvent extends BaseEvent {
  aggregateId: string;
  aggregateName: 'card';
  payload: Record<string, any>;
}

export interface UserEvent extends BaseEvent {
  userId: string;
  aggregateName: 'user';
  payload: Record<string, any>;
}

export interface TransactionEvent extends BaseEvent {
  transactionId: string;
  cardId: string;
  userId: string;
  aggregateName: 'transaction';
  payload: {
    amount: number;
    currency: string;
    merchantId: string;
    type: 'purchase' | 'refund' | 'authorization' | 'capture';
    status: 'pending' | 'completed' | 'failed' | 'reversed';
    [key: string]: any;
  };
}

export interface NotificationEvent extends BaseEvent {
  recipientId: string;
  channel: 'email' | 'sms' | 'push' | 'in-app';
  template: string;
  payload: Record<string, any>;
}

export interface SystemEvent extends BaseEvent {
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  payload: Record<string, any>;
}

export type DomainEvent = 
  | CardEvent 
  | UserEvent 
  | TransactionEvent 
  | NotificationEvent 
  | SystemEvent;

// Publisher configuration interfaces
export interface PublisherConfig {
  redis: Redis;
  logger?: Logger;
  metrics?: MetricsCollector;
  defaultOptions?: Partial<PublisherOptions>;
  circuitBreaker?: CircuitBreaker;
  rateLimiter?: RateLimiter;
}

export interface EventPublisherOptions extends PublisherOptions {
  priority?: EventPriority;
  delay?: number;
  retries?: number;
  retryDelay?: number;
  ttl?: number;
  deduplicationKey?: string;
  partitionKey?: string;
}

// Event schemas for validation
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  timestamp: z.date(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
  metadata: z.record(z.any())
});

export const CardEventSchema = BaseEventSchema.extend({
  aggregateId: z.string().uuid(),
  aggregateName: z.literal('card'),
  payload: z.record(z.any())
});

export const TransactionEventSchema = BaseEventSchema.extend({
  transactionId: z.string().uuid(),
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  aggregateName: z.literal('transaction'),
  payload: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    merchantId: z.string(),
    type: z.enum(['purchase', 'refund', 'authorization', 'capture']),
    status: z.enum(['pending', 'completed', 'failed', 'reversed'])
  }).passthrough()
});

// Constants
export const EVENT_CHANNELS = {
  CARD: 'events:card',
  USER: 'events:user',
  TRANSACTION: 'events:transaction',
  NOTIFICATION: 'events:notification',
  SYSTEM: 'events:system',
  DEAD_LETTER: 'events:dead-letter'
} as const;

export const EVENT_TYPES = {
  // Card events
  CARD_CREATED: 'card.created',
  CARD_ACTIVATED: 'card.activated',
  CARD_SUSPENDED: 'card.suspended',
  CARD_CLOSED: 'card.closed',
  CARD_UPDATED: 'card.updated',
  CARD_LIMIT_CHANGED: 'card.limit.changed',
  
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_VERIFIED: 'user.verified',
  USER_SUSPENDED: 'user.suspended',
  USER_DELETED: 'user.deleted',
  
  // Transaction events
  TRANSACTION_INITIATED: 'transaction.initiated',
  TRANSACTION_AUTHORIZED: 'transaction.authorized',
  TRANSACTION_CAPTURED: 'transaction.captured',
  TRANSACTION_DECLINED: 'transaction.declined',
  TRANSACTION_REVERSED: 'transaction.reversed',
  TRANSACTION_SETTLED: 'transaction.settled',
  
  // Notification events
  NOTIFICATION_QUEUED: 'notification.queued',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  
  // System events
  SYSTEM_HEALTH_CHECK: 'system.health.check',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_MAINTENANCE: 'system.maintenance'
} as const;

export const DEFAULT_PUBLISHER_OPTIONS: EventPublisherOptions = {
  priority: EventPriority.MEDIUM,
  retries: 3,
  retryDelay: 1000,
  ttl: 86400000, // 24 hours
  timeout: 5000
};

export const PUBLISHER_METRICS = {
  EVENTS_PUBLISHED: 'publisher.events.published',
  EVENTS_FAILED: 'publisher.events.failed',
  PUBLISH_DURATION: 'publisher.publish.duration',
  RETRY_ATTEMPTS: 'publisher.retry.attempts',
  CIRCUIT_BREAKER_TRIPS: 'publisher.circuit_breaker.trips'
} as const;

// Decorators
export function Publishable(eventType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const event = {
        id: uuidv4(),
        type: eventType,
        timestamp: new Date(),
        version: '1.0.0',
        metadata: {
          source: `${target.constructor.name}.${propertyKey}`,
          publishedAt: new Date().toISOString()
        };
      
      const result = await originalMethod.apply(this, args);
      
      // Publish event after successful execution
      if (this.publisher) {
        await this.publisher.publish(event);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

export function RetryablePublish(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          }
      }
      
      throw lastError!;
    };
    
    return descriptor;
  };
}
```


Execution error
}
}
