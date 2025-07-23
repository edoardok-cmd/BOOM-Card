import { v4 as uuidv4 } from 'uuid';

/**
 * Enums for User Roles and Statuses
 */
export enum UserRole {
  CONSUMER = 'consumer',
  PARTNER = 'partner',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Interface for a User entity
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string; // Stored hash of the user's password
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  profilePictureUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  preferredLanguage: 'en' | 'bg'; // Supported languages: English, Bulgarian
  isEmailVerified: boolean;
  subscriptionId: string | null; // Nullable, as not all users might have a subscription
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Helper function to generate a simple mock password hash.
 * In a real scenario, this would involve a robust hashing algorithm like bcrypt.
 * For fixtures, we just need a consistent placeholder that looks like a hash.
 * This is not cryptographically secure and is for testing purposes only.
 */
const generateMockPasswordHash = (password: string): string => {
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
const createDate = (dateString?: string): Date => {
  return dateString ? new Date(dateString) : new Date();
};

/**
 * Test User Fixtures
 * These users represent various scenarios for testing the platform's functionality.
 * They cover different roles, statuses, and data completeness levels.
 */
export const users: User[] = [
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    subscriptionId: uuidv4(), // Example active subscription ID
    createdAt: createDate('2023-02-01T11:00:00Z'),
    updatedAt: createDate('2023-10-25T16:00:00Z'),
    lastLoginAt: createDate('2023-11-02T10:30:00Z'),
  },
  {
    id: uuidv4(),
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
    subscriptionId: uuidv4(), // Example partner subscription ID
    createdAt: createDate('2023-03-10T09:00:00Z'),
    updatedAt: createDate('2023-09-15T10:00:00Z'),
    lastLoginAt: createDate('2023-10-30T11:00:00Z'),
  },
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    subscriptionId: uuidv4(), // Had a subscription, but now suspended
    createdAt: createDate('2023-06-01T10:00:00Z'),
    updatedAt: createDate('2023-08-01T10:00:00Z'), // Date of suspension
    lastLoginAt: createDate('2023-07-25T10:00:00Z'),
  },
  {
    id: uuidv4(),
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
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const getAdminUser = (): User | undefined => {
  return users.find(user => user.role === UserRole.ADMIN && user.status === UserStatus.ACTIVE);
};

export const getActiveConsumerUser = (): User | undefined => {
  return users.find(user => user.role === UserRole.CONSUMER && user.status === UserStatus.ACTIVE);
};

export const getActivePartnerUser = (): User | undefined => {
  return users.find(user => user.role === UserRole.PARTNER && user.status === UserStatus.ACTIVE);
};

export const getInactiveUser = (): User | undefined => {
  return users.find(user => user.status === UserStatus.INACTIVE);
};

export const getPendingPartnerUser = (): User | undefined => {
  return users.find(user => user.role === UserRole.PARTNER && user.status === UserStatus.PENDING);
};

export const getSuspendedUser = (): User | undefined => {
  return users.find(user => user.status === UserStatus.SUSPENDED);
};