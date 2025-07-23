// 1. All import statements
import { Worker, Job, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { env } from '../config/env'; // Assuming an environment configuration utility
import { logger } from '../utils/logger'; // Assuming a logging utility
import { AnalyticsService } from '../services/analytics.service'; // Assuming an analytics service for database interactions

// 2. All TypeScript interfaces and types

/**
 * Defines the type of analytics events that can be processed.
 */
export type AnalyticsEventType =
  | 'card_created'
  | 'transaction_completed'
  | 'user_registered'
  | 'login_successful'
  | 'login_failed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'account_updated'
  | 'balance_checked'
  | 'card_activated'
  | 'card_deactivated'
  | 'deposit_initiated'
  | 'withdrawal_initiated'
  | 'statement_generated'
  | 'support_ticket_created'
  | 'referral_link_generated'
  | 'app_opened'
  | 'page_view'
  | 'api_call';

/**
 * Interface for the raw data of an analytics event that is captured.
 */
export interface IAnalyticsEventData {
  userId?: string; // Optional, as some events might not be tied to a specific user (e.g., app_opened before login)
  timestamp: string; // ISO 8601 string (e.g., "2023-10-27T10:00:00.000Z")
  eventType: AnalyticsEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: { [key: string]: any }; // Flexible metadata for event-specific details
}

/**
 * Defines the names of the BullMQ jobs that this worker can process.
 */
export type AnalyticsJobName =
  | 'process_single_event' // For processing individual real-time events
  | 'aggregate_daily_stats' // For daily aggregation tasks (e.g., sum of transactions per day)
  | 'clean_old_data'; // For maintenance tasks like data retention

/**
 * Interface for the data payload of an analytics job processed by the worker.
 * The 'jobName' field acts as a discriminator for different payload types.
 */
export interface IAnalyticsJobData {
  jobName: AnalyticsJobName;
  payload:
    | IAnalyticsEventData // Used for 'process_single_event'
    | { date?: string } // Used for 'aggregate_daily_stats' (e.g., "YYYY-MM-DD")
    | { retentionDays?: number }; // Used for 'clean_old_data'
}

// 3. All constants and configuration

/**
 * The name of the BullMQ queue used for analytics processing jobs.
 */
export const ANALYTICS_QUEUE_NAME = 'boom-card-analytics-queue';

/**
 * Redis connection options for BullMQ, sourced from environment variables.
 */
export const REDIS_CONNECTION_OPTIONS = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB_ANALYTICS, // Dedicated Redis DB for analytics queues
};

/**
 * PostgreSQL connection options for the analytics database, sourced from environment variables.
 * These options are used to initialize the database connection pool.
 */
export const PG_CONNECTION_OPTIONS = {
  user: env.PG_USER,
  host: env.PG_HOST,
  database: env.PG_DATABASE,
  password: env.PG_PASSWORD,
  port: env.PG_PORT,
  max: env.PG_POOL_MAX_CONNECTIONS, // Maximum number of clients in the pool
  idleTimeoutMillis: env.PG_POOL_IDLE_TIMEOUT, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: env.PG_POOL_CONNECTION_TIMEOUT, // How long to wait for a connection to be established
};

/**
 * BullMQ Worker options, including the Redis connection and concurrency settings.
 */
export const WORKER_OPTIONS = {
  connection: new Redis(REDIS_CONNECTION_OPTIONS), // Reuse the Redis connection for the worker
  concurrency: env.ANALYTICS_WORKER_CONCURRENCY, // Number of jobs to process concurrently
};

// 4. Any decorators or metadata
// No specific decorators are typically used for a standalone BullMQ worker.

