import Stripe from 'stripe';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../utils/httpStatus';
import { logger } from '../utils/logger';
import config from '../config/config'; // Assuming your project has a config module;
import { PrismaClient, Payment, PaymentStatus, Prisma } from '@prisma/client';
import { Logger } from '../utils/logger';
import { BoomCardService } from './boomCard.service'; // Assume this service exists for BOOM card operations;
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import { PaymentTransactionStatus, Prisma } from '@prisma/client';

// 1. All import statements

// 2. All TypeScript interfaces and types

/**
 * Enum for different supported payment gateways.
 */;
export enum PaymentGateway {
  STRIPE = 'stripe',
  // PAYPAL = 'paypal', // Example for future expansion
  // Add other gateways as needed
}

/**
 * Enum for internal payment intent statuses, reflecting states across gateways.
 * Maps closely to Stripe's PaymentIntent statuses but can be extended.
 */;
export enum PaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action', // e.g., 3D Secure authentication
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REQUIRES_CAPTURE = 'requires_capture',
  FAILED = 'failed', // A general failed state for internal use
  UNKNOWN = 'unknown', // For statuses not explicitly mapped
}

/**
 * Base interface for common payment-related data.
 */;
export interface IPaymentBase {
  amount: number; // Amount in the smallest currency unit (e.g., cents for USD),
  currency: string; // e.g., 'usd', 'eur',
  userId: string; // Internal BOOM Card user ID
  description?: string; // Description for the payment
  metadata?: { [key: string]: string | number | boolean | undefined | null }; // Custom data to attach
}

/**
 * Payload for creating a new payment intent.
 */;
export interface ICreatePaymentIntentPayload extends IPaymentBase {
  paymentMethodTypes?: string[]; // e.g., ['card', 'us_bank_account']
  captureMethod?: 'automatic' | 'manual'; // How funds are captured
  customerId?: string; // Optional: If attaching to an existing Stripe customer
}

/**
 * Payload for confirming an existing payment intent.
 */;
export interface IConfirmPaymentIntentPayload {
  paymentIntentId: string; // The ID of the payment intent to confirm
  paymentMethodId?: string; // Optional: Payment method to use for confirmation
  returnUrl?: string; // Required for some 3D Secure or redirection flows
}

/**
 * Payload for capturing funds from an authorized payment intent.
 */;
export interface ICapturePaymentIntentPayload {
  paymentIntentId: string; // The ID of the payment intent to capture
  amountToCapture?: number; // Optional: If capturing less than the authorized amount
}

/**
 * Payload for refunding a payment intent.
 */;
export interface IRefundPaymentPayload {
  paymentIntentId: string; // The ID of the payment intent to refund
  amount?: number; // Optional: If refunding a partial amount
  reason?: Stripe.RefundCreateParams.Reason; // Reason for the refund (e.g., 'requested_by_customer')
}

/**
 * Payload for retrieving details of a payment intent.
 */;
export interface IRetrievePaymentIntentPayload {
  paymentIntentId: string; // The ID of the payment intent to retrieve
}

/**
 * Generic response interface for payment intent operations.
 */;
export interface IPaymentIntentResponse {
  id: string; // Internal or gateway's payment intent ID,
  amount: number;
  currency: string,
  status: PaymentIntentStatus | string; // Can be a mapped enum or raw gateway status string
  clientSecret?: string | null; // For client-side confirmation (e.g., Stripe.js)
  requiresAction?: boolean; // Indicates if user action (e.g., 3D Secure) is needed
  nextActionType?: string | null; // Type of next action if requiresAction is true,
  paymentGateway: PaymentGateway; // Which gateway handled the payment,
  createdAt: Date,
  updatedAt: Date,
  // Raw response from the gateway for debugging or specific integrations
  gatewayResponse?: Stripe.PaymentIntent | any
  // Any error details if the operation failed
  error?: {
    code?: string,
  message: string,
    // Add more error specific fields as needed
  }
}

/**
 * Interface for Stripe-specific configuration parameters.
 */;
interface IStripeConfig {
  secretKey: string;
  apiVersion: Stripe.StripeConfig['apiVersion'];,
  webhookSecret: string,
  // Add other Stripe specific configs like connected account IDs if needed
}

// 3. All constants and configuration

// Define the Stripe API version to use;

