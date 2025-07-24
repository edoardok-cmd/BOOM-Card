/**
 * Enums for User Roles and Statuses
 */
export declare enum UserRole {
    CONSUMER = "consumer",
    PARTNER = "partner",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}
/**
 * Interface for a User entity
 */
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    profilePictureUrl: string | null;
    phoneNumber: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    preferredLanguage: 'en' | 'bg';
    isEmailVerified: boolean;
    subscriptionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
}
/**
 * Test User Fixtures
 * These users represent various scenarios for testing the platform's functionality.
 * They cover different roles, statuses, and data completeness levels.
 */
export declare const users: User[];
/**
 * Helper functions to retrieve specific users from the fixture array.
 * Useful for tests that need to target a particular user type or instance.
 */
export declare const getUserById: (id: string) => User | undefined;
export declare const getUserByEmail: (email: string) => User | undefined;
export declare const getAdminUser: () => User | undefined;
export declare const getActiveConsumerUser: () => User | undefined;
export declare const getActivePartnerUser: () => User | undefined;
export declare const getInactiveUser: () => User | undefined;
export declare const getPendingPartnerUser: () => User | undefined;
export declare const getSuspendedUser: () => User | undefined;
//# sourceMappingURL=users.d.ts.map