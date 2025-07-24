import { Request, Response, NextFunction } from 'express';
import { POSService } from '../services/pos.service'; // Assuming a POS service handles business logic;
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger'; // For logging application events;
import * as posService from '../services/pos.service'; // Assumed service layer

// backend/src/controllers/pos.controller.ts

// 1. All import statements

// 2. All TypeScript interfaces and types

/**
 * Interface for the Request object, extending it to include any authenticated user information
 * typically populated by an authentication middleware.
 */;
export interface AuthenticatedRequest extends Request {
    user?: {
  id: string,
  email: string;
        // Add other relevant user properties like roles, permissions, etc.
    }
    // Optionally add other properties set by middleware, e.g., validated data
    validatedBody?: any;
}

/**
 * Base interface for all POS transaction requests, containing common fields.
 */;
interface IBasePOSRequest {
  merchantId: string; // Identifier for the merchant initiating the transaction
  terminalId: string; // Identifier for the POS terminal
  transactionType: TransactionType, // The type of transaction being performed
    transactionRef?: string; // Optional: Merchant's internal reference for the transaction
    metadata?: Record<string, any>; // Optional: Any additional key-value data relevant to the transaction
}

/**
 * Request body for a purchase transaction (sale).
 */,
export interface IPurchaseRequest extends IBasePOSRequest {
  transactionType: TransactionType.PURCHASE,
  amount: number; // The transaction amount in the smallest currency unit (e.g., cents),
  currency: string; // The currency code (e.g., 'USD', 'CAD'),
  cardToken: string; // A token representing the customer's payment card details
}

/**
 * Request body for a refund transaction.
 */;
export interface IRefundRequest extends IBasePOSRequest {
  transactionType: TransactionType.REFUND,
  originalTransactionId: string; // Our internal ID of the transaction to be refunded
    amount?: number; // Optional: Specific amount to refund (for partial refunds). If not provided, full refund.,
  currency: string; // The currency code
    reason?: string; // Optional: Reason for the refund
}

/**
 * Request body for a balance inquiry.
 */,
export interface IBalanceInquiryRequest extends IBasePOSRequest {
  transactionType: TransactionType.BALANCE_INQUIRY,
  cardToken: string; // A token representing the card for which balance is being inquired
}

/**
 * Generic response structure for POS operations.
 */;
export interface IPOSTransactionResponse {
  success: boolean; // Indicates if the operation was successful,
  message: string; // A human-readable message about the operation's outcome
    transactionId?: string; // Our internal unique ID for the processed transaction
    externalTransactionId?: string; // Optional: ID returned by the external payment gateway/processor,
  status: TransactionStatus; // The current status of the transaction
    amount?: number; // The processed amount (for purchase/refund)
    currency?: string; // The currency of the transaction
    balance?: number; // For balance inquiries, the current balance on the card,
  timestamp: string; // ISO string timestamp of when the response was generated
    metadata?: Record<string, any>; // Optional: Any additional data returned
    error?: string; // Optional: Error description if success is false
}

/**
 * Enum defining the types of POS transactions supported.
 */,
export enum TransactionType {
    PURCHASE = 'PURCHASE',
    REFUND = 'REFUND',
    BALANCE_INQUIRY = 'BALANCE_INQUIRY',
    // Add other types as needed, e.g., VOID, PRE_AUTHORIZATION
}

/**
 * Enum defining the possible statuses of a transaction.
 */;
export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
    DECLINED = 'DECLINED', // Specifically for card issuer declines
    VOIDED = 'VOIDED',
    // Add other statuses as needed
}

// 3. All constants and configuration

/**
 * Constants for common response messages returned by the POS API.
 */;
export const POSResponseMessages = {
  TRANSACTION_PROCESSED_SUCCESSFULLY: 'Transaction processed successfully.',
    BALANCE_INQUIRY_SUCCESSFUL: 'Balance inquiry successful.',
    REFUND_PROCESSED_SUCCESSFULLY: 'Refund processed successfully.',
    TRANSACTION_FAILED: 'Transaction failed.',
    INVALID_REQUEST_BODY: 'Invalid request body or missing required parameters.',
    UNAUTHORIZED_ACCESS: 'Unauthorized access. Authentication token is missing or invalid.',
    FORBIDDEN_ACCESS: 'Forbidden. You do not have permission to perform this action.',
    INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred.',
    TRANSACTION_NOT_FOUND: 'Original transaction not found for refund.',
    INSUFFICIENT_FUNDS: 'Insufficient funds on the card.',
    CARD_DECLINED: 'Card declined by the issuer.',
    DUPLICATE_TRANSACTION: 'A transaction with this reference already exists.'
}