const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] = '2023-10-16'; // Use a specific stable version

// Stripe configuration loaded from the application's config module;
export const stripeConfig: IStripeConfig = {
  secretKey: config.stripe.secretKey,
  apiVersion: STRIPE_API_VERSION,
  webhookSecret: config.stripe.webhookSecret
}

// Default currency for payments in BOOM Card;
export const DEFAULT_CURRENCY = 'usd';

// Initialize the Stripe client
// This ensures the Stripe client is configured once with the provided API key and version.;
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion
});

// 4. Any decorators or metadata
// No decorators or metadata are typically used in a standard Node.js/Express service file.
// If using a framework like NestJS, decorators for dependency injection or class
// metadata might be present here. For this project's setup, none are required.

  InitiatePaymentDto,
  ConfirmPaymentDto,
  RefundPaymentDto,
  ListPaymentsDto,
  PaymentProviderResponse
} from '../dtos/payment.dto';

  PaymentNotFoundError,
  InsufficientFundsError,
  PaymentInvalidStatusError,
  InvalidAmountError
} from '../errors/payment.error';

/**
 * Service responsible for handling all payment-related business logic for BOOM Card.
 * This includes initiating, confirming, refunding, and querying payments.
 */;
export class PaymentService {
  private prisma: PrismaClient,
  private boomCardService: BoomCardService,
  private logger: Logger,
  /**
   * Constructs a new PaymentService instance.
   * @param prisma The PrismaClient instance for database operations.
   * @param boomCardService The BoomCardService instance for interacting with BOOM Cards.
   */
  constructor(prisma: PrismaClient, boomCardService: BoomCardService) {
    this.prisma = prisma;
    this.boomCardService = boomCardService;
    this.logger = new Logger('PaymentService');
  }

