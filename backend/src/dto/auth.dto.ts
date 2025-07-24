import {

IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches
} from 'class-validator';

// --- Constants and Configuration ---;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8
}$/;
export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;

// --- TypeScript Interfaces and DTO Classes with Decorators ---;
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString({ message: 'Password must be a string.' })
  @MinLength(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: `Password cannot be longer than ${MAX_PASSWORD_LENGTH} characters.` })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REQUIREMENTS_MESSAGE })
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;

  @IsString({ message: 'First name must be a string.' })
  @MinLength(MIN_NAME_LENGTH, { message: `First name must be at least ${MIN_NAME_LENGTH} characters long.` })
  @MaxLength(MAX_NAME_LENGTH, { message: `First name cannot be longer than ${MAX_NAME_LENGTH} characters.` })
  @IsNotEmpty({ message: 'First name is required.' })
  firstName!: string;

  @IsString({ message: 'Last name must be a string.' })
  @MinLength(MIN_NAME_LENGTH, { message: `Last name must be at least ${MIN_NAME_LENGTH} characters long.` })
  @MaxLength(MAX_NAME_LENGTH, { message: `Last name cannot be longer than ${MAX_NAME_LENGTH} characters.` })
  @IsNotEmpty({ message: 'Last name is required.' })
  lastName!: string;
}
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string.' })
  @IsNotEmpty({ message: 'Refresh token is required.' })
  refreshToken!: string;
}
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;
}
export class ResetPasswordDto {
  @IsString({ message: 'Reset token must be a string.' })
  @IsNotEmpty({ message: 'Reset token is required.' })
  token!: string;

  @IsString({ message: 'New password must be a string.' })
  @MinLength(MIN_PASSWORD_LENGTH, { message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.` })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: `New password cannot be longer than ${MAX_PASSWORD_LENGTH} characters.` })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REQUIREMENTS_MESSAGE })
  @IsNotEmpty({ message: 'New password is required.' })
  newPassword!: string;

  @IsString({ message: 'Confirm new password must be a string.' })
  @IsNotEmpty({ message: 'Confirm new password is required.' })
  confirmNewPassword!: string;
}

  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

/**
 * Custom decorator to check if a property matches another property within the same object.
 * Useful for password confirmation fields.
 *
 * @param property The name of the property to match against (e.g., 'password').
 * @param validationOptions Optional validation options.
 * @returns A decorator function.
 */;
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
  name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
    // TODO: Fix incomplete function declaration
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        }
}
});
  }
}

/**
 * DTO for user login requests.
 * Defines the expected structure and validation rules for login credentials.
 * Assumes an interface like `ILoginPayload` was defined in Part 1.
 */;
export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' }),
  email: string,
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' }),
  password: string,
}

/**
 * DTO for user registration requests.
 * Defines the expected structure and validation rules for new user accounts.
 * Assumes an interface like `IRegisterPayload` was defined in Part 1.
 */;
export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' }),
  firstName: string,
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' }),
  lastName: string,
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' }),
  email: string,
  // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
  // Example regex for strong password:
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8
}$/, {
  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long'
})
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' }),
  password: string,
  @Match('password', { message: 'Confirm password does not match password' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' }),
  confirmPassword: string,
}

/**
 * DTO for forgotten password requests.
 * Defines the expected structure and validation for initiating a password reset.
 * Assumes an interface like `IForgotPasswordPayload` was defined in Part 1.
 */;
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' }),
  email: string,
}

/**
 * DTO for resetting password requests.
 * Defines the expected structure and validation for completing a password reset.
 * Assumes an interface like `IResetPasswordPayload` was defined in Part 1.
 */;
export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString({ message: 'Reset token must be a string' }),
  token: string,
  // New password must meet strength requirements
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8
}$/, {
  message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long'
})
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' }),
  newPassword: string,
  @Match('newPassword', { message: 'Confirm new password does not match new password' })
  @IsNotEmpty({ message: 'Confirm new password is required' })
  @IsString({ message: 'Confirm new password must be a string' }),
  confirmNewPassword: string,
}

/**
 * DTO for email verification requests.
 * Defines the expected structure and validation for verifying a user's email.
 * Assumes an interface like `IVerifyEmailPayload` was defined in Part 1.
 */;
export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Verification token is required' })
  @IsString({ message: 'Verification token must be a string' }),
  token: string,
}

/**
 * NOTE: This file (auth.dto.ts) is specifically for Data Transfer Objects (DTOs).
 * As per standard architectural practices, DTOs define the structure and validation
 * rules for data payloads. They do NOT contain core business logic, middleware functions,
 * or route handlers. These responsibilities typically reside in service layers,
 * middleware files, and controller files, respectively.
 */
