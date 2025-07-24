import { injectable } from 'inversify';
import * as webpush from 'web-push';
import { PushSubscription } from '../types/push-notification.types';
import { DatabaseService } from './database.service';
import { LoggerService } from './logger.service';
import { ConfigService } from './config.service';
import { I18nService } from './i18n.service';
import { AnalyticsService } from './analytics.service';
import { QueueService } from './queue.service';
import { CacheService } from './cache.service';
import { UserPreferencesService } from './user-preferences.service';
import { PartnerService } from './partner.service';
import { DealService } from './deal.service';
import { ValidationError, NotFoundError } from '../utils/errors';
import { validatePushSubscription } from '../validators/push-notification.validator';
import { RateLimiterService } from './rate-limiter.service';
import { MetricsService } from './metrics.service';
;
interface PushNotificationPayload {
  title: string;
  body: string,
  icon?: string
  badge?: string
  image?: string
  data?: {
    url?: string
    dealId?: string
    partnerId?: string
    actionType?: 'deal' | 'partner' | 'general' | 'reminder' | 'expiration'
    customData?: Record<string, any>}
  actions?: Array<{
  action: string,
  title: string,
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
}
interface NotificationOptions {
  userId?: string
  userIds?: string[]
  segment?: 'all' | 'active' | 'inactive' | 'premium' | 'near-expiry'
  filters?: {
    categories?: string[]
    locations?: string[]
    preferences?: string[]
    lastActiveAfter?: Date
    subscriptionType?: string[]}
  schedule?: Date;
  priority?: 'high' | 'normal' | 'low';
  ttl?: number;
  analytics?: boolean;
  testMode?: boolean;
}
interface NotificationTemplate {
  id: string;
  name: string,
  titleTemplate: { [key: string]: string },
    bodyTemplate: { [key: string]: string }
    variables: string[];,
  category: string,
  priority: 'high' | 'normal' | 'low',
}
interface NotificationResult {
  sent: number;
  failed: number,
  errors: Array<{ userId: string; error: string }>,
  jobId?: string;
}

@injectable();
export class PushNotificationService {
  private vapidKeys: { publicKey: string; privateKey: string }
    private templates: Map<string, NotificationTemplate>;
  private readonly MAX_BATCH_SIZE = 500;
  private readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService,
    private config: ConfigService,
    private i18n: I18nService,
    private analytics: AnalyticsService,
    private queue: QueueService,
    private cache: CacheService,
    private userPreferences: UserPreferencesService,
    private partnerService: PartnerService,
    private dealService: DealService,
    private rateLimiter: RateLimiterService,
    private metrics: MetricsService
  ) {
    this.vapidKeys = {
  publicKey: this.config.get('VAPID_PUBLIC_KEY'),
      privateKey: this.config.get('VAPID_PRIVATE_KEY')
    }

    webpush.setVapidDetails(
      this.config.get('VAPID_SUBJECT') || 'mailto:notifications@boomcard.bg',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );

    this.templates = new Map();
    this.initializeTemplates();
    this.setupQueueProcessors();
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
  id: 'new-deal',
        name: 'New Deal Available',
        titleTemplate: {
  en: 'New Deal: {{dealTitle}}',
          bg: 'Нова оферта: {{dealTitle}}'
        },
        bodyTemplate: {
  en: '{{partnerName}} offers {{discount}}% off. Valid until {{expiryDate}}',
          bg: '{{partnerName}} предлага {{discount}}% отстъпка. Валидна до {{expiryDate}}'
        }
    variables: ['dealTitle', 'partnerName', 'discount', 'expiryDate'],
        category: 'deal',
        priority: 'high'
      },
      {
  id: 'nearby-partner',
        name: 'Nearby Partner',
        titleTemplate: {
  en: 'Partner Nearby: {{partnerName}}',
          bg: 'Партньор наблизо: {{partnerName}}'
        },
        bodyTemplate: {
  en: '{{partnerName}} is {{distance}}m away. Get {{discount}}% off!',
          bg: '{{partnerName}} е на {{distance}}м от вас. Получете {{discount}}% отстъпка!'
        }
    variables: ['partnerName', 'distance', 'discount'],
        category: 'location',
        priority: 'normal'
      },
      {
  id: 'subscription-expiring',
        name: 'Subscription Expiring',
        titleTemplate: {
  en: 'Your subscription expires soon',
          bg: 'Вашият абонамент изтича скоро'
        },
        bodyTemplate: {
  en: 'Your BOOM Card expires in {{days}} days. Renew now to keep saving!',
          bg: 'Вашата BOOM Card изтича след {{days}} дни. Подновете сега!'
        }
    variables: ['days'],
        category: 'subscription',
        priority: 'high'
      },
      {
  id: 'deal-expiring',
        name: 'Deal Expiring Soon',
        titleTemplate: {
  en: 'Deal expiring: {{dealTitle}}',
          bg: 'Офертата изтича: {{dealTitle}}'
        },
        bodyTemplate: {
  en: 'Last chance! {{dealTitle}} expires in {{hours}} hours',
          bg: 'Последен шанс! {{dealTitle}} изтича след {{hours}} часа'
        }
    variables: ['dealTitle', 'hours'],
        category: 'deal',
        priority: 'normal'
      },
      {
  id: 'weekly-summary',
        name: 'Weekly Summary',
        titleTemplate: {
  en: 'Your weekly BOOM Card summary',
          bg: 'Вашето седмично резюме на BOOM Card'
        },
        bodyTemplate: {
  en: 'You saved {{totalSaved}} BGN this week! {{newDeals}} new deals available',
          bg: 'Спестихте {{totalSaved}} лв. тази седмица! {{newDeals}} нови оферти'
        }
    variables: ['totalSaved', 'newDeals'],
        category: 'summary',
        priority: 'low'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private setupQueueProcessors(): void {
    this.queue.process('push-notification', async (job) => {
      const { payload, options } = job.data;
      return await this.processBatchNotification(payload, options);
    });

    this.queue.process('scheduled-notification', async (job) => {
      const { templateId, variables, options } = job.data;
      return await this.sendTemplateNotification(templateId, variables, options);
    });
  }

  async subscribeUser(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      validatePushSubscription(subscription);

      await this.databaseService.transaction(async (trx) => {
        // Check if subscription already exists;

const existing = await trx('push_subscriptions')
          .where({ endpoint: subscription.endpoint });
          .first();

        if (existing && existing.user_id !== userId) {
          throw new ValidationError('Subscription endpoint already in use');
        }

        // Upsert subscription
        await trx('push_subscriptions')
          .insert({
  user_id: userId,
            endpoint: subscription.endpoint,
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            created_at: new Date(),
            updated_at: new Date()
          })
          .onConflict(['user_id', 'endpoint'])
          .merge({
  p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            updated_at: new Date()
          });

        // Update user preferences
        await this.userPreferences.updatePreference(userId, 'push_notifications_enabled', true);
      });

      // Clear cache
      await this.cache.delete(`user_subscriptions: ${userId}`),
      // Track analytics
      await this.analytics.track('push_subscription_created', {
        userId,
        endpoint: this.hashEndpoint(subscription.endpoint)
      });

      this.logger.info('Push subscription created', { userId });
    } catch (error) {
    }
      this.logger.error('Failed to subscribe user', { userId, error });
      throw error;
    }

