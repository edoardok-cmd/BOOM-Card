import { Pool, QueryResult } from 'pg';
import Redis from 'ioredis';
import { Server as SocketIOServer } from 'socket.io';
import axios from 'axios';
import winston from 'winston';

import config from '../config/config';
import logger from '../utils/logger';

// --- Enums and Types ---

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationType {
  TRANSACTION_SUCCESS = 'transaction_success',
  TRANSACTION_FAILED = 'transaction_failed',
  ACCOUNT_UPDATE = 'account_update',
  SECURITY_ALERT = 'security_alert',
  PROMOTION = 'promotion',
  NEWS_UPDATE = 'news_update',
  REMINDER = 'reminder',
  PASSWORD_RESET = 'password_reset',
  BOOM_CARD_LOAD = 'boom_card_load',
  BOOM_CARD_REDEEM = 'boom_card_redeem',
  BOOM_CARD_DEACTIVATED = 'boom_card_deactivated',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SENT = 'payment_sent',
  ACCOUNT_LOCKED = 'account_locked',
  PASSWORD_CHANGE_SUCCESS = 'password_change_success',
  PROFILE_UPDATE = 'profile_update',
  KYC_REQUIRED = 'kyc_required',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
  UNREAD = 'unread',
}

// --- Interfaces ---

/**
 * Interface for a generic notification object.
 */
export interface INotification {
  id: string;
  user_id: string;
  type: NotificationType;
  channels: NotificationChannel[]; // Channels through which this notification was sent or intended
  title: string;
  body: string;
  data?: Record<string, any>; // Additional payload data (e.g., transaction ID, URL)
  status: NotificationStatus; // Overall status of the notification (e.g., pending, sent, failed)
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface for a notification preference setting for a user.
 */
export interface INotificationPreference {
  user_id: string;
  notification_type: NotificationType;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface for the payload sent to a push notification service (e.g., Firebase, Apple).
 */
export interface IPushNotificationPayload {
  to: string; // Device token
  notification: {
    title: string;
    body: string;
    sound?: string;
  };
  data?: Record<string, any>; // Custom data for the app
}

/**
 * Interface for a notification sent over WebSocket (Socket.IO).
 */
export interface ISocketNotificationPayload {
  notification_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: Date;
}

// --- Constants and Configuration ---

export const DEFAULT_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  NotificationChannel.IN_APP,
  NotificationChannel.EMAIL,
  NotificationChannel.PUSH,
];

export const REDIS_KEYS = {
  NOTIFICATION_QUEUE: 'notifications:queue',
  USER_NOTIFICATION_PREFERENCES: (userId: string) => `user:${userId}:notification_preferences`,
};

export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATE: 'notification:update',
  USER_DISCONNECT: 'disconnect',
};

// Default notification preferences for new users
export const DEFAULT_USER_NOTIFICATION_PREFERENCES: INotificationPreference[] = Object.values(NotificationType).map(type => ({
  user_id: '', // To be filled in
  notification_type: type,
  email_enabled: true,
  sms_enabled: true,
  push_enabled: true,
  in_app_enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
}));

// Placeholder for external push notification service API endpoint
export const PUSH_SERVICE_API_ENDPOINT: string = config.get('pushService.apiEndpoint');
export const PUSH_SERVICE_API_KEY: string = config.get('pushService.apiKey');

// --- Class Dependencies (will be injected in the constructor) ---

export interface INotificationServiceDependencies {
  pgPool: Pool;
  redisClient: Redis;
  io: SocketIOServer;
  logger: winston.Logger;
}

// backend/src/services/notification.service.ts - PART 2

// Assuming Part 1 contained necessary imports and type definitions like:
// import NotificationModel, { INotification, INotificationCreate, INotificationUpdate } from '../models/notification.model';
// import UserModel, { UserDocument } from '../models/user.model';
// import { sendEmail } from '../utils/emailSender'; // Utility function for sending emails
// import { sendPushNotification } from '../utils/pushNotificationSender'; // Utility function for sending push notifications
// import { ApiError } from '../utils/ApiError';
// import httpStatus from 'http-status';
// import mongoose from 'mongoose';

