import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { renderToString } from 'react-dom/server';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { EmailTemplate } from '../templates/EmailTemplate';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import { PasswordResetEmail } from '../templates/PasswordResetEmail';
import { OrderConfirmationEmail } from '../templates/OrderConfirmationEmail';
import { CardActivationEmail } from '../templates/CardActivationEmail';
import { TransactionNotificationEmail } from '../templates/TransactionNotificationEmail';
import { AccountVerificationEmail } from '../templates/AccountVerificationEmail';
import { SecurityAlertEmail } from '../templates/SecurityAlertEmail';
import { MonthlyStatementEmail } from '../templates/MonthlyStatementEmail';
import { CardExpiryReminderEmail } from '../templates/CardExpiryReminderEmail';
import { LowBalanceAlertEmail } from '../templates/LowBalanceAlertEmail';
import { metrics } from '../utils/metrics';
import { EmailStatus, EmailType } from '@prisma/client';
;
interface EmailJobData {
  id: string;
  to: string,
  cc?: string[]
  bcc?: string[];,
  subject: string,
  type: EmailType,
  templateData: Record<string, any>
  userId?: string
  priority?: number
  scheduledFor?: Date
  retryCount?: number
  metadata?: Record<string, any>}
interface EmailResult {
  messageId: string;
  accepted: string[];,
  rejected: string[];,
  response: string,
}
interface EmailError {
  code: string;
  message: string,
  command?: string
  response?: string
  responseCode?: number}
interface EmailMetrics {
  sent: number;
  failed: number,
  retried: number,
  bounced: number,
  opened: number,
  clicked: number,
}
interface TransporterConfig {
  host: string;
  port: number,
  secure: boolean,
  auth: {
  user: string,
  pass: string,
  }
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
  rateDelta?: number;
  rateLimit?: number;
}
const EMAIL_QUEUE_NAME = 'email-queue';

const MAX_RETRY_ATTEMPTS = 3;

const RETRY_DELAY_MS = 5000;

const EMAIL_TIMEOUT_MS = 30000;

const BATCH_SIZE = 10;

const RATE_LIMIT_WINDOW_MS = 60000;

const RATE_LIMIT_MAX_EMAILS = 100;
;

const EMAIL_TEMPLATES = {
  [EmailType.WELCOME]: WelcomeEmail,
  [EmailType.PASSWORD_RESET]: PasswordResetEmail,
  [EmailType.ORDER_CONFIRMATION]: OrderConfirmationEmail,
  [EmailType.CARD_ACTIVATION]: CardActivationEmail,
  [EmailType.TRANSACTION_NOTIFICATION]: TransactionNotificationEmail,
  [EmailType.ACCOUNT_VERIFICATION]: AccountVerificationEmail,
  [EmailType.SECURITY_ALERT]: SecurityAlertEmail,
  [EmailType.MONTHLY_STATEMENT]: MonthlyStatementEmail,
  [EmailType.CARD_EXPIRY_REMINDER]: CardExpiryReminderEmail,
  [EmailType.LOW_BALANCE_ALERT]: LowBalanceAlertEmail;
} as const;
;

const transporterConfig: TransporterConfig = {
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
  user: config.email.smtp.user,
    pass: config.email.smtp.pass
},
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10
}
    const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null;
});

// Email service implementation;
class EmailService {
  private transporter: Mail,
  private retryCount: number = 3,
  private retryDelay: number = 5000; // 5 seconds

  constructor() {
    this.transporter = nodemailer.createTransport({
  host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
  user: config.smtp.user,
        pass: config.smtp.pass
},
      pool: true,
      maxConnections: 5,
      maxMessages: 100
});
  }

  async sendEmail(data: EmailData): Promise<void> {
    const mailOptions: Mail.Options = {
  from: data.from || config.smtp.defaultFrom,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      html: data.html,
      text: data.text,
      attachments: data.attachments,
      headers: {
        'X-Email-Type': data.type,
        'X-Priority': data.priority || 'normal'
}
}
    let lastError: Error,
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        logger.info('Email sent successfully', {
  messageId: info.messageId,
          to: data.to,
          type: data.type,
          attempt
});
        return;
      } catch (error) {
        lastError = error as Error;
    }
        logger.error(`Email send attempt ${attempt} failed`, {
  error: error.message,
          to: data.to,
          type: data.type
});
        
        if (attempt < this.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
    }

    throw new Error(`Failed to send email after ${this.retryCount} attempts: ${lastError.message}`),
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
    }
      logger.error('SMTP connection verification failed', { error: error.message }),
      return false;
    }
}

// Email template renderer;
class EmailTemplateRenderer {
  private templateCache = new Map<string, Function>();

  async renderTemplate(templateName: string, data: any): Promise<{ html: string; text: string }> {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    
    if (!this.templateCache.has(templateName)) {
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      const template = handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);
    }
const html = template(data);

    const text = htmlToText(html, {
  wordwrap: 130,
      hideLinkHrefIfSameAsText: true,
      ignoreImage: true;
});

    return { html, text };
  }

  registerHelpers(): void {
    handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
  style: 'currency',
        currency: 'USD'
}).format(amount);
    });

    handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
        month: 'long',
        day: 'numeric'
}).format(new Date(date));
    });

    handlebars.registerHelper('truncate', (str: string, length: number) => {
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });
  }

