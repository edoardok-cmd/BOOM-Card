// 1. All import statements
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { config } from '../config/config';
import { redisClient } from '../config/redis';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import * as otpService from '../services/otp.service';
import * as emailService from '../services/email.service';
import { generateAuthTokens } from '../utils/jwt';
import {
  RegisterDto,
  LoginDto,
  RequestOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dtos/auth.dto';
import { UserRole, UserStatus } from '../enums/user.enum';
import { cookieOptions } from '../utils/cookieOptions';

// 2. All TypeScript interfaces and types
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    status: UserStatus;
  };
}

interface JWTPayload {
  id: string;
  role: UserRole;
  status: UserStatus;
}

// 3. All constants and configuration
// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRATION_SECONDS = 5 * 60; // 5 minutes

// Token and Cookie Configuration
const REFRESH_TOKEN_COOKIE_NAME = 'jid';

// 4. Any decorators or metadata
// (No decorators are standard in a typical Express setup without additional frameworks.)

// Remove duplicate imports - these are already imported above

// Extend Express Request type to include 'user' property which will be set by authentication middleware
declare module 'express-serve-static-core' {
    interface Request {
        user?: BoomCardUser; // The user object set by JWT authentication middleware
    }
}

/**
 * AuthController class handles all authentication-related API requests.
 * It acts as an intermediary between the HTTP requests and the AuthService.
 * It's responsible for request validation, invoking service methods, and sending responses.
 */
export class AuthController {
    private authService: AuthService;

    /**
     * Constructs an AuthController instance.
     * @param authService An instance of AuthService to handle core authentication logic.
     */
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    /**
     * Handles user registration.
     * Validates input, calls the auth service to register the user, and sends a response.
     */
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { error, value } = AuthValidationSchema.register.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            const userData = value;
            const result: IRegisterResponse = await this.authService.registerUser(userData);

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                userId: result.userId,
                email: result.email
            });
        } catch (error) {
            next(error); // Pass error to the global error handling middleware
        }
    };

    /**
     * Handles user login.
     * Validates credentials, calls the auth service to authenticate, and sets refresh token as an HttpOnly cookie.
     */
    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { error, value } = AuthValidationSchema.login.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            const { email, password } = value;
            const result: ILoginResponse = await this.authService.loginUser(email, password);

            // Set refresh token as an HttpOnly cookie for security
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                sameSite: 'strict', // Protects against CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            });

            res.status(200).json({
                message: 'Login successful.',
                accessToken: result.accessToken,
                user: result.user // Return basic user info with access token
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles email verification.
     * Extracts token from query, calls service to verify, and confirms.
     */
    public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { token } = req.query;

            if (!token || typeof token !== 'string') {
                return next(ApiError.badRequest('Verification token is missing or invalid.'));
            }

            await this.authService.verifyEmail(token);

            res.status(200).json({ message: 'Email verified successfully. Your account is now active.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles resending email verification link.
     * Validates email, calls service to resend, and confirms.
     */
    public resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { error, value } = AuthValidationSchema.resendVerification.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            const { email } = value;
            await this.authService.resendVerificationEmail(email);

            res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Initiates the forgot password process.
     * Validates email and calls service to send a password reset link.
     */
    public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { error, value } = AuthValidationSchema.forgotPassword.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            const { email } = value;
            await this.authService.requestPasswordReset(email);

            // Send a generic message to prevent email enumeration
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles password reset using a reset token.
     * Extracts token from query, validates new password, and calls service to reset.
     */
    public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { token } = req.query;
            const { error, value } = AuthValidationSchema.resetPassword.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            if (!token || typeof token !== 'string') {
                return next(ApiError.badRequest('Password reset token is missing or invalid.'));
            }

            const { newPassword } = value;
            await this.authService.resetPassword(token, newPassword);

            res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Allows a logged-in user to change their password.
     * Requires authentication (req.user must be populated by middleware).
     * Validates current and new passwords, then calls service to update.
     */
    public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Ensure user is authenticated by checking if req.user is set
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required to change password.'));
            }

            const { error, value } = AuthValidationSchema.changePassword.validate(req.body);
            if (error) {
                return next(ApiError.badRequest(error.details[0].message));
            }

            const { currentPassword, newPassword } = value;
            await this.authService.changePassword(req.user.id, currentPassword, newPassword);

            res.status(200).json({ message: 'Password changed successfully.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Refreshes access token using a valid refresh token from the cookie.
     * Obtains a new access token and potentially a new refresh token.
     */
    public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const oldRefreshToken = req.cookies.refreshToken;

            if (!oldRefreshToken) {
                // Clear the cookie if no refresh token is present, indicating a potential stale state
                res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
                return next(ApiError.unauthorized('No refresh token found. Please log in again.'));
            }

            const { accessToken, newRefreshToken, user } = await this.authService.refreshAuthTokens(oldRefreshToken);

            // Set the new refresh token as an HttpOnly cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({
                message: 'Access token refreshed successfully.',
                accessToken,
                user
            });
        } catch (error) {
            // If refresh token is invalid or expired, clear the cookie and pass error
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            next(error);
        }
    };

    /**
     * Handles user logout.
     * Invalidates the refresh token (if present) and clears the refresh token cookie.
     */
    public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                // Attempt to invalidate the refresh token in the database
                await this.authService.logoutUser(refreshToken);
            }

            // Always clear the refresh token cookie on logout, regardless of backend invalidation success
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({ message: 'Logged out successfully.' });
        } catch (error) {
            // Even if logout fails on the backend (e.g., token already invalid),
            // we should still clear the client-side cookie for a consistent user experience.
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            next(error);
        }
    };

    /**
     * Retrieves the profile of the currently logged-in user.
     * Requires authentication (req.user must be populated by middleware).
     */
    public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required to retrieve profile.'));
            }

            // The 'req.user' object is populated by the authentication middleware.
            // For a complete profile, it's good practice to fetch it fresh from the service.
            const userProfile = await this.authService.getUserById(req.user.id);

            if (!userProfile) {
                return next(ApiError.notFound('User profile not found.'));
            }

            res.status(200).json(userProfile);
        } catch (error) {
            next(error);
        }
    };
}

