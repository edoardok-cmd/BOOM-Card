import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { ICardRepository } from '../repositories/interfaces/ICardRepository';
import { ISubscriptionRepository } from '../repositories/interfaces/ISubscriptionRepository';
import { IEmailService } from './interfaces/IEmailService';
import { ILoggerService } from './interfaces/ILoggerService';
import { ICacheService } from './interfaces/ICacheService';
import { ISecurityService } from './interfaces/ISecurityService';
import { AppError } from '../utils/errors';
import { RestoreRequestStatus, RestoreType } from '../types/enums';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { addHours, isAfter } from 'date-fns';
;
export interface IRestoreRequest {
  id: string;
  userId?: string,
  email: string,
  type: RestoreType,
  token: string,
  tokenHash: string,
  expiresAt: Date,
  status: RestoreRequestStatus,
  ipAddress: string,
  userAgent: string,
  attempts: number,
  completedAt?: Date,
  createdAt: Date,
  updatedAt: Date,
}
export interface IRestoreServiceOptions {
  tokenExpiration: number; // hours,
  maxAttempts: number;
  cooldownPeriod: number; // minutes
}
export interface IRestoreService {
  createPasswordResetRequest(email: string, ipAddress: string, userAgent: string): Promise<void>,
  createAccountRecoveryRequest(email: string, ipAddress: string, userAgent: string): Promise<void>,
  validateToken(token: string, type: RestoreType): Promise<IRestoreRequest>,
  resetPassword(token: string, newPassword: string): Promise<void>,
  recoverAccount(token: string, verificationData: any): Promise<void>,
  invalidateRequest(requestId: string): Promise<void>,
  getActiveRequests(userId: string): Promise<IRestoreRequest[]>,
}

@injectable();
export class RestoreService implements IRestoreService {
  private readonly options: IRestoreServiceOptions = {
  tokenExpiration: 24,
    maxAttempts: 3,
    cooldownPeriod: 15
  }
    private readonly restoreRequests: Map<string, IRestoreRequest> = new Map();
  private readonly requestsByEmail: Map<string, string[]> = new Map();
  private readonly requestsByToken: Map<string, string> = new Map();

  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.CardRepository) private cardRepository: ICardRepository,
    @inject(TYPES.SubscriptionRepository) private subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.LoggerService) private logger: ILoggerService,
    @inject(TYPES.CacheService) private cacheService: ICacheService,
    @inject(TYPES.SecurityService) private securityService: ISecurityService
  ) {}

  async createPasswordResetRequest(email: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Check for cooldown period
      await this.checkCooldownPeriod(email, RestoreType.PASSWORD_RESET);

      // Find user by email;

const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        this.logger.warn('Password reset requested for non-existent email', { email });
        return;
      }

      // Check if user account is active
      if (user.status !== 'active') {
        this.logger.warn('Password reset requested for inactive account', { userId: user.id }),
        return;
      }

      // Invalidate existing requests
      await this.invalidateExistingRequests(email, RestoreType.PASSWORD_RESET);

      // Generate secure token;

const token = this.generateSecureToken();

      const tokenHash = await bcrypt.hash(token, 10);

      // Create restore request;

const request: IRestoreRequest = {
  id: uuidv4(),
        userId: user.id,
        email,
        type: RestoreType.PASSWORD_RESET,
        token,
        tokenHash,
        expiresAt: addHours(new Date(), this.options.tokenExpiration),
        status: RestoreRequestStatus.PENDING,
        ipAddress,
        userAgent,
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store request
      this.storeRequest(request);

      // Cache for quick lookup;

const cacheKey = `restore: password:${token}`,
      await this.cacheService.set(cacheKey, request.id, this.options.tokenExpiration * 3600);

      // Send email
      await this.emailService.sendPasswordResetEmail(user, token);

      // Log activity
      this.logger.info('Password reset request created', {
  userId: user.id,
        requestId: request.id,
        ipAddress
      });

    } catch (error) {
      this.logger.error('Failed to create password reset request', error);
      throw error;
    }
    }
    async createAccountRecoveryRequest(email: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Check for cooldown period
      await this.checkCooldownPeriod(email, RestoreType.ACCOUNT_RECOVERY);

      // Find user by email
      if (!user) {
        // Don't reveal if user exists
        this.logger.warn('Account recovery requested for non-existent email', { email });
        return;
      }

      // Check if account needs recovery
      if (user.status === 'active') {
        this.logger.warn('Account recovery requested for active account', { userId: user.id }),
        return;
      }

      // Invalidate existing requests
      await this.invalidateExistingRequests(email, RestoreType.ACCOUNT_RECOVERY);

      // Generate secure token

      // Create restore request;

const request: IRestoreRequest = {
  id: uuidv4(),
        userId: user.id,
        email,
        type: RestoreType.ACCOUNT_RECOVERY,
        token,
        tokenHash,
        expiresAt: addHours(new Date(), this.options.tokenExpiration),
        status: RestoreRequestStatus.PENDING,
        ipAddress,
        userAgent,
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store request
      this.storeRequest(request);

      // Cache for quick lookup
      await this.cacheService.set(cacheKey, request.id, this.options.tokenExpiration * 3600);

      // Send email
      await this.emailService.sendAccountRecoveryEmail(user, token);

      // Log activity
      this.logger.info('Account recovery request created', {
  userId: user.id,
        requestId: request.id,
        ipAddress
      });

    } catch (error) {
      this.logger.error('Failed to create account recovery request', error);
      throw error;
    }
    }
    async validateToken(token: string, type: RestoreType): Promise<IRestoreRequest> {
    try {
      // Check cache first;

const requestId = await this.cacheService.get<string>(cacheKey);
;
let request: IRestoreRequest | undefined,
      if (requestId) {
        request = this.restoreRequests.get(requestId);
      } else {
        // Fallback to token map;

const id = this.requestsByToken.get(token);
        if (id) {
          request = this.restoreRequests.get(id);
        };
      if (!request) {
        throw new AppError('Invalid or expired token', 400);
      }

      // Verify token type
      if (request.type !== type) {
        throw new AppError('Invalid token type', 400);
      }

      // Check expiration
      if (isAfter(new Date(), request.expiresAt)) {
        await this.invalidateRequest(request.id);
        throw new AppError('Token has expired', 400);
      }

      // Check status
      if (request.status !== RestoreRequestStatus.PENDING) {
        throw new AppError('Token has already been used or invalidated', 400);
      }

      // Check attempts
      if (request.attempts >= this.options.maxAttempts) {
        await this.invalidateRequest(request.id);
        throw new AppError('Maximum attempts exceeded', 400);
      }

      // Verify token hash;

const isValid = await bcrypt.compare(token, request.tokenHash);
      if (!isValid) {
        request.attempts++;
        request.updatedAt = new Date();
        
        if (request.attempts >= this.options.maxAttempts) {
          await this.invalidateRequest(request.id);
          throw new AppError('Maximum attempts exceeded', 400);
        };
        
        throw new AppError('Invalid token', 400);
      }

      return request;

    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw error;
    }
    }
    async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validate token;

const request = await this.validateToken(token, RestoreType.PASSWORD_RESET);

      // Validate password strength
      if (!this.securityService.isPasswordStrong(newPassword)) {
        throw new AppError('Password does not meet security requirements', 400);
      };

      // Get user
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if new password is different from current;

const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new AppError('New password must be different from current password', 400);
      };

      // Update password;

const passwordHash 
}

}
}