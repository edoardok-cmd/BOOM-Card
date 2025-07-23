// backend/src/monitoring/health.ts

// 1. All import statements
import { Request, Response, Router, NextFunction } from 'express';
// Assuming these are available in the project's structure
import config from '../config'; // For application version, name, environment
import logger from '../utils/logger'; // For logging health check activities

// 2. All TypeScript interfaces and types

/**
 * Enum for defining the health status of a service or the application.
 */
export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Interface representing the status of an individual component or dependency.
 */
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  details?: { [key: string]: any }; // Optional additional details specific to the service
}

/**
 * Interface representing the detailed health check response for readiness probes.
 * This includes overall status and status of individual dependencies.
 */
export interface ReadinessResponse {
  status: HealthStatus; // Overall status of the application
  timestamp: string;
  application: {
    name: string;
    version: string;
    environment: string;
  };
  dependencies: ServiceHealth[];
  message?: string; // Overall message for the readiness state
}

/**
 * Interface for the Liveness health check response.
 * This is a simpler check, typically just indicating if the application process is running.
 */
export interface LivenessResponse {
  status: HealthStatus;
  timestamp: string;
  message: string;
}

/**
 * Interface for the Version endpoint response.
 * Provides basic application metadata.
 */
export interface VersionResponse {
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

// 3. All constants and configuration

// API Endpoint Paths for health checks
export const HEALTH_ROOT_PATH = '/health';
export const LIVENESS_PATH = `${HEALTH_ROOT_PATH}/liveness`;
export const READINESS_PATH = `${HEALTH_ROOT_PATH}/readiness`;
export const VERSION_PATH = `${HEALTH_ROOT_PATH}/version`;

// Default messages for various health states and scenarios
export const HEALTH_MESSAGES = {
  LIVENESS_OK: 'Application is alive and running.',
  READINESS_OK: 'Application is ready to serve requests.',
  DATABASE_CONNECTION_ERROR: 'Database connection failed.',
  REDIS_CONNECTION_ERROR: 'Redis connection failed.',
  EXTERNAL_SERVICE_ERROR: (serviceName: string) => `External service "${serviceName}" is unavailable.`,
  GENERAL_ERROR: 'An unexpected error occurred during health check.',
  UP_MESSAGE: 'All systems operational.',
  DEGRADED_MESSAGE: 'Some services are degraded, but application is partially functional.',
  DOWN_MESSAGE: 'Application is down or critically impaired.',
};

// Application metadata (retrieved from a central configuration file)
export const APP_NAME = config.appName || 'BOOM Card Backend';
export const APP_VERSION = config.appVersion || 'UNKNOWN';
export const APP_ENVIRONMENT = config.nodeEnv || 'development';

// 4. Any decorators or metadata
// (No decorators are used in a standard Express.js application for this purpose)

// Main class/function implementations
/**
 * `HealthService` encapsulates the logic for performing various health checks
 * on the application's critical dependencies, such as the database and Redis.
 */
class HealthService {
    private db: Knex;
    private redisClient: RedisClientType;

    /**
     * Constructs a new `HealthService` instance.
     * @param db - The Knex database connection instance.
     * @param redisClient - The Redis client instance.
     */
    constructor(db: Knex, redisClient: RedisClientType) {
        this.db = db;
        this.redisClient = redisClient;
    }

