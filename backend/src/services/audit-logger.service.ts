import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AuditLog } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as geoip from 'geoip-lite';
import { Logger } from 'winston';
import { InjectLogger } from '../common/decorators/logger.decorator';

export enum AuditAction {
  // Authentication
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_REGISTER = 'USER_REGISTER',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
  USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',
  USER_2FA_ENABLE = 'USER_2FA_ENABLE',
  USER_2FA_DISABLE = 'USER_2FA_DISABLE',
  
  // Card Operations
  CARD_CREATE = 'CARD_CREATE',
  CARD_UPDATE = 'CARD_UPDATE',
  CARD_DELETE = 'CARD_DELETE',
  CARD_ACTIVATE = 'CARD_ACTIVATE',
  CARD_DEACTIVATE = 'CARD_DEACTIVATE',
  CARD_BLOCK = 'CARD_BLOCK',
  CARD_UNBLOCK = 'CARD_UNBLOCK',
  
  // Transactions
  TRANSACTION_CREATE = 'TRANSACTION_CREATE',
  TRANSACTION_APPROVE = 'TRANSACTION_APPROVE',
  TRANSACTION_REJECT = 'TRANSACTION_REJECT',
  TRANSACTION_REVERSE = 'TRANSACTION_REVERSE',
  
  // User Management
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  USER_PERMISSIONS_UPDATE = 'USER_PERMISSIONS_UPDATE',
  
  // System
  SYSTEM_SETTING_UPDATE = 'SYSTEM_SETTING_UPDATE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  BACKUP_CREATE = 'BACKUP_CREATE',
  BACKUP_RESTORE = 'BACKUP_RESTORE'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  action: AuditAction;
  severity: AuditSeverity;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  timestamp?: Date;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction | AuditAction[];
  severity?: AuditSeverity | AuditSeverity[];
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsBySeverity: Record<AuditSeverity, number>;
  logsByAction: Record<string, number>;
  uniqueUsers: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface AuditContext {
  user?: User;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  additionalData?: Record<string, any>;
}

interface AuditLogCacheEntry {
  logs: AuditLog[];
  timestamp: number;
  hash: string;
}

const AUDIT_LOG_CACHE_PREFIX = 'audit:cache:';
const AUDIT_LOG_STATS_PREFIX = 'audit:stats:';
const AUDIT_LOG_QUEUE_KEY = 'audit:queue';
const CACHE_TTL = 300; // 5 minutes
const BATCH_SIZE = 100;
const RETENTION_DAYS = 90;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

@Injectable()

Since there's no backend directory in the current AI automation platform, I'll generate Part 2 of the audit-logger.service.ts file for BOOM Card as a continuation of a typical Part 1 that would have included imports and type definitions.

export class AuditLoggerService {
  private readonly logger = new Logger('AuditLoggerService');
  private readonly auditQueue: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.initializeFlushInterval();
  }

  async onModuleInit() {
    await this.setupIndices();
    await this.restoreQueueFromRedis();
  }

