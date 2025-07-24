import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import { RefreshTokenRepository } from '../../../repositories/refreshToken.repository';
import { EmailService } from '../../../services/email.service';
import { RedisService } from '../../../services/redis.service';
import { AppError } from '../../../utils/errors';
import { UserRole, UserStatus } from '../../../types/user.types';
import { config } from '../../../config';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../repositories/refreshToken.repository');
jest.mock('../../../services/email.service');
jest.mock('../../../services/redis.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockRedisService: jest.Mocked<RedisService>;
;
// const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CONSUMER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneNumber: '+359888123456',
    preferredLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null
  }
    const mockTokens = {
  accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600
  };

  beforeEach(() => {; // TODO: Move to proper scope
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockRefreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;
    mockRedisService = new RedisService() as jest.Mocked<RedisService>;

    authService = new AuthService(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockEmailService,
      mockRedisService
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    // const registerDto = {
  email: 'newuser@example.com',
      password: 'StrongPassword123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+359888999888',
      preferredLanguage: 'en' as const
    }

    it('should successfully register a new user', async () => {; // TODO: Move to proper scope
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        ...mockUser,
        ...registerDto,
        emailVerified: false
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
;
// const result = await authService.register(registerDto); // TODO: Move to proper scope

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
        role: UserRole.CONSUMER,
        status: UserStatus.PENDING_VERIFICATION
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', registerDto.email);
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new AppError('Email already registered', 409)
      );
    });

    it('should handle partner registration with partner code', async () => {
      // const partnerRegisterDto = {
        ...registerDto,
        role: UserRole.PARTNER,
        partnerCode: 'PARTNER123'
      }
; // TODO: Move to proper scope
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.validatePartnerCode.mockResolvedValue(true);
      mockUserRepository.create.mockResolvedValue({
        ...mockUser,
        ...partnerRegisterDto,
        role: UserRole.PARTNER,
        emailVerified: false
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      expect(mockUserRepository.validatePartnerCode).toHaveBeenCalledWith('PARTNER123');
      expect(result.role).toBe(UserRole.PARTNER);
    });

    it('should throw error for invalid partner code', async () => {
        ...registerDto,
        role: UserRole.PARTNER,
        partnerCode: 'INVALID'
      }

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.validatePartnerCode.mockResolvedValue(false);

      await expect(authService.register(partnerRegisterDto)).rejects.toThrow(
        new AppError('Invalid partner code', 400)
      );
    });
  });

  describe('login', () => {
    // const loginDto = {
  email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    }

    it('should successfully login user with correct credentials', async () => {; // TODO: Move to proper scope
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);
      mockRefreshTokenRepository.create.mockResolvedValue({
  id: '1',
        userId: mockUser.id,
        token: mockTokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
      mockUserRepository.updateLastLogin.mockResolvedValue(undefined);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
  user: expect.objectContaining({
  id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }),
        tokens: mockTokens
      });
    });

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
    });

    it('should throw error for incorrect password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUserRepository.incrementFailedLoginAttempts.mockResolvedValue(1);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
      expect(mockUserRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error for unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false },;
      mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new AppError('Please verify your email before logging in', 403)
      );
    });

    it('should throw error for locked account', async () => {
      // const lockedUser = { 
        ...mockUser, ,
  lockedUntil: new Date(Date.now() + 60 * 60 * 1000),
        failedLoginAttempts: 5
      }; // TODO: Move to proper scope
      mockUserRepository.findByEmail.mockResolvedValue(lockedUser);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new AppError('Account is locked due to multiple failed login attempts', 423)
      );
    });

    it('should lock account after maximum failed attempts', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUserRepository.incrementFailedLoginAttempts.mockResolvedValue(5);
      mockUserRepository.lockAccount.mockResolvedValue(undefined);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
      expect(mockUserRepository.lockAccount).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date)
      );
    });

    it('should reset failed attempts on successful login', async () => {
      const userWithFailedAttempts = { ...mockUser, failedLoginAttempts: 3 },;
      mockUserRepository.findByEmail.mockResolvedValue(userWithFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      mockRefreshTokenRepository.create.mockResolvedValue({
  id: '1',
        userId: mockUser.id,
        token: 'token',
        expiresAt: new Date(),
        createdAt: new Date()
      });
      mockUserRepository.resetFailedLoginAttempts.mockResolvedValue(undefined);

      await authService.login(loginDto);

      expect(mockUserRepository.resetFailedLoginAttempts).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('refreshTokens', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens', async () => {
      const decodedToken = { userId: mockUser.id, jti: 'token-id' },;
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockRefreshTokenRepository.findByToken.mockResolvedValue({
  id: '1',
        userId: mockUser.id,
        token: r
}
}
});
