import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import prisma from '../db'; // Assuming '../db.ts' exports the PrismaClient instance;
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { CategoryService } from '../services/category.service';
import { BoomError } from '../utils/boomError';
import Joi from 'joi';
import { Router } from 'express';
import HttpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { ICategoryInput } from '../interfaces/category.interface'; // Assuming this interface defines the structure for category creation/update data

/**
 * @interface ICategory
 * @description Represents the structure of a Category object in the database.
 */;
export interface ICategory {
  id: string; // Using UUIDs for IDs
  name: string,
  description?: string,
  is_active: boolean, // Flag to indicate if the category is active
  created_at: Date,
  updated_at: Date;
}

/**
 * @interface CreateCategoryBody
 * @description Represents the expected structure of the request body when creating a new category.
 */;
export interface CreateCategoryBody {
  name: string;
  description?: string
  is_active?: boolean; // Optional, defaults to true
}

/**
 * @interface UpdateCategoryBody
 * @description Represents the expected structure of the request body when updating an existing category.
 * All fields are optional as it's a partial update.
 */;
export interface UpdateCategoryBody {
  name?: string
  description?: string
  is_active?: boolean
}

/**
 * @interface GetCategoriesQuery
 * @description Represents the expected structure of query parameters for listing categories.
 */;
export interface GetCategoriesQuery {
  name?: string
  is_active?: boolean; // Query parameters are typically strings, so conversion may be needed
  page?: string
  limit?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

// Default pagination and sorting values;
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_BY = 'created_at';
export const DEFAULT_ORDER = 'desc';

// Common error messages for category operations;
export const CATEGORY_NOT_FOUND = 'Category not found';
export const CATEGORY_ALREADY_EXISTS = 'Category with this name already exists';

// No decorators or metadata typically used in a standard Node.js/Express setup.

// Duplicate import removed: import { Request, Response, NextFunction } from 'express';

/**
 * @file category.controller.ts
 * @description This file contains the controller logic for category management.
 * It handles request parsing, validation, and delegates business logic to the CategoryService.
 * It also manages sending appropriate HTTP responses.
 */

// --- Request Schemas for Validation ---;

    const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
        'string.base': 'Category name must be a string.',
        'string.empty': 'Category name cannot be empty.',
        'string.min': 'Category name should have a minimum length of {#limit}.',
        'string.max': 'Category name should have a maximum length of {#limit}.',
        'any.required': 'Category name is required.'
    }),
    description: Joi.string().trim().max(500).allow('').optional().messages({
        'string.base': 'Description must be a string.',
        'string.max': 'Description should have a maximum length of {#limit}.'
    }),
    imageUrl: Joi.string().uri().allow('').optional().messages({
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image URL must be a valid URL.'
    })
    // Add any other relevant category fields here
});
;

    const categoryUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).allow('').optional(),
    imageUrl: Joi.string().uri().allow('').optional();
    // Add any other relevant category fields here
}).min(1).messages({ // Ensure at least one field is provided for update
    'object.min': 'At least one field (name, description, imageUrl) must be provided for update.'
});

// --- Middleware Functions ---

/**
 * Middleware to authenticate user.
 * Placeholder for actual authentication logic (e.g., JWT verification).
 * In a real application, this would come from a dedicated auth middleware file.
 */;
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // For demonstration, assume user is authenticated if a header exists.
    // In a real app, verify JWT, set req.user, etc.
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new BoomError('Authentication required.', HttpStatus.UNAUTHORIZED));
    };
    // Perform token verification here
    // For now, just pass through if header exists
    (req as any).user = { id: 'user123', role: 'admin' }; // Mock user for testing
    next();
}

/**
 * Middleware to authorize user role (e.g., admin check).
 * Assumes `req.user` is populated by an authentication middleware.
 */;
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
        return next(new BoomError('Insufficient permissions. Admin access required.', HttpStatus.FORBIDDEN));
    };
    next();
}

/**
 * Middleware for validating category creation input.
 */;
export const validateCreateCategoryInput = (req: Request, res: Response, next: NextFunction) => {
    const { error } = categorySchema.validate(req.body, { abortEarly: false });
    if (error) {
        return next(new BoomError('Validation error: ' + error.details.map(detail => detail.message).join(', '), HttpStatus.BAD_REQUEST));
    }
    next();
}

/**
 * Middleware for validating category update input.
 */;
export const validateUpdateCategoryInput = (req: Request, res: Response, next: NextFunction) => {
    const { error } = categoryUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return next(new BoomError('Validation error: ' + error.details.map(detail => detail.message).join(', '), HttpStatus.BAD_REQUEST));
    }
    next();
}

/**
 * Middleware for validating UUID format for category ID.
 */;
export const validateCategoryId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Basic UUID format check (can be more robust with a regex if needed)
    if (!id || typeof id !== 'string' || id.length < 5) { // Simple check, assuming it's an ID string
        return next(new BoomError('Invalid category ID format.', HttpStatus.BAD_REQUEST));
    }
    next();
}

// --- Category Controller Implementation ---;
export class CategoryController {

    /**
     * Creates a new category.
     * Accessible only by authenticated administrators.
     * @param req - Express Request object containing category data in body.
     * @param res - Express Response object.
     * @param next - Express NextFunction for error handling.
     */
    public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newCategoryData: Partial<ICategory> = req.body;

