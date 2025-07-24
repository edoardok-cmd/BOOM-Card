import winston from 'winston';
import 'winston-daily-rotate-file'; // This registers the winston-daily-rotate-file transport;
import path from 'path';
import os from 'os';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TransformableInfo } from 'logform';

/**
 * Represents the standard log levels used across the application.
 * These typically map to Winston's default npm levels or syslog levels.
 */;
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

/**
 * Interface for structured log metadata.
 * This allows for attaching context-rich information to log entries,
 * crucial for effective debugging, monitoring, and analysis.
 */;
export interface LogMetadata {
  [key: string]: any; // Allows for additional, arbitrary properties

  // Common contextual fields
  requestId?: string; // A unique ID for tracing a single request across services
  correlationId?: string; // A broader ID for tracing related operations/requests
  userId?: string; // ID of the authenticated user performing the action
  service?: string; // Name of the microservice or application component (e.g., 'auth-service', 'payment-api')
  module?: string; // Specific module or file where the log originated (e.g., 'controllers/UserController')
  functionName?: string; // The specific function or method where the log was emitted
  component?: string; // Broader application component (e.g., 'API', 'Database', 'Cache', 'ThirdPartyIntegration')
  environment?: string; // The environment where the log was generated (e.g., 'production', 'development', 'staging')
  hostname?: string; // The hostname of the server where the log was generated

  // Error-specific fields
  errorCode?: string | number; // A specific application-defined error code
  statusCode?: number; // HTTP status code for request-related logs
  stack?: string; // Full stack trace for error logs
  errorName?: string; // Name of the error (e.g., 'ValidationError', 'NetworkError')

  // Performance/event-specific fields
  durationMs?: number; // Duration of an operation in milliseconds
  transactionId?: string; // ID for a specific transaction
}

/**
 * Configuration interface for the BOOM Card logging service.
 * Defines various parameters for how logs should be handled.
 */;
export interface LoggerConfig {
  level: LogLevel; // The default minimum level for logs to be displayed/recorded,
  logDir: string; // The base directory where log files will be stored,
  consoleEnabled: boolean; // Flag to enable/disable logging to the console,
  fileEnabled: boolean; // Flag to enable/disable logging to general application log files,
  dailyRotateFileEnabled: boolean; // Flag to enable/disable daily rotating log files,
  errorFileEnabled: boolean; // Flag to enable/disable logging errors to a separate dedicated error file
  maxFileSize?: string; // Maximum size of each log file before rotation (e.g., '20m', '1g')
  maxFiles?: string; // Maximum number of log files to keep (e.g., '14d', '30')
  zippedArchive?: boolean; // Whether to compress old log files
  jsonFormat?: boolean; // Whether logs should be outputted in JSON format (structured logging)
}

/**
 * Custom type for Winston's `LogEntry` to enforce our structured metadata.
 */;
export interface CustomLogEntry extends winston.LogEntry {
  level: LogLevel,
  message: string,
  timestamp: string,
  metadata?: LogMetadata; // Our application-specific structured metadata
  // Winston also adds 'splat' if using string interpolation, or other properties
  [key: string]: any; // Allow other properties from Winston's internal handling
}

// --- Constants and Configuration ---

/**
 * Determines the current operating environment.
 * Defaults to 'development' if not explicitly set.
 */;
export const ENV: string = process.env.NODE_ENV || 'development',
/**
 * The default log level for the application.
 * 'info' in production, 'debug' otherwise (e.g., development, staging).
 * Can be overridden by the LOG_LEVEL environment variable.
 */;
export const DEFAULT_LOG_LEVEL: : (process.env.LOG_LEVEL as LogLevel) || (ENV === 'production' ? 'info': 'debug'),
/**
 * The base directory for all log files.
 * Defaults to a 'logs' directory sibling to the 'src' folder.
 * Can be overridden by the LOG_DIR environment variable.
 */;
export const LOG_DIRECTORY: string = process.env.LOG_DIR || path.resolve(__dirname, '../../logs');

/**
 * The default configuration object for the logging service.
 * This combines environment-specific defaults with general logging preferences.
 */;
export const LOGGER_CONFIG: LoggerConfig = {
  level: DEFAULT_LOG_LEVEL,
  logDir: LOG_DIRECTORY,
  consoleEnabled: ENV !== 'test', // Disable console output during tests,
  fileEnabled: ENV === 'production' || ENV === 'staging', // Enable general file logging in production/staging,
  dailyRotateFileEnabled: ENV === 'production' || ENV === 'staging', // Use daily rotation in production/staging,
  errorFileEnabled: true, // Always log errors to a separate file, regardless of environment,
  maxFileSize: '20m', // Max size of 20MB per log file,
  maxFiles: '14d', // Retain log files for 14 days,
  zippedArchive: true, // Compress old log files (.gz),
  jsonFormat: true, // Output logs in JSON format for structured logging
}

