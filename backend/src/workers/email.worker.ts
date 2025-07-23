// 1. All import statements
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import nodemailer from 'nodemailer';
import { Config } from '../config'; // Assuming config is located in ../config
import { Logger } from '../utils/logger'; // Assuming logger is located in ../utils/logger

// 2. All TypeScript interfaces and types
/**
 * Interface for the data expected in an email job.
 */
export interface EmailJobData {
  to: string | string[];
  subject: string;
  templateName?: string; // Optional: Name of the email template to use (e.g., 'welcome', 'password_reset')
  templateData?: Record<string, any>; // Optional: Data to pass to the template for rendering
  html?: string; // Optional: Raw HTML content for the email, if not using a template
  text?: string; // Optional: Raw plain text content for the email, if not using a template
  from?: string; // Optional: Sender email address, defaults to application's configured sender
  replyTo?: string; // Optional: Reply-To email address
  attachments?: any[]; // Optional: Array of nodemailer-compatible attachments
}

/**
 * Type for the result of a successfully processed email job.
 */
export type EmailJobResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
};

// 3. All constants and configuration
export const EMAIL_QUEUE_NAME = 'emailQueue';
export const WORKER_CONCURRENCY = 5; // Number of concurrent email jobs this worker can process
export const RETRY_ATTEMPTS = 3; // Number of times to retry a failed email job
export const BACKOFF_DELAY_MS = 5000; // Delay in milliseconds between retries (e.g., 5 seconds)

// Initialize logger for the email worker
const logger = new Logger('EmailWorker');

// Configure Nodemailer transporter using SMTP settings from global config
// Ensure Config.email.smtp is correctly structured (e.g., { host, port, secure, auth: { user, pass } })
const transporter = nodemailer.createTransport(Config.email.smtp);

