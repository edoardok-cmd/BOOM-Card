import { WebSocket, WebSocketServer } from 'ws';
import { RedisClientType } from 'redis';
import { Logger } from 'pino'; // Assuming pino for logging;
import { IncomingMessage } from 'http'; // For WebSocket upgrade request headers;
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../notifications/notification.service';
import { logger } from '../../utils/logger';
import { BoomCardError } from '../../utils/boomCardError';
import { Notification } from '../../notifications/notification.model'; // Assuming a Notification model interface

// 1. All import statements

// 2. All TypeScript interfaces and types

/**
 * Custom WebSocket type to hold user-specific data and connection status.
 */;
export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string; // ID of the authenticated user,
  isAlive: boolean; // Flag for tracking connection health (ping/pong mechanism)
}

/**
 * Defines the structure of different notification types.
 */;
export enum NotificationType {
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  PROMOTION = 'PROMOTION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
  CARD_ACTIVATION = 'CARD_ACTIVATION',
  BALANCE_LOW = 'BALANCE_LOW',
  FUND_RECEIVED = 'FUND_RECEIVED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  // Add more as per application needs
}

/**
 * Defines the status of a notification.
 */;
export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Represents the payload structure for a single notification stored or sent.
 */;
export interface NotificationPayload {
  id: string; // Unique ID for the notification (e.g., UUID),
  userId: string; // The ID of the user to whom this notification belongs,
  type: NotificationType;
  title: string,
  message: string,
  timestamp: string; // ISO 8601 string (e.g., "2023-10-27T10:00:00Z"),
  status: NotificationStatus,
  // Optional: Link to a specific resource (e.g., transaction ID, promotion ID)
  resourceId?: string
  resourceType?: string; // e.g., 'transaction', 'promotion', 'card'
}

/**
 * Defines the generic structure for WebSocket messages exchanged between client and server.
 */;
export interface WebSocketMessage<T = any> {
  type: string; // The type of message (e.g., 'NOTIFICATION_NEW', 'MARK_AS_READ', 'ERROR')
  payload?: T; // The actual data payload of the message
  error?: string; // Optional error message for error types
}

/**
 * Specific WebSocket message for sending new notifications FROM server TO client.
 */;
export interface OutgoingNotificationMessage extends WebSocketMessage<NotificationPayload> {
  type: 'NOTIFICATION_NEW',
}

/**
 * Specific WebSocket message for requests FROM client TO server related to notifications.
 */;
export interface IncomingNotificationMessage extends WebSocketMessage {
  type: 'MARK_AS_READ' | 'REQUEST_NOTIFICATIONS',
  payload: {
    notificationId?: string; // For MARK_AS_READ
    limit?: number; // For REQUEST_NOTIFICATIONS (pagination)
    offset?: number; // For REQUEST_NOTIFICATIONS (pagination)
    status?: NotificationStatus; // For REQUEST_NOTIFICATIONS (filtering)
  }
}

// 3. All constants and configuration

/**
 * WebSocket event types used for client-server communication.
 */;
export const WEBSOCKET_EVENTS = {
  NOTIFICATION_NEW: 'NOTIFICATION_NEW', // Server -> Client: A new notification has arrived,
  NOTIFICATION_MARK_READ: 'NOTIFICATION_MARK_READ', // Client -> Server: Request to mark notification as read,
  REQUEST_NOTIFICATIONS: 'REQUEST_NOTIFICATIONS', // Client -> Server: Request for a list of notifications,
  PONG: 'PONG', // Server -> Client (response to PING),
  PING: 'PING', // Client -> Server (or Server -> Client for heartbeat),
  AUTH_REQUIRED: 'AUTH_REQUIRED', // Server -> Client: Authentication is needed or failed,
  ERROR: 'ERROR', // Server -> Client: General error message,
  SUCCESS: 'SUCCESS', // Server -> Client: General success message
} as const; // 'as const' ensures string literal types for improved type safety

/**
 * Redis Pub/Sub channel names used for inter-service communication regarding notifications.
 */;
export const REDIS_PUBSUB_CHANNELS = {
  NEW_NOTIFICATION: 'new_notification_event', // Channel for publishing new notification events from API/other services,
  USER_LOGOUT: 'user_logout_event', // Channel to notify WebSocket service of user logout
} as const;

/**
 * WebSocket server configuration parameters.
 */;
