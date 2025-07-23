// 1. All import statements
import WebSocket from 'ws'; // For WebSocket types
import { Request } from 'express'; // If the WebSocket connection is upgraded from an Express request, used for context
import { Redis } from 'ioredis'; // For interacting with Redis (e.g., Pub/Sub, Streams)
import logger from '@src/utils/logger'; // Centralized logging utility
import config from '@src/config'; // Project configuration utilities

// 2. All TypeScript interfaces and types

/**
 * Base interface for any message sent or received over the WebSocket.
 * @template T The type of the payload carried by the message.
 */
interface WebSocketMessage<T = any> {
  type: string; // Describes the purpose of the message (e.g., 'ANALYTICS_EVENT', 'ACK')
  payload: T;   // The actual data content of the message
  timestamp?: number; // Optional: Unix timestamp when the message was created/sent
}

/**
 * Base payload structure for all analytics events.
 * Provides common contextual information.
 */
interface BaseAnalyticsEventPayload {
  sessionId: string;  // Unique identifier for the user's session
  userId?: string;    // Optional: ID of the authenticated user, if available
  timestamp: number;  // Unix timestamp when the event occurred (client-side)
  userAgent?: string; // Optional: User-Agent string from the client
  ipAddress?: string; // Optional: IP address of the client
  clientId?: string;  // Optional: Unique client ID (e.g., for anonymous users)
}

/**
 * Payload for a 'PAGE_VIEW' analytics event.
 */
interface PageViewEventPayload extends BaseAnalyticsEventPayload {
  path: string;       // The path of the page viewed (e.g., '/dashboard/overview')
  referrer?: string;  // Optional: The URL of the referring page
  title?: string;     // Optional: The title of the page
}

/**
 * Payload for a 'CARD_ACTIVATION' analytics event.
 */
interface CardActivationEventPayload extends BaseAnalyticsEventPayload {
  cardId: string;           // ID of the BOOM Card being activated
  activationStatus: 'success' | 'failure'; // Outcome of the activation attempt
  failureReason?: string;   // Optional: Reason for failure, if applicable
}

/**
 * Payload for a 'TRANSACTION' related analytics event (e.g., initiated, completed, failed).
 */
interface TransactionEventPayload extends BaseAnalyticsEventPayload {
  transactionId: string;    // Unique ID for the transaction
  amount: number;           // Transaction amount
  currency: string;         // Currency code (e.g., 'USD', 'GBP')
  type: 'debit' | 'credit'; // Type of transaction
  status?: 'pending' | 'completed' | 'failed' | 'refunded'; // Current status of the transaction
  merchantName?: string;    // Optional: Name of the merchant
  categoryId?: string;      // Optional: Category of the transaction (e.g., 'food', 'transport')
}

/**
 * Payload for a 'USER_ACTION' analytics event (e.g., button clicks, form submissions).
 */
interface UserActionEventPayload extends BaseAnalyticsEventPayload {
  action: string;           // Describes the action (e.g., 'click_top_up_button', 'submit_profile_update')
  elementId?: string;       // Optional: ID of the HTML element interacted with
  metadata?: Record<string, any>; // Optional: Additional context for the action
}

/**
 * Union type representing all possible analytics event payloads.
 */
type AnalyticsEventPayload =
  | PageViewEventPayload
  | CardActivationEventPayload
  | TransactionEventPayload
  | UserActionEventPayload;

/**
 * Specific message interface for incoming analytics events.
 * The 'type' property is constrained to `AnalyticsEventType` enum values.
 */
interface AnalyticsEventMessage extends WebSocketMessage<AnalyticsEventPayload> {
  type: AnalyticsEventType; // Constrained to a specific analytics event type
}

/**
 * Context object passed to each WebSocket handler function.
 * Contains common dependencies and connection-specific information.
 */
interface WebSocketContext {
  ws: WebSocket;            // The WebSocket instance for the current connection
  req?: Request;            // The original HTTP request object (if upgraded)
  userId?: string;          // Authenticated user ID extracted from session/token
  sessionId?: string;       // Session ID for the client
  logger: typeof logger;    // Logger instance
  redisClient: Redis;       // Redis client instance
  // Potentially add database client/ORM or other services here
}

/**
 * Type definition for a generic WebSocket handler function.
 * Handlers process incoming WebSocket messages.
 */
type WebSocketHandler = (
  message: WebSocketMessage,
  context: WebSocketContext
) => Promise<void> | void;

// 3. All constants and configuration

