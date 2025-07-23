// 1. All import statements
import { DataSource, DeleteResult, LessThan, IsNull } from 'typeorm';
import { AppDataSource } from '../data-source'; // Assuming data-source.ts configures TypeORM
import { Logger } from '../utils/logger'; // Assuming a custom logger utility
import { Config } from '../config'; // Assuming a configuration service/module
import {
  User,
  Cart,
  PasswordResetToken,
  Order, // Example entity for cleanup
  PaymentAttempt, // Example entity for cleanup
} from '../entity'; // Assuming TypeORM entities are in an 'entity' directory

// For date manipulation
import { subDays, subHours } from 'date-fns';

// 2. All TypeScript interfaces and types

/**
 * Defines the configuration parameters for various cleanup tasks.
 * These values are typically loaded from environment variables or a configuration file.
 */
interface ICleanupConfig {
  /** Number of days after which inactive or abandoned carts are considered stale. */
  staleCartDays: number;
  /** Number of hours after which password reset tokens expire. */
  expiredPasswordResetHours: number;
  /** Number of days after which unverified user accounts are subject to deletion. */
  unverifiedUserDays: number;
  /** Number of hours after which orders in specific non-final states (e.g., 'draft', 'pending') are considered abandoned. */
  abandonedOrderHours: number;
  /** Number of hours after which failed or pending payment attempts are considered expired. */
  expiredPaymentAttemptHours: number;
  /** Number of days after which soft-deleted (e.g., marked 'isDeleted: true') user accounts are permanently purged. */
  purgedSoftDeletedUserDays: number;
  // Add other cleanup thresholds as needed for different entity types or scenarios
}

/**
 * Enum to categorize different types of cleanup tasks.
 * Useful for logging, metrics, or selectively running tasks.
 */
enum CleanupTaskType {
  StaleCarts = 'StaleCarts',
  ExpiredPasswordResets = 'ExpiredPasswordResets',
  UnverifiedUsers = 'UnverifiedUsers',
  AbandonedOrders = 'AbandonedOrders',
  ExpiredPaymentAttempts = 'ExpiredPaymentAttempts',
  PurgedSoftDeletedUsers = 'PurgedSoftDeletedUsers',
}

/**
 * Represents the outcome of a single cleanup operation.
 */
interface ICleanupResult {
  /** The type of cleanup task performed. */
  task: CleanupTaskType;
  /** The number of records successfully deleted or processed. */
  recordsAffected: number;
  /** Indicates whether the operation was successful. */
  success: boolean;
  /** An optional error message if the operation failed. */
  error?: string;
}

// 3. All constants and configuration

// Initialize a logger instance specifically for the cleanup worker.
const logger = new Logger('CleanupWorker');

// Load cleanup specific configurations from the centralized Config service.
// Default values are provided if environment variables are not set.
const CLEANUP_CONFIG: ICleanupConfig = {
  staleCartDays: Config.get('CLEANUP_STALE_CART_DAYS', 30),
  expiredPasswordResetHours: Config.get('CLEANUP_EXPIRED_PASSWORD_RESET_HOURS', 24),
  unverifiedUserDays: Config.get('CLEANUP_UNVERIFIED_USER_DAYS', 7),
  abandonedOrderHours: Config.get('CLEANUP_ABANDONED_ORDER_HOURS', 48),
  expiredPaymentAttemptHours: Config.get('CLEANUP_EXPIRED_PAYMENT_ATTEMPT_HOURS', 2),
  purgedSoftDeletedUserDays: Config.get('CLEANUP_PURGE_SOFT_DELETED_USER_DAYS', 90),
};

// Optional: Define how frequently this worker should attempt to run its cleanup tasks.
// In a production setup, this worker might be invoked by a scheduler (e.g., Kubernetes CronJob, OS cron, BullMQ/Agenda queue).
// This constant is primarily useful if the worker is designed to run in a continuous loop within a single process.
const WORKER_RUN_INTERVAL_MS = Config.get('CLEANUP_WORKER_INTERVAL_MS', 24 * 60 * 60 * 1000); // Default: Run once every 24 hours

// 4. Any decorators or metadata
// This worker file is designed as a standalone Node.js script.
// As such, it does not typically use decorators unless integrated into a specific framework
// (e.g., NestJS's @Injectable() or custom worker decorators), which is not indicated for this file.
// Therefore, no decorators or metadata are included in this part.

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

const prisma = new PrismaClient();

/**
 * Main function to perform various data cleanup tasks for the BOOM Card application.
 * This worker identifies and removes expired tokens, orphaned records (e.g., cards without decks, decks without users),
 * and old log entries to maintain database health and performance.
 */
