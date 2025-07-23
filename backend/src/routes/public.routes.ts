import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter';
import { cache } from '../middleware/cache';
import { PublicController } from '../controllers/public.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateOptional } from '../middleware/auth';

const router = Router();
const publicController = new PublicController();

// Apply rate limiting to all public routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Home page data
router.get(
  '/home',
  cache(300), // 5 minutes cache
  asyncHandler(publicController.getHomeData)
);

// Partner search with filters
router.get(
  '/partners/search',
  [
    query('q').optional().isString().trim(),
    query('category').optional().isIn(['food-drink', 'entertainment', 'accommodation', 'experiences']),
    query('subcategory').optional().isString(),
    query('city').optional().isString(),
    query('minDiscount').optional().isInt({ min: 0, max: 100 }),
    query('maxDiscount').optional().isInt({ min: 0, max: 100 }),
    query('cuisine').optional().isString(),
    query('amenities').optional().isArray(),
    query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('openNow').optional().isBoolean(),
    query('lat').optional().isFloat({ min: -90, max: 90 }),
    query('lng').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 50 }), // km
    query('sortBy').optional().isIn(['relevance', 'distance', 'discount', 'rating', 'newest']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('lang').optional().isIn(['en', 'bg'])
  ],
  validate,
  cache(60), // 1 minute cache
  asyncHandler(publicController.searchPartners)
);

// Get all partners with pagination
router.get(
  '/partners',
  [
    query('category').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sortBy').optional().isIn(['name', 'discount', 'rating', 'newest'])
  ],
  validate,
  cache(300),
  asyncHandler(publicController.getPartners)
);

// Get single partner details
router.get(
  '/partners/:id',
  [param('id').isUUID()],
  validate,
  cache(300),
  authenticateOptional, // Check if user is authenticated to show personalized data
  asyncHandler(publicController.getPartnerById)
);

// Get partner locations for map
router.get(
  '/partners/map/locations',
  [
    query('bounds').optional().isString(), // Format: "sw_lat,sw_lng,ne_lat,ne_lng"
    query('category').optional().isString(),
    query('zoom').optional().isInt({ min: 1, max: 20 })
  ],
  validate,
  cache(120),
  asyncHandler(publicController.getPartnerLocations)
);

// Categories and subcategories
router.get(
  '/categories',
  cache(3600), // 1 hour cache
  asyncHandler(publicController.getCategories)
);

// Cities with partner count
router.get(
  '/cities',
  cache(3600),
  asyncHandler(publicController.getCities)
);

// Platform statistics
router.get(
  '/statistics',
  cache(600), // 10 minutes cache
  asyncHandler(publicController.getStatistics)
);

// Trending deals
router.get(
  '/deals/trending',
  [
    query('limit').optional().isInt({ min: 1, max: 20 }),
    query('category').optional().isString()
  ],
  validate,
  cache(300),
  asyncHandler(publicController.getTrendingDeals)
);

// Recent partners
router.get(
  '/partners/recent',
  [query('limit').optional().isInt({ min: 1, max: 20 })],
  validate,
  cache(300),
  asyncHandler(publicController.getRecentPartners)
);

// Partner reviews
router.get(
  '/partners/:id/reviews',
  [
    param('id').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sortBy').optional().isIn(['newest', 'oldest', 'highest', 'lowest'])
  ],
  validate,
  cache(60),
  asyncHandler(publicController.getPartnerReviews)
);

// Subscription plans
router.get(
  '/subscription-plans',
  cache(3600),
  asyncHandler(publicController.getSubscriptionPlans)
);

// Contact form submission
router.post(
  '/contact',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 requests per hour
  [
    body('name').notEmpty().isString().isLength({ min: 2, max: 100 }),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('subject').notEmpty().isString().isLength({ min: 5, max: 200 }),
    body('message').notEmpty().isString().isLength({ min: 10, max: 2000 }),
    body('type').optional().isIn(['general', 'support', 'partnership', 'feedback']),
    body('captchaToken').notEmpty().isString()
  ],
  validate,
  asyncHandler(publicController.submitContactForm)
);

