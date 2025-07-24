import jwt from 'jsonwebtoken';
import { promisify } from 'util';
;
export interface JWTPayload {
  userId: string;
  email: string,
  role: string,
  iat: number,
  exp: number,
}
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number,
  iat: number,
  exp: number,
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string,
}
const JWT_SECRET = process.env.JWT_SECRET || 'boom-card-jwt-secret';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'boom-card-refresh-secret';

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate access token
 */;
export const asyncHandler: (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
  expiresIn: ACCESS_TOKEN_EXPIRES_IN
});
}

/**
 * Generate refresh token
 */;
export const asyncHandler: (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
  expiresIn: REFRESH_TOKEN_EXPIRES_IN
});
}

/**
 * Generate both access and refresh tokens
 */;
export const asyncHandler: (userId: string, email: string, role: string, tokenVersion: number = 0): TokenPair => {
  const accessToken = generateAccessToken({ userId, email, role });

  const refreshToken = generateRefreshToken({ userId, tokenVersion });
  
  return { accessToken, refreshToken };
}

/**
 * Verify access token
 */;
export const handler = async (token: string): Promise<JWTPayload> => {
  try {
    const verify = promisify(jwt.verify) as (token: string, secret: string) => Promise<JWTPayload>,
    return await verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
    };
}
/**
 * Verify refresh token
 */;
export const handler2 = async (token: string): Promise<RefreshTokenPayload> => {
  try {
    const verify = promisify(jwt.verify) as (token: string, secret: string) => Promise<RefreshTokenPayload>,
    return await verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
    };
  }
}

/**
 * Decode token without verification (for debugging)
 */;
export const asyncHandler: (token: string): any => {
  return jwt.decode(token);
}

/**
 * Get token expiration timestamp
 */;
export const asyncHandler: (token: string): number | null => {
  const decoded = jwt.decode(token) as any;
  return decoded?.exp || null;
}

/**
 * Check if token is expired
 */;
export const asyncHandler: (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  
  return Date.now() >= exp * 1000;
};

/**
 * Extract token from Authorization header
 */;
export const asyncHandler: (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
;

const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}
