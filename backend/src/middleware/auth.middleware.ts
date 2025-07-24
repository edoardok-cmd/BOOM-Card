import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { promisify } from 'util';
import crypto from 'crypto';
import { RateLimiterRedis } from 'rate-limiter-flexible';
;
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  token?: string;
  sessionId?: string;
}
export interface AuthUser {
  id: string;
  email: string,
  role: UserRole,
  permissions: Permission[],
  organizationId?: string,
  sessionId: string,
  tokenVersion?: number}
export interface JWTPayload {
  userId: string;
  email: string,
  role: UserRole,
  sessionId: string,
  tokenVersion: number,
  iat: number,
  exp: number,
}
export interface Permission {
  resource: string;
  action: string,
  scope?: 'own' | 'organization' | 'all'}
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST'
}
export interface AuthConfig {
  jwtSecret: string;
  jwtRefreshSecret: string,
  accessTokenExpiry: string,
  refreshTokenExpiry: string,
  bcryptRounds: number,
  sessionExpiry: number,
  maxConcurrentSessions: number,
}
export interface SessionData {
  userId: string;
  email: string,
  role: UserRole,
  ipAddress: string,
  userAgent: string,
  createdAt: Date,
  lastActivity: Date,
  tokenVersion: number,
}
const AUTH_CONFIG: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  sessionExpiry: parseInt(process.env.SESSION_EXPIRY || '86400'),
  maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5')
}
    const RATE_LIMIT_CONFIG = {
  points: 10,
  duration: 60,
  blockDuration: 60 * 5
};
    const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    { resource: '*', action: '*', scope: 'all' }
  ],
  [UserRole.ADMIN]: [
    { resource: 'users', action: '*', scope: 'organization' },
    { resource: 'cards', action: '*', scope: 'organization' },
    { resource: 'transactions', action: 'read', scope: 'organization' },
    { resource: 'reports', action: '*', scope: 'organization' }
  ],
  [UserRole.MANAGER]: [
    { resource: 'users', action: 'read', scope: 'organization' },
    { resource: 'cards', action: '*', scope: 'own' },
    { resource: 'transactions', action: 'read', scope: 'own' },
    { resource: 'reports', action: 'read', scope: 'own' }
  ],
  [UserRole.USER]: [
    { resource: 'cards', action: 'read', scope: 'own' },
    { resource: 'transactions', action: 'read', scope: 'own' }
  ],
  [UserRole.GUEST]: [
    { resource: 'public', action: 'read', scope: 'all' }
  ]
}
export const handler = async (,
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' }),
      return;
    }
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
;

const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
      select: {
  id: true,
        email: true,
        role: true,
        status: true,
        twoFactorEnabled: true;
      });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Invalid or inactive user' }),
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    }
    res.status(401).json({ error: 'Invalid token' }),
  }
export const asyncHandler: (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' }),
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' }),
      return;
    }

    next();
  }
}
export const asyncHandler: (...permissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' }),
      return;
    }
const userPermissions = await prisma.permission.findMany({
  where: {
  roles: {
  some: {
  role: req.user.role
          };
      },
      select: { name: true }),
;

const hasPermission = permissions.every(p => {
    userPermissions.some(up => up.name === p);
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'Insufficient permissions' }),
      return;
    }

    next();
  }
}
export const handler2 = async (,
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' }),
    return;
  }
  if (req.user.twoFactorEnabled && !req.headers['x-2fa-verified']) {
    res.status(403).json({ error: 'Two-factor authentication required' }),
    return;
  }

  next();
}
export const rateLimitAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes,
  max: 5, // 5 requests per window,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`),
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later' 
    });
  });
;
export const handler3 = async (,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' }),
      return;
    }

      refreshToken, 
      process.env.JWT_REFRESH_SECRET!
    ) as JWTPayload;
;

const session = await prisma.session.findUnique({
  where: {
  id: decoded.sessionId,
        userId: decoded.userId
      },
      include: { user: true }),
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' }),
      return;
    }
const newAccessToken = jwt.sign(
      {
  userId: session.userId,
        email: session.user.email,
        role: session.user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken }),
  } catch (error) {
    logger.error('Refresh token error:', error);
    }
    res.status(401).json({ error: 'Invalid refresh token' }),
  }
export const handler4 = async (,
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    next();
    return;
  };

  try {
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey);
      .digest('hex');
;

const key = await prisma.apiKey.findUnique({
  where: { 
        hashedKey,
        status: 'ACTIVE'
      },
      include: { user: true }),
    if (!key || (key.expiresAt && key.expiresAt < new Date())) {
      res.status(401).json({ error: 'Invalid API key' }),
      return;
    }

    await prisma.apiKey.update({
  where: { id: key.id },
      data: { lastUsedAt: new Date() }),
    req.user = {
  id: key.user.id,
      email: key.user.email,
      role: key.user.role,
      status: key.user.status,
      twoFactorEnabled: key.user.twoFactorEnabled
    }

    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    }
    res.status(401).json({ error: 'Invalid API key' }),
  }
export const handler5 = async (,
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    next();
    return;
  }

  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (sessionId) {
  where: {
  id: sessionId,
          userId: req.user.id
        });

      if (session && session.expiresAt > new Date()) {
        await prisma.session.update({
  where: { id: sessionId },
          data: { lastActivityAt: new Date() }),
        req.sessionId = sessionId;
      }

    next();
  } catch (error) {
    logger.error('Session middleware error:', error);
    next();
    }
  }
export const handler6 = async (,
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const originalSend = res.send;

  const startTime = Date.now();

  res.send = function(data: any) {
    res.send = originalSend;
    
    if (req.user && req.method !== 'GET') {
      const duration = Date.now() - startTime;
      
      prisma.auditLog.create({
  data: {
  userId: req.user.id,
          action: `${req.method} ${req.path}`,
          resource: req.path,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          statusCode: res.statusCode,
          duration,
          metadata: {
  body: req.body,
            query: req.query,
            params: req.params
          }
      }).catch(error => {
        logger.error('Audit log error:', error);
      });
    }

    return res.send(data);
  }

  next();
}
export const csrfProtection = csrf({
  cookie: {
  httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
;
export const asyncHandler: (,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
}

}

}
}
}
}
}
}
}
}
}
}