import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog } from '../entities/email-log.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { RedisService } from './redis.service';
import { MetricsService } from './metrics.service';
import { EncryptionService } from './encryption.service';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  template?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  priority?: 'high' | 'normal' | 'low';
  scheduledAt?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  encoding?: string;
  cid?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
  envelope: {
    from: string;
    to: string[];
  };
}

export interface EmailTemplateData {
  userName?: string;
  userEmail?: string;
  verificationLink?: string;
  resetPasswordLink?: string;
  transactionAmount?: number;
  transactionId?: string;
  transactionDate?: Date;
  cardNumber?: string;
  merchantName?: string;
  supportEmail?: string;
  companyName?: string;
  currentYear?: number;
  unsubscribeLink?: string;
  [key: string]: any;
}

export interface EmailProviderConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'mailgun';
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  apiKey?: string;
  domain?: string;
  region?: string;
}

export interface EmailQueueJob {
  id: string;
  options: EmailOptions;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export interface EmailMetrics {
  sent: number;
  failed: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  spamReports: number;
}

export interface EmailRateLimitConfig {
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  maxPerRecipientPerDay: number;
}

export interface EmailTrackingData {
  emailId: string;
  recipientEmail: string;
  opens: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    location?: string;
  }>;
  clicks: Array<{
    timestamp: Date;
    url: string;
    ipAddress: string;
    userAgent: string;
  }>;
}

export enum EmailStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  UNSUBSCRIBED = 'unsubscribed'
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  TRANSACTION_ALERT = 'transaction_alert',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  CARD_ACTIVATION = 'card_activation',
  CARD_BLOCKED = 'card_blocked',
  SECURITY_ALERT = 'security_alert',
  MONTHLY_STATEMENT = 'monthly_statement',
  REWARD_NOTIFICATION = 'reward_notification',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  PROMOTIONAL = 'promotional'
}

const EMAIL_QUEUE_NAME = 'email-queue';
const EMAIL_RATE_LIMIT_PREFIX = 'email:ratelimit:';
const EMAIL_TRACKING_PREFIX = 'email:tracking:';
const EMAIL_TEMPLATE_CACHE_PREFIX = 'email:template:';
const EMAIL_METRICS_PREFIX = 'email:metrics:';

const DEFAULT_RATE_LIMITS: EmailRateLimitConfig = {
  maxPerMinute: 100,
  maxPerHour: 1000,
  maxPerDay: 10000,
  maxPerRecipientPerDay: 50
};

const EMAIL_RETRY_DELAYS = [
  1000 * 60,      // 1 minute
  1000 * 60 * 5,  // 5 minutes
  1000 * 60 * 15, // 15 minutes
  1000 * 60 * 60  // 1 hour
];

const EMAIL_TEMPLATE_EXTENSIONS = ['.hbs', '.handlebars', '.html'];

const EMAIL_TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

@Injectable()

