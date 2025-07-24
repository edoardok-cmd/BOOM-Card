import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment type;
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

// Database configuration interface;
interface DatabaseConfig {
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
  ssl: boolean,
  poolSize: number,
  poolMin: number,
  poolMax: number,
  poolIdleTimeout: number,
  connectionTimeout: number,
  statementTimeout: number,
}

// Redis configuration interface;
interface RedisConfig {
  host: string,
  port: number,
  password?: string,
  db: number,
  keyPrefix: string,
  ttl: number,
  connectTimeout: number,
  maxRetriesPerRequest: number,
  enableReadyCheck: boolean,
  enableOfflineQueue: boolean,
}

// JWT configuration interface;
interface JWTConfig {
  accessTokenSecret: string,
  refreshTokenSecret: string,
  accessTokenExpiry: string,
  refreshTokenExpiry: string,
  algorithm: string,
  issuer: string,
  audience: string,
}

// Email configuration interface;
interface EmailConfig {
  provider: 'sendgrid' | 'smtp' | 'ses',
  from: {
  name: string,
  email: string,
  }
  sendgrid?: {
  apiKey: string,
  templateIds: {
  welcome: string,
  resetPassword: string,
  orderConfirmation: string,
  partnerWelcome: string,
  subscriptionRenewal: string,
  discountUsed: string,
    }
  }
  smtp?: {
  host: string,
  port: number,
  secure: boolean,
  auth: {
  user: string,
  pass: string,
    }
}
// Payment configuration interface;
interface PaymentConfig {
  stripe: {
  secretKey: string,
  publicKey: string,
  webhookSecret: string,
  currency: string,
  subscriptionPriceIds: {
  basic: string,
  premium: string,
  family: string,
    }
  }
}

// Storage configuration interface;
interface StorageConfig {
  provider: 'local' | 's3' | 'cloudinary',
  local?: {
  uploadDir: string,
  publicPath: string,
  }
  s3?: {
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  bucket: string,
    cloudFrontUrl?: string;
  }
  cloudinary?: {
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  }
}

// Security configuration interface;
interface SecurityConfig {
  bcryptRounds: number,
  corsOrigins: string[];,
  trustedProxies: string[];,
  rateLimiting: {
  windowMs: number,
  maxRequests: number,
  skipSuccessfulRequests: boolean,
  },
    helmet: {
  contentSecurityPolicy: boolean,
  crossOriginEmbedderPolicy: boolean,
  }
}

// Logging configuration interface;
interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug',
  format: 'json' | 'simple',
  transports: ('console' | 'file' | 'elasticsearch')[],
  elasticsearch?: {
  node: string,
  index: string,
  }
  file?: {
  dirname: string,
  filename: string,
  maxsize: number,
  maxFiles: number,
  }
}

// QR Code configuration interface;
interface QRCodeConfig {
  baseUrl: string,
  size: number,
  margin: number,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H',
  darkColor: string,
  lightColor: string,
}

// Localization configuration interface;
interface LocalizationConfig {
  defaultLanguage: string,
  supportedLanguages: string[];,
  fallbackLanguage: string,
}

// Analytics configuration interface;
interface AnalyticsConfig {
  googleAnalytics?: {
  trackingId: string,
  }
  mixpanel?: {
  token: string,
  }
  segment?: {
  writeKey: string,
  }
}

// Notification configuration interface;
interface NotificationConfig {
  push: {
  vapidPublicKey: string,
  vapidPrivateKey: string,
    gcmApiKey?: string}
  sms?: {
  provider: 'twilio' | 'nexmo',
    twilio?: {
  accountSid: string,
  authToken: string,
  fromNumber: string,
    }
  }
}

// Application configuration interface;
interface AppConfig {
  name: string,
  version: string,
  description: string,
  port: number,
  host: string,
  baseUrl: string,
  apiPrefix: string,
  uploadLimit: string,
  timezone: string,
}

// Complete configuration interface;
export interface Config {
  env: Environment,
  isDevelopment: boolean,
  isProduction: boolean,
  isTest: boolean,
  app: AppConfig,
  database: DatabaseConfig,
  redis: RedisConfig,
  jwt: JWTConfig,
  email: EmailConfig,
  payment: PaymentConfig,
  storage: StorageConfig,
  security: SecurityConfig,
  logging: LoggingConfig,
  qrCode: QRCodeConfig,
  localization: LocalizationConfig,
  analytics: AnalyticsConfig,
  notifications: NotificationConfig,
}

// Validate required environment variables;