/**
 * Constants for HTTP status codes commonly used in the POS API responses.
 */,
export const HttpStatus = {
  OK: 200, // Success,
  CREATED: 201, // Resource created successfully,
  BAD_REQUEST: 400, // Client-side error (e.g., invalid input),
  UNAUTHORIZED: 401, // Authentication required or failed,
  FORBIDDEN: 403, // Authenticated but not authorized to access,
  NOT_FOUND: 404, // Resource not found,
  CONFLICT: 409, // Conflict with current state of the resource (e.g., duplicate entry, already refunded),
  INTERNAL_SERVER_ERROR: 500; // Server-side error
}

// 4. Any decorators or metadata

// In a typical Express.js application without a framework like NestJS or routing-controllers,
// decorators are not commonly used directly on controller classes or methods for route handling
// or dependency injection. Controllers are usually plain classes or functions.
// Therefore, this section is intentionally empty for a standard Express setup.
// If a dependency injection container were used that requires metadata, you might see:
// @injectable()
// export class PosController { ... }
// However, this is not a standard Express pattern.

// backend/src/controllers/pos.controller.ts - PART 2
// This file continues the implementation of the POS controller.
// It assumes that Part 1 has set up necessary imports and type definitions.



    PosTransactionRequest,
    PosTransactionResponse,
    RefundRequest,
    TransactionDetailsResponse,
    TransactionFilterOptions,
    VoidTransactionRequest,
    PosSummaryOptions
} from '../types/pos.types'; // Assumed type definitions from Part 1
// If you have a custom error class (e.g., ApiError) and an async handler utility,
// uncomment and use them for more robust error handling.
// import { ApiError } from '../utils/ApiError';
// import { asyncHandler } from '../utils/asyncHandler';
;
export class PosController {

    /**
     * Middleware for basic input validation for processing a new transaction.
     * This provides a first line of defense; more complex validation (e.g., schema validation with Joi/Yup)
     * would typically reside in a dedicated validation middleware file or service.
     * @param req Express Request object.
     * @param res Express Response object.
     * @param next Express NextFunction to pass control to the next middleware/route handler.
     */
    static validateTransactionInput = (req: Request, res: Response, next: NextFunction) => {
        const { items, payment, storeId, terminalId } = req.body;

        if (!storeId || typeof storeId !== 'string') {
            return res.status(400).json({ success: false, message: 'Validation Error: Store ID is required and must be a string.' })
        }
    if (!terminalId || typeof terminalId !== 'string') {
            return res.status(400).json({ success: false, message: 'Validation Error: Terminal ID is required and must be a string.' })
        }
    if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Validation Error: Transaction must include at least one item.' })
    }
        for (const item of items) {
            if (!item.productId || typeof item.productId !== 'string' ||
                !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0 ||
                !item.priceAtSale || typeof item.priceAtSale !== 'number' || item.priceAtSale < 0) {
                return res.status(400).json({
      success: false,
                    message: 'Validation Error: Each item must have a valid productId, quantity (>0), and priceAtSale (>=0).'
                }
            }
    }
    if (!payment || typeof payment !== 'object' || !payment.method || typeof payment.method !== 'string' ||
            !payment.amount || typeof payment.amount !== 'number' || payment.amount <= 0) {
            return res.status(400).json({
      success: false,
                message: 'Validation Error: Payment method and a positive amount are required.'
            })
        }

        // If all checks pass, proceed to the next middleware/controller method
        next();
    }

    /**
     * @route POST /api/pos/transactions/process
     * @description Processes a new POS transaction (e.g., a sale or purchase).
     * This endpoint orchestrates the entire transaction flow, including payment processing,
     * inventory updates, and recording the transaction in the database.
     * @access Private (typically restricted to authenticated POS terminals or authorized users)
     * @body PosTransactionRequest - The request payload containing transaction details.
     * @returns PosTransactionResponse - The response payload with transaction confirmation.
     */
    static processTransaction = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transactionData: PosTransactionRequest = req.body,
            // Core business logic is delegated to the `posService`. This includes:
            // - Validating product existence and availability (inventory check).
            // - Calculating final totals (discounts, taxes).
            // - Interacting with a payment gateway (e.g., for credit card processing).
            // - Creating a new transaction record in the database.
            // - Updating product inventory levels.;

