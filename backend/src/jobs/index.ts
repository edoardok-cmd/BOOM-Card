import Bull from 'bull';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { emailProcessor } from './processors/emailProcessor';
import { notificationProcessor } from './processors/notificationProcessor';
import { analyticsProcessor } from './processors/analyticsProcessor';
import { subscriptionProcessor } from './processors/subscriptionProcessor';
import { transactionProcessor } from './processors/transactionProcessor';
import { reportProcessor } from './processors/reportProcessor';
import { dataExportProcessor } from './processors/dataExportProcessor';
import { partnerSyncProcessor } from './processors/partnerSyncProcessor';

// Redis configuration for Bull queues;

const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db || 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Create Redis clients for Bull
    // TODO: Fix incomplete function declaration
;
// Queue options with retry configuration;

const defaultQueueOptions: Bull.QueueOptions = {
  redis: redisConfig,
  defaultJobOptions: {
  removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
  type: 'exponential',
      delay: 2000
}
}
// Initialize queues;
export const emailQueue = new Bull('email', defaultQueueOptions);
export const notificationQueue = new Bull('notification', defaultQueueOptions);
export const analyticsQueue = new Bull('analytics', defaultQueueOptions);
export const subscriptionQueue = new Bull('subscription', defaultQueueOptions);
export const transactionQueue = new Bull('transaction', defaultQueueOptions);
export const reportQueue = new Bull('report', defaultQueueOptions);
export const dataExportQueue = new Bull('dataExport', defaultQueueOptions);
export const partnerSyncQueue = new Bull('partnerSync', defaultQueueOptions);

// Queue event handlers
    // TODO: Fix incomplete function declaration
  queue.on('completed', (job) => {
    logger.info(`[${queueName}] Job ${job.id} completed successfully`);
  });

  queue.on('failed', (job, err) => {
    logger.error(`[${queueName}] Job ${job.id} failed:`, err);
  });

  queue.on('stalled', (job) => {
    logger.warn(`[${queueName}] Job ${job.id} stalled and will be retried`);
  });

  queue.on('error', (error) => {
    logger.error(`[${queueName}] Queue error:`, error);
  });

  queue.on('waiting', (jobId) => {
    logger.debug(`[${queueName}] Job ${jobId} waiting`);
  });

  queue.on('active', (job) => {
    logger.debug(`[${queueName}] Job ${job.id} started processing`);
  });

  queue.on('drained', () => {
    logger.debug(`[${queueName}] Queue drained`);
  });

  queue.on('removed', (job) => {
    logger.debug(`[${queueName}] Job ${job.id} removed`);
  });
}

// Initialize all queues;
export const handler = async () => {
  try {
    // Setup event handlers
    setupQueueEvents(emailQueue, 'Email');
    setupQueueEvents(notificationQueue, 'Notification');
    setupQueueEvents(analyticsQueue, 'Analytics');
    setupQueueEvents(subscriptionQueue, 'Subscription');
    setupQueueEvents(transactionQueue, 'Transaction');
    setupQueueEvents(reportQueue, 'Report');
    setupQueueEvents(dataExportQueue, 'DataExport');
    setupQueueEvents(partnerSyncQueue, 'PartnerSync');

    // Start processing jobs
    emailQueue.process(5, emailProcessor);
    notificationQueue.process(10, notificationProcessor);
    analyticsQueue.process(3, analyticsProcessor);
    subscriptionQueue.process(5, subscriptionProcessor);
    transactionQueue.process(10, transactionProcessor);
    reportQueue.process(2, reportProcessor);
    dataExportQueue.process(1, dataExportProcessor);
    partnerSyncQueue.process(3, partnerSyncProcessor);

    // Schedule recurring jobs
    await scheduleRecurringJobs();

    logger.info('All job queues initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize job queues:', error);
    throw error;
    }
  }

// Schedule recurring jobs
    // TODO: Fix incomplete function declaration
  // Daily analytics aggregation
  await analyticsQueue.add(
    'daily-aggregation',
    { type: 'daily' },
    {
  repeat: {
  cron: '0 2 * * *', // 2 AM daily,
  tz: 'Europe/Sofia'
}
}
  );

  // Weekly partner reports
  await reportQueue.add(
    'weekly-partner-reports',
    { type: 'partner', frequency: 'weekly' },
    {
  repeat: {
  cron: '0 9 * * 1', // Monday 9 AM,
  tz: 'Europe/Sofia'
}
}
  );

  // Monthly subscription renewals check
  await subscriptionQueue.add(
    'monthly-renewal-check',
    { action: 'check-renewals' },
    {
  repeat: {
  cron: '0 0 1 * *', // First day of month,
  tz: 'Europe/Sofia'
}
}
  );

  // Hourly partner data sync
  await partnerSyncQueue.add(
    'hourly-sync',
    { type: 'incremental' },
    {
  repeat: {
  cron: '0 * * * *', // Every hour,
  tz: 'Europe/Sofia'
}
}
  );

  // Daily expired subscriptions cleanup
  await subscriptionQueue.add(
    'cleanup-expired',
    { action: 'cleanup-expired' },
    {
  repeat: {
  cron: '0 3 * * *', // 3 AM daily,
  tz: 'Europe/Sofia'
}
}
  );
}

