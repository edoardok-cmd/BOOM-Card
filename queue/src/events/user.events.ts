import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { MetricsService } from '../services/metrics.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { CacheService } from '../services/cache.service';
import { QueueService } from '../services/queue.service';
import { 
  UserEventType, 
  UserEventPayload, 
  UserEvent,
  EventPriority,
  EventStatus 
} from '../types/events.types';
import { User, UserRole, UserStatus } from '../types/user.types';
import { Card, CardStatus } from '../types/card.types';
import { Transaction } from '../types/transaction.types';
import { Subscription } from '../types/subscription.types';

export interface UserEventData {
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserRegistrationEventData extends UserEventData {
  email: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  registrationSource: 'web' | 'mobile' | 'partner' | 'admin';
  ipAddress: string;
  userAgent: string;
}

export interface UserLoginEventData extends UserEventData {
  loginMethod: 'email' | 'social' | 'mobile';
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface UserProfileUpdateEventData extends UserEventData {
  updatedFields: string[];
  previousValues?: Record<string, any>;
  newValues: Record<string, any>;
}

export interface UserCardActivationEventData extends UserEventData {
  cardId: string;
  cardNumber: string;
  activationType: 'purchase' | 'gift' | 'promotion';
  subscriptionId?: string;
}

export interface UserTransactionEventData extends UserEventData {
  transactionId: string;
  partnerId: string;
  amount: number;
  discountAmount: number;
  discountPercentage: number;
  qrCodeId: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface UserSubscriptionEventData extends UserEventData {
  subscriptionId: string;
  planId: string;
  action: 'created' | 'renewed' | 'cancelled' | 'expired' | 'upgraded' | 'downgraded';
  previousPlanId?: string;
  amount?: number;
  currency?: string;
}

export interface UserSecurityEventData extends UserEventData {
  action: 'password_changed' | 'email_changed' | 'phone_changed' | '2fa_enabled' | '2fa_disabled' | 'account_locked' | 'account_unlocked';
  ipAddress: string;
  userAgent: string;
  reason?: string;
}

export interface UserReferralEventData extends UserEventData {
  referredUserId: string;
  referralCode: string;
  rewardType: 'points' | 'discount' | 'free_month';
  rewardAmount?: number;
}

export interface UserNotificationEventData extends UserEventData {
  notificationType: 'email' | 'sms' | 'push' | 'in_app';
  templateId: string;
  subject?: string;
  content?: string;
  status: 'sent' | 'failed' | 'queued';
  errorMessage?: string;
}

export class UserEventEmitter extends EventEmitter {
  private static instance: UserEventEmitter;
  private logger: Logger;
  private metricsService: MetricsService;
  private notificationService: NotificationService;
  private auditService: AuditService;
  private cacheService: CacheService;
  private queueService: QueueService;
  private eventHandlers: Map<UserEventType, Function[]>;

  private constructor() {
    super();
    this.logger = new Logger('UserEventEmitter');
    this.metricsService = MetricsService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.auditService = AuditService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.queueService = QueueService.getInstance();
    this.eventHandlers = new Map();
    this.initializeEventHandlers();
  }

  public static getInstance(): UserEventEmitter {
    if (!UserEventEmitter.instance) {
      UserEventEmitter.instance = new UserEventEmitter();
    }
    return UserEventEmitter.instance;
  }

