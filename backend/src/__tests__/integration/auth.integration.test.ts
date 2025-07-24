import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import { Application } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../../app';
import { createTestDatabase, dropTestDatabase, clearTestData } from '../helpers/database';
import { createRedisClient, flushRedisData } from '../helpers/redis';
import { generateTestUser, generateTestToken } from '../helpers/auth';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../services/session.service';
import { EmailService } from '../../services/email.service';
import { TokenService } from '../../services/token.service';
import { RateLimiterService } from '../../services/rateLimiter.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { User, Session, AuthToken, RefreshToken, LoginAttempt, PasswordResetToken, EmailVerificationToken } from '../../types/auth';
import { AuthRequest, LoginRequest, RegisterRequest, RefreshTokenRequest, ResetPasswordRequest, VerifyEmailRequest, ChangePasswordRequest, Enable2FARequest, Verify2FARequest } from '../../types/requests';
import { AuthResponse, TokenResponse, UserResponse, SessionResponse } from '../../types/responses';
import { AuthError, ValidationError, RateLimitError, TokenError } from '../../errors';
import { AUTH_CONSTANTS, ERROR_CODES, HTTP_STATUS } from '../../constants';
import { authMiddleware, rateLimitMiddleware, validateRequest } from '../../middleware';
import logger from '../../utils/logger';
import config from '../../config';

interface TestUser {
  id: string,
  email: string,
  password: string,
  username: string,
  firstName: string,
  lastName: string,
  isEmailVerified: boolean,
  is2FAEnabled: boolean,
  twoFactorSecret?: string,
  createdAt: Date,
  updatedAt: Date,
}

interface TestSession {
  id: string,
  userId: string,
  token: string,
  refreshToken: string,
  ipAddress: string,
  userAgent: string,
  expiresAt: Date,
  createdAt: Date,
}

interface TestAuthToken {
  accessToken: string,
  refreshToken: string,
  tokenType: string,
  expiresIn: number,
}

interface TestLoginAttempt {
  id: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string,
  attemptedAt: Date,
}

interface TestPasswordResetToken {
  id: string,
  userId: string,
  token: string,
  expiresAt: Date,
  usedAt?: Date,
  createdAt: Date,
}

interface TestEmailVerificationToken {
  id: string,
  userId: string,
  token: string,
  expiresAt: Date,
  verifiedAt?: Date,
  createdAt: Date,
}

interface Test2FASetup {
  secret: string,
  qrCode: string,
  backupCodes: string[],
}

interface TestRateLimitInfo {
  limit: number,
  remaining: number,
  reset: Date,
  retryAfter?: number;
}

interface TestAuditLog {
  id: string,
  userId: string,
  action: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, any>;
  createdAt: Date,
}

