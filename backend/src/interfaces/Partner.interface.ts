import { Document } from 'mongoose';
import { IUser } from './User.interface';
import { ITransaction } from './Transaction.interface';
import { IReward } from './Reward.interface';
;
export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}
export enum PartnerTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}
export enum PartnerCategory {
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  TRAVEL = 'TRAVEL',
  SERVICES = 'SERVICES',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER'
}
export interface IPartnerContact {
  name: string,
  email: string,
  phone: string,
  role: string,
  isPrimary: boolean,
}
export interface IPartnerLocation {
  id: string,
  name: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  latitude: number,
  longitude: number,
  phone?: string
  hours?: Record<string, string>;,
  isActive: boolean,
}
export interface IPartnerRewardConfig {
  rewardType: 'PERCENTAGE' | 'FIXED' | 'POINTS',
  rewardValue: number,
  minPurchaseAmount?: number
  maxRewardAmount?: number
  excludedCategories?: string[]
  validDays?: number[]
  validHours?: { start: string; end: string },
}
export interface IPartnerIntegration {
  type: 'API' | 'WEBHOOK' | 'MANUAL',
  apiEndpoint?: string
  apiKey?: string
  webhookUrl?: string,
  isActive: boolean,
  lastSyncDate?: Date}
export interface IPartnerMetrics {
  totalTransactions: number,
  totalRevenue: number,
  averageTransactionValue: number,
  totalRewardsIssued: number,
  totalRewardsRedeemed: number,
  activeUsers: number,
  conversionRate: number,
  lastUpdated: Date,
}
export interface IPartner extends Document {
  partnerId: string,
  businessName: string,
  legalName: string,
  description?: string;
  logo?: string;
  website?: string,
  category: PartnerCategory,
  status: PartnerStatus,
  tier: PartnerTier,
  taxId?: string,
  contacts: IPartnerContact[];,
  locations: IPartnerLocation[];,
  rewardConfig: IPartnerRewardConfig,
  integration?: IPartnerIntegration,
  metrics: IPartnerMetrics,
  contractStartDate: Date,
  contractEndDate?: Date,
  commissionRate: number,
  paymentTerms: number,
  bankAccount?: {
  accountName: string,
  accountNumber: string,
  routingNumber: string,
  bankName: string,
  },
    features: string[],
  restrictions?: string[];
  tags?: string[];,
  createdBy: IUser['_id'],
  updatedBy?: IUser['_id'];,
  createdAt: Date,
  updatedAt: Date,
}
export const PARTNER_COLLECTION_NAME = 'partners';
export const PARTNER_MODEL_NAME = 'Partner';
;
export const DEFAULT_COMMISSION_RATE = 0.02;
export const DEFAULT_PAYMENT_TERMS = 30;
;
export const TIER_BENEFITS = {
  [PartnerTier.BRONZE]: {
  commissionDiscount: 0,
    prioritySupport: false,
    customIntegration: false,
    marketingSupport: 'basic'
  },
  [PartnerTier.SILVER]: {
  commissionDiscount: 0.05,
    prioritySupport: false,
    customIntegration: false,
    marketingSupport: 'standard'
  },
  [PartnerTier.GOLD]: {
  commissionDiscount: 0.10,
    prioritySupport: true,
    customIntegration: true,
    marketingSupport: 'enhanced'
  },
  [PartnerTier.PLATINUM]: {
  commissionDiscount: 0.15,
    prioritySupport: true,
    customIntegration: true,
    marketingSupport: 'premium'
  }
export interface PartnerOrderSummary {
  totalOrders: number,
  totalRevenue: number,
  averageOrderValue: number,
  topProducts: ProductSummary[];,
  recentOrders: PartnerOrder[],
}
export interface PartnerAnalytics {
  partnerId: string,
  period: {
  start: Date,
  end: Date,
  },
    metrics: {
  totalSales: number,
  totalOrders: number,
  totalCustomers: number,
  averageOrderValue: number,
  conversionRate: number,
  returnRate: number,
  },
    salesByDay: Array<{
  date: string,
  sales: number,
  orders: number,
  }>;,
  topProducts: Array<{
  productId: string,
  productName: string,
  quantity: number,
  revenue: number,
  }>;,
  customerSegments: Array<{
  segment: string,
  count: number,
  revenue: number,
  }>;
}
export interface PartnerInvoice {
  id: string,
  partnerId: string,
  invoiceNumber: string,
  period: {
  start: Date,
  end: Date,
  },
    items: Array<{
  description: string,
  quantity: number,
  unitPrice: number,
  total: number,
  }>;,
  subtotal: number,
  fees: {
  transactionFee: number,
  platformFee: number,
  processingFee: number,
  },
    deductions: {
  returns: number,
  chargebacks: number,
  adjustments: number,
  },
    totalAmount: number,
  status: 'draft' | 'pending' | 'paid' | 'overdue',
  dueDate: Date,
  paidDate?: Date;
  paymentMethod?: string,
  createdAt: Date,
  updatedAt: Date,
}
export interface PartnerNotification {
  id: string,
  partnerId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>;,
  priority: 'low' | 'medium' | 'high',
  read: boolean,
  readAt?: Date,
  createdAt: Date,
}
export interface PartnerApiKey {
  id: string,
  partnerId: string,
  name: string,
  key: string,
  secret?: string,
  permissions: string[],
  ipWhitelist?: string[]
  rateLimit?: {
  requests: number,
  period: 'second' | 'minute' | 'hour' | 'day',
  }
  expiresAt?: Date;
  lastUsedAt?: Date,
  active: boolean,
  createdAt: Date,
  updatedAt: Date,
}
export interface PartnerWebhook {
  id: string,
  partnerId: string,
  url: string,
  events: WebhookEvent[],
  headers?: Record<string, string>
  secret?: string,
  active: boolean,
  retryConfig?: {
  maxAttempts: number,
  backoffMultiplier: number,
  }
  lastPing?: Date,
  failureCount: number,
  createdAt: Date,
  updatedAt: Date,
}
export interface PartnerIntegration {
  id: string,
  partnerId: string,
  type: IntegrationType,
  config: Record<string, any>
  credentials?: {
  encrypted: string,
  iv: string,
  }
  syncSettings?: {
  autoSync: boolean,
  syncInterval: number,
    lastSync?: Date;
    nextSync?: Date;
  }
  fieldMappings?: Array<{
  source: string,
  target: string,
    transform?: string;
  }>;,
  status: 'active' | 'inactive' | 'error',
  errorMessage?: string,
  createdAt: Date,
  updatedAt: Date,
}
export interface PartnerSupport {
  partnerId: string,
  tier: SupportTier,
  assignedAgent?: {
  id: string,
  name: string,
  email: string,
    phone?: string},
    tickets: Array<{
  id: string,
  subject: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  createdAt: Date,
  updatedAt: Date,
  }>;,
  sla: {
  responseTime: number,
  resolutionTime: number,
  }
}
export interface PartnerCompliance {
  partnerId: string,
  documents: Array<{
  id: string,
  type: DocumentType,
  fileName: string,
  fileUrl: string,
  status: 'pending' | 'approved' | 'rejected' | 'expired',
    expiryDate?: Date,
  uploadedAt: Date,
    reviewedAt?: Date
    reviewedBy?: string
    notes?: string}>;,
  certifications: Array<{
  type: string,
  issuer: string,
  certificateNumber: string,
  issueDate: Date,
  expiryDate: Date,
  status: 'active' | 'expired' | 'revoked',
  }>;,
  auditLog: Array<{
  action: string,
  performedBy: string,
  timestamp: Date,
    details?: Record<string, any>;
  }>;,
  complianceScore: number,
  lastReviewDate: Date,
  nextReviewDate: Date,
}
export interface PartnerFinancialAccount {
  partnerId: string,
  balance: {
  available: number,
  pending: number,
  reserved: number,
  },
    currency: Currency,
  transactions: Array<{
  id: string,
  type: 'credit' | 'debit' | 'hold' | 'release',
  amount: number,
  description: string,
    reference?: string,
  status: 'pending' | 'completed' | 'failed' | 'reversed',
  createdAt: Date,
    completedAt?: Date;
  }>;,
  payoutSchedule: {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly',
  nextPayoutDate: Date,
  minimumPayout: number,
  },
    taxSettings: {
    taxId?: string;
    vatNumber?: string,
  taxExempt: boolean,
    taxRate?: number;
  }
}
export interface PartnerMarketplace {
  partnerId: string,
  storefront: {
  name: string,
  slug: string,
    description?: string
    logo?: string
    banner?: string
    theme?: {
  primaryColor: string,
  secondaryColor: string,
  fontFamily: string,
    }
    customDomain?: string;
    seoSettings?: {
  metaTitle: string,
  metaDescription: string,
  keywords: string[],
    }
  },
    categories: string[];,
  featured: boolean,
  rating: {
  average: number,
  count: number,
  },
    policies: {
    return?: string;
    shipping?: string;
    privacy?: string;
    terms?: string;
  }
}
export interface PartnerPermission {
  resource: string,
  actions: PermissionAction[],
  conditions?: Record<string, any>}
export interface PartnerRole {
  id: string,
  name: string,
  description?: string,
  permissions: PartnerPermission[],
  isDefault?: boolean,
  createdAt: Date,
  updatedAt: Date,
}
export interface PartnerTeamMember {
  id: string,
  partnerId: string,
  userId: string,
  email: string,
  name: string,
  role: PartnerRole,
  departments?: string[]
  permissions?: PartnerPermission[];,
  status: 'active' | 'inactive' | 'suspended',
  invitedAt: Date,
  joinedAt?: Date
  lastActiveAt?: Date}
export interface PartnerAuditEntry {
  id: string,
  partnerId: string,
  userId: string,
  action: string,
  resource: string,
  resourceId?: string
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>}
  ipAddress?: string;
  userAgent?: string,
  timestamp: Date,
}
export interface PartnerExport {
  id: string,
  partnerId: string,
  type: 'orders' | 'products' | 'customers' | 'transactions' | 'analytics',
  format: 'csv' | 'excel' | 'json' | 'xml',
  filters?: Record<string, any>;,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  fileUrl?: string
  fileSize?: number
  recordCount?: number
  error?: string,
  requestedBy: string,
  requestedAt: Date,
  completedAt?: Date}
export interface PartnerApiUsage {
  partnerId: string,
  period: {
  start: Date,
  end: Date,
  },
    endpoints: Array<{
  path: string,
  method: string,
  calls: number,
  errors: number,
  averageLatency: number,
  }>;,
  totalCalls: number,
  totalErrors: number,
  bandwidthUsed: number,
  quotaLimit: number,
  quotaRemaining: number,
}
export interface PartnerCustomField {
  id: string,
  partnerId: string,
  name: string,
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect',
  required: boolean,
  options?: string[]
  validation?: {
    pattern?: string
    min?: number
    max?: number
    message?: string},
    appliesTo: 'product' | 'order' | 'customer',
  active: boolean,
  createdAt: Date,
  updatedAt: Date,
}

}