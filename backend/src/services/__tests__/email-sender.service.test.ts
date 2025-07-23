import { jest } from '@jest/globals';
import { EmailSenderService } from '../email-sender.service';
import { ConfigService } from '../config.service';
import { LoggerService } from '../logger.service';
import { MetricsService } from '../metrics.service';
import { QueueService } from '../queue.service';
import { TemplateService } from '../template.service';
import { ValidationService } from '../validation.service';
import { CacheService } from '../cache.service';
import { NotificationService } from '../notification.service';
import { AuditService } from '../audit.service';
import { RateLimiterService } from '../rate-limiter.service';
import { EncryptionService } from '../encryption.service';
import { HealthCheckService } from '../health-check.service';
import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { EmailTemplate, EmailStatus, EmailPriority } from '../../types/email.types';
import { ServiceError, ValidationError, RateLimitError } from '../../errors';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

interface EmailSendOptions {
  to: string | string[];
  from?: string;
  subject: string;
  template?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  priority?: EmailPriority;
  scheduledAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  encoding?: string;
  cid?: string;
}

interface EmailResult {
  messageId: string;
  status: EmailStatus;
  sentAt?: Date;
  error?: string;
  attempts?: number;
  provider?: string;
}

interface EmailBatch {
  batchId: string;
  emails: EmailSendOptions[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  createdAt: Date;
  completedAt?: Date;
}

interface EmailMetrics {
  sent: number;
  failed: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  delivered: number;
  deferred: number;
  rejected: number;
}

interface EmailProviderConfig {
  name: string;
  type: 'smtp' | 'api';
  priority: number;
  enabled: boolean;
  config: SMTPTransport.Options | Record<string, any>;
  rateLimit?: {
    maxPerSecond: number;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  healthCheck?: {
    enabled: boolean;
    interval: number;
    timeout: number;
    url?: string;
  };
}

interface EmailQueueJob {
  id: string;
  email: EmailSendOptions;
  attempts: number;
  maxAttempts: number;
  priority: number;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  provider?: string;
}

interface EmailWebhookPayload {
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  messageId: string;
  recipient: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: string;
}

type MockedConfigService = DeepMockProxy<ConfigService>;
type MockedLoggerService = DeepMockProxy<LoggerService>;
type MockedMetricsService = DeepMockProxy<MetricsService>;
type MockedQueueService = DeepMockProxy<QueueService>;
type MockedTemplateService = DeepMockProxy<TemplateService>;
type MockedValidationService = DeepMockProxy<ValidationService>;
type MockedCacheService = DeepMockProxy<CacheService>;
type MockedNotificationService = DeepMockProxy<NotificationService>;
type MockedAuditService = DeepMockProxy<AuditService>;
type MockedRateLimiterService = DeepMockProxy<RateLimiterService>;
type MockedEncryptionService = DeepMockProxy<EncryptionService>;
type MockedHealthCheckService = DeepMockProxy<HealthCheckService>;
type MockedTransporter = DeepMockProxy<Mail>;
type MockedRedis = DeepMockProxy<Redis>;
type MockedPool = DeepMockProxy<Pool>;

const DEFAULT_FROM_EMAIL = 'noreply@boomcard.com';
const DEFAULT_FROM_NAME = 'BOOM Card';
const DEFAULT_REPLY_TO = 'support@boomcard.com';
const MAX_BATCH_SIZE = 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;
const EMAIL_CACHE_TTL = 3600;
const EMAIL_QUEUE_NAME = 'email-queue';
const EMAIL_DEAD_LETTER_QUEUE = 'email-dlq';
const EMAIL_WEBHOOK_SECRET = 'test-webhook-secret';
const EMAIL_TRACKING_PIXEL_URL = 'https://api.boomcard.com/email/track';
const EMAIL_UNSUBSCRIBE_URL = 'https://boomcard.com/unsubscribe';

const SMTP_CONFIG: SMTPTransport.Options = {
  host: 'smtp.test.com',
  port: 587,
  secure: false,
  auth: {
    user: 'test@boomcard.com',
    pass: 'test-password'
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10
};

const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  CARD_CREATED: 'card-created',
  CARD_SHARED: 'card-shared',
  CARD_VIEWED: 'card-viewed',
  SUBSCRIPTION_CREATED: 'subscription-created',
  SUBSCRIPTION_CANCELLED: 'subscription-cancelled',
  PAYMENT_SUCCESS: 'payment-success',
  PAYMENT_FAILED: 'payment-failed',
  INVOICE: 'invoice',
  CONTACT_ADDED: 'contact-added',
  TEAM_INVITATION: 'team-invitation',
  ANALYTICS_REPORT: 'analytics-report',
  SECURITY_ALERT: 'security-alert',
  SYSTEM_NOTIFICATION: 'system-notification'
};

const EMAIL_PROVIDERS: EmailProviderConfig[] = [
  {
    name: 'primary-smtp',
    type: 'smtp',
    priority: 1,
    enabled: true,
    config: SMTP_CONFIG,
    rateLimit: {
      maxPerSecond: 10,
      maxPerMinute: 500,
      maxPerHour: 10000,
      maxPerDay: 100000
    },
    healthCheck: {
      enabled: true,
      interval: 60000,
      timeout: 5000
    },
  {
    name: 'sendgrid',
    type: 'api',
    priority: 2,
    enabled: true,
    config: {
      apiKey: 'test-sendgrid-api-key',
      endpoint: 'https://api.sendgrid.com/v3'
    },
    rateLimit: {
      maxPerSecond: 100,
      maxPerMinute: 6000,
      maxPerHour: 100000,
      maxPerDay: 1000000
    },
    healthCheck: {
      enabled: true,
      interval: 60000,
      timeout: 5000,
      url: 'https://api.sendgrid.com/v3/health'
    }
];

const MOCK_EMAIL_OPTIONS: EmailSendOptions = {
  to: 'test@example.com',
  subject: 'Test Email',
  template: EMAIL_TEMPLATES.WELCOME,
  templateData: {
    name: 'Test User',
    cardUrl: 'https://boomcard.com/cards/test-card'
  },
  priority: EmailPriority.HIGH,
  tags: ['test', 'welcome'],
  metadata: {
    userId: 'user-123',
    source: 'test'
  };

const MOCK_EMAIL_RESULT: EmailResult = {
  messageId: 'test-message-id',
  status: EmailStatus.SENT,
  sentAt: new Date(),
  provider: 'primary-smtp'
};

const MOCK_EMAIL_BATCH: EmailBatch = {
  batchId: 'batch-123',
  emails: [MOCK_EMAIL_OPTIONS],
  status: 'completed',
  totalEmails: 1,
  sentEmails: 1,
  failedEmails: 0,
  createdAt: new Date(),
  completedAt: new Date()
};

const MOCK_EMAIL_METRICS: EmailMetrics = {
  sent: 1000,
  failed: 10,
  bounced: 5,
  opened: 800,
  clicked: 400,
  unsubscribed: 20,
  complained: 2,
  delivered: 985,
  deferred: 0,
  rejected: 5
};

describe('EmailSenderService', () => {
  let service: EmailSenderService;
  let configService: ConfigService;
  let emailLogRepository: Repository<EmailLog>;
  let emailTemplateRepository: Repository<EmailTemplate>;
  let redisService: RedisService;
  let metricsService: MetricsService;
  let encryptionService: EncryptionService;
  let emailQueue: Queue;
  let mockTransporter: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: getRepositoryToken(EmailLog),
          useValue: mockEmailLogRepository
        },
        {
          provide: getRepositoryToken(EmailTemplate),
          useValue: mockEmailTemplateRepository
        },
        {
          provide: RedisService,
          useValue: mockRedisService
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService
        },
        {
          provide: getQueueToken(EMAIL_QUEUE_NAME),
          useValue: mockEmailQueue
        }
      ]
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
    configService = module.get<ConfigService>(ConfigService);
    emailLogRepository = module.get<Repository<EmailLog>>(getRepositoryToken(EmailLog));
    emailTemplateRepository = module.get<Repository<EmailTemplate>>(getRepositoryToken(EmailTemplate));
    redisService = module.get<RedisService>(RedisService);
    metricsService = module.get<MetricsService>(MetricsService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    emailQueue = module.get<Queue>(getQueueToken(EMAIL_QUEUE_NAME));

    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(mockEmailResult),
      verify: jest.fn().mockResolvedValue(true),
      close: jest.fn()
    };

    // Mock nodemailer
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Initialize service
    await service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test'
      };

      const result = await service.sendEmail(emailOptions);

      expect(result).toEqual(mockEmailResult);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text
        })
      );
      expect(mockEmailLogRepository.save).toHaveBeenCalled();
      expect(mockMetricsService.incrementCounter).toHaveBeenCalledWith('email.sent', 1);
    });

    it('should send email with template', async () => {
      const template = createMockEmailTemplate();
      mockEmailTemplateRepository.findOne.mockResolvedValue(template);

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        templateData: {
          userName: 'John Doe',
          companyName: 'BOOM Card'
        };


      expect(result).toEqual(mockEmailResult);
      expect(mockEmailTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'welcome', active: true });
      expect(handlebars.compile).toHaveBeenCalled();
    });

    it('should handle multiple recipients', async () => {
      const emailOptions: EmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        subject: 'Test Email',
        html: '<p>Test</p>'
      };

      await service.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailOptions.to,
          cc: emailOptions.cc,
          bcc: emailOptions.bcc
        })
      );
    });

    it('should handle attachments', async () => {
      const attachments: EmailAttachment[] = [
        {
          filename: 'test.pdf',
          content: Buffer.from('test'),
          contentType: 'application/pdf'
        }
      ];

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        attachments
      };

      await service.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'test.pdf'
            })
          ])
        })
      );
    });

    it('should enforce rate limits', async () => {
      mockRedisService.get.mockResolvedValue('100'); // Max limit reached

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>'
      };

      await expect(service.sendEmail(emailOptions)).rejects.toThrow('Rate limit exceeded');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should queue email if scheduled', async () => {
      const scheduledAt = new Date(Date.now() + 3600000); // 1 hour from now
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        scheduledAt
      };

      await service.sendEmail(emailOptions);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({ options: emailOptions }),
        expect.objectContaining({
          delay: expect.any(Number)
        })
      );
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should handle sending failures', async () => {
      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>'
      };

      await expect(service.sendEmail(emailOptions)).rejects.toThrow(error);
      expect(mockEmailLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EmailStatus.FAILED,
          error: error.message
        })
      );
      expect(mockMetricsService.incrementCounter).toHaveBeenCalledWith('email.failed', 1);
    });

    it('should add tracking pixel when enabled', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        trackOpens: true
      };

      await service.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('<img')
        })
      );
    });

    it('should encrypt sensitive data in logs', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        metadata: {
          userId: '123',
          sensitive: true
        };

      await service.sendEmail(emailOptions);

      expect(mockEncryptionService.encrypt).toHaveBeenCalled();
      expect(mockEmailLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.any(String) // Encrypted
        })
      );
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk emails in batches', async () => {
      const recipients = Array.from({ length: 25 }, (_, i) => ({
        to: `user${i}@example.com`,
        subject: 'Bulk Email',
        html: '<p>Test</p>'
      }));


      expect(result.total).toBe(25);
      expect(result.sent).toBe(25);
      expect(result.failed).toBe(0);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(25);
    });

    it('should handle partial failures in bulk send', async () => {
      mockTransporter.sendMail
        .mockResolvedValueOnce(mockEmailResult)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockEmailResult);

        { to: 'user1@example.com', subject: 'Test', html: '<p>Test</p>' },
        { to: 'user2@example.com', subject: 'Test', html: '<p>Test</p>' },
        { to: 'user3@example.com', subject: 'Test', html: '<p>Test</p>' }
      ];


      expect(result.total).toBe(3);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.failures).toContainEqual(
        expect.objectContaining({
          recipient: 'user2@example.com',
          error: 'Failed'
        })
      );
    });

    it('should respect rate limits in bulk send', async () => {
        to: `user${i}@example.com`,
        subject: 'Bulk Email',
        html: '<p>Test</p>'
      }));

      // Mock rate limit reached after 100 emails
      let callCount = 0;
      mockRedisService.incr.mockImplementation(async () => {
        callCount++;
        return callCount;
      });
      mockRedisService.get.mockImplementation(async (key) => {
        if (key.includes('minute')) return callCount > 100 ? '101' : String(callCount);
        return '0';
      });


      expect(res
}}}
}
}
}
}
}