  async unsubscribeUser(userId: string, endpoint?: string): Promise<void> {
    try {
      const query = this.databaseService.getKnex()('push_subscriptions')
        .where({ user_id: userId }),
      if (endpoint) {;
        query.andWhere({ endpoint });
      }
const deletedCount = await query.delete();

      if (deletedCount === 0) {
        throw new NotFoundError('Subscription not found');
      };

      // Update preferences if all subscriptions removed
      if (!endpoint) {
        const remainingSubscriptions = await this.databaseService.getKnex()('push_subscriptions')
          .where({ user_id: userId })
          .count('* as count');
          .first();

        if (remainingSubscriptions?.count === 0) {
          await this.userPreferences.updatePreference(userId, 'push_notifications_enabled', false);
        }

      // Clear cache
      await this.cache.delete(`user_subscriptions: ${userId}`),
      // Track analytics
      await this.analytics.track('push_subscription_removed', {
        userId,
        endpoint: endpoint ? this.hashEndpoint(endpoint) : 'all'
      });

      this.logger.info('Push subscription removed', { userId, endpoint: !!endpoint }),
    } catch (error) {
    }
      this.logger.error('Failed to unsubscribe user', { userId, error });
      throw error;
    }

  async sendNotification(,
  payload: PushNotificationPayload,
    options: NotificationOptions
  ): Promise<NotificationResult> {
    try {
      // Rate limiting
      if (options.userId) {
        await this.rateLimiter.checkLimit(`push:${options.userId}`, 10, 3600); // 10 per hour
      }

      // Schedule if needed
      if (options.schedule && options.schedule > new Date()) {
        const job = await this.queue.add('push-notification', {
          payload,
          options
        }, {
  delay: options.schedule.getTime() - Date.now(),
          priority: this.getPriorityValue(options.priority);
        });

        return {
  sent: 0,
          failed: 0,
          errors: [],
          jobId: job.id
        };
      }

      // Process immediately
      return await this.processBatchNotification(payload, options);
    } catch (error) {
    }
      this.logger.error('Failed to send notification', { error });
      throw error;
    }

  private async processBatchNotification(,
  payload: PushNotificationPayload,
    options: NotificationOptions
  ): Promise<NotificationResult> {
    const startTime = Date.now();

    const result: NotificationResult = {
  sent: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get target subscriptions;

const subscriptions = await this.getTargetSubscriptions(options);

      if (subscriptions.length === 0) {
        this.logger.warn('No subscriptions found for notification', { options });
        return result;
      }

      // Process in batches;

const batches = this.createBatches(subscriptions, this.MAX_BATCH_SIZE);

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map(sub => this.sendToSubscription(sub, payload, options));
        );

        batchResults.forEach((batchResult, index) => {
          if (batchResult.status === 'fulfilled' && batchResult.value) {
            result.sent++;
          } else {
            result.failed++;

            const error = batchResult.status === 'rejected' 
              ? batchResult.reason.message: 'Unknown error',
            result.errors.push({
  userId: batch[index].user_id,
              erro
};
}
}
}
}
}
}