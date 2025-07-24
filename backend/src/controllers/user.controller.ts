import { Request, Response } from 'express';
import { Pool } from 'pg';
import { getUserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

// Extend Request to include user from auth middleware;
interface AuthenticatedRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
  }
}
export class UserController {
  private userService;

  constructor(pool: Pool) {
    this.userService = getUserService(pool);
  }

  /**
   * Register a new user
   * POST /api/users/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, password, first name and last name are required', 400);
    }
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
const user = await this.userService.createUser({
      email,
      password,
      firstName,
      lastName,
      phone;
    });

    // Generate token;

const token = await this.userService.loginUser({ email, password });

    res.status(201).json({
      success: true,
      data: {
        user,
        token: token.token
      }
    });
  });

  /**
   * Login user
   * POST /api/users/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }
const result = await this.userService.loginUser({ email, password });

    res.json({
  success: true,
      data: result
    });
  });

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.userService.getUserById(parseInt(req.user!.id));

    if (!user) {
      throw new AppError('User not found', 404);
    };

    res.json({
  success: true,
      data: user
    });
  });

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { firstName, lastName, phone, birthDate, address } = req.body;
;

const user = await this.userService.updateUser(
      parseInt(req.user!.id),
      {
        firstName,
        lastName,
        phone,
        birthDate,
        address
      };
    );

    res.json({
  success: true,
      data: user
    });
  });

  /**
   * Update password
   * PUT /api/users/password
   */
  updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    await this.userService.updatePassword(
      parseInt(req.user!.id),
      currentPassword,
      newPassword
    );

    res.json({
  success: true,
      message: 'Password updated successfully'
    });
  });

  /**
   * Get user by ID (admin only)
   * GET /api/users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
;

const user = await this.userService.getUserById(parseInt(id));

    if (!user) {
      throw new AppError('User not found', 404);
    };

    res.json({
  success: true,
      data: user
    });
  });

  /**
   * Update user membership (admin only)
   * PUT /api/users/:id/membership
   */
  updateMembership = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const { membershipType, validUntil } = req.body;

    if (!membershipType) {
      throw new AppError('Membership type is required', 400);
    }
const user = await this.userService.updateMembership(
      parseInt(id),
      membershipType,
      validUntil ? new Date(validUntil) : undefined;
    );

    res.json({
  success: true,
      data: user
    });
  });

  /**
   * Get user activity
   * GET /api/users/activity
   */
  getUserActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
;

const activities = await this.userService.getUserActivity(parseInt(req.user!.id), limit);

    res.json({
  success: true,
      data: activities
    });
  });

  /**
   * Get user's favorite partners
   * GET /api/users/favorites
   */
  getUserFavorites = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
;

const favorites = await this.userService.getUserFavoritePartners(parseInt(req.user!.id), limit);

    res.json({
  success: true,
      data: favorites
    });
  });

  /**
   * Get user achievements
   * GET /api/users/achievements
   */
  getUserAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const achievements = await this.userService.getUserAchievements(parseInt(req.user!.id));

    res.json({
  success: true,
      data: achievements
    });
  });

  /**
   * Deactivate user account
   * DELETE /api/users/profile
   */
  deactivateAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await this.userService.deactivateUser(parseInt(req.user!.id));

    res.json({
  success: true,
      message: 'Account deactivated successfully'
    });
  });
}

// Export controller factory function;
export const asyncHandler: (pool: Pool) => {
  return new UserController(pool);
}
