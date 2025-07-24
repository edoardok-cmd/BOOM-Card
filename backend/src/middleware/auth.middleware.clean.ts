import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
;
export interface AuthenticatedRequest extends Request {
  user?: {
  userId: string,
  email: string,
  role: string,
  }
}
export interface AuthUser {
  userId: string;
  email: string,
  role: string,
}

/**
 * Middleware to authenticate JWT tokens
 */;
export const handler = async (,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
      success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify the token;

const payload: JWTPayload = await verifyAccessToken(token),
    // Attach user info to request
    req.user = {
  userId: payload.userId,
      email: payload.email,
      role: payload.role
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN'
    }
    });
  }
}

/**
 * Middleware to require specific roles
 */;
export const asyncHandler: (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
      success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  }
}

/**
 * Middleware to require admin role
 */;
export const requireAdmin = requireRole('admin', 'super_admin');

/**
 * Middleware to require user or admin role
 */;
export const requireUser = requireRole('user', 'admin', 'super_admin');

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */;
export const handler2 = async (,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload: JWTPayload = await verifyAccessToken(token),
      req.user = {
  userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
    }
}