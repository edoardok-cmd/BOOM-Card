import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { rateLimiter } from '../middleware/rateLimiter.middleware';
import * as adminController from '../controllers/admin.controller';
import { UserRole } from '../types/user.types';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/charts', adminController.getDashboardCharts);
router.get('/dashboard/recent-activities', adminController.getRecentActivities);

// User management
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('role').optional().isIn(['consumer', 'partner', 'admin']),
    query('status').optional().isIn(['active', 'inactive', 'suspended']),
    query('sortBy').optional().isIn(['createdAt', 'email', 'lastLogin']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getUsers
);

router.get(
  '/users/:userId',
  [param('userId').isUUID()],
  validate,
  adminController.getUserById
);

router.put(
  '/users/:userId',
  [
    param('userId').isUUID(),
    body('firstName').optional().isString().trim(),
    body('lastName').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('role').optional().isIn(['consumer', 'partner', 'admin']),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
  ],
  validate,
  adminController.updateUser
);

router.put(
  '/users/:userId/status',
  [
    param('userId').isUUID(),
    body('status').isIn(['active', 'inactive', 'suspended']),
    body('reason').optional().isString(),
  ],
  validate,
  adminController.updateUserStatus
);

router.delete(
  '/users/:userId',
  [param('userId').isUUID()],
  validate,
  authorize([UserRole.SUPER_ADMIN]),
  adminController.deleteUser
);

router.post(
  '/users/:userId/reset-password',
  [param('userId').isUUID()],
  validate,
  adminController.resetUserPassword
);

// Partner management
router.get(
  '/partners',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'suspended']),
    query('verified').optional().isBoolean(),
    query('sortBy').optional().isIn(['createdAt', 'name', 'rating']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getPartners
);

router.get(
  '/partners/:partnerId',
  [param('partnerId').isUUID()],
  validate,
  adminController.getPartnerById
);

router.put(
  '/partners/:partnerId',
  [
    param('partnerId').isUUID(),
    body('businessName').optional().isString().trim(),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('subcategory').optional().isString(),
    body('contactEmail').optional().isEmail().normalizeEmail(),
    body('contactPhone').optional().isMobilePhone('any'),
    body('website').optional().isURL(),
    body('address').optional().isObject(),
    body('openingHours').optional().isObject(),
    body('amenities').optional().isArray(),
    body('tags').optional().isArray(),
  ],
  validate,
  adminController.updatePartner
);

router.put(
  '/partners/:partnerId/status',
  [
    param('partnerId').isUUID(),
    body('status').isIn(['pending', 'approved', 'rejected', 'suspended']),
    body('reason').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  adminController.updatePartnerStatus
);

router.put(
  '/partners/:partnerId/verify',
  [
    param('partnerId').isUUID(),
    body('verified').isBoolean(),
    body('verificationNotes').optional().isString(),
  ],
  validate,
  adminController.verifyPartner
);

router.delete(
  '/partners/:partnerId',
  [param('partnerId').isUUID()],
  validate,
  authorize([UserRole.SUPER_ADMIN]),
  adminController.deletePartner
);

// Subscription management
router.get(
  '/subscriptions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'cancelled', 'expired', 'pending']),
    query('plan').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'expiresAt', 'amount']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getSubscriptions
);

router.get(
  '/subscriptions/:subscriptionId',
  [param('subscriptionId').isUUID()],
  validate,
  adminController.getSubscriptionById
);

router.put(
  '/subscriptions/:subscriptionId',
  [
    param('subscriptionId').isUUID(),
    body('status').optional().isIn(['active', 'cancelled', 'expired', 'pending']),
    body('expiresAt').optional().isISO8601(),
    body('autoRenew').optional().isBoolean(),
  ],
  validate,
  adminController.updateSubscription
);

router.post(
  '/subscriptions/:subscriptionId/cancel',
  [
    param('subscriptionId').isUUID(),
    body('reason').optional().isString(),
    body('immediate').optional().isBoolean(),
  ],
  validate,
  adminController.cancelSubscription
);

