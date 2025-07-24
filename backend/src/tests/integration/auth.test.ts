import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { Application } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createTestApp } from '../helpers/testApp';
import { createTestDatabase, cleanupTestDatabase } from '../helpers/testDb';
import { createTestRedisClient, cleanupRedisClient } from '../helpers/testRedis';
import { generateMockUser, generateMockSession } from '../helpers/mockData';
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { SessionService } from '../../services/SessionService';
import { EmailService } from '../../services/EmailService';
import { TokenService } from '../../services/TokenService';
import { RateLimiter } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { ValidationMiddleware } from '../../middleware/validation';
import { ErrorHandler } from '../../middleware/errorHandler';
import { User, Session, RefreshToken, EmailVerificationToken } from '../../models';
import { AuthError, ValidationError, RateLimitError } from '../../errors';
import { UserRole, TokenType, SessionStatus } from '../../types/enums';
import { config } from '../../config';
;
interface TestUser {
  id: string;
  email: string;
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  isVerified: boolean,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}
;
interface TestSession {
  id: string;
  userId: string;
  token: string,
  refreshToken: string,
  deviceInfo: DeviceInfo,
  ipAddress: string,
  status: SessionStatus,
  expiresAt: Date,
  lastActivityAt: Date,
  createdAt: Date,
}
;
interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string,
  version: string,
  os: string,
  device: string,
}
;
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number,
  tokenType: string,
}
;
interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
  rememberMe?: boolean;
}
;
interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string,
  firstName: string,
  lastName: string,
  acceptTerms: boolean,
}
;
interface RefreshTokenRequest {
  refreshToken: string;
  deviceInfo?: DeviceInfo;
}
;
interface PasswordResetRequest {
  email: string;
}
;
interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string,
}
;
interface EmailVerificationRequest {
  token: string;
}
;
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string,
}
;
interface TestContext {
  app: Application;
  db: Pool;
  redis: Redis,
  authService: AuthService,
  userService: UserService,
  sessionService: SessionService,
  emailService: EmailService,
  tokenService: TokenService,
}
;
// const TEST_CONFIG = {
  database: {
  host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    user: process.env.TEST_DB_USER || 'test',
    password: process.env.TEST_DB_PASSWORD || 'test',
    database: process.env.TEST_DB_NAME || 'boomcard_test'
},
  redis: {
  host: process.env.TEST_REDIS_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
    password: process.env.TEST_REDIS_PASSWORD
},
  jwt: {
  secret: process.env.TEST_JWT_SECRET || 'test-secret-key',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
},
  rateLimit: {
  windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    skipSuccessfulRequests: false
},
  bcrypt: {
  saltRounds: 10
}
}
    const ENDPOINTS = {
  register: '/api/v1/auth/register',
  login: '/api/v1/auth/login',
  logout: '/api/v1/auth/logout',
  refresh: '/api/v1/auth/refresh',
  verifyEmail: '/api/v1/auth/verify-email',
  resendVerification: '/api/v1/auth/resend-verification',
  forgotPassword: '/api/v1/auth/forgot-password',
  resetPassword: '/api/v1/auth/reset-password',
  changePassword: '/api/v1/auth/change-password',
  me: '/api/v1/auth/me',
  sessions: '/api/v1/auth/sessions',
  revokeSession: '/api/v1/auth/sessions/:sessionId/revoke',
  revokeAllSessions: '/api/v1/auth/sessions/revoke-all'
};
    const DEFAULT_DEVICE_INFO: DeviceInfo = {; // TODO: Move to proper scope
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  platform: 'MacOS',
  browser: 'Chrome',
  version: '120.0.0',
  os: 'MacOS 10.15.7',
  device: 'Desktop'
}
    // const MOCK_USERS = {
  verified: {
  email: 'verified@test.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isVerified: true,
    isActive: true
},
  unverified: {
  email: 'unverified@test.com',
    password: 'Password123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.USER,
    isVerified: false,
    isActive: true
},
  admin: {
  email: 'admin@test.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isVerified: true,
    isActive: true
},
  inactive: {
  email: 'inactive@test.com',
    password: 'Password123!',
    firstName: 'Inactive',
    lastName: 'User',
    role: UserRole.USER,
    isVerified: true,
    isActive: false
}
}
    const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  ACCOUNT_INACTIVE: 'Your account has been deactivated',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  SESSION_NOT_FOUND: 'Session not found',
  UNAUTHORIZED: 'Unauthorized',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  INVALID_PASSWORD_FORMAT: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  TERMS_NOT_ACCEPTED: 'You must accept the terms and conditions'
};
    const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

