import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { CustomError } from '../utils/errors';
import logger from '../utils/logger';

import TransactionService from '../services/transaction.service';
import CardService from '../services/card.service';
import AccountService from '../services/account.service';
import UserService from '../services/user.service';

import { IsUUID, IsNumber, IsEnum, IsOptional, IsString, Min, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

import {
    TransactionType,
    TransactionStatus,
    PaymentMethod,
    TransactionCategory
} from '../types/transaction.types';
import { ITransaction, ITransactionQueryOptions } from '../types/transaction.interface';
import { ICard } from '../types/card.interface';
import { IAccount } from '../types/account.interface';
import { IUser } from '../types/user.interface';

import redisClient from '../config/redis';

class CreateTransactionDto {
    @IsNotEmpty({ message: 'Amount is required.' })
    @IsNumber({}, { message: 'Amount must be a number.' })
    @Min(0.01, { message: 'Amount must be greater than 0.' })
    amount!: number;

    @IsNotEmpty({ message: 'Currency is required.' })
    @IsString({ message: 'Currency must be a string.' })
    currency!: string;

    @IsNotEmpty({ message: 'Transaction type is required.' })
    @IsEnum(TransactionType, { message: 'Invalid transaction type.' })
    type!: TransactionType;

    @IsNotEmpty({ message: 'Card ID is required.' })
    @IsUUID('4', { message: 'Invalid card ID format.' })
    cardId!: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid target card ID format.' })
    targetCardId?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string.' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Merchant name must be a string.' })
    merchantName?: string;

    @IsOptional()
    @IsEnum(TransactionCategory, { message: 'Invalid transaction category.' })
    category?: TransactionCategory;

    @IsOptional()
    @IsEnum(PaymentMethod, { message: 'Invalid payment method.' })
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsString({ message: 'Reference ID must be a string.' })
    referenceId?: string;
}

class GetTransactionsQueryDto {
    @IsOptional()
    @IsEnum(TransactionType, { message: 'Invalid transaction type query.' })
    type?: TransactionType;

    @IsOptional()
    @IsEnum(TransactionStatus, { message: 'Invalid transaction status query.' })
    status?: TransactionStatus;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid start date format.' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid end date format.' })
    endDate?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number.' })
    @Min(1, { message: 'Limit must be at least 1.' })
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Offset must be a number.' })
    @Min(0, { message: 'Offset must be at least 0.' })
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid card ID format.' })
    cardId?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid account ID format.' })
    accountId?: string;
}

const TRANSACTION_LOCK_PREFIX = 'transaction_lock:';
const TRANSACTION_LOCK_EXPIRATION_MS = 5000; // 5 seconds
const DEFAULT_TRANSACTION_LIMIT = 20;
const DEFAULT_TRANSACTION_OFFSET = 0;

const TRANSACTION_FEES = {
    [TransactionType.TRANSFER]: 0.01, // 1%
    [TransactionType.WITHDRAWAL]: 0.005, // 0.5%
    [TransactionType.PAYMENT]: 0,
    [TransactionType.DEPOSIT]: 0,
    [TransactionType.REFUND]: 0,
    [TransactionType.FEE]: 0 // Fees are usually the amount itself
};

import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service'; // Assuming this exists from Part 1 dependencies
import { ApiError } from '../utils/ApiError'; // Assuming this utility exists
import { ApiResponse } from '../utils/ApiResponse'; // Assuming this utility exists
import { asyncHandler } from '../utils/asyncHandler'; // Assuming this utility exists

// Assuming `AuthRequest` type is defined in Part 1 or a shared types file:
// interface AuthRequest extends Request {
//     user?: { _id: string; email: string; /* other user properties */ };
// }

// Instantiate services here. In a larger application, you might use a dependency injection
// container or initialize services in your main app file and pass them.
// For this example, we'll instantiate directly.
const transactionService = new TransactionService();

/**
 * TransactionController class
 *
 * This class handles all HTTP requests related to financial transactions.
 * It acts as an orchestrator, performing basic request validation and then
 * delegating the core business logic to the `TransactionService`.
 */
class TransactionController {

    /**
     * Handles depositing funds into a user's BOOM Card.
     *
     * @param req The Express request object, expecting `cardId` and `amount` in body.
     * @param res The Express response object.
     * @returns A JSON response indicating success or failure.
     */
    public deposit = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { cardId, amount } = req.body;
        const userId = req.user?._id; // User ID extracted from authenticated request

