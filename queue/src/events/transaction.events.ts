import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { NotificationService } from '../services/notification.service';
import { AnalyticsService } from '../services/analytics.service';
import { MetricsCollector } from '../utils/metrics';
import { i18n } from '../config/i18n';

export interface TransactionEventData {
  transactionId: string;
  userId: string;
  partnerId: string;
  partnerLocationId?: string;
  amount: number;
  discountAmount: number;
  discountPercentage: number;
  currency: string;
  paymentMethod?: string;
  qrCodeId: string;
  posTransactionId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface TransactionValidationData {
  qrCodeId: string;
  userId: string;
  partnerId: string;
  amount: number;
  posSystemId?: string;
}

export interface TransactionStatusUpdate {
  transactionId: string;
  status: TransactionStatus;
  reason?: string;
  updatedBy?: string;
  metadata?: Record<string, any>;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum TransactionEventType {
  TRANSACTION_INITIATED = 'transaction.initiated',
  TRANSACTION_VALIDATED = 'transaction.validated',
  TRANSACTION_PROCESSED = 'transaction.processed',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
  TRANSACTION_CANCELLED = 'transaction.cancelled',
  TRANSACTION_REFUNDED = 'transaction.refunded',
  TRANSACTION_DISPUTED = 'transaction.disputed',
  FRAUD_DETECTED = 'transaction.fraud_detected',
  LIMIT_EXCEEDED = 'transaction.limit_exceeded'
}

class TransactionEventEmitter extends EventEmitter {
  private notificationService: NotificationService;
  private analyticsService: AnalyticsService;
  private metricsCollector: MetricsCollector;