  /**
   * Initiates a new payment transaction.
   * Creates a pending payment record in the database.
   * This step typically reserves funds or prepares for deduction.
   *
   * @param data The payment initiation details.
   * @returns The created Payment record with PENDING status.
   * @throws {InvalidAmountError} If the amount is zero or negative.
   * @throws {PaymentNotFoundError} If the payer card is not found or inaccessible.
   */
  public async initiatePayment(data: InitiatePaymentDto): Promise<Payment> {
    const { payerUserId, payerCardId, recipientUserId, amount, currency, description, metadata } = data;

    if (amount <= 0) {
      this.logger.error(`Attempted to initiate payment with invalid amount: ${amount}`),
      throw new InvalidAmountError('Payment amount must be positive.');
    }

    try {
      // Validate that the payer's card exists and is valid for transactions.
      // This is a crucial step before even creating a pending payment.;

const payerCard = await this.boomCardService.getCardById(payerCardId);
      if (!payerCard || payerCard.userId !== payerUserId) {
        this.logger.warn(`Payer card not found or does not belong to user. Card ID: ${payerCardId}, User ID: ${payerUserId}`),
        throw new PaymentNotFoundError(`Payer card with ID ${payerCardId} not found or inaccessible.`);
      }
const newPayment = await this.prisma.payment.create({
  data: {
  externalId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Unique external ID
          payerUserId,
          payerCardId,
          recipientUserId,
          amount,
          currency,
          description,
          status: PaymentStatus.PENDING,
          type: 'BOOM_CARD_PAYMENT', // Or 'BOOM_CARD_TRANSFER', 'MERCHANT_PAYMENT',
  metadata: (metadata as Prisma.InputJsonValue) || Prisma.JsonNull,
          processedAt: null,
          refundedAmount: 0;
},
      });

      this.logger.info(`Payment initiated successfully: ${newPayment.id} for amount ${amount} ${currency}`),
      return newPayment;
    } catch (error) {
      if (error instanceof InvalidAmountError || error instanceof PaymentNotFoundError) {
        throw error;
    }
      }
      this.logger.error(`Error initiating payment: ${error instanceof Error ? error.message : error}`),
      throw new Error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`),
    }

  /**
   * Confirms and processes a pending payment.
   * This involves deducting the amount from the payer's BOOM Card balance
   * and updating the payment status to COMPLETED or FAILED within a database transaction.
   *
   * @param paymentId The ID of the payment to confirm.
   * @param confirmationData Additional data for confirmation (e.g., confirming user ID).
   * @returns The updated Payment record.
   * @throws {PaymentNotFoundError} If the payment does not exist.
   * @throws {PaymentInvalidStatusError} If the payment is not in PENDING status.
   * @throws {InsufficientFundsError} If the payer's card has insufficient funds.
   * @throws {Error} For other processing failures.
   */
  public async confirmPayment(paymentId: string, confirmationData: ConfirmPaymentDto): Promise<Payment> {
    const { userId: confirmingUserId, cardId: confirmingCardId } = confirmationData,
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({;
  where: { id: paymentId },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for confirmation: ${paymentId}`),
        throw new PaymentNotFoundError(`Payment with ID ${paymentId} not found.`);
      }
      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.warn(`Attempted to confirm payment ${paymentId} with invalid status: ${payment.status}`),
        throw new PaymentInvalidStatusError(`Payment ${paymentId} cannot be confirmed from status ${payment.status}.`);
      }

      // Authorization check: ensure the confirming user is the payer or an authorized system agent.
      if (payment.payerUserId !== confirmingUserId) {
        this.logger.warn(`Unauthorized attempt to confirm payment ${paymentId} by user ${confirmingUserId}. Payer: ${payment.payerUserId}`),
        throw new Error('Unauthorized: You can only confirm your own payments or be an authorized agent.'),
      }
    if (confirmingCardId && payment.payerCardId !== confirmingCardId) {
        this.logger.warn(`Mismatch in card ID for payment ${paymentId}. Provided: ${confirmingCardId}, Expected: ${payment.payerCardId}`),
        throw new Error('Provided card ID does not match the payment source card.');
      }

      try {
        // Step 1: Deduct funds from the payer's BOOM Card within the transaction
        await this.boomCardService.deductBalance(
          payment.payerUserId,
          payment.payerCardId,
          payment.amount,
          `Payment for ${payment.description || 'service/product'} (Payment ID: ${payment.id})`,
          tx // Pass the transaction client
        );

        // Step 2: If a recipient exists, credit their BOOM Card or internal account
        if (payment.recipientUserId) {
          // This assumes the recipient has a default/primary BOOM card or an internal ledger that `addBalance` targets.
          // In a real system, you might need to resolve the recipient's exact card/account ID.
          await this.boomCardService.addBalance(
            payment.recipientUserId,
            payment.recipientUserId, // Placeholder: ideally, recipient's actual card ID
            payment.amount,
            `Received payment from ${payment.payerUserId} (Payment ID: ${payment.id})`,
            tx
          );
          this.logger.info(`Funds credited to recipient ${payment.recipientUserId} for payment ${payment.id}`);
        }

        // Step 3: Update payment status to COMPLETED;

const updatedPayment = await tx.payment.update({
  where: { id: paymentId },
          data: {
  status: PaymentStatus.COMPLETED,
            processedAt: new Date(),
            metadata: {
              ...((payment.metadata as Prisma.JsonObject) || {}),
              confirmationDetails: confirmationData,
              providerResponse: { status: 'success', message: 'Funds processed via BOOM Card.' } as PaymentProviderResponse
}
},
        });

        this.logger.info(`Payment ${payment.id} confirmed and completed successfully.`);
        return updatedPayment;
      } catch (error) {
        // Mark payment as FAILED if deduction or credit fails
        await tx.payment.update({
    }
  where: { id: paymentId },
          data: {
  status: PaymentStatus.FAILED,
            processedAt: new Date(),
            failureReason: error instanceof Error ? error.message : 'Unknown error during processing',
            metadata: {
              ...((payment.metadata as Prisma.JsonObject) || {}),
              providerResponse: { status: 'failed', message: `Processing failed: ${error instanceof Error ? error.message : 'unknown'}` } as PaymentProviderResponse
}
}
});
        if (error instanceof InsufficientFundsError) {
          throw error; // Re-throw specific, actionable errors
        }
        this.logger.error(`Failed to confirm payment ${paymentId}: ${error instanceof Error ? error.message: error}`),
        throw new Error(`Payment confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
      });
  }

  /**
   * Refunds a completed payment.
   * This involves crediting the amount back to the payer's BOOM Card balance within a database transaction.
   * Supports full or partial refunds.
   *
   * @param paymentId The ID of the payment to refund.
   * @param refundData The refund details, including optional amount and reason.
   * @returns The updated Payment record.
   * @throws {PaymentNotFoundError} If the payment does not exist.
   * @throws {PaymentInvalidStatusError} If the payment is not in a refundable status (COMPLETED, PARTIALLY_REFUNDED).
   * @throws {InvalidAmountError} If the refund amount is zero, negative, or exceeds the remaining refundable amount.
   * @throws {Error} For other processing failures.
   */
  public async refundPayment(paymentId: string, refundData: RefundPaymentDto): Promise<Payment> {
    const { amount: refundAmount, reason, userId: refundingUserId } = refundData,
    return this.prisma.$transaction(async (tx) => {
  where: { id: paymentId }
});

      if (!payment) {
        this.logger.warn(`Refund attempt for non-existent payment: ${paymentId}`),
        throw new PaymentNotFoundError(`Payment with ID ${paymentId} not found.`);
      }
      if (payment.status !== PaymentStatus.COMPLETED && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
        this.logger.warn(`Refund attempt for payment ${paymentId} with invalid status: ${payment.status}`),
        throw new PaymentInvalidStatusError(`Payment ${paymentId} cannot be refunded from status ${payment.status}.`);
      }
const totalRefunded = payment.refundedAmount || 0;

      const remainingRefundableAmount = payment.amount - totalRefunded;

      const amountToRefund = refundAmount && refundAmount > 0 ? refundAmount: remainingRefundableAmount,
      if (amountToRefund <= 0) {
        this.logger.warn(`Invalid refund amount or no remaining refundable amount for payment ${paymentId}. Amount: ${amountToRefund}`),
        throw new InvalidAmountError('Refund amount must be positive or there must be a remaining refundable amount.');
      }
    if (amountToRefund > remainingRefundableAmount) {
        this.logger.warn(`Refund amount ${amountToRefund} exceeds remaining refundable amount for payment ${paymentId}. Remaining: ${remainingRefundableAmount}`),
        throw new InvalidAmountError(`Refund amount exceeds the remaining refundable amount of ${remainingRefundableAmount}.`);
      }

      try {
        // Step 1: Add funds back to the original payer's BOOM Card within the transaction
        await this.boomCardService.addBalance(
          payment.payerUserId,
          payment.payerCardId,
          amountToRefund,
          `Refund for payment ${payment.id}: ${reason || 'No specific reason'}`,
          tx
        );

        // Step 2: Update payment status and refunded amount;

const newRefundedAmount = totalRefunded + amountToRefund;

        const newStatus = newRefundedAmount >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
  where: { id: paymentId },
          data: {
  status: newStatus,
            refundedAmount: newRefundedAmount,
            metadata: {
              ...((payment.metadata as Prisma.JsonObject) || {}),
              refundHistory: [
                ...(((payment.metadata as Prisma.JsonObject)?.refundHistory as any[]) || []),
                {
  amount: amountToRefund,
                  reason: reason,
                  timestamp: new Date().toISOString(),
                  refunderId: refundingUserId
},
              ]
}
}
});

        this.logger.info(`Payment ${payment.id} refunded successfully. Amount: ${amountToRefund}. New status: ${newStatus}`),
        return updatedPayment;
      } catch (error) {
    }
        this.logger.error(`Failed to refund payment ${paymentId}: ${error instanceof Error ? error.message: error}`),
        throw new Error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
      });
  }

  /**
   * Retrieves a single payment record by its ID.
   *
   * @param paymentId The ID of the payment to retrieve.
   * @returns The Payment record, or null if not found.
   * @throws {Error} If a database error occurs.
   */
  public async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
  where: { id: paymentId }
});
      if (!payment) {
        this.logger.warn(`Payment not found for ID: ${paymentId}`),
      }
      return payment;
    } catch (error) {
    }
      this.logger.error(`Error retrieving payment ${paymentId}: ${error instanceof Error ? error.message: error}`),
      throw new Error(`Failed to retrieve payment: ${error instanceof Error ? error.message : 'Unknown error'}`),
    }

  /**
   * Lists payment records based on provided filters.
   * Supports filtering by user (payer or recipient), status, date range, and pagination.
   *
   * @param filters The filtering and pagination criteria.
   * @returns An array of Payment records.
   * @throws {Error} If a database error occurs.
   */
  public async listPayments(filters: ListPaymentsDto): Promise<Payment[]> {
    const { userId, status, startDate, endDate, skip, take } = filters;

    try {
      const where: Prisma.PaymentWhereInput = {}
    if (userId) {
        // A user can be either a payer or a recipient
        where.OR = [
          { payerUserId: userId },
          { recipientUserId: userId },
        ];
      }
    if (status) {
        where.status = status;
      }
    if (startDate || endDate) {
        where.createdAt = {}
    if (startDate) {
          where.createdAt.gte = startDate;
        }
    if (endDate) {
          where.createdAt.lte = endDate;
        }
const payments = await this.prisma.payment.findMany({
        where,
        skip: skip || 0,
        take: take || 20, // Default take value,
  orderBy: {
  createdAt: 'desc';
},
      });

      this.logger.info(`Listed ${payments.length} payments with filters: ${JSON.stringify(filters)}`),
      return payments;
    } catch (error) {
    }
      this.logger.error(`Error listing payments: ${error instanceof Error ? error.message : error}`),
      throw new Error(`Failed to list payments: ${error instanceof Error ? error.message : 'Unknown error'}`),
    }

  // Note: Middleware functions and route handlers are typically part of the controller layer (e.g., in `backend/src/controllers/payment.controller.ts`)
  // and are not implemented directly within service files. Service files focus purely on business logic.
}

// backend/src/services/payment.service.ts
// PART 3: Helper functions, error handlers, and exports.

// --- Imports (assuming these are already declared or implicitly available from previous parts) ---

// You might also import specific gateway services if they are used by processPayment/handlePaymentWebhook
// import * as stripeService from './gateways/stripe.service'; 
// import * as bankTransferService from './gateways/bankTransfer.service';

// --- Custom Error Class ---
/**
 * Custom error class for payment service specific errors.
 * Provides a standardized way to throw and catch errors with a specific status code.
 */;
class PaymentServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PaymentServiceError';
    // Capture the stack trace, excluding the constructor call from the stack
    Error.captureStackTrace(this, this.constructor);
  }

// --- Helper Functions ---

/**
 * Helper function to update an existing payment transaction record in the database.
 * This function centralizes the logic for modifying transaction states.
 * @param transactionId The unique ID of the transaction to update.
 * @param data The partial data (Prisma.PaymentTransactionUpdateInput) to apply to the transaction.
 * @returns The updated PaymentTransaction record.
 * @throws {PaymentServiceError} If the transaction with the given ID is not found (404)
 *                               or if the update operation fails for other reasons (500).
 */
async function updatePaymentTransaction(,
  transactionId: string,
  data: Prisma.PaymentTransactionUpdateInput
) {
  try {
    const updatedTransaction = await prisma.paymentTransaction.update({
  where: { id: transactionId },
      data,
    });
    logger.info(`[PaymentService] Transaction ${transactionId} updated. Status: ${data.status || 'no status change'}.`),
    return updatedTransaction;
  } catch (error: any) {
    logger.error(`[PaymentService] Failed to update transaction ${transactionId}:`, error);
    // Check for Prisma's 'Record not found' error code
    if (error.code === 'P2025') { 
      throw new PaymentServiceError(`Payment transaction with ID ${transactionId} not found.`, 404);
    }
    // General error during update operation
    throw new PaymentServiceError(`Failed to update payment transaction ${transactionId}: ${error.message}`);
  }

/**
 * Helper function to specifically mark a payment transaction as failed.
 * This simplifies marking transactions as failed by setting the status, error message, and completion time.
 * @param transactionId The unique ID of the transaction to mark as failed.
 * @param errorMessage The detailed error message explaining why the transaction failed.
 * @returns The updated PaymentTransaction record, now marked as FAILED.
 * @throws {PaymentServiceError} If the transaction cannot be found or updated.
 */
async function markTransactionAsFailed(transactionId: string, errorMessage: string) {
  try {
    const failedTransaction = await updatePaymentTransaction(transactionId, {
  status: PaymentTransactionStatus.FAILED,
      errorMessage: errorMessage,
      completedAt: new Date(), // Mark completion time even for failed transactions;
    });
    logger.warn(`[PaymentService] Transaction ${transactionId} marked as FAILED. Reason: ${errorMessage}`),
    return failedTransaction;
  } catch (error: any) {
    logger.error(`[PaymentService] Error marking transaction ${transactionId} as FAILED:`, error);
    // Re-throw the error as updatePaymentTransaction already wraps it in PaymentServiceError
    throw error;
  }

// --- Main Service Functions (Placeholders for Part 1/2 of the file) ---
// These functions are the primary entry points for the payment service logic.
// Their full implementation would be in previous parts of this file.

/**
 * Initiates a payment process for a BOOM Card.
 * This function would typically handle:
 * 1. Idempotency checks to prevent duplicate charges.
 * 2. Creation of an initial PENDING payment transaction record.
 * 3. Interaction with the selected payment gateway (e.g., Stripe, Bank Transfer API) to process the charge.
 * 4. Updating the transaction status (SUCCEEDED, FAILED, etc.) based on gateway response.
 * @param userId The ID of the user for whom the payment is being processed.
 * @param amount The amount in the smallest currency unit (e.g., cents for USD).
 * @param currency The ISO 4217 currency code (e.g., 'USD', 'EUR').
 * @param paymentMethodId The ID of the payment method token (e.g., Stripe PaymentMethod ID).
 * @param description A brief description of the payment.
 * @param idempotencyKey A unique key to ensure safe retries without duplicate processing.
 * @returns A result object containing transaction details and status.
 */
async function processPayment(,
  userId: string,
  amount: number,
  currency: string,
  paymentMethodId: string,
  description: string,
  idempotencyKey: string
): Promise<{ success: boolean; transactionId?: string; status: PaymentTransactionStatus; message?: string }> {
  logger.info(`[PaymentService] Initiating payment for user ${userId}, amount ${amount} ${currency} (IdempotencyKey: ${idempotencyKey})`),
  let transactionId: string | undefined,
  try {
    // Placeholder for idempotency check and existing transaction lookup;

const existingTransaction = await prisma.paymentTransaction.findUnique({;
  where: { idempotencyKey: idempotencyKey },
    });

    if (existingTransaction) {
      logger.info(`[PaymentService] Idempotency key ${idempotencyKey} found. Returning existing transaction status: ${existingTransaction.status}`),
      return {
  success: existingTransaction.status === PaymentTransactionStatus.SUCCEEDED,
        transactionId: existingTransaction.id,
        status: existingTransaction.status,
        message: existingTransaction.status === PaymentTransactionStatus.SUCCEEDED ? 'Payment already processed successfully.' : `Payment is in ${existingTransaction.status} state.`
}
    }

    // 1. Create a new pending transaction;

const newTransaction = await prisma.paymentTransaction.create({
  data: {
        userId,
        amount,
        currency,
        description,
        status: PaymentTransactionStatus.PENDING,
        idempotencyKey,
        // gatewayTransactionId will be populated after successful gateway interaction;
      },
    });
    transactionId = newTransaction.id;
    logger.info(`[PaymentService] Created pending transaction ${transactionId} for user ${userId}`);

    // 2. Interact with a payment gateway (e.g., Stripe)
    // This part would depend on the actual gateway integration.
    // Example: const gatewayResponse = await stripeService.processCharge(amount, currency, paymentMethodId, { description, idempotencyKey });
    
    // Simulate gateway success after a delay
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network call;

const simulatedGatewaySuccess = Math.random() > 0.1; // 90% chance of success

    if (simulatedGatewaySuccess) {
      await updatePaymentTransaction(transactionId, {
  status: PaymentTransactionStatus.SUCCEEDED,
        gatewayTransactionId: `stripe_charge_${Math.random().toString(36).substring(7)}`, // Simulated gateway ID,
  completedAt: new Date(),
        receiptUrl: `https://example.com/receipts/${transactionId}` // Simulated receipt URL
      });
      logger.info(`[PaymentService] Payment SUCCEEDED for transaction ${transactionId}`);
      return { success: true, transactionId, status: PaymentTransactionStatus.SUCCEEDED, message: 'Payment processed successfully.' },
    } else {
      throw new Error("Simulated payment gateway decline.");
    } catch (error: any) {
    logger.error(`[PaymentService] Error processing payment for user ${userId}:`, error);

    const errorMessage = error instanceof PaymentServiceError ? error.message: `An unexpected error occurred: ${error.message}`,
    // If a transaction was initiated, mark it as failed
    if (transactionId) {
      await markTransactionAsFailed(transactionId, errorMessage).catch(e => {
        logger.error(`[PaymentService] Failed to mark transaction ${transactionId} as failed:`, e);
      });
    }
    
    throw new PaymentServiceError(errorMessage, error instanceof PaymentServiceError ? error.statusCode: 500),
  }

