import { Worker, Job, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../../shared/utils/logger';
import { prisma } from '../../shared/prisma';
import { emailService } from '../../services/email.service';
import { smsService } from '../../services/sms.service';
import { notificationService } from '../../services/notification.service';
import { analyticsService } from '../../services/analytics.service';
import { partnerService } from '../../services/partner.service';
import { subscriptionService } from '../../services/subscription.service';
import { transactionService } from '../../services/transaction.service';
import { reportService } from '../../services/report.service';
import { config } from '../../config';

// Redis connection
const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Queue names
export enum QueueName {
  EMAIL = 'email',
  SMS = 'sms',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
  PARTNER_SYNC = 'partner-sync',
  SUBSCRIPTION = 'subscription',
  TRANSACTION = 'transaction',
  REPORT_GENERATION = 'report-generation',
  DATA_EXPORT = 'data-export',
  WEBHOOK = 'webhook',
}

// Job data interfaces
interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  locale?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface SmsJobData {
  to: string;
  message: string;
  locale?: string;
  type: 'transactional' | 'marketing';
}

interface NotificationJobData {
  userId: string;
  type: 'transaction' | 'subscription' | 'partner' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: Array<'push' | 'in-app' | 'email'>;
}

interface AnalyticsJobData {
  event: string;
  userId?: string;
  partnerId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface PartnerSyncJobData {
  partnerId: string;
  action: 'create' | 'update' | 'delete' | 'sync-pos';
  data?: Record<string, any>;
}

interface SubscriptionJobData {
  subscriptionId: string;
  action: 'activate' | 'renew' | 'expire' | 'cancel' | 'payment-failed';
  userId: string;
  data?: Record<string, any>;
}

interface TransactionJobData {
  transactionId: string;
  action: 'process' | 'validate' | 'reconcile';
  partnerId: string;
  userId: string;
  amount: number;
  discountAmount: number;
}

interface ReportJobData {
  reportType: 'partner' | 'consumer' | 'admin' | 'financial';
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  userId: string;
  locale: string;
}

interface WebhookJobData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

// Worker options
const workerOptions = {
  connection,
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

// Email Worker
export const emailWorker = new Worker<EmailJobData>(
  QueueName.EMAIL,
  async (job: Job<EmailJobData>) => {
    const { to, subject, template, data, locale = 'en', attachments } = job.data;
    
    try {
      logger.info(`Processing email job ${job.id}`, { to, subject, template });
      
      await emailService.send({
        to,
        subject,
        template,
        data,
        locale,
        attachments,
      });
      
      logger.info(`Email job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Email job ${job.id} failed`, error);
      throw error;
    },
  workerOptions
);

// SMS Worker
export const smsWorker = new Worker<SmsJobData>(
  QueueName.SMS,
  async (job: Job<SmsJobData>) => {
    const { to, message, locale = 'en', type } = job.data;
    
    try {
      logger.info(`Processing SMS job ${job.id}`, { to, type });
      
      await smsService.send({
        to,
        message,
        locale,
        type,
      });
      
      logger.info(`SMS job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`SMS job ${job.id} failed`, error);
      throw error;
    },
  workerOptions
);

// Notification Worker
export const notificationWorker = new Worker<NotificationJobData>(
  QueueName.NOTIFICATION,
  async (job: Job<NotificationJobData>) => {
    const { userId, type, title, message, data, channels } = job.data;
    
    try {
      logger.info(`Processing notification job ${job.id}`, { userId, type, channels });
      
      // Process each notification channel
      const promises = channels.map(channel => {
        switch (channel) {
          case 'push':
            return notificationService.sendPush(userId, { title, message, data });
          case 'in-app':
            return notificationService.sendInApp(userId, { type, title, message, data });
          case 'email':
            return emailService.send({
              to: userId, // Will be resolved to email in service
              subject: title,
              template: 'notification',
              data: { message, ...data },
            });
          default:
            return Promise.resolve();
        });
      
      await Promise.all(promises);
      
      logger.info(`Notification job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Notification job ${job.id} failed`, error);
      throw error;
    },
  workerOptions
);

// Analytics Worker
export const analyticsWorker = new Worker<AnalyticsJobData>(
  QueueName.ANALYTICS,
  async (job: Job<AnalyticsJobData>) => {
    const { event, userId, partnerId, data, timestamp } = job.data;
    
    try {
      logger.info(`Processing analytics job ${job.id}`, { event, userId, partnerId });
      
      await analyticsService.track({
        event,
        userId,
        partnerId,
        data,
        timestamp,
      });
      
      logger.info(`Analytics job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Analytics job ${job.id} failed`, error);
      throw error;
    },
  { ...workerOptions, concurrency: 10 } // Higher concurrency for analytics
);

// Partner Sync Worker
export const partnerSyncWorker = new Worker<PartnerSyncJobData>(
  QueueName.PARTNER_SYNC,
  async (job: Job<PartnerSyncJobData>) => {
    const { partnerId, action, data } = job.data;
    
    try {
      logger.info(`Processing partner sync job ${job.id}`, { partnerId, action });
      
      switch (action) {
        case 'create':
          await partnerService.createPartnerIntegration(partnerId, data);
          break;
        case 'update':
          await partnerService.updatePartnerIntegration(partnerId, data);
          break;
        case 'delete':
          await partnerService.deletePartnerIntegration(partnerId);
          break;
        case 'sync-pos':
          await partnerService.syncWithPOS(partnerId);
          break;
      }
      
      logger.info(`Partner sync job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Partner sync job ${job.id} failed`, error);
      throw error;
    },
  { ...workerOptions, concurrency: 3 } // Lower concurrency for partner operations
);

// Subscription Worker
export const subscriptionWorker = new Worker<SubscriptionJobData>(
  QueueName.SUBSCRIPTION,
  async (job: Job<SubscriptionJobData>) => {
    const { subscriptionId, action, userId, data } = job.data;
    
    try {
      logger.info(`Processing subscription job ${job.id}`, { subscriptionId, action });
      
      switch (action) {
        case 'activate':
          await subscriptionService.activate(subscriptionId);
          await notificationService.sendSubscriptionActivated(userId);
          break;
        case 'renew':
          await subscriptionService.renew(subscriptionId);
          await notificationService.sendSubscriptionRenewed(userId);
          break;
        case 'expire':
          await subscriptionService.expire(subscriptionId);
          await notificationService.sendSubscriptionExpired(userId);
          break;
        case 'cancel':
          await subscriptionService.cancel(subscriptionId);
          await notificationService.sendSubscriptionCancelled(userId);
          break;
        case 'payment-failed':
          await subscriptionService.handlePaymentFailure(subscriptionId);
          await notificationService.sendPaymentFailed(userId);
          break;
      }
      
      logger.info(`Subscription job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Subscription job ${job.id} failed`, error);
      throw error;
    },
  workerOptions
);

// Transaction Worker
export const transactionWorker = new Worker<TransactionJobData>(
  QueueName.TRANSACTION,
  async (job: Job<TransactionJobData>) => {
    const { transactionId, action, partnerId, userId, amount, discountAmount } = job.data;
    
    try {
      logger.info(`Processing transaction job ${job.id}`, { transactionId, action });
      
      switch (action) {
        case 'process':
          await transactionService.process(transactionId);
          await analyticsService.trackTransaction({
            transactionId,
            partnerId,
            userId,
            amount,
            discountAmount,
          });
          break;
        case 'validate':
          await transactionService.validate(transactionId);
          break;
        case 'reconcile':
          await transactionService.reconcile(transactionId);
          break;
      }
      
      logger.info(`Transaction job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Transaction job ${job.id} failed`, error);
      throw error;
    },
  workerOptions
);

// Report Generation Worker
export const reportWorker = new Worker<ReportJobData>(
  QueueName.REPORT_GENERATION,
  async (job: Job<ReportJobData>) => {
    const { reportType, format, filters, userId, locale } = job.data;
    
    try {
      logger.info(`Processing report job ${job.id}`, { reportType, format, userId });
      
      // Generate report
      const report = await reportService.generate({
        type: reportType,)
        format,
        filters,
        locale,
      });
      
      // Send report via email
      await emailService.send({
        to: userId, // Will be resolved to email in service
        subject: `Your ${reportType} report is ready`,
        template: 'report-ready',
        data: { reportType, format },
        attachments: [{
          filename: `${reportType}-report.${format}`,
          content: report.buffer,
          contentType: report.contentType,
        }],
        locale,
      });
      
      logger.info(`Report job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Report job ${job.id} failed`, error);
      throw error;
    },
  { ...workerOptions, concurrency: 2 } // Lower concurrency for resource-intensive operations
);

// Webhook Worker
export const webhookWorker = new Worker<WebhookJobData>(
  QueueName.WEBHOOK,
  async (job: Job<WebhookJobData>) => {
    const { url, method, headers, body, retryCount = 0, maxRetries = 3 } = job.data;
    
    try {
      logger.info(`Processing webhook job ${job.id}`, { url, method, retryCount });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
      
      logger.info(`Webhook job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Webhook job ${job.id} failed`, error);
      
      // Retry logic
      if (retryCount < maxRetr
}}
}
}
}
}
}
}
}
}
}
