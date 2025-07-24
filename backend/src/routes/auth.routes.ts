import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import crypto from 'crypto';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import { sendEmail } from '../services/email.service';
import { generateOTP, verifyOTP } from '../services/otp.service';
import { createAuditLog } from '../services/audit.service';
import { detectDeviceInfo } from '../utils/device.utils';
import { generateSecureToken } from '../utils/token.utils';
import { config } from '../config';
import { logger } from '../utils/logger';
;
interface AuthRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
    businessId?: string;
  }
  deviceInfo?: DeviceInfo;
}
interface DeviceInfo {
  userAgent: string;
  ip: string,
  deviceId?: string
  fingerprint?: string}
interface RegisterBody {
  email: string;
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string
  businessName?: string,
  acceptTerms: boolean,
  referralCode?: string}
interface LoginBody {
  email: string;
  password: string,
  rememberMe?: boolean
  deviceId?: string}
interface TokenPayload {
  userId: string;
  email: string,
  role: string,
  businessId?: string,
  sessionId: string,
}
interface RefreshTokenBody {
  refreshToken: string;
}
interface ResetPasswordBody {
  token: string;
  newPassword: string,
}
interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string,
}
interface Enable2FAResponse {
  secret: string;
  qrCode: string,
  backupCodes: string[],
}
interface Verify2FABody {
  token: string;
  type: '2fa' | 'backup',
}
interface OAuthCallbackQuery {
  code?: string
  state?: string
  error?: string}
interface SessionData {
  userId: string;
  deviceInfo: DeviceInfo,
  createdAt: Date,
  expiresAt: Date,
  lastActivityAt: Date,
}
const prisma = new PrismaClient();

const redis = new Redis(config.redis.url);

const googleClient = new OAuth2Client(config.oauth.google.clientId);
;

const ACCESS_TOKEN_EXPIRES_IN = '15m';

const REFRESH_TOKEN_EXPIRES_IN = '7d';

const REMEMBER_ME_EXPIRES_IN = '30d';

const PASSWORD_RESET_EXPIRES_IN = '1h';

const EMAIL_VERIFICATION_EXPIRES_IN = '24h';

const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes;

const MAX_LOGIN_ATTEMPTS = 5;

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes;

const OTP_LENGTH = 6;

const BACKUP_CODES_COUNT = 10;
;

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth',
  points: 10,
  duration: 60,
  blockDuration: 60 * 5;
});
;

const loginRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:login',
  points: MAX_LOGIN_ATTEMPTS,
  duration: LOCKOUT_DURATION / 1000,
  blockDuration: LOCKOUT_DURATION / 1000;
});
;

const passwordResetRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:password-reset',
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60;
});

// Middleware,
  windowMs: 15 * 60 * 1000, // 15 minutes,
  max: 5, // 5 requests per window,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

// Route handlers;
export class AuthRoutes {
  private authService: AuthService,
  private userService: UserService,
  private emailService: EmailService,
  private smsService: SMSService,
  private totpService: TOTPService,
  private sessionService: SessionService,
  private auditService: AuditService,
  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.totpService = new TOTPService();
    this.sessionService = new SessionService();
    this.auditService = new AuditService();
  }

  public routes(): Router {
    const router = Router();

    // Public routes
    router.post('/register', rateLimiter, validateRegistration, this.register.bind(this));
    router.post('/login', loginRateLimiter, validateLogin, this.login.bind(this));
    router.post('/logout', authenticate, this.logout.bind(this));
    router.post('/refresh', this.refreshToken.bind(this));
    
    // Password management
    router.post('/forgot-password', rateLimiter, validateEmail, this.forgotPassword.bind(this));
    router.post('/reset-password', rateLimiter, validatePasswordReset, this.resetPassword.bind(this));
    router.post('/change-password', authenticate, validatePasswordChange, this.changePassword.bind(this));
    
    // Email verification
    router.post('/verify-email', validateEmailVerification, this.verifyEmail.bind(this));
    router.post('/resend-verification', rateLimiter, authenticate, this.resendVerification.bind(this));
    
    // Two-factor authentication
    router.post('/2fa/enable', authenticate, this.enable2FA.bind(this));
    router.post('/2fa/verify', authenticate, validate2FAVerification, this.verify2FA.bind(this));
    router.post('/2fa/disable', authenticate, validate2FADisable, this.disable2FA.bind(this));
    router.post('/2fa/backup-codes', authenticate, this.generateBackupCodes.bind(this));
    
    // OAuth
    router.get('/oauth/:provider', this.oauthRedirect.bind(this));
    router.get('/oauth/:provider/callback', this.oauthCallback.bind(this));
    
    // Session management
    router.get('/sessions', authenticate, this.getSessions.bind(this));
    router.delete('/sessions/:sessionId', authenticate, this.revokeSession.bind(this));
    router.delete('/sessions', authenticate, this.revokeAllSessions.bind(this));
    
    // Security
    router.get('/security/audit-log', authenticate, this.getAuditLog.bind(this));
    router.post('/security/verify-device', authenticate, this.verifyDevice.bind(this));

    return router;
  }

  private async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Check if user exists;

