import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../../../services/user.service';
import { UserRepository } from '../../../repositories/user.repository';
import { EmailService } from '../../../services/email.service';
import { CacheService } from '../../../services/cache.service';
import { PaymentService } from '../../../services/payment.service';
import { AppError } from '../../../utils/errors';
import { UserRole, UserStatus, SubscriptionStatus } from '../../../types/enums';
import { User, CreateUserDto, UpdateUserDto, LoginDto, ResetPasswordDto } from '../../../types/user.types';
import { logger } from '../../../utils/logger';
import config from '../../../config';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../services/email.service');
jest.mock('../../../services/cache.service');
jest.mock('../../../services/payment.service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../utils/logger');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockPaymentService: jest.Mocked<PaymentService>;
;
const mockUser: User = {
  id: uuidv4(),
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+359888123456',
    role: UserRole.CONSUMER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: false,
    language: 'en',
    timezone: 'Europe/Sofia',
    avatarUrl: null,
    dateOfBirth: new Date('1990-01-01'),
    address: {
  street: '123 Main St',
      city: 'Sofia',
      postalCode: '1000',
      country: 'BG'
    },
    preferences: {
  notifications: {
  email: true,
        sms: false,
        push: true
      },
      categories: ['restaurants', 'entertainment'],
      dietary: ['vegetarian']
    },
    subscription: {
  id: uuidv4(),
      status: SubscriptionStatus.ACTIVE,
      plan: 'premium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      paymentMethod: 'card'
    },
    stats: {
  totalSavings: 150.50,
      transactionCount: 25,
      favoritePartners: 5,
      lastActive: new Date()
    },
    metadata: {
  referralCode: 'JOHN123',
      referredBy: null,
      marketingConsent: true,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    mockUserRepository = {
  create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByReferralCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      updateLastActive: jest.fn(),
      updateStats: jest.fn()
    } as any;

    mockEmailService = {
  sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendWelcomeEmail: jest.fn(),
      sendSubscriptionConfirmation: jest.fn()
    } as any;

    mockCacheService = {
  get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    } as any;

    mockPaymentService = {
  createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      updatePaymentMethod: jest.fn()
    } as any;

    userService = new UserService(
      mockUserRepository,
      mockEmailService,
      mockCacheService,
      mockPaymentService
    );

    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
  email: 'newuser@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+359888987654',
      language: 'en',
      marketingConsent: true,
      referralCode: 'REF123'
    }

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword';
      // const verificationToken = 'verificationToken'; // TODO: Move to proper scope
      // const newUser = { ...mockUser, id: uuidv4(), email: createUserDto.email },; // TODO: Move to proper scope
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue(verificationToken);
      mockUserRepository.create.mockResolvedValue(newUser);
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);
;
// const result = await userService.register(createUserDto); // TODO: Move to proper scope

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.findByPhone).toHaveBeenCalledWith(createUserDto.phone);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
  email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName
      }));
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        verificationToken
      );
      expect(result).toEqual(expect.objectContaining({
  id: newUser.id,
        email: newUser.email
      }));
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.register(createUserDto)).rejects.toThrow(
        new AppError('Email already registered', 409)
      );
    });

    it('should throw error if phone already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(mockUser);

      await expect(userService.register(createUserDto)).rejects.toThrow(
        new AppError('Phone number already registered', 409)
      );
    });

    it('should handle referral code if provided', async () => {
      const referrer = { ...mockUser, id: uuidv4() },;
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);
      mockUserRepository.findByReferralCode.mockResolvedValue(referrer);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue({ ...mockUser, id: uuidv4() }),
      await userService.register(createUserDto);

      expect(mockUserRepository.findByReferralCode).toHaveBeenCalledWith(createUserDto.referralCode);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
  metadata: expect.objectContaining({
  referredBy: referrer.id
        })
      }));
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
  email: 'test@example.com',
      password: 'SecurePass123!',
      rememberMe: true
    }

    it('should successfully login user with valid credentials', async () => {
      const accessToken = 'accessToken';
      // const refreshToken = 'refreshToken'; // TODO: Move to proper scope

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      mockCacheService.set.mockResolvedValue(undefined);
      mockUserRepository.updateLastActive.mockResolvedValue(undefined);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `user:${mockUser.id}`,
        mockUser,
        3600
      );
      expect(result).toEqual({
  user: expect.objectContaining({
  id: mockUser.id,
          email: mockUser.email
        }),
        accessToken,
        refreshToken
      });
    });

    it('should throw error for invalid email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
    });

    it('should throw error for invalid password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
    });

    it('should throw error for inactive user', async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE },;
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new AppError('Account is inactive', 403)
      );
    });

    it('should throw error for unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false },;
      mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new AppError('Email not verified', 403)
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile from cache if available', async () => {
      mockCacheService.get.mockResolvedValue(mockUser);

}
}
});
