import { User } from './User.interface';
import { Card } from './Card.interface';
import { Merchant } from './Merchant.interface';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  TRANSFER = 'TRANSFER',
  CASH_ADVANCE = 'CASH_ADVANCE',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  PAYMENT = 'PAYMENT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SETTLED = 'SETTLED',
  DECLINED = 'DECLINED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
  VOIDED = 'VOIDED'
}

export enum TransactionChannel {
  ONLINE = 'ONLINE',
  IN_STORE = 'IN_STORE',
  ATM = 'ATM',
  PHONE = 'PHONE',
  MAIL = 'MAIL',
  AUTOMATIC = 'AUTOMATIC'
}

export enum DeclineReason {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CARD_EXPIRED = 'CARD_EXPIRED',
  CARD_BLOCKED = 'CARD_BLOCKED',
  INVALID_PIN = 'INVALID_PIN',
  EXCEEDS_LIMIT = 'EXCEEDS_LIMIT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  MERCHANT_BLOCKED = 'MERCHANT_BLOCKED',
  TECHNICAL_ERROR = 'TECHNICAL_ERROR'
}

export interface TransactionAmount {
  value: number;
  currency: string;
  exchangeRate?: number;
  originalAmount?: {
    value: number;
    currency: string;
  };
}

export interface TransactionFee {
  type: string;
  amount: number;
  description?: string;
}

export interface TransactionMetadata {
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    latitude: number;
    longitude: number;
    country: string;
    city?: string;
  };
  riskScore?: number;
  fraudChecks?: Record<string, any>;
}

export interface AuthorizationDetails {
  authCode: string;
  authDate: Date;
  expiresAt: Date;
  capturedAmount?: number;
  remainingAmount?: number;
}

export interface SettlementDetails {
  batchId: string;
  settlementDate: Date;
  processorReference: string;
  settlementAmount: TransactionAmount;
}

export interface Transaction {
  id: string;
  userId: string;
  cardId: string;
  merchantId?: string;
  type: TransactionType;
  status: TransactionStatus;
  channel: TransactionChannel;
  amount: TransactionAmount;
  fees: TransactionFee[];
  totalAmount: number;
  description: string;
  reference: string;
  externalReference?: string;
  authorizationDetails?: AuthorizationDetails;
  settlementDetails?: SettlementDetails;
  declineReason?: DeclineReason;
  metadata?: TransactionMetadata;
  relatedTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  card?: Card;
  merchant?: Merchant;
}

export interface CreateTransactionDto {
  userId: string;
  cardId: string;
  merchantId?: string;
  type: TransactionType;
  channel: TransactionChannel;
  amount: TransactionAmount;
  description: string;
  reference?: string;
  externalReference?: string;
  metadata?: TransactionMetadata;
}

export interface UpdateTransactionDto {
  status?: TransactionStatus;
  authorizationDetails?: AuthorizationDetails;
  settlementDetails?: SettlementDetails;
  declineReason?: DeclineReason;
  metadata?: TransactionMetadata;
}

export interface TransactionFilter {
  userId?: string;
  cardId?: string;
  merchantId?: string;
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  channel?: TransactionChannel | TransactionChannel[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  reference?: string;
}

export interface TransactionPaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface TransactionAggregation {
  totalAmount: number;
  totalFees: number;
  transactionCount: number;
  averageAmount: number;
  byType: Record<TransactionType, number>;
  byStatus: Record<TransactionStatus, number>;
  byChannel: Record<TransactionChannel, number>;
}

export const TRANSACTION_LIMITS = {
  DAILY_PURCHASE: 10000,
  DAILY_CASH_ADVANCE: 1000,
  SINGLE_TRANSACTION: 5000,
  DAILY_TRANSACTION_COUNT: 50
} as const;

export const TRANSACTION_FEE_TYPES = {
  CASH_ADVANCE: 'CASH_ADVANCE_FEE',
  FOREIGN_TRANSACTION: 'FOREIGN_TRANSACTION_FEE',
  LATE_PAYMENT: 'LATE_PAYMENT_FEE',
  OVERLIMIT: 'OVERLIMIT_FEE',
  RETURNED_PAYMENT: 'RETURNED_PAYMENT_FEE'
} as const;

export const AUTHORIZATION_EXPIRY_DAYS = 7;
export const SETTLEMENT_BATCH_WINDOW_HOURS = 24;

export interface ITransaction {
  userId: Types.ObjectId; // ID of the user associated with this transaction
  cardId?: Types.ObjectId; // Optional: ID of the card involved in the transaction (e.g., for purchases made with a specific card)
  amount: number; // The amount of money involved in the transaction
  currency: string; // The currency of the transaction (e.g., 'USD', 'EUR')
  type: TransactionType; // The type of transaction (e.g., 'deposit', 'withdrawal', 'purchase', 'refund', 'transfer_in', 'transfer_out')
  status: TransactionStatus; // The current status of the transaction (e.g., 'pending', 'completed', 'failed', 'cancelled')
  description?: string; // An optional brief description of the transaction
  merchantInfo?: { // Optional: Details about the merchant for 'purchase' transactions
    name: string;
    category: string; // e.g., 'Groceries', 'Utilities', 'Entertainment'
    location?: string; // Optional: Physical location of the merchant
  };
  sourceAccountId?: Types.ObjectId; // Optional: ID of the source account (e.g., internal account ID for transfers or external bank account ID for withdrawals)
  destinationAccountId?: Types.ObjectId; // Optional: ID of the destination account (e.g., internal account ID for transfers or external bank account ID for deposits)
  referenceId?: string; // Optional: An external reference ID (e.g., from a payment gateway, bank transaction ID)
  metadata?: Record<string, any>; // Optional: Flexible field for additional, arbitrary data related to the transaction
  createdAt: Date; // Timestamp when the transaction record was created
  updatedAt: Date; // Timestamp when the transaction record was last updated
}

// Interface for a Mongoose Document, extending ITransaction with Mongoose-specific properties and methods.
// This is typically used when defining Mongoose models.
export interface ITransactionDocument extends ITransaction, Document {
  // Mongoose automatically adds:
  // _id: Types.ObjectId;
  // save(): Promise<ITransactionDocument>;
  // ...other Mongoose document methods
}
