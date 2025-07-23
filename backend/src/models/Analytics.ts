import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Defines the structure for the 'properties' JSONB field within an AnalyticsEvent.
 * This allows for flexible storage of event-specific data.
 */
export type AnalyticsEventProperties = {
  cardId?: string;
  transactionId?: string;
  userIdTarget?: string; // For actions targeting another user (e.g., admin actions)
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  failureReason?: string;
  loginMethod?: string; // e.g., 'email_password', 'google', 'apple'
  email?: string; // For login attempts, sign-ups
  deviceType?: string; // 'mobile', 'desktop', 'tablet'
  os?: string; // 'iOS', 'Android', 'Windows', 'macOS'
  browser?: string; // 'Chrome', 'Firefox', 'Safari', 'Edge'
  referrer?: string; // Previous page URL
  screenResolution?: string; // e.g., '1920x1080'
  [key: string]: any; // Allow for flexible additional properties
};

/**
 * Enumerates the broad categories an analytics event can belong to.
 */
export enum AnalyticsEventCategory {
  AUTH = 'Authentication',
  USER = 'User Management',
  CARD = 'Card Management',
  TRANSACTION = 'Transaction',
  BOOM_CARD_REQUEST = 'BOOM Card Request',
  FINANCE = 'Finance',
  ADMIN = 'Admin Action',
  SYSTEM = 'System Event',
  PAGES = 'Page View',
  OTHER = 'Other',
}

/**
 * Enumerates specific types of analytics events.
 * These types are grouped under broader categories.
 */
export enum AnalyticsEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'Login Success',
  LOGIN_FAILURE = 'Login Failure',
  LOGOUT = 'Logout',
  SIGNUP_SUCCESS = 'Signup Success',
  SIGNUP_FAILURE = 'Signup Failure',
  PASSWORD_RESET_REQUEST = 'Password Reset Request',
  PASSWORD_RESET_SUCCESS = 'Password Reset Success',
  TWO_FACTOR_ENABLED = '2FA Enabled',
  TWO_FACTOR_DISABLED = '2FA Disabled',
  TWO_FACTOR_CHALLENGE = '2FA Challenge',
  VERIFY_EMAIL = 'Verify Email',

  // User Management Events
  PROFILE_UPDATE = 'Profile Update',
  ADDRESS_UPDATE = 'Address Update',
  KYC_SUBMITTED = 'KYC Submitted',
  KYC_APPROVED = 'KYC Approved',
  KYC_REJECTED = 'KYC Rejected',
  ACCOUNT_DEACTIVATED = 'Account Deactivated',

  // Card Management Events
  CARD_CREATED = 'Card Created',
  CARD_ACTIVATED = 'Card Activated',
  CARD_DEACTIVATED = 'Card Deactivated',
  CARD_SUSPENDED = 'Card Suspended',
  CARD_RESUMED = 'Card Resumed',
  CARD_DETAIL_VIEW = 'Card Detail View',
  CARD_REORDERED = 'Card Reordered',
  CARD_LINKED = 'Card Linked (External)',
  CARD_UNLINKED = 'Card Unlinked (External)',

  // Transaction Events
  TRANSACTION_SUCCESS = 'Transaction Success',
  TRANSACTION_FAILED = 'Transaction Failed',
  TRANSACTION_REFUNDED = 'Transaction Refunded',
  DEPOSIT_SUCCESS = 'Deposit Success',
  DEPOSIT_FAILED = 'Deposit Failed',
  WITHDRAWAL_SUCCESS = 'Withdrawal Success',
  WITHDRAWAL_FAILED = 'Withdrawal Failed',
  TRANSFER_SUCCESS = 'Transfer Success',
  TRANSFER_FAILED = 'Transfer Failed',
  BILL_PAYMENT_SUCCESS = 'Bill Payment Success',
  BILL_PAYMENT_FAILED = 'Bill Payment Failed',

  // BOOM Card Request Specific Events
  BOOM_CARD_REQUEST_CREATED = 'BOOM Card Request Created',
  BOOM_CARD_REQUEST_APPROVED = 'BOOM Card Request Approved',
  BOOM_CARD_REQUEST_REJECTED = 'BOOM Card Request Rejected',
  BOOM_CARD_REQUEST_CANCELED = 'BOOM Card Request Canceled',
  BOOM_CARD_REQUEST_VIEWED = 'BOOM Card Request Viewed',

  // Admin Actions
  ADMIN_USER_IMPERSONATED = 'Admin User Impersonated',
  ADMIN_USER_LOCKED = 'Admin User Locked',
  ADMIN_USER_UNLOCKED = 'Admin User Unlocked',
  ADMIN_TRANSACTION_ADJUSTED = 'Admin Transaction Adjusted',

  // Pages/Navigation Events
  PAGE_VIEW = 'Page View',
  NAVIGATE = 'Navigate',
}

/**
 * Represents an analytics event captured in the system.
 * This TypeORM entity maps to the 'analytics_events' table in the PostgreSQL database.
 */
@Entity('analytics_events')
export class AnalyticsEvent {
  // Properties and their decorators will be defined in PART 2
}

// Define the Analytics Event Schema
const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument, IAnalyticsEventModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model, assuming it exists
    index: true, // Index for efficient querying by user
    required: false, // Optional, as some events might be unauthenticated (e.g., page views)
  },
  eventType: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for efficient querying by event type
  },
  payload: {
    type: Schema.Types.Mixed, // Flexible field to store any JSON object as additional event details
    required: false,
    default: {},
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  sessionId: {
    type: String,
    required: false,
    index: true, // Index for tracking events within a session
  },
}, {
  timestamps: true, // Mongoose automatically adds `createdAt` and `updatedAt` fields
  collection: 'analyticsEvents', // Explicitly define collection name
});

// Mongoose Middleware (Pre-save hook)
// This hook ensures that the `eventType` is always stored in lowercase
// for consistent querying and data analysis.
AnalyticsEventSchema.pre<IAnalyticsEventDocument>('save', function (next) {
  if (this.isModified('eventType') && this.eventType) {
    this.eventType = this.eventType.toLowerCase();
  }
  next();
});

/**
 * Core Business Logic: Static method to simplify recording new analytics events.
 * This method provides a centralized and type-safe way to create and save
 * analytics event documents, encapsulating the underlying Mongoose operations.
 *
 * @param eventData - An object containing the data for the new analytics event.
 *                    It should match the IAnalyticsEvent interface, excluding 'timestamp'
 *                    which is handled by Mongoose `timestamps`.
 * @returns A promise that resolves to the newly created and saved AnalyticsEventDocument.
 * @example
 *   const event = await AnalyticsEvent.recordEvent({
 *     userId: new mongoose.Types.ObjectId('someUserId'),
 *     eventType: 'card_created',
 *     payload: { cardId: 'card123', template: 'basic' },
 *     ipAddress: '192.168.1.1',
 *     userAgent: 'Mozilla/5.0...',
 *     sessionId: 'sessionABC'
 *   });
 */
AnalyticsEventSchema.statics.recordEvent = async function (
  eventData: Omit<IAnalyticsEvent, 'timestamp'>
): Promise<IAnalyticsEventDocument> {
  const newEvent = new this(eventData);
  return newEvent.save();
};

// Create and export the Analytics Event Mongoose Model
const AnalyticsEvent = mongoose.model<IAnalyticsEventDocument, IAnalyticsEventModel>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