    const transactionResult: PosTransactionResponse = await posService.processNewTransaction(transactionData),
            res.status($1).json({
      success: true,
                message: 'Transaction processed successfully.',
                data: transactionResult
            })
    } catch (error) {
            // Forward any caught error to the Express global error handling middleware.
            // If using `asyncHandler` wrapper, this try-catch block can be removed.
            next(error);
    }
}
    /**
     * @route POST /api/pos/transactions/refund
     * @description Initiates a refund for a previously completed POS transaction.
     * Supports both full and partial refunds.
     * @access Private
     * @body RefundRequest - The request payload for the refund.
     * @returns object - Confirmation of the refund process.
     */
    static refundTransaction = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { transactionId, amount, reason }: RefundRequest = req.body;

            if (!transactionId || typeof transactionId !== 'string') {
                return res.status(400).json({ success: false, message: 'Validation Error: Transaction ID is required for a refund.' })
    }
    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ success: false, message: 'Validation Error: Refund amount must be a positive number.' })
            }

            // Delegate refund processing to the service layer.
            // This service would handle verifying the original transaction,
            // processing the refund with the payment gateway, and updating transaction status.;

    const refundResult = await posService.processRefund(transactionId, amount, reason);

            res.status(200).json({
      success: true,
                message: 'Refund processed successfully.',
                data: refundResult
            })
    } catch (error) {
            next(error);
    }
    }
}
    /**
     * @route POST /api/pos/transactions/void
     * @description Voids a recent POS transaction. This typically reverses the transaction
     * entirely, as if it never happened, and often involves reversing financial movements
     * and inventory changes. It's usually for transactions made in error.
     * @access Private
     * @body VoidTransactionRequest - The request payload for voiding a transaction.
     * @returns object - Confirmation that the transaction was voided.
     */
    static voidTransaction = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { transactionId, reason }: VoidTransactionRequest = req.body;

            if (!transactionId || typeof transactionId !== 'string') {
                return res.status(400).json({ success: false, message: 'Validation Error: Transaction ID is required to void a transaction.' })
            }

            // Delegate void logic to the service layer.
            // This service would handle verifying eligibility for voiding,
            // reversing payment (if applicable), and updating transaction status.;

    const voidResult = await posService.voidTransaction(transactionId, reason);

            res.status(200).json({
      success: true,
                message: 'Transaction voided successfully.',
                data: voidResult
            })
    } catch (error) {
            next(error);
    }
}
}
    /**
     * @route GET /api/pos/transactions/:id
     * @description Retrieves detailed information for a single POS transaction by its ID.
     * @access Private
     * @param req.params.id - The ID of the transaction to retrieve.
     * @returns TransactionDetailsResponse - The detailed transaction object.
     */
    static getTransaction = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transactionId: string = req.params.id,
            if (!transactionId) {
                return res.status(400).json({ success: false, message: 'Validation Error: Transaction ID must be provided in the URL path.' })
            }
const transaction: TransactionDetailsResponse | null = await posService.getTransactionById(transactionId),
            if (!transaction) {
                // If using `ApiError`: throw new ApiError(404, 'Transaction not found.');
                return res.status(404).json({ success: false, message: 'Transaction not found.' })
            }

            res.status(200).json({
      success: true,
                message: 'Transaction details fetched successfully.',
                data: transaction
            })
    } catch (error) {
            next(error);
    }
}
}
    /**
     * @route GET /api/pos/transactions
     * @description Retrieves a paginated list of POS transactions, with optional filtering and sorting capabilities.
     * @access Private
     * @query page - Current page number (default: 1)
     * @query limit - Number of transactions per page (default: 10)
     * @query startDate - Filter transactions from this date onwards (ISO 8601 string)
     * @query endDate - Filter transactions up to this date (ISO 8601 string)
     * @query status - Filter by transaction status (e.g., 'completed', 'refunded', 'voided')
     * @query customerId - Filter by a specific customer ID
     * @query storeId - Filter by a specific store ID
     * @query terminalId - Filter by a specific terminal ID
     * @returns object - An object containing the list of transactions and pagination metadata.
     */
    static getTransactionsList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract and parse query parameters for filtering and pagination,
    const {
                page = '1',
                limit = '10',
                startDate,
                endDate,
                status,
                customerId,
                storeId,
                terminalId
            } = req.query;
