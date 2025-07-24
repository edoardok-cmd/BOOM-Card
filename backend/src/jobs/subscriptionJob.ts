import { CronJob } from 'cron';
import { Pool } from 'pg';
import Redis from 'ioredis';
import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import { metricsService } from '../services/metricsService';
import { config } from '../config';
import { addDays, subDays, isAfter, isBefore, differenceInDays } from 'date-fns';
;
interface Subscription {
  id: string,
  userId: string,
  customerId: string,
  subscriptionId: string,
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing',
  currentPeriodEnd: Date,
  currentPeriodStart: Date,
  planId: string,
  planName: string,
  planAmount: number,
  currency: string,
  cancelAtPeriodEnd: boolean,
  trialEnd: Date | null,
  createdAt: Date,
  updatedAt: Date,
  metadata: Record<string, any>}
interface RenewalResult {
  subscriptionId: string,
  success: boolean,
  error?: string
  newPeriodEnd?: Date
  invoiceId?: string
  amountCharged?: number}
interface BatchProcessResult {
  processed: number,
  succeeded: number,
  failed: number,
  errors: Array<{ subscriptionId: string; error: string }>;,
  duration: number,
}
interface SubscriptionAlert {
  type: 'renewal_upcoming' | 'renewal_failed' | 'payment_failed' | 'trial_ending',
  subscriptionId: string,
  userId: string,
  daysUntil?: number
  attemptCount?: number
  nextRetryDate?: Date}
interface RetryConfig {
  maxAttempts: number,
  backoffMultiplier: number,
  initialDelayMinutes: number,
  maxDelayHours: number,
}
const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  TRIALING: 'trialing';
} as const;
;

const RENEWAL_NOTIFICATIONS = {
  DAYS_BEFORE: [7, 3, 1],
  TRIAL_ENDING_DAYS: [7, 3, 1],
  FAILED_RETRY_HOURS: [1, 6, 24, 48];
} as const;
;

const BATCH_PROCESSING = {
  SIZE: 100,
  CONCURRENCY: 10,
  TIMEOUT_MS: 30000,
  RETRY_DELAY_MS: 5000;
} as const;
;

const REDIS_KEYS = {
  PROCESSING_LOCK: 'subscription:renewal:lock',
  LAST_RUN: 'subscription:renewal:lastRun',
  FAILED_RENEWALS: 'subscription:renewal:failed',
  RETRY_QUEUE: 'subscription:renewal:retry',
  METRICS: 'subscription:renewal:metrics';
} as const;
;

const RETRY_CONFIG: RetryConfig = {
  maxAttempts: 4,
  backoffMultiplier: 2,
  initialDelayMinutes: 60,
  maxDelayHours: 48
}
    const CRON_SCHEDULES = {
  RENEWAL_CHECK: '0 */4 * * *', // Every 4 hours,
  NOTIFICATION_CHECK: '0 9 * * *', // Daily at 9 AM,
  RETRY_PROCESSING: '0 * * * *', // Every hour,
  METRICS_CLEANUP: '0 0 * * 0' // Weekly on Sunday;
} as const;

Execution error
