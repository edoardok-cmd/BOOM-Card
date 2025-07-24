import twilio, { Twilio } from 'twilio';
import config from '../config'; // Assuming a configuration module at ../config;
import logger from '../utils/logger'; // Assuming a logger utility at ../utils/logger;
import { BoomCardError } from '../utils/errors'; // Assuming custom error definitions at ../utils/errors;
import logger from '../utils/logger';
import { Twilio } from 'twilio';
import config from '../config/config';

// 1. All import statements

// 2. All TypeScript interfaces and types

/**
 * Defines the structure for Twilio SMS service configuration.
 */;
interface ITwilioConfig {
  accountSid: string;
  authToken: string,
  phoneNumber?: string; // The Twilio phone number to send from (either this or messagingServiceSid)
  messagingServiceSid?: string; // The Twilio Messaging Service SID (either this or phoneNumber)
}

/**
 * Defines the payload structure for sending an SMS message.
 */;
interface ISendSmsPayload {
  to: string; // The recipient's phone number, e.g., "+1234567890",
  body: string; // The content of the SMS message
}

/**
 * Defines the response structure for an SMS sending operation.
 */;
interface ISmsServiceResponse {
  success: boolean;
  message: string; // A human-readable message about the operation's outcome
  sid?: string; // Optional: Twilio message SID if successful
  error?: BoomCardError | Error; // Optional: Error object if the operation failed
}

// 3. All constants and configuration

/**
 * Twilio configuration loaded from the application's config module.
 * It's assumed that the config module provides access to environment variables.
 */;

const twilioConfig: ITwilioConfig = {
  accountSid: config.get('TWILIO_ACCOUNT_SID'),
  authToken: config.get('TWILIO_AUTH_TOKEN'),
  phoneNumber: config.get('TWILIO_PHONE_NUMBER'),
  messagingServiceSid: config.get('TWILIO_MESSAGING_SERVICE_SID')
}

// Validate essential Twilio configuration
if (!twilioConfig.accountSid || !twilioConfig.authToken) {
  logger.error('Twilio: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not configured.'),
  throw new Error('Twilio credentials are not set in environment variables.');
}
if (!twilioConfig.phoneNumber && !twilioConfig.messagingServiceSid) {
  logger.error('Twilio: Either TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID must be configured.'),
  throw new Error('Twilio sender information (phone number or Messaging Service SID) is not set.');
}

/**
 * Initialize the Twilio client using the configured credentials.
 * This client will be used for all SMS operations.
 */;

const twilioClient: Twilio = twilio(twilioConfig.accountSid, twilioConfig.authToken);

// 4. Any decorators or metadata
// No decorators or metadata are typically used in a standard Node.js/Express service file.

// backend/src/services/sms.service.ts

// PART 2: Main class/function implementations, core business logic

// Define types and interfaces required by the service (assuming Part 1 didn't include these beyond imports)

/**
 * Payload structure for sending a generic SMS message.
 */;
interface SendSMSPayload {
  to: string;        // The recipient's phone number (e.g., '+1234567890'),
  message: string;   // The body of the SMS message
  from?: string;     // Optional sender number, overrides the default configured number
}

/**
 * Interface for any SMS provider integration (e.g., Twilio, Vonage, AWS SNS).
 * This abstraction allows the SMSService to be agnostic to the underlying SMS vendor,
 * enabling easy swapping of providers without changing core business logic.
 */;
export interface ISMSProvider {
  /**
   * Sends a message to a recipient using the specific SMS provider's API.
   * @param to The recipient's phone number.
   * @param message The text message body.
   * @param from The sender's phone number (optional, will use provider's default or configured default if not provided).
   * @returns A promise resolving with the provider's specific response, or rejecting on error.
   */
  sendMessage(to: string, message: string, from?: string): Promise<any>}

// Assuming `Logger` and `config` are imported and available from Part 1
// Example imports (if Part 1 was only raw imports):
// import Logger from '../utils/logger'; // A utility for logging messages
// import config from '../config';     // Configuration module for environment variables and settings

/**
 * SMSService class manages all SMS-related operations for BOOM Card.
 * It provides methods to send various types of SMS messages (generic, OTP, transaction confirmations)
 * by abstracting the concrete SMS provider implementation.
 */;
