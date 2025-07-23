// 1. All import statements
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ms from 'ms'; // For parsing time strings like '1d', '15m'
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for refresh tokens

// Assuming custom error classes and common messages are defined in utils/appError
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ErrorCode, // Assuming ErrorCode enum/const exists
  ErrorMessage // Assuming ErrorMessage enum/const exists
} from '../utils/appError';

// Assuming a centralized configuration utility
import config from '../config';

// 2. All TypeScript interfaces and types

/**
 * Represents a simplified user entity relevant for authentication purposes.
 * A more comprehensive User interface/model might exist elsewhere in the project.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string; // The hashed password stored in the database
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'guest'; // Example roles, adjust as per project needs
  isEmailVerified: boolean;
  refreshTokenId?: string | null; // ID of the currently valid refresh token for this user's session
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // Indicates if the user account is active/enabled
  failedLoginAttempts: number;
  lockUntil?: Date; // Timestamp until which the account is locked
}

/**
 * Payload structure for Access Tokens (JWT).
 * Contains essential user information and token type.
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: User['role']; // Use the role type defined in User interface
  type: 'access'; // Discriminator to distinguish access token JWTs
  iat?: number; // Issued At timestamp (Unix epoch seconds)
  exp?: number; // Expiration timestamp (Unix epoch seconds)
}

/**
 * Payload structure for Refresh Tokens.
 * These can also be JWTs, containing a unique ID linked to the session.
 */
export interface IRefreshTokenPayload {
  userId: string;
  email: string;
  refreshTokenId: string; // A unique identifier for this specific refresh token instance
  type: 'refresh'; // Discriminator to distinguish refresh token JWTs
  iat?: number; // Issued At timestamp (Unix epoch seconds)
  exp?: number; // Expiration timestamp (Unix epoch seconds)
}

/**
 * Represents the pair of access and refresh tokens returned after successful authentication.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Represents the data returned after a successful authentication (login or registration).
 */
export interface IAuthenticatedUser {
  // Basic user information visible to the client after authentication
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'isEmailVerified' | 'isActive'>;
  tokens: AuthTokens; // The generated access and refresh tokens
}

/**
 * Union type for different token categories for better type safety.
 */
export type TokenType = 'access' | 'refresh';

// 3. All constants and configuration

// JWT configuration values loaded from the central configuration module
export const JWT_SECRET: string = config.jwt.secret;
export const ACCESS_TOKEN_EXPIRATION: string = config.jwt.accessTokenExpiration; // e.g., '15m', '1h'
export const REFRESH_TOKEN_EXPIRATION: string = config.jwt.refreshTokenExpiration; // e.g., '7d', '30d'

// Hashing configuration for bcrypt
export const BCRYPT_SALT_ROUNDS: number = config.security.bcryptSaltRounds;

// Account lock configuration for security (e.g., after too many failed login attempts)
export const MAX_LOGIN_ATTEMPTS: number = config.security.maxLoginAttempts;
export const ACCOUNT_LOCK_TIME_MS: number = ms(config.security.accountLockTime); // Convert string (e.g., '1h') to milliseconds

// Explicit string constants for token types to avoid magic strings
export const TOKEN_TYPE_ACCESS: TokenType = 'access';
export const TOKEN_TYPE_REFRESH: TokenType = 'refresh';

// Common authentication-related messages for consistent error responses and user feedback.
// These are often derived from a shared ErrorMessage enum or constant object.
export const AUTH_MESSAGES = {
  USER_NOT_FOUND: ErrorMessage.USER_NOT_FOUND,
  INVALID_CREDENTIALS: ErrorMessage.INVALID_CREDENTIALS,
  PASSWORD_MISMATCH: 'New password and confirmation password do not match.',
  PASSWORD_RESET_TOKEN_INVALID: 'Password reset token is invalid or expired.',
  PASSWORD_UPDATE_FAILED: 'Failed to update password.',
  EMAIL_ALREADY_EXISTS: ErrorMessage.EMAIL_ALREADY_EXISTS,
  LOGOUT_FAILED: 'Failed to log out.',
  TOKEN_INVALID: 'Invalid or expired token.',
  NO_TOKEN_PROVIDED: 'No authentication token provided.',
  PASSWORD_RESET_REQUEST_FAILED: 'Failed to initiate password reset request.',
  PASSWORD_RESET_CONFIRM_FAILED: 'Failed to confirm password reset.',
  ACCOUNT_LOCKED: `Account is locked due to too many failed login attempts. Please try again after ${config.security.accountLockTime} or contact support.`,
  UNAUTHORIZED_ACCESS: ErrorMessage.UNAUTHORIZED,
  EMAIL_NOT_VERIFIED: 'Your email address has not been verified. Please check your inbox for a verification email.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support for assistance.',
  USER_BLOCKED: 'This user account is currently blocked.',
};