// interface ISendNotificationPayload {
//     recipientId: mongoose.Types.ObjectId;
//     type: 'transaction' | 'system' | 'promotion' | 'update' | 'security';
//     title: string;
//     message: string;
//     link?: string;
//     imageUrl?: string;
//     data?: Record<string, any>;
//     sendEmail?: boolean;
//     sendPush?: boolean;
//     emailSubject?: string;
//     emailBodyHtml?: string; // Full HTML content for email body
//     pushPayload?: { title?: string, body?: string, data?: Record<string, any> }; // Specific payload for push if different
// }

// End of Part 1 (hypothetical)

/**
 * Service class for managing notifications.
 * Handles creation, retrieval, status updates, and sending of notifications
 * via various channels (in-app, email, push).
 */
class NotificationService {
    /**
     * Creates a new in-app notification record in the database.
     * This method primarily handles the persistence of a notification.
     * Actual sending via external channels (email, push) is orchestrated by `sendNotification`.
     * @param payload The data for the new notification.
     * @returns The created notification document as a plain object.
     */
    public async createNotification(payload: INotificationCreate): Promise<INotification> {
        const notification = await NotificationModel.create(payload);
        return notification.toObject(); // Convert Mongoose document to plain object
    }

    /**
     * Retrieves notifications for a specific user with pagination and filtering capabilities.
     * @param userId The ID of the user whose notifications are to be retrieved.
     * @param query Query parameters for filtering (e.g., page, limit, read status, notification type).
     * @returns An object containing the list of notifications and the total count matching the criteria.
     */
    public async getUserNotifications(
        userId: mongoose.Types.ObjectId,
        query: { page?: number; limit?: number; read?: boolean; type?: string }
    ): Promise<{ notifications: INotification[]; total: number }> {
        const { page = 1, limit = 10, read, type } = query;
        const skip = (page - 1) * limit;

        const filter: any = { recipient: userId };
        if (typeof read === 'boolean') {
            filter.read = read;
        }
        if (type) {
            filter.type = type;
        }

        const notificationsPromise = NotificationModel.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit)
            .lean(); // Use .lean() for faster queries if no document modification is needed

        const totalPromise = NotificationModel.countDocuments(filter);

        const [notifications, total] = await Promise.all([notificationsPromise, totalPromise]);

