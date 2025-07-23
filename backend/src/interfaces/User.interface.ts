import { Document } from 'mongoose';

export enum UserRole {
  CONSUMER = 'consumer',
  PARTNER = 'partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip'
}

export enum PreferredLanguage {
  EN = 'en',
  BG = 'bg'
}

export interface IUserPreferences {
  language: PreferredLanguage;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    newOffers: boolean;
    expiringOffers: boolean;
    partnerUpdates: boolean;
  };
  categories: string[]; // Preferred categories for recommendations
  dietaryRestrictions: string[];
  communicationFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IUserAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IUserSubscription {
  tier: SubscriptionTier;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  isActive: boolean;
  isTrial: boolean;
  trialEndDate?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface IUserStats {
  totalSavings: number;
  totalTransactions: number;
  totalVisits: number;
  averageDiscountPercentage: number;
  favoritePartners: string[]; // Partner IDs
  lastActiveDate: Date;
  memberSince: Date;
}

export interface IUserDevice {
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  pushToken?: string;
  lastActive: Date;
  appVersion?: string;
  osVersion?: string;
}

export interface IUserSecurity {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'app';
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
}

export interface ISocialLogin {
  provider: 'google' | 'facebook' | 'apple';
  providerId: string;
  email?: string;
  profileUrl?: string;
  connectedAt: Date;
}

export interface IUser extends Document {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Authentication
  password: string;
  role: UserRole;
  status: UserStatus;
  
  // Profile Details
  bio?: string;
  occupation?: string;
  company?: string;
  addresses: IUserAddress[];
  
  // Subscription & Membership
  subscription: IUserSubscription;
  membershipNumber: string;
  qrCode: string;
  referralCode: string;
  referredBy?: string;
  
  // Preferences & Settings
  preferences: IUserPreferences;
  
  // Statistics & Activity
  stats: IUserStats;
  devices: IUserDevice[];
  
  // Security & Verification
  security: IUserSecurity;
  socialLogins: ISocialLogin[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateQRCode(): Promise<string>;
  updateLastActive(): Promise<void>;
  calculateTotalSavings(): Promise<number>;
  isSubscriptionActive(): boolean;
  canAccessPremiumFeatures(): boolean;
  sendVerificationEmail(): Promise<void>;
  sendPasswordResetEmail(): Promise<void>;
}

export interface IUserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  preferredLanguage?: PreferredLanguage;
  acceptTerms: boolean;
  marketingConsent?: boolean;
  referralCode?: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  company?: string;
  addresses?: IUserAddress[];
  preferences?: Partial<IUserPreferences>;
}

export interface IUserFilters {
  role?: UserRole;
  status?: UserStatus;
  subscriptionTier?: SubscriptionTier;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
  search?: string; // Search in name, email, phone
  hasActiveSubscription?: boolean;
  city?: string;
  country?: string;
}

export interface IUserSession {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface IUserNotification {
  userId: string;
  type: 'offer' | 'system' | 'subscription' | 'security' | 'marketing';
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IUserActivity {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