  async onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushQueue();
  }

  private initializeFlushInterval() {
    const interval = this.configService.get<number>('audit.flushInterval', 5000);
    this.flushInterval = setInterval(() => {
      this.flushQueue().catch(err => 
        this.logger.error('Failed to flush audit queue', err)
      );
    }, interval);
  }

  private async setupIndices() {
    try {
      await this.auditLogModel.collection.createIndex({ timestamp: -1 });
      await this.auditLogModel.collection.createIndex({ userId: 1, timestamp: -1 });
      await this.auditLogModel.collection.createIndex({ action: 1, timestamp: -1 });
      await this.auditLogModel.collection.createIndex({ 'metadata.cardId': 1 });
      await this.auditLogModel.collection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days TTL
      );
    } catch (error) {
      this.logger.error('Failed to create indices', error);
    }

  async log(params: CreateAuditLogDto): Promise<void> {
    const event: AuditEvent = {
      ...params,
      timestamp: new Date(),
      eventId: uuidv4(),
    };

    this.auditQueue.push(event);
    
    // Store in Redis for persistence
    await this.storeInRedis(event);

    // Immediate flush for critical events
    if (params.severity === AuditSeverity.CRITICAL) {
      await this.flushQueue();
    }

  async logUserAction(
    userId: string,
    action: AuditAction,
    details: string,
    metadata?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.INFO,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      details,
      metadata,
      severity,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  async logCardOperation(
    userId: string,
    cardId: string,
    operation: string,
    details: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.CARD_OPERATION,
      details,
      metadata: {
        ...metadata,
        cardId,
        operation,
      },
      severity: AuditSeverity.INFO,
    });
  }

  async logSecurityEvent(
    userId: string | null,
    event: string,
    details: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId: userId || 'system',
      action: AuditAction.SECURITY_EVENT,
      details,
      metadata: {
        ...metadata,
        securityEvent: event,
      },
      severity: AuditSeverity.WARNING,
    });
  }

  async logSystemEvent(
    event: string,
    details: string,
    metadata?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.INFO,
  ): Promise<void> {
    await this.log({
      userId: 'system',
      action: AuditAction.SYSTEM_EVENT,
      details,
      metadata: {
        ...metadata,
        systemEvent: event,
      },
      severity,
    });
  }

  private async storeInRedis(event: AuditEvent): Promise<void> {
    try {
      const key = `audit:queue:${event.eventId}`;
      await this.redis.setex(
        key,
        300, // 5 minutes TTL
        JSON.stringify(event),
      );
    } catch (error) {
      this.logger.error('Failed to store event in Redis', error);
    }

  private async restoreQueueFromRedis(): Promise<void> {
    try {
      const keys = await this.redis.keys('audit:queue:*');
      if (keys.length === 0) return;

      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.get(key));
      const results = await pipeline.exec();

      if (!results) return;

      for (const [err, value] of results) {
        if (!err && value) {
          try {
            const event = JSON.parse(value as string);
            this.auditQueue.push(event);
          } catch (parseError) {
            this.logger.error('Failed to parse stored event', parseError);
          }
      }

      // Clean up restored keys
      if (keys.length > 0) {
        await this.redis.del(...keys);
      } catch (error) {
      this.logger.error('Failed to restore queue from Redis', error);
    }

  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.auditQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batchSize = this.configService.get<number>('audit.batchSize', 100);
    const events = this.auditQueue.splice(0, batchSize);

    try {
      const documents = events.map(event => ({
        userId: event.userId,
        action: event.action,
        details: event.details,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
        severity: event.severity,
      }));

      await this.auditLogModel.insertMany(documents, { ordered: false });

      // Clean up Redis keys for successfully saved events
      events.forEach(event => {
        pipeline.del(`audit:queue:${event.eventId}`);
      });
      await pipeline.exec();

    } catch (error) {
      this.logger.error('Failed to flush audit logs', error);
      // Re-queue failed events
      this.auditQueue.unshift(...events);
    } finally {
      this.isProcessing = false;
    }

  async query(filter: AuditLogFilterDto): Promise<PaginatedResult<AuditLog>> {
    const {
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = filter;

    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserActivity(
    userId: string,
    days: number = 30,
  ): Promise<UserActivitySummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.auditLogModel.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            action: '$action',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const summary = await this.auditLogModel.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      userId,
      period: { start: startDate, end: new Date() },
      dailyActivities: activities,
      actionSummary: summary,
      totalActions: summary.reduce((acc, curr) => acc + curr.count, 0),
    };
  }

  async getSecurityEvents(
    filter: SecurityEventFilterDto,
  ): Promise<SecurityEvent[]> {
    const { severity, limit = 100, includeResolved = false } = filter;

    const query: any = {
      action: AuditAction.SECURITY_EVENT,
    };

    if (severity) {
      query.severity = severity;
    }

    if (!includeResolved) {
      query['metadata.resolved'] = { $ne: true };
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async exportAuditLogs(
    filter: AuditLogFilterDto,)
    format: 'json' | 'csv' = 'json',
  ): Promise<Buffer> {
    const logs = await this.getAllLogs(filter);

    if (format === 'json') {
      return Buffer.from(JSON.stringify(logs, null, 2));
    }

    // CSV export
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Details',
      'IP Address',
      'User Agent',
      'Severity',
      'Metadata',
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.details,
      log.ipAddress || '',
      log.userAgent || '',
      log.severity,
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return Buffer.from(csvContent);
  }

  private async getAllLogs(filter: AuditLogFilterDto): Promise<AuditLog[]> {
    const query = this.buildQuery(filter);
    return this.auditLogModel.find(query).sort({ timestamp: -1 }).lean().exec();
  }

  private buildQuery(filter: AuditLogFilterDto): any {
    const query: any = {};

    if (filter.userId) {
      query.userId = filter.userId;
    }

    if (filter.action) {
      query.action = filter.action;
    }

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        query.timestamp.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.timestamp.$lte = new Date(filter.endDate);
      }

    return query;
  }

  async cleanup(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogModel.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} audit logs older than ${daysToKeep} days`,
    );

    return result.deletedCount;
  }

  async getMetrics(): Promise<AuditMetrics> {
    const [totalLogs, last24h, last7d, last30d] = await Promise.all([
      this.auditLogModel.estimatedDocumentCount(),
      this.getCountSince(1),
      this.getCountSince(7),
      this.getCountSince(30),
    ]);

    const actionBreakdown = await this.auditLogModel.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalLogs,
      logsLast24Hours: last24h,
      logsLast7Days: last7d,
      logsLast30Days: last30d,
      actionBreakdown,
      queueSize: this.auditQueue.length,
    };
  }

  private async getCountSince(days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.auditLogModel.countDocuments({
      timestamp: { $gte: since },
    });
  }

  /**
   * Helper function to create audit context
   */
  private createAuditContext(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): AuditContext {
    return {
      userId,
      action,
      timestamp: new Date(),
      metadata: metadata || {},
      sessionId: this.generateSessionId(),
      ipAddress: this.getClientIpAddress(),
      userAgent: this.getUserAgent()
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address (placeholder - implement based on your framework)
   */
  private getClientIpAddress(): string {
    // In a real implementation, extract from request context
    return '0.0.0.0';
  }

  /**
   * Get user agent (placeholder - implement based on your framework)
   */
  private getUserAgent(): string {
    // In a real implementation, extract from request headers
    return 'Unknown';
  }

  /**
   * Format audit entry for logging
   */
  private formatAuditEntry(entry: AuditLogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    });
  }

  /**
   * Validate audit configuration
   */
  private validateConfiguration(): void {
    if (!this.config.enabled) {
      throw new Error('Audit logging is disabled');
    }

    if (!this.config.storage.type) {
      throw new Error('Audit storage type not configured');
    }

    if (this.config.retention.enabled && this.config.retention.days <= 0) {
      throw new Error('Invalid retention period');
    }

  /**
   * Handle audit logging errors
   */
  private handleAuditError(error: Error, context: string): void {
    console.error(`Audit logging error in ${context}:`, error);
    
    // Increment error counter
    this.errorCounter++;
    
    // Check circuit breaker threshold
    if (this.errorCounter >= this.circuitBreakerThreshold) {
      this.circuitBreakerOpen = true;
      console.error('Audit logging circuit breaker opened due to excessive errors');
      
      // Schedule circuit breaker reset
      setTimeout(() => {
        this.circuitBreakerOpen = false;
        this.errorCounter = 0;
        console.info('Audit logging circuit breaker reset');
      }, 60000); // Reset after 1 minute
    }

  /**
   * Batch processor for audit logs
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      await this.storageAdapter.writeBatch(batch);
    } catch (error) {
      this.handleAuditError(error as Error, 'processBatch');
      // Re-queue failed entries
      this.batchQueue.unshift(...batch);
    }

  /**
   * Schedule batch processing
   */
  private scheduleBatchProcessing(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      this.processBatch().catch(error => {
        this.handleAuditError(error, 'scheduledBatchProcessing');
      });
    }, this.config.batchSize * 1000);
  }

  /**
   * Check if action should be logged based on filters
   */
  private shouldLogAction(action: string): boolean {
    if (this.config.filters.excludeActions.includes(action)) {
      return false;
    }

    if (this.config.filters.includeActions.length > 0) {
      return this.config.filters.includeActions.includes(action);
    }

    return true;
  }

  /**
   * Sanitize sensitive data from metadata
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    const sensitiveFields = this.config.filters.sensitiveFields;

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }

    return sanitized;
  }

  /**
   * Get storage adapter instance
   */
  getStorageAdapter(): AuditStorageAdapter {
    return this.storageAdapter;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): AuditConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfiguration();
    
    if (config.batchSize) {
      this.scheduleBatchProcessing();
    }

  /**
   * Get audit statistics
   */
  async getStatistics(): Promise<AuditStatistics> {
    try {
      const totalEntries = await this.storageAdapter.count();
      const oldestEntry = await this.storageAdapter.getOldestEntry();
      const newestEntry = await this.storageAdapter.getNewestEntry();

      return {
        totalEntries,
        oldestEntry: oldestEntry?.timestamp,
        newestEntry: newestEntry?.timestamp,
        errorCount: this.errorCounter,
        circuitBreakerOpen: this.circuitBreakerOpen,
        batchQueueSize: this.batchQueue.length
      };
    } catch (error) {
      this.handleAuditError(error as Error, 'getStatistics');
      throw error;
    }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Process any remaining batch
    await this.processBatch();

    // Clear timers
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    if (this.retentionTimer) {
      clearInterval(this.retentionTimer);
    }

    // Cleanup storage adapter
    if (this.storageAdapter.cleanup) {
      await this.storageAdapter.cleanup();
    }
}

// Export types and interfaces
export type {
  AuditLogEntry,
  AuditConfig,
  AuditContext,
  AuditFilter,
  AuditQuery,
  AuditStorageAdapter,
  AuditStatistics
};

// Export the service
export { AuditLoggerService };

// Create and export singleton instance
export const auditLogger = new AuditLoggerService();

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