    /**
     * Checks the status of the database connection by executing a simple query.
     * @returns A `ServiceStatus` object indicating the database's health.
     */
    private async checkDatabase(): Promise<ServiceStatus> {
        try {
            await this.db.raw('SELECT 1'); // Execute a trivial query to test connection
            return {
                name: 'Database',
                status: 'UP',
                details: 'Connection successful',
            };
        } catch (error: any) {
            logger.error(`Health check: Database connection failed: ${error.message}`, { service: 'Database', error: error.message });
            return {
                name: 'Database',
                status: 'DOWN',
                details: `Connection failed: ${error.message}`,
            };
        }

    /**
     * Checks the status of the Redis connection by sending a PING command.
     * @returns A `ServiceStatus` object indicating Redis's health.
     */
    private async checkRedis(): Promise<ServiceStatus> {
        try {
            await this.redisClient.ping(); // Send PING command to test connection
            return {
                name: 'Redis',
                status: 'UP',
                details: 'Connection successful',
            };
        } catch (error: any) {
            logger.error(`Health check: Redis connection failed: ${error.message}`, { service: 'Redis', error: error.message });
            return {
                name: 'Redis',
                status: 'DOWN',
                details: `Connection failed: ${error.message}`,
            };
        }

    /**
     * Performs an overall health check by aggregating the statuses of all critical services.
     * @returns A `HealthCheckResponse` object detailing the overall application health.
     */
    public async getOverallHealth(): Promise<HealthCheckResponse> {
        const checks = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            // Add other critical service checks here as the application grows
        ]);

        // Determine overall status: 'UP' if all services are 'UP', otherwise 'DOWN'
        const overallStatus: HealthStatus = checks.every(check => check.status === 'UP') ? 'UP' : 'DOWN';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services: checks,
        };
    }

// Core business logic is encapsulated within the HealthService class.

// Route handlers and router setup
/**
 * Creates and configures an Express Router specifically for health monitoring endpoints.
 * This function allows for dependency injection of required services like Knex and Redis.
 *
 * @param db - The Knex database connection instance.
 * @param redisClient - The Redis client instance.
 * @returns An Express Router instance with health check routes configured.
 */
const createHealthRouter = (db: Knex, redisClient: RedisClientType): Router => {
    const router = Router();
    const healthService = new HealthService(db, redisClient); // Instantiate the health service

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Comprehensive application health check.
     *     description: Provides a detailed status of the application, including connections to the database, Redis, and other critical services.
     *     tags:
     *       - Monitoring
     *     responses:
     *       200:
     *         description: Application is healthy and all critical services are operational.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthCheckResponse'
     *       503:
     *         description: Application is unhealthy due to one or more critical service failures.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthCheckResponse'
     *       500:
     *         description: An unexpected internal server error occurred during the health check process.
     */
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const healthStatus = await healthService.getOverallHealth();

            if (healthStatus.status === 'UP') {
                return res.status(200).json(healthStatus);
            } else {
                // If any critical service is DOWN, return 503 Service Unavailable
                return res.status(503).json(healthStatus);
            } catch (error: any) {
            logger.error(`Health check endpoint error: ${error.message}`, { error: error.message, stack: error.stack });
            // Fallback for unexpected errors during the health check execution itself
            return res.status(500).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                services: [], // Services array might be empty if error prevents checks
                error: 'Internal server error during health check process',
            });
        });

    /**
     * @swagger
     * /health/live:
     *   get:
     *     summary: Liveness probe endpoint.
     *     description: Checks if the application instance is alive and responsive. This typically does not check external dependencies, only if the server is running.
     *     tags:
     *       - Monitoring
     *     responses:
     *       200:
     *         description: Application is alive.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: UP
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                 message:
     *                   type: string
     *                   example: Application is alive
     */
    router.get('/live', (req: Request, res: Response) => {
        // A simple liveness check just indicates the server process is running and responsive.
        // It's designed to restart the pod if it fails.
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            message: 'Application is alive',
        });
    });

    /**
     * @swagger
     * /health/ready:
     *   get:
     *     summary: Readiness probe endpoint.
     *     description: Checks if the application instance is ready to serve traffic. This typically involves checking critical dependencies like the database and Redis.
     *     tags:
     *       - Monitoring
     *     responses:
     *       200:
     *         description: Application is ready and can accept traffic.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthCheckResponse'
     *       503:
     *         description: Application is not ready to serve traffic due to one or more critical service failures.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthCheckResponse'
     *       500:
     *         description: An unexpected internal server error occurred during the readiness check process.
     */
    router.get('/ready', async (req: Request, res: Response, next: NextFunction) => {
        try {
            // For readiness, we typically perform a full health check to ensure all critical dependencies are available.

            if (healthStatus.status === 'UP') {
                return res.status(200).json(healthStatus);
            } else {
                // If any critical service is DOWN, the application is not ready to serve traffic.
                return res.status(503).json(healthStatus);
            } catch (error: any) {
            logger.error(`Readiness check endpoint error: ${error.message}`, { error: error.message, stack: error.stack });
            return res.status(500).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                services: [],
                error: 'Internal server error during readiness check process',
            });
        });

    return router;
};

// Export the function to create the health router
export { createHealthRouter };

}
}
}
}
}
}
}