// Verify transporter connection on startup (optional, but good practice)
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Nodemailer transporter verification failed: ${error.message}`);
    // Consider adding more robust error handling or process exit if SMTP is critical
  } else {
    logger.info('Nodemailer transporter successfully configured and ready to send emails.');
  });

// 4. Any decorators or metadata
// No decorators or specific metadata are typically used directly in a BullMQ worker file.
// If any were needed for a specific framework integration, they would be defined here.

import { Worker, Job } from 'bullmq';
import { render } from '@react-email/render'; // Using @react-email for robust templating

// Assume these types and configurations are defined in Part 1 or a shared types file
import {
  EmailJobData,
  emailWorkerQueueName, // Name of the BullMQ queue for email jobs
  WelcomeEmailProps, // Props interface for WelcomeEmail template
  PasswordResetEmailProps, // Props interface for PasswordResetEmail template
  TransactionNotificationEmailProps, // Props interface for TransactionNotificationEmail template
  SupportTicketEmailProps, // Props interface for SupportTicketEmail template
} from './email.types';

// Assume these services/utilities are implemented elsewhere
import { emailService } from '../services/email.service'; // Service to interact with the email provider (e.g., SendGrid, SES)
import { logger } from '../utils/logger'; // Centralized logging utility
import { emailQueue } from '../config/queue.config'; // BullMQ queue instance for email jobs

// --- Email Template Components ---
// These are hypothetical React components for emails, usually located in a separate directory like `src/emails/`
// and designed using `@react-email`.
import WelcomeEmail from '../emails/WelcomeEmail';
import PasswordResetEmail from '../emails/PasswordResetEmail';
import TransactionNotificationEmail from '../emails/TransactionNotificationEmail';
import SupportTicketEmail from '../emails/SupportTicketEmail';

/**
 * --- Main Class/Function Implementations & Core Business Logic ---
 *
 * This function is the core processor for each email job consumed by the worker.
 * It determines the email template based on the job type, renders it, and then
 * calls the email service to send the email.
 */
const processEmailJob = async (job: Job<EmailJobData>): Promise<void> => {
  const { type, data, to, subject, from } = job.data;
  const jobId = job.id;

  logger.info(`[EmailWorker] Processing job ${jobId} (Type: '${type}') for recipient '${to}'`);

  try {
    let emailHtml: string;
    let emailText: string | undefined; // Optional: Plain text version for better deliverability

    // --- Core Business Logic: Email Templating and Content Generation ---
    // This switch-case handles different email types and maps them to their
    // respective React email components and data props.
    switch (type) {
      case 'welcome':
        // Ensure data matches the expected props interface for WelcomeEmail
        emailHtml = render(WelcomeEmail(data as WelcomeEmailProps));
        // emailText = render(WelcomeEmail(data as WelcomeEmailProps), { plainText: true }); // Example: generate plain text
        break;
      case 'passwordReset':
        emailHtml = render(PasswordResetEmail(data as PasswordResetEmailProps));
        break;
      case 'transactionNotification':
        emailHtml = render(TransactionNotificationEmail(data as TransactionNotificationEmailProps));
        break;
      case 'supportTicket':
        emailHtml = render(SupportTicketEmail(data as SupportTicketEmailProps));
        break;
      // Add more cases here for new email types as the application grows
      default:
        logger.error(`[EmailWorker] Unrecognized email type '${type}' for job ${jobId}.`);
        throw new Error(`Unrecognized email type: ${type}`);
    }

    // --- Send Email via Email Service ---
    // The `emailService` abstracts the actual interaction with an external
    // email provider (e.g., SendGrid, Mailgun, AWS SES, Nodemailer).
    await emailService.sendEmail({
      to,
      subject,
      html: emailHtml,
      text: emailText, // Pass plain text if generated
      from: from || process.env.DEFAULT_EMAIL_SENDER || 'noreply@boomcard.com', // Use job-specific from or default
    });

    logger.info(`[EmailWorker] Successfully completed job ${jobId} (Type: '${type}') for recipient '${to}'. Email sent.`);
  } catch (error) {
    logger.error(
      `[EmailWorker] Failed to process job ${jobId} (Type: '${type}') for recipient '${to}':`,
      error instanceof Error ? error.message : String(error)
    );
    // Re-throw the error to ensure BullMQ marks the job as failed and can handle retries
    throw error;
  };

/**
 * --- Main Worker Instance ---
 *
 * Instantiates the BullMQ worker. This worker listens to the `emailWorkerQueueName`
 * and processes jobs using the `processEmailJob` function.
 */
const emailWorker = new Worker<EmailJobData>(
  emailWorkerQueueName, // The name of the queue this worker will consume from
  processEmailJob,      // The processor function for each job
  {
    connection: emailQueue.opts.connection, // Re-use the Redis connection from the queue configuration
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '5', 10), // Number of jobs to process concurrently
    // Job retention settings: useful for debugging and monitoring
    removeOnComplete: { count: 1000 }, // Keep the last 1000 completed jobs in Redis for inspection
    removeOnFail: { count: 5000 },     // Keep the last 5000 failed jobs for further analysis
    // You can also add custom backoff strategies here for retries
  }
);

/**
 * --- Worker Event Handlers (Analogous to Middleware for Worker Lifecycle) ---
 *
 * These handlers provide visibility into the worker's operation, acting like
 * lifecycle hooks or "middleware" for events occurring within the worker.
 */
emailWorker.on('ready', () => {
  logger.info(`[EmailWorker] Worker for queue '${emailWorkerQueueName}' is ready to accept jobs.`);
});

emailWorker.on('active', (job: Job<EmailJobData>) => {
  logger.debug(`[EmailWorker] Job ${job.id} (Type: '${job.data.type}') has become active.`);
});

emailWorker.on('completed', (job: Job<EmailJobData>) => {
  logger.info(`[EmailWorker] Job ${job.id} (Type: '${job.data.type}') successfully completed.`);
});

emailWorker.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
  if (job) {
    logger.error(
      `[EmailWorker] Job ${job.id} (Type: '${job.data.type}') failed after ${job.attemptsMade} attempts with error: ${err.message}`,
      err
    );
  } else {
    // This case indicates a failure not tied to a specific job (e.g., connection error)
    logger.error(`[EmailWorker] An unhandled error occurred in the worker: ${err.message}`, err);
  });

emailWorker.on('error', (err: Error) => {
  logger.error(`[EmailWorker] A global worker error occurred: ${err.message}`, err);
});

emailWorker.on('drained', () => {
  logger.info(`[EmailWorker] Queue '${emailWorkerQueueName}' is drained (no more jobs).`);
});

emailWorker.on('stalled', (jobId: string) => {
  logger.warn(`[EmailWorker] Job ${jobId} has stalled. Potential issue.`);
});

emailWorker.on('closed', () => {
  logger.warn(`[EmailWorker] Worker for queue '${emailWorkerQueueName}' has been gracefully closed.`);
});

/**
 * --- Graceful Shutdown ---
 *
 * Ensures the worker shuts down cleanly when the process receives termination signals.
 * This prevents data loss and ensures jobs are not left in an inconsistent state.
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`[EmailWorker] ${signal} received. Initiating graceful shutdown...`);
  try {
    await emailWorker.close(); // Close the worker, preventing new jobs and finishing current ones
    logger.info('[EmailWorker] Worker successfully closed. Exiting process.');
    process.exit(0);
  } catch (err) {
    logger.error('[EmailWorker] Error during worker shutdown:', err);
    process.exit(1); // Exit with an error code if shutdown fails
  };

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Note: This file is typically run as a separate Node.js process dedicated to email processing.
// It does not expose any "route handlers" as it's a worker, not an API server.

}
}
}
}
