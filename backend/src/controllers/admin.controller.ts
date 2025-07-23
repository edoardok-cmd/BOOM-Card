// 1. All import statements
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import HttpStatus from 'http-status';
import { AdminService } from '../services/admin.service';
import { UserRole } from '../constants/roles'; // Assuming UserRole enum/const is defined here

// 2. All TypeScript interfaces and types

/**
 * Extends the Express Request object to include properties
 * populated by authentication and authorization middleware.
 */
interface AuthenticatedAdminRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    // Add any other user properties expected from the auth middleware
  };
}

/**
 * Interface for the request body when an admin creates a new user.
 */
interface ICreateUserByAdminDto {
  username: string;
  email: string;
  password?: string; // Optional if system generates or uses external auth
  role: UserRole;
  isActive?: boolean;
}

/**
 * Interface for the request body when an admin updates an existing user.
 */
interface IUpdateUserByAdminDto {
  userId: string; // The ID of the user to be updated
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  // Add other fields an admin might update, e.g., password reset, etc.
}

/**
 * Interface for the request body when an admin manages product details.
 */
interface IManageProductDto {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

/**
 * Interface for the request body when an admin updates a transaction's status.
 */
interface IUpdateTransactionStatusDto {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'; // Example statuses
  notes?: string; // Optional notes for the status change
}

// 3. All constants and configuration

/**
 * Default number of items per page for pagination in admin listings.
 */
const DEFAULT_PAGE_LIMIT = 10;

/**
 * Default page number for pagination in admin listings.
 */
const DEFAULT_PAGE_NUMBER = 1;

// 4. Any decorators or metadata
// In a typical Express.js setup, decorators are not used directly on controller methods
// unless integrating with a framework like NestJS or a custom decorator library.
// The `asyncHandler` utility serves a similar purpose by wrapping async functions
// to handle promises and catch errors centrally.

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { User, IUser } from '../models/user.model';
import { Product, IProduct } from '../models/product.model';
import { Order, IOrder } from '../models/order.model';
import { CustomError } from '../utils/CustomError';
import mongoose from 'mongoose';

// Extending Request type to include user, as set by authentication middleware
interface AuthenticatedRequest extends Request {
  user?: IUser; // Assumes IUser is imported and correctly represents your user model
}

/**
 * AdminController handles all administrative operations in the BOOM Card backend.
 * All methods are wrapped with `asyncHandler` to catch and forward errors to the Express error middleware.
 */
class AdminController {

  // --- User Management ---