// Core business logic: Processes a single analytics event job received from the queue.
async function processAnalyticsEvent(jobData: AnalyticsJobData): Promise<void> {
    const { eventName, properties, userId, timestamp } = jobData.event;

    if (!eventName || !userId) {
        logger.warn(`[AnalyticsWorker] Job ${jobData.jobId || 'N/A'}: Missing required fields for analytics event. Event Name: '${eventName}', User ID: '${userId}'.`);
        throw new Error('Analytics event missing required fields: eventName or userId.');
    }

    try {
        logger.info(`[AnalyticsWorker] Processing event: '${eventName}' for user ID: '${userId}' (Job ID: ${jobData.jobId || 'N/A'})`);

        // Store the event in the database using Prisma.
        // This provides a durable record of all analytics events for later analysis.
        await prisma.analyticsEvent.create({
            data: {
                eventName,
                userId,
                // Ensure properties is stored as a JSON object, defaulting to an empty object if undefined.
                properties: properties || {},
                // Convert timestamp (e.g., Unix milliseconds from frontend) to a Date object,
                // or use the current time if no timestamp is provided.
                timestamp: timestamp ? new Date(timestamp) : new Date(),
                // Additional context from the job (e.g., IP address, device, session ID)
                // could be added here if included in AnalyticsJobData.
                // context: jobData.context || {}, 
            },
        });

        // --- Potential Future Enhancements ---
        // 1. Forward to a third-party analytics platform (e.g., Segment, Mixpanel, Google Analytics):
        //    Example: analyticsClient.track(eventName, { ...properties, userId });
        // 2. Update real-time dashboards or aggregate counters in Redis.
        // 3. Trigger specific business logic flows based on certain events (e.g., sending a welcome email).
        //    Note: For complex flows, consider a separate job queue or event bus.

        logger.info(`[AnalyticsWorker] Successfully processed event: '${eventName}' for user ID: '${userId}' (Job ID: ${jobData.jobId || 'N/A'})`);

    } catch (error) {
        logger.error(`[AnalyticsWorker] Failed to process event '${eventName}' for user ID '${userId}' (Job ID: ${jobData.jobId || 'N/A'}):`, error);
        // Re-throw the error to indicate job failure to BullMQ, allowing for retries or moving to the failed queue.
        throw error;
    }

// Main BullMQ Worker implementation.
// 'connection' and type definitions like 'AnalyticsJobData' are assumed to be available from Part 1.
const analyticsWorker = new Worker<AnalyticsJobData>(
    'analyticsQueue', // This name must exactly match the queue name used by the job producers.
    async job => {
        // The job.data contains the AnalyticsJobData payload sent by the producer.
        await processAnalyticsEvent(job.data);
    },
    {
        connection: connection, // Redis connection details provided from configuration (from Part 1).
        concurrency: 5, // Process up to 5 analytics jobs in parallel. Adjust based on resource availability.
        limiter: {
            max: 1000, // Maximum 1000 jobs processed per duration.
            duration: 1000, // ...per 1 second. Helps prevent overwhelming downstream services/DB.
        },
        // lockDuration: 30000, // Optional: Lock job for 30 seconds to prevent other workers from picking it up.
        // maxStalledCount: 3,  // Number of times a job can be stalled before being moved to failed.
    }
);

// Worker event listeners for robust logging and operational monitoring.
analyticsWorker.on('completed', job => {
    logger.info(`[AnalyticsWorker] Job ${job.id} completed. Event: '${job.data.event.eventName}'.`);
});

analyticsWorker.on('failed', (job, err) => {
    logger.error(`[AnalyticsWorker] Job ${job?.id} failed. Event: '${job?.data?.event?.eventName || 'N/A'}'. Error:`, err);
});

analyticsWorker.on('active', job => {
    logger.debug(`[AnalyticsWorker] Job ${job.id} is active. Event: '${job.data.event.eventName}'.`);
});

analyticsWorker.on('error', err => {
    logger.error(`[AnalyticsWorker] An internal worker error occurred:`, err);
});

analyticsWorker.on('closed', () => {
    logger.info('[AnalyticsWorker] Worker connection closed successfully.');
});

// Graceful shutdown handling to ensure ongoing jobs are completed before exiting.
process.on('SIGINT', async () => {
    logger.info('[AnalyticsWorker] SIGINT signal received. Shutting down worker...');
    await analyticsWorker.close();
    logger.info('[AnalyticsWorker] Worker shut down gracefully.');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('[AnalyticsWorker] SIGTERM signal received. Shutting down worker...');
    await analyticsWorker.close();
    logger.info('[AnalyticsWorker] Worker shut down gracefully.');
    process.exit(0);
});

// Log worker startup to indicate it's ready to process jobs.
logger.info('[AnalyticsWorker] Analytics Worker started and listening for jobs on "analyticsQueue"...');

}
