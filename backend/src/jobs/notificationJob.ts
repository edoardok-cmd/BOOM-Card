import { Job } from 'bull';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/email';
import { sendSMS } from '../lib/sms';
import { sendPushNotification } from '../lib/push';
import { logger } from '../lib/logger';
import { redis } from '../lib/redis';
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';
import { i18n } from '../lib/i18n';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

interface NotificationJobData {
  notificationId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  recipientId: string;
  templateId: string;
  data: Record<string, any>;
  locale: string;
  priority: 'high' | 'medium' | 'low';
  scheduledFor?: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: Record<string, string>;
  content: Record<string, string>;
  channels: NotificationChannel[];
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<NotificationChannel, RateLimitConfig> = {
  EMAIL: { windowMs: 3600000, maxRequests: 50 }, // 50 emails per hour
  SMS: { windowMs: 3600000, maxRequests: 20 }, // 20 SMS per hour
  PUSH: { windowMs: 3600000, maxRequests: 100 }, // 100 push per hour
  IN_APP: { windowMs: 3600000, maxRequests: 200 } // 200 in-app per hour
};

const RETRY_DELAYS = {
  high: [1000, 5000, 30000], // 1s, 5s, 30s
  medium: [5000, 30000, 300000], // 5s, 30s, 5m
  low: [30000, 300000, 3600000] // 30s, 5m, 1h
};

export async function processNotificationJob(job: Job<NotificationJobData>) {
  const startTime = Date.now();
  const { notificationId, type, channels, recipientId, templateId, data, locale, priority } = job.data;

  try {
    logger.info('Processing notification job', {
      jobId: job.id,
      notificationId,
      type,
      channels,
      recipientId,
      priority
    });

    // Check if notification already processed
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          include: {
            profile: true,
            notificationPreferences: true
          }
      });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    if (notification.status === NotificationStatus.SENT) {
      logger.warn('Notification already sent', { notificationId });
      return;
    }

    // Check user preferences
    const preferences = notification.user.notificationPreferences;
    const allowedChannels = channels.filter(channel => {
      switch (channel) {
        case NotificationChannel.EMAIL:
          return preferences?.emailEnabled ?? true;
        case NotificationChannel.SMS:
          return preferences?.smsEnabled ?? false;
        case NotificationChannel.PUSH:
          return preferences?.pushEnabled ?? true;
        case NotificationChannel.IN_APP:
          return true; // Always allow in-app
        default:
          return false;
      });

    if (allowedChannels.length === 0) {
      logger.info('No allowed channels for notification', { notificationId, channels });
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.SKIPPED,
          metadata: { reason: 'No allowed channels' }
      });
      return;
    }

    // Load template
    const template = await loadTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Process each channel
    const results = await Promise.allSettled(
      allowedChannels.map(channel => 
        processChannel(channel, notification, template, data, locale)
      )
    );

    // Update notification status
    const allSuccessful = results.every(result => result.status === 'fulfilled');
    const someSuccessful = results.some(result => result.status === 'fulfilled');

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: allSuccessful ? NotificationStatus.SENT : 
                someSuccessful ? NotificationStatus.PARTIALLY_SENT : 
                NotificationStatus.FAILED,
        sentAt: someSuccessful ? new Date() : null,
        metadata: {
          ...notification.metadata,
          processingTime: Date.now() - startTime,
          channelResults: results.map((result, index) => ({
            channel: allowedChannels[index],
            status: result.status,
            error: result.status === 'rejected' ? result.reason?.message : null
          }))
        }
    });

    // Log metrics
    await logNotificationMetrics(type, channels, results, Date.now() - startTime);

    if (!allSuccessful) {
      const failedChannels = results
        .map((result, index) => result.status === 'rejected' ? allowedChannels[index] : null)
        .filter(Boolean);
      
      throw new Error(`Failed to send notification to channels: ${failedChannels.join(', ')}`);
    } catch (error) {
    logger.error('Notification job failed', {
      jobId: job.id,
      notificationId,
      error: error.message,
      stack: error.stack
    });

    // Update notification status
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.FAILED,
        metadata: {
          error: error.message,
          failedAt: new Date(),
          attemptCount: job.attemptsMade
        }
    });

    // Determine if we should retry
    const retryDelays = RETRY_DELAYS[priority];
    if (job.attemptsMade < retryDelays.length) {
      throw new Error(`Notification processing failed: ${error.message}`);
    }
}

