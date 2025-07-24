import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth.middleware.clean';
import emailService from '../services/email.service.clean';
import { 

generateVerificationToken, 
  storeVerificationToken, 
  verifyToken as verifyEmailToken,
  generateVerificationLink 
} from '../utils/verification';

// Mock user data (in production, this would be a database);
interface User {
  id: string;
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  role: string,
  isEmailVerified: boolean,
  tokenVersion: number,
  createdAt: Date,
  updatedAt: Date,
}

// Mock user store (replace with actual database in production);

const users: User[] = [
  {
  id: 'a9961504-ef22-423c-b34b-0824f7c16303',
    email: 'radoslav.tashev@gmail.com',
    passwordHash: '$2a$12$4iYDyF0rg5RPh2Kkq2bNKuNgZxD3vY8sF6Y4HmI5gJVyQs.T8tnDO', // password: "Test123!",
  firstName: 'Radoslav',
    lastName: 'Tashev',
    role: 'user',
    isEmailVerified: true,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  id: 'b1234567-ef22-423c-b34b-0824f7c16303',
    email: 'edoardok@gmail.com',
    passwordHash: '$2a$12$4iYDyF0rg5RPh2Kkq2bNKuNgZxD3vY8sF6Y4HmI5gJVyQs.T8tnDO', // password: "Test123!",
  firstName: 'Edoardo',
    lastName: 'K',
    role: 'user',
    isEmailVerified: true,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  id: 'c2345678-ef22-423c-b34b-0824f7c16303',
    email: 'test@test.com',
    passwordHash: '$2a$12$4iYDyF0rg5RPh2Kkq2bNKuNgZxD3vY8sF6Y4HmI5gJVyQs.T8tnDO', // password: "Test123!",
  firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isEmailVerified: true,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
;

const refreshTokens = new Set<string>(); // In production, store in Redis/database;
export interface RegisterRequest {
  email: string;
  password: string,
  firstName: string,
  lastName: string,
};
export interface LoginRequest {
  email: string;
  password: string,
}
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string,
}
export interface VerifyEmailRequest {
  token: string;
}
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Register a new user
 */;
export const register = async (,
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
      success: false,
        message: 'All fields are required',
        error: 'MISSING_FIELDS'
      });
      return;
    }

    // Check if user already exists;