// 4. Any decorators or metadata
// No specific decorators or metadata are typically required for the initial setup
// of a service class in TypeScript, unless using a Dependency Injection (DI) framework
// like InversifyJS, TypeDI, or tsyringe, which would introduce decorators like `@injectable()`
// or `@Service()`. For this part, none are needed.

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, LoginPayload, RegisterPayload, AuthResponse, AuthServiceConfig } from '../types/auth.types'; // Assuming these types are defined in Part 1
import { AuthServiceError, AuthServiceErrorType } from '../errors/auth.errors'; // Assuming AuthServiceError and AuthServiceErrorType are defined in Part 1

// Define a generic interface for the user model/repository methods
// This allows the AuthService to be agnostic to the specific ORM (e.g., Prisma, Mongoose)
interface IUserModel {
    findUnique(args: { where: { email: string }): Promise<User | null>;
    create(args: { data: { email: string; passwordHash: string; name?: string; /* add other required fields */ } }): Promise<User>;
    // Add other necessary methods like findById, update etc. if your service requires them
}

/**
 * AuthService class provides core authentication functionalities.
 * This includes user registration, login, and JWT token management.
 */
export class AuthService {
    private userModel: IUserModel;
    private config: AuthServiceConfig;

    /**
     * Initializes the AuthService with a user model and configuration.
     * @param userModel An object conforming to IUserModel, typically an ORM model or repository.
     * @param config Configuration object containing JWT secret and token expiry.
     */
    constructor(userModel: IUserModel, config: AuthServiceConfig) {
        this.userModel = userModel;
        this.config = config;
    }

    /**
     * Generates a JSON Web Token for a given user ID.
     * The token includes the user ID in its payload and is signed with the configured secret.
     * @param userId The unique identifier of the user.
     * @returns The generated JWT string.
     */
    private generateToken(userId: string): string {
        return jwt.sign({ userId }, this.config.jwtSecret, {
            expiresIn: this.config.tokenExpiresIn, // e.g., '1h', '7d'
        });
    }

    /**
     * Hashes a plain-text password using bcrypt.
     * @param password The plain-text password to hash.
     * @returns A promise that resolves to the hashed password string.
     */
    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; // Recommended salt rounds for bcrypt
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares a plain-text password with a hashed password.
     * @param password The plain-text password provided by the user.
     * @param hashedPassword The stored hashed password from the database.
     * @returns A promise that resolves to true if the passwords match, false otherwise.
     */
    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Registers a new user with the provided details.
     * @param payload An object containing the user's email, password, and optional name.
     * @returns A promise that resolves to an AuthResponse object (user details and token).
     * @throws AuthServiceError if a user with the given email already exists.
     */
    public async register(payload: RegisterPayload): Promise<AuthResponse> {
        const { email, password, name } = payload;

        // Check if a user with the provided email already exists
        const existingUser = await this.userModel.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AuthServiceError(
                AuthServiceErrorType.USER_ALREADY_EXISTS,
                'User with this email already exists.'
            );
        }

        // Hash the user's password before storing it
        const passwordHash = await this.hashPassword(password);

        // Create the new user record in the database
        const newUser = await this.userModel.create({
            data: {
                email,
                passwordHash,
                name,
                // Add any other default fields required by your User model (e.g., createdAt, isActive, role)
            },
        });

        // Generate a JWT for the newly registered user
        const token = this.generateToken(newUser.id); // Assuming the User object has an 'id' property

