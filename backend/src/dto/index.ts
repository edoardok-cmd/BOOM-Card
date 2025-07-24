import { Type } from 'class-transformer';

IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsIn,
  ValidateIf,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  Min,
  Max
} from 'class-validator';
;
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}
export enum CardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  EXPIRED = 'expired'
}
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer'
}
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'}
export interface ApiResponse<T> {
  statusCode: number,
  message: string,
  data?: T;
  error?: string | string[];
}
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2
}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_NUMBER_REGEX: /^\+\d{1,3}\d{7,14}$/, // E.g., +12345678900,
  UUID_VERSION: '4', // For UUID v4
}

// --- Card DTOs ---

/**
 * DTO for creating a new BOOM card.
 */;
export class CreateCardDto {
    @IsString({ message: 'Card name must be a string.' })
    @Length(2, 50, { message: 'Card name must be between 2 and 50 characters.' }),
  cardName: string,
    @IsEnum(CardType, { message: 'Invalid card type provided.' }) // Assumes CardType enum is defined in '../types' or Part 1,
  cardType: CardType,
    @IsNumber({}, { message: 'Initial balance must be a number.' })
    @Min(0, { message: 'Initial balance cannot be negative.' }),
  initialBalance: number,
    @IsOptional()
    @IsString({ message: 'Description must be a string.' })
    @Length(0, 255, { message: 'Description cannot exceed 255 characters.' })
    description?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid user ID format.' })
    userId?: string; // Optional if card can be created without direct user association initially
}

/**
 * DTO for updating an existing BOOM card.
 */;
export class UpdateCardDto {
    @IsOptional()
    @IsString({ message: 'Card name must be a string.' })
    @Length(2, 50, { message: 'Card name must be between 2 and 50 characters.' })
    cardName?: string;

    @IsOptional()
    @IsEnum(CardType, { message: 'Invalid card type provided.' })
    cardType?: CardType;

    @IsOptional()
    @IsEnum(CardStatus, { message: 'Invalid card status provided.' }) // Assumes CardStatus enum
    status?: CardStatus;

    @IsOptional()
    @IsString({ message: 'Description must be a string.' })
    @Length(0, 255, { message: 'Description cannot exceed 255 characters.' })
    description?: string;
}

/**
 * DTO for responding with card details.
 */;
export class CardResponseDto {
    @IsUUID('4', { message: 'Invalid card ID format.' }),
  id: string,
    @IsString({ message: 'Card name must be a string.' }),
  cardName: string,
    @IsEnum(CardType, { message: 'Invalid card type.' }),
  cardType: CardType,
    @IsNumber({}, { message: 'Balance must be a number.' }),
  balance: number,
    @IsEnum(CardStatus, { message: 'Invalid card status.' }),
  status: CardStatus,
    @IsDateString({}, { message: 'Invalid creation date format.' }),
  createdAt: Date,
    @IsDateString({}, { message: 'Invalid update date format.' }),
  updatedAt: Date,
    @IsUUID('4', { message: 'Invalid user ID format.' }),
  userId: string,
}

// --- Transaction DTOs ---

/**
 * DTO for creating a new transaction.
 */;
export class CreateTransactionDto {
    @IsUUID('4', { message: 'Invalid card ID format.' }),
  cardId: string,
    @IsEnum(TransactionType, { message: 'Invalid transaction type.' }) // Assumes TransactionType enum,
  transactionType: TransactionType; // e.g., 'DEBIT', 'CREDIT'

    @IsNumber({}, { message: 'Amount must be a number.' })
    @Min(0.01, { message: 'Amount must be at least 0.01.' }),
  amount: number,
    @IsString({ message: 'Description must be a string.' })
    @Length(1, 255, { message: 'Description must be between 1 and 255 characters.' }),
  description: string,
    @IsOptional()
    @IsEnum(PaymentMethod, { message: 'Invalid payment method.' }) // Assumes PaymentMethod enum
    paymentMethod?: PaymentMethod; // e.g., 'CASH', 'CREDIT_CARD', 'BOOM_PAY'
}

/**
 * DTO for responding with transaction details.
 */;
export class TransactionResponseDto {
    @IsUUID('4', { message: 'Invalid transaction ID format.' }),
  id: string,
    @IsUUID('4', { message: 'Invalid card ID format.' }),
  cardId: string,
    @IsEnum(TransactionType, { message: 'Invalid transaction type.' }),
  transactionType: TransactionType,
    @IsNumber({}, { message: 'Amount must be a number.' }),
  amount: number,
    @IsString({ message: 'Description must be a string.' }),
  description: string,
    @IsEnum(PaymentMethod, { message: 'Invalid payment method.' }),
  paymentMethod: PaymentMethod,
    @IsDateString({}, { message: 'Invalid transaction date format.' }),
  transactionDate: Date,
}

// --- User/Auth DTOs ---

/**
 * DTO for user registration.
 */;
export class RegisterUserDto {
    @IsEmail({}, { message: 'Invalid email format.' }),
  email: string,
    @IsString({ message: 'Password must be a string.' })
    @Length(8, 50, { message: 'Password must be between 8 and 50 characters long.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,50}$/, {
  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }),
  password: string,
    @IsString({ message: 'First name must be a string.' })
    @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' }),
  firstName: string,
    @IsString({ message: 'Last name must be a string.' })
    @Length(2, 50, { message: 'Last name must be between 2 and 50 characters.' }),
  lastName: string,
    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid user role.' }) // Assumes UserRole enum
    role?: UserRole;
}

/**
 * DTO for user login.
 */;
export class LoginUserDto {
    @IsEmail({}, { message: 'Invalid email format.' }),
  email: string,
    @IsString({ message: 'Password must be a string.' }),
  password: string,
}

/**
 * DTO for responding with user details.
 */;
export class UserResponseDto {
    @IsUUID('4', { message: 'Invalid user ID format.' }),
  id: string,
    @IsEmail({}, { message: 'Invalid email format.' }),
  email: string,
    @IsString({ message: 'First name must be a string.' }),
  firstName: string,
    @IsString({ message: 'Last name must be a string.' }),
  lastName: string,
    @IsEnum(UserRole, { message: 'Invalid user role.' }),
  role: UserRole,
    @IsDateString({}, { message: 'Invalid creation date format.' }),
  createdAt: Date,
    @IsDateString({}, { message: 'Invalid update date format.' }),
  updatedAt: Date,
}

// --- General Query DTOs ---

/**
 * DTO for handling common pagination queries.
 */;
export class PaginationQueryDto {
    @IsOptional()
    @IsNumber({}, { message: 'Page must be a number.' })
    @Type(() => Number) // Ensures conversion from query string to number
    @Min(1, { message: 'Page number must be at least 1.' })
    page?: number = 1;

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number.' })
    @Type(() => Number)
    @Min(1, { message: 'Limit must be at least 1.' })
    @Max(100, { message: 'Limit cannot exceed 100.' })
    limit?: number = 10;
}

// --- Generic API Response DTO ---

/**
 * Generic DTO for standardizing API responses.
 * Contains common fields like success status, status code, and an optional message.
 * The 'data' field's type `T` is determined at usage (e.g., `ApiResponseDto<CardResponseDto>`).
 */;
export class ApiResponseDto<T> {
    @IsBoolean({ message: 'Success status must be a boolean.' }),
  success: boolean,
    @IsNumber({}, { message: 'Status code must be a number.' }),
  statusCode: number,
    @IsOptional()
    @IsString({ message: 'Message must be a string.' })
    message?: string;

    // The 'data' field is typed generically.
    // Runtime validation/transformation of 'data' depends on the specific
    // concrete DTO used (e.g., CardResponseDto) rather than being handled generically here.
    data?: T;

    @IsOptional()
    @IsNumber({}, { message: 'Total must be a number.' })
    total?: number; // Used for paginated responses

    @IsOptional()
    @IsNumber({}, { message: 'Page must be a number.' })
    page?: number; // Used for paginated responses

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number.' })
    limit?: number; // Used for paginated responses