        return { notifications, total };
    }

    /**
     * Marks a specific notification as read for a given user.
     * Ensures the notification belongs to the user for security and data integrity.
     * @param notificationId The ID of the notification to mark as read.
     * @param userId The ID of the user who owns the notification.
     * @returns The updated notification document (plain object).
     * @throws ApiError if the notification is not found or does not belong to the user.
     */
    public async markNotificationAsRead(
        notificationId: mongoose.Types.ObjectId,
        userId: mongoose.Types.ObjectId
    ): Promise<INotification> {
            { _id: notificationId, recipient: userId, read: false }, // Only update if unread
            { $set: { read: true, readAt: new Date() } },
            { new: true } // Return the updated document
        ).lean();

        if (!notification) {
            // Check if the notification exists and belongs to the user, even if already read
            const existingNotification = await NotificationModel.findById(notificationId).lean();
            if (!existingNotification || existingNotification.recipient.toString() !== userId.toString()) {
                 throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found or unauthorized access.');
            }
            // If it exists and belongs to the user but wasn't updated by findOneAndUpdate, it means it was already read.
            // In this case, just return the existing (already read) notification.
            if (existingNotification.read) {
                return existingNotification;
            }
            // Fallback for unexpected scenarios
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to mark notification as read.');
        }

        return notification;
    }

    /**
     * Marks all unread notifications for a specific user as read.
     * @param userId The ID of the user whose notifications are to be updated.
     */
    public async markAllNotificationsAsRead(userId: mongoose.Types.ObjectId): Promise<void> {
        await NotificationModel.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true, readAt: new Date() } }
        );
    }

    /**
     * Gets the count of unread notifications for a specific user.
     * @param userId The ID of the user.
     * @returns The number of unread notifications.
     */
    public async getUnreadNotificationCount(userId: mongoose.Types.ObjectId): Promise<number> {
        return NotificationModel.countDocuments({ recipient: userId, read: false });
    }

    /**
     * Orchestrates the creation of an in-app notification and its delivery via
     * various channels (email, push notifications) based on the provided payload
     * and recipient's preferences.
     * This is the primary method to call when you want to notify a user about an event.
     * @param payload The notification details, including recipient, content, and desired sending channels.
     * @returns The created in-app notification document (plain object).
     */
    public async sendNotification(payload: ISendNotificationPayload): Promise<INotification> {
        const { recipientId, type, title, message, link, imageUrl, data, sendEmail, sendPush, emailSubject, emailBodyHtml, pushPayload } = payload;

        // 1. Create the persistent in-app notification record in the database.
        const inAppNotification = await this.createNotification({
            recipient: recipientId,
            type,
            title,
            message,
            link,
            imageUrl,
            data,
            read: false, // Newly created notifications are unread by default;
        });

        // 2. Fetch recipient details to determine contact information and notification channel preferences.
        const recipientUser = await UserModel.findById(recipientId);

        if (!recipientUser) {
            console.warn(`Notification recipient user not found for ID: ${recipientId}. In-app notification created, but external sends skipped.`);
            return inAppNotification; // Still return the in-app notification even if external sends fail.
        }

        // 3. Attempt to send notifications via specified channels (if enabled and user data is available).

        // Send Email
        if (sendEmail && recipientUser.email) {
            try {
                // Use provided subject/body HTML or fall back to general title/message
                const subject = emailSubject || title;
                const body = emailBodyHtml || `<p>${message}</p>${link ? `<p><a href="${link}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Details</a></p>` : ''}`;
                await sendEmail(recipientUser.email, subject, body);
            } catch (error) {
                console.error(`Failed to send email notification to ${recipientUser.email} for user ${recipientId}:`, error);
                // Log the error but do not rethrow to allow other notification types to proceed.
            }

        // Send Push Notification
        if (sendPush && recipientUser.deviceTokens && recipientUser.deviceTokens.length > 0) {
            try {
                // Use provided push payload or fall back to general title/message
                const pushTitle = pushPayload?.title || title;
                const pushBody = pushPayload?.body || message;
                const pushData = pushPayload?.data || data; // Combine custom push data with general data
                await this._sendPush(recipientUser.deviceTokens, pushTitle, pushBody, pushData);
            } catch (error) {
                console.error(`Failed to send push notification to user ${recipientId}:`, error);
                // Log the error but do not rethrow.
            }

        return inAppNotification;
    }

    /**
     * Internal method to send push notifications to a list of device tokens.
     * This method abstracts the call to the external push notification utility.
     * @param deviceTokens An array of device tokens to which the push notification should be sent.
     * @param title The title of the push notification.
     * @param body The main message/body of the push notification.
     * @param data Optional additional data to be included in the push notification payload (e.g., for deep linking).
     */
    private async _sendPush(deviceTokens: string[], title: string, body: string, data?: Record<string, any>): Promise<void> {
        if (deviceTokens.length > 0) {
            // The `sendPushNotification` utility is expected to handle the specifics of
            // sending to multiple tokens via FCM, APNS, etc.
            await sendPushNotification(deviceTokens, { title, body, data });
        }
}

// Instantiate and export the NotificationService as a singleton.
export const notificationService = new NotificationService();

import Notification from '../models/notification.model'; // Adjust path based on your project structure
import User from '../models/user.model'; // Adjust path based on your project structure
import { logger } from '../utils/logger'; // Adjust path to your logger utility
import * as admin from 'firebase-admin'; // Firebase Admin SDK
import mailerService from '../third-party/mailer.service'; // Placeholder for your email sending service
import smsClient from '../third-party/sms.service'; // Placeholder for your SMS sending service
import { NotificationType, NotificationChannel, NotificationStatus } from '../utils/enums'; // Adjust path to your enums

// Ensure Firebase Admin SDK is initialized once
let firebaseApp: admin.app.App;
try {
  firebaseApp = admin.app(); // Try to get the default app if already initialized
} catch (error) {
  if ((error as any).code === 'app/no-app') {
    // If not initialized, initialize it.
    // In a real application, configuration (e.g., service account) would come from environment variables or a config file.
    // For local development or quick setup, you might directly provide credentials.
    firebaseApp = admin.initializeApp({
      // credential: admin.credential.applicationDefault(), // Use Google Cloud default credentials if deployed on GCP
      // Or, if using a service account JSON file:
      // credential: admin.credential.cert(require('../../path/to/your/serviceAccountKey.json')),
    });
    logger.info('Firebase Admin SDK initialized successfully.');
  } else {
    logger.error('Failed to initialize or retrieve Firebase Admin SDK:', error);
    // Depending on your application's tolerance, you might want to exit or throw.
    // For a service, it's better to log and let higher layers handle startup failures.
  }

/**
 * PART 3: Helper functions, error handling, and exports
 */

// --- Custom Error Handling ---
/**
 * Custom error class for Notification Service related errors.
 * Provides a clear way to distinguish service-specific failures.
 */
class NotificationServiceError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NotificationServiceError';
    // Capture stack trace, excluding the constructor call itself
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotificationServiceError);
    }
}