/**
 * Enum defining the types of analytics events that can be captured.
 * These map to the `type` field in `AnalyticsEventMessage`.
 */
enum AnalyticsEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  CARD_ACTIVATION = 'CARD_ACTIVATION',
  TRANSACTION_INITIATED = 'TRANSACTION_INITIATED',
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  TOP_UP_INITIATED = 'TOP_UP_INITIATED',
  TOP_UP_COMPLETED = 'TOP_UP_COMPLETED',
  TOP_UP_FAILED = 'TOP_UP_FAILED',
  WITHDRAWAL_INITIATED = 'WITHDRAWAL_INITIATED',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  BILL_PAYMENT = 'BILL_PAYMENT',
  USER_ACTION = 'USER_ACTION', // Generic user interaction
}

/**
 * Enum defining internal WebSocket message types used for protocol communication
 * between client and server, beyond just analytics events.
 */
enum WebSocketMessageType {
  ANALYTICS_EVENT = 'ANALYTICS_EVENT', // Main type for sending analytics data
  ACKNOWLEDGE = 'ACK',                 // Server acknowledging receipt of a message
  ERROR = 'ERROR',                     // Server sending an error response
  PONG = 'PONG',                       // Response to a PING message (for keep-alive)
}

// Configuration constants, typically loaded from an external config service
const ANALYTICS_REDIS_STREAM_KEY: string = config.get('redis.analyticsStreamKey', 'boomcard:analytics:events');
const ANALYTICS_BATCH_SIZE: number = config.get('analytics.batchSize', 50); // Number of events to buffer before processing
const ANALYTICS_FLUSH_INTERVAL_MS: number = config.get('analytics.flushIntervalMs', 2000); // Max time to wait before flushing buffered events (2 seconds)
const ANALYTICS_MAX_PAYLOAD_SIZE_BYTES: number = config.get('analytics.maxPayloadSizeBytes', 1024 * 50); // Max size of a single analytics event payload (50KB)

// 4. Any decorators or metadata

/**
 * Interface representing metadata for a WebSocket route/handler.
 * This is used to map incoming message types to specific handler functions.
 * (Not a TypeScript decorator in syntax, but serves a similar routing purpose).
 */
interface WebSocketRoute {
  type: WebSocketMessageType | AnalyticsEventType; // The message type that triggers this handler
  handler: WebSocketHandler;                      // The function that handles messages of this type
  authRequired?: boolean;                         // Optional: Whether authentication is required for this route
}

import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Logger } from '../../utils/logger'; // Assuming Logger is located in ../../utils/logger.ts
import { AnalyticsEventType, AnalyticsEventData, JsonWebSocketMessage } from '../types/analytics'; // Assuming types are defined in ../types/analytics.ts

/**
 * Handles incoming real-time analytics events via WebSocket connections.
 * This class is responsible for receiving, parsing, validating, and processing
 * various analytics events from BOOM Card clients.
 */
export class AnalyticsHandler {
    private wss: WebSocketServer;
    private logger: Logger;

    /**
     * Constructs the AnalyticsHandler.
     * @param wss The WebSocketServer instance to attach handlers to.
     * @param loggerInstance A Logger instance for logging events and errors.
     */
    constructor(wss: WebSocketServer, loggerInstance: Logger) {
        this.wss = wss;
        this.logger = loggerInstance;
        this.logger.info('AnalyticsHandler initialized.');
    }

    /**
     * Initializes the WebSocket server to listen for new connections
     * and sets up global error/close listeners for the server itself.
     */
    public init(): void {
        this.wss.on('connection', this.handleConnection.bind(this));
        this.logger.info('Listening for new WebSocket connections for analytics...');

        this.wss.on('error', (error: Error) => {
            this.logger.error(`WebSocketServer encountered an error: ${error.message}`, error);
        });

        this.wss.on('close', () => {
            this.logger.info('WebSocketServer for analytics closed.');
        });
    }

    /**
     * Handles a new WebSocket connection from a client.
     * Sets up listeners for messages, connection close, and errors specific to this client.
     * @param ws The WebSocket instance representing the client's connection.
     * @param req The incoming HTTP request that initiated the WebSocket handshake.
     */
    private handleConnection(ws: WebSocket, req: IncomingMessage): void {
        const clientIp = req.socket.remoteAddress;
        this.logger.info(`New analytics WebSocket connection established from ${clientIp}`);

        // Handle incoming messages from the client
        ws.on('message', (message: string) => this.handleMessage(ws, message));

        // Handle connection closure
        ws.on('close', (code: number, reason: string) => this.handleClose(clientIp, code, reason));

        // Handle errors specific to this connection
        ws.on('error', (error: Error) => this.handleError(clientIp, error));
    }