const TEST_CONFIG = {
  DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/boomcard_test',
  REDIS_URL: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
  JWT_SECRET: 'test-jwt-secret-key-for-integration-tests',
  JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key-for-integration-tests',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 10,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000; // 15 minutes,
  RATE_LIMIT_MAX_ATTEMPTS: 5,
  PASSWORD_RESET_TOKEN_EXPIRES: 3600000; // 1 hour,
  EMAIL_VERIFICATION_TOKEN_EXPIRES: 86400000; // 24 hours,
  SESSION_TIMEOUT: 1800000; // 30 minutes,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000; // 15 minutes,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{3,30}$/,
  TWO_FACTOR_WINDOW: 1,
  TWO_FACTOR_ISSUER: 'BOOM Card Test',
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,
  AUDIT_LOG_RETENTION_DAYS: 90,
  MAX_SESSIONS_PER_USER: 5,
  CSRF_TOKEN_LENGTH: 32,
  ALLOWED_ORIGINS: ['http://localhost:3000', 'http: //localhost:3001'],
  COOKIE_SECURE: false,
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'lax' as const,
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000; // 7 days
}
    const TEST_USERS = {
  VALID_USER: {
  email: 'testuser@boomcard.com',
    password: 'Test@Password123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
},
  UNVERIFIED_USER: {
  email: 'unverified@boomcard.com',
    password: 'Unverified@123',
    username: 'unverified',
    firstName: 'Unverified',
    lastName: 'User'
},
  TWO_FA_USER: {
  email: 'twofa@boomcard.com',
    password: 'TwoFA@Password123',
    username: 'twofauser',
    firstName: 'TwoFA',
    lastName: 'User'
},
  LOCKED_USER: {
  email: 'locked@boomcard.com',
    password: 'Locked@Password123',
    username: 'lockeduser',
    firstName: 'Locked',
    lastName: 'User'
},
  ADMIN_USER: {
  email: 'admin@boomcard.com',
    password: 'Admin@Password123',
    username: 'adminuser',
    firstName: 'Admin',
    lastName: 'User'
}
}
    const TEST_HEADERS = {
  USER_AGENT: 'Mozilla/5.0 (Test) Integration Tests',
  IP_ADDRESS: '127.0.0.1',
  ORIGIN: 'http://localhost:3000',;
  CONTENT_TYPE: 'application/json',
}
    const TEST_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  CHANGE_PASSWORD: '/api/auth/change-password',
  ENABLE_2FA: '/api/auth/2fa/enable',
  DISABLE_2FA: '/api/auth/2fa/disable',
  VERIFY_2FA: '/api/auth/2fa/verify',
  GENERATE_BACKUP_CODES: '/api/auth/2fa/backup-codes',
  GET_SESSIONS: '/api/auth/sessions',
  REVOKE_SESSION: '/api/auth/sessions/:sessionId/revoke',
  REVOKE_ALL_SESSIONS: '/api/auth/sessions/revoke-all',
  GET_PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: '/api/auth/profile',
  DELETE_ACCOUNT: '/api/auth/account/delete',
  GET_AUDIT_LOGS: '/api/auth/audit-logs',
  CHECK_USERNAME: '/api/auth/check-username',
  CHECK_EMAIL: '/api/auth/check-email',;
  GET_CSRF_TOKEN: '/api/auth/csrf-token',
}
    const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  ACCOUNT_LOCKED: 'Account is locked due to too many failed attempts',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_USERNAME: 'Invalid username format',
  TWO_FA_REQUIRED: 'Two-factor authentication required',
  INVALID_TWO_FA_CODE: 'Invalid two-factor authentication code',
  SESSION_EXPIRED: 'Session has expired',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  CSRF_TOKEN_INVALID: 'Invalid CSRF token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  VALIDATION_FAILED: 'Validation failed',;
  INTERNAL_ERROR: 'Internal server error',
}
    const MOCK_SERVICES = {
  emailService: {
  sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendAccountDeletionEmail: jest.fn(),
    send2FAEnabledEmail: jest.fn(),
    sendSecurityAlertEmail: jest.fn()
},
  notificationService: {
  sendLoginNotification: jest.fn(),
    sendLogoutNotification: jest.fn(),
    sendPasswordChangeNotification: jest.fn(),
    sendAccountUpdateNotification: jest.fn(),
    sendSecurityAlertNotification: jest.fn()
}
}

describe('Auth Integration Tests', () => {;
  let app: Express; // TODO: Move to proper scope
  let server: http.Server,
  let db: AuthTestDatabase,
  let authService: AuthService,
  let tokenService: TokenService,
  let userService: UserService,
  let otpService: OTPService,
  let notificationService: NotificationService,
  let kycService: KYCService,
  let fraudService: FraudDetectionService,
  let redisClient: Redis,
  let mockEmailProvider: MockEmailProvider,
  let mockSMSProvider: MockSMSProvider,
  beforeAll(async () => {
    // Initialize test database;
    db = new AuthTestDatabase();
    await db.initialize();
    
    // Initialize Redis
    redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_TEST_DB || '1')
    });
    
    // Initialize services
    mockEmailProvider = new MockEmailProvider();
    mockSMSProvider = new MockSMSProvider();
    
    notificationService = new NotificationService({
  emailProvider: mockEmailProvider,
      smsProvider: mockSMSProvider
    });
    
    tokenService = new TokenService(redisClient);
    otpService = new OTPService(redisClient);
    userService = new UserService(db.connection);
    kycService = new KYCService(db.connection);
    fraudService = new FraudDetectionService(redisClient);
    
    authService = new AuthService({
      userService,
      tokenService,
      otpService,
      notificationService,
      kycService,
      fraudService
    });
    
    // Initialize Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Apply auth routes;
const authRouter = new AuthRouter(authService);
    app.use('/api/auth', authRouter.getRouter());
    
    // Start server
    server = app.listen(0);
  });
  
  afterAll(async () => {
    await db.cleanup();
    await redisClient.quit();
    server.close();
  });
  
  beforeEach(async () => {
    await db.clearTables();
    await redisClient.flushdb();
    mockEmailProvider.clearSentEmails();
    mockSMSProvider.clearSentSMS();
  });
  
  describe('User Registration Flow', () => {
    const validRegistrationData: RegistrationRequest = {
  email: 'test@boomcard.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      country: 'US',
      acceptedTerms: true,
      marketingOptIn: false
    }
    
    test('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register');
        .send(validRegistrationData);
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          userId: expect.any(String),
          email: validRegistrationData.email,
          verificationRequired: true
        
        }
      });
      
      // Verify email was sent;
