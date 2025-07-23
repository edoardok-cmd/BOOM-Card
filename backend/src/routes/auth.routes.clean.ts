import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  enable2FA,
  disable2FA,
  verify2FA
} from '../controllers/auth.controller.clean';
import { authenticateToken } from '../middleware/auth.middleware.clean';

const router = Router();

// Rate limiting middleware
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased to 50 requests per window for testing
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isString()
    .withMessage('Token must be a string'),
];

const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

// Validation error handler
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Public routes
router.post('/register', 
  authRateLimit,
  validateRegistration,
  handleValidationErrors,
  register
);

router.post('/login',
  // authRateLimit, // Temporarily disabled for testing
  validateLogin,
  handleValidationErrors,
  login
);

router.post('/refresh-token',
  generalRateLimit,
  validateRefreshToken,
  handleValidationErrors,
  refreshToken
);

router.post('/logout',
  generalRateLimit,
  logout
);

// Protected routes
router.get('/profile',
  generalRateLimit,
  authenticateToken,
  getProfile
);

router.put('/profile',
  generalRateLimit,
  authenticateToken,
  updateProfile
);

router.post('/change-password',
  authRateLimit,
  authenticateToken,
  validateChangePassword,
  handleValidationErrors,
  changePassword
);

// Email verification routes
router.post('/verify-email',
  generalRateLimit,
  validateVerifyEmail,
  handleValidationErrors,
  verifyEmail
);

router.post('/resend-verification',
  authRateLimit,
  validateResendVerification,
  handleValidationErrors,
  resendVerificationEmail
);

// 2FA routes
router.post('/2fa/enable',
  generalRateLimit,
  authenticateToken,
  enable2FA
);

router.post('/2fa/disable',
  generalRateLimit,
  authenticateToken,
  disable2FA
);

router.post('/2fa/verify',
  generalRateLimit,
  authenticateToken,
  body('token').notEmpty().withMessage('2FA token is required'),
  handleValidationErrors,
  verify2FA
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  });
});

export default router;