        // Return the user's public details and the authentication token
        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                // Ensure sensitive data like passwordHash is excluded from the returned user object
            },
            token,
        };
    }

    /**
     * Logs in an existing user with the provided credentials.
     * @param payload An object containing the user's email and password.
     * @returns A promise that resolves to an AuthResponse object (user details and token).
     * @throws AuthServiceError if the credentials (email or password) are invalid.
     */
    public async login(payload: LoginPayload): Promise<AuthResponse> {
        const { email, password } = payload;

        // Find the user by their email address
        const user = await this.userModel.findUnique({
            where: { email },
        });

        // If no user is found, or password doesn't match, throw invalid credentials error
        if (!user) {
            throw new AuthServiceError(
                AuthServiceErrorType.INVALID_CREDENTIALS,
                'Invalid email or password.'
            );
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await this.comparePassword(password, user.passwordHash); // Assuming User has passwordHash field

        if (!isPasswordValid) {
            throw new AuthServiceError(
                AuthServiceErrorType.INVALID_CREDENTIALS,
                'Invalid email or password.'
            );
        }

        // Generate a JWT for the authenticated user

        // Return the user's public details and the authentication token
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    /**
     * Validates a given JWT token.
     * @param token The JWT string to validate.
     * @returns The decoded payload of the token if valid.
     * @throws AuthServiceError if the token is invalid, expired, or malformed.
     */
    public validateToken(token: string): string | jwt.JwtPayload {
        try {
            // Verify the token using the configured secret
            const decoded = jwt.verify(token, this.config.jwtSecret);
            return decoded;
        } catch (error) {
            // Handle specific JWT errors
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthServiceError(
                    AuthServiceErrorType.EXPIRED_TOKEN,
                    'Authentication token has expired.'
                );
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthServiceError(
                    AuthServiceErrorType.INVALID_TOKEN,
                    'Invalid authentication token.'
                );
            }
            // Catch any other unexpected errors during token validation
            throw new AuthServiceError(
                AuthServiceErrorType.UNKNOWN_ERROR,
                'Failed to validate token due to an unknown error.'
            );
        }

    // Additional methods (e.g., for password reset, email verification) could be added here
    // public async requestPasswordReset(email: string): Promise<void> { /* ... */ }
    // public async resetPassword(token: string, newPassword: string): Promise<void> { /* ... */ }

// Example usage context (not part of the service, but how it's integrated):
// In your controller or route handler file:
/*
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { PrismaClient } from '@prisma/client'; // Example with Prisma

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration for the auth service (e.g., from environment variables)
const authServiceConfig = {
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
    tokenExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

// Create an instance of the auth service
const authService = new AuthService(prisma.user, authServiceConfig);

// Example controller method for registration
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const authResponse = await authService.register({ email, password, name });
        res.status(201).json(authResponse);
    } catch (error) {
        if (error instanceof AuthServiceError) {
            return res.status(409).json({ message: error.message, type: error.type });
        }
        res.status(500).json({ message: 'An unexpected error occurred.' });
    };

// Example controller method for login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        res.status(200).json(authResponse);
    } catch (error) {
        if (error instanceof AuthServiceError) {
            const statusCode = error.type === AuthServiceErrorType.INVALID_CREDENTIALS ? 401 : 500;
            return res.status(statusCode).json({ message: error.message, type: error.type });
        }
        res.status(500).json({ message: 'An unexpected error occurred.' });
    };

// Example middleware for authentication
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        (req as any).user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        if (error instanceof AuthServiceError) {
            return res.status(statusCode).json({ message: error.message, type: error.type });
        }
        res.status(500).json({ message: 'Failed to authenticate token.' });
    };
*/

// Assuming all necessary imports from PART 1 and PART 2 are already at the top of the file.
// Example imports that would typically be at the top of the full file:
// import { prisma } from '../config/prisma';
// import config from '../config/config';
// import ApiError from '../utils/ApiError';
// import httpStatus from 'http-status';
// import { generateAuthTokens, verifyToken, TokenTypes } from '../utils/token.utils';
// import { hashPassword, verifyPassword } from '../utils/password.utils';
// import { sendEmail } from '../utils/email.utils';
// import { RegisterUserDto, LoginUserDto, UpdateUserDto, ChangePasswordDto } from '../dtos/auth.dto'; // Example DTOs

// Assuming the AuthService class definition started in PART 1,
// and its public methods (registerUser, loginUser, etc.) were defined in PART 1 & 2.
class AuthService {
    constructor() {
        // Any necessary service-level initialization
    }

    // Public methods (e.g., registerUser, loginUser, refreshTokens, logoutUser,
    // verifyEmail, forgotPassword, resetPassword) would be implemented here from PART 1 & 2.
    // Example placeholder:
    /*
    public async registerUser(registerBody: any) {
        // ... previous implementation ...
    }

    public async loginUser(loginBody: any) {
        // ... previous implementation ...
    }
    // ... more public methods
    */

    /**
     * @private
     * @description Helper function to format a user object for client-side response.
     * This ensures consistency in how user data is returned after operations like login or registration.
     * @param user The user object retrieved from the database.
     * @param tokens Optional token object to include in the response (e.g., for login/register).
     * @returns A standardized user response object.
     */
    private _formatUserResponse(user: any, tokens?: { accessToken: string; refreshToken: string }) {
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                // Add any other user fields relevant for a public response
            },
            tokens: tokens || null, // Only include tokens if provided
        };
    }

    /**
     * @private
     * @description Helper to find a user by ID or throw a NOT_FOUND error.
     * Useful for operations that require an existing user, preventing repetition of `findUnique` and `if (!user)` checks.
     * @param userId The ID of the user to find.
     * @returns The user object if found.
     * @throws ApiError with HTTP_STATUS.NOT_FOUND if the user does not exist.
     */
    private async _getUserByIdOrThrow(userId: string) {
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
        }
        return user;
    }

    /**
     * @private
     * @description Helper to verify a token and handle common verification errors.
     * This centralizes the error handling for token validation across different methods
     * that might need to verify a JWT (e.g., email verification, password reset, refresh tokens).
     * It leverages an external `verifyToken` utility and wraps its potential errors into `ApiError`.
     * @param token The JWT string to verify.
     * @param type The expected type of the token (e.g., 'refresh', 'access', 'resetPassword').
     * @returns The payload decoded from the token if valid.
     * @throws ApiError with HTTP_STATUS.UNAUTHORIZED if the token is invalid or expired.
     */
    private async _verifyTokenAndHandleError(token: string, type: TokenTypes) {
        try {
            // Assume `verifyToken` from `token.utils` handles the core verification logic
            // and throws if the token is malformed, expired, or invalid.
            const payload = await verifyToken(token, type);

            // This check might be redundant if `verifyToken` always throws on invalidity,
            // but it's a good safeguard if `verifyToken` could return null/undefined.
            if (!payload) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token.');
            }
            return payload;
        } catch (error: any) {
            // If `verifyToken` throws an `ApiError` directly, re-throw it.
            if (error instanceof ApiError) {
                throw error;
            }
            // For any other unexpected errors during token verification, wrap them.
            // This ensures a consistent error response format.
            throw new ApiError(httpStatus.UNAUTHORIZED, `Token verification failed: ${error.message || 'Invalid token.'}`);
        }

    // Error Handlers:
    // Within a service, error handling typically involves throwing `ApiError` instances
    // for specific business logic failures (e.g., "User not found", "Email already registered",
    // "Incorrect password"). These `ApiError`s are then caught by a global error handling middleware
    // (e.g., defined in `src/middlewares/error.ts`) which sends a standardized response to the client.
    // The private helper methods above (`_getUserByIdOrThrow`, `_verifyTokenAndHandleError`)
    // demonstrate how such error throwing can be encapsulated for reusability within the service.
    // Explicit, separate "error handler functions" are less common in a service file itself,
    // as the main error handling orchestration happens in middleware.
}

// Export statements and Module exports
// Instantiate the AuthService to create a singleton instance.
// This instance will be imported and used by controllers.

// Export the instance as the default export of this module.
export default authService;

}
}
}
}
}
}
}