        // Basic input validation
        if (!cardId) {
            throw new ApiError(400, "Card ID is required for deposit.");
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ApiError(400, "Valid positive amount is required for deposit.");
        }
        if (!userId) {
            // This should ideally be caught by an authentication middleware before reaching here.
            throw new ApiError(401, "User not authenticated.");
        }

        // Delegate the business logic to the transaction service
        const transaction = await transactionService.deposit(userId, cardId, amount);

        // Send a success response
        return res
            .status(201) // 201 Created for a new resource (transaction)
            .json(new ApiResponse(201, transaction, "Deposit successful."));
    });

    /**
     * Handles withdrawing funds from a user's BOOM Card.
     *
     * @param req The Express request object, expecting `cardId` and `amount` in body.
     * @param res The Express response object.
     * @returns A JSON response indicating success or failure.
     */
    public withdraw = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { cardId, amount } = req.body;

        // Basic input validation
        if (!cardId) {
            throw new ApiError(400, "Card ID is required for withdrawal.");
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ApiError(400, "Valid positive amount is required for withdrawal.");
        }
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        // Delegate the business logic to the transaction service

        // Send a success response
        return res
            .status(200) // 200 OK for successful operation
            .json(new ApiResponse(200, transaction, "Withdrawal successful."));
    });

    /**
     * Handles transferring funds between two BOOM Cards.
     *
     * @param req The Express request object, expecting `fromCardId`, `toCardId`, and `amount` in body.
     * @param res The Express response object.
     * @returns A JSON response indicating success or failure.
     */
    public transfer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { fromCardId, toCardId, amount } = req.body;

        // Basic input validation
        if (!fromCardId || !toCardId) {
            throw new ApiError(400, "Both 'from' and 'to' card IDs are required for transfer.");
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ApiError(400, "Valid positive amount is required for transfer.");
        }
        if (fromCardId === toCardId) {
            throw new ApiError(400, "Cannot transfer to the same card.");
        }
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        // Delegate the atomic transfer logic to the transaction service

        // Send a success response
        return res
            .status(200)
            .json(new ApiResponse(200, transaction, "Funds transferred successfully."));
    });

    /**
     * Retrieves a paginated list of transactions for the authenticated user.
     * Supports optional filtering by `type`, `startDate`, and `endDate` via query parameters.
     *
     * @param req The Express request object, expecting `page`, `limit`, `type`, `startDate`, `endDate` in query.
     * @param res The Express response object.
     * @returns A JSON response containing the list of transactions.
     */
    public getMyTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { page = 1, limit = 10, type, startDate, endDate } = req.query;

        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        // Delegate to service layer, ensuring query parameters are correctly typed
        const transactions = await transactionService.getTransactionsByUserId(
            userId,
            parseInt(page as string),
            parseInt(limit as string),
            type as string, // e.g., 'deposit', 'withdrawal', 'transfer'
            startDate as string,
            endDate as string
        );

        // Send a success response with the fetched transactions
        return res
            .status(200)
            .json(new ApiResponse(200, transactions, "Transactions fetched successfully."));
    });

    /**
     * Retrieves a single transaction by its ID.
     * Ensures the authenticated user is authorized to view this specific transaction.
     *
     * @param req The Express request object, expecting `transactionId` in parameters.
     * @param res The Express response object.
     * @returns A JSON response containing the transaction details.
     */
    public getTransactionById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { transactionId } = req.params;

        // Basic input validation
        if (!transactionId) {
            throw new ApiError(400, "Transaction ID is required.");
        }
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        // Delegate to service layer, which will also handle authorization check

        // If transaction is not found or user is not authorized, the service will return null/undefined,
        // or throw an error that asyncHandler will catch.
        if (!transaction) {
            throw new ApiError(404, "Transaction not found or you do not have permission to view it.");
        }

        // Send a success response with the transaction details
        return res
            .status(200)
            .json(new ApiResponse(200, transaction, "Transaction fetched successfully."));
    });

    // --- Middleware Functions (Example - if needed specifically for this controller) ---
    // Note: General middleware (like authentication, basic request body validation) are
    // typically handled in separate middleware files and applied in route definitions.
    // If a very specific piece of middleware logic tied to a transaction operation
    // was needed, it could be defined here or as a static method.
    // For instance, a middleware to log transaction attempts:
    /*
    public static logTransactionAttempt = (req: Request, res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] Transaction attempt by user: ${req.user?.email || 'N/A'}`);
        next();
    };
    */
}