// --- Helper Functions (Private to the service or static if part of a class) ---

/**
 * Helper to format the notification message based on its type and associated data.
 * This function can be extended to support internationalization (i18n) or more complex templating engines.
 * @param type The type of notification (e.g., TRANSACTION_COMPLETED, NEW_OFFER).
 * @param data An object containing relevant data for the message content.
 * @returns An object with `title` and `body` strings for the notification.
 */
function _formatNotificationMessage(type: NotificationType, data: any): { title: string; body: string } {
  switch (type) {
    case NotificationType.TRANSACTION_COMPLETED:
      return {
        title: 'Transaction Successful!',
        body: `Your transaction of $${data.amount?.toFixed(2) || '0.00'} for ${data.description || 'a service'} was successfully processed.`,
      };
    case NotificationType.NEW_OFFER:
      return {
        title: 'Exclusive New Offer!',
        body: `Don't miss out! Check out our new offer: "${data.offerName || 'Special Deal'}" and get ${data.discount || 'up to 50'}% off!`,
      };
    case NotificationType.ACCOUNT_ALERT:
      return {
        title: 'Important Account Alert',
        body: `Action required or an important update regarding your account: ${data.message || 'Please log in to review.'}`,
      };
    case NotificationType.PASSWORD_RESET:
        return {
            title: 'Password Reset Request',
            body: `You requested a password reset. Your One-Time Password (OTP) is: ${data.otp}. This code is valid for 10 minutes.`,
        };
    case NotificationType.LOGIN_ATTEMPT:
        return {
            title: 'Login Attempt Notification',
            body: `A login attempt was made on your account from IP ${data.ip || 'an unknown location'} at ${new Date(data.timestamp).toLocaleString() || 'a recent time'}. If this was not you, please secure your account immediately.`,
        };
    case NotificationType.BOOM_CARD_UPDATE:
        return {
            title: 'BOOM Card Update',
            body: `Your BOOM Card balance has been updated. New balance: $${data.newBalance?.toFixed(2) || '0.00'}. ${data.message || ''}`,
        };
    case NotificationType.CUSTOM:
        return {
            title: data.title || 'Notification',
            body: data.body || 'You have a new notification from BOOM Card.',
        };
    default:
      logger.warn(`Unknown notification type received: ${type}. Using default message.`);
      return {
        title: 'BOOM Card Notification',
        body: 'You have a new notification from BOOM Card.',
      };
  }

/**
 * Helper to update the status of a notification record in the database.
 * Ensures a clear audit trail of notification delivery attempts.
 * @param notificationId The ID of the notification record to update.
 * @param status The new status to set (e.g., SENT, FAILED, PENDING).
 * @param details Optional additional details about the status (e.g., error messages).
 */
async function _updateNotificationStatus(
  notificationId: string,
  status: NotificationStatus,
  details?: string
): Promise<void> {
  try {
    // Assuming Notification is a Mongoose model or similar ORM
    await Notification.findByIdAndUpdate(notificationId, {
      status,
      details,
      sentAt: status === NotificationStatus.SENT ? new Date() : undefined,
    });
  } catch (error) {
    logger.error(`Failed to update notification status for ID ${notificationId}:`, error);
    // Throw a service-specific error to be caught by the main service logic
    throw new NotificationServiceError(`Failed to update notification status for ID ${notificationId}`, error as Error);
  }

// --- Main NotificationService Class ---
/**
 * The core Notification Service class responsible for managing and sending
 * various types of notifications across different channels.
 */
class NotificationService {
  private readonly notificationModel: typeof Notification;
  private readonly userModel: typeof User;
  private readonly logger: typeof logger;
  private readonly firebaseAdmin: admin.app.App;

  constructor(
    notificationModel: typeof Notification,
    userModel: typeof User,
    firebaseAdmin: admin.app.App,
    loggerInstance: typeof logger
  ) {
    this.notificationModel = notificationModel;
    this.userModel = userModel;
    this.firebaseAdmin = firebaseAdmin;
    this.logger = loggerInstance;
  }

  /**
   * Private method to send a push notification to a user via FCM.
   * This method assumes FCM tokens are stored in the User model.
   * @param userId The ID of the user to send the notification to.
   * @param title The title of the push notification.
   * @param body The body content of the push notification.
   * @param data Additional data payload for the push notification.
   */
  private async _sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<void> {
    this.logger.debug(`Attempting to send push notification to user ${userId}: "${title}" - "${body}"`);
    try {
      const user = await this.userModel.findById(userId).select('fcmTokens').lean();
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        this.logger.warn(`User ${userId} has no FCM tokens registered. Skipping push notification.`);
        return;
      }

      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        data: { ...data, notificationType: data.notificationType?.toString() || NotificationType.CUSTOM.toString() },
        tokens: user.fcmTokens.filter(token => typeof token === 'string' && token.trim() !== ''), // Filter out invalid tokens
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        android: {
            priority: 'high',
        };

      const response = await this.firebaseAdmin.messaging().sendMulticast(message);
      this.logger.info(`Push notification sent to user ${userId}. Successes: ${response.successCount}, Failures: ${response.failureCount}`);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const token = user.fcmTokens[idx];
            this.logger.error(`Failed to send push notification to token ${token}: ${resp.error?.message}`);
            // Log specific errors for debugging, and potentially remove invalid tokens from the user's record.
            if (resp.error?.code === 'messaging/invalid-argument' || resp.error?.code === 'messaging/registration-token-not-registered') {
              this.logger.warn(`FCM token ${token} for user ${userId} is invalid or expired. Consider removing.`);
              failedTokens.push(token);
            }
        });
        // In a production app, you'd have a mechanism to remove failedTokens from the user's document
        // e.g., await this.userModel.findByIdAndUpdate(userId, { $pullAll: { fcmTokens: failedTokens } });
        throw new Error(`Failed to send some push notifications to user ${userId}. See logs for details.`);
      } catch (error) {
      this.logger.error(`Error sending push notification to user ${userId}:`, error);
      throw new NotificationServiceError(`Push notification failed for user ${userId}`, error as Error);
    }

  /**
   * Private method to send an email notification to a user.
   * This method integrates with an external email sending service (e.g., SendGrid, Nodemailer).
   * @param userId The ID of the user to send the email to.
   * @param subject The subject line of the email.
   * @param bodyHtml The HTML content of the email body.
   * @param bodyText The plain text content of the email body (for fallback).
   */
  private async _sendEmailNotification(
    userId: string,
    subject: string,
    bodyHtml: string,
    bodyText: string
  ): Promise<void> {
    this.logger.debug(`Attempting to send email notification to user ${userId}: "${subject}"`);
    try {
      if (!user || !user.email) {
        this.logger.warn(`User ${userId} has no email address. Skipping email notification.`);
        return;
      }

      // 'mailerService' is a placeholder for your actual email sending client (e.g., Nodemailer, SendGrid client)
      const emailResponse = await mailerService.sendMail({
        to: user.email,
        subject,
        html: bodyHtml,
        text: bodyText,;
      });
      this.logger.info(`Email notification sent to ${user.email} (user ${userId}). Response: ${JSON.stringify(emailResponse)}`);
    } catch (error) {
      this.logger.error(`Error sending email notification to user ${userId}:`, error);
      throw new NotificationServiceError(`Email notification failed for user ${userId}`, error as Error);
    }

  /**
   * Private method to send an SMS notification to a user.
   * This method integrates with an external SMS sending service (e.g., Twilio).
   * @param userId The ID of the user to send the SMS to.
   * @param message The content of the SMS message.
   */
  private async _sendSMSNotification(
    userId: string,
    message: string
  ): Promise<void> {
    this.logger.debug(`Attempting to send SMS notification to user ${userId}: "${message}"`);
    try {
      if (!user || !user.phoneNumber) {
        this.logger.warn(`User ${userId} has no phone number. Skipping SMS notification.`);
        return;
      }

      // 'smsClient' is a placeholder for your actual SMS sending client (e.g., Twilio client)
      const smsResponse = await smsClient.sendMessage(user.phoneNumber, message);
      this.logger.info(`SMS notification sent to ${user.phoneNumber} (user ${userId}). Response: ${JSON.stringify(smsResponse)}`);
    } catch (error) {
      this.logger.error(`Error sending SMS notification to user ${userId}:`, error);
      throw new NotificationServiceError(`SMS notification failed for user ${userId}`, error as Error);
    }

  /**
   * Public method to orchestrate the sending of a notification.
   * It creates a notification record, attempts to send it through specified channels,
   * and updates the record's status and details based on the outcome.
   * @param userId The ID of the recipient user.
   * @param type The type of notification (used for formatting message and categorization).
   * @param data Optional data related to the notification content (e.g., amount for transaction).
   * @param channels An array of channels to attempt sending through. Defaults to PUSH and EMAIL.
   * @returns The ID of the created notification record in the database.
   * @throws NotificationServiceError if any part of the process fails critically or all specified channels fail.
   */
  public async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any> = {},
    channels: NotificationChannel[] = [NotificationChannel.PUSH, NotificationChannel.EMAIL]
  ): Promise<string> {
    const { title, body } = _formatNotificationMessage(type, data);
    let notificationId: string;
    let newNotificationRecord: any; // Type based on your Notification model

    try {
      // 1. Create a pending notification record in the database
      newNotificationRecord = await this.notificationModel.create({
        userId,
        type,
        title,
        body,
        data,
        channelsSent: [], // Will be updated as channels are successfully sent
        status: NotificationStatus.PENDING,
      });
      notificationId = newNotificationRecord._id.toString();
      this.logger.info(`Notification record created: ${notificationId} for user ${userId}, type ${type}`);

      let sentChannels: NotificationChannel[] = [];
      let failureDetails: string[] = [];
      let overallSuccess = false; // Will be true if at least one channel succeeds

      // 2. Attempt to send via specified channels
      if (channels.includes(NotificationChannel.PUSH)) {
        try {
          await this._sendPushNotification(userId, title, body, { ...data, notificationType: type });
          sentChannels.push(NotificationChannel.PUSH);
          overallSuccess = true;
          this.logger.info(`Push notification sent successfully for record ${notificationId}.`);
        } catch (error) {
          const errorMsg = `Push notification failed: ${(error as Error).message}`;
          this.logger.error(errorMsg);
          failureDetails.push(errorMsg);
        }

      if (channels.includes(NotificationChannel.EMAIL)) {
        try {
          // For email, you might want a richer HTML body
          const emailHtmlBody = `
            <html>
              <body>
                <h1>${title}</h1>
                <p>${body}</p>
                <p>Visit the BOOM Card app for more details.</p>
                <img src="https://example.com/boom_logo.png" alt="BOOM Card" style="max-width: 150px;"/>
              </body>
            </html>
          `;
          await this._sendEmailNotification(userId, title, emailHtmlBody, body);
          sentChannels.push(NotificationChannel.EMAIL);
          overallSuccess = true;
          this.logger.info(`Email notification sent successfully for record ${notificationId}.`);
        } catch (error) {
          this.logger.error(errorMsg);
          failureDetails.push(errorMsg);
        }

      if (channels.includes(NotificationChannel.SMS)) {
        try {
          await this._sendSMSNotification(userId, body); // SMS usually has simpler content, often just the body
          sentChannels.push(NotificationChannel.SMS);
          overallSuccess = true;
          this.logger.info(`SMS notification sent successfully for record ${notificationId}.`);
        } catch (error) {
          this.logger.error(errorMsg);
          failureDetails.push(errorMsg);
        }

      // 3. Update notification status in DB based on overall outcome
      const finalStatus = overallSuccess ? NotificationStatus.SENT : NotificationStatus.FAILED;
      await _updateNotificationStatus(notificationId, finalStatus, failureDetails.join('; '));

      // Update the `channelsSent` array for the notification record
      await this.notificationModel.findByIdAndUpdate(notificationId, { $set: { channelsSent: sentChannels } });

      if (!overallSuccess && channels.length > 0) {
        // If no channels were specified OR if all specified channels failed
        throw new NotificationServiceError(
          `All specified notification channels failed for notification ID ${notificationId}: ${failureDetails.join(', ')}`
        );
      }

      return notificationId; // Return the ID of the created and processed notification record
    } catch (error) {
      // If the initial record creation fails or `_updateNotificationStatus` fails,
      // or if all sending attempts fail and `overallSuccess` remains false.
      this.logger.error(`Critical failure in processing notification for user ${userId}, type ${type}:`, error);

      // Attempt a final update to FAILED if a record ID exists and is not already updated
      if (notificationId && newNotificationRecord?.status === NotificationStatus.PENDING) {
        try {
          await _updateNotificationStatus(notificationId, NotificationStatus.FAILED, `Critical error: ${(error as Error).message}`);
        } catch (updateError) {
          this.logger.error(`Double-fault: Also failed to update final status for ${notificationId}:`, updateError);
        }

      throw new NotificationServiceError(
        `Failed to send notification for user ${userId}, type ${type}`,
        error as Error
      );
    }
}

// --- Module Exports ---

// Instantiate the service with its dependencies
// Ensure `firebaseApp` is properly initialized before passing it.
const notificationService = new NotificationService(
  Notification,
  User,
  firebaseApp, // Pass the initialized Firebase Admin app instance
  logger
);

// Export the singleton instance of the NotificationService
export default notificationService;

// Also export the custom error class so other modules can specifically catch it
export { NotificationServiceError };

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
}
}
