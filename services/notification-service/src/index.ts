import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Pool } from 'pg';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import webpush from 'web-push';
import * as amqp from 'amqplib';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import { z } from 'zod';
import { prometheus } from '@boomcard/shared-metrics';
import { TracingService } from '@boomcard/shared-tracing';
import { AuthMiddleware } from '@boomcard/shared-auth';
import { ErrorHandler } from '@boomcard/shared-errors';

dotenv.config();

// TypeScript Interfaces and Types
export interface NotificationConfig {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  template: string;
  data: Record<string, any>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  retryCount: number;
  maxRetries: number;
  status: NotificationStatus;
  metadata: NotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: EmailPreferences;
  sms: SMSPreferences;
  push: PushPreferences;
  inApp: InAppPreferences;
  doNotDisturb: DoNotDisturbSettings;
  updatedAt: Date;
}

export interface EmailPreferences {
  enabled: boolean;
  address: string;
  verified: boolean;
  categories: {
    transactions: boolean;
    marketing: boolean;
    security: boolean;
    updates: boolean;
    reminders: boolean;
  };
}

export interface SMSPreferences {
  enabled: boolean;
  phoneNumber: string;
  verified: boolean;
  categories: {
    transactions: boolean;
    security: boolean;
    reminders: boolean;
  };
}

export interface PushPreferences {
  enabled: boolean;
  tokens: PushToken[];
  categories: {
    transactions: boolean;
    security: boolean;
    updates: boolean;
    reminders: boolean;
  };
}

export interface PushToken {
  token: string;
  platform: 'web' | 'ios' | 'android';
  deviceId: string;
  active: boolean;
  createdAt: Date;
}

export interface InAppPreferences {
  enabled: boolean;
  showBadge: boolean;
  playSound: boolean;
}

export interface DoNotDisturbSettings {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  exceptions: NotificationType[];
}

export interface NotificationMetadata {
  campaignId?: string;
  transactionId?: string;
  orderId?: string;
  referenceId?: string;
  source: string;
  tags: string[];
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  error?: string;
  providerResponse?: Record<string, any>;
  attempts: number;
}

export interface NotificationEvent {
  id: string;
  notificationId: string;
  type: EventType;
  channel: NotificationChannel;
  timestamp: Date;
  data: Record<string, any>;
}

export interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration: number;
  keyPrefix: string;
}

export interface WebhookConfig {
  id: string;
  userId: string;
  url: string;
  events: EventType[];
  secret: string;
  active: boolean;
  retryConfig: RetryConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Enums and Type Unions
export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  MARKETING = 'marketing',
  UPDATE = 'update',
  REMINDER = 'reminder',
  ALERT = 'alert',
  SYSTEM = 'system'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained'
}

export enum EventType {
  CREATED = 'notification.created',
  QUEUED = 'notification.queued',
  SENT = 'notification.sent',
  DELIVERED = 'notification.delivered',
  OPENED = 'notification.opened',
  CLICKED = 'notification.clicked',
  FAILED = 'notification.failed',
  BOUNCED = 'notification.bounced',
  COMPLAINED = 'notification.complained',
  UNSUBSCRIBED = 'notification.unsubscribed'
}

// Constants and Configuration
const SERVICE_NAME = 'notification-service';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

const PORT = parseInt(process.env.PORT || '4003', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/boomcard';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@boomcard.com';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@boomcard.com';

const RATE_LIMIT_POINTS = parseInt(process.env.RATE_LIMIT_POINTS || '100', 10);
const RATE_LIMIT_DURATION = parseInt(process.env.RATE_LIMIT_DURATION || '60', 10);
const RATE_LIMIT_BLOCK_DURATION = parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '300', 10);

const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10);
const RETRY_INITIAL_DELAY = parseInt(process.env.RETRY_INITIAL_DELAY || '1000', 10);
const RETRY_MAX_DELAY = parseInt(process.env.RETRY_MAX_DELAY || '60000', 10);
const RETRY_BACKOFF_MULTIPLIER = parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2');

const NOTIFICATION_TTL = parseInt(process.env.NOTIFICATION_TTL || '86400', 10); // 24 hours
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100', 10);
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '10', 10);

const METRICS_PREFIX = 'boomcard_notification_';
const CACHE_PREFIX = 'notification:';
const QUEUE_PREFIX = 'queue:notification:';

// Validation Schemas
const notificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  template: z.string(),
  data: z.record(z.any()),
  priority: z.nativeEnum(NotificationPriority).optional().default(NotificationPriority.NORMAL),
  scheduledAt: z.date().optional(),
  expiresAt: z.date().optional(),
  metadata: z.object({
    campaignId: z.string().optional(),
    transactionId: z.string().optional(),
    orderId: z.string().optional(),
    referenceId: z.string().optional(),
    source: z.string(),
    tags: z.array(z.string()).optional().default([])
  }).optional()
});

const preferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    categories: z.object({
      transactions: z.boolean(),
      marketing: z.boolean(),
      security: z.boolean(),
      updates: z.boolean(),
      reminders: z.boolean()
    })
  }),
  sms: z.object({
    enabled: z.boolean(),
    categories: z.object({
      transactions: z.boolean(),
      security: z.boolean(),
      reminders: z.boolean()
    })
  }),
  push: z.object({
    enabled: z.boolean(),
    categories: z.object({
      transactions: z.boolean(),
      security: z.boolean(),
      updates: z.boolean(),
      reminders: z.boolean()
    })
  }),
  inApp: z.object({
    enabled: z.boolean(),
    showBadge: z.boolean(),
    playSound: z.boolean()
  }),
  doNotDisturb: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    timezone: z.string(),
    exceptions: z.array(z.nativeEnum(NotificationType))
  })
});

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.nativeEnum(EventType)),
  active: z.boolean().optional().default(true)
});
```


```typescript
class NotificationService {
  private app: express.Application;
  private server: http.Server | null = null;
  private io: SocketIOServer | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;
  private notificationQueue: NotificationJob[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(pinoHttp({
      logger,
      autoLogging: true,
      customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Send notification
    this.app.post('/api/notifications/send', authenticateJWT, async (req, res) => {
      try {
        const notification: NotificationRequest = req.body;
        
        // Validate request
        if (!notification.type || !notification.recipient || !notification.payload) {
          return res.status(400).json({ error: 'Invalid notification request' });
        }

        // Add to queue
        const job: NotificationJob = {
          id: crypto.randomUUID(),
          notification,
          status: 'pending',
          attempts: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.notificationQueue.push(job);
        this.processQueue();

        res.json({
          success: true,
          jobId: job.id,
          message: 'Notification queued successfully'
        });
      } catch (error) {
        logger.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
      });

    // Get notification status
    this.app.get('/api/notifications/:jobId/status', authenticateJWT, async (req, res) => {
      try {
        const { jobId } = req.params;
        const job = this.notificationQueue.find(j => j.id === jobId);

        if (!job) {
          return res.status(404).json({ error: 'Notification job not found' });
        }

        res.json({
          jobId: job.id,
          status: job.status,
          attempts: job.attempts,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          error: job.error
        });
      } catch (error) {
        logger.error('Error getting notification status:', error);
        res.status(500).json({ error: 'Failed to get notification status' });
      });

    // Webhook endpoints
    this.app.post('/webhooks/email/status', express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        const event = JSON.parse(req.body.toString());
        logger.info('Email webhook received:', event);
        
        // Process email status update
        await this.handleEmailStatusUpdate(event);
        
        res.sendStatus(200);
      } catch (error) {
        logger.error('Error processing email webhook:', error);
        res.sendStatus(400);
      });

    this.app.post('/webhooks/sms/status', express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        logger.info('SMS webhook received:', event);
        
        // Process SMS status update
        await this.handleSMSStatusUpdate(event);
        
        res.sendStatus(200);
      } catch (error) {
        logger.error('Error processing SMS webhook:', error);
        res.sendStatus(400);
      });
  }

  private async initializeServices(): Promise<void> {
    // Initialize Kafka
    const kafka = new Kafka({
      clientId: 'notification-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME ? {
        mechanism: 'plain',
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD || ''
      } : undefined
    });

    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: 'notification-service-group' });

    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'notifications', fromBeginning: false });

    // Initialize email transporter
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        });

      await this.emailTransporter.verify();
      logger.info('Email transporter initialized');
    }

    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      logger.info('Twilio client initialized');
    }

    // Initialize Socket.IO
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true
      });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info('Socket connected:', socket.id);

      socket.on('subscribe', (userId: string) => {
        socket.join(`user:${userId}`);
        logger.info(`Socket ${socket.id} subscribed to user:${userId}`);
      });

      socket.on('unsubscribe', (userId: string) => {
        socket.leave(`user:${userId}`);
        logger.info(`Socket ${socket.id} unsubscribed from user:${userId}`);
      });

      socket.on('disconnect', () => {
        logger.info('Socket disconnected:', socket.id);
      });
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.notificationQueue.length > 0) {
      if (!job) break;

      try {
        job.status = 'processing';
        job.updatedAt = new Date();

        await this.sendNotification(job);

        job.status = 'completed';
        job.updatedAt = new Date();

        // Remove completed jobs after 1 hour
        setTimeout(() => {
          const index = this.notificationQueue.indexOf(job);
          if (index > -1) {
            this.notificationQueue.splice(index, 1);
          }, 3600000);
      } catch (error) {
        logger.error(`Error processing notification job ${job.id}:`, error);
        
        job.attempts++;
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.updatedAt = new Date();

        if (job.attempts >= 3) {
          job.status = 'failed';
        } else {
          job.status = 'pending';
          // Retry after delay
          setTimeout(() => this.processQueue(), 5000 * job.attempts);
        }
    }

    this.isProcessing = false;
  }

  private async sendNotification(job: NotificationJob): Promise<void> {
    const { notification } = job;

    switch (notification.type) {
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'sms':
        await this.sendSMS(notification);
        break;
      case 'push':
        await this.sendPushNotification(notification);
        break;
      case 'in-app':
        await this.sendInAppNotification(notification);
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }

    // Send event to Kafka
    if (this.producer) {
      await this.producer.send({
        topic: 'notification-events',
        messages: [{
          key: job.id,
          value: JSON.stringify({
            jobId: job.id,
            type: notification.type,
            recipient: notification.recipient,
            status: 'sent',
            timestamp: new Date().toISOString()
          })
        }]
      });
    }

  private async sendEmail(notification: NotificationRequest): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    const { recipient, payload } = notification;
    const { subject, body, html, attachments } = payload;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM || 'noreply@boomcard.com',
      to: recipient,
      subject: subject || 'BOOM Card Notification',
      text: body,
      html: html || body,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType
      }))
    };

    const info = await this.emailTransporter.sendMail(mailOptions);
    logger.info('Email sent:', info.messageId);
  }

  private async sendSMS(notification: NotificationRequest): Promise<void> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not configured');
    }

    const { recipient, payload } = notification;
    const { body } = pa
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
}