const requiredEnvVars = [
  'NODE_ENV',
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLIC_KEY';
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`),
  }
}

// Current environment
    // TODO: Fix incomplete function declaration

// Configuration object;

const config: Config = {
  env: currentEnv,
  isDevelopment: currentEnv === Environment.DEVELOPMENT,
  isProduction: currentEnv === Environment.PRODUCTION,
  isTest: currentEnv === Environment.TEST,
,
  app: {
  name: process.env.APP_NAME || 'BOOM Card Platform',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'Comprehensive discount card platform',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    uploadLimit: process.env.UPLOAD_LIMIT || '10mb',
    timezone: process.env.TZ || 'Europe/Sofia'
  },
,
  database: {
  host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    poolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10),
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10)
  },
,
  redis: {
  host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'boom:',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    enableReadyCheck: process.env.REDIS_READY_CHECK !== 'false',
    enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE !== 'false'
  },
,
  jwt: {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    issuer: process.env.JWT_ISSUER || 'boom-card-platform',
    audience: process.env.JWT_AUDIENCE || 'boom-card-users'
  },
,
  email: {
  provider: (process.env.EMAIL_PROVIDER || 'sendgrid') as 'sendgrid' | 'smtp' | 'ses',
    from: {
  name: process.env.EMAIL_FROM_NAME || 'BOOM Card',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@boomcard.bg'
    },
    sendgrid: process.env.SENDGRID_API_KEY ? {
  apiKey: process.env.SENDGRID_API_KEY,
      templateIds: {
  welcome: process.env.SENDGRID_WELCOME_TEMPLATE || '',
        resetPassword: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE || '',
        orderConfirmation: process.env.SENDGRID_ORDER_CONFIRMATION_TEMPLATE || '',
        partnerWelcome: process.env.SENDGRID_PARTNER_WELCOME_TEMPLATE || '',
        subscriptionRenewal: process.env.SENDGRID_SUBSCRIPTION_RENEWAL_TEMPLATE || '',
        discountUsed: process.env.SENDGRID_DISCOUNT_USED_TEMPLATE || ''
      }
    } : undefined,
    smtp: process.env.SMTP_HOST ? {
  host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
  user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    } : undefined
  },
,
  payment: {
  stripe: {
  secretKey: process.env.STRIPE_SECRET_KEY!,
      publicKey: process.env.STRIPE_PUBLIC_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      currency: process.env.STRIPE_CURRENCY || 'bgn',
      subscriptionPriceIds: {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
        premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
        family: process.env.STRIPE_FAMILY_PRICE_ID || ''
      }
    }
  },
,
  storage: {
  provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3' | 'cloudinary',
    local: {
  uploadDir: process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, '../../../uploads'),
      publicPath: process.env.LOCAL_PUBLIC_PATH || '/uploads'
    },
    s3: process.env.AWS_ACCESS_KEY_ID ? {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'eu-central-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL
    } : undefined,
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    } : undefined
  },
,
  security: {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || [],
    rateLimiting: {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes,
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
    },
    helmet: {
  contentSecurityPolicy: process.env.HELMET_CSP !== 'false',
      crossOriginEmbedderPolicy: process.env.HELMET_COEP !== 'false'
    }
  },
,
  logging: {
  level: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',
    format: (process.env.LOG_FORMAT || 'json') as 'json' | 'simple',
    transports: (process.env.LOG_TRANSPORTS?.split(',') || ['console']) as ('console' | 'file' | 'elasticsearch')[],
    elasticsearch: process.env.ELASTICSEARCH_NODE ? {
  node: process.env.ELASTICSEARCH_NODE,
      index: process.env.ELASTICSEARCH_INDEX || 'boom-logs'
    } : undefined,
    file: {
  dirname: process.env.LOG_DIR || path.join(__dirname, '../../../logs'),
      filename: process.env.LOG_FILENAME || 'boom-%DATE%.log',
      maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520', 10), // 20MB,
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10)
    }
  },
,
  qrCode: {
  baseUrl: process.env.QR_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
    size: parseInt(process.env.QR_SIZE || '300', 10),
    margin: parseInt(process.env.QR_MARGIN || '4', 10),
    errorCorrectionLevel: (process.env.QR_ERROR_CORRECTION || 'M') as 'L' | 'M' | 'Q' | 'H',
    darkColor: process.env.QR_DARK_COLOR || '#000000',
    lightColor: process.env.QR_LIGHT_COLOR || '#FFFFFF'
  },
,
  localization: {
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'bg',
    supportedLanguages: process.env.SUPPORTED_LANGUAGES?.split(',') || ['bg', 'en'],
    fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en'
  },
,
  analytics: {
  googleAnalytics: process.env.GA_TRACKING_ID ? {
  trackingId: process.env.GA_TRACKING_ID
    } : undefined,
    mixpanel: process.env.MIXPANEL_TOKEN ? {
  token: process.env.MIXPANEL_TOKEN
    } : undefined,
    segment: process.env.SEGMENT_WRITE_KEY ? {
  writeKey: process.env.SEGMENT_WRITE_KEY
    } : undefined
  },
,
  notifications: {
  push: {
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
      gcmApiKey: process.env.GCM_API_KEY
    },
    sms: process.env.SMS_PROVIDER ? {
  provider: process.env.SMS_PROVIDER as 'twilio' | 'nexmo',
      twilio: process.env.TWILIO_ACCOUNT_SID ? {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.TWILIO_FROM_NUMBER || ''
      } : undefined
    } : undefined
  }
}
export default config;

}