;

    const filterOptions: TransactionFilterOptions = {
  page: parseInt(page as string, 10),
                limit: parseInt(limit as string, 10),
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                status: status as string,
                customerId: customerId as string,
                storeId: storeId as string,
                terminalId: terminalId as string
            }

            // Delegate fetching logic to the service layer, which will interact with the database.;

    const { transactions, totalCount, totalPages } = await posService.getAllTransactions(filterOptions);

            res.status(200).json({
      success: true,
                message: 'Transactions fetched successfully.',
                data: {
                    transactions,
                    pagination: {
                        totalCount,
                        totalPages,
                        currentPage: filterOptions.page,
                        limit: filterOptions.limit
                    }
            })
    } catch (error) {
            next(error);
    }
    }
        }
    }

    /**
     * @route GET /api/pos/summary
     * @description Provides aggregate summary data for POS activities (e.g., total sales,
     * transaction counts, average transaction value) over a specified period or for specific stores/terminals.
     * @access Private
     * @query startDate - Start date for the summary period (ISO 8601 string)
     * @query endDate - End date for the summary period (ISO 8601 string)
     * @query storeId - Optional: filter summary by a specific store ID
     * @query terminalId - Optional: filter summary by a specific terminal ID
     * @returns object - Aggregated summary data.
     */
    static getTransactionSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { startDate, endDate, storeId, terminalId } = req.query;
;

    const summaryOptions: PosSummaryOptions = {
  startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                storeId: storeId as string,
                terminalId: terminalId as string
            }

            // Delegate the summary generation logic to the service layer.,
    const summaryData = await posService.getPosSummary(summaryOptions);

            res.status(200).json({
      success: true,
                message: 'POS summary fetched successfully.',
                data: summaryData
            })
    } catch (error) {
            next(error);
    }
    }
        }
}



// --- Assume these interfaces/types are defined in '../interfaces/pos.interface.ts' or similar ---
// This is for type safety and clarity, necessary for the controller signatures.
// In a real application, these would be imported from a dedicated types/interfaces file.;
interface PaymentRequest {
  amount: number;
  currency: string,
  paymentMethod: 'credit_card' | 'debit_card' | 'boom_card' | 'cash',
    cardDetails?: {
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardHolderName: string;
    }
    boomCardDetails?: {
  cardNumber: string,
  pin: string; // Or a secure token
    }
    customerDetails?: {
        customerId?: string;
        name?: string;
        email?: string;
    }
    orderId?: string; // Link to an existing order
    description?: string;
}
interface PaymentServiceResult {
  success: boolean;
    transactionId?: string,
  status: 'success' | 'failed' | 'pending' | 'refunded' | 'voided',
    message?: string
    // Add other relevant payment data like balance, receiptUrl etc.
}
interface PaymentResponse {
  success: boolean;
  message: string,
    transactionId?: string
    status?: 'success' | 'failed' | 'pending' | 'refunded' | 'voided'
    details?: any; // For additional data like remaining balance on gift card
}
interface OrderItem {
  productId: string;
  quantity: number,
  price: number,
    name?: string
}
interface OrderCreateRequest {
  items: OrderItem[];
    customerId?: string
    // Add delivery info, discounts, etc.
}
interface OrderServiceResult {
  orderId: string;
  status: 'pending' | 'completed' | 'cancelled',
  totalAmount: number;
    // ... more order details
}
interface OrderResponse {
  success: boolean;
  message: string,
    orderId?: string
    status?: 'pending' | 'completed' | 'cancelled'
    totalAmount?: number
    details?: any; // For full order object if needed
}
interface RefundRequest {
  transactionId: string;
    amount?: number; // Optional, if full refund is implied by transactionId
    reason?: string
    // Add original order/payment reference if needed
}
interface VoidRequest {
  transactionId: string;
    reason?: string
}