// --- Helper/Utility Functions (if any - typically reside in `src/utils` or `src/services`) ---
// Controller files generally focus on orchestrating requests and responses, delegating complex
// logic and specific utilities to service layers or dedicated utility files.
// However, a very simple, context-specific helper might be placed here.
// For instance, a function to format the user object before sending it in a response:

/**
 * Formats a user object for secure and consistent responses.
 * @param user The raw user object from the database.
 * @returns A formatted user object with only necessary fields.
 */
const formatUserForResponse = (user: any) => {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // Exclude sensitive fields like password, tokens, etc.
    };
};

// Note: If this utility is used by multiple controllers or is more complex,
// it should be moved to a shared `src/utils` file (e.g., `src/utils/userUtils.ts`).

// --- Error Handlers (Controller-level Error Handling) ---
// Controller functions primarily use `try...catch` blocks to catch errors thrown
// by services or other parts of the application. These caught errors are then
// passed to the Express `next()` function, which dispatches them to a global
// error handling middleware (e.g., `src/middleware/error.middleware.ts`).
// Custom errors (like `BoomCardError`) should be thrown from the service layer
// or utility functions, and they will be properly handled by the global error middleware.

// Example of how errors are handled within controller functions (this would be inside functions defined in PART 2):
/*
// Duplicate import removed: import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { BoomCardError } from '../utils/boomCardError'; // Assuming custom error class
// Duplicate import removed: import * as authService from '../services/auth.service';

export const exampleControllerFunction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ... controller logic, e.g., calling a service
        const data = await authService.someServiceCall(req.body);
        res.status(httpStatus.OK).json({ success: true, data });
    } catch (error: any) {
        // Pass the error to the global error handler middleware
        next(error);
    }
};
*/

// No separate error handling *functions* are typically defined here, as it's handled by middleware.

// --- Export Statements / Module Exports ---
// Assuming the main controller functions (e.g., register, login, logout, etc.)
// were defined in PART 2 without direct `export` keywords.
// This section exports them as a module.

// Note: The AuthController class is already exported above.
// If there were standalone functions to export, they would be listed here.