export async function runCleanupWorker() {
  logger.info('Starting BOOM Card data cleanup worker...');
  let totalRecordsDeleted = 0;
  const errors: string[] = [];
  const now = new Date();

  try {
    // --- 1. Cleanup expired authentication/verification tokens ---
    logger.info('Cleaning up expired tokens...');

    // Password Reset Tokens
    try {
      const deletedResetTokens = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: now, // Delete tokens where expiresAt is less than current time
          },
        },
      });
      totalRecordsDeleted += deletedResetTokens.count;
      logger.info(`Deleted ${deletedResetTokens.count} expired password reset tokens.`);
    } catch (error: any) {
      const msg = `Error cleaning up password reset tokens: ${error.message}`;
      logger.error(msg, error);
      errors.push(msg);
    }

    // Email Verification Tokens
    try {
      const deletedVerificationTokens = await prisma.emailVerificationToken.deleteMany({
        where: {
          expiresAt: {
            lt: now, // Delete tokens where expiresAt is less than current time
          },
        },
      });
      totalRecordsDeleted += deletedVerificationTokens.count;
      logger.info(`Deleted ${deletedVerificationTokens.count} expired email verification tokens.`);
    } catch (error: any) {
      logger.error(msg, error);
      errors.push(msg);
    }

    // --- 2. Cleanup orphaned data records ---
    // Note: Prisma's `onDelete: Cascade` handles many cases where a parent record deletion
    // automatically deletes child records. This section specifically targets records
    // that might become "orphaned" due to data inconsistencies or manual deletions
    // where cascades were not configured or correctly triggered.
    // Order matters: cleanup children before parents if not cascading.

    // Orphaned Cards (cards whose `deckId` does not reference an existing `Deck`)
    logger.info('Cleaning up orphaned cards...');
    try {
      // Using raw query for robust check against non-existent foreign keys
      const deletedOrphanedCards = await prisma.$executeRaw`
        DELETE FROM "Card"
        WHERE "deckId" IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM "Deck" WHERE "id" = "Card"."deckId");
      `;
      totalRecordsDeleted += Number(deletedOrphanedCards); // Cast BigInt to Number
      logger.info(`Deleted ${deletedOrphanedCards} orphaned cards.`);
    } catch (error: any) {
      logger.error(msg, error);
      errors.push(msg);
    }

    // Orphaned Decks (decks whose `userId` does not reference an existing `User`)
    logger.info('Cleaning up orphaned decks...');
    try {
      const deletedOrphanedDecks = await prisma.$executeRaw`
        DELETE FROM "Deck"
        WHERE "userId" IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM "User" WHERE "id" = "Deck"."userId");
      `;
      totalRecordsDeleted += Number(deletedOrphanedDecks);
      logger.info(`Deleted ${deletedOrphanedDecks} orphaned decks.`);
    } catch (error: any) {
      logger.error(msg, error);
      errors.push(msg);
    }

    // --- 3. Cleanup old User Action Logs (based on retention policy) ---
    if (config.cleanup?.userActionLogRetentionDays) {
      logger.info('Cleaning up old user action logs...');
      try {
        const retentionDate = new Date();
        retentionDate.setDate(now.getDate() - config.cleanup.userActionLogRetentionDays);

        const deletedLogs = await prisma.userActionLog.deleteMany({
          where: {
            createdAt: {
              lt: retentionDate, // Delete logs older than the retention period
            },
          },
        });
        totalRecordsDeleted += deletedLogs.count;
        logger.info(`Deleted ${deletedLogs.count} old user action logs.`);
      } catch (error: any) {
        logger.error(msg, error);
        errors.push(msg);
      } else {
      logger.info('Skipping old user action log cleanup: retention period not configured (config.cleanup.userActionLogRetentionDays).');
    }

    logger.info(`Cleanup worker finished. Total records deleted: ${totalRecordsDeleted}.`);
    if (errors.length > 0) {
      logger.warn(`Cleanup worker completed with ${errors.length} errors. See logs for details.`);
      errors.forEach(err => logger.warn(`- ${err}`));
    } catch (error: any) {
    logger.error(msg, error);
    errors.push(msg);
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client connection is closed
    if (errors.length > 0) {
      // In a production setup with a job queue, you might signal job failure here.
      // For a standalone worker, logging is usually sufficient.
    }
}

// This block ensures the worker runs when the script is executed directly
if (require.main === module) {
  runCleanupWorker()
    .then(() => {
      logger.info('Cleanup worker process exited successfully.');
      process.exit(0); // Exit with success code
    })
    .catch((err) => {
      logger.error('Cleanup worker process exited with error:', err);
      process.exit(1); // Exit with error code
    });
}

}
}
}
