import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  IsPositive,
  Min,
  Max,
  IsIn,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Enums ---
export enum SubscriptionType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  LIFETIME = 'LIFETIME',
  CUSTOM = 'CUSTOM', // For specific, non-standard subscriptions
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRIALING = 'TRIALING',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  PENDING = 'PENDING', // e.g., awaiting payment confirmation
}

// --- Interfaces & Types (DTOs) ---

/**
 * @class SubscriptionDto
 * @description Data Transfer Object for representing a subscription resource.
 *              Used typically for API responses.
 */
export class SubscriptionDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsOptional()
  @IsUUID()
  planId?: string; // ID of the associated subscription plan

  @IsDefined()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date; // For fixed-term subscriptions or cancellation effective date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextBillingDate?: Date; // For recurring subscriptions

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  currency: string; // e.g., 'USD', 'EUR'

  @IsOptional()
  @IsString()
  paymentProviderSubscriptionId?: string; // ID from payment gateway (e.g., Stripe Subscription ID)

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}

/**
 * @class CreateSubscriptionDto
 * @description Data Transfer Object for creating a new subscription.
 *              Used for incoming request bodies (POST /subscriptions).
 */
export class CreateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  userId?: string; // Optional, if user ID is derived from authentication context

  @IsEnum(SubscriptionType)
  @IsOptional() // Could be derived from planId if a plan is specified
  type?: SubscriptionType;

  @IsOptional()
  @IsUUID()
  planId?: string; // ID of the subscription plan to associate with

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date; // Optional, defaults to current date/time if not provided

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number; // Optional, usually derived from plan, but can be overridden

  @IsOptional()
  @IsString()
  currency?: string; // Optional, usually derived from plan

  @IsString()
  @IsOptional() // Not always required (e.g., for free trials or admin-created subscriptions)
  paymentMethodId?: string; // ID of the payment method token (e.g., Stripe Payment Method ID)

  @IsString()
  @IsOptional()
  couponCode?: string; // Optional coupon code for discounts
}

/**
 * @class UpdateSubscriptionDto
 * @description Data Transfer Object for updating an existing subscription.
 *              Used for incoming request bodies (PATCH /subscriptions/:id).
 */
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date; // To set a new end date, e.g., for immediate cancellation or fixed term

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextBillingDate?: Date; // To adjust the next billing date for recurring subscriptions

  @IsOptional()
  @IsUUID()
  planId?: string; // To change the associated plan (upgrade/downgrade)

  @IsOptional()
  @IsString()
  paymentMethodId?: string; // To update the primary payment method for the subscription
}

/**
 * @class FilterSubscriptionDto
 * @description Data Transfer Object for filtering and paginating subscription queries.
 *              Used for incoming query parameters (GET /subscriptions?status=ACTIVE&limit=10).
 */
export class FilterSubscriptionDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateMin?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateMax?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateMin?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateMax?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  sortBy?: string; // e.g., 'createdAt', 'startDate', 'price'

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

import {
  IsString,
  IsEmail,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  IsInt,
  IsIn,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus, PaymentStatus } from '../enums/subscription.enum'; // Assuming these enums are defined

// Note: This file is a Data Transfer Object (DTO) file.
// Its primary purpose is to define the structure and validation rules for data
// being transferred into and out of the application layers (e.g., from API requests).
// Core business logic, middleware functions, and route handlers do NOT belong here.
// They should be implemented in services/controllers, middleware directories, and route definitions respectively.

/**
 * DTO for creating a new subscription.
 * Defines the required fields and their validation rules for incoming subscription creation requests.
 */
export class CreateSubscriptionDto {
  /**
   * The UUID of the user for whom the subscription is being created.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  /**
   * The UUID of the subscription plan.
   * @example "plan-uuid-abc-123"
   */
  @IsUUID('4', { message: 'planId must be a valid UUID' })
  planId: string;

  /**
   * The start date of the subscription. Must be a valid ISO 8601 date string.
   * @example "2023-10-26T10:00:00Z"
   */
  @IsDate({ message: 'startDate must be a valid date' })
  @Type(() => Date)
  startDate: Date;

  /**
   * The end date of the subscription. Must be a valid ISO 8601 date string.
   * @example "2024-10-26T10:00:00Z"
   */
  @IsDate({ message: 'endDate must be a valid date' })
  @Type(() => Date)
  endDate: Date;

  /**
   * The initial status of the subscription.
   * Must be one of the values defined in SubscriptionStatus enum.
   * @example "active"
   */
  @IsEnum(SubscriptionStatus, { message: 'status must be a valid SubscriptionStatus' })
  status: SubscriptionStatus;