router.post(
  '/subscriptions/:subscriptionId/refund',
  [
    param('subscriptionId').isUUID(),
    body('amount').optional().isFloat({ min: 0 }),
    body('reason').isString(),
  ],
  validate,
  authorize([UserRole.SUPER_ADMIN]),
  adminController.refundSubscription
);

// Transaction management
router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['subscription', 'usage', 'refund']),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('minAmount').optional().isFloat({ min: 0 }),
    query('maxAmount').optional().isFloat({ min: 0 }),
    query('sortBy').optional().isIn(['createdAt', 'amount']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getTransactions
);

router.get(
  '/transactions/:transactionId',
  [param('transactionId').isUUID()],
  validate,
  adminController.getTransactionById
);

router.post(
  '/transactions/:transactionId/refund',
  [
    param('transactionId').isUUID(),
    body('amount').optional().isFloat({ min: 0 }),
    body('reason').isString(),
  ],
  validate,
  authorize([UserRole.SUPER_ADMIN]),
  adminController.refundTransaction
);

// Discount management
router.get(
  '/discounts',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('partnerId').optional().isUUID(),
    query('status').optional().isIn(['active', 'inactive', 'scheduled']),
    query('type').optional().isIn(['percentage', 'fixed', 'bogo']),
    query('sortBy').optional().isIn(['createdAt', 'value', 'usageCount']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getDiscounts
);

router.get(
  '/discounts/:discountId',
  [param('discountId').isUUID()],
  validate,
  adminController.getDiscountById
);

router.put(
  '/discounts/:discountId',
  [
    param('discountId').isUUID(),
    body('name').optional().isString().trim(),
    body('description').optional().isString(),
    body('type').optional().isIn(['percentage', 'fixed', 'bogo']),
    body('value').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'inactive', 'scheduled']),
    body('validFrom').optional().isISO8601(),
    body('validTo').optional().isISO8601(),
    body('conditions').optional().isObject(),
    body('maxUsage').optional().isInt({ min: 0 }),
  ],
  validate,
  adminController.updateDiscount
);

router.put(
  '/discounts/:discountId/status',
  [
    param('discountId').isUUID(),
    body('status').isIn(['active', 'inactive']),
  ],
  validate,
  adminController.updateDiscountStatus
);

router.delete(
  '/discounts/:discountId',
  [param('discountId').isUUID()],
  validate,
  adminController.deleteDiscount
);

// Analytics and reports
router.get(
  '/analytics/overview',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validate,
  adminController.getAnalyticsOverview
);

router.get(
  '/analytics/revenue',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('groupBy').optional().isIn(['day', 'week', 'month']),
  ],
  validate,
  adminController.getRevenueAnalytics
);

router.get(
  '/analytics/users',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validate,
  adminController.getUserAnalytics
);

router.get(
  '/analytics/partners',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validate,
  adminController.getPartnerAnalytics
);

router.get(
  '/analytics/usage',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('partnerId').optional().isUUID(),
    query('category').optional().isString(),
  ],
  validate,
  adminController.getUsageAnalytics
);

router.post(
  '/reports/generate',
  [
    body('type').isIn(['users', 'partners', 'revenue', 'usage', 'comprehensive']),
    body('format').isIn(['pdf', 'csv', 'xlsx']),
    body('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year', 'custom']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('filters').optional().isObject(),
  ],
  validate,
  rateLimiter({ windowMs: 60000, max: 10 }), // 10 reports per minute
  adminController.generateReport
);

router.get(
  '/reports',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['users', 'partners', 'revenue', 'usage', 'comprehensive']),
    query('sortBy').optional().isIn(['createdAt', 'type']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  adminController.getReports
);

router.get(
  '/reports/:reportId/download',
  [param('reportId').isUUID()],
  validate,
  adminController.downloadReport
);

// Content management
router.get(
  '/content/banners',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'inactive', 'scheduled']),
    query('placement').optional().isString(),
  ],
  validate,
  adminController.getBanners
);

router.post(
  '/content/banners',
  upload.single('image'),
  [
    body('title').isString().trim(),
    body('description').optional().isString(),
    body('link').optional().isURL(),
    body('placement').isString(),
    body('priority').optional().isInt({ min: 0, max: 100 }),
    body('status').isIn(['active', 'inactive', 'scheduled']),
    body('startDate').opti