async function processChannel(
  channel: NotificationChannel,
  notification: any,
  template: NotificationTemplate,
  data: Record<string, any>,
  locale: string
): Promise<void> {
  // Check rate limits
  const rateLimitKey = `ratelimit:${channel}:${notification.userId}`;
  const isRateLimited = await checkRateLimit(rateLimitKey, RATE_LIMITS[channel]);
  
  if (isRateLimited) {
    throw new Error(`Rate limit exceeded for channel ${channel}`);
  }

  // Prepare content
  const subject = interpolateTemplate(template.subject[locale] || template.subject['en'], data);
  const content = interpolateTemplate(template.content[locale] || template.content['en'], data);

  switch (channel) {
    case NotificationChannel.EMAIL:
      await sendEmailNotification(notification.user, subject, content, template.name);
      break;

    case NotificationChannel.SMS:
      await sendSMSNotification(notification.user, content);
      break;

    case NotificationChannel.PUSH:
      await sendPushNotificationToUser(notification.user, subject, content, data);
      break;

    case NotificationChannel.IN_APP:
      await createInAppNotification(notification.userId, subject, content, notification.type, data);
      break;

    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }

  // Update rate limit
  await incrementRateLimit(rateLimitKey, RATE_LIMITS[channel]);
}

async function sendEmailNotification(
  user: any,
  subject: string,
  content: string,
  templateName: string
): Promise<void> {
  if (!user.email) {
    throw new Error('User has no email address');
  }

  await sendEmail({
    to: user.email,
    subject,
    html: wrapEmailTemplate(content, {
      userName: user.profile?.firstName || user.email,
      locale: user.profile?.locale || 'en'
    }),
    tags: [`notification:${templateName}`]
  });
}

async function sendSMSNotification(user: any, content: string): Promise<void> {
  if (!user.profile?.phone) {
    throw new Error('User has no phone number');
  }

  await sendSMS({
    to: user.profile.phone,
    message: content,
    unicode: true
  });
}

async function sendPushNotificationToUser(
  user: any,
  title: string,
  body: string,
  data: Record<string, any>
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({
    where: {
      userId: user.id,
      active: true
    });

  if (tokens.length === 0) {
    throw new Error('User has no active push tokens');
  }

  await Promise.all(
    tokens.map(token => 
      sendPushNotification({
        token: token.token,
        title,
        body,
        data: {
          ...data,
          notificationType: data.type,
          timestamp: new Date().toISOString()
        })
    )
  );
}

async function createInAppNotification(
  userId: string,
  title: string,
  content: string,
  type: NotificationType,
  data: Record<string, any>
): Promise<void> {
  await prisma.inAppNotification.create({
    data: {
      userId,
      title,
      content,
      type,
      data,
      read: false,
      createdAt: new Date()
    });

  // Publish to real-time channel
  await redis.publish(`user:${userId}:notifications`, JSON.stringify({
    type: 'NEW_NOTIFICATION',
    payload: {
      title,
      content,
      type,
      timestamp: new Date().toISOString()
    }));
}

async function loadTemplate(templateId: string): Promise<NotificationTemplate | null> {
  // Check cache first
  const cacheKey = `template:${templateId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  // Load from database
    where: { id: templateId });

  if (template) {
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(template));
  }

  return template;
}

function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    
    if (value === undefined) {
      logger.warn('Missing template variable', { key, template });
      return match;
    }

    // Handle special f
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
}
}