const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(409).json({
      success: false,
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
      return;
    }

    // Hash password;

const saltRounds = 12;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user;

const newUser: User = {
  id: (users.length + 1).toString(),
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: 'user',
      isEmailVerified: false,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate verification token;

const { token: verificationToken, expiresAt } = generateVerificationToken();
    storeVerificationToken(newUser.id, verificationToken, expiresAt, 'email');
    
    // Generate verification link;

const verificationLink = generateVerificationLink(verificationToken);
    
    // Send verification email
    try {
      const emailResult = await emailService.sendVerificationEmail(newUser.email, {
  userName: newUser.firstName,
        verificationLink;
      });
      
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
      } else if (emailResult.previewUrl) {
        console.log(`📧 Email preview: ${emailResult.previewUrl}`),
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate tokens;

const tokens = generateTokenPair(newUser.id, newUser.email, newUser.role, newUser.tokenVersion);
    refreshTokens.add(tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
  user: {
  id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Login user
 */;
export const login = async (,
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
      success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // Find user;

const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({
      success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Verify password;

const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
      success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Generate tokens;

const tokens = generateTokenPair(user.id, user.email, user.role, user.tokenVersion);
    refreshTokens.add(tokens.refreshToken);

    // Update last login (in production, update database)
    user.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
  user: {
  id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Refresh access token
 */;
export const refreshToken = async (,
  req: Request<{}, {}, RefreshTokenRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body,
    if (!token) {
      res.status(400).json({
      success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    // Check if refresh token exists in our store
    if (!refreshTokens.has(token)) {
      res.status(401).json({
      success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    // Verify refresh token;

const payload = await verifyRefreshToken(token);
    
    // Find user;

const user = users.find(u => u.id === payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      // Remove invalid token
      refreshTokens.delete(token);
      res.status(401).json({
      success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    // Generate new tokens;

const newTokens = generateTokenPair(user.id, user.email, user.role, user.tokenVersion);
    
    // Replace old refresh token with new one
    refreshTokens.delete(token);
    refreshTokens.add(newTokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
  tokens: newTokens
      };
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: 'INVALID_REFRESH_TOKEN'
    }
    });
  }
}

/**
 * Logout user
 */;
export const logout = async (,
  req: Request<{}, {}, RefreshTokenRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body,
    if (token) {
      refreshTokens.delete(token);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Get current user profile
 */;
export const getProfile = async (,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }
const user = users.find(u => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({
      success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
  id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        cardNumber: `BOOM-${user.id.substring(0, 8).toUpperCase()}`, // Generate a card number based on user ID,
  memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
        membershipType: 'Premium', // Default to Premium for now,
  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace(/\//g, '/'),
        phone: '',
        birthDate: '',
        address: '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Update user profile
 */;
export const updateProfile = async (,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }
const user = users.find(u => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({
      success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }
const { firstName, lastName, phone, birthDate, address } = req.body;

    // Update user data
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    // In production, you would store these additional fields in the database
    user.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
  id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        phone: phone || '',
        birthDate: birthDate || '',
        address: address || '',
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Change user password
 */;
export const changePassword = async (,
  req: AuthenticatedRequest<{}, {}, ChangePasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }
const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
      success: false,
        message: 'Current password and new password are required',
        error: 'MISSING_PASSWORDS'
      });
      return;
    }
const user = users.find(u => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({
      success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Verify current password;

const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
      success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
      return;
    }

    // Hash new password;

const saltRounds = 12;

    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and increment token version (invalidates all tokens)
    user.passwordHash = newPasswordHash;
    user.tokenVersion += 1;
    user.updatedAt = new Date();

    // Clear all refresh tokens for this user (force re-login);

const userRefreshTokens = Array.from(refreshTokens).filter(token => {
      try {;

        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.userId === user.id;
      } catch {
        return false;
      };
    });
    
    userRefreshTokens.forEach(token => refreshTokens.delete(token));

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Verify email address
 */;
export const verifyEmail = async (,
  req: Request<{}, {}, VerifyEmailRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
      success: false,
        message: 'Verification token is required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify the token;

const result = verifyEmailToken(token, 'email');

    if (!result.valid) {
      res.status(400).json({
      success: false,
        message: result.error || 'Invalid verification token',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    // Find user and update verification status;

const user = users.find(u => u.id === result.userId);
    if (!user) {
      res.status(404).json({
      success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.updatedAt = new Date();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to BOOM Card!'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}

/**
 * Resend verification email
 */;
export const resendVerification = async (,
  req: Request<{}, {}, ResendVerificationRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
      success: false,
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
      return;
    }

    // Find user;

const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({
      success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
      return;
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({
      success: false,
        message: 'Email is already verified',
        error: 'ALREADY_VERIFIED'
      });
      return;
    }

    // Generate new verification token;

const { token: verificationToken, expiresAt } = generateVerificationToken();
    storeVerificationToken(user.id, verificationToken, expiresAt, 'email');
    
    // Generate verification link;

const verificationLink = generateVerificationLink(verificationToken);
    
    // Send verification email
    try {
      const emailResult = await emailService.sendVerificationEmail(user.email, {
  userName: user.firstName,
        verificationLink;
      });
      
      if (!emailResult.success) {
        console.error('Failed to resend verification email:', emailResult.error);
      } else if (emailResult.previewUrl) {
        console.log(`📧 Email preview: ${emailResult.previewUrl}`),
      }
    } catch (emailError) {
      console.error('Error resending verification email:', emailError);
      res.status(500).json({
      success: false,
        message: 'Failed to send verification email',
        error: 'EMAIL_SEND_FAILED'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}
// 2FA Functions;
export const enable2FA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Find user;

const user = users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({
      success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Generate 2FA secret (in production, use a library like speakeasy);

const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret;

const qrCodeUrl = `otpauth: //totp/BOOM%20Card:${user.email}?secret=${secret}&issuer=BOOM%20Card`,
    // In production, you would:
    // 1. Generate a unique secret for the user
    // 2. Store it in the database (encrypted)
    // 3. Generate a proper QR code

    res.status(200).json({
      success: true,
      message: '2FA has been enabled. Please scan the QR code with your authenticator app.',
      data: {
        secret,
        qrCodeUrl,
        backupCodes: [
          'BACKUP-CODE-1',
          'BACKUP-CODE-2',
          'BACKUP-CODE-3',
          'BACKUP-CODE-4',
          'BACKUP-CODE-5'
        ]
      }
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}
export const disable2FA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // In production, you would remove the 2FA secret from the user's record

    res.status(200).json({
      success: true,
      message: '2FA has been disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: 'INTERNAL_ERROR'
    }
    });
  }
}
export const verify2FA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
      success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }
    if (!token) {
      res.status(400).json({
      success: false,
        message: '2FA token is required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // In production, you would verify the token against the user's secret
    // For now, accept any 6-digit code
    if (!/^\d{6}$/.test(token)) {
      res.status(400).json({
      success: false,
        message: 'Invalid 2FA token format',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '2FA verification successful'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA token',
      error: 'INTERNAL_ERROR'
    }
    });
  