export class EmailSenderService {
  private transporter: Transporter;
  private rateLimiter: Map<string, EmailRateLimit>;
  private readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
  private readonly MAX_EMAILS_PER_HOUR = 100;
  private readonly MAX_EMAILS_PER_DAY = 1000;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly templateService: TemplateService,
    private readonly validationService: ValidationService,
    private readonly auditService: AuditService
  ) {
    this.rateLimiter = new Map();
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const config = emailConfig[process.env.NODE_ENV || 'development'];
    
    if (config.provider === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: config.sendgrid.apiUser,
          pass: config.sendgrid.apiKey
        });
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        });
    }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      // Validate email options
      const validation = await this.validationService.validateEmailRequest(options);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '));
      }

      // Check rate limits
      await this.checkRateLimit(options.from || emailConfig.defaultFrom);

      // Load and process template if specified
      let htmlContent = options.html;
      let textContent = options.text;

      if (options.templateId) {
        const template = await this.templateService.getTemplate(options.templateId);
        if (!template) {
          throw new Error(`Template ${options.templateId} not found`);
        }

        htmlContent = await this.templateService.renderTemplate(
          template.html,
          options.templateData || {}
        );
        textContent = await this.templateService.renderTemplate(
          template.text,
          options.templateData || {}
        );
      }

      // Prepare email message
      const message: Mail.Options = {
        from: options.from || emailConfig.defaultFrom,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: htmlContent,
        text: textContent,
        attachments: await this.processAttachments(options.attachments),
        headers: {
          'X-Entity-Ref-ID': crypto.randomUUID(),
          'X-Priority': options.priority || 'normal'
        };

      // Send email
      const info = await this.transporter.sendMail(message);

      // Save to database
      const emailRecord = await this.saveEmailRecord({
        messageId: info.messageId,
        from: message.from as string,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        status: EmailStatus.SENT,
        sentAt: new Date(),
        templateId: options.templateId,
        metadata: options.metadata
      });

      // Audit log
      await this.auditService.log({
        action: 'EMAIL_SENT',
        entityType: 'email',
        entityId: emailRecord.id,
        userId: options.metadata?.userId,
        details: {
          to: options.to,
          subject: options.subject,
          templateId: options.templateId
        });

      return {
        success: true,
        messageId: info.messageId,
        id: emailRecord.id,
        status: EmailStatus.SENT
      };

    } catch (error) {
      // Log error
      console.error('Email sending failed:', error);

      // Save failed attempt
      const failedRecord = await this.saveEmailRecord({
        from: options.from || emailConfig.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        status: EmailStatus.FAILED,
        error: error.message,
        templateId: options.templateId,
        metadata: options.metadata
      });

      // Audit log failure
      await this.auditService.log({
        action: 'EMAIL_FAILED',
        entityType: 'email',
        entityId: failedRecord.id,
        userId: options.metadata?.userId,
        details: {
          error: error.message,
          to: options.to,
          subject: options.subject
        });

      throw error;
    }

  async sendBulkEmails(requests: EmailOptions[]): Promise<BulkEmailResponse> {
    const results: EmailResponse[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (request, index) => {
          try {
            const response = await this.sendEmail(request);
            results.push(response);
          } catch (error) {
            errors.push({
              index: i + index,
              error: error.message
            });
          })
      );

      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    return {
      sent: results.filter(r => r.success).length,
      failed: errors.length,
      total: requests.length,
      results,
      errors
    };
  }

  async getEmailStatus(emailId: string): Promise<EmailRecord | null> {
    return this.databaseService.getEmailById(emailId);
  }

  async getEmailHistory(filters: EmailHistoryFilters): Promise<{
    emails: EmailRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page = 1, pageSize = 20, ...queryFilters } = filters;
    const offset = (page - 1) * pageSize;

    const [emails, total] = await Promise.all([
      this.databaseService.getEmails({ ...queryFilters, offset, limit: pageSize }),
      this.databaseService.countEmails(queryFilters)
    ]);

    return {
      emails,
      total,
      page,
      pageSize
    };
  }

  async resendEmail(emailId: string): Promise<EmailResponse> {
    const originalEmail = await this.getEmailStatus(emailId);
    if (!originalEmail) {
      throw new Error('Email not found');
    }

    if (originalEmail.status === EmailStatus.SENT) {
      throw new Error('Email already sent successfully');
    }

    // Reconstruct email options
    const options: EmailOptions = {
      to: originalEmail.to.join(','),
      from: originalEmail.from,
      subject: originalEmail.subject,
      html: originalEmail.htmlContent,
      text: originalEmail.textContent,
      templateId: originalEmail.templateId,
      metadata: {
        ...originalEmail.metadata,
        resendOf: emailId
      };

    return this.sendEmail(options);
  }

  private async checkRateLimit(sender: string): Promise<void> {
    const now = Date.now();
    const limit = this.rateLimiter.get(sender);

    if (!limit) {
      this.rateLimiter.set(sender, {
        count: 1,
        windowStart: now,
        dailyCount: 1,
        dailyWindowStart: now
      });
      return;
    }

    // Check hourly limit
    if (now - limit.windowStart > this.RATE_LIMIT_WINDOW) {
      limit.count = 1;
      limit.windowStart = now;
    } else {
      limit.count++;
      if (limit.count > this.MAX_EMAILS_PER_HOUR) {
        throw new RateLimitError('Hourly email limit exceeded');
      }

    // Check daily limit
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - limit.dailyWindowStart > oneDayMs) {
      limit.dailyCount = 1;
      limit.dailyWindowStart = now;
    } else {
      limit.dailyCount++;
      if (limit.dailyCount > this.MAX_EMAILS_PER_DAY) {
        throw new RateLimitError('Daily email limit exceeded');
      }
  }

  private async processAttachments(attachments?: EmailAttachment[]): Promise<Mail.Attachment[]> {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    return Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.path) {
          // File path attachment
          return {
            filename: attachment.filename,
            path: attachment.path,
            contentType: attachment.contentType
          };
        } else if (attachment.content) {
          // Content attachment
          return {
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType
          };
        } else {
          throw new Error(`Invalid attachment: ${attachment.filename}`);
        })
    );
  }

  private async saveEmailRecord(data: Partial<EmailRecord>): Promise<EmailRecord> {
    const record: EmailRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    } as EmailRecord;

    return this.databaseService.saveEmail(record);
  }

  async updateEmailStatus(emailId: string, status: EmailStatus, error?: string): Promise<void> {
    await this.databaseService.updateEmail(emailId, {
      status,
      error,
      updatedAt: new Date()
    });
  }

  async processWebhook(provider: string, data: any): Promise<void> {
    // Handle webhook events from email providers
    switch (provider) {
      case 'sendgrid':
        await this.processSendGridWebhook(data);
        break;
      case 'mailgun':
        await this.processMailgunWebhook(data);
        break;
      default:
        console.warn(`Unknown webhook provider: ${provider}`);
    }

  private async processSendGridWebhook(events: any[]): Promise<void> {
    for (const event of events) {
      const em

  private async handleSendGridFallback(
    email: EmailMessage,
    primaryError: any
  ): Promise<boolean> {
    try {
      // Attempt to use SendGrid as fallback
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email.to,
        from: email.from || this.defaultFrom,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachments: email.attachments?.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      };

      await sgMail.send(msg);
      
      logger.info('Email sent via SendGrid fallback', {
        messageId: email.id,
        to: email.to
      });

      return true;
    } catch (fallbackError) {
      logger.error('SendGrid fallback failed', {
        messageId: email.id,
        error: fallbackError.message,
        primaryError: primaryError.message
      });
      return false;
    }

  private async handleSmtpFallback(
    email: EmailMessage,
    primaryError: any
  ): Promise<boolean> {
    try {
      // Attempt direct SMTP as last resort
      const smtpTransporter = nodemailer.createTransport({
        host: process.env.SMTP_FALLBACK_HOST,
        port: parseInt(process.env.SMTP_FALLBACK_PORT || '587'),
        secure: process.env.SMTP_FALLBACK_SECURE === 'true',
        auth: {
          user: process.env.SMTP_FALLBACK_USER,
          pass: process.env.SMTP_FALLBACK_PASS
        });

      await smtpTransporter.sendMail({
        from: email.from || this.defaultFrom,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachments: email.attachments
      });

      logger.info('Email sent via SMTP fallback', {
        messageId: email.id,
        to: email.to
      });

      return true;
    } catch (fallbackError) {
      logger.error('SMTP fallback failed', {
        messageId: email.id,
        error: fallbackError.message,
        primaryError: primaryError.message
      });
      return false;
    }

  private validateEmailAddress(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private sanitizeHtml(html: string): string {
    // Basic HTML sanitization to prevent XSS
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private async compressLargeAttachments(
    attachments: EmailAttachment[]
  ): Promise<EmailAttachment[]> {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return Promise.all(
      attachments.map(async (attachment) => {
        const buffer = Buffer.from(attachment.content, 'base64');
        
        if (buffer.length > maxSize) {
          const zlib = require('zlib');
          const compressed = await promisify(zlib.gzip)(buffer);
          
          return {
            ...attachment,
            filename: `${attachment.filename}.gz`,
            content: compressed.toString('base64'),
            contentType: 'application/gzip'
          };
        }
        
        return attachment;
      })
    );
  }

  private async trackEmailMetrics(
    email: EmailMessage,
    status: 'sent' | 'failed',
    provider: string,
    duration: number
  ): Promise<void> {
    try {
      await this.redis.zadd(
        `email:metrics:${provider}:${status}`,
        Date.now(),
        email.id
      );

      await this.redis.hincrby(
        `email:stats:${provider}`,
        status,
        1
      );

      await this.redis.lpush(
        `email:performance:${provider}`,
        JSON.stringify({
          duration,
          timestamp: Date.now(),
          status
        })
      );

      // Trim to keep only last 1000 entries
      await this.redis.ltrim(`email:performance:${provider}`, 0, 999);
    } catch (error) {
      logger.error('Failed to track email metrics', { error: error.message });
    }

  async getEmailStatus(messageId: string): Promise<EmailStatus | null> {
    try {
      const status = await this.redis.get(`email:status:${messageId}`);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      logger.error('Failed to get email status', {
        messageId,
        error: error.message
      });
      return null;
    }

  async getProviderStats(): Promise<Record<string, any>> {
    try {
      const providers = ['aws', 'sendgrid', 'smtp'];
      const stats: Record<string, any> = {};

      for (const provider of providers) {
        const providerStats = await this.redis.hgetall(`email:stats:${provider}`);
        stats[provider] = {
          sent: parseInt(providerStats.sent || '0'),
          failed: parseInt(providerStats.failed || '0'),
          successRate: providerStats.sent 
            ? (parseInt(providerStats.sent) / 
               (parseInt(providerStats.sent) + parseInt(providerStats.failed || '0'))) * 100
            : 0
        };
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get provider stats', { error: error.message });
      return {};
    }

  async retryFailedEmails(): Promise<void> {
    try {
      const failedEmails = await this.redis.smembers('email:failed:retry');
      
      for (const emailData of failedEmails) {
        const email = JSON.parse(emailData);
        
        // Check retry count
        const retryCount = await this.redis.hincrby(
          `email:retry:${email.id}`,
          'count',
          1
        );

        if (retryCount <= this.maxRetries) {
          await this.queueEmail(email);
          await this.redis.srem('email:failed:retry', emailData);
        } else {
          // Move to permanent failure
          await this.redis.sadd('email:failed:permanent', emailData);
          await this.redis.srem('email:failed:retry', emailData);
        }
    } catch (error) {
      logger.error('Failed to retry emails', { error: error.message });
    }

  async cleanup(): Promise<void> {
    try {
      // Clean up old tracking data (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      for (const provider of providers) {
        await this.redis.zremrangebyscore(
          `email:metrics:${provider}:sent`,
          0,
          thirtyDaysAgo
        );
        await this.redis.zremrangebyscore(
          `email:metrics:${provider}:failed`,
          0,
          thirtyDaysAgo
        );
      }

      logger.info('Email service cleanup completed');
    } catch (error) {
      logger.error('Email service cleanup failed', { error: error.message });
    }
}

// Export singleton instance
export const emailSenderService = new EmailSenderService();

// Export types
export type { EmailMessage, EmailAttachment, EmailStatus, EmailProvider };

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
}
}
}
}
}
}
}