  /**
   * @desc Get all users
   * @route GET /api/v1/admin/users
   * @access Private/Admin
   */
  public static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    // Exclude sensitive information like password and Mongoose internal fields
    const users = await User.find().select('-password -__v');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  });

  /**
   * @desc Get single user details by ID
   * @route GET /api/v1/admin/users/:id
   * @access Private/Admin
   */
  public static getUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new CustomError('Invalid User ID format.', 400));
    }

    const user = await User.findById(req.params.id).select('-password -__v');

    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  });

  /**
   * @desc Update user role (e.g., 'user' to 'admin' or vice versa)
   * @route PUT /api/v1/admin/users/:id
   * @access Private/Admin
   */
  public static updateUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new CustomError('Invalid User ID format.', 400));
    }

    // Basic validation for role input
    if (!role || !['user', 'admin'].includes(role.toLowerCase())) {
      return next(new CustomError('Please provide a valid role (user or admin).', 400));
    }


    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    // Prevent an admin from demoting themselves to a non-admin role
    if (user._id.toString() === req.user?._id.toString() && role.toLowerCase() !== 'admin') {
      return next(new CustomError('An administrator cannot demote their own account.', 403));
    }

    user.role = role.toLowerCase();
    await user.save({ validateBeforeSave: false }); // Bypass schema validation if role is not directly in schema or has specific rules

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  /**
   * @desc Delete a user account
   * @route DELETE /api/v1/admin/users/:id
   * @access Private/Admin
   */
  public static deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new CustomError('Invalid User ID format.', 400));
    }

    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return next(new CustomError('User not found.', 404));
    }

    // Prevent an admin from deleting their own account
    if (userToDelete._id.toString() === req.user?._id.toString()) {
      return next(new CustomError('An administrator cannot delete their own account.', 403));
    }

    await userToDelete.deleteOne(); // Mongoose 6+ method to delete a document

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  });

  // --- Product Management ---

  /**
   * @desc Create a new product
   * @route POST /api/v1/admin/products/new
   * @access Private/Admin
   */
  public static createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // The user who created the product (admin's ID)
    req.body.user = req.user?._id;

    const { name, description, price, category, stock, images } = req.body;

    // Basic input validation
    if (!name || !description || !price || !category || stock === undefined) {
      return next(new CustomError('Please provide all required product details: name, description, price, category, and stock.', 400));
    }
    if (stock < 0) {
      return next(new CustomError('Product stock cannot be negative.', 400));
    }
    if (!Array.isArray(images) || images.length === 0 || !images[0].url) {
      return next(new CustomError('Product must have at least one image with a URL.', 400));
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  });

  /**
   * @desc Update an existing product
   * @route PUT /api/v1/admin/products/:id
   * @access Private/Admin
   */
  public static updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new CustomError('Invalid Product ID format.', 400));
    }

    let product = await Product.findById(productId);

    if (!product) {
      return next(new CustomError('Product not found.', 404));
    }

    // Update the product with new data
    product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
      useFindAndModify: false, // Recommended: use native findOneAndUpdate()
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  });

  /**
   * @desc Delete a product
   * @route DELETE /api/v1/admin/products/:id
   * @access Private/Admin
   */
  public static deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new CustomError('Invalid Product ID format.', 400));
    }


    if (!product) {
      return next(new CustomError('Product not found.', 404));
    }

    // In a real application, you might also delete associated images from cloud storage here
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  });

  /**
   * @desc Get all products (Admin view, potentially including inactive/drafts if applicable)
   * @route GET /api/v1/admin/products
   * @access Private/Admin
   */
  public static getAllProductsAdmin = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  });

  // --- Order Management ---

  /**
   * @desc Get all orders
   * @route GET /api/v1/admin/orders
   * @access Private/Admin
   */
  public static getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    // Populate user information for each order
    const orders = await Order.find().populate('user', 'name email');

    // Calculate total revenue from all orders
    let totalAmount = 0;
    orders.forEach(order => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      totalAmount,
      orders,
    });
  });

  /**
   * @desc Get single order details by ID
   * @route GET /api/v1/admin/orders/:id
   * @access Private/Admin
   */
  public static getSingleOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new CustomError('Invalid Order ID format.', 400));
    }

    // Populate user and product details for a comprehensive view
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price images');

    if (!order) {
      return next(new CustomError('Order not found.', 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  });

  /**
   * @desc Update Order Status (e.g., Processing -> Shipped -> Delivered)
   * @route PUT /api/v1/admin/orders/:id
   * @access Private/Admin
   */
  public static updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body; // Expected status: 'Processing', 'Shipped', 'Delivered'

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new CustomError('Invalid Order ID format.', 400));
    }


    if (!order) {
      return next(new CustomError('Order not found.', 404));
    }

    if (order.orderStatus === 'Delivered') {
      return next(new CustomError('This order has already been delivered.', 400));
    }

    // Helper function to update product stock
    const updateProductStock = async (productId: mongoose.Types.ObjectId, quantity: number) => {
      if (product) {
        if (product.stock - quantity < 0) {
          // This check should ideally happen during order creation or payment
          throw new CustomError(`Insufficient stock for product: ${product.name}`, 400);
        }
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false }); // Bypass validation if stock field has min/max rules
      } else {
        throw new CustomError(`Product with ID ${productId} not found during stock update.`, 404);
      };

    if (status === 'Shipped' && order.orderStatus === 'Processing') {
      // If transitioning from Processing to Shipped, decrement stock for each item
      for (const item of order.orderItems) {
        await updateProductStock(item.product as mongoose.Types.ObjectId, item.quantity);
      } else if (status === 'Delivered' && order.orderStatus !== 'Delivered') {
      // If transitioning to Delivered, set deliveredAt timestamp
      order.deliveredAt = new Date(Date.now());
    } else if (status !== 'Processing' && status !== 'Shipped' && status !== 'Delivered') {
      return next(new CustomError('Invalid status provided. Valid statuses are: Processing, Shipped, Delivered.', 400));
    } else if (order.orderStatus === 'Shipped' && status === 'Processing') {
      return next(new CustomError('Cannot revert a shipped order to processing.', 400));
    }

    order.orderStatus = status;
    await order.save({ validateBeforeSave: false }); // Often, status changes don't need full schema validation

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order,
    });
  });

  /**
   * @desc Delete an order
   * @route DELETE /api/v1/admin/orders/:id
   * @access Private/Admin
   */
  public static deleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new CustomError('Invalid Order ID format.', 400));
    }


    if (!order) {
      return next(new CustomError('Order not found.', 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.',
    });
  });

  // --- Dashboard/Statistics ---

  /**
   * @desc Get various dashboard statistics for administration overview.
   * @route GET /api/v1/admin/dashboard/stats
   * @access Private/Admin
   */
  public static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total revenue from delivered orders
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: 'Delivered'
        },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Products out of stock
    const productsOutOfStock = await Product.countDocuments({ stock: { $lte: 0 } });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
      },
      {
        $project: {
          _id: 0, // Exclude _id
          status: '$_id',
          count: 1
        }
    ]);

    // Example of recent orders (last 5)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        productsOutOfStock,
        ordersByStatus,
        recentOrders,
      },
    });
  });
}

