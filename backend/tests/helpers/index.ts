// 1. All import statements
import request, { SuperTest, Test } from 'supertest';
import { Application } from 'express';
import { Client as PGClient } from 'pg';
import Redis from 'ioredis';
import path from 'path';
// import { DotenvConfigOutput, DotenvParseOutput } from 'dotenv'; // Types if you need to strictly type dotenv results

// 2. All TypeScript interfaces and types

/**
 * Represents a simplified User object for testing purposes.
 */
export interface User {
  id: string;
  email: string;
  password?: string; // Optional for received user objects, but present for creation
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
    code: string; // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED', 'NOT_FOUND'
    message: string;
    details?: any; // For validation errors, etc.
    statusCode: number; // HTTP status code (e.g., 400, 401, 404, 500)
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
  expiresIn: number; // Time in seconds until token expires
  user: User; // The authenticated user's details
}

/**
 * Context object to hold shared resources and state across test suites or individual tests.
 * This helps in managing application instance, database connections, auth tokens, etc.
 */
export interface TestContext {
  app: Application; // The Express application instance
  request: SuperTest<Test>; // Supertest instance for making API requests
  pgClient?: PGClient; // PostgreSQL client for direct DB interaction (e.g., cleanup)
  redisClient?: Redis; // Redis client for direct Redis interaction (e.g., cache cleanup)
  authToken?: string; // JWT token for authenticated API requests
  testUser?: User; // The user created specifically for the current test context
}

// 3. All constants and configuration

/**
 * Path to the environment file specifically for tests.
 * This ensures test environments are isolated from development environments.
 */
export const TEST_ENV_FILE_PATH = path.resolve(process.cwd(), '.env.test');

/**
 * Default credentials for a test user that can be used or created across tests.
 */
export const DEFAULT_TEST_USER_CREDENTIALS = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

/**
 * Base API prefix for all routes (e.g., /api/v1).
 */
export const API_PREFIX = '/api/v1';

/**
 * Specific API paths for common endpoints.
 */
export const AUTH_API_PATH = `${API_PREFIX}/auth`;
export const USERS_API_PATH = `${API_PREFIX}/users`;
export const CARDS_API_PATH = `${API_PREFIX}/cards`;

/**
 * Configuration for the PostgreSQL test database.
 * Uses environment variables with sensible defaults for local testing.
 * It's crucial to use a dedicated test database to avoid data corruption.
 */
export const TEST_DB_CONFIG = {
  user: process.env.PG_TEST_USER || 'boom_test_user',
  host: process.env.PG_TEST_HOST || 'localhost',
  database: process.env.PG_TEST_DATABASE || 'boom_card_test_db',
  password: process.env.PG_TEST_PASSWORD || 'testpassword',
  port: parseInt(process.env.PG_TEST_PORT || '5433', 10), // Often uses a different port than dev DB
};

/**
 * Configuration for the Redis test instance.
 * Uses environment variables with defaults, and specifies a different DB index or port
 * to isolate test Redis data from development Redis data.
 */
export const TEST_REDIS_CONFIG = {
  host: process.env.REDIS_TEST_HOST || 'localhost',
  port: parseInt(process.env.REDIS_TEST_PORT || '6380', 10), // Often uses a different port than dev Redis
  password: process.env.REDIS_TEST_PASSWORD || undefined, // Only if your Redis requires a password
  db: parseInt(process.env.REDIS_TEST_DB || '1', 10), // Use a different DB index for tests
};

// 4. Any decorators or metadata
// No specific decorators or metadata are typically used in a general test helper file.
// These would be more relevant within frameworks like NestJS for dependency injection or module definitions.
```

```typescript
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { app as testApp } from '../../src/app'; // Assuming your main Express app instance is exported as 'app'
import { User, UserDocument } from '../../src/models/user.model';
import { BoomCard, BoomCardDocument } from '../../src/models/boomCard.model';
import config from '../../src/config/config'; // Assuming config contains JWT_SECRET and expiration
import { UserRole } from '../../src/types/user';
import { BoomCardStatus, BoomCardType } from '../../src/types/boomCard';

// Define a structure for seeding data if not already defined in Part 1
export interface SeedDataType {
  users?: Partial<UserDocument>[];
  boomCards?: Partial<BoomCardDocument>[];
}

/**
 * Clears all collections in the test database.
 * Ensure mongoose connection is established before calling this.
 */
export async function clearDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    console.warn('Mongoose not connected, skipping clearDatabase.');
    return;
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (Object.prototype.hasOwnProperty.call(collections, key)) {
      await collections[key].deleteMany({});
    }
  console.log('Database cleared.');
}

/**
 * Creates and saves a test user to the database.
 * @param userData Partial user data to override defaults. Password will be hashed.
 * @returns The created user document.
 */
