import { jest } from '@jest/globals';
import { PushNotificationService } from '../push-notification.service';
import { NotificationRepository } from '../../repositories/notification.repository';
import { UserRepository } from '../../repositories/user.repository';
import { FirebaseService } from '../firebase.service';
import { EmailService } from '../email.service';
import { SMSService } from '../sms.service';
import { Logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { NotificationType, NotificationChannel, NotificationPriority } from '../../types/notification.types';
import { User } from '../../entities/user.entity';
import { NotificationTemplate } from '../../entities/notification-template.entity';
import { redis } from '../../config/redis';

jest.mock('../../repositories/notification.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../firebase.service');
jest.mock('../email.service');
jest.mock('../sms.service');
jest.mock('../../utils/logger');
jest.mock('../../config/redis');

describe('PushNotificationService', () => {
  let pushNotificationService: PushNotificationService;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockFirebaseService: jest.Mocked<FirebaseService>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockSMSService: jest.Mocked<SMSService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRedis: jest.Mocked<typeof redis>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '+359888123456',
    fcmToken: 'fcm-token-123',
    notificationPreferences: {
      email: true,
      push: true,
      sms: true,
      marketing: true,
      transactional: true,
      weeklyDigest: false
    },
    language: 'en'
  };

  const mockNotificationTemplate: NotificationTemplate = {
    id: 'template-123',
    type: NotificationType.DISCOUNT_USED,
    channel: NotificationChannel.PUSH,
    language: 'en',
    subject: 'Discount Used',
    body: 'Your {{discountAmount}}% discount at {{partnerName}} has been applied!',
    variables: ['discountAmount', 'partnerName'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockNotificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByType: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getTemplate: jest.fn(),
      getBatchNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      getUnreadCount: jest.fn()
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findBySegment: jest.fn(),
      updateFCMToken: jest.fn()
    } as any;

    mockFirebaseService = {
      sendNotification: jest.fn(),
      sendBatchNotifications: jest.fn(),
      sendToTopic: jest.fn(),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn()
    } as any;

    mockEmailService = {
      sendEmail: jest.fn(),
      sendBulkEmails: jest.fn()
    } as any;

    mockSMSService = {
      sendSMS: jest.fn(),
      sendBulkSMS: jest.fn()
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn()
    } as any;

    pushNotificationService = new PushNotificationService(
      mockNotificationRepository,
      mockUserRepository,
      mockFirebaseService,
      mockEmailService,
      mockSMSService,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    const notificationData = {
      userId: 'user-123',
      type: NotificationType.DISCOUNT_USED,
      title: 'Discount Applied',
      message: 'Your 20% discount at Restaurant XYZ has been applied!',
      data: {
        discountAmount: '20',
        partnerName: 'Restaurant XYZ',
        partnerId: 'partner-123',
        transactionId: 'trans-123'
      },
      priority: NotificationPriority.HIGH
    };

    it('should send notification through all enabled channels', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as User);
      mockNotificationRepository.getTemplate.mockResolvedValue(mockNotificationTemplate);
      mockFirebaseService.sendNotification.mockResolvedValue({ success: true });
      mockEmailService.sendEmail.mockResolvedValue({ success: true });
      mockSMSService.sendSMS.mockResolvedValue({ success: true });
      mockNotificationRepository.save.mockResolvedValue({ id: 'notif-123' } as any);

      const result = await pushNotificationService.sendNotification(notificationData);

      expect(result.success).toBe(true);
      expect(result.channels).toEqual(['push', 'email', 'sms']);
      expect(mockFirebaseService.sendNotification).toHaveBeenCalledWith({
        token: 'fcm-token-123',
        title: 'Discount Applied',
        body: 'Your 20% discount at Restaurant XYZ has been applied!',
        data: notificationData.data,
        priority: 'high'
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockSMSService.sendSMS).toHaveBeenCalled();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });

    it('should respect user notification preferences', async () => {
      const userWithPreferences = {
        ...mockUser,
        notificationPreferences: {
          ...mockUser.notificationPreferences,
          push: false,
          sms: false
        };
      mockUserRepository.findById.mockResolvedValue(userWithPreferences as User);
      mockNotificationRepository.getTemplate.mockResolvedValue(mockNotificationTemplate);
      mockEmailService.sendEmail.mockResolvedValue({ success: true });
      mockNotificationRepository.save.mockResolvedValue({ id: 'notif-123' } as any);


      expect(result.channels).toEqual(['email']);
      expect(mockFirebaseService.sendNotification).not.toHaveBeenCalled();
      expect(mockSMSService.sendSMS).not.toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      mockRedis.get.mockResolvedValue('10');
      mockUserRepository.findById.mockResolvedValue(mockUser as User);

      await expect(pushNotificationService.sendNotification(notificationData))
        .rejects.toThrow(AppError);
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Rate limit exceeded for user',
        { userId: 'user-123', limit: 10 }
      );
    });

    it('should handle user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(pushNotificationService.sendNotification(notificationData))
        .rejects.toThrow(AppError);
    });

    it('should continue if one channel fails', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as User);
      mockNotificationRepository.getTemplate.mockResolvedValue(mockNotificationTemplate);
      mockFirebaseService.sendNotification.mockRejectedValue(new Error('FCM error'));
      mockEmailService.sendEmail.mockResolvedValue({ success: true });
      mockSMSService.sendSMS.mockResolvedValue({ success: true });
      mockNotificationRepository.save.mockResolvedValue({ id: 'notif-123' } as any);


      expect(result.success).toBe(true);
      expect(result.channels).toEqual(['email', 'sms']);
      expect(result.failedChannels).toEqual(['push']);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should apply template variables', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as User);
      mockNotificationRepository.getTemplate.mockResolvedValue(mockNotificationTemplate);
      mockFirebaseService.sendNotification.mockResolvedValue({ success: true });
      mockNotificationRepository.save.mockResolvedValue({ id: 'notif-123' } as any);

      await pushNotificationService.sendNotification({
        ...notificationData,
        useTemplate: true
      });

      expect(mockFirebaseService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Your 20% discount at Restaurant XYZ has been applied!'
        })
      );
    });
  });

  describe('sendBulkNotifications', () => {
    const bulkNotificationData = {
      userIds: ['user-123', 'user-456', 'user-789'],
      type: NotificationType.MARKETING,
      title: 'New Partner Alert',
      message: '50% off at our new partner!',
      data: { partnerId: 'partner-new' };

    it('should send bulk notifications to multiple users', async () => {
      const users = [
        { ...mockUser, id: 'user-123' },
        { ...mockUser, id: 'user-456', fcmToken: 'fcm-456' },
        { ...mockUser, id: 'user-789', fcmToken: 'fcm-789' }
      ];
      mockUserRepository.findByIds.mockResolvedValue(users as User[]);
      mockFirebaseService.sendBatchNotifications.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
        responses: []
      });
      mockEmailService.sendBulkEmails.mockResolvedValue({ success: true });
      mockNotificationRepository.save.mockResolvedValue({ id: 'notif-123' } as any);


      expect(result.totalSent).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockFirebaseService.sendBatchNotifications).toHaveBeenCalled();
      expect(mockEmailService.sendBulkEmails).toHaveBeenCalled();
    });

    it('should handle partial failu
}}
}
}