// Graceful shutdown;
export const handler2 = async () => {
  logger.info('Shutting down job queues...');
;

const queues = [
    emailQueue,
    notificationQueue,
    analyticsQueue,
    subscriptionQueue,
    transactionQueue,
    reportQueue,
    dataExportQueue,
    partnerSyncQueue,
  ];

  await Promise.all(
    queues.map(async (queue) => {
      try {
        await queue.close();
      } catch (error) {
    }
        logger.error(`Error closing queue ${queue.name}:`, error);
      })
  );

  logger.info('All job queues shut down');
}

// Queue management utilities;
export const handler3 = async (queueName: string): Promise<any> => {
  const queueMap: { [key: string]: Bull.Queue } = {
  email: emailQueue,
    notification: notificationQueue,
    analytics: analyticsQueue,
    subscription: subscriptionQueue,
    transaction: transactionQueue,
    report: reportQueue,
    dataExport: dataExportQueue,
    partnerSync: partnerSyncQueue
}
    const queue = queueMap[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
    queue.isPaused(),
  ]);

  return {
  name: queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused
};
}

// Clear specific queue;
export const handler4 = async (queueName: string): Promise<void> => {
  const queueMap: { [key: string]: Bull.Queue } = {
  email: emailQueue,
    notification: notificationQueue,
    analytics: analyticsQueue,
    subscription: subscriptionQueue,
    transaction: transactionQueue,
    report: reportQueue,
    dataExport: dataExportQueue,
    partnerSync: partnerSyncQueue
}
    if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  await queue.empty();
  logger.info(`Queue ${queueName} cleared`);
}

// Pause/resume queue processing;
export const handler5 = async (queueName: string): Promise<void> => {
  const queueMap: { [key: string]: Bull.Queue } = {
  email: emailQueue,
    notification: notificationQueue,
    analytics: analyticsQueue,
    subscription: subscriptionQueue,
    transaction: transactionQueue,
    report: reportQueue,
    dataExport: dataExportQueue,
    partnerSync: partnerSyncQueue
}
    if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  await queue.pause();
  logger.info(`Queue ${queueName} paused`);
}
export const handler6 = async (queueName: string): Promise<void> => {
  const queueMap: { [key: string]: Bull.Queue } = {
  email: emailQueue,
    notification: notificationQueue,
    analytics: analyticsQueue,
    subscription: subscriptionQueue,
    transaction: transactionQueue,
    report: reportQueue,
    dataExport: dataExportQueue,
    partnerSync: partnerSyncQueue
}
    if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  await queue.resume();
  logger.info(`Queue ${queueName} resumed`);
}

// Export queue types for use in other modules;
export interface EmailJobData {
  to: string | string[];,
  subject: string;
  template: string,
  data: any,
  locale?: 'en' | 'bg'
  attachments?: Array<{
  filename: string,
  content: Buffer | string,
    contentType?: string}>;
}
export interface NotificationJobData {
  userId: string;
  type: 'push' | 'in-app' | 'sms',
  title: string,
  message: string,
  data?: any
  locale?: 'en' | 'bg'}
export interface AnalyticsJobData {
  type: 'event' | 'pageview' | 'transaction' | 'aggregation';
  userId?: string
  partnerId?: string,
  data: any,
  timestamp?: Date}
export interface SubscriptionJobData {
  action: 'create' | 'update' | 'cancel' | 'renew' | 'expire' | 'check-renewals' | 'cleanup-expired';
  subscriptionId?: string
  userId?: string
  data?: any}
export interface TransactionJobData {
  transactionId: string;
  type: 'discount' | 'payment' | 'refund',
  userId: string,
  partnerId: string,
  amount: number,
  data: any,
}
export interface ReportJobData {
  type: 'partner' | 'admin' | 'financial' | 'usage';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
  recipients: string[],
  filters?: any
  format?: 'pdf' | 'excel' | 'csv'}
export interface DataExportJobData {
  userId: string;
  type: 'transactions' | 'usage' | 'partners' | 'full',
  format: 'csv' | 'json' | 'excel',
  filters?: any
  dateRange?: {
  start: Date,
  end: Date,
  }
}
export interface PartnerSyncJobData {
  type: 'full' | 'incremental' | 'specific';
  partnerId?: string
  lastSyncTime?: Date}