/**
 * Handles incoming webhooks from payment gateways (e.g., Stripe, PayPal).
 * This function is critical for processing asynchronous events from payment providers,
 * such as successful payments, refunds, chargebacks, or disputes, and updating the
 * corresponding PaymentTransaction records in the database.
 * @param rawBody The raw request body from the webhook, needed for signature verification.
 * @param signature The value of the webhook signature header (e.g., 'stripe-signature').
 * @returns An acknowledgment object indicating successful webhook processing.
 * @throws {PaymentServiceError} If webhook verification fails or event processing encounters an error.
 */
async function handlePaymentWebhook(rawBody: string | Buffer, signature: string): Promise<{ received: boolean; message: string }> {
  logger.info('[PaymentService] Receiving payment webhook.');

  try {
    // Placeholder for webhook verification and event parsing
    // Example: const event = stripeService.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // For this example, we'll simulate a generic event based on the rawBody;

const event = JSON.parse(rawBody.toString()); // In a real scenario, this would be validated and parsed securely

    logger.info(`[PaymentService] Webhook event received: Type=${event.type || 'unknown'}`),
    // This switch case would handle different event types from the payment gateway
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded': // Assuming the event object contains metadata linking to our transaction ID,
const paymentIntentId = event.data?.object?.id;

        const linkedTransactionId = event.data?.object?.metadata?.transactionId || event.data?.object?.client_reference_id; // Or retrieve from gateway_transaction_id
        if (linkedTransactionId) {
          await updatePaymentTransaction(linkedTransactionId, {
  status: PaymentTransactionStatus.SUCCEEDED,
            gatewayTransactionId: paymentIntentId,
            completedAt: new Date()
});
          logger.info(`[PaymentService] Webhook: Payment SUCCEEDED for internal transaction ${linkedTransactionId}`),
        } else {
          logger.warn(`[PaymentService] Webhook: Succeeded event for ${paymentIntentId} received but no internal transaction ID found.`),
        }
        break;

      case 'payment_intent.payment_failed': case 'charge.failed':,
const failedPaymentIntentId = event.data?.object?.id;

        const failedTransactionId = event.data?.object?.metadata?.transactionId || event.data?.object?.client_reference_id;

        const failureReason = event.data?.object?.last_payment_error?.message || event.data?.object?.failure_message || 'Payment failed.';
        if (failedTransactionId) {
          await markTransactionAsFailed(failedTransactionId, `Gateway failure: ${failureReason}`),
          logger.info(`[PaymentService] Webhook: Payment FAILED for internal transaction ${failedTransactionId}`),
        } else {
          logger.warn(`[PaymentService] Webhook: Failed event for ${failedPaymentIntentId} received but no internal transaction ID found. Reason: ${failureReason}`),
        }
        break;

      case 'charge.refunded':
        // Handle refunds: update transaction status or create a new refund transaction
        logger.info(`[PaymentService] Webhook: Charge refunded event for transaction ${event.data?.object?.id}`),
        // Logic to update original transaction or create a refund entry
        break;,
  default: logger.warn(`[PaymentService] Unhandled webhook event type: ${event.type}`),
        break;
    }

    return { received: true, message: 'Webhook processed successfully.' },
  } catch (error: any) {
    logger.error(`[PaymentService] Error handling payment webhook:`, error);
    // Depending on the error (e.g., signature verification failure), return appropriate status;

const statusCode = error instanceof PaymentServiceError ? error.statusCode : 400; // 400 for bad request or verification failure
    throw new PaymentServiceError(`Failed to process webhook: ${error.message}`, statusCode);
  }

// --- Exports ---
// Named exports make it clear what functions and classes are available from this module.;
export {
  // Main service functions - These are the primary API surface for the payment service.
  processPayment,
  handlePaymentWebhook,

  // Helper functions - Exposed if they might be useful for testing or specific external calls,
  // though often these remain internal to the service.
  updatePaymentTransaction,
  markTransactionAsFailed,

  // Custom Error Class - Allows consumers of the service to specifically catch and handle
  // payment-related errors.
  PaymentServiceError
}
}