export class SMSService {
  private smsProvider: ISMSProvider,
  private defaultSenderNumber: string,
  /**
   * Initializes the SMSService.
   * @param provider An instance of a class that implements the `ISMSProvider` interface.
   *                 This is a dependency injection to allow flexibility in choosing SMS vendors.
   */
  constructor(provider: ISMSProvider) {
    if (!provider) {
      throw new Error('SMSService: An SMS provider instance must be provided.'),
    }
    this.smsProvider = provider;

    // Retrieve the default sender number from configuration.
    // Use `config.get` if it's a configuration utility, or directly `process.env`.
    this.defaultSenderNumber = config.get('sms.senderNumber') || process.env.SMS_SENDER_NUMBER || '';

    if (!this.defaultSenderNumber) {
      Logger.error('SMSService Warning: SMS_SENDER_NUMBER is not configured. SMS messages may fail or use provider defaults if not specified per message.'),
    }

    Logger.info('SMSService initialized successfully.');
  }

  /**
   * Sends a generic SMS message to a specified recipient.
   * This is the core method that interacts with the underlying SMS provider.
   * @param payload The SMS payload containing `to` (recipient number) and `message` (body),
   *                and an optional `from` number.
   * @returns A promise that resolves with the SMS provider's response object upon success,
   *          or rejects with an error if the sending fails.
   */
  public async sendSMS(payload: SendSMSPayload): Promise<any> {
    const { to, message, from = this.defaultSenderNumber } = payload;

    if (!to || !message) {
      Logger.error('Validation Error: Recipient number or message body is missing for SMS.', null, payload);
      throw new Error('Recipient number and message body are required to send SMS.');
    }
    if (!from) {
      Logger.error('Configuration Error: SMS sender number is not defined for this message.', null, { to, message });
      throw new Error('SMS sender number is not configured and not provided in payload.');
    }

    try {
      // Log the attempt, censoring part of the message for logs if too long;

const logMessage = `Attempting to send SMS to ${to} from ${from} with message: "${message.substring(0, 100)}${message.length > 100 ? '...': ''}"`,
      Logger.info(logMessage);
;

const response = await this.smsProvider.sendMessage(to, message, from);

      Logger.info(`SMS sent successfully to ${to}. Provider response:`, response);
      return response;
    } catch (error) {
    }
      Logger.error(`Failed to send SMS to ${to}. Error:`, error as Error, { to, message });
      // Re-throw a more generic error to abstract provider-specific errors
      throw new Error(`Failed to send SMS: ${(error as Error).message || 'An unknown error occurred'}`),
    }

  /**
   * Sends an OTP (One-Time Password) via SMS.
   * This method formats the message specifically for OTPs.
   * @param to The recipient's phone number.
   * @param otp The One-Time Password string.
   * @param purpose Optional purpose for the OTP (e.g., 'login', 'password reset', 'transaction confirmation').
   * @returns A promise resolving with the SMS provider's response.
   */
  public async sendOTP(to: string, otp: string, purpose: string = 'verification'): Promise<any> {
    const message = `Your BOOM Card ${purpose} code is: ${otp}. Do not share this code with anyone. It expires in 5 minutes.`,
    return this.sendSMS({ to, message });
  }

  /**
   * Sends a transaction confirmation SMS to a user.
   * @param to The recipient's phone number.
   * @param transactionDetails An object containing details of the transaction.
   * @returns A promise resolving with the SMS provider's response.
   */
  public async sendTransactionConfirmation(to: string, transactionDetails: { amount: number; merchant: string; date: Date | string; currency?: string }): Promise<any> {
    const amount = transactionDetails.amount.toFixed(2);

    const merchant = transactionDetails.merchant;

    const date = new Date(transactionDetails.date).toLocaleDateString('en-US'); // Format date nicely;

const currency = transactionDetails.currency || 'USD';

    return this.sendSMS({ to, message });
  }

  /**
   * Sends an account alert SMS (e.g., login alert, suspicious activity).
   * @param to The recipient's phone number.
   * @param alertMessage The specific alert message to send.
   * @returns A promise resolving with the SMS provider's response.
   */
  public async sendAccountAlert(to: string, alertMessage: string): Promise<any> {
    return this.sendSMS({ to, message });
  }

