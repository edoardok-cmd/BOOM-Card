import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  generateQRCode,
  generateBatchQRCodes,
  validateQRCode,
  getAvailableBusinesses,
  generateBusinessQRCode,
  getQRCodeStats,
  healthCheck,
  getMembershipQrCode
} from '../controllers/qrcode.controller.clean';
import { authenticateToken } from '../middleware/auth.middleware.clean';

const router = Router();

// Rate limiting middleware
const qrGenerationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 QR code generations per window
  message: {
    success: false,
    message: 'Too many QR code generation requests, please try again later',
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
const validateQRGeneration = [
  body('businessId')
    .notEmpty()
    .withMessage('Business ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Business ID must be between 1 and 100 characters'),
  body('businessName')
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Business name must be between 1 and 200 characters'),
  body('discountPercentage')
    .isInt({ min: 1, max: 100 })
    .withMessage('Discount percentage must be an integer between 1 and 100'),
  body('expirationHours')
    .optional()
    .isInt({ min: 1, max: 168 }) // Max 1 week
    .withMessage('Expiration hours must be an integer between 1 and 168 (1 week)'),
  body('campaignId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Campaign ID must be less than 100 characters'),
  body('customMessage')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Custom message must be less than 500 characters'),
  body('saveToFile')
    .optional()
    .isBoolean()
    .withMessage('Save to file must be a boolean')
];

const validateBatchQRGeneration = [
  body('businesses')
    .isArray({ min: 1, max: 20 })
    .withMessage('Businesses must be an array with 1-20 items'),
  body('businesses.*.businessId')
    .notEmpty()
    .withMessage('Each business must have a business ID')
    .isLength({ min: 1, max: 100 })
    .withMessage('Business ID must be between 1 and 100 characters'),
  body('businesses.*.businessName')
    .notEmpty()
    .withMessage('Each business must have a business name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Business name must be between 1 and 200 characters'),
  body('businesses.*.discountPercentage')
    .isInt({ min: 1, max: 100 })
    .withMessage('Each business must have a discount percentage between 1 and 100'),
  body('expirationHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Expiration hours must be an integer between 1 and 168 (1 week)'),
  body('campaignId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Campaign ID must be less than 100 characters')
];

const validateQRCodeValidation = [
  body('qrData')
    .notEmpty()
    .withMessage('QR data is required')
    .isString()
    .withMessage('QR data must be a string')
];

const validateBusinessId = [
  param('businessId')
    .notEmpty()
    .withMessage('Business ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Business ID must be between 1 and 100 characters')
];

const validateCustomBusinessQR = [
  body('customDiscount')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Custom discount must be an integer between 1 and 100'),
  body('expirationHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Expiration hours must be an integer between 1 and 168 (1 week)'),
  body('campaignId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Campaign ID must be less than 100 characters')
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

// Public routes (no authentication required)
router.get('/health', generalRateLimit, healthCheck);

router.get('/businesses', generalRateLimit, getAvailableBusinesses);

router.post('/validate', 
  generalRateLimit,
  validateQRCodeValidation,
  handleValidationErrors,
  validateQRCode
);

// Protected routes (authentication required)
router.post('/generate',
  qrGenerationRateLimit,
  authenticateToken,
  validateQRGeneration,
  handleValidationErrors,
  generateQRCode
);

router.post('/batch',
  qrGenerationRateLimit,
  authenticateToken,
  validateBatchQRGeneration,
  handleValidationErrors,
  generateBatchQRCodes
);

router.post('/business/:businessId',
  qrGenerationRateLimit,
  authenticateToken,
  validateBusinessId,
  validateCustomBusinessQR,
  handleValidationErrors,
  generateBusinessQRCode
);

router.get('/stats',
  generalRateLimit,
  authenticateToken,
  getQRCodeStats
);

// Get membership QR code
router.get('/membership',
  generalRateLimit,
  authenticateToken,
  getMembershipQrCode
);

// Documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'QR Code API Documentation',
    endpoints: {
      'GET /qr/health': 'Health check for QR code service',
      'GET /qr/businesses': 'Get available businesses for QR code generation',
      'POST /qr/validate': 'Validate a QR code (body: {qrData: string})',
      'POST /qr/generate': 'Generate a custom QR code (requires auth)',
      'POST /qr/batch': 'Generate multiple QR codes (requires auth)',
      'POST /qr/business/:businessId': 'Generate QR code for predefined business (requires auth)',
      'GET /qr/stats': 'Get QR code generation statistics (requires auth)'
    },
    examples: {
      generateQRCode: {
        method: 'POST',
        endpoint: '/qr/generate',
        headers: {
          'Authorization': 'Bearer <access_token>',
          'Content-Type': 'application/json'
        },
        body: {
          businessId: 'business_1',
          businessName: 'Pizza Palace',
          discountPercentage: 15,
          expirationHours: 24,
          campaignId: 'summer_2024',
          customMessage: 'Special summer discount!',
          saveToFile: true
        }
      },
      generateBatchQRCodes: {
        method: 'POST',
        endpoint: '/qr/batch',
        headers: {
          'Authorization': 'Bearer <access_token>',
          'Content-Type': 'application/json'
        },
        body: {
          businesses: [
            {
              businessId: 'business_1',
              businessName: 'Pizza Palace',
              discountPercentage: 15
            },
            {
              businessId: 'business_2',
              businessName: 'Fashion Store',
              discountPercentage: 20
            }
          ],
          expirationHours: 48,
          campaignId: 'weekend_deals'
        }
      },
      validateQRCode: {
        method: 'POST',
        endpoint: '/qr/validate',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          qrData: '{"qrCodeId":"qr_123","discountCode":"PIZ-abc-DEF","businessId":"business_1",...}'
        }
      }
    }
  });
});

export default router;