export { AdminController };

import { Request, Response, NextFunction } from 'express';

/**
 * asyncHandler
 * A utility function to wrap asynchronous Express route handlers.
 * It catches any errors that occur during the execution of the async function
 * and passes them to the `next` middleware function, which is typically
 * an Express error handling middleware. This avoids repetitive try-catch blocks
 * in every async controller function.
 */
type AsyncControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncControllerFunction) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

// --- Error Handling Notes ---
// Error handling for individual controller actions is managed by wrapping the
// asynchronous logic within the `asyncHandler` utility. This ensures that
// any rejected promises or thrown errors are caught and forwarded to the
// Express error-handling middleware chain (via `next(error)`).
// The global error handling middleware (e.g., defined in `backend/src/middleware/errorMiddleware.ts`)
// will then process these errors and send appropriate responses to the client.

// --- Placeholder for functions from PART 1 and PART 2 ---
// These declarations are for TypeScript's benefit to allow the final `export` statement.
// In the complete file, the actual implementations of these functions would be above.
// Example: export const getAllUsers = asyncHandler(async (req, res, next) => { /* ... */ });
declare const getAllUsers: AsyncControllerFunction;
declare const getUserProfile: AsyncControllerFunction;
declare const updateUserProfile: AsyncControllerFunction;
declare const deleteUser: AsyncControllerFunction;

declare const getAllProducts: AsyncControllerFunction;
declare const createProduct: AsyncControllerFunction;
declare const updateProduct: AsyncControllerFunction;
declare const deleteProduct: AsyncControllerFunction;

declare const getAllOrders: AsyncControllerFunction;
declare const updateOrderStatus: AsyncControllerFunction;
declare const getDashboardStats: AsyncControllerFunction;
declare const sendNewsletter: AsyncControllerFunction;
declare const getRevenueReport: AsyncControllerFunction; // Added a common admin report
declare const getStockReport: AsyncControllerFunction; // Added a common admin report

// --- Export Statements ---
// All controller functions are exported as named exports.
// This allows them to be imported and used in the Express router setup (e.g., in `backend/src/routes/admin.routes.ts`).
export {
    // User Management
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    deleteUser,

    // Product Management
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Order Management
    getAllOrders,
    updateOrderStatus,

    // Analytics & Reporting
    getDashboardStats,
    getRevenueReport,
    getStockReport,

    // Other Admin Actions
    sendNewsletter,
};

// --- Module Exports (CommonJS Style) ---
// In modern TypeScript projects using ES Modules, `export { ... }` is preferred.
// `module.exports = { ... }` is typically used in CommonJS.
// As this is a TypeScript file, we stick to named exports for consistency.

}
}
}
}
}
}
