"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_REDIS_CONFIG = exports.TEST_DB_CONFIG = exports.CARDS_API_PATH = exports.USERS_API_PATH = exports.AUTH_API_PATH = exports.API_PREFIX = exports.DEFAULT_TEST_USER_CREDENTIALS = exports.TEST_ENV_FILE_PATH = void 0;
exports.clearDatabase = clearDatabase;
const tslib_1 = require("tslib");
// 1. All import statements
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const path_1 = tslib_1.__importDefault(require("path"));
// 3. All constants and configuration
/**
 * Path to the environment file specifically for tests.
 * This ensures test environments are isolated from development environments.
 */
exports.TEST_ENV_FILE_PATH = path_1.default.resolve(process.cwd(), '.env.test');
/**
 * Default credentials for a test user that can be used or created across tests.
 */
exports.DEFAULT_TEST_USER_CREDENTIALS = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
};
/**
 * Base API prefix for all routes (e.g., /api/v1).
 */
exports.API_PREFIX = '/api/v1';
/**
 * Specific API paths for common endpoints.
 */
exports.AUTH_API_PATH = `${exports.API_PREFIX}/auth`;
exports.USERS_API_PATH = `${exports.API_PREFIX}/users`;
exports.CARDS_API_PATH = `${exports.API_PREFIX}/cards`;
/**
 * Configuration for the PostgreSQL test database.
 * Uses environment variables with sensible defaults for local testing.
 * It's crucial to use a dedicated test database to avoid data corruption.
 */
exports.TEST_DB_CONFIG = {
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
exports.TEST_REDIS_CONFIG = {
    host: process.env.REDIS_TEST_HOST || 'localhost',
    port: parseInt(process.env.REDIS_TEST_PORT || '6380', 10), // Often uses a different port than dev Redis
    password: process.env.REDIS_TEST_PASSWORD || undefined, // Only if your Redis requires a password
    db: parseInt(process.env.REDIS_TEST_DB || '1', 10), // Use a different DB index for tests
};
// 4. Any decorators or metadata
// No specific decorators or metadata are typically used in a general test helper file.
// These would be more relevant within frameworks like NestJS for dependency injection or module definitions.
`` `

` ``;
typescript;
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const app_1 = require("../../src/app"); // Assuming your main Express app instance is exported as 'app'
const user_model_1 = require("../../src/models/user.model");
const boomCard_model_1 = require("../../src/models/boomCard.model");
const config_1 = tslib_1.__importDefault(require("../../src/config/config")); // Assuming config contains JWT_SECRET and expiration
const user_1 = require("../../src/types/user");
const boomCard_1 = require("../../src/types/boomCard");
/**
 * Clears all collections in the test database.
 * Ensure mongoose connection is established before calling this.
 */
async function clearDatabase() {
    if (mongoose_1.default.connection.readyState === 0) {
        console.warn('Mongoose not connected, skipping clearDatabase.');
        return;
    }
    const collections = mongoose_1.default.connection.collections;
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
    export async function createTestUser(userData) {
        const defaultUser = {
            username: `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            email: `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`,
            password: 'Password123!',
            role: user_1.UserRole.USER,
            balance: 0,
            isEmailVerified: true,
        };
        const userToCreate = { ...defaultUser, ...userData };
        // Hash password if provided
        if (userToCreate.password) {
            userToCreate.password = await bcrypt_1.default.hash(userToCreate.password, 10);
        }
        const user = new user_model_1.User(userToCreate);
        await user.save();
        return user;
    }
    /**
     * Creates and saves a test Boom Card to the database.
     * @param ownerId The ID of the user who owns this card.
     * @param cardData Partial Boom Card data to override defaults.
     * @returns The created Boom Card document.
     */
    export async function createTestBoomCard(ownerId, cardData) {
        const defaultBoomCard = {
            owner: new mongoose_1.default.Types.ObjectId(ownerId),
            cardType: boomCard_1.BoomCardType.GENERAL,
            status: boomCard_1.BoomCardStatus.ACTIVE,
            balance: 100,
            cardNumber: `BOOM-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            lastUsed: new Date(),
        };
        const cardToCreate = { ...defaultBoomCard, ...cardData };
        const boomCard = new boomCard_model_1.BoomCard(cardToCreate);
        await boomCard.save();
        return boomCard;
    }
    /**
     * Seeds the database with default or provided test data.
     * Clears the database before seeding.
     * @param seedData Optional data to seed the database with.
     * @returns An object containing the created users and boom cards.
     */
    export async function seedDatabase(seedData) {
        console.log('Seeding database...');
        await clearDatabase();
        const users = [];
        const boomCards = [];
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
            role: user_1.UserRole.ADMIN,
        });
        users.push(adminUser);
        // Create default boom cards for the regular user
        const generalCard = await createTestBoomCard(regularUser._id.toString(), {
            cardType: boomCard_1.BoomCardType.GENERAL,
            balance: 250,
        });
        boomCards.push(generalCard);
        const giftCard = await createTestBoomCard(regularUser._id.toString(), {
            cardType: boomCard_1.BoomCardType.GIFT,
            balance: 50,
            status: boomCard_1.BoomCardStatus.ACTIVE,
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
                    }
                    else {
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
            export function generateTestToken(user) {
                const payload = {
                    _id: user._id,
                    role: user.role,
                    email: user.email,
                };
                // Ensure JWT_SECRET is loaded from config
                if (!config_1.default.jwt.secret) {
                    throw new Error('JWT_SECRET not configured in test environment.');
                }
                return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.accessExpirationMinutes + 'm' });
            }
            /**
             * Returns the Authorization header string with a Bearer token.
             * @param token The JWT string.
             * @returns The full Authorization header value.
             */
            export function getAuthHeader(token) {
                return `Bearer ${token}`;
            }
            /**
             * Creates an authenticated supertest agent for making API requests to the `testApp`.
             * @param token The JWT string.
             * @returns A supertest agent with the Authorization header set.
             */
            export function getAuthenticatedRequest(token) {
                return (0, supertest_1.default)(app_1.app).set('Authorization', getAuthHeader(token));
            }
            /**
             * A helper to create a user, log them in (get a token), and return both.
             * Saves the user to the database.
             * @param userData Optional user data for creation.
             * @returns An object containing the created user document and their authentication token.
             */
            export async function createAndLoginUser(userData) {
                const token = generateTestToken(user);
                return { user, token };
            }
            /**
             * Creates an admin user, logs them in, and returns both.
             * Saves the admin user to the database.
             * @param userData Optional user data for creation (will override default admin properties).
             * @returns An object containing the created admin user document and their authentication token.
             */
            export async function createAndLoginAdmin(userData) {
                const adminToken = generateTestToken(adminUser);
                return { user: adminUser, token: adminToken };
            }
            // Export default test data for convenience in tests
            export const testData = {
                defaultUser: {
                    username: 'testuser_static',
                    email: 'user_static@example.com',
                    password: 'Password123!',
                    role: user_1.UserRole.USER,
                },
                defaultAdmin: {
                    username: 'testadmin_static',
                    email: 'admin_static@example.com',
                    password: 'AdminPassword123!',
                    role: user_1.UserRole.ADMIN,
                },
                defaultGeneralCard: {
                    cardType: boomCard_1.BoomCardType.GENERAL,
                    balance: 250,
                },
                defaultGiftCard: {
                    cardType: boomCard_1.BoomCardType.GIFT,
                    balance: 50,
                },
            };
        }
    }
}
//# sourceMappingURL=index.js.map