import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { Pool } from 'pg';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Application } from 'express';
import { Server } from 'http';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Database and Redis clients
let pgPool: Pool;
let redisClient: Redis;
let pubClient: Redis;
let subClient: Redis;
let testServer: Server;
let app: Application;

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'boom_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Test Redis configuration
const TEST_REDIS_CONFIG = {
  host: process.env.TEST_REDIS_HOST || 'localhost',
  port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
  password: process.env.TEST_REDIS_PASSWORD,
  db: parseInt(process.env.TEST_REDIS_DB || '1'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

// JWT test configuration
export const TEST_JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key';
export const TEST_JWT_REFRESH_SECRET = process.env.TEST_JWT_REFRESH_SECRET || 'test-refresh-secret';

// Test user types
export interface TestUser {
  id: string;
  email: string;
  role: 'consumer' | 'partner' | 'admin';
  token: string;
  refreshToken: string;
}

// Test data generators
export const generateTestUser = (role: 'consumer' | 'partner' | 'admin'): TestUser => {
  const id = `test-${role}-${Date.now()}`;
  const email = `${role}@test.com`;
  
  const token = jwt.sign(
    { userId: id, email, role },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: id, email, role },
    TEST_JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { id, email, role, token, refreshToken };
};

// Database setup and teardown
export const setupTestDatabase = async (): Promise<Pool> => {
  pgPool = new Pool(TEST_DB_CONFIG);
  
  try {
    // Test connection
    await pgPool.query('SELECT NOW()');
    
    // Run migrations
    await runMigrations();
    
    // Seed test data if needed
    await seedTestData();
    
    return pgPool;
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  };

export const teardownTestDatabase = async (): Promise<void> => {
  if (pgPool) {
    try {
      // Clean up test data
      await cleanupTestData();
      
      // Close pool
      await pgPool.end();
    } catch (error) {
      console.error('Failed to teardown test database:', error);
      throw error;
    }
};

// Redis setup and teardown
export const setupTestRedis = async (): Promise<{ redis: Redis; pub: Redis; sub: Redis }> => {
  redisClient = new Redis(TEST_REDIS_CONFIG);
  pubClient = new Redis(TEST_REDIS_CONFIG);
  subClient = new Redis(TEST_REDIS_CONFIG);
  
  try {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();
    
    // Clear test Redis database
    await redisClient.flushdb();
    
    return { redis: redisClient, pub: pubClient, sub: subClient };
  } catch (error) {
    console.error('Failed to setup test Redis:', error);
    throw error;
  };

export const teardownTestRedis = async (): Promise<void> => {
  const clients = [redisClient, pubClient, subClient];
  
  for (const client of clients) {
    if (client && client.status === 'ready') {
      try {
        await client.quit();
      } catch (error) {
        console.error('Failed to close Redis client:', error);
      }
  };

// Server setup and teardown
export const setupTestServer = async (): Promise<{ app: Application; server: Server }> => {
  // Import app after environment setup
  const { createApp } = await import('../app');
  app = createApp();
  
  // Start server on random port
  return new Promise((resolve, reject) => {
    testServer = app.listen(0, () => {
      const address = testServer.address();
      const port = typeof address === 'object' ? address?.port : 0;
      console.log(`Test server running on port ${port}`);
      resolve({ app, server: testServer });
    });
    
    testServer.on('error', reject);
  });
};

export const teardownTestServer = async (): Promise<void> => {
  if (testServer) {
    return new Promise((resolve, reject) => {
      testServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        });
    });
  };

// Test utilities
export const getTestRequest = () => {
  if (!app) {
    throw new Error('Test app not initialized');
  }
  return supertest(app);
};

export const authenticatedRequest = (user: TestUser) => {
  return getTestRequest().set('Authorization', `Bearer ${user.token}`);
};

// Database migrations
const runMigrations = async (): Promise<void> => {
  const migrationsDir = path.join(__dirname, '../../migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pgPool.query(sql);
    }
};

// Test data seeding
const seedTestData = async (): Promise<void> => {
  // Create test users
  await pgPool.query(`
    INSERT INTO users (id, email, password_hash, role, status, created_at)
    VALUES 
      ('test-consumer-1', 'consumer@test.com', '$2b$10$test', 'consumer', 'active', NOW()),
      ('test-partner-1', 'partner@test.com', '$2b$10$test', 'partner', 'active', NOW()),
      ('test-admin-1', 'admin@test.com', '$2b$10$test', 'admin', 'active', NOW())
    ON CONFLICT (email) DO NOTHING
  `);
  
  // Create test partner
  await pgPool.query(`
    INSERT INTO partners (id, user_id, business_name, category, status, created_at)
    VALUES ('test-partner-1', 'test-partner-1', 'Test Restaurant', 'food_drink', 'active', NOW())
    ON CONFLICT (id) DO NOTHING
  `);
  
  // Create test discount
  await pgPool.query(`
    INSERT INTO discounts (id, partner_id, title, percentage, status, created_at)
    VALUES ('test-discount-1', 'test-partner-1', 'Test Discount', 20, 'active', NOW())
    ON CONFLICT (id) DO NOTHING
  `);
};

// Test data cleanup
const cleanupTestData = async (): Promise<void> => {
  // Delete in reverse order of foreign key dependencies
  const tables = [
    'transactions',
    'discount_redemptions',
    'user_favorites',
    'discounts',
    'partner_locations',
    'partners',
    'user_sessions',
    'user_profiles',
    'users'
  ];
  
  for (const table of tables) {
    await pgPool.query(`DELETE FROM ${table} WHERE id LIKE 'test-%' OR email LIKE '%@test.com'`);
  };

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  
  // Setup database and Redis
  await setupTestDatabase();
  await setupTestRedis();
  
  // Setup test server
  await setupTestServer();
});

// Global test teardown
afterAll(async () => {
  // Teardown in reverse order
  await teardownTestServer();
  await teardownTestRedis();
  await teardownTestDatabase();
});

// Test transaction management
beforeEach(async () => {
  // Start transaction for test isolation
  if (pgPool) {
    await pgPool.query('BEGIN');
  }
  
  // Clear Redis cache
  if (redisClient) {
    await redisClient.flushdb();
  });

afterEach(async () => {
  // Rollback transaction
  if (pgPool) {
    await pgPool.query('ROLLBACK');
  });

// Export test utilities
export {
  pgPool,
  redisClient,
  pubClient,
  subClient,
  app,
  testServer
};

// Mock services for testing
export const mockServices = {
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    sendBulkEmails: jest.fn().mockResolvedValue({ success: true }),
  },
  smsService: {
    sendSMS: jest.fn().mockResolvedValue({ messageId: 'test-sms-id' }),
  },
  paymentService: {
    createPaymentIntent: jest.fn().mockResolvedValue({ id: 'test-payment-intent' }),
    confirmPayment: jest.fn().mockResolvedValue({ status: 'succeeded' }),
  },
  fileUploadService: {
    uploadFile: jest.fn().mockResolvedValue({ url: 'https://test.com/file.jpg' }),
    deleteFile: jest.fn().mockResolvedValue(true),
  },
};

// Test data factories
export const factories = {
  user: (overrides = {}) => ({
    email: `user-${Date.now()}@test.com`,
    password: 'Test123!@#',
    role: 'consumer',
    status: 'active',
    ...overrides,
  }),
  
  partner: (overrides = {}) => ({
    businessName: `Test Business ${Date.now()}`,
    category: 'food_drink',
    description: 'Test description',
    contactEmail: `business-${Date.now()}@test.com`,
    contactPhone: '+1234567890',
    ...overrides,
  }),
  
  discount: (overrides = {}) => ({
    title: 'Test Discount',
    description: 'Test discount description',
    percentage: 20,
    minSpend: 50,
    maxDiscount: 100,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides,
  }),
  
  location: (overrides = {}) => ({
    name: 'Test Location',
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    latitude: 42.6977,
    longitude: 23.3219,
    ...overrides,
  }),
};

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid UUID`,
    };
  },
  
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    return {
      pass,
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
}

}
}
}
}
}
}
}
}
}
}
}
}
