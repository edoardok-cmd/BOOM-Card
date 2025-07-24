// 1. All import statements
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi'; // For validation schema definitions

// Assuming these modules exist in your project structure
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import * as discountService from '../services/discount.service';
import * as authMiddleware from '../middlewares/auth.middleware'; // Example: for authentication and authorization
import validate from '../middlewares/validate.middleware'; // Example: for request body/query validation

// 2. All TypeScript interfaces and types

/**
 * Enum for different types of discounts.
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

/**
 * Enum for defining where a discount is applicable.
 */
export enum DiscountApplicability {
  ALL = 'all',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
}

/**
 * Interface representing a discount object in the database.
 */
export interface IDiscount {
  id: string; // Unique identifier for the discount (e.g., UUID)
  code: string; // The discount code (e.g., "SAVE10", "FREESHIP")
  description?: string; // A brief description of the discount
  type: DiscountType; // Type of discount: 'percentage' or 'fixed'
  value: number; // The discount value (e.g., 10 for 10% or $10 fixed amount)
  minOrderAmount?: number; // Minimum order amount required to apply the discount
  maxUses?: number; // Maximum number of times this discount can be used in total
  currentUses: number; // Current number of times this discount has been used
  validFrom: Date; // Date from which the discount is valid
  validUntil: Date; // Date until which the discount is valid
  isActive: boolean; // Whether the discount is currently active
  isArchived: boolean; // For soft deletion: true if archived, false otherwise
  applicableTo?: DiscountApplicability; // Defines scope: 'all', 'specific_products', 'specific_categories'
  applicableProductIds?: string[]; // List of product IDs if applicableTo is 'specific_products'
  applicableCategoryIds?: string[]; // List of category IDs if applicableTo is 'specific_categories'
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
}

/**
 * Interface for the request body when creating a new discount.
 * Note: Dates can be passed as string and converted in service/validation.
 */
export interface CreateDiscountBody {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  validFrom: string; // ISO 8601 string or Date compatible string
  validUntil: string; // ISO 8601 string or Date compatible string
  isActive?: boolean;
  applicableTo?: DiscountApplicability;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}

/**
 * Interface for the request body when updating an existing discount.
 * All fields are optional for partial updates.
 */
export interface UpdateDiscountBody {
  code?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  minOrderAmount?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  isArchived?: boolean;
  applicableTo?: DiscountApplicability;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}

/**
 * Interface for query parameters when fetching a list of discounts.
 */
export interface GetDiscountsQuery {
  page?: number;
  limit?: number;
  sortBy?: string; // Field to sort by (e.g., 'createdAt', 'code')
  order?: 'asc' | 'desc'; // Sort order
  search?: string; // General search term for code or description
  type?: DiscountType;
  isActive?: boolean; // Filter by active status
  validFrom_gte?: string; // Greater than or equal to validFrom
  validFrom_lte?: string; // Less than or equal to validFrom
  validUntil_gte?: string; // Greater than or equal to validUntil
  validUntil_lte?: string; // Less than or equal to validUntil
  applicableTo?: DiscountApplicability;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}

// 3. All constants and configuration
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_ORDER = 'desc';

// 4. Any decorators or metadata
// Standard Express applications do not typically use decorators
// in the way frameworks like NestJS or Angular do. This section is
// intentionally left empty as per common Express conventions.

// Duplicate import removed: import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import discountService from '../services/discount.service'; // Assuming discount.service.ts exists and exports a default instance
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  ApplyDiscountInput,
  GetDiscountsQuery,
} from '../types/discount.types'; // Assuming these types are defined in Part 1
import { CustomRequest } from '../types/request.types'; // Assuming this type exists for user data in request

