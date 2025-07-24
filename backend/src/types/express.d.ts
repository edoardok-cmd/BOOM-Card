import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Session } from 'express-session';
import { UserRole, UserStatus } from '../models/User';
import { BusinessTier } from '../models/Business';
import { CardType } from '../models/Card';

declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      role: UserRole
      businessId?: string
      permissions?: string[]}

    interface Request {
      user?: User
      session: Session & {
        userId?: string
        businessId?: string
        deviceId?: string
        lastActivity?: Date}
      rateLimitInfo?: {
        limit: number;
        remaining: number;
        resetTime: Date;
      }
      analytics?: {
        requestId: string;
        startTime: number;
        userAgent?: string;
        ipAddress?: string;
        geoLocation?: {
          country?: string;
          region?: string;
          city?: string;
        }
      }
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      }
      filters?: {
        dateRange?: {
          start: Date;
          end: Date;
        }
        status?: string[];
        categories?: string[];
        searchTerm?: string;
      }
    }
}

export interface AuthenticatedRequest extends Request {
  user: Express.User;
}

export interface BusinessContext {
  businessId: string
  tier: BusinessTier
  features: string[]
  limits: {
    cards: number
    users: number
    storage: number
    apiCalls: number}
}

export interface CardContext {
  cardId: string
  type: CardType
  ownerId: string
  businessId?: string
  isActive: boolean
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
    canAnalytics: boolean}
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  }
  meta?: {
    timestamp: Date;
    version: string;
    requestId: string;
  }
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any}

export interface FileUpload {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer?: Buffer
  path?: string
  url?: string}

export interface WebhookPayload {
  event: string
  timestamp: Date
  data: any
  signature: string
  retryCount?: number}

export interface CacheOptions {
  ttl?: number
  key?: string
  tags?: string[]
  compress?: boolean}

export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  }
}

export interface MetricsData {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: Date
  userId?: string
  businessId?: string
  error?: boolean}

export interface SecurityContext {
  ipAddress: string
  userAgent: string
  fingerprint?: string
  riskScore?: number
  flags?: string[]}

export interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage?: number
  targetUsers?: string[]
  targetBusinesses?: string[]
  metadata?: Record<string, any>}

export interface AuditLog {
  userId: string
  action: string
  resource: string
  resourceId: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  changes?: {
    before: any
    after: any}
  metadata?: Record<string, any>;
}

export const API_VERSION = 'v1';
export const REQUEST_ID_HEADER = 'X-Request-ID';
export const API_KEY_HEADER = 'X-API-Key';
export const RATE_LIMIT_HEADER = 'X-RateLimit-Limit';
export const RATE_LIMIT_REMAINING_HEADER = 'X-RateLimit-Remaining';
export const RATE_LIMIT_RESET_HEADER = 'X-RateLimit-Reset';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TTL = 300; // 5 minutes
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/vcard',
] as const;

export const WEBHOOK_EVENTS = [
  'card.created',
  'card.updated',
  'card.deleted',
  'card.shared',
  'card.viewed',
  'user.created',
  'user.updated',
  'user.deleted',
  'business.created',
  'business.updated',
  'business.upgraded',
  'business.downgraded',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];
export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[number];

Since there's no existing express.d.ts file, I'll generate Part 2 of the Express type definitions based on the BOOM Card backend structure I can see. This would typically include Express request/response extensions and middleware type definitions:

// Express middleware type definitions
declare global {
  namespace Express {
    interface Request {
      // Session and authentication
      sessionId?: string
      startTime?: number
      // File upload
      file?: Multer.File
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }
      // Parsed body and query
      body: any;
      query: any;
      params: any;
      
      // Custom headers
      headers: {
        authorization?: string;
        'x-api-key'?: string;
        'x-request-id'?: string;
        'x-forwarded-for'?: string;
        'user-agent'?: string;
        [key: string]: string | string[] | undefined;
      }
      // Pagination
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      }
      // Search and filters
      filters?: SearchFilters;
      
      // Rate limiting
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      }
      // POS integration
      posTerminal?: {
        id: string;
        locationId: string;
        isActive: boolean;
      }
      // Partner context
      partner?: {
        id: string;
        businessName: string;
        locations: string[];
        permissions: PartnerPermission[];
      }
      // Analytics tracking
      analytics?: {
        sessionId: string;
        userId?: string;
        events: AnalyticsEvent[];
      }
    }
    
    interface Response {
      // Custom response methods
      sendSuccess<T>(data: T, metadata?: ResponseMetadata): void
      sendError(error: ApiError | string, statusCode?: number): void
      sendPaginated<T>(data: T[], totalCount: number, page: number, pageSize: number): void
      // Cache control
      setCache(duration: number, isPrivate?: boolean): void
      noCache(): void
      // Security headers
      setSecurityHeaders(): void
      // Analytics
      trackEvent(eventName: string, properties?: Record<string, any>): void}

// Middleware function types
export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ErrorRequestHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type ValidationMiddleware = (
  schema: any,
  property?: 'body' | 'query' | 'params'
) => RequestHandler;

// Controller method decorators
export interface ControllerMetadata {
  basePath: string
  middlewares?: RequestHandler[]
  version?: string}

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  path: string
  middlewares?: RequestHandler[]
  description?: string
  tags?: string[]}

// Partner permissions
export type PartnerPermission = 
  | 'manage_offers'
  | 'view_analytics'
  | 'manage_locations'
  | 'process_transactions'
  | 'manage_staff'
  | 'view_reports'
  | 'manage_settings';

// WebSocket types for real-time features
export interface SocketUser {
  userId: string
  socketId: string
  partnerId?: string
  connectedAt: Date}

export interface SocketMessage {
  type: SocketMessageType
  payload: any
  timestamp: Date
  from?: string
  to?: string | string[]}

export type SocketMessageType = 
  | 'notification'
  | 'transaction_update'
  | 'offer_update'
  | 'analytics_update'
  | 'system_message';

// Rate limiting configurations
export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: Request) => string}

export interface RateLimitRule {
  endpoint: string
  method?: string
  limits: {
    authenticated: RateLimitConfig
    unauthenticated: RateLimitConfig
    partner?: RateLimitConfig}
}

// Cache configurations
export interface CacheConfig {
  ttl: number; // seconds
  key: string | ((req: Request) => string)
  condition?: (req: Request) => boolean
  tags?: string[]}

// Queue job types
export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  }
}

export interface EmailJob extends QueueJob {
  name: 'send_email';
  data: {
    to: string | string[];
    subject: string;
    template: string;
    variables: Record<string, any>;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }
}

export interface NotificationJob extends QueueJob {
  name: 'send_notification';
  data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channels: ('email' | 'sms' | 'push')[];
    data?: Record<string, any>;
  }
}

export interface AnalyticsJob extends QueueJob {
  name: 'process_analytics';
  data: {
    partnerId?: string;
    period: AnalyticsPeriod;
    startDate: Date;
    endDate: Date;
    metrics: string[];
  }
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Validation schemas
export interface ValidationRule {
  field: string
  rules: string[]
  messages?: Record<string, string>}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationSchema}

// Database query builders
export interface QueryOptions {
  select?: string[]
  include?: string[]
  where?: Record<string, any>
  orderBy?: Record<string, 'asc' | 'desc'>
  limit?: number
  offset?: number
  transaction?: any}

export interface AggregateOptions {
  groupBy?: string[]
  having?: Record<string, any>
  count?: boolean
  sum?: string[]
  avg?: string[]
  min?: string[]
  max?: string[]}

// Export all type modules
export * from './auth.types';
export * from './user.types';
export * from './partner.types';
export * from './subscription.types';
export * from './transaction.types';
export * from './analytics.types';
export * from './payment.types';
export * from './notification.types';

}
}
}