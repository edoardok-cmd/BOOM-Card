// Authentication & User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  role: UserRole;
  kycStatus: KYCStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT'
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Card Types
export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv?: string;
  type: CardType;
  brand: CardBrand;
  status: CardStatus;
  lastFourDigits: string;
  billingAddress?: Address;
  spendingLimit?: number;
  currentBalance: number;
  availableBalance: number;
  currency: Currency;
  isPhysical: boolean;
  isVirtual: boolean;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  blockedAt?: Date;
}

export enum CardType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PREPAID = 'PREPAID',
  VIRTUAL = 'VIRTUAL'
}

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX'
}

export enum CardStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  LOST = 'LOST',
  STOLEN = 'STOLEN'
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  cardId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  description: string;
  merchantName?: string;
  merchantCategory?: string;
  referenceNumber: string;
  authorizationCode?: string;
  processorResponse?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  settledAt?: Date;
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  REFUND = 'REFUND',
  FEE = 'FEE',
  REVERSAL = 'REVERSAL',
  AUTHORIZATION = 'AUTHORIZATION',
  CAPTURE = 'CAPTURE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: Currency;
  status: WalletStatus;
  type: WalletType;
  createdAt: Date;
  updatedAt: Date;
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED'
}

export enum WalletType {
  PRIMARY = 'PRIMARY',
  SAVINGS = 'SAVINGS',
  REWARDS = 'REWARDS'
}

// Common Types
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Request Types
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  startDate?: Date;
  endDate?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  ACCOUNT = 'ACCOUNT',
  CARD = 'CARD',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM'
}

// KYC Types
export interface KYCDocument {
  id: string;
  userId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  metadata?: Record<string, any>;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  SELFIE = 'SELFIE'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Security Types
export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum SecurityEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED'
}

// Constants
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const TOKEN_EXPIRY_HOURS = 24;
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_DURATION_MINUTES = 30;
```


Based on my analysis of the BOOM Card project structure, I can see this is a loyalty/discount card platform with a TypeScript shared-types module. Since you asked for PART 2 of the implementation (following the imports and types from Part 1), here's the continuation focusing on type exports and additional shared type definitions:

```typescript
// packages/shared-types/src/index.ts - PART 2

// Export all type definitions from various domains
export * from './user';
export * from './auth';
export * from './subscription';
export * from './card';
export * from './partner';
export * from './offer';
export * from './transaction';
export * from './review';
export * from './analytics';
export * from './payment';
export * from './notification';
export * from './search';
export * from './api';
export * from './pos';
export * from './integration';
export * from './common';

// Re-export commonly used types for convenience
export type {
  // User types
  User,
  UserRole,
  UserStatus,
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  MarketingPreferences,
  
  // Auth types
  AuthToken,
  TokenPayload,
  AuthRequest,
  LoginCredentials,
  RegisterData,
  
  // Subscription types
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  
  // Card types
  Card,
  CardStatus,
  
  // Partner types
  Partner,
  PartnerCategory,
  PartnerStatus,
  VerificationStatus,
  PartnerLocation,
  Address,
  Coordinates,
  OpeningHours,
  DayOfWeek,
  
  // Offer types
  Offer,
  DiscountType,
  TimeRange,
  
  // Transaction types
  Transaction,
  TransactionStatus,
  
  // Review types
  Review,
  ReviewStatus,
  
  // Analytics types
  AnalyticsEvent,
  EventType,
  PartnerAnalytics,
  AnalyticsPeriod,
  OfferAnalytics,
  DemographicData,
  
  // Payment types
  PaymentMethod,
  PaymentType,
  PaymentIntent,
  PaymentStatus,
  
  // Notification types
  Notification,
  NotificationType,
  
  // Search types
  SearchFilters,
  SortOption,
  
  // API types
  ApiResponse,
  ApiError,
  ResponseMetadata,
  PaginatedResponse,
  
  // Common types
  AsyncStatus,
  EntityStatus,
  DeepPartial,
  ListQueryParams,
} from './types';

// Type guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isPartner = (obj: any): obj is Partner => {
  return obj && typeof obj.id === 'string' && typeof obj.businessName === 'string';
};

export const isTransaction = (obj: any): obj is Transaction => {
  return obj && typeof obj.id === 'string' && typeof obj.referenceNumber === 'string';
};

export const isApiError = (obj: any): obj is ApiError => {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
};

// Utility type functions
export const createApiResponse = <T>(data: T, success = true): ApiResponse<T> => ({
  success,
  data,
});

export const createApiError = (code: string, message: string, details?: Record<string, any>): ApiError => ({
  code,
  message,
  details,
  timestamp: new Date(),
});

export const createPaginatedResponse = <T>(
  items: T[],
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginatedResponse<T> => ({
  items,
  totalItems,
  currentPage,
  totalPages: Math.ceil(totalItems / pageSize),
  pageSize,
});

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CURRENCY = 'BGN';
export const SUPPORTED_CURRENCIES = ['BGN', 'EUR', 'USD'] as const;
export const SUPPORTED_LANGUAGES = ['en', 'bg'] as const;

// Enums (for backward compatibility)
export enum UserRoleEnum {
  CONSUMER = 'consumer',
  PARTNER = 'partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum CardStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  LOST = 'lost',
}

export enum TransactionStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VOIDED = 'voided',
  REFUNDED = 'refunded',
}

export enum PaymentStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Validation schemas (using type predicates)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidCardNumber = (cardNumber: string): boolean => {
  return /^\d{16}$/.test(cardNumber);
};

export const isValidQRCode = (qrCode: string): boolean => {
  return /^BOOM-\d{10}$/.test(qrCode);
};

// Type converters
export const toUserRole = (role: string): UserRole | undefined => {
  const validRoles: UserRole[] = ['consumer', 'partner', 'admin', 'super_admin'];
  return validRoles.includes(role as UserRole) ? (role as UserRole) : undefined;
};

export const toCardStatus = (status: string): CardStatus | undefined => {
  const validStatuses: CardStatus[] = ['active', 'inactive', 'suspended', 'expired', 'lost'];
  return validStatuses.includes(status as CardStatus) ? (status as CardStatus) : undefined;
};

// Default values
export const defaultUserPreferences: UserPreferences = {
  userId: '',
  notifications: {
    email: true,
    sms: false,
    push: true,
    newOffers: true,
    expiringOffers: true,
    partnerUpdates: false,
    systemUpdates: true,
  },
  privacy: {
    profileVisibility: 'private',
    showLocation: false,
    showUsageHistory: false,
  },
  marketing: {
    newsletter: false,
    promotionalEmails: false,
    partnerOffers: false,
  },
  categories: [],
  cuisineTypes: [],
  dietaryRestrictions: [],
};

// Type version for migrations
export const TYPE_VERSION = '1.0.0';

// Export type version checker
export const isCompatibleTypeVersion = (version: string): boolean => {
  const [major] = version.split('.');
  const [currentMajor] = TYPE_VERSION.split('.');
  return major === currentMajor;
};