  private initializeEventHandlers(): void {
    // User registration events
    this.on(UserEventType.USER_REGISTERED, this.handleUserRegistration.bind(this));
    this.on(UserEventType.USER_VERIFIED, this.handleUserVerification.bind(this));
    
    // Authentication events
    this.on(UserEventType.USER_LOGIN, this.handleUserLogin.bind(this));
    this.on(UserEventType.USER_LOGOUT, this.handleUserLogout.bind(this));
    this.on(UserEventType.USER_PASSWORD_RESET, this.handlePasswordReset.bind(this));
    
    // Profile events
    this.on(UserEventType.USER_PROFILE_UPDATED, this.handleProfileUpdate.bind(this));
    this.on(UserEventType.USER_AVATAR_UPDATED, this.handleAvatarUpdate.bind(this));
    
    // Card events
    this.on(UserEventType.USER_CARD_ACTIVATED, this.handleCardActivation.bind(this));
    this.on(UserEventType.USER_CARD_SUSPENDED, this.handleCardSuspension.bind(this));
    this.on(UserEventType.USER_CARD_REACTIVATED, this.handleCardReactivation.bind(this));
    
    // Transaction events
    this.on(UserEventType.USER_TRANSACTION_COMPLETED, this.handleTransactionCompleted.bind(this));
    this.on(UserEventType.USER_SAVINGS_MILESTONE, this.handleSavingsMilestone.bind(this));
    
    // Subscription events
    this.on(UserEventType.USER_SUBSCRIPTION_CREATED, this.handleSubscriptionCreated.bind(this));
    this.on(UserEventType.USER_SUBSCRIPTION_RENEWED, this.handleSubscriptionRenewed.bind(this));
    this.on(UserEventType.USER_SUBSCRIPTION_CANCELLED, this.handleSubscriptionCancelled.bind(this));
    this.on(UserEventType.USER_SUBSCRIPTION_EXPIRED, this.handleSubscriptionExpired.bind(this));
    
    // Security events
    this.on(UserEventType.USER_SECURITY_ALERT, this.handleSecurityAlert.bind(this));
    this.on(UserEventType.USER_ACCOUNT_LOCKED, this.handleAccountLocked.bind(this));
    this.on(UserEventType.USER_2FA_ENABLED, this.handle2FAEnabled.bind(this));
    
    // Referral events
    this.on(UserEventType.USER_REFERRAL_COMPLETED, this.handleReferralCompleted.bind(this));
    this.on(UserEventType.USER_REFERRAL_REWARD_EARNED, this.handleReferralRewardEarned.bind(this));
  }

  public emitUserEvent<T extends UserEventData>(
    eventType: UserEventType,
    data: T,
    priority: EventPriority = EventPriority.MEDIUM
  ): void {
    try {
      const event: UserEvent = {
        id: this.generateEventId(),
        type: eventType,
        userId: data.userId,
        timestamp: new Date(),
        data,
        priority,
        status: EventStatus.PENDING,
        retryCount: 0
      };

      // Log event
      this.logger.info(`Emitting user event: ${eventType}`, { 
        userId: data.userId, 
        eventId: event.id 
      });

      // Track metrics
      this.metricsService.incrementCounter(`user_events.${eventType}`);

      // Emit event
      this.emit(eventType, event);

      // Queue for async processing if high priority
      if (priority === EventPriority.HIGH) {
        this.queueService.addToQueue('user-events-high-priority', event);
      }

      // Audit log
      this.auditService.log({
        action: eventType,
        userId: data.userId,
        details: data,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Error emitting user event', error as Error, {
        eventType,
        userId: data.userId
      });
      this.metricsService.incrementCounter('user_events.errors');
    }

  private async handleUserRegistration(event: UserEvent): Promise<void> {
    const data = event.data as UserRegistrationEventData;
    
    try {
      // Send welcome email
      await this.notificationService.sendNotification({
        userId: data.userId,
        type: 'email',
        templateId: 'welcome_email',
        data: {
          firstName: data.firstName,
          email: data.email
        });

      // Track registration metrics
      this.metricsService.incrementCounter('users.registrations');
      this.metricsService.incrementCounter(`users.registrations.${data.registrationSource}`);

      // Check for referral
      if (data.referralCode) {
        await this.processReferral(data.userId, data.referralCode);
      }

      // Cache user data for quick access
      await this.cacheService.set(
        `user:${data.userId}:basic`,
        {
          id: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        },
        3600 // 1 hour TTL
      );

    } catch (error) {
      this.logger.error('Error handling user registration', error as Error, {
        userId: data.userId
      });
    }

  private async handleUserVerification(event: UserEvent): Promise<void> {
    
    try {
      // Send verification success notification
      await this.notificationService.sendNotification({
        userId: data.userId,
        type: 'email',
        templateId: 'verification_success',
        data: {});

      // Update user status in cache
      await this.cacheService.delete(`user:${data.userId}:unverified`);
      
      this.metricsService.incrementCounter('users.verifications');
    } catch (error) {
      this.logger.error('Error handling user verification', error as Error, {
        userId: data.userId
      });
    }

  private async handleUserLogin(event: UserEvent): Promise<void> {
    
    try {
      // Track login metrics
      this.metricsService.incrementCounter('users.logins');
      this.metricsService.incrementCounter(`users.logins.${data.loginMethod}`);

      // Check for suspicious activity
      if (await this.isLoginSuspicious(data)) {
        this.emitUserEvent(
          UserEventType.USER_SECURITY_ALERT,
          {
            userId: data.userId,
            timestamp: new Date(),
            action: 'suspicious_login',
            ipAddress: data.ipAddress,
            userAgent: 
}}}}}
}
}
}
}
}