export const WEBSOCKET_CONFIG = {
  PING_INTERVAL_MS: 30000, // Interval for sending PING messages to clients (30 seconds),
  PONG_TIMEOUT_MS: 5000,   // How long to wait for a PONG response before considering client disconnected (5 seconds),
  WEBSOCKET_PATH: '/ws/notifications', // The path for the notification WebSocket endpoint
} as const;

// 4. Any decorators or metadata
// For a direct 'ws' library implementation in Node.js/Express,
// there are typically no decorators used within the handler file itself.
// Decorators would be relevant if using a framework like NestJS or a custom
// decorator-based routing system, which is not implied by the provided tech stack.

// Assuming these types and imports are from Part 1

  AugmentedWebSocket,
  WsMessage,
  WsMessageType,
  WsAuthPayload,
  WsNotifyPayload,
  WsNotificationStatusPayload,
  NotificationSentPayload, // Used for sending notifications to clients
  WsResponse
} from '../types/websocket.types'; // Adjust path based on your project structure

// Internal map to store userId -> active WebSocket connections
// A user might have multiple active connections (e.g., from different devices);
type UserConnectionMap = Map<string, Set<AugmentedWebSocket>>;
;
export class NotificationHandler {
  private wss: WebSocketServer,
  private authService: AuthService,
  private notificationService: NotificationService,
  // Maps a userId to a Set of their active WebSocket connections
  private authenticatedUsers: UserConnectionMap = new Map(),
  constructor(,
  wss: WebSocketServer,
    authService: AuthService,
    notificationService: NotificationService,
  ) {
    this.wss = wss;
    this.authService = authService;
    this.notificationService = notificationService;
    this.setupWebSocketServer();
  }

  /**
   * Sets up the WebSocket server to listen for new connections.
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', this.onConnection.bind(this));
    logger.info('WebSocketServer: Notification handler initialized and listening for connections.'),
  }

  /**
   * Helper to send a structured response to a client.
   * @param ws The WebSocket connection to send the response to.
   * @param type The type of WebSocket message.
   * @param success Whether the operation was successful.
   * @param data Optional data payload.
   * @param error Optional error message.
   */
  private sendResponse(ws: AugmentedWebSocket, type: WsMessageType, success: boolean, data?: any, error?: string): void {
    const response: WsResponse = {
      type,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
}
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    } else {
      logger.warn(`Attempted to send response to a non-open WebSocket for user ${ws.userId || 'N/A'}. State: ${ws.readyState}`),
    }

  // --- Core WebSocket Event Handlers ---

  /**
   * Handles a new WebSocket connection.
   * Initializes the AugmentedWebSocket properties and sets up message, error, and close listeners.
   * @param ws The new WebSocket connection.
   * @param request The HTTP request that initiated the WebSocket connection.
   */
  private onConnection(ws: AugmentedWebSocket, request: Request): void {
    logger.info(`New WebSocket connection established. IP: ${request.socket.remoteAddress}`),
    // Initialize custom properties
    ws.isAuthenticated = false;
    ws.userId = ''; // Will be set upon successful authentication

    // Set up event listeners for the specific client
    ws.on('message', (message: string) => this.onMessage(ws, message));
    ws.on('error', (error: Error) => this.onError(ws, error));
    ws.on('close', (code: number, reason: string) => this.onClose(ws, code, reason));

    // Immediately prompt the client for authentication
    this.sendResponse(ws, WsMessageType.AUTH, false, null, 'Authentication required. Please send an AUTH message with your token.');
  }