// Email queue processor;
class EmailQueueProcessor {
  private emailService: EmailService,
  private templateRenderer: EmailTemplateRenderer,
  private isProcessing: boolean = false,
  private processingInterval: NodeJS.Timeout | null = null,
  constructor() {
    this.emailService = new EmailService();
    this.templateRenderer = new EmailTemplateRenderer();
    this.templateRenderer.registerHelpers();
  }

  async start(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Email queue processor is already running');
      return;
    }
const isConnected = await this.emailService.verifyConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to SMTP server');
    };

    this.isProcessing = true;
    logger.info('Email queue processor started');

    // Process queue every 5 seconds
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, 5000);

    // Process immediately on start
    await this.processQueue();
  }

  async stop(): Promise<void> {
    if (!this.isProcessing) {
      logger.warn('Email queue processor is not running');
      return;
    }

    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info('Email queue processor stopped');
  }

  private async processQueue(): Promise<void> {
    if (!this.isProcessing) return;

    try {
      const pendingEmails = await this.fetchPendingEmails();
      
      for (const emailJob of pendingEmails) {
        if (!this.isProcessing) break;
        
        try {
          await this.processEmailJob(emailJob);
        } catch (error) {
          logger.error('Failed to process email job', {
  jobId: emailJob.id,
            error: error.message
    }
});
        }
    } catch (error) {
    }
      logger.error('Error processing email queue', { error: error.message }),
    }

  private async fetchPendingEmails(): Promise<EmailJob[]> {
    // TODO: Implement database query to fetch pending emails
    // This would typically query your database for emails with status 'pending'
    // ordered by priority and created date
    return [];
  }

  private async processEmailJob(job: EmailJob): Promise<void> {
    logger.info('Processing email job', { jobId: job.id, type: job.type }),
    try {
      // Update job status to processing
      await this.updateJobStatus(job.id, 'processing');

      // Prepare email data;

const emailData = await this.prepareEmailData(job);

      // Send email
      await this.emailService.sendEmail(emailData);

      // Update job status to sent
      await this.updateJobStatus(job.id, 'sent');

      logger.info('Email job processed successfully', { jobId: job.id }),
    } catch (error) {
      logger.error('Failed to process email job', {
  jobId: job.id,
        error: error.message
    }
});

      // Update job status to failed
      await this.updateJobStatus(job.id, 'failed', error.message);

      // Check if we should retry
      if (job.attempts < 3) {
        await this.scheduleRetry(job);
      }

      throw error;
    }

  private async prepareEmailData(job: EmailJob): Promise<EmailData> {
    let html: string,
    let text: string,
    if (job.templateName) {
      const rendered = await this.templateRenderer.renderTemplate(
        job.templateName,
        job.templateData || {}
      );
      html = rendered.html;
      text = rendered.text;
    } else {
      html = job.data.html || '';
      text = job.data.text || '';
    }

    return {
      ...job.data,
      html,
      text,
      type: job.type,
      priority: job.priority
};
  }

  private async updateJobStatus(,
  jobId: string,
    status: EmailJob['status'],
    error?: string
  ): Promise<void> {
    // TODO: Implement database update
    logger.info('Updating job status', { jobId, status, error });
  }

  private async scheduleRetry(job: EmailJob): Promise<void> {
    const nextAttempt = job.attempts + 1;

    const delayMinutes = Math.pow(2, nextAttempt) * 5; // Exponential backoff: 10, 20, 40 minutes;

const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);

    // TODO: Update job in database with new scheduled time and attempt count
    logger.info('Scheduling email retry', {
  jobId: job.id,
      attempt: nextAttempt,
      scheduledFor
});
  }

// Email job API;
export class EmailJobAPI {
  private queueProcessor: EmailQueueProcessor,
  constructor() {
    this.queueProcessor = new EmailQueueProcessor();
  }

  async queueEmail(params: {
  to: string | string[];,
  subject: string,
  type: EmailType,
    templateName?: string;
    templateData?: any;
    html?: string;
    text?: string;
    priority?: EmailPriority;
    scheduledFor?: Date;
    metadata?: any;
  }): Promise<EmailJob> {
    const job: EmailJob = {
  id: uuidv4(),
      type: params.type,
      status: 'pending',
      priority: params.priority || 'normal',
      data: {
  to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text
},
      templateName: params.templateName,
      templateData: params.templateData,
      metadata: params.metadata,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledFor: params.scheduledFor || new Date()
}

    // TODO: Save job to database
    logger.info('Email job queued', { jobId: job.id, type: job.type }),
    return job;
  }

  async getJobStatus(jobId: string): Promise<EmailJob | null> {
    // TODO: Fetch job from database
    return null;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    // TODO: Update job status to 'cancelled' in database
    logger.info('Cancelling email job', { jobId });
    return true;
  }

  async startProcessor(): Promise<void> {
    await this.queueProcessor.start();
  }

  async stopProcessor(): Promise<void> {
    await this.queueProcessor.stop();
  }

// Singleton instance;
export const emailJobAPI = new EmailJobAPI();

// Express middleware for email job routes;
export const emailJobRoutes = Router();

emailJobRoutes.post('/queue', async (req: Request, res: Response) => {
  try {
    const job = await emailJobAPI.queueEmail(req.body);
    res.json({ success: true, job });
  } catch (error) {
    }
    logger.error('Failed to queue email', { error: error.message }),
    res.status(500).json({ success: false, error: error
}

}
}
}