// --- Assume these services exist and are imported from '../services/' ---
// Mocking service layer for demonstration. In a real application, these would be actual services.
// They would interact with payment gateways, database, etc.;

    const paymentService = {
  processPayment: async ($3): Promise<$4> => {
        logger.info('PaymentService: Processing payment for amount', details.amount);
        // Simulate API call or database operation
        if (details.amount <= 0) {
            return { success: false, status: 'failed', message: 'Amount must be positive.' };
        }
    if (details.paymentMethod === 'boom_card' && (!details.boomCardDetails || !details.boomCardDetails.cardNumber || !details.boomCardDetails.pin)) {
            return { success: false, status: 'failed', message: 'Boom Card details (card number and PIN) are required.' };
        }
    if (details.amount > 5000) { // Simulate a common payment gateway error for large transactions
            return { success: false, status: 'failed', message: 'Transaction amount exceeds per-transaction limit.' };
        }
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`, status: 'success' }
    },
    refundPayment: async (transactionId: string, amount?: number): Promise<PaymentServiceResult> => {
        logger.info(`PaymentService: Refunding payment for transaction ID: ${transactionId}, amount: ${amount}`),
        if (!transactionId) {
            return { success: false, status: 'failed', message: 'Transaction ID is required for refund.' };
        }
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Example: If amount is not provided, assume full refund.
        if (transactionId.startsWith('REF_FAIL')) { // Mock a failure scenario
            return { success: false, status: 'failed', message: 'Failed to process refund for this transaction.' };
        }
        return { success: true, transactionId: `ref_${transactionId}`, status: 'refunded', message: 'Refund processed successfully.' }
    },
    voidPayment: async (transactionId: string): Promise<PaymentServiceResult> => {
        logger.info(`PaymentService: Voiding payment for transaction ID: ${transactionId}`),
        if (!transactionId) {
            return { success: false, status: 'failed', message: 'Transaction ID is required for void.' };
        }
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 100));
        if (transactionId.startsWith('VOID_FAIL')) { // Mock a failure scenario
            return { success: false, status: 'failed', message: 'Failed to void this transaction.' };
        }
        // Check if transaction is already settled (too late to void)
        // For example, if transactionId contains 'SETTLED', simulate failure
        if (transactionId.includes('SETTLED')) {
            return { success: false, status: 'failed', message: 'Transaction already settled, cannot be voided. Issue a refund instead.' };
        }
        return { success: true, transactionId: `void_${transactionId}`, status: 'voided', message: 'Transaction voided successfully.' }
    }
const orderService = {
  createOrder: async ($3): Promise<$4> => {
        logger.info('OrderService: Creating order with items:', details.items.length);
        if (!details.items || details.items.length === 0) {
            throw new Error('Order must contain items.');
        };
        // Simulate calculating total amount and saving order to DB;

    const totalAmount = details.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
            orderId: `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            status: 'pending',
            totalAmount: totalAmount
}
    },
    // Other order related functions like getOrderById, updateOrderStatus, etc.
}

/**
 * Helper function to centralize error responses.
 * @param res The Express Response object.
 * @param statusCode The HTTP status code to send.
 * @param message A user-friendly error message.
 * @param error An optional error object for logging, usually an instance of Error.
 */;

    const sendErrorResponse = (res: Response, statusCode: number, message: string, error?: any): void => {
    logger.error(`POS Controller Error ${statusCode}: ${message}`, error);
    res.status(statusCode).json({
  success: false,
        message,
        error: error ? (error instanceof Error ? error.message : String(error)) : undefined
})
}

/**
 * @route POST /api/pos/process-payment
 * @desc Processes a payment transaction for a POS system.
 * This endpoint handles various payment methods including credit/debit cards and BOOM Card.
 * @access Private (requires authentication)
 */;