  /**
   * The initial payment status of the subscription.
   * Must be one of the values defined in PaymentStatus enum.
   * @example "paid"
   */
  @IsEnum(PaymentStatus, { message: 'paymentStatus must be a valid PaymentStatus' })
  paymentStatus: PaymentStatus;

  /**
   * Indicates whether the subscription should auto-renew.
   * @example true
   */
  @IsBoolean({ message: 'autoRenew must be a boolean value' })
  autoRenew: boolean;

  /**
   * The initial payment amount for the subscription.
   * Must be a positive number.
   * @example 99.99
   */
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with up to 2 decimal places' })
  @IsPositive({ message: 'amount must be a positive number' })
  amount: number;
}

/**
 * DTO for updating an existing subscription.
 * All fields are optional, allowing partial updates.
 */
export class UpdateSubscriptionDto {
  /**
   * The new end date of the subscription.
   * @example "2025-10-26T10:00:00Z"
   */
  @IsOptional()
  @IsDate({ message: 'endDate must be a valid date' })
  @Type(() => Date)
  endDate?: Date;

  /**
   * The new status of the subscription.
   * @example "cancelled"
   */
  @IsOptional()
  @IsEnum(SubscriptionStatus, { message: 'status must be a valid SubscriptionStatus' })
  status?: SubscriptionStatus;

  /**
   * The new payment status of the subscription.
   * @example "failed"
   */
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'paymentStatus must be a valid PaymentStatus' })
  paymentStatus?: PaymentStatus;

  /**
   * Indicates whether the subscription should auto-renew.
   * @example false
   */
  @IsOptional()
  @IsBoolean({ message: 'autoRenew must be a boolean value' })
  autoRenew?: boolean;
}

/**
 * DTO for representing a subscription in a response.
 * This class mirrors the structure of a subscription entity that would be returned to the client.
 */
export class SubscriptionResponseDto {
  /**
   * The unique identifier of the subscription.
   * @example "sub-uuid-abc-123"
   */
  @IsUUID('4')
  id: string;

  /**
   * The unique identifier of the user associated with the subscription.
   * @example "user-uuid-xyz-789"
   */
  @IsUUID('4')
  userId: string;

  /**
   * The unique identifier of the plan associated with the subscription.
   * @example "plan-uuid-def-456"
   */
  @IsUUID('4')
  planId: string;

  /**
   * The start date of the subscription.
   * @example "2023-10-26T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  /**
   * The end date of the subscription.
   * @example "2024-10-26T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  /**
   * The current status of the subscription.
   * @example "active"
   */
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  /**
   * The current payment status of the subscription.
   * @example "paid"
   */
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  /**
   * Indicates whether the subscription is set to auto-renew.
   * @example true
   */
  @IsBoolean()
  autoRenew: boolean;

  /**
   * The amount paid for the subscription.
   * @example 99.99
   */
  @IsNumber()
  amount: number;

  /**
   * The date and time when the subscription record was created.
   * @example "2023-10-26T09:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  /**
   * The date and time when the subscription record was last updated.
   * @example "2023-10-26T11:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

/**
 * DTO for filtering subscriptions when fetching a list.
 * Allows optional parameters to query subscriptions based on various criteria.
 */
export class SubscriptionFilterDto {
  /**
   * Filter by user ID.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsOptional()
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId?: string;

  /**
   * Filter by plan ID.
   * @example "plan-uuid-abc-123"
   */
  @IsOptional()
  @IsUUID('4', { message: 'planId must be a valid UUID' })
  planId?: string;

  /**
   * Filter by subscription status.
   * @example "active"
   */
  @IsOptional()
  @IsEnum(SubscriptionStatus, { message: 'status must be a valid SubscriptionStatus' })
  status?: SubscriptionStatus;

  /**
   * Filter by payment status.
   * @example "paid"
   */
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'paymentStatus must be a valid PaymentStatus' })
  paymentStatus?: PaymentStatus;

  /**
   * Filter by auto-renew status.
   * @example true
   */
  @IsOptional()
  @IsBoolean({ message: 'autoRenew must be a boolean value' })
  @Type(() => Boolean) // Ensure boolean transformation from query string
  autoRenew?: boolean;

  /**
   * Pagination: Page number (1-based index).
   * @example 1
   */
  @IsOptional()
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  @Type(() => Number)
  page?: number;

  /**
   * Pagination: Number of items per page.
   * @example 10
   */
  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number;

  /**
   * Sorting field.
   * @example "startDate"
   */
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsIn(['startDate', 'endDate', 'createdAt', 'amount'], { message: 'sortBy field is not supported' })
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'amount';

  /**
   * Sorting order.
   * @example "DESC"
   */
  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC';
}
