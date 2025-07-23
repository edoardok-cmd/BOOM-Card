import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Redis } from 'ioredis';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours, addMinutes } from 'date-fns';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  cardId?: string;
  organizationId?: string;
  permissions?: string[];
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenFamily: string;
  tokenVersion: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
}

export interface TokenConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTTL: number;
  refreshTokenTTL: number;
  issuer: string;
  audience: string;
}

export interface TokenMetadata {
  issuedAt: Date;
  expiresAt: Date;
  tokenId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload | RefreshTokenPayload;
  error?: string;
  expired?: boolean;
}

export interface RevokedTokenEntry {
  tokenId: string;
  userId: string;
  revokedAt: Date;
  reason: string;
  expiresAt: Date;
}

export type TokenType = 'access' | 'refresh' | 'reset' | 'verification' | 'api';

export enum TokenRevocationReason {
  LOGOUT = 'logout',
  SECURITY = 'security',
  REFRESH = 'refresh',
  PASSWORD_CHANGE = 'password_change',
  ADMIN_ACTION = 'admin_action',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_TTL: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  RESET_TOKEN_TTL: 60 * 60 * 1000, // 1 hour
  VERIFICATION_TOKEN_TTL: 24 * 60 * 60 * 1000, // 24 hours
  API_TOKEN_TTL: 365 * 24 * 60 * 60 * 1000, // 1 year
  TOKEN_FAMILY_KEY_PREFIX: 'token_family:',
  REVOKED_TOKEN_KEY_PREFIX: 'revoked_token:',
  ACTIVE_SESSION_KEY_PREFIX: 'active_session:',
  TOKEN_METADATA_KEY_PREFIX: 'token_metadata:',
  MAX_REFRESH_TOKEN_REUSE: 3,
  TOKEN_ROTATION_GRACE_PERIOD: 60 * 1000 // 1 minute
} as const;

const REDIS_TTL = {
  REVOKED_TOKEN: 7 * 24 * 60 * 60, // 7 days
  TOKEN_FAMILY: 7 * 24 * 60 * 60, // 7 days
  SESSION_DATA: 24 * 60 * 60, // 24 hours
  TOKEN_METADATA: 7 * 24 * 60 * 60 // 7 days
} as const;

export class TokenGenerator implements ITokenGenerator {
  private static instance: TokenGenerator;
  private readonly jwtService: JwtService;
  private readonly redisService: RedisService;
  private readonly encryptionService: EncryptionService;
  private readonly logger: Logger;

  constructor(config?: TokenConfig) {
    this.jwtService = new JwtService();
    this.redisService = RedisService.getInstance();
    this.encryptionService = new EncryptionService();
    this.logger = Logger.getLogger('TokenGenerator');
  }

  public static getInstance(config?: TokenConfig): TokenGenerator {
    if (!TokenGenerator.instance) {
      TokenGenerator.instance = new TokenGenerator(config);
    }
    return TokenGenerator.instance;
  }

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    try {
      const jti = uuidv4();
      const fingerprint = this.generateFingerprint(payload);
      
      const accessTokenPayload = {
        ...payload,
        jti,
        type: TokenType.ACCESS,
        fingerprint,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN
      };

      const refreshTokenPayload = {
        userId: payload.userId,
        jti: uuidv4(),
        type: TokenType.REFRESH,
        fingerprint,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.sign(accessTokenPayload, {
          algorithm: 'RS256',
          issuer: TOKEN_CONFIG.ISSUER,
          audience: TOKEN_CONFIG.AUDIENCE
        }),
        this.jwtService.sign(refreshTokenPayload, {
          algorithm: 'RS256',
          issuer: TOKEN_CONFIG.ISSUER,
          audience: TOKEN_CONFIG.AUDIENCE
        })
      ]);

      // Store tokens in Redis for tracking
      await this.storeTokenMetadata(accessTokenPayload, refreshTokenPayload);

