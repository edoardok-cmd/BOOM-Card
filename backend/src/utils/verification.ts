import crypto from 'crypto';

interface VerificationToken {
  token: string;
  expiresAt: Date;
}

interface StoredToken {
  userId: string;
  token: string;
  expiresAt: Date;
  type: 'email' | 'password_reset';
}

// In-memory storage for tokens (in production, use Redis or database)
const tokenStore = new Map<string, StoredToken>();

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): VerificationToken {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
  
  return { token, expiresAt };
}

/**
 * Generate a password reset token (shorter expiry)
 */
export function generatePasswordResetToken(): VerificationToken {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
  
  return { token, expiresAt };
}

/**
 * Store a verification token
 */
export function storeVerificationToken(userId: string, token: string, expiresAt: Date, type: 'email' | 'password_reset' = 'email') {
  tokenStore.set(token, {
    userId,
    token,
    expiresAt,
    type
  });
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens();
}

/**
 * Verify and consume a token
 */
export function verifyToken(token: string, type: 'email' | 'password_reset' = 'email'): { valid: boolean; userId?: string; error?: string } {
  const storedToken = tokenStore.get(token);
  
  if (!storedToken) {
    return { valid: false, error: 'Invalid token' };
  }
  
  if (storedToken.type !== type) {
    return { valid: false, error: 'Invalid token type' };
  }
  
  if (new Date() > storedToken.expiresAt) {
    tokenStore.delete(token);
    return { valid: false, error: 'Token has expired' };
  }
  
  // Token is valid, remove it (one-time use)
  tokenStore.delete(token);
  
  return { valid: true, userId: storedToken.userId };
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = new Date();
  
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Generate a verification link
 */
export function generateVerificationLink(token: string): string {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Generate a password reset link
 */
export function generatePasswordResetLink(token: string): string {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  return `${baseUrl}/reset-password?token=${token}`;
}