export async function createTestUser(userData?: Partial<UserDocument>): Promise<UserDocument> {
  const defaultUser = {
    username: `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    email: `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`,
    password: 'Password123!',
    role: UserRole.USER,
    balance: 0,
    isEmailVerified: true,
  };

  const userToCreate = { ...defaultUser, ...userData };

  // Hash password if provided
  if (userToCreate.password) {
    userToCreate.password = await bcrypt.hash(userToCreate.password, 10);
  }

  const user = new User(userToCreate);
  await user.save();
  return user;
}

/**
 * Creates and saves a test Boom Card to the database.
 * @param ownerId The ID of the user who owns this card.
 * @param cardData Partial Boom Card data to override defaults.
 * @returns The created Boom Card document.
 */
export async function createTestBoomCard(ownerId: string, cardData?: Partial<BoomCardDocument>): Promise<BoomCardDocument> {
  const defaultBoomCard = {
    owner: new mongoose.Types.ObjectId(ownerId),
    cardType: BoomCardType.GENERAL,
    status: BoomCardStatus.ACTIVE,
    balance: 100,
    cardNumber: `BOOM-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    lastUsed: new Date(),
  };

  const cardToCreate = { ...defaultBoomCard, ...cardData };

  const boomCard = new BoomCard(cardToCreate);
  await boomCard.save();
  return boomCard;
}

/**
 * Seeds the database with default or provided test data.
 * Clears the database before seeding.
 * @param seedData Optional data to seed the database with.
 * @returns An object containing the created users and boom cards.
 */
export async function seedDatabase(seedData?: SeedDataType): Promise<{ users: UserDocument[], boomCards: BoomCardDocument[] }> {
  console.log('Seeding database...');
  await clearDatabase();

  const users: UserDocument[] = [];
  const boomCards: BoomCardDocument[] = [];

  // Create default users
  const regularUser = await createTestUser({
    username: 'testuser',
    email: 'user@example.com',
    password: 'Password123!',
  });
  users.push(regularUser);

  const adminUser = await createTestUser({
    username: 'testadmin',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: UserRole.ADMIN,
  });
  users.push(adminUser);

  // Create default boom cards for the regular user
  const generalCard = await createTestBoomCard(regularUser._id.toString(), {
    cardType: BoomCardType.GENERAL,
    balance: 250,
  });
  boomCards.push(generalCard);

  const giftCard = await createTestBoomCard(regularUser._id.toString(), {
    cardType: BoomCardType.GIFT,
    balance: 50,
    status: BoomCardStatus.ACTIVE,
  });
  boomCards.push(giftCard);

  // Add any custom users from seedData
  if (seedData?.users && seedData.users.length > 0) {
    for (const userData of seedData.users) {
      users.push(user);
    }

  // Add any custom boom cards from seedData (requires owner ID to exist)
  if (seedData?.boomCards && seedData.boomCards.length > 0) {
    for (const cardData of seedData.boomCards) {
      if (cardData.owner) { // Ensure owner is provided for custom cards
        const card = await createTestBoomCard(cardData.owner.toString(), cardData);
        boomCards.push(card);
      } else {
        console.warn('Skipping custom BoomCard seed: owner ID is missing.');
      }
  }

  console.log('Database seeded.');
  return { users, boomCards };
}

/**
 * Generates a JSON Web Token for a given user or payload.
 * @param user The user document or a plain object containing user data (e.g., _id, role, email).
 * @returns The generated JWT string.
 */
export function generateTestToken(user: UserDocument | Record<string, any>): string {
  const payload = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };
  // Ensure JWT_SECRET is loaded from config
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET not configured in test environment.');
  }
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpirationMinutes + 'm' });
}

/**
 * Returns the Authorization header string with a Bearer token.
 * @param token The JWT string.
 * @returns The full Authorization header value.
 */
export function getAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Creates an authenticated supertest agent for making API requests to the `testApp`.
 * @param token The JWT string.
 * @returns A supertest agent with the Authorization header set.
 */
export function getAuthenticatedRequest(token: string): request.SuperTest<request.Test> {
  return request(testApp).set('Authorization', getAuthHeader(token));
}

/**
 * A helper to create a user, log them in (get a token), and return both.
 * Saves the user to the database.
 * @param userData Optional user data for creation.
 * @returns An object containing the created user document and their authentication token.
 */
export async function createAndLoginUser(userData?: Partial<UserDocument>): Promise<{ user: UserDocument, token: string }> {
  const token = generateTestToken(user);
  return { user, token };
}

/**
 * Creates an admin user, logs them in, and returns both.
 * Saves the admin user to the database.
 * @param userData Optional user data for creation (will override default admin properties).
 * @returns An object containing the created admin user document and their authentication token.
 */
export async function createAndLoginAdmin(userData?: Partial<UserDocument>): Promise<{ user: UserDocument, token: string }> {
  const adminToken = generateTestToken(adminUser);
  return { user: adminUser, token: adminToken };
}

// Export default test data for convenience in tests
export const testData = {
  defaultUser: {
    username: 'testuser_static',
    email: 'user_static@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  defaultAdmin: {
    username: 'testadmin_static',
    email: 'admin_static@example.com',
    password: 'AdminPassword123!',
    role: UserRole.ADMIN,
  },
  defaultGeneralCard: {
    cardType: BoomCardType.GENERAL,
    balance: 250,
  },
  defaultGiftCard: {
    cardType: BoomCardType.GIFT,
    balance: 50,
  },
};

}
}
}
