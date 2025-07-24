import { SuperTest, Test } from 'supertest';
import { Application } from 'express';
import { Client as PGClient } from 'pg';
import Redis from 'ioredis';
/**
 * Represents a simplified User object for testing purposes.
 */
export interface User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Represents a simplified Card object for testing purposes.
 */
export interface Card {
    id: string;
    userId: string;
    name: string;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Standard structure for a successful API response.
 */
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}
/**
 * Standard structure for an error API response.
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        statusCode: number;
    };
}
/**
 * Union type for any API response, allowing for success or error.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
/**
 * Interface for the response received after a successful user authentication (login).
 */
export interface AuthTokenResponse {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: User;
}
/**
 * Context object to hold shared resources and state across test suites or individual tests.
 * This helps in managing application instance, database connections, auth tokens, etc.
 */
export interface TestContext {
    app: Application;
    request: SuperTest<Test>;
    pgClient?: PGClient;
    redisClient?: Redis;
    authToken?: string;
    testUser?: User;
}
/**
 * Path to the environment file specifically for tests.
 * This ensures test environments are isolated from development environments.
 */
export declare const TEST_ENV_FILE_PATH: string;
/**
 * Default credentials for a test user that can be used or created across tests.
 */
export declare const DEFAULT_TEST_USER_CREDENTIALS: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};
/**
 * Base API prefix for all routes (e.g., /api/v1).
 */
export declare const API_PREFIX = "/api/v1";
/**
 * Specific API paths for common endpoints.
 */
export declare const AUTH_API_PATH = "/api/v1/auth";
export declare const USERS_API_PATH = "/api/v1/users";
export declare const CARDS_API_PATH = "/api/v1/cards";
/**
 * Configuration for the PostgreSQL test database.
 * Uses environment variables with sensible defaults for local testing.
 * It's crucial to use a dedicated test database to avoid data corruption.
 */
export declare const TEST_DB_CONFIG: {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
};
/**
 * Configuration for the Redis test instance.
 * Uses environment variables with defaults, and specifies a different DB index or port
 * to isolate test Redis data from development Redis data.
 */
export declare const TEST_REDIS_CONFIG: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
};
import { User, UserDocument } from '../../src/models/user.model';
import { BoomCardDocument } from '../../src/models/boomCard.model';
export interface SeedDataType {
    users?: Partial<UserDocument>[];
    boomCards?: Partial<BoomCardDocument>[];
}
/**
 * Clears all collections in the test database.
 * Ensure mongoose connection is established before calling this.
 */
export declare function clearDatabase(): Promise<void>;
//# sourceMappingURL=index.d.ts.map