    /**
     * Middleware function: Parses the incoming raw WebSocket message.
     * @param message The raw message string received from the client.
     * @returns The parsed JSON message object, or null if parsing fails.
     */
    private parseMessage(message: string): JsonWebSocketMessage<AnalyticsEventData> | null {
        try {
            const parsed = JSON.parse(message);
            return parsed;
        } catch (error) {
            this.logger.warn(`Failed to parse incoming WebSocket message as JSON: ${message}. Error: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }

    /**
     * Middleware function: Validates if the parsed message conforms to the expected
     * JsonWebSocketMessage<AnalyticsEventData> structure.
     * @param parsedMessage The object parsed from the WebSocket message.
     * @returns True if the message is a valid analytics event message, false otherwise.
     */
    private validateAnalyticsMessage(parsedMessage: any): parsedMessage is JsonWebSocketMessage<AnalyticsEventData> {
        if (!parsedMessage || typeof parsedMessage !== 'object') {
            this.logger.warn('Received invalid message: Not an object.');
            return false;
        }

        const { type, payload } = parsedMessage;

        // Ensure the top-level message type is 'ANALYTICS_EVENT'
        if (type !== 'ANALYTICS_EVENT' || typeof type !== 'string') {
            this.logger.warn(`Received message with unexpected type: '${type}'. Expected 'ANALYTICS_EVENT'.`);
            return false;
        }

        // Validate the analytics event payload structure
        if (!payload || typeof payload !== 'object' || !payload.type || !payload.timestamp) {
            this.logger.warn(`Received analytics event with invalid payload: Missing 'type' or 'timestamp'. Payload: ${JSON.stringify(payload)}`);
            return false;
        }

        // Further specific validation could be added here based on `payload.type`
        // e.g., if (payload.type === AnalyticsEventType.GAME_STARTED && !payload.gameId) return false;

        return true;
    }

    /**
     * Core route handler for all incoming WebSocket messages.
     * It orchestrates parsing, validation, and dispatching of analytics events.
     * @param ws The WebSocket instance from which the message was received.
     * @param rawMessage The raw message buffer/string from the client.
     */
    private async handleMessage(ws: WebSocket, rawMessage: Buffer | string): Promise<void> {
        const message = rawMessage.toString(); // Ensure message is a string

        const parsedMessage = this.parseMessage(message);
        if (!parsedMessage) {
            this.sendErrorResponse(ws, 'Invalid JSON format received.');
            return;
        }

        if (!this.validateAnalyticsMessage(parsedMessage)) {
            this.sendErrorResponse(ws, 'Invalid analytics event message format.');
            return;
        }

        const analyticsEvent = parsedMessage.payload;

        try {
            // Process the validated analytics event
            await this.processAnalyticsEvent(analyticsEvent);
            // Send acknowledgement back to the client
            this.sendAcknowledgement(ws, parsedMessage.id); // Assuming 'id' field exists for correlation
        } catch (error) {
            this.logger.error(`Failed to process analytics event: ${error instanceof Error ? error.message : String(error)}. Event: ${JSON.stringify(analyticsEvent)}`, error);
            this.sendErrorResponse(ws, 'Server failed to process event.', (analyticsEvent as any).correlationId || (analyticsEvent as any).userId);
        }

    /**
     * Core business logic: Processes a validated analytics event.
     * This method logs, stores, and potentially triggers further actions based on the event type.
     * @param event The analytics event data to process.
     */
    private async processAnalyticsEvent(event: AnalyticsEventData): Promise<void> {
        // --- Core Analytics Business Logic ---

        // 1. Primary Logging: Log every incoming analytics event for debugging and audit.
        this.logger.debug(`Processing analytics event: Type=${event.type}, User=${event.userId || 'N/A'}, Session=${event.sessionId || 'N/A'}`);

        // 2. Data Persistence: Store the event in a suitable analytics data store.
        // This could be a NoSQL database (e.g., MongoDB), a data warehouse (e.g., ClickHouse, Snowflake),
        // or a message queue (e.g., Kafka, Kinesis) for asynchronous processing by other services.
        try {
            // Example: A dedicated analytics service would handle storage
            // await this.analyticsDataService.saveEvent(event);
            this.logger.info(`Analytics event persisted successfully: ${event.type}`);
            // In a real application, replace this with actual database/message queue integration.
        } catch (dbError) {
            this.logger.error(`Failed to persist analytics event ${event.type}: ${dbError instanceof Error ? dbError.message : String(dbError)}`, dbError);
            // Depending on requirements, you might rethrow, queue for retry, or ignore.
        }

        // 3. Real-time Aggregation and Side Effects: Perform actions specific to event types.
        switch (event.type) {
            case AnalyticsEventType.GAME_STARTED:
                const gameStarted = event as GameStartedEvent;
                this.logger.info(`[Analytics] Game Started: ID=${gameStarted.gameId}, Mode=${gameStarted.mode}, Players=${gameStarted.numPlayers}`);
                // Example: Increment a real-time metric for "games started today"
                // Example: Update an in-memory counter for active games.
                break;
            case AnalyticsEventType.PLAYER_JOINED:
                const playerJoined = event as PlayerJoinedEvent;
                this.logger.info(`[Analytics] Player Joined: Game ID=${playerJoined.gameId}, Player ID=${playerJoined.playerId}`);
                // Example: Track unique players per game.
                break;
            case AnalyticsEventType.TRANSACTION_PROCESSED:
                const transaction = event as TransactionProcessedEvent;
                this.logger.info(`[Analytics] Transaction Processed: ID=${transaction.transactionId}, Amount=${transaction.amount} ${transaction.currency}, Status=${transaction.status}`);
                // Example: Push to a finance dashboard, trigger fraud detection, or update user's wallet balance (if analytics system has this role).
                break;
            case AnalyticsEventType.ERROR_OCCURRED:
                const errorEvent = event as ErrorOccurredEvent;
                this.logger.error(`[Analytics] Client Error: Code=${errorEvent.errorCode}, Message=${errorEvent.errorMessage}, User=${errorEvent.userId || 'N/A'}`, errorEvent.stackTrace ? new Error(errorEvent.stackTrace) : undefined);
                // Example: Forward this error to an external error tracking service (e.g., Sentry, New Relic).
                // Example: Increment an internal error counter for monitoring.
                break;
            case AnalyticsEventType.PAGE_VIEW:
                const pageView = event as PageViewEvent;
                this.logger.info(`[Analytics] Page View: Path='${pageView.path}', User=${pageView.userId || 'N/A'}`);
                // Example: Update page view statistics, analyze user navigation paths.
                break;
            case AnalyticsEventType.CUSTOM_EVENT:
                const customEvent = event as CustomEvent;
                this.logger.info(`[Analytics] Custom Event: Name='${customEvent.eventName}', Data=${JSON.stringify(customEvent.data)}`);
                // Handle application-specific custom events.
                break;
            // Add more cases here for other specific AnalyticsEventType values
            default:
                this.logger.warn(`Received an unhandled analytics event type: ${event.type}`);
        }

    /**
     * Sends a success acknowledgement back to the client.
     * @param ws The WebSocket instance to send the response to.
     * @param originalMessageId An optional ID from the original message for correlating responses.
     */
    private sendAcknowledgement(ws: WebSocket, originalMessageId?: string): void {
        const response = {
            status: 'success',
            message: 'Analytics event received and processed.',
            timestamp: Date.now(),
            correlationId: originalMessageId,
        };
        ws.send(JSON.stringify(response));
    }

    /**
     * Sends an error response back to the client.
     * @param ws The WebSocket instance to send the error to.
     * @param errorMessage A descriptive error message.
     * @param eventId An optional ID related to the event that caused the error.
     */
    private sendErrorResponse(ws: WebSocket, errorMessage: string, eventId?: string): void {
            status: 'error',
            message: errorMessage,
            timestamp: Date.now(),
            eventId: eventId,
        };
        ws.send(JSON.stringify(response));
    }

    /**
     * Handles the close event for a specific WebSocket connection.
     * @param clientIp The IP address of the disconnected client.
     * @param code The WebSocket close code.
     * @param reason The reason for the connection closing.
     */
    private handleClose(clientIp: string | undefined, code: number, reason: string): void {
        this.logger.info(`Analytics WebSocket connection from ${clientIp} closed. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    }

    /**
     * Handles errors that occur on a specific WebSocket connection.
     * @param clientIp The IP address of the client where the error occurred.
     * @param error The error object.
     */
    private handleError(clientIp: string | undefined, error: Error): void {
        this.logger.error(`Analytics WebSocket error for client ${clientIp}: ${error.message}`, error);
    }

}
}
}