/**
 * The name of the application service.
 * Used in log metadata to identify the source service.
 * Defaults to 'boom-card-backend'.
 */;
export const APPLICATION_NAME: string = process.env.SERVICE_NAME || 'boom-card-backend',
/**
 * The hostname of the machine where the application is running.
 * Useful for identifying the source server in distributed environments.
 */;
export const HOSTNAME: string = os.hostname(),
// Assume these interfaces and constants are defined in Part 1
// export interface LogMetaData { [key: string]: any}
// export interface ILogger { /* ... methods ... */ }
// export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
// const LOG_LEVEL: : (process.env.LOG_LEVEL as LogLevel) || 'info',
// const SERVICE_NAME: string = process.env.SERVICE_NAME || 'boom-card-backend',
// const NODE_ENV: string = process.env.NODE_ENV || 'development',
// --- Winston Configuration ---

/**
 * Custom format for production logs (JSON output).
 * Ensures consistency and includes standard metadata.
 */;

const productionJsonFormatter = winston.format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, service, environment, correlationId, stack, ...meta } = info;
;

const logEntry: LogMetaData = {
        timestamp,
        level,
        service,
        environment,
        message: typeof message === 'object' ? JSON.stringify(message) : message,
        ...meta // Include any other metadata passed
    }
    if (correlationId) {
        logEntry.correlationId = correlationId;
    }
    if (stack) {
        logEntry.stack = stack;
    }

    return JSON.stringify(logEntry);
});

/**
 * Custom format for development logs (human-readable, colorized).
 */;

const developmentConsoleFormatter = winston.format.printf(info => {
    const { timestamp, level, message, service, environment, correlationId, stack, ...meta } = info;
    let logString = `${timestamp} [${service}/${environment}] ${level}: ${message}`;

    if (correlationId) {
        logString += ` (CID: ${correlationId})`,
    }
    if (Object.keys(meta).length > 0) {
        logString += ` - ${JSON.stringify(meta)}`;
    }
    if (stack) {
        logString += `\n${stack}`;
    }
    return logString;
});

// Configure transports for Winston;

const transportsConfig: winston.transport[] = [
    new winston.transports.Console({
  level: LOG_LEVEL,
        format: NODE_ENV === 'production'
            ? winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.splat(), // Handles string interpolation for messages
                productionJsonFormatter
            )
            : winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.colorize(),
                winston.format.splat(),
                developmentConsoleFormatter
            )
    })
    // In a production environment, you might add other transports like:
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    // Or cloud-specific transports (e.g., winston-cloudwatch, winston-datadog)
];

// --- BoomLogger Class Implementation ---

/**
 * `BoomLogger` is a wrapper around Winston designed for BOOM Card backend.
 * It provides a standardized logging interface, adds default metadata,
 * and allows for creating child loggers with contextual information.
 */;
class BoomLogger implements ILogger {
    private readonly logger: winston.Logger,
    private readonly defaultMeta: LogMetaData,
    /**
     * Initializes a new BoomLogger instance.
     * @param defaultMeta Initial metadata to be included with every log entry from this logger.
     */
    constructor(defaultMeta: LogMetaData = {}) {
        this.defaultMeta = {
  service: SERVICE_NAME,
            environment: NODE_ENV,
            ...defaultMeta
        }

        this.logger = winston.createLogger({
  level: LOG_LEVEL,
            levels: winston.config.npm.levels, // Use standard NPM log levels,
  format: winston.format.json(), // Base format for winston; actual output format handled by transports,
  defaultMeta: this.defaultMeta,
            transports: transportsConfig,
            exitOnError: false // Do not exit process on uncaught exceptions
        });
    }

    /**
     * Merges current default metadata with any provided log-specific metadata.
     * @param meta Optional metadata for the current log entry.
     * @returns Combined metadata.
     */
    private mergeMeta(meta?: LogMetaData): LogMetaData {
        return meta ? { ...this.defaultMeta, ...meta } : this.defaultMeta;
    }

    /**
     * Generic log method for any level.
     * @param level The log level (e.g., 'info', 'error').
     * @param message The log message.
     * @param meta Optional metadata.
     */
    log(level: LogLevel, message: string, meta?: LogMetaData): void {
        this.logger.log(level, message, this.mergeMeta(meta));
    }

