// Global type definitions for BOOM Card platform

import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  language: 'en' | 'bg';
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletedAt?: Date;
}

export type UserRole = 'consumer' | 'partner' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserPreferences {
  userId: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  marketing: MarketingPreferences;
  categories: string[];
  cuisineTypes: string[];
  dietaryRestrictions: string[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  newOffers: boolean;
  expiringOffers: boolean;
  partnerUpdates: boolean;
  systemUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showLocation: boolean;
  showUsageHistory: boolean;
}

export interface MarketingPreferences {
  newsletter: boolean;
  promotionalEmails: boolean;
  partnerOffers: boolean;
}

// Authentication types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
  sessionId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  cardId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  autoRenew: boolean;
  paymentMethodId?: string;
  trialEndDate?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending' | 'trial' | 'suspended';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  maxSavings?: number;
  isActive: boolean;
  trialDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Card types
export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  qrCode: string;
  barcode?: string;
  status: CardStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  isVirtual: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type CardStatus = 'active' | 'inactive' | 'suspended' | 'expired' | 'lost';

// Partner types
export interface Partner {
  id: string;
  businessName: string;
  legalName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description: string;
  category: PartnerCategory;
  subcategories: string[];
  status: PartnerStatus;
  verificationStatus: VerificationStatus;
  rating?: number;
  reviewCount?: number;
  joinedAt: Date;
  verifiedAt?: Date;
  suspendedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PartnerCategory = 'food_drink' | 'entertainment' | 'accommodation' | 'experiences' | 'services';
export type PartnerStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface PartnerLocation {
  id: string;
  partnerId: string;
  name: string;
  address: Address;
  coordinates: Coordinates;
  phone?: string;
  email?: string;
  openingHours: OpeningHours[];
  isMainLocation: boolean;
  amenities?: string[];
  images?: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OpeningHours {
  dayOfWeek: DayOfWeek;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed?: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Offer types
export interface Offer {
  id: string;
  partnerId: string;
  locationIds: string[];
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumSpend?: number;
  maximumDiscount?: number;
  category: string;
  subcategories?: string[];
  validFrom: Date;
  validTo: Date;
  availableDays?: DayOfWeek[];
  availableHours?: TimeRange[];
  termsConditions: string;
  isActive: boolean;
  requiresActivation?: boolean;
  usageLimit?: number;
  usageCount?: number;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'special';

export interface TimeRange {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  partnerId: string;
  locationId: string;
  offerId?: string;
  cardId: string;
  referenceNumber: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: string;
  posTransactionId?: string;
  metadata?: Record<string, any>;
  validatedAt?: Date;
  voidedAt?: Date;
  voidReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'voided' | 'refunded';

// Review types
export interface Review {
  id: string;
  userId: string;
  partnerId: string;
  locationId?: string;
  transactionId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount?: number;
  reportCount?: number;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewStatus = 'active' | 'hidden' | 'flagged' | 'removed';

// Analytics types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: EventType;
  eventName: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export type EventType = 'page_view' | 'click' | 'search' | 'transaction' | 'engagement' | 'conversion';

export interface PartnerAnalytics {
  partnerId: string;
  period: AnalyticsPeriod;
  views: number;
  clicks: number;
  transactions: number;
  revenue: number;
  averageTransaction: number;
  conversionRate: number;
  topOffers: OfferAnalytics[];
  demographics: DemographicData;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface OfferAnalytics {
  offerId: string;
  views: number;
  redemptions: number;
  revenue: number;
  conversionRate: number;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
  locations: Record<string, number>;
}

// Payment types
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentType;
  isDefault: boolean;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  billingAddress?: Address;
  status: 'active' | 'expired' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentType = 'card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay';

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 'offer' | 'transaction' | 'subscription' | 'system' | 'marketing' | 'security';

// Search and filter types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  subcategories?: string[];
  location?: {
    coordinates?: Coordinates;
    radius?: number;
    city?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  features?: string[];
  availability?: {
    date?: Date;
    time?: string;
    dayOfWeek?: DayOfWeek;
  };
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption = 'relevance' | 'rating' | 'distance' | 'popularity' | 'newest' | 'discount';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ResponseMetadata {
  totalCount?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

// POS Integration types
export interface PosIntegration {
  id: string;
  partnerId:
}