// Helper to wrap async route handlers to catch errors and pass them to the error middleware
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export class DiscountController {
  /**
   * Middleware to check if the user is authenticated.
   * Assumes an authentication middleware (e.g., JWT) has already populated req.user.
   * @param req CustomRequest (expected to have req.user from auth middleware)
   * @param res Response
   * @param next NextFunction
   */
  public static isAuthenticated = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.id) {
      next();
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required.' });
    }
  };

  /**
   * Middleware to check if the user has 'admin' role.
   * @param req CustomRequest
   * @param res Response
   * @param next NextFunction
   */
  public static isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied: Admin role required.' });
    }
  };

  /**
   * Middleware to check if the user has 'merchant' role.
   * @param req CustomRequest
   * @param res Response
   * @param next NextFunction
   */
  public static isMerchant = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'merchant') {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied: Merchant role required.' });
    }
  };

  /**
   * Middleware to check if the user has 'admin' OR 'merchant' role.
   * @param req CustomRequest
   * @param res Response
   * @param next NextFunction
   */
  public static isAdminOrMerchant = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'merchant')) {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied: Admin or Merchant role required.' });
    }
  };

  /**
   * @route POST /api/v1/discounts
   * @desc Create a new discount
   * @access Private (Admin or Merchant)
   */
  public static createDiscount = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // TODO: Add Joi/Zod validation middleware for req.body here or before this handler
    const discountData: CreateDiscountInput = req.body;
    const authUserId = req.user?.id;
    const authUserRole = req.user?.role;

    // Authorization check: Only Admin or Merchant can create discounts
    if (!authUserId || (authUserRole !== 'admin' && authUserRole !== 'merchant')) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to create discounts.' });
    }

    // If a merchant creates a discount, ensure it's implicitly linked to their ID
    // Admin can create discounts for any merchant by specifying merchantId, or platform-wide
    if (authUserRole === 'merchant') {
      discountData.merchantId = authUserId; // Force merchantId to be the authenticated merchant's ID
    }

    const newDiscount = await discountService.createDiscount(discountData);
    res.status(StatusCodes.CREATED).json({
      message: 'Discount created successfully',
      data: newDiscount,
    });
  });

  /**
   * @route GET /api/v1/discounts/:id
   * @desc Get a single discount by ID
   * @access Public (or private if discounts are sensitive)
   */
  public static getDiscountById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const discount = await discountService.getDiscountById(id);

    if (!discount) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Discount not found.' });
    }

    res.status(StatusCodes.OK).json({
      message: 'Discount fetched successfully',
      data: discount,
    });
  });

  /**
   * @route GET /api/v1/discounts
   * @desc Get all discounts with optional filtering and pagination
   * @access Public (can be restricted based on business logic)
   */
  public static getAllDiscounts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Add Joi/Zod validation middleware for req.query
    const query: GetDiscountsQuery = req.query;

    const { discounts, totalCount } = await discountService.getAllDiscounts(query);

    res.status(StatusCodes.OK).json({
      message: 'Discounts fetched successfully',
      data: discounts,
      meta: {
        totalCount,
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '10', 10),
      },
    });
  });

  /**
   * @route GET /api/v1/discounts/merchant/:merchantId
   * @desc Get discounts offered by a specific merchant
   * @access Public
   */
  public static getDiscountsByMerchant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { merchantId } = req.params;
    const query: GetDiscountsQuery = req.query; // For pagination/filtering of merchant-specific discounts

    const { discounts, totalCount } = await discountService.getDiscountsByMerchant(merchantId, query);

    res.status(StatusCodes.OK).json({
      message: `Discounts for merchant ${merchantId} fetched successfully`,
      data: discounts,
      meta: {
        totalCount,
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '10', 10),
      },
    });
  });

  /**
   * @route GET /api/v1/discounts/user/:userId
   * @desc Get applicable discounts for a specific user (e.g., based on their card tier, loyalty status)
   * @access Private (User itself or Admin)
   */
  public static getDiscountsForUser = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    // Authorization: A user can only view their own discounts, unless they are an admin.
    if (authUserId !== userId && authUserRole !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to view these discounts.' });
    }

    const query: GetDiscountsQuery = req.query; // For pagination/filtering within user's applicable discounts
    const { discounts, totalCount } = await discountService.getDiscountsForUser(userId, query);

    res.status(StatusCodes.OK).json({
      message: `Discounts for user ${userId} fetched successfully`,
      data: discounts,
      meta: {
        totalCount,
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '10', 10),
      },
    });
  });

  /**
   * @route PUT /api/v1/discounts/:id
   * @desc Update an existing discount
   * @access Private (Admin or the Merchant who owns the discount)
   */
  public static updateDiscount = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // TODO: Add Joi/Zod validation middleware for req.body
    const { id } = req.params;
    const updateData: UpdateDiscountInput = req.body;

    // Fetch the existing discount to check ownership/permissions
    const existingDiscount = await discountService.getDiscountById(id);

    if (!existingDiscount) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Discount not found.' });
    }

    // Authorization: Only Admin or the owning Merchant can update the discount
    if (authUserRole === 'merchant' && existingDiscount.merchantId !== authUserId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to update this discount.' });
    } else if (authUserRole !== 'admin' && authUserRole !== 'merchant') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to update discounts.' });
    }

    const updatedDiscount = await discountService.updateDiscount(id, updateData);

    res.status(StatusCodes.OK).json({
      message: 'Discount updated successfully',
      data: updatedDiscount,
    });
  });

  /**
   * @route DELETE /api/v1/discounts/:id
   * @desc Delete a discount
   * @access Private (Admin or the Merchant who owns the discount)
   */
  public static deleteDiscount = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Fetch the existing discount to check ownership/permissions

    if (!existingDiscount) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Discount not found.' });
    }

    // Authorization: Only Admin or the owning Merchant can delete the discount
    if (authUserRole === 'merchant' && existingDiscount.merchantId !== authUserId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to delete this discount.' });
    } else if (authUserRole !== 'admin' && authUserRole !== 'merchant') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to delete discounts.' });
    }

    await discountService.deleteDiscount(id);

    res.status(StatusCodes.NO_CONTENT).send(); // 204 No Content for successful deletion
  });

  /**
   * @route POST /api/v1/discounts/:id/apply
   * @desc Apply a discount to a specific context (e.g., a transaction, user interaction)
   * @access Private (Internal/Service or Authorized User/Merchant)
   * This endpoint would typically be part of a larger transaction or order processing flow.
   */
  public static applyDiscount = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // TODO: Add Joi/Zod validation middleware for req.body
    const { id: discountId } = req.params;
    const applyData: ApplyDiscountInput = req.body;

    if (!authUserId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required to apply discount.' });
    }

    // If a userId is provided in the request body, ensure it matches the authenticated user, or the authenticated user is an admin.
    if (applyData.userId && applyData.userId !== authUserId && authUserRole !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Unauthorized to apply discount for another user.' });
    }

    try {
      const result = await discountService.applyDiscount(discountId, { ...applyData, appliedBy: authUserId });

      res.status(StatusCodes.OK).json({
        message: 'Discount application validated successfully',
        data: result, // This might include the calculated discount amount, new total, etc.
      });
    } catch (error: any) {
      // Handle specific errors from the service layer, e.g., discount expired, not eligible, limit reached
      if (error.message.includes('not found')) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
      } else if (error.message.includes('not eligible') || error.message.includes('expired') || error.message.includes('limit reached')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
      next(error); // Pass other unexpected errors to the global error handler
    }
  });
}