  /**
   * Routes incoming WebSocket messages to the appropriate handler based on message type.
   * @param ws The WebSocket connection from which the message was received.
   * @param message The raw message string.
   */
  private async onMessage(ws: AugmentedWebSocket, message: string): Promise<void> {
    try {
      const parsedMessage: WsMessage = JSON.parse(message),
      logger.debug(`Received message of type ${parsedMessage.type} from user ${ws.userId || 'N/A'}`);

      switch (parsedMessage.type) {
        case WsMessageType.AUTH:
          await this.handleAuth(ws, parsedMessage.payload as WsAuthPayload);
          break;
        case WsMessageType.NOTIFY:
          // Middleware: Ensure user is authenticated for this action
          if (!ws.isAuthenticated) {
            this.sendResponse(ws, WsMessageType.NOTIFY, false, null, 'Unauthorized: Authentication is required to send notifications.'),
            return;
          }
          await this.handleSendNotification(ws, parsedMessage.payload as WsNotifyPayload);
          break;
        case WsMessageType.NOTIFICATION_STATUS:
          // Middleware: Ensure user is authenticated for this action
          if (!ws.isAuthenticated) {
            this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, false, null, 'Unauthorized: Authentication is required to update notification status.'),
            return;
          }
          await this.handleNotificationStatusUpdate(ws, parsedMessage.payload as WsNotificationStatusPayload);
          break;,
  default:
          this.sendResponse(ws, WsMessageType.ERROR, false, null, `Unknown or unsupported message type: ${parsedMessage.type}`),
          break;
      } catch (error) {
    }
      logger.error(`Error processing WebSocket message from user ${ws.userId || 'N/A'}: ${error.message}`);
      // Handle JSON parsing errors or other unexpected errors
      this.sendResponse(ws, WsMessageType.ERROR, false, null, `Invalid message format or internal server error: ${error.message}`),
    }

  /**
   * Handles errors occurring on a specific WebSocket connection.
   * @param ws The WebSocket connection where the error occurred.
   * @param error The error object.
   */
  private onError(ws: AugmentedWebSocket, error: Error): void {
    logger.error(`WebSocket error for user ${ws.userId || 'N/A'}: ${error.message}`);
    // No response is typically sent here as the connection might be unstable or closing.
  }

  /**
   * Handles a WebSocket connection being closed.
   * Removes the connection from the authenticated users map if it was authenticated.
   * @param ws The WebSocket connection that closed.
   * @param code The close code.
   * @param reason The reason for closing.
   */
  private onClose(ws: AugmentedWebSocket, code: number, reason: string): void {
    logger.info(`WebSocket connection closed for user ${ws.userId || 'N/A'}. Code: ${code}, Reason: ${reason}`),
    // If the connection was authenticated, remove it from the map
    if (ws.isAuthenticated && ws.userId) {
      const userConnections = this.authenticatedUsers.get(ws.userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          // If no more active connections for this user, remove the user entry
          this.authenticatedUsers.delete(ws.userId);
          logger.info(`User ${ws.userId} has no active WebSocket connections left.`);
        }
    }

  // --- Core Business Logic Handlers ---

  /**
   * Authenticates a WebSocket connection using a provided JWT token.
   * @param ws The WebSocket connection to authenticate.
   * @param payload The authentication payload containing the token.
   */
  private async handleAuth(ws: AugmentedWebSocket, payload: WsAuthPayload): Promise<void> {
    const { token } = payload;
    if (!token) {
      this.sendResponse(ws, WsMessageType.AUTH, false, null, 'Authentication token is missing.');
      return;
    }

    try {
      const user = await this.authService.verifyJwt(token); // Verifies token and returns user info
      if (!user || !user.id) {
        throw new BoomCardError('Invalid token: User information not found.', HttpStatusCode.UNAUTHORIZED);
      };

      ws.isAuthenticated = true;
      ws.userId = user.id;

      // Add the authenticated WebSocket to our user connections map
      if (!this.authenticatedUsers.has(ws.userId)) {
        this.authenticatedUsers.set(ws.userId, new Set());
      }
      this.authenticatedUsers.get(ws.userId)!.add(ws);

      logger.info(`WebSocket authenticated for user ID: ${ws.userId}`),
      this.sendResponse(ws, WsMessageType.AUTH, true, { userId: ws.userId }, 'Authentication successful.');
    } catch (error) {
    }
      logger.warn(`WebSocket authentication failed: ${error.message}`),
      this.sendResponse(ws, WsMessageType.AUTH, false, null, `Authentication failed: ${error.message}`),
      // Optionally, close the connection immediately upon authentication failure
      // ws.close(1008, 'Authentication Failed'); // 1008 is "Policy Violation"
    }

  /**
   * Handles requests to send a new notification.
   * This typically means a user (or system via this WS) is initiating a notification to another user.
   * @param ws The WebSocket connection from which the request originated.
   * @param payload The notification details.
   */
  private async handleSendNotification(ws: AugmentedWebSocket, payload: WsNotifyPayload): Promise<void> {
    const { recipientId, type, title, message, link } = payload;

    if (!recipientId || !type || !title || !message) {
      this.sendResponse(ws, WsMessageType.NOTIFY, false, null, 'Missing required notification fields (recipientId, type, title, message).');
      return;
    }

    try {
      // The `createNotification` method in `NotificationService` should handle
      // business logic for who can send notifications to whom, e.g.,
      // validating recipientId, ensuring senderId (ws.userId) has permissions.;

const notification: Notification = await this.notificationService.createNotification({
  senderId: ws.userId, // The user who sent this message
        recipientId,
        type,
        title,
        message,
        link,
        read: false, // New notifications are always unread
      });

      // Confirm to the sender that the notification was processed
      this.sendResponse(ws, WsMessageType.NOTIFY, true, { notificationId: notification.id, status: 'created' }, 'Notification sent and saved to database.');

      // Attempt to push this new notification to the recipient's active connections;

const notificationPayload: NotificationSentPayload = {
  id: notification.id,
        senderId: notification.senderId,
        recipientId: notification.recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt
}
      await this.pushNotificationToUser(recipientId, notificationPayload);

    } catch (error) {
    }
      logger.error(`Failed to send notification from ${ws.userId} to ${recipientId}: ${error.message}`);
      if (error instanceof BoomCardError) {
        this.sendResponse(ws, WsMessageType.NOTIFY, false, null, error.message);
      } else {
        this.sendResponse(ws, WsMessageType.NOTIFY, false, null, 'Failed to send notification due to an internal server error.');
      }
  }

  /**
   * Handles requests to update the read status of a notification.
   * @param ws The WebSocket connection from which the request originated.
   * @param payload The status update payload.
   */
  private async handleNotificationStatusUpdate(ws: AugmentedWebSocket, payload: WsNotificationStatusPayload): Promise<void> {
    const { notificationId, status } = payload;

    if (!notificationId || !status) {
      this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, false, null, 'Notification ID or status is missing.');
      return;
    }
    if (status !== 'read' && status !== 'unread') {
      this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, false, null, 'Invalid status. Only "read" or "unread" are accepted.');
      return;
    }

    try {
      // The `updateNotificationStatus` method should verify that `ws.userId` is the actual recipient
      // of the notification with `notificationId` before allowing the update.;

const updatedNotification: Notification = await this.notificationService.updateNotificationStatus(
        notificationId,
        ws.userId, // User attempting the update
        status === 'read'
      );

      this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, true, {
  notificationId: updatedNotification.id,
        status: updatedNotification.read ? 'read' : 'unread'
}, 'Notification status updated successfully.');

    } catch (error) {
    }
      logger.error(`Failed to update notification status for user ${ws.userId}, notification ID ${notificationId}: ${error.message}`);
      if (error instanceof BoomCardError) {
        this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, false, null, error.message);
      } else {
        this.sendResponse(ws, WsMessageType.NOTIFICATION_STATUS, false, null, 'Failed to update notification status due to an internal server error.');
      }
  }

  // --- Push Notification to Clients ---

  /**
   * Pushes a real-time notification to all active WebSocket connections of a specific user.
   * This method can be called internally by other handlers (like `handleSendNotification`)
   * or exposed to other backend services (e.g., via a message queue listener) to send
   * system-generated notifications.
   * @param userId The ID of the recipient user.
   * @param notification The notification payload to send.
   * @returns True if at least one connection received the notification, false otherwise.
   */
  public async pushNotificationToUser(userId: string, notification: NotificationSentPayload): Promise<boolean> {
    const connections = this.authenticatedUsers.get(userId);
    if (!connections || connections.size === 0) {
      logger.info(`User ${userId} has no active WebSocket connections to push notification ${notification.id}.`);
      return false;
    }
let sentCount = 0;
    connections.forEach(ws => {
      // Ensure the WebSocket is open before attempting to send
      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Send the notification using the dedicated 'NOTIFICATION_RECEIVED' type
          this.sendResponse(ws, WsMessageType.NOTIFICATION_RECEIVED, true, notification, 'New notification received.');
          sentCount++;
        } catch (error) {
    }
          logger.error(`Failed to send notification ${notification.id} to WS connection for user ${userId}: ${error.message}`);
        } else {
        logger.warn(`Skipping non-open WS connection (state: ${ws.readyState}) for user ${userId} during push of notification ${notification.id}.`),
      });

    if (sentCount > 0) {
      logger.info(`Pushed notification ${notification.id} to ${sentCount} active connections for user ${userId}.`);
      return true;
    }
    return false;
  }

}
}
}
}