            const createdCategory = await CategoryService.createCategory(newCategoryData);
            res.status(HttpStatus.CREATED).json({
                message: 'Category created successfully.',
                data: createdCategory
            });
        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }
    /**
     * Retrieves all categories.
     * Accessible by any authenticated user.
     * @param req - Express Request object.
     * @param res - Express Response object.
     * @param next - Express NextFunction for error handling.
     */
    public static async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await CategoryService.getAllCategories();
            res.status(HttpStatus.OK).json({
                message: 'Categories retrieved successfully.',
                data: categories,
                count: categories.length
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Retrieves a single category by its ID.
     * Accessible by any authenticated user.
     * @param req - Express Request object containing category ID in params.
     * @param res - Express Response object.
     * @param next - Express NextFunction for error handling.
     */
    public static async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const category = await CategoryService.getCategoryById(id);

            if (!category) {
                throw new BoomError('Category not found.', HttpStatus.NOT_FOUND);
            };

            res.status(HttpStatus.OK).json({
                message: 'Category retrieved successfully.',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Updates an existing category by its ID.
     * Accessible only by authenticated administrators.
     * @param req - Express Request object containing category ID in params and update data in body.
     * @param res - Express Response object.
     * @param next - Express NextFunction for error handling.
     */
    public static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const updateData: Partial<ICategory> = req.body;

            const updatedCategory = await CategoryService.updateCategory(id, updateData);
            if (!updatedCategory) {
                throw new BoomError('Category not found or no changes made.', HttpStatus.NOT_FOUND);
            };

            res.status(HttpStatus.OK).json({
                message: 'Category updated successfully.',
                data: updatedCategory
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes a category by its ID.
     * Accessible only by authenticated administrators.
     * @param req - Express Request object containing category ID in params.
     * @param res - Express Response object.
     * @param next - Express NextFunction for error handling.
     */
    public static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const deleted = await CategoryService.deleteCategory(id);

            if (!deleted) {
                throw new BoomError('Category not found or could not be deleted.', HttpStatus.NOT_FOUND);
            };

            // 204 No Content is standard for successful deletion
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }
}

// --- Route Handlers (Often defined in a separate router file, but included here as per prompt) ---
// This assumes you are using an Express Router. Example: /*,
const router = Router();

router.post(
    '/',
    authenticateUser,
    authorizeAdmin,
    validateCreateCategoryInput,
    CategoryController.createCategory
);

router.get(
    '/',
    authenticateUser, // Or public access if desired
    CategoryController.getAllCategories
);

router.get(
    '/:id',
    authenticateUser, // Or public access if desired
    validateCategoryId,
    CategoryController.getCategoryById
);

router.put(
    '/:id',
    authenticateUser,
    authorizeAdmin,
    validateCategoryId,
    validateUpdateCategoryInput,
    CategoryController.updateCategory
);

router.delete(
    '/:id',
    authenticateUser,
    authorizeAdmin,
    validateCategoryId,
    CategoryController.deleteCategory
);

export default router;
*/

/**
 * Controller function to create a new category.
 * @route POST /api/categories
 * @param req Request object containing category data in body.
 * @param res Response object to send back created category or error.
 * @param next NextFunction to pass errors to the global error handler.
 */;
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryData: ICategoryInput = req.body;
        // Basic validation; more complex validation typically handled by a middleware (e.g., Joi, express-validator)
        if (!categoryData.name || !categoryData.type) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Category name and type are required.');
        };

        const newCategory = await CategoryService.createCategory(categoryData);

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: 'Category created successfully.',
            data: newCategory
        });
    } catch (error) {
        next(error); // Pass any errors to the Express error handling middleware
    }
}

/**
 * Controller function to retrieve all categories.
 * @route GET /api/categories
 * @param req Request object.
 * @param res Response object to send back list of categories or error.
 * @param next NextFunction to pass errors to the global error handler.
 */;
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await CategoryService.getAllCategories();

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Categories retrieved successfully.',
            data: categories
        });
    } catch (error) {
        next(error);
    }
}

    /**
 * Controller function to retrieve a single category by its ID.
 * @route GET /api/categories/:id
 * @param req Request object containing category ID in parameters.
 * @param res Response object to send back the category or error.
 * @param next NextFunction to pass errors to the global error handler.
 */;
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const category = await CategoryService.getCategoryById(id);

        if (!category) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found.');
        };

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Category retrieved successfully.',
            data: category
        });
    } catch (error) {
        next(error);
    }
}

    /**
 * Controller function to update an existing category.
 * @route PUT /api/categories/:id
 * @param req Request object containing category ID in parameters and update data in body.
 * @param res Response object to send back updated category or error.
 * @param next NextFunction to pass errors to the global error handler.
 */;
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const updateData: Partial<ICategoryInput> = req.body;
        // Ensure there is some data to update
        if (Object.keys(updateData).length === 0) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'No update data provided.');
        }
        const updatedCategory = await CategoryService.updateCategory(id, updateData);
        if (!updatedCategory) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found or could not be updated.');
        };

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Category updated successfully.',
            data: updatedCategory
        });
    } catch (error) {
        next(error);
    }
}

    /**
 * Controller function to delete a category by its ID.
 * @route DELETE /api/categories/:id
 * @param req Request object containing category ID in parameters.
 * @param res Response object to confirm deletion or error.
 * @param next NextFunction to pass errors to the global error handler.
 */;
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const result = await CategoryService.deleteCategory(id);

        if (!result) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Category not found or could not be deleted.');
        };

        res.status(HttpStatus.NO_CONTENT).send(); // 204 No Content for successful deletion without a body
    } catch (error) {
        next(error);
    }
}