/**
 * Helper function to send consistent error responses.
 * This ensures a standardized format for API error messages.
 * @param res The Express Response object.
 * @param statusCode The HTTP status code (e.g., 400, 404, 500).
 * @param message A user-friendly message describing the error.
 * @param error An optional underlying error object or message for internal logging/debugging.
 */
const sendErrorResponse = (res: Response, statusCode: number, message: string, error?: any): void => {
    // Log the error details for server-side debugging
    console.error(`[Discount Controller Error] Status: ${statusCode}, Message: ${message}, Details: ${error?.message || (typeof error === 'string' ? error : JSON.stringify(error))}`);

    // Send the structured error response to the client
    res.status(statusCode).json({
        message: message,
        error: error?.message || (typeof error === 'string' ? error : 'An unexpected server error occurred'),
    });
};

// --- Error Handling (Example Usage for context, actual implementation would be in PART 1 & 2 functions) ---
// Example of how the controller functions would utilize the helper for error handling:
// export const getDiscounts = async (req: Request, res: Response) => {
//     try {
//         // ... logic to get discounts ...
//         res.status(200).json(discounts);
//     } catch (error: any) {
//         sendErrorResponse(res, 500, 'Failed to retrieve discounts.', error);
//     }
// };
// Similar error handling would be applied to getDiscountById, createDiscount, updateDiscount, and deleteDiscount.

// --- Module Exports ---
// Assuming the core controller functions (getDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount)
// were defined as `const` in PART 1 and PART 2 of this file.
// This section collects and exports them as a single module.
export {
    sendErrorResponse, // Export the helper function if it might be useful elsewhere (e.g., in testing or other controllers)

    // Export the main controller functions. These names must match the `const` declarations
    // in PART 1 and PART 2 of the discount.controller.ts file.
    getDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
};
