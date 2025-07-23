// backend/src/dto/transaction.dto.ts

import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
  Max,
  IsDefined,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enums for transaction-related properties
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELED = 'CANCELED',
  PROCESSING = 'PROCESSING',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  TOP_UP = 'TOP_UP',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  FEE = 'FEE',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum Currency {
  USD = 'USD',
  // Add other currencies as needed for future expansion
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Interfaces and DTO classes
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export class TransactionResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  cardId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantCategoryCode?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsUUID()
  relatedTransactionId?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

export class CreateTransactionDto {
  @IsDefined()
  @IsUUID()
  userId: string;

  @IsDefined()
  @IsUUID()
  cardId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantCategoryCode?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsUUID()
  relatedTransactionId?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  referenceId?: string; // For updating external references
}

export class GetTransactionsFilterDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  cardId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'amount', 'type', 'status', 'userId', 'cardId'])
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

/**
 * Constants and configuration
 */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_ORDER = SortOrder.DESC;

import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  IsPositive,
  IsDateString,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

// Assuming TransactionType and TransactionStatus enums are defined in Part 1
// or imported from a common types file (e.g., './types').
// If defined directly in Part 1 of this file, the import below can be removed.
import { TransactionType, TransactionStatus } from './types'; 

/**
 * DTO for creating a new transaction.
 * Represents the input data required to initiate a financial transaction.
 */
export class CreateTransactionDto {
  @IsUUID('4', { message: 'Source account ID must be a valid UUID' })
  @IsDefined({ message: 'Source account ID is required' })
  sourceAccountId: string;

  @IsUUID('4', { message: 'Destination account ID must be a valid UUID' })
  @IsDefined({ message: 'Destination account ID is required' })
  destinationAccountId: string;

  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with up to 2 decimal places' })
  @IsDefined({ message: 'Amount is required' })
  amount: number;

  @IsString({ message: 'Currency must be a string' })
  @IsDefined({ message: 'Currency is required' })
  // Consider adding @IsISO4217CurrencyCode if a custom validator for currency codes is available
  currency: string;

  @IsEnum(TransactionType, { message: 'Invalid transaction type' })
  @IsDefined({ message: 'Transaction type is required' })
  type: TransactionType;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Reference ID must be a string' })
  referenceId?: string; // Optional external reference ID for tracking
}

/**
 * DTO for filtering and paginating transaction lists.
 * Used when retrieving multiple transactions with specific criteria.
 */
export class GetTransactionsFilterDto {
  @IsOptional()
  @IsUUID('4', { message: 'Account ID must be a valid UUID' })
  accountId?: string; // Filter by a specific account involved in the transaction

  @IsOptional()
  @IsEnum(TransactionType, { message: 'Invalid transaction type filter' })
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Invalid transaction status filter' })
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString({ message: 'Start date must be a valid ISO 8601 date string' })
  startDate?: string; // e.g., '2023-01-01' or '2023-01-01T00:00:00Z'

  @IsOptional()
  @IsDateString({ message: 'End date must be a valid ISO 8601 date string' })
  endDate?: string; // e.g., '2023-12-31' or '2023-12-31T23:59:59Z'

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Minimum amount must be a number' })
  @Type(() => Number) // Converts query string parameter to a number
  @IsPositive({ message: 'Minimum amount must be positive' })
  minAmount?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Maximum amount must be a number' })
  @Type(() => Number) // Converts query string parameter to a number
  @IsPositive({ message: 'Maximum amount must be positive' })
  maxAmount?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number) // Converts query string parameter to a number
  page?: number = 1;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number) // Converts query string parameter to a number
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string; // e.g., 'createdAt', 'amount', 'status'

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'Sort order must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * DTO for updating the status of an existing transaction.
 */
export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus, { message: 'Invalid transaction status' })
  @IsDefined({ message: 'Transaction status is required' })
  status: TransactionStatus;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string; // Optional notes regarding the status change (e.g., reason for failure)
}

/**
 * DTO for a transaction response.
 * This class defines the structure of transaction data returned by the API.
 * It's often a simplified or transformed version of the internal database model.
 */
export class TransactionResponseDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  sourceAccountId: string;

  @IsUUID('4')
  destinationAccountId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsDateString()
  createdAt: string; // ISO 8601 string for creation timestamp

  @IsDateString()
  updatedAt: string; // ISO 8601 string for last update timestamp

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