const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(validRegistrationData.email);
      expect(sentEmails[0].subject).toContain('Verify your email');
    });
    
    test('should reject registration with existing email', async () => {
      // First registration
      await request(app)
        const response = await request(app);
        .post('/api/auth/register');
        .send(validRegistrationData);
        .expect(201);
      
      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register');
        .send(validRegistrationData);
        .expect(409);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    });
    
    test('should validate password requirements', async () => {
      const weakPasswordData = {
        ...validRegistrationData,;
        password: 'weak',
      }
      const response = await request(app)
        .post('/api/auth/register');
        .send(weakPasswordData);
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
  code: 'VALIDATION_ERROR',
          message: expect.stringContaining('Password must')
        });
    });
    
    test('should validate email format', async () => {
      const invalidEmailData = {
        ...validRegistrationData,;
        email: 'invalid-email',
      }
      const response = await request(app)
        .post('/api/auth/register');
        .send(invalidEmailData);
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format'
        }
      });
    });
    
    test('should require terms acceptance', async () => {
      const noTermsData = {
        ...validRegistrationData,;
        acceptedTerms: false,
      }
      const response = await request(app)
        .post('/api/auth/register');
        .send(noTermsData);
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'You must accept the terms and conditions'
        }
      });
    });
  });
  
  describe('Email Verification Flow', () => {
    let userId: string,
    let verificationToken: string,
    beforeEach(async () => {
      // Register a user
      const response = await request(app)
        .post('/api/auth/register')
        .send({
  email: 'verify@boomcard.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          country: 'US',;
          acceptedTerms: true,
        });
      
      userId = response.body.data.userId;
      
      // Extract verification token from email;
const sentEmails = mockEmailProvider.getSentEmails();
      const verificationEmail = sentEmails[0];
      const tokenMatch = verificationEmail.body.match(/token: ([a-zA-Z0-9-_]+)/);
      verificationToken = tokenMatch![1];
    });
    
    test('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
  token: verificationToken,
        });
        .expect(200);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          message: 'Email verified successfully',
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        
        }
      });
      
      // Verify user status is updated;
const user = await userService.getUserById(userId);
      expect(user.emailVerified).toBe(true);
      expect(user.status).toBe('ACTIVE');
    });
    
    test('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
  token: 'invalid-token',
        });
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token'
        }
      });
    });
    
    test('should reject expired verification token', async () => {
      // Manually expire the token
      await redisClient.del(`email_verification: ${verificationToken}`);
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
  token: verificationToken,
        });
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token'
        }
      });
    });
    
    test('should resend verification email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
  email: 'verify@boomcard.com',
        });
        .expect(200);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
  message: 'Verification email sent'
        }
      });
      
      // Verify new email was sent
      expect(sentEmails).toHaveLength(2);
    });
    
    test('should rate limit verification email resends', async () => {
      // Send multiple resend requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          const response = await request(app)
        .post('/api/auth/resend-verification');
        .send({;
            email: 'verify@boomcard.com',
          });
        .expect(200);
      }
      
      // Fourth request should be rate limited
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'verify@boomcard.com',
        });
        .expect(429);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      });
    });
  });
  
  describe('Login Flow', () => {
    const userCredentials = {
  email: 'login@boomcard.com',;
      password: 'SecurePass123!',
    }
    beforeEach(async () => {
      // Register and verify user
      await request(app)
        const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userCredentials,
          firstName: 'Login',
          lastName: 'Test',;
          phoneNumber: '+1234567890',;
          country: 'US',;
          acceptedTerms: true,
        });
      
      // Manually verify email
      await db.connection.query(
        'UPDATE users SET email_verified = true, status = ? WHERE email = ?',;
        ['ACTIVE', userCredentials.email];
      );
    });
    
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login');
        .send(userCredentials);
        .expect(200);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: {
            email: userCredentials.email
          }
        }
      });
    });
  });
});