// Export an instance of the controller to be used in route definitions
export const transactionController = new TransactionController();

// backend/src/controllers/transaction.controller.ts

import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service'; // Assuming this service exists
import { CreateTransactionDto } from '../dtos/transaction.dto'; // Assuming this DTO exists
import { AppError } from '../utils/appError'; // Assuming this custom error class exists for specific error handling
import { catchAsync } from '../utils/catchAsync'; // A utility to wrap async route handlers and catch errors

/**
 * PART 3: Helper Functions, Error Handlers, and Exports
 * This part completes the transaction controller file.
 */

// --- HELPER FUNCTIONS ---

/**
 * Validates common transaction request parameters.
 * Ensures amount is a positive number, cardId is present, and type is valid.
 * Throws an AppError if any validation fails.
 *
 * @param {number} amount - The transaction amount.
 * @param {string} cardId - The ID of the card involved in the transaction.
 * @param {string} type - The type of transaction (e.g., 'purchase', 'refund', 'deposit', 'withdrawal').
 * @returns {void}
 */
function validateTransactionInput(amount: number, cardId: string, type: string): void {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        throw new AppError('Transaction amount must be a positive number.', 400);
    }

    if (typeof cardId !== 'string' || cardId.trim().length === 0) {
        throw new AppError('Card ID is required.', 400);
    }

    // Define allowed transaction types for BOOM Card
    const validTypes = ['purchase', 'refund', 'deposit', 'withdrawal']; // Extend as needed
    if (typeof type !== 'string' || !validTypes.includes(type.toLowerCase())) {
        throw new AppError(`Invalid transaction type. Must be one of: ${validTypes.join(', ')}.`, 400);
    }

    // Further validations could include:
    // - Checking amount precision (e.g., max 2 decimal places)
    // - Maximum/minimum allowed transaction amounts
    // - Specific format validation for cardId (e.g., UUID format if applicable)
}

/**
 * Generates a unique idempotency key.
 * This key is used to ensure that a request is processed only once, even if it's sent multiple times.
 * In a production system, this should use a robust UUID generator or a hash of unique request parameters.
 *
 * @returns {string} A unique string to serve as an idempotency key.
 */
function generateIdempotencyKey(): string {
    // A simple, timestamp-based key for demonstration.
    // Consider using 'uuid' library (e.g., import { v4 as uuidv4 } from 'uuid'; return uuidv4();)
    // or a combination of request body properties + timestamp for stronger guarantees.
    return `ik-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
}

// --- CONTROLLER FUNCTIONS (Placeholder/Minimal implementations for completeness) ---
// These functions would typically contain the core logic defined in previous parts.

/**
 * Processes a new transaction (e.g., purchase, refund).
 * Expects transaction details in the request body and an optional idempotency key in headers.
 */
const processTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { amount, cardId, type, description } = req.body as CreateTransactionDto;
    const idempotencyKey = req.headers['x-idempotency-key'] as string || generateIdempotencyKey();

    // Validate incoming request data using our helper
    validateTransactionInput(amount, cardId, type);

    // Call the service layer to handle the business logic of processing the transaction

    res.status(201).json({
        status: 'success',
        message: 'Transaction processed successfully.',
        data: { transaction },
    });
});

/**
 * Retrieves the status and details of a specific transaction by its ID.
 */
const getTransactionStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const transactionId = req.params.id;

    if (!transactionId || transactionId.trim().length === 0) {
        return next(new AppError('Transaction ID is required.', 400));
    }

    // Call the service layer to fetch transaction details

    if (!transaction) {
        return next(new AppError('Transaction not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { transaction },
    });
});

/**
 * Retrieves a list of transactions associated with a specific user.
 * Assumes user ID is available from an authentication middleware (e.g., `req.user.id`).
 */
const getTransactionsByUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Ensure the user ID is extracted safely from the request object
    // Assuming `req.user` is populated by an authentication middleware

    if (!userId) {
        return next(new AppError('User not authenticated or user ID missing.', 401));
    }

    // Call the service layer to fetch transactions for the user

    res.status(200).json({
        status: 'success',
        results: transactions.length,
        data: { transactions },
    });
});

// --- EXPORT STATEMENTS ---

// Export all controller functions to be used by the router.
export {
    processTransaction,
    getTransactionStatus,
    getTransactionsByUser,
    // Add other transaction-related controller functions here if developed in previous parts (e.g., refundTransaction, cancelTransaction)
};