// Newsletter subscription
router.post(
  '/newsletter/subscribe',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 requests per hour
  [
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('preferences').optional().isObject()
  ],
  validate,
  asyncHandler(publicController.subscribeNewsletter)
);

// FAQ
router.get(
  '/faq',
  cache(3600),
  asyncHandler(publicController.getFAQ)
);

// Terms and conditions
router.get(
  '/legal/terms',
  cache(86400), // 24 hours cache
  asyncHandler(publicController.getTerms)
);

// Privacy policy
router.get(
  '/legal/privacy',
  cache(86400),
  asyncHandler(publicController.getPrivacyPolicy)
);

// Cuisines list for filters
router.get(
  '/cuisines',
  cache(3600),
  asyncHandler(publicController.getCuisines)
);

// Amenities list for filters
router.get(
  '/amenities',
  cache(3600),
  asyncHandler(publicController.getAmenities)
);

// App download links
router.get(
  '/app-links',
  cache(86400),
  asyncHandler(publicController.getAppLinks)
);

// Validate discount code (for non-authenticated users)
router.post(
  '/validate-code',
  rateLimiter({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  [body('code').notEmpty().isString().isLength({ min: 6, max: 20 })],
  validate,
  asyncHandler(publicController.validateDiscountCode)
);

// Get partner schedule
router.get(
  '/partners/:id/schedule',
  [param('id').isUUID()],
  validate,
  cache(300),
  asyncHandler(publicController.getPartnerSchedule)
);

// Search suggestions (autocomplete)
router.get(
  '/search/suggestions',
  [
    query('q').notEmpty().isString().isLength({ min: 2, max: 50 }),
    query('type').optional().isIn(['partners', 'categories', 'cities', 'all'])
  ],
  validate,
  cache(60),
  asyncHandler(publicController.getSearchSuggestions)
);

// Get localized content
router.get(
  '/content/:key',
  [
    param('key').notEmpty().isString(),
    query('lang').optional().isIn(['en', 'bg'])
  ],
  validate,
  cache(3600),
  asyncHandler(publicController.getLocalizedContent)
);

// Check service availability by location
router.get(
  '/service-availability',
  [
    query('lat').notEmpty().isFloat({ min: -90, max: 90 }),
    query('lng').notEmpty().isFloat({ min: -180, max: 180 })
  ],
  validate,
  cache(600),
  asyncHandler(publicController.checkServiceAvailability)
);

// Get promotional banners
router.get(
  '/banners',
  [
    query('position').optional().isIn(['home', 'category', 'partner']),
    query('active').optional().isBoolean()
  ],
  validate,
  cache(300),
  asyncHandler(publicController.getBanners)
);

// Partner availability check
router.post(
  '/partners/:id/check-availability',
  [
    param('id').isUUID(),
    body('date').notEmpty().isISO8601(),
    body('partySize').optional().isInt({ min: 1, max: 50 }),
    body('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  ],
  validate,
  asyncHandler(publicController.checkPartnerAvailability)
);

// Get partner gallery
router.get(
  '/partners/:id/gallery',
  [param('id').isUUID()],
  validate,
  cache(600),
  asyncHandler(publicController.getPartnerGallery)
);

// Get partner menu (for restaurants)
router.get(
  '/partners/:id/menu',
  [
    param('id').isUUID(),
    query('category').optional().isString()
  ],
  validate,
  cache(600),
  asyncHandler(publicController.getPartnerMenu)
);

// Report an issue
router.post(
  '/report',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }),
  [
    body('type').notEmpty().isIn(['partner', 'review', 'technical', 'other']),
    body('entityId').optional().isUUID(),
    body('reason').notEmpty().isString().isLength({ min: 10, max: 500 }),
    body('details').optional().isString().isLength({ max: 2000 }),
    body('email').optional().isEmail().normalizeEmail()
  ],
  validate,
  asyncHandler(publicController.reportIssue)
);

// Get similar partners
router.get(
  '/partners/:id/similar',
  [
    param('id').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 10 })
  ],
  validate,
  cache(600),
  asyncHandler(publicController.getSimilarPartners)
);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