describe('Auth Integration Tests', () => {
  let app: Application; // TODO: Move to proper scope
  let server: any;
  let testDb: any;
  beforeAll(async () => {
    // Initialize test database;
    testDb = await initTestDatabase();
    
    // Create Express app with auth middleware
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    
    // Initialize auth middleware;
// const authMiddleware = new AuthMiddleware({
  jwtSecret: process.env.JWT_SECRET || 'test-secret',
      sessionStore: new RedisStore({
  client: createMockRedisClient()
}); // TODO: Move to proper scope
});
    
    // Setup routes;
// const authRoutes = new AuthRoutes(authMiddleware); // TODO: Move to proper scope
    app.use('/api/auth', authRoutes.getRouter());
    
    server = app.listen(0);
  });

  afterAll(async () => {
    await testDb.close();
    server.close();
  });

  beforeEach(async () => {
    await testDb.clear();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // const userData = {
  email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
}
    const response = await request(app)
        .post('/api/auth/register')
        .send(userData); // TODO: Move to proper scope
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        user: {
  email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
};
});
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
  email: 'duplicate@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Doe'
}

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email already registered'
});
    });

    it('should validate password requirements', async () => {
  email: 'weak@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
}

        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
});
    });
  });

  describe('POST /api/auth/login', () => {
    // const validUser = {
  email: 'user@example.com',
      password: 'ValidPass123!',
      firstName: 'Valid',
      lastName: 'User'
}

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register'); // TODO: Move to proper scope
        .send(validUser);
    });

    it('should login with valid credentials', async () => {
        .post('/api/auth/login')
        .send({
  email: validUser.email,
          password: validUser.password
})
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
  email: validUser.email,
          firstName: validUser.firstName,
          lastName: validUser.lastName
}
});
      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid password', async () => {
        .post('/api/auth/login')
        .send({
  email: validUser.email,
          password: 'WrongPassword123!'
})
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
});
    });

    it('should fail with non-existent email', async () => {
        .post('/api/auth/login')
        .send({
  email: 'nonexistent@example.com',
          password: 'AnyPass123!'
})
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
});
    });

    it('should implement rate limiting', async () => {
      // const loginAttempts = Array(6).fill(null).map(() => {
    request(app)
          .post('/api/auth/login')
          .send({
  email: validUser.email,
            password: 'WrongPassword'
}); // TODO: Move to proper scope
      );
;
// const responses = await Promise.all(loginAttempts); // TODO: Move to proper scope
      // const lastResponse = responses[responses.length - 1]; // TODO: Move to proper scope
      
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toMatchObject({
  success: false,
        error: 'Too many login attempts. Please try again later.'
});
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;
    beforeEach(async () => {
  email: 'logout@example.com',
        password: 'LogoutPass123!',
        firstName: 'Logout',
        lastName: 'Test'
}

        .post('/api/auth/register')
        .send(userData);
      
      authToken = response.body.token;
    });

    it('should logout successfully', async () => {
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully'
});
      expect(response.headers['set-cookie']).toMatch(/token=;/);
    });

    it('should invalidate token after logout', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid or expired token'
});
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
  email: 'me@example.com',
      password: 'MePass123!',
      firstName: 'Current',
      lastName: 'User'
}

    beforeEach(async () => {
        .post('/api/auth/register')
        .send(userData);
      
      authToken = response.body.token;
    });

    it('should return current user data', async () => {
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
  email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
}
});
    });

    it('should fail without authentication', async () => {
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Authentication required'
});
    });
  });

  describe('POST /api/auth/refresh', () => {
    let authToken: string;
    let refreshToken: string;
    beforeEach(async () => {
  email: 'refresh@example.com',
        password: 'RefreshPass123!',
        firstName: 'Refresh',
        lastName: 'Test'
}

        .post('/api/auth/register')
        .send(userData);
      
      authToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
  success: true
});
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.token).not.toBe(authToken);
    });

    it('should fail with invalid refresh token', async () => {
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid refresh token'
});
    });

    it('should fail with expired refresh token', async () => {
      // Mock token expiration
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Refresh token expired'
});
    });
  });

  describe('POST /api/auth/forgot-password', () => {
  email: 'forgot@example.com',
      password: 'ForgotPass123!',
      firstName: 'Forgot',
      lastName: 'User'
}

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should send password reset email', async () => {
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset email sent'
});

      // Verify email was sent
      expect(mockEmailSer
}
