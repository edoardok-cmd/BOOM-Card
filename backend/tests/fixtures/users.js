"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuspendedUser = exports.getPendingPartnerUser = exports.getInactiveUser = exports.getActivePartnerUser = exports.getActiveConsumerUser = exports.getAdminUser = exports.getUserByEmail = exports.getUserById = exports.users = exports.UserStatus = exports.UserRole = void 0;
const uuid_1 = require("uuid");
/**
 * Enums for User Roles and Statuses
 */
var UserRole;
(function (UserRole) {
    UserRole["CONSUMER"] = "consumer";
    UserRole["PARTNER"] = "partner";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
/**
 * Helper function to generate a simple mock password hash.
 * In a real scenario, this would involve a robust hashing algorithm like bcrypt.
 * For fixtures, we just need a consistent placeholder that looks like a hash.
 * This is not cryptographically secure and is for testing purposes only.
 */
const generateMockPasswordHash = (password) => {
    // Example placeholder for a hashed password.
    // In a real testing environment, you might use a library like `bcrypt`
    // and pre-hash passwords for more realistic fixture data.
    // e.g., return bcrypt.hashSync(password, 10);
    return `mocked_hash_${password}_${Math.random().toString(36).substring(2, 10)}`;
};
/**
 * Helper function to create a Date object from an ISO string or a current date.
 * Ensures consistent date format for fixture data.
 */
const createDate = (dateString) => {
    return dateString ? new Date(dateString) : new Date();
};
/**
 * Test User Fixtures
 * These users represent various scenarios for testing the platform's functionality.
 * They cover different roles, statuses, and data completeness levels.
 */
exports.users = [
    {
        id: (0, uuid_1.v4)(),
        email: 'admin@boomcard.com',
        passwordHash: generateMockPasswordHash('AdminPassword123!'),
        firstName: 'Alice',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        profilePictureUrl: null,
        phoneNumber: '+359881234567',
        address: '123 Admin St',
        city: 'Sofia',
        country: 'Bulgaria',
        preferredLanguage: 'en',
        isEmailVerified: true,
        subscriptionId: null, // Admins typically don't have consumer subscriptions
        createdAt: createDate('2023-01-15T10:00:00Z'),
        updatedAt: createDate('2023-10-20T14:30:00Z'),
        lastLoginAt: createDate('2023-11-01T09:00:00Z'),
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'consumer@example.com',
        passwordHash: generateMockPasswordHash('ConsumerPass!23'),
        firstName: 'Bob',
        lastName: 'Consumer',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        profilePictureUrl: 'https://example.com/profiles/bob.jpg',
        phoneNumber: '+359887654321',
        address: '456 Consumer Blvd',
        city: 'Plovdiv',
        country: 'Bulgaria',
        preferredLanguage: 'bg',
        isEmailVerified: true,
        subscriptionId: (0, uuid_1.v4)(), // Example active subscription ID
        createdAt: createDate('2023-02-01T11:00:00Z'),
        updatedAt: createDate('2023-10-25T16:00:00Z'),
        lastLoginAt: createDate('2023-11-02T10:30:00Z'),
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'partner@restaurant.com',
        passwordHash: generateMockPasswordHash('PartnerR123!'),
        firstName: 'Charlie',
        lastName: 'Partner',
        role: UserRole.PARTNER,
        status: UserStatus.ACTIVE,
        profilePictureUrl: null,
        phoneNumber: '+359891122334',
        address: '789 Partner Ave',
        city: 'Varna',
        country: 'Bulgaria',
        preferredLanguage: 'en',
        isEmailVerified: true,
        subscriptionId: (0, uuid_1.v4)(), // Example partner subscription ID
        createdAt: createDate('2023-03-10T09:00:00Z'),
        updatedAt: createDate('2023-09-15T10:00:00Z'),
        lastLoginAt: createDate('2023-10-30T11:00:00Z'),
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'inactive@example.com',
        passwordHash: generateMockPasswordHash('InactiveUser456'),
        firstName: 'Diana',
        lastName: 'Inactive',
        role: UserRole.CONSUMER,
        status: UserStatus.INACTIVE,
        profilePictureUrl: null,
        phoneNumber: null,
        address: null,
        city: null,
        country: null,
        preferredLanguage: 'en',
        isEmailVerified: false, // User never verified email or was deactivated
        subscriptionId: null,
        createdAt: createDate('2023-04-05T14:00:00Z'),
        updatedAt: createDate('2023-04-05T14:00:00Z'),
        lastLoginAt: null, // User never logged in or was inactive for a long time
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'pendingpartner@hotel.com',
        passwordHash: generateMockPasswordHash('PendingPass!789'),
        firstName: 'Eve',
        lastName: 'Pending',
        role: UserRole.PARTNER,
        status: UserStatus.PENDING,
        profilePictureUrl: null,
        phoneNumber: '+359879988776',
        address: '101 Hotel Rd',
        city: 'Burgas',
        country: 'Bulgaria',
        preferredLanguage: 'bg',
        isEmailVerified: false, // Partner is awaiting verification/approval
        subscriptionId: null, // Subscription not yet active for pending partners
        createdAt: createDate('2023-05-20T10:00:00Z'),
        updatedAt: createDate('2023-05-20T10:00:00Z'),
        lastLoginAt: null,
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'suspended@example.com',
        passwordHash: generateMockPasswordHash('SuspendedUser!'),
        firstName: 'Frank',
        lastName: 'Suspended',
        role: UserRole.CONSUMER,
        status: UserStatus.SUSPENDED,
        profilePictureUrl: null,
        phoneNumber: '+359880011223',
        address: '222 Suspended St',
        city: 'Ruse',
        country: 'Bulgaria',
        preferredLanguage: 'en',
        isEmailVerified: true, // Was verified, but account suspended
        subscriptionId: (0, uuid_1.v4)(), // Had a subscription, but now suspended
        createdAt: createDate('2023-06-01T10:00:00Z'),
        updatedAt: createDate('2023-08-01T10:00:00Z'), // Date of suspension
        lastLoginAt: createDate('2023-07-25T10:00:00Z'),
    },
    {
        id: (0, uuid_1.v4)(),
        email: 'newuser@example.com',
        passwordHash: generateMockPasswordHash('NewUserPassword!'),
        firstName: 'Grace',
        lastName: 'New',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        profilePictureUrl: null,
        phoneNumber: null,
        address: null,
        city: null,
        country: null,
        preferredLanguage: 'en',
        isEmailVerified: false, // Newly registered user, email not yet verified
        subscriptionId: null,
        createdAt: createDate(), // Recently created
        updatedAt: createDate(),
        lastLoginAt: null,
    },
];
/**
 * Helper functions to retrieve specific users from the fixture array.
 * Useful for tests that need to target a particular user type or instance.
 */
const getUserById = (id) => {
    return exports.users.find(user => user.id === id);
};
exports.getUserById = getUserById;
const getUserByEmail = (email) => {
    return exports.users.find(user => user.email === email);
};
exports.getUserByEmail = getUserByEmail;
const getAdminUser = () => {
    return exports.users.find(user => user.role === UserRole.ADMIN && user.status === UserStatus.ACTIVE);
};
exports.getAdminUser = getAdminUser;
const getActiveConsumerUser = () => {
    return exports.users.find(user => user.role === UserRole.CONSUMER && user.status === UserStatus.ACTIVE);
};
exports.getActiveConsumerUser = getActiveConsumerUser;
const getActivePartnerUser = () => {
    return exports.users.find(user => user.role === UserRole.PARTNER && user.status === UserStatus.ACTIVE);
};
exports.getActivePartnerUser = getActivePartnerUser;
const getInactiveUser = () => {
    return exports.users.find(user => user.status === UserStatus.INACTIVE);
};
exports.getInactiveUser = getInactiveUser;
const getPendingPartnerUser = () => {
    return exports.users.find(user => user.role === UserRole.PARTNER && user.status === UserStatus.PENDING);
};
exports.getPendingPartnerUser = getPendingPartnerUser;
const getSuspendedUser = () => {
    return exports.users.find(user => user.status === UserStatus.SUSPENDED);
};
exports.getSuspendedUser = getSuspendedUser;
//# sourceMappingURL=users.js.map