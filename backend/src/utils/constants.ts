export const APP_NAME = 'BOOM Card';
export const APP_VERSION = '1.0.0';
export const API_VERSION = 'v1';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

// Server
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const HOST = process.env.HOST || 'localhost';
export const API_BASE_PATH = '/api/v1';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/boomcard';
export const DATABASE_POOL_MIN = parseInt(process.env.DATABASE_POOL_MIN || '2', 10);
export const DATABASE_POOL_MAX = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);

// Redis
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const REDIS_TTL_DEFAULT = 3600; // 1 hour
export const REDIS_TTL_SESSION = 86400; // 24 hours
export const REDIS_TTL_CACHE = 300; // 5 minutes

// Authentication
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '7d';
export const JWT_REFRESH_EXPIRES_IN = '30d';
export const BCRYPT_ROUNDS = 10;
export const SESSION_COOKIE_NAME = 'boom_session';
export const SESSION_COOKIE_MAX_AGE = 86400000; // 24 hours

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
export const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

// QR Code
export const QR_CODE_SIZE = 300;
export const QR_CODE_MARGIN = 4;
export const QR_CODE_ERROR_CORRECTION = 'M';

// Discount Limits
export const MIN_DISCOUNT_PERCENTAGE = 5;
export const MAX_DISCOUNT_PERCENTAGE = 50;
export const DEFAULT_DISCOUNT_PERCENTAGE = 10;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'BGN',
    duration: 30, // days
    features: ['basic_discounts', 'mobile_app']
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'BGN',
    duration: 30,
    features: ['premium_discounts', 'mobile_app', 'exclusive_deals', 'priority_support']
  },
  ANNUAL: {
    id: 'annual',
    name: 'Annual',
    price: 199.99,
    currency: 'BGN',
    duration: 365,
    features: ['premium_discounts', 'mobile_app', 'exclusive_deals', 'priority_support', 'bonus_rewards']
  } as const;

// Partner Categories
export const PARTNER_CATEGORIES = {
  RESTAURANTS: 'restaurants',
  CAFES: 'cafes',
  BARS: 'bars',
  HOTELS: 'hotels',
  SPA: 'spa',
  ENTERTAINMENT: 'entertainment',
  SERVICES: 'services',
  RETAIL: 'retail'
} as const;

// Partner Subcategories
export const PARTNER_SUBCATEGORIES = {
  // Food & Drink
  FINE_DINING: 'fine_dining',
  CASUAL_DINING: 'casual_dining',
  FAST_FOOD: 'fast_food',
  VEGAN: 'vegan',
  VEGETARIAN: 'vegetarian',
  COFFEE_SHOPS: 'coffee_shops',
  SKY_BARS: 'sky_bars',
  COCKTAIL_BARS: 'cocktail_bars',
  SPORTS_BARS: 'sports_bars',
  WINE_BARS: 'wine_bars',
  
  // Entertainment
  NIGHTCLUBS: 'nightclubs',
  LIVE_MUSIC: 'live_music',
  COMEDY_CLUBS: 'comedy_clubs',
  THEATERS: 'theaters',
  GAMING_CENTERS: 'gaming_centers',
  
  // Accommodation
  BOUTIQUE_HOTELS: 'boutique_hotels',
  BUSINESS_HOTELS: 'business_hotels',
  BED_BREAKFAST: 'bed_breakfast',
  VACATION_RENTALS: 'vacation_rentals',
  
  // Experiences
  ADVENTURE: 'adventure',
  WELLNESS: 'wellness',
  WINE_TASTING: 'wine_tasting',
  ESCAPE_ROOMS: 'escape_rooms'
} as const;

// User Roles
export const USER_ROLES = {
  CONSUMER: 'consumer',
  PARTNER: 'partner',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
} as const;

// Partner Status
export const PARTNER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive'
} as const;

// Languages
export const SUPPORTED_LANGUAGES = ['en', 'bg'] as const;
export const DEFAULT_LANGUAGE = 'bg';

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Currency
export const DEFAULT_CURRENCY = 'BGN';
export const SUPPORTED_CURRENCIES = ['BGN', 'EUR', 'USD'] as const;

// Email
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@boomcard.bg';
export const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT || 'support@boomcard.bg';

// SMS
export const SMS_FROM = process.env.SMS_FROM || 'BOOM Card';

// Rate Limiting
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_LOGIN_MAX = 5;

// Cache Keys
export const CACHE_KEYS = {
  PARTNERS: 'partners',
  CATEGORIES: 'categories',
  USER_SESSION: 'user_session',
  PARTNER_DETAILS: 'partner_details',
  DISCOUNT_OFFERS: 'discount_offers',
  STATISTICS: 'statistics'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
    SUBSCRIPTION: '/users/subscription'
  },
  PARTNERS: {
    LIST: '/partners',
    DETAIL: '/partners/:id',
    CREATE: '/partners',
    UPDATE: '/partners/:id',
    DELETE: '/partners/:id',
    SEARCH: '/partners/search',
    NEARBY: '/partners/nearby'
  },
  TRANSACTIONS: {
    CREATE: '/transactions',
    LIST: '/transactions',
    DETAIL: '/transactions/:id',
    VERIFY: '/transactions/verify'
  },
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    SUBSCRIBE: '/subscriptions/subscribe',
    CANCEL: '/subscriptions/cancel',
    UPDATE: '/subscriptions/update'
  } as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  TOKEN_INVALID: 'AUTH003',
  UNAUTHORIZED: 'AUTH004',
  
  // Validation
  VALIDATION_ERROR: 'VAL001',
  INVALID_INPUT: 'VAL002',
  MISSING_REQUIRED: 'VAL003',
  
  // Database
  DB_CONNECTION_ERROR: 'DB001',
  DB_QUERY_ERROR: 'DB002',
  RECORD_NOT_FOUND: 'DB003',
  DUPLICATE_ENTRY: 'DB004',
  
  // Business Logic
  INSUFFICIENT_BALANCE: 'BUS001',
  DISCOUNT_EXPIRED: 'BUS002',
  PARTNER_INACTIVE: 'BUS003',
  SUBSCRIPTION_EXPIRED: 'BUS004',
  
  // System
  INTERNAL_SERVER_ERROR: 'SYS001',
  SERVICE_UNAVAILABLE: 'SYS002',
  RATE_LIMIT_EXCEEDED: 'SYS003'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  REGISTER_SUCCESS: 'Registration successful',
  UPDATE_SUCCESS: 'Successfully updated',
  DELETE_SUCCESS: 'Successfully deleted',
  TRANSACTION_SUCCESS: 'Transaction completed successfully',
  SUBSCRIPTION_SUCCESS: 'Subscription activated successfully'
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 32,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_SOCIAL_LOGIN: process.env.ENABLE_SOCIAL_LOGIN === 'true',
  ENABLE_SMS_VERIFICATION: process.env.ENABLE_SMS_VERIFICATION === 'true',
  ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_MAINTENANCE_MODE: process.env.ENABLE_MAINTENANCE_MODE === 'true'
} as const;

// External Services
export const EXTERNAL_SERVICES = {
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || ''
} as const;

// Types
export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type PartnerCategory = typeof PARTNER_CATEGORIES[keyof typeof PARTNER_CATEGORIES];
export type PartnerSubcategory = typeof PARTNER_SUBCATEGORIES[keyof typeof PARTNER_SUBCATEGORIES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
export type PartnerStatus = typeof PARTNER_STATUS[keyof typeof PARTNER_STATUS];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

}
}