      return {
        accessToken,
        refreshToken,
        expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        tokenType: 'Bearer'
      };
    } catch (error) {
      this.logger.error('Failed to generate token pair', error);
      throw new SecurityError('Token generation failed');
    }

  async verifyToken(token: string, options?: VerifyOptions): Promise<TokenPayload> {
    try {
      const decoded = await this.jwtService.verify(token, {
        issuer: TOKEN_CONFIG.ISSUER,
        audience: TOKEN_CONFIG.AUDIENCE,
        ...options
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        throw new SecurityError('Token has been revoked');
      }

      // Validate fingerprint if strict mode
      if (options?.strict && options.fingerprint) {
        const isValid = await this.validateFingerprint(decoded.fingerprint, options.fingerprint);
        if (!isValid) {
          throw new SecurityError('Invalid token fingerprint');
        }

      return decoded as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new SecurityError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new SecurityError('Invalid token');
      }
      throw error;
    }

  async refreshTokens(refreshToken: string, fingerprint?: string): Promise<TokenPair> {
    try {
        strict: true,
        fingerprint
      });

      if (decoded.type !== TokenType.REFRESH) {
        throw new SecurityError('Invalid refresh token');
      }

      // Get user data for new token
      const userKey = `user:${decoded.userId}`;
      const userData = await this.redisService.get(userKey);
      
      if (!userData) {
        throw new SecurityError('User session expired');
      }

      // Revoke old tokens
      await this.revokeToken(refreshToken);

      // Generate new token pair
      const newPayload: TokenPayload = {
        userId: decoded.userId,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions
      };

      return this.generateTokenPair(newPayload);
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }

  async revokeToken(token: string): Promise<void> {
    try {
      if (!decoded?.jti) {
        throw new SecurityError('Invalid token format');
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisService.setex(
          `blacklist:${decoded.jti}`,
          ttl,
          JSON.stringify({
            revokedAt: new Date().toISOString(),
            userId: decoded.userId
          })
        );
      }

      this.logger.info(`Token revoked: ${decoded.jti}`);
    } catch (error) {
      this.logger.error('Failed to revoke token', error);
      throw new SecurityError('Token revocation failed');
    }

  async generateApiKey(options: ApiKeyOptions): Promise<ApiKey> {
    try {
      const apiKey = this.generateSecureApiKey();
      const hashedKey = await this.encryptionService.hash(apiKey);
      
      const metadata: ApiKey = {
        id: uuidv4(),
        key: apiKey,
        name: options.name,
        scopes: options.scopes || [],
        rateLimit: options.rateLimit || 1000,
        expiresAt: options.expiresAt,
        createdAt: new Date(),
        lastUsedAt: null,
        isActive: true
      };

      // Store API key metadata
      await this.redisService.hset(
        'api_keys',
        metadata.id,
        JSON.stringify({
          ...metadata,
          key: hashedKey // Store hashed version
        })
      );

      return metadata;
    } catch (error) {
      this.logger.error('API key generation failed', error);
      throw new SecurityError('Failed to generate API key');
    }

  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    try {
      const keys = await this.redisService.hgetall('api_keys');
      
      for (const [id, data] of Object.entries(keys)) {
        const metadata = JSON.parse(data);
        
        if (isValid) {
          if (!metadata.isActive) {
            throw new SecurityError('API key is inactive');
          }
          
          if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
            throw new SecurityError('API key has expired');
          }
          
          // Update last used timestamp
          metadata.lastUsedAt = new Date();
          await this.redisService.hset('api_keys', id, JSON.stringify(metadata));
          
          return {
            ...metadata,
            key: apiKey // Return original key
          };
        }
      
      return null;
    } catch (error) {
      this.logger.error('API key validation failed', error);
      throw error;
    }

  private generateFingerprint(payload: TokenPayload): string {
    const data = `${payload.userId}:${payload.email}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async validateFingerprint(stored: string, provided: string): Promise<boolean> {
    return crypto.timingSafeEqual(
      Buffer.from(stored),
      Buffer.from(provided)
    );
  }

  private generateSecureApiKey(): string {
    const prefix = 'bm_';
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('base64url');
    return `${prefix}${key}`;
  }

  private async storeTokenMetadata(
    accessPayload: any,
    refreshPayload: any
  ): Promise<void> {
    const sessionKey = `session:${accessPayload.userId}`;
    const sessionData = {
      accessJti: accessPayload.jti,
      refreshJti: refreshPayload.jti,
      fingerprint: accessPayload.fingerprint,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(accessPayload.exp * 1000).toISOString()
    };

    await this.redisService.setex(
      sessionKey,
      TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      JSON.stringify(sessionData)
    );
  }

  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklistKey = `blacklist:${jti}`;
    const exists = await this.redisService.exists(blacklistKey);
    return exists === 1;
  }

// Token validation middleware
export const authenticateToken = (options?: AuthMiddlewareOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = extractTokenFromRequest(req);
      if (!token) {
        throw new SecurityError('No token provided');
      }

      const tokenGenerator = TokenGenerator.getInstance();
      const payload = await tokenGenerator.verifyToken(token, {
        strict: options?.strict,
        fingerprint: req.headers['x-fingerprint'] as string
      });

      // Attach user to request
      (req as any).user = payload;
      (req as any).token = token;

      next();
    } catch (error) {
      if (error instanceof SecurityError) {
        return res.status(401).json({
          error: error.message,
          code: 'AUTHENTICATION_FAILED'
        });
      }
      next(error);
    };
};

// API key validation middleware
export const authenticateApiKey = (requiredScopes?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!apiKey) {
        throw new SecurityError('No API key provided');
      }

      const keyData = await tokenGenerator.validateApiKey(apiKey);

      if (!keyData) {
        throw new SecurityError('Invalid API key');
      }

      // Check required scopes
}}}
}
}
}
}
}
}
}
}
}