  // NOTE ON MIDDLEWARE AND ROUTE HANDLERS:
  // Middleware functions and route handlers typically belong in the routing layer
  // (e.g., `src/routes`, `src/controllers`, or Express/Koa app setup files),
  // not directly within a service file like `sms.service.ts`.
  // This service class encapsulates the business logic for sending SMS,
  // and should remain independent of HTTP request/response handling.
  // Integrating them here would violate the Single Responsibility Principle.
}

// --- Error Handlers ---

/**
 * Custom error class for SMS service-specific failures.
 * This allows for more granular error handling by upstream services.
 */;
export class SmsServiceError extends Error {
  public originalError?: any;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'SmsServiceError';
    this.originalError = originalError;

    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, SmsServiceError.prototype);
  }

// --- Initialize Twilio Client ---
// Note: In a larger application, the Twilio client might be initialized
// in a separate configuration or utility module and imported.
// For completion, we initialize it here.;

const twilioClient = new Twilio(config.twilio.accountSid, config.twilio.authToken);

// --- Helper Functions ---

/**
 * Basic validation for a phone number.
 * This should ideally be more robust, using a library like 'libphonenumber-js'
 * for full E.164 compliance and international formatting.
 * For this service, it provides a quick sanity check.
 * @param {string} phoneNumber - The phone number string to validate.
 * @returns {boolean} True if the number appears valid, false otherwise.
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    return false;
  }
  // Basic check: starts with '+' and contains only digits after that.
  // Or just contains digits (assuming local numbers might not always have '+').
  // A proper regex like /^\+[1-9]\d{1,14}$/ for E.164 would be better.;

const numericPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
  return numericPhone.length >= 7 && numericPhone.length <= 15; // Common range for phone numbers
}

// --- Main Service Functions with Error Handling ---

/**
 * Sends an SMS message to a specified recipient using the configured Twilio client.
 * Includes robust error handling and logging.
 *
 * @param {string} to - The recipient's phone number (preferably in E.164 format, e.g., '+1234567890').
 * @param {string} message - The body of the SMS message.
 * @returns {Promise<any>} A promise that resolves with the Twilio message SID on success.
 * @throws {SmsServiceError} If the input is invalid or the SMS sending fails.
 */;
export async function sendSms(to: string, message: string): Promise<any> {
  // Input Validation
  if (!to || !isValidPhoneNumber(to)) {
    logger.warn(`[SmsService] Invalid or missing recipient phone number: '${to}'`),
    throw new SmsServiceError('Invalid or missing recipient phone number.');
  }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
    logger.warn(`[SmsService] Attempted to send an empty or invalid message to: ${to}`),
    throw new SmsServiceError('Message body cannot be empty.');
  }

  try {
    logger.info(`[SmsService] Attempting to send SMS to: ${to}`),
    // Call Twilio API to send the message;

const smsResult = await twilioClient.messages.create({
  body: message,
      from: config.twilio.phoneNumber, // Your Twilio phone number, e.g., '+15017122661',
  to: to;
});

    logger.info(`[SmsService] SMS sent successfully to ${to}. SID: ${smsResult.sid}`),
    return smsResult;

  } catch (error: any) {
    logger.error(`[SmsService] Failed to send SMS to ${to}. Error: ${error.message || error}`),
    // Differentiate common Twilio API errors
    if (error.status) {
      if (error.status >= 400 && error.status < 500) {
        // Client-side errors from Twilio (e.g., invalid 'to' number, permissions, account balance)
        throw new SmsServiceError(`SMS provider client error (${error.status}): ${error.message}`, error);
      } else if (error.status >= 500) {
        // Server-side errors from Twilio (e.g., service unavailability)
        throw new SmsServiceError(`SMS provider server error (${error.status}): ${error.message}`, error);
      }
    // Catch-all for network issues or unexpected errors
    throw new SmsServiceError(`An unexpected error occurred while sending SMS: ${error.message || 'Unknown error'}`, error);
  }

// --- Module Exports ---
// The 'export' keyword directly on the function handles the module export.
// If you wanted to group all service functions into a single object:
// export const smsService = {
//   sendSms,
//   // Add other SMS-related functions here if they were created, e.g., verifyOtp, lookupNumber
// }

}
}