  constructor() {
    super();
    this.notificationService = new NotificationService();
    this.analyticsService = new AnalyticsService();
    this.metricsCollector = new MetricsCollector('transaction_events');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Transaction initiated
    this.on(TransactionEventType.TRANSACTION_INITIATED, async (data: TransactionEventData) => {
      try {
        logger.info('Transaction initiated', { transactionId: data.transactionId });
        
        // Store transaction in cache for quick validation
        await redis.setex(
          `transaction:${data.transactionId}`,
          300, // 5 minutes TTL
          JSON.stringify(data)
        );

        // Track metrics
        this.metricsCollector.increment('transactions.initiated');
        this.metricsCollector.histogram('transaction.amount', data.amount, {
          currency: data.currency,
          partnerId: data.partnerId
        });

        // Send real-time update to partner dashboard
        await this.notifyPartner(data.partnerId, {
          type: 'transaction.pending',
          data: {
            transactionId: data.transactionId,
            amount: data.amount,
            timestamp: data.timestamp
          });

      } catch (error) {
        logger.error('Error handling transaction initiated event', { error, data });
      });

    // Transaction validated
    this.on(TransactionEventType.TRANSACTION_VALIDATED, async (data: TransactionEventData) => {
      try {
        logger.info('Transaction validated', { transactionId: data.transactionId });
        
        // Update cache
        await redis.setex(
          `transaction:validated:${data.transactionId}`,
          3600, // 1 hour TTL
          JSON.stringify({ ...data, validatedAt: new Date() })
        );

        // Check for fraud patterns
        const fraudCheck = await this.checkFraudPatterns(data);
        if (fraudCheck.suspicious) {
          this.emit(TransactionEventType.FRAUD_DETECTED, {
            ...data,
            fraudScore: fraudCheck.score,
            fraudReasons: fraudCheck.reasons
          });
          return;
        }

        // Check transaction limits
        const limitsCheck = await this.checkTransactionLimits(data);
        if (!limitsCheck.allowed) {
          this.emit(TransactionEventType.LIMIT_EXCEEDED, {
            ...data,
            limitType: limitsCheck.limitType,
            currentUsage: limitsCheck.currentUsage,
            limit: limitsCheck.limit
          });
          return;
        }

        // Proceed with processing
        this.emit(TransactionEventType.TRANSACTION_PROCESSED, data);

      } catch (error) {
        logger.error('Error handling transaction validated event', { error, data });
        this.emit(TransactionEventType.TRANSACTION_FAILED, {
          ...data,
          failureReason: 'Validation error'
        });
      });

    // Transaction processed
    this.on(TransactionEventType.TRANSACTION_PROCESSED, async (data: TransactionEventData) => {
      try {
        logger.info('Processing transaction', { transactionId: data.transactionId });
        
        // Store transaction in database
        const transaction = await prisma.transaction.create({
          data: {
            id: data.transactionId,
            userId: data.userId,
            partnerId: data.partnerId,
            partnerLocationId: data.partnerLocationId,
            amount: data.amount,
            discountAmount: data.discountAmount,
            discountPercentage: data.discountPercentage,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
            qrCodeId: data.qrCodeId,
            posTransactionId: data.posTransactionId,
            status: TransactionStatus.PROCESSING,
            metadata: data.metadata,
            createdAt: data.timestamp
          });

        // Update user statistics
        await this.updateUserStatistics(data.userId, data);

        // Update partner statistics
        await this.updatePartnerStatistics(data.partnerId, data);

        // Send to analytics
        await this.analyticsService.trackTransaction(data);

        // Mark as completed
        this.emit(TransactionEventType.TRANSACTION_COMPLETED, {
          ...data,
          transactionRecord: transaction
        });

      } catch (error) {
        logger.error('Error processing transaction', { error, data });
        this.emit(TransactionEventType.TRANSACTION_FAILED, {
          ...data,
          failureReason: 'Processing error'
        });
      });

    // Transaction completed
    this.on(TransactionEventType.TRANSACTION_COMPLETED, async (data: TransactionEventData & { transactionRecord?: any }) => {
      try {
        logger.info('Transaction completed', { transactionId: data.transactionId });
        
        // Update transaction status
        await prisma.transaction.update({
          where: { id: data.transactionId },
          data: { 
            status: TransactionStatus.COMPLETED,
            completedAt: new Date()
          });

        // Clear cache
        await redis.del(`transaction:${data.transactionId}`);
        await redis.del(`transaction:validated:${data.transactionId}`);

        // Send notifications
        await this.sendTransactionNotifications(data);

        // Update metrics
        this.metricsCollector.increment('transactions.completed');
        this.metricsCollector.timing('transaction.processing_time', 
          Date.now() - data.timestamp.getTime()
        );

        // Trigger loyalty points calculation
        await this.calculateLoyaltyPoints(data);

        // Store in analytics warehouse
        await this.storeAnalyticsData(data);

      } catch (error) {
        logger.error('Error completing transaction', { error, data });
      });

    // Transaction failed
    this.on(TransactionEventType.TRANSACTION_FAILED, async (data: TransactionEventData & { failureReason?: string }) => {
      try {
        logger.error('Transaction failed', { 
          transactionId: data.transactionId,
          reason: data.failureReason 
        });
        
        // Update transaction status
        await prisma.transaction.update({
          where: { id: data.transactionId },
          data: { 
            status: TransactionStatus.FAILED,
            failureReason: data.failureReason,
            failedAt: new Date()
          });

        // Notify user and partner
        await this.notificationService.send({
          userId: data.userId,
          type: 'transaction_failed',
          title: i18n.t('notifications.transaction_failed.title'),
          message: i18n.t('notifications.transaction_failed.message', { 
            amount: data.amount,
            currency: data.currency 
          }),
          data: {
            transactionId: data.transactionId,
            reason: data.failureReason
          });

        // Update metrics
        this.metricsCollector.increment('transactions.failed', {
          reason: data.failureReason
        });

        // Clear cache
        await redis.del(`transaction:${data.transactionId}`);
        await redis.del(`transaction:validated:${data.transactionId}`);

      } catch (error) {
        logger.error('Error handling failed transaction', { error, data });
      });

    // Fraud detected
    this.on(TransactionEventType.FRAUD_DETECTED, async (data: any) => {
      try {
        logger.warn('Fraud detected in transaction', {
          transactionId: data.transactionId,
          fraudScore: data.fraudScore,
          reasons: data.fraudReasons
        });

        // Mark transaction as suspicious
        await prisma.transaction.update({
          where: { id: data.transactionId },
          data: {
            status: TransactionStatus
}}}}}}
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