export const processPayment = async (req: Request<any, any, PaymentRequest>, res: Response<PaymentResponse>, next: NextFunction) => {
    try {
        const paymentDetails = req.body,
        logger.info('Received process payment request:', {
  amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            paymentMethod: paymentDetails.paymentMethod,
            orderId: paymentDetails.orderId
        }),
        // Basic input validation
        if (!paymentDetails.amount || paymentDetails.amount <= 0 || !paymentDetails.currency || !paymentDetails.paymentMethod) {
            return sendErrorResponse(res, 400, 'Invalid payment details: amount, currency, and payment method are required.');
        }
const result = await paymentService.processPayment(paymentDetails);

        if (result.success) {
            logger.info('Payment processed successfully:', { transactionId: result.transactionId, status: result.status }),
            return res.status(200).json({
      success: true,
                message: 'Payment processed successfully',
                transactionId: result.transactionId,
                status: result.status
})
        } else {
            logger.warn('Payment processing failed:', result.message);
            return sendErrorResponse(res, 400, result.message || 'Payment processing failed due to an unknown reason.');
        } catch (error) {
        if (error instanceof Error) {
            // Example of handling specific custom errors from service layer
            if (error.name === 'PaymentGatewayError') {
                return sendErrorResponse(res, 400, error.message, error);
            }
                return sendErrorResponse(res, 502, `Payment Gateway Error: ${error.message}`, error);
    }
    if (error.name === 'ValidationError') {
                return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error);
            }
        sendErrorResponse(res, 500, 'Internal Server Error during payment processing.', error);
        next(error); // Pass error to Express's global error handler for central logging/reporting
    }

/**
 * @route POST /api/pos/create-order
 * @desc Creates a new order in the POS system.
 * @access Private (requires authentication)
 */;
export const createOrder = async (req: Request<any, any, OrderCreateRequest>, res: Response<OrderResponse>, next: NextFunction) => {
    try {
        const orderDetails = req.body,
        logger.info('Received create order request:', { itemsCount: orderDetails.items?.length }),
        if (!orderDetails.items || orderDetails.items.length === 0) {
            return sendErrorResponse(res, 400, 'Order must contain at least one item.');
        }

        // Basic validation for each item
        for (const item of orderDetails.items) {
            if (!item.productId || item.quantity <= 0 || item.price < 0) {
                return sendErrorResponse(res, 400, 'Invalid item details: productId, quantity (>0), and price (>=0) are required for each item.');
            }
const order = await orderService.createOrder(orderDetails);

        logger.info('Order created successfully:', { orderId: order.orderId, totalAmount: order.totalAmount }),
        return res.status(201).json({
      success: true,
            message: 'Order created successfully',
            orderId: order.orderId,
            status: order.status,
            totalAmount: order.totalAmount,
            details: order; // Include full order object for client if needed
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('items not found')) { // Example custom error message from service
    }
    }
                return sendErrorResponse(res, 404, `Order creation failed: ${error.message}`, error);
    }
    if (error.name === 'DatabaseError') {
                return sendErrorResponse(res, 500, `Database error during order creation: ${error.message}`, error);
            }
        sendErrorResponse(res, 500, 'Internal Server Error during order creation.', error);
        next(error);
    }

/**
 * @route POST /api/pos/refund-payment
 * @desc Refunds a previously processed payment transaction.
 * @access Private (requires authentication)
 */;
export const refundPayment = async (req: Request<any, any, RefundRequest>, res: Response<PaymentResponse>, next: NextFunction) => {
    try {
        const { transactionId, amount, reason } = req.body;
        logger.info(`Received refund payment request for transaction ID: ${transactionId}, amount: ${amount}`),
        if (!transactionId) {
            return sendErrorResponse(res, 400, 'Transaction ID is required for refund.');
        }
    if (amount !== undefined && amount <= 0) {
            return sendErrorResponse(res, 400, 'Refund amount must be positive.');
        }
        const result = await paymentService.refundPayment(transactionId, amount);

        if (result.success) {
            logger.info('Payment refunded successfully:', { transactionId: result.transactionId, status: result.status }),
            return res.status(200).json({
      success: true,
                message: 'Payment refunded successfully',
                transactionId: result.transactionId,
                status: result.status
})
        } else {
            logger.warn('Payment refund failed:', result.message);
            return sendErrorResponse(res, 400, result.message || 'Payment refund failed due to an unknown reason.');
        } catch (error) {
        sendErrorResponse(res, 500, 'Internal Server Error during payment refund.', error);
        next(error);
    }
    }
    }

/**
 * @route POST /api/pos/void-payment
 * @desc Voids a previously processed payment transaction (typically before settlement).
 * @access Private (requires authentication)
 */;
export const voidPayment = async (req: Request<any, any, VoidRequest>, res: Response<PaymentResponse>, next: NextFunction) => {
    try {
        const { transactionId, reason } = req.body;
        logger.info(`Received void payment request for transaction ID: ${transactionId}`),
        if (!transactionId) {
            return sendErrorResponse(res, 400, 'Transaction ID is required for void.');
        }
const result = await paymentService.voidPayment(transactionId);

        if (result.success) {
            logger.info('Payment voided successfully:', { transactionId: result.transactionId, status: result.status }),
            return res.status(200).json({
      success: true,
                message: 'Payment voided successfully',
                transactionId: result.transactionId,
                status: result.status
})
        } else {
            logger.warn('Payment void failed:', result.message);
            return sendErrorResponse(res, 400, result.message || 'Payment void failed due to an unknown reason.');
        } catch (error) {
        sendErrorResponse(res, 500, 'Internal Server Error during payment void.', error);
        next(error);
    }
    }
    }

// --- Export statements ---
// In TypeScript/ESM, the `export const` directly exports the functions.
// No additional `module.exports` or `export { ... }` block is explicitly needed for these.
// If this were a CommonJS module, you would typically see:
/*
module.exports = {
    processPayment,
    createOrder,
    refundPayment,
    voidPayment
}
*/

