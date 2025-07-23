import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Redis from 'ioredis';
import crypto from 'crypto';
import { RateLimiterRedis } from 'rate-limiter-flexible';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => Math.min(times * 50, 2000)
});

// Rate limiter for auth attempts
const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'auth_limiter',
  points: 5, // Number of attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

// Token blacklist rate limiter
const tokenBlacklistLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'token_blacklist_limiter',
  points: 10,
  duration: 3600,
});

// Type definitions
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  partnerId?: string;
  permissions: string[];
  sessionId: string;
}

export enum UserRole {
  CONSUMER = 'consumer',
  PARTNER = 'partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM = 'system'
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  partnerId?: string;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  token?: string;
  clientIp?: string;
}

// JWT verification promisified
const verifyToken = promisify(jwt.verify) as (
  token: string,
  secret: string,
  options?: jwt.VerifyOptions
) => Promise<JWTPayload>;

// Get client IP address
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  return ip || 'unknown';
};

// Hash token for blacklist storage
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Check if token is blacklisted
const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const hashedToken = hashToken(token);
    const exists = await redis.exists(`blacklist:${hashedToken}`);
    return exists === 1;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  };

// Add token to blacklist
export const blacklistToken = async (token: string, expiresIn: number): Promise<void> => {
  try {
    await redis.setex(`blacklist:${hashedToken}`, expiresIn, '1');
  } catch (error) {
    console.error('Error adding token to blacklist:', error);
  };

// Validate session
const validateSession = async (sessionId: string, userId: string): Promise<boolean> => {
  try {
    const session = await redis.get(`session:${userId}:${sessionId}`);
    return session !== null;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  };

// Main authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientIp = getClientIp(req);
    req.clientIp = clientIp;

    // Rate limiting check
    try {
      await authRateLimiter.consume(clientIp);
    } catch (rateLimiterRes) {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000) || 900
      });
      return;
    }

    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.substring(7);
    req.token = token;

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      res.status(401).json({
        success: false,
        error: 'Token has been revoked'
      });
      return;
    }

    // Verify JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Authentication service configuration error'
      });
      return;
    }

    const decoded = await verifyToken(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'boom-card-api',
      audience: process.env.JWT_AUDIENCE || 'boom-card-platform'
    });

    // Validate session
    const isValidSession = await validateSession(decoded.sessionId, decoded.sub);
    if (!isValidSession) {
      res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
      return;
    }

    // Set user in request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      partnerId: decoded.partnerId,
      permissions: decoded.permissions || [],
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
};

// Role-based access control middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const hasAllPermissions = requiredPermissions.every(permission =>
      req.user!.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: 'Missing required permissions',
        required: requiredPermissions
      });
      return;
    }

    next();
  };
};

// Partner-specific authorization
export const authorizePartner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // Allow admins and super admins
  if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role)) {
    next();
    return;
  }

  // Check if user is a partner
  if (req.user.role !== UserRole.PARTNER || !req.user.partnerId) {
    res.status(403).json({
      success: false,
      error: 'Partner access required'
    });
    return;
  }

  // If accessing partner-specific resource, verify ownership
  const requestedPartnerId = req.params.partnerId || req.body.partnerId || req.query.partnerId;
  if (requestedPartnerId && requestedPartnerId !== req.user.partnerId) {
    res.status(403).json({
      success: false,
      error: 'Access denied to this partner resource'
    });
    return;
  }

  next();
};

// API key authentication for external services
export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required'
      });
      return;
    }

    // Validate API key format
    if (!/^[a-zA-Z0-9]{32,64}$/.test(apiKey)) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key format'
      });
      return;
    }

    // Hash API key for lookup
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Retrieve API key details from Redis
    const keyData = await redis.get(`apikey:${hashedKey}`);
    
    if (!keyData) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
      return;
    }

    const parsedKeyData = JSON.parse(keyData);
    
    // Check if key is active
    if (!parsedKeyData.active) {
      res.status(401).json({
        success: false,
        error: 'API key is inactive'
      });
      return;
    }

    // Check rate limits for API key
    const rateLimitKey = `apikey_rate:${hashedKey}`;
    const currentCount = await redis.incr(rateLimitKey);
    
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, 3600); // 1 hour window
    }
    
    if (currentCount > (parsedKeyData.rateLimit || 1000)) {
      res.status(429).json({
        success: false,
        error: 'API rate limit exceeded'
      });
      return;
    }

    // Set system user in request
    req.user = {
      id: parsedKeyData.serviceId,
      email: parsedKeyData.serviceName,
      role: UserRole.SYSTEM,
      permissions: parsedKeyData.permissions || [],
      sessionId: `apikey_${hashedKey}`
    };

    // Log API key usage
    await redis.zadd(
      `apikey_usage:${hashedKey}`,
      Date.now(),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        endpoint: req.path,
        method: req.method,
        ip: getClientIp(req)
      })
    );

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  };

// Optional authentication - doesn't fail if no token
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  // If token is provided, validate it
  authenticate(req, res, next);
};

// Refresh token validation
export const validateRefreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
      return;
    }

    // Check if refresh token is blacklisted
    if (await isTokenBlacklisted(refreshToken)) {
      res.status(401).json({
        success: false,
        error: 'Refresh token has been revoked'
      });
      return;
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      console.error('JWT_REFRESH_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Authentication service configuration error'
      });
      return;
    }

      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'boom-card-api'
    });

    // Validate refresh token session
    const isValid = await validateSession(decoded.sessionId, decoded.sub);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token session'
      });
      return;
    }

    req.user 
}}
}
}
}
}