const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('User already exists');
      };

      // Create user;

const hashedPassword = await bcrypt.hash(password, 12);

      const user = await this.userService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber;
});

      // Generate verification token;

const verificationToken = crypto.randomBytes(32).toString('hex');
      await this.authService.saveVerificationToken(user.id, verificationToken);

      // Send verification email
      await this.emailService.sendVerificationEmail(email, verificationToken);

      // Generate tokens;

const { accessToken, refreshToken } = await this.authService.generateTokens(user);

      // Create session
      await this.sessionService.create({
  userId: user.id,
        refreshToken,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
});

      // Audit log
      await this.auditService.log({
  userId: user.id,
        action: AuditAction.USER_REGISTERED,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
});

      res.status(201).json({
      message: 'Registration successful. Please verify your email.',
        user: {
  id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
},
        tokens: {
          accessToken,
          refreshToken
}
});
    } catch (error) {
      next(error);
    }
    }
    private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;

      // Find user
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password;

const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.auditService.log({
  userId: user.id,
          action: AuditAction.LOGIN_FAILED,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
});
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new UnauthorizedError('Please verify your email before logging in');
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled && !req.body.twoFactorCode) {
        res.status(200).json({
      requiresTwoFactor: true,
          tempToken: await this.authService.generateTempToken(user.id)
});
        return;
      }

      // Verify 2FA if provided
      if (user.twoFactorEnabled && req.body.twoFactorCode) {
        const isValid = await this.totpService.verify(user.twoFactorSecret, req.body.twoFactorCode);
        if (!isValid) {
          throw new UnauthorizedError('Invalid 2FA code');
        };

      // Generate tokens;

const tokenOptions = rememberMe ? { expiresIn: '30d' } : undefined,
      const { accessToken, refreshToken } = await this.authService.generateTokens(user, tokenOptions);

      // Create session
      await this.sessionService.create({
  userId: user.id,
        refreshToken,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
        rememberMe
});

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Audit log
      await this.auditService.log({
  userId: user.id,
        action: AuditAction.USER_LOGIN,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
});

      res.json({
  message: 'Login successful',
        user: {
  id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          twoFactorEnabled: user.twoFactorEnabled
},
        tokens: {
          accessToken,
          refreshToken
}
});
    } catch (error) {
      next(error);
    }
    }
    private async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const userId = req.user!.id;

      // Revoke session
      if (refreshToken) {
        await this.sessionService.revokeByRefreshToken(refreshToken);
      };

      // Audit log
      await this.auditService.log({
        userId,
        action: AuditAction.USER_LOGOUT,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
});

      res.json({ message: 'Logout successful' }),
    } catch (error) {
      next(error);
    }
    }
    private async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token required');
      }

      // Verify refresh token;

const payload = await this.authService.verifyRefreshToken(refreshToken);
      
      // Check session;

const session = await this.sessionService.findByRefreshToken(refreshToken);
      if (!session || session.revoked) {
        throw new UnauthorizedError('Invalid refresh token');
      };

      // Get user
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Generate new tokens;

const tokens = await this.authService.generateTokens(user);

      // Update session
      await this.sessionService.updateRefreshToken(session.id, tokens.refreshToken);

      res.json({
  accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
});
    } catch (error) {
      next(error);
    }
    }
    private async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!user) {
        // Don't reveal if user exists
        res.json({ message: 'If the email exists, a reset link has been sent' });
        return;
      }

      // Generate reset token;

const resetToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      await this.authService.savePasswordResetToken(user.id, hashedToken);

      // Send reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken);

      // Audit log
      aw
}

}