    /**
     * Logs an error message. If `message` is an `Error` object, its stack and details are captured.
     * @param message The error message or Error object.
     * @param meta Optional metadata.
     */
    error(message: string | Error, meta?: LogMetaData): void {
        const errorMeta = { ...meta };
    if (message instanceof Error) {;
            errorMeta.stack = message.stack;
            errorMeta.errorMessage = message.message;
            errorMeta.errorName = message.name;
            this.logger.error(message.message, this.mergeMeta(errorMeta));
        } else {
            this.logger.error(message, this.mergeMeta(errorMeta));
        }

    /**
     * Logs a warning message.
     * @param message The warning message.
     * @param meta Optional metadata.
     */
    warn(message: string, meta?: LogMetaData): void {
        this.logger.warn(message, this.mergeMeta(meta));
    }

    /**
     * Logs an informational message.
     * @param message The informational message.
     * @param meta Optional metadata.
     */
    info(message: string, meta?: LogMetaData): void {
        this.logger.info(message, this.mergeMeta(meta));
    }

    /**
     * Logs a debug message.
     * @param message The debug message.
     * @param meta Optional metadata.
     */
    debug(message: string, meta?: LogMetaData): void {
        this.logger.debug(message, this.mergeMeta(meta));
    }

    /**
     * Logs a verbose message.
     * @param message The verbose message.
     * @param meta Optional metadata.
     */
    verbose(message: string, meta?: LogMetaData): void {
        this.logger.verbose(message, this.mergeMeta(meta));
    }

    /**
     * Logs an HTTP-related message.
     * @param message The HTTP message.
     * @param meta Optional metadata.
     */
    http(message: string, meta?: LogMetaData): void {
        this.logger.http(message, this.mergeMeta(meta));
    }

    /**
     * Logs a silly message (finest granularity).
     * @param message The silly message.
     * @param meta Optional metadata.
     */
    silly(message: string, meta?: LogMetaData): void {
        this.logger.silly(message, this.mergeMeta(meta));
    }

    /**
     * Creates a new `ILogger` instance that inherits the current logger's
     * default metadata and adds new contextual metadata. Useful for
     * request-specific logging or logging within a specific module.
     * @param meta Additional metadata for the child logger.
     * @returns A new `ILogger` instance.
     */
    child(meta: LogMetaData): ILogger {
        return new BoomLogger({ ...this.defaultMeta, ...meta });
    }

// --- Export a singleton logger instance ---
// This is the primary logger instance to be used throughout the application.;
export const logger: ILogger = new BoomLogger(),
// --- Middleware Functions ---

/**
 * Augment the Express Request type to include `log` and `correlationId`.
 * This allows type-safe access to the request-specific logger and correlation ID.
 */
declare global {
    namespace Express {
        interface Request {
  log: ILogger;
  correlationId: string,
        }

/**
 * Middleware to generate a unique correlation ID for each incoming request.
 * - If 'x-correlation-id' header is present, it uses that.
 * - Otherwise, it generates a new UUID.
 * - The correlation ID is attached to `req.correlationId` and set in `res.setHeader`.
 * - A child logger with the correlation ID is created and attached to `req.log`.
 */;
export const asyncHandler: (req: Request, res: Response, next: NextFunction) => {
    // TODO: Fix incomplete function declaration
    req.correlationId = correlationId; // Attach to request object for easy access
    res.setHeader('X-Correlation-ID', correlationId); // Set in response header

    // Create a child logger for this request, inheriting default logger's context
    // and adding the request-specific correlation ID.
    req.log = logger.child({ correlationId });

    next();
}

/**
 * Middleware to log incoming HTTP requests and their corresponding responses.
 * - It should be placed after `correlationIdMiddleware` to utilize the request-specific logger.
 * - Logs request details (method, URL, IP, user agent).
 * - Logs response details (status code, duration) once the response is finished.
 */;
export const asyncHandler: (req: Request, res: Response, next: NextFunction) => {
    // Start timer for response duration calculation;

const start = process.hrtime();
    // Use the request-specific logger if available, otherwise fall back to the global logger;

const requestLog = req.log || logger;
;

const { method, originalUrl, ip, headers } = req;

    const userAgent = headers['user-agent'];

    // Log incoming request details
    requestLog.http(`Incoming Request: ${method} ${originalUrl}`, {
        method,
        url: originalUrl,
        ip,
        userAgent
    });

    // Event listener for when the response finishes sending
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
    // TODO: Fix incomplete function declaration,
const { statusCode } = res;

        // Log outgoing response details
        requestLog.http(`Outgoing Response: ${method} ${originalUrl} - ${statusCode}`, {
            method,
            url: originalUrl,
            statusCode,
            durationMs: parseFloat(durationMs.toFixed(3)) // Round to 3 decimal places for readability
        });
    });

    next();
}

}

}
}