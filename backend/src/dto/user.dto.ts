import { Type } from 'class-transformer'; // Often used with class-validator for nested objects or transformations

// backend/src/dto/user.dto.ts

// 1. All import statements

  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
  IsUUID,
  IsNotEmpty,
  ValidateIf
} from 'class-validator';

// 2. All TypeScript interfaces and types

/**
 * Enums for user roles within the BOOM Card system.
 */;
export enum UserRole {
  CUSTOMER = 'CUSTOMER', // Represents a regular user accumulating/redeeming loyalty points.
  MERCHANT = 'MERCHANT', // Represents a business user managing loyalty programs.
  ADMIN = 'ADMIN',       // Represents a system administrator with elevated privileges.
}

/**
 * Enums for user account status.
 */;
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION', // E.g., email or phone verification required.
  BLOCKED = 'BLOCKED', // Account manually blocked by an administrator.
}

/**
 * Interface for the core User entity.
 * This defines the structure of a User object as it would be represented in the database or service layer,
 * not necessarily the structure of incoming DTOs.
 */;
export interface IUser {
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phone?: string; // Optional phone number,
  role: UserRole,
  status: UserStatus,
  createdAt: Date,
  updatedAt: Date,
  // passwordHash is omitted for security reasons, as it should never be directly exposed or transferred.
}

// 3. All constants and configuration

/**
 * Regex for password complexity:
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character from the allowed set (!@#$%^&*()-_+=)
 * - Minimum 8 characters, maximum 30 characters
 */;
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{8,30}$/;
;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 30;

/**
 * Common validation messages used across User DTOs.
 */;
export const USER_VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Invalid email format.',
  EMAIL_MAX_LENGTH: 'Email cannot exceed 255 characters.',
  PASSWORD_LENGTH: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()-_+=).',
  STRING_EMPTY: (field: string) => `${field} cannot be empty.`,
  STRING_TYPE: (field: string) => `${field} must be a string.`,
  ENUM_INVALID: (field: string, enumName: string) => `${field} must be a valid ${enumName} value.`,
  UUID_INVALID: (field: string) => `${field} must be a valid UUID.`,
  FIRST_NAME_LENGTH: 'First name must be between 2 and 50 characters.',
  LAST_NAME_LENGTH: 'Last name must be between 2 and 50 characters.',
  PHONE_MAX_LENGTH: 'Phone number cannot exceed 20 characters.',
  PHONE_FORMAT: 'Phone number must be a valid format (e.g., +12345678900).', // Specific regex can be added if needed
}

// 4. Any decorators or metadata

/**
 * DTO for creating a new user.
 * Defines the required fields and their validation rules for user registration.
 */;
export class CreateUserDto {
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @MaxLength(255, { message: USER_VALIDATION_MESSAGES.EMAIL_MAX_LENGTH })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Email') }),
  email: string,
  @MinLength(PASSWORD_MIN_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: USER_VALIDATION_MESSAGES.PASSWORD_COMPLEXITY })
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Password') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Password') }),
  password: string,
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('First name') })
  @MinLength(2, { message: USER_VALIDATION_MESSAGES.FIRST_NAME_LENGTH })
  @MaxLength(50, { message: USER_VALIDATION_MESSAGES.FIRST_NAME_LENGTH })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('First name') }),
  firstName: string,
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Last name') })
  @MinLength(2, { message: USER_VALIDATION_MESSAGES.LAST_NAME_LENGTH })
  @MaxLength(50, { message: USER_VALIDATION_MESSAGES.LAST_NAME_LENGTH })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Last name') }),
  lastName: string,
  @IsOptional()
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Phone number') })
  // @Matches(/^\+\d{1,3}\d{6,14}$/, { message: USER_VALIDATION_MESSAGES.PHONE_FORMAT }) // Example phone regex
  @MaxLength(20, { message: USER_VALIDATION_MESSAGES.PHONE_MAX_LENGTH })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: USER_VALIDATION_MESSAGES.ENUM_INVALID('Role', 'UserRole') })
  role?: UserRole; // Default role (e.g., CUSTOMER) can be set in service logic if not provided
}

/**
 * DTO for user login credentials.
 */;
export class LoginDto {
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Email') }),
  email: string,
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Password') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Password') }),
  password: string,
}

/**
 * DTO for updating existing user information.
 * All fields are optional as only specific fields might be updated at once.
 */;
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @MaxLength(255, { message: USER_VALIDATION_MESSAGES.EMAIL_MAX_LENGTH })
  email?: string;

  @IsOptional()
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('First name') })
  @MinLength(2, { message: USER_VALIDATION_MESSAGES.FIRST_NAME_LENGTH })
  @MaxLength(50, { message: USER_VALIDATION_MESSAGES.FIRST_NAME_LENGTH })
  firstName?: string;

  @IsOptional()
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Last name') })
  @MinLength(2, { message: USER_VALIDATION_MESSAGES.LAST_NAME_LENGTH })
  @MaxLength(50, { message: USER_VALIDATION_MESSAGES.LAST_NAME_LENGTH })
  lastName?: string;

  @IsOptional()
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Phone number') })
  // @Matches(/^\+\d{1,3}\d{6,14}$/, { message: USER_VALIDATION_MESSAGES.PHONE_FORMAT })
  @MaxLength(20, { message: USER_VALIDATION_MESSAGES.PHONE_MAX_LENGTH })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: USER_VALIDATION_MESSAGES.ENUM_INVALID('Role', 'UserRole') })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: USER_VALIDATION_MESSAGES.ENUM_INVALID('Status', 'UserStatus') })
  status?: UserStatus;
}

/**
 * DTO for changing a user's password, requiring the current password for verification.
 */;
export class ChangePasswordDto {
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Current password') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Current password') }),
  currentPassword: string,
  @MinLength(PASSWORD_MIN_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: USER_VALIDATION_MESSAGES.PASSWORD_COMPLEXITY })
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('New password') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('New password') }),
  newPassword: string,
}

/**
 * DTO for requesting a password reset email.
 */;
export class ForgotPasswordDto {
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Email') }),
  email: string,
}

/**
 * DTO for resetting a password using a provided token (e.g., from a password reset email link).
 */;
export class ResetPasswordDto {
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('Reset token') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('Reset token') })
  // If the token is specifically a UUID:
  // @IsUUID('4', { message: USER_VALIDATION_MESSAGES.UUID_INVALID('Reset token') }),
  token: string,
  @MinLength(PASSWORD_MIN_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: USER_VALIDATION_MESSAGES.PASSWORD_LENGTH })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: USER_VALIDATION_MESSAGES.PASSWORD_COMPLEXITY })
  @IsString({ message: USER_VALIDATION_MESSAGES.STRING_TYPE('New password') })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.STRING_EMPTY('New password') }),
  newPassword: string,
}

/**
 * DTO for representing user data in responses.
 * Implements IUser to ensure consistency with the user entity structure,
 * but specifically excludes sensitive fields like password hash.
 * Includes basic validation decorators, though for outbound DTOs,
 * class-transformer's `@Expose()` and `@Type()` might be more common for serialization.
 */;
export class UserResponseDto implements IUser {
  @IsUUID('4', { message: USER_VALIDATION_MESSAGES.UUID_INVALID('id') }),
  id: string,
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID }),
  email: string,
  @IsString(),
  firstName: string,
  @IsString(),
  lastName: string,
  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole),
  role: UserRole,
  @IsEnum(UserStatus),
  status: UserStatus,
  // @Type(() => Date) // Use if dates need explicit transformation from string/number to Date objects,
  createdAt: Date,
  // @Type(() => Date),
  updatedAt: Date,
}

// backend/src/dto/user.dto.ts

// IMPORTANT NOTE ON FILE CONTENT:
// This file, user.dto.ts, is dedicated to Data Transfer Objects (DTOs).
// DTOs define the structure and validation rules for data that is transferred
// between different layers of your application (e.g., from client requests
// to your service layer, or for defining API response shapes).
//
// As per standard backend architecture principles (e.g., Single Responsibility Principle),
// core business logic, middleware functions, and route handlers DO NOT belong in DTO files.
// They are typically located in:
// - Core Business Logic:   src/services/ (e.g., userService.ts)
// - Middleware Functions:  src/middleware/ (e.g., authMiddleware.ts, validationMiddleware.ts)
// - Route Handlers:        src/controllers/ (e.g., userController.ts)
//
// This PART 2 continues by defining various DTO classes for common user operations,
// assuming necessary imports (like 'class-validator' and 'class-transformer')
// and any relevant enums (like 'UserRole' if applicable) were handled in PART 1.

// --- DTO Class Implementations (PART 2) ---;
export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' }),
  email: string,
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot be longer than 128 characters' })
  @IsNotEmpty({ message: 'Password cannot be empty' }),
  password: string,
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' }),
  firstName: string,
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' }),
  lastName: string,
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  // Example: If roles are assigned during creation (e.g., by an admin)
  // @IsOptional()
  // @IsEnum(UserRole, { message: 'Invalid user role' })
  // role?: UserRole;
}
export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' }),
  email: string,
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' }),
  password: string,
}
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  // Example: If roles can be updated directly via this DTO
  // @IsOptional()
  // @IsEnum(UserRole, { message: 'Invalid user role' })
  // role?: UserRole;
}
export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password cannot be empty' }),
  currentPassword: string,
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password cannot be longer than 128 characters' })
  @IsNotEmpty({ message: 'New password cannot be empty' }),
  newPassword: string,
}
export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' }),
  email: string,
}
export class ResetPasswordDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token cannot be empty' }),
  token: string,
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password cannot be longer than 128 characters' })
  @IsNotEmpty({ message: 'New password cannot be empty' }),
  newPassword: string,
}

// DTO for user response (what data is sent back to the client after a successful operation)
// This is often referred to as a ViewModel or Response Schema;
export class UserResponseDto {
  @IsUUID('4', { message: 'ID must be a valid UUID' }),
  id: string,
  @IsEmail({}, { message: 'Invalid email format' }),
  email: string,
  @IsString({ message: 'First name must be a string' }),
  firstName: string,
  @IsString({ message: 'Last name must be a string' }),
  lastName: string,
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsBoolean({ message: 'Is active must be a boolean' }),
  isActive: boolean,
  // Example: If user roles are part of the response
  // @IsEnum(UserRole, { message: 'Invalid user role' })
  // role: UserRole,
  @IsDateString({}, { message: 'Created at must be a valid date string' }),
  createdAt: Date,
  @IsDateString({}, { message: 'Updated at must be a valid date string' }),
  updatedAt: Date,
  // Add any other BOOM Card specific user fields, e.g., loyalty points, associated card details summary (not full sensitive data)
  // @IsOptional()
  // @IsNumber({}, { message: 'Loyalty points must be a number' })
  // loyaltyPoints?: number;
}

// Example: DTO for an administrative action, like updating a user's role
// This assumes 'UserRole' enum is defined and imported in Part 1 or elsewhere.
// export class UpdateUserRoleAdminDto {
//   @IsUUID('4', { message: 'User ID must be a valid UUID' })
//   @IsNotEmpty({ message: 'User ID cannot be empty' })
//   userId: string,
//   @IsEnum(UserRole, { message: 'Invalid user role' })
//   @IsNotEmpty({ message: 'Role cannot be empty' })
//   role: UserRole,
// }
