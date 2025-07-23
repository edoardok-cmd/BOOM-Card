// 1. All import statements
import { IResolvers, GraphQLScalarType, Kind, GraphQLError } from 'graphql';
import { ApolloError, AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { Repository, getConnection } from 'typeorm'; // getConnection is used for context, Repository for type hinting if needed
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import validator from 'validator';

// Custom Scalars (assuming these are defined in a separate file)
import {
  GraphQLDate,
  GraphQLDateTime,
  GraphQLEmailAddress,
  GraphQLURL,
  GraphQLJSON,
  GraphQLPhoneNumber,
  GraphQLLimitedString,
  GraphQLCurrency,
} from '../scalars';

// Entity Imports (adjust based on actual project entities)
import { User } from '../../entity/User';
import { Account } from '../../entity/Account';
import { Card } from '../../entity/Card';
import { Transaction } from '../../entity/Transaction';
import { Beneficiary } from '../../entity/Beneficiary';
import { Notification } from '../../entity/Notification';
import { OTP } from '../../entity/OTP';
import { AuditLog } from '../../entity/AuditLog';
import { TransactionCategory } from '../../entity/TransactionCategory';
import { CardRequest } from '../../entity/CardRequest';
import { UserPreference } from '../../entity/UserPreference';
import { AdminAction } from '../../entity/AdminAction';
import { SupportTicket } from '../../entity/SupportTicket';

// Service Imports (assuming a services layer for business logic)
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { AccountService } from '../../services/AccountService';
import { CardService } from '../../services/CardService';
import { TransactionService } from '../../services/TransactionService';
import { BeneficiaryService } from '../../services/BeneficiaryService';
import { NotificationService } from '../../services/NotificationService';
import { OTPService } from '../../services/OTPService';
import { AuditLogService } from '../../services/AuditLogService';
import { AdminService } from '../../services/AdminService';
import { SupportService } from '../../services/SupportService';

// DataLoader Imports (if using DataLoaders for N+1 problem optimization)
// Placeholder for DataLoaders; concrete types will be defined if used.
import { createUserLoaders } from '../dataloaders';

// Configuration and Environment Variables
import { config } from '../../config';

// 2. All TypeScript interfaces and types

/**
 * Interface for the services available in the GraphQL context.
 * This bundles all service instances for easy access in resolvers, promoting DI.
 */
export interface IServices {
  authService: AuthService;
  userService: UserService;
  accountService: AccountService;
  cardService: CardService;
  transactionService: TransactionService;
  beneficiaryService: BeneficiaryService;
  notificationService: NotificationService;
  otpService: OTPService;
  auditLogService: AuditLogService;
  adminService: AdminService;
  supportService: SupportService;
  // Add other services as the project grows
}

/**
 * Interface for DataLoaders available in the GraphQL context.
 * This bundles all DataLoader instances for efficient data fetching, solving N+1 issues.
 */
export interface IDataLoaders {
  userLoader: ReturnType<typeof createUserLoaders>['userLoader'];
  // Add other DataLoaders as needed (e.g., cardLoader, accountLoader)
  // cardLoader: DataLoader<string, Card>;
  // transactionLoader: DataLoader<string, Transaction>;
}

/**
 * The GraphQL context interface, passed to all resolvers.
 * It contains essential resources, services, and authentication information.
 */
export interface MyContext {
  req: Request;
  res: Response;
  connection: ReturnType<typeof getConnection>; // TypeORM connection manager
  redisClient: Redis;
  services: IServices;
  dataLoaders: IDataLoaders;
  user?: User; // The authenticated user object, if available from a session or JWT
}

// 3. All constants and configuration

/**
 * Constants for Redis key prefixes. Used for caching, sessions, and other temporary data storage.
 */
export const REDIS_PREFIXES = {
  USER_SESSION: 'boomcard:user_session:',
  FORGOT_PASSWORD: 'boomcard:forgot_password:',
  EMAIL_VERIFICATION: 'boomcard:email_verification:',
  PHONE_VERIFICATION: 'boomcard:phone_verification:',
  OTP_VERIFICATION: 'boomcard:otp_verification:',
  USER_CACHE: 'boomcard:cache:user:',
  CARD_CACHE: 'boomcard:cache:card:',
  ACCOUNT_CACHE: 'boomcard:cache:account:',
  TRANSACTION_CACHE: 'boomcard:cache:transaction:',
  ADMIN_SESSION: 'boomcard:admin_session:',
};

/**
 * JWT related constants and configurations, sourced from environment variables.
 */
export const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: config.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_LIFETIME: config.ACCESS_TOKEN_LIFETIME, // e.g., '15m'
  REFRESH_TOKEN_LIFETIME: config.REFRESH_TOKEN_LIFETIME, // e.g., '7d'
};

/**
 * Security-related constants for hashing, OTP, etc.
 */
export const SECURITY_CONFIG = {
  PASSWORD_HASH_ROUNDS: 12, // Bcrypt salt rounds
  OTP_CODE_LENGTH: 6,
  OTP_EXPIRATION_SECONDS: 300, // 5 minutes
};

/**
 * Validation constants for various input fields.
 */
export const VALIDATION_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,
  PIN_CODE_LENGTH: 4,
  CARD_NUMBER_LENGTH: 16,
  CVV_LENGTH: 3,
  ACCOUNT_NUMBER_LENGTH: 10,
  MIN_TRANSACTION_AMOUNT: 0.01,
  MAX_TRANSACTION_AMOUNT: 1000000,
};

// 4. Any decorators or metadata
// In a traditional `IResolvers` setup for Apollo Server, decorators are typically not used
// directly within the resolver definitions themselves. They are more common in frameworks like
// Type-GraphQL, or for ORM entities (e.g., TypeORM's `@Entity`, `@Column`).
// Since this file defines resolvers using the `IResolvers` interface, no decorators are present here.

// This file continues from Part 1, assuming necessary imports (like IContext, Apollo Errors, etc.)
// and potentially service definitions were handled there or in sibling files.
// For completeness and clarity, key imports are repeated here.

import { IContext } from './types'; // Assumed to be defined in Part 1 or a sibling `types.ts`
import { AuthenticationError, AuthorizationError, UserInputError, ApolloError } from 'apollo-server-errors';

// Assume these services are implemented and provide the core business logic and data access.
// They would typically interact with a database (e.g., Prisma, TypeORM, Mongoose).
import * as userService from '../../services/userService';
import * as cardService from '../../services/cardService';
import * as authService from '../../services/authService';
import * as transactionService from '../../services/transactionService';

// Assuming enums are defined for consistency (e.g., in `src/utils/enums.ts`)
import { CardStatus, TransactionType } from '../../utils/enums';
import { isValidUUID } from '../../utils/validation'; // A utility to validate UUID format

/**
 * Middleware-like helper functions for authorization checks.
 * In a larger application, these might be more abstract or implemented as directives.
 */
const checkAuth = (context: IContext) => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in to perform this action.');
  };

const checkAdmin = (context: IContext) => {
  checkAuth(context); // First ensure user is logged in
  if (context.user?.role !== 'ADMIN') {
    throw new AuthorizationError('You are not authorized to perform this action. Admin access required.');
  };

/**
 * The main GraphQL resolver map.
 * Each top-level key (Query, Mutation, TypeName) corresponds to a section of your GraphQL schema.
 */
const resolvers = {
  /**
   * Query Resolvers: Handle data fetching operations.
   */
  Query: {
    /**
     * Get the currently authenticated user's profile.
     * Requires authentication.
     */
    me: async (parent: any, args: any, context: IContext) => {
      checkAuth(context);
      // Fetch user details using the ID from the authenticated context
      const user = await userService.getUserById(context.user!.id);
      if (!user) {
        // This case should ideally not happen if authentication is successful and user exists
        throw new ApolloError('Authenticated user not found.', 'USER_NOT_FOUND');
      }
      // Omit sensitive data like password hash
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    /**
     * Get a user by their ID.
     * Only accessible by administrators.
     */
    getUser: async (parent: any, { id }: { id: string }, context: IContext) => {
      checkAdmin(context); // Admin-only access
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid User ID format.');
      }
      if (!user) {
        throw new ApolloError('User not found.', 'NOT_FOUND');
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    /**
     * List all registered users.
     * Only accessible by administrators.
     */
    listUsers: async (parent: any, args: any, context: IContext) => {
      checkAdmin(context); // Admin-only access
      const users = await userService.listUsers();
      // Map to omit passwords for all users in the list
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    },

    /**
     * Get a specific card by its ID.
     * Accessible by the card owner or administrators.
     */
    getCard: async (parent: any, { id }: { id: string }, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      const card = await cardService.getCardById(id);
      if (!card) {
        throw new ApolloError('Card not found.', 'NOT_FOUND');
      }
      // Authorization: User must own the card or be an admin
      if (card.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view this card.');
      }
      return card;
    },

    /**
     * List cards for a specific user.
     * A user can list their own cards, admins can list any user's cards.
     */
    listCardsForUser: async (parent: any, { userId }: { userId?: string }, context: IContext) => {
      checkAuth(context);
      // If no userId is provided, default to the authenticated user's ID
      const targetUserId = userId || context.user!.id;

      // Authorization: User can only view their own cards unless they are an admin
      if (targetUserId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view cards for another user.');
      }
      if (!isValidUUID(targetUserId)) {
        throw new UserInputError('Invalid User ID format.');
      }
      return cardService.listCardsForUser(targetUserId);
    },

    /**
     * List all cards in the system.
     * Only accessible by administrators.
     */
    listAllCards: async (parent: any, args: any, context: IContext) => {
      checkAdmin(context); // Admin-only access
      return cardService.listAllCards();
    },

    /**
     * Get transactions for a specific card.
     * Accessible by the card owner or administrators.
     */
    getTransactionsForCard: async (parent: any, { cardId }: { cardId: string }, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(cardId)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      if (!card) {
        throw new ApolloError('Card not found.', 'NOT_FOUND');
      }
      // Authorization: User must own the card or be an admin
      if (card.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view transactions for this card.');
      }
      return transactionService.getTransactionsByCardId(cardId);
    },

    /**
     * Get transactions for a specific user.
     * A user can list their own transactions, admins can list any user's transactions.
     */
    getTransactionsForUser: async (parent: any, { userId }: { userId?: string }, context: IContext) => {
      checkAuth(context);
      // If no userId is provided, default to the authenticated user's ID

      // Authorization: User can only view their own transactions unless they are an admin
      if (targetUserId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view transactions for another user.');
      }
      if (!isValidUUID(targetUserId)) {
        throw new UserInputError('Invalid User ID format.');
      }
      return transactionService.getTransactionsByUserId(targetUserId);
    },

  /**
   * Mutation Resolvers: Handle data modification operations (create, update, delete).
   */
  Mutation: {
    /**
     * Sign up a new user.
     * Does not require authentication.
     */
    signUp: async (parent: any, { input }: any, context: IContext) => {
      try {
        const { password, ...userWithoutPassword } = user; // Omit password from response
        return userWithoutPassword;
      } catch (error: any) {
        if (error.message.includes('User with this email already exists')) {
          throw new UserInputError(error.message);
        }
        throw new ApolloError('Failed to sign up.', 'SIGN_UP_FAILED');
      },

    /**
     * Log in an existing user.
     * Does not require authentication. Returns user data and a JWT token.
     */
    login: async (parent: any, { email, password }: any, context: IContext) => {
      try {
        const { user, token } = await authService.login(email, password);
        const { password: userPassword, ...userWithoutPassword } = user; // Omit password from response
        return { user: userWithoutPassword, token };
      } catch (error: any) {
        if (error.message.includes('Invalid credentials')) {
          throw new AuthenticationError('Invalid email or password.');
        }
        throw new ApolloError('Failed to log in.', 'LOGIN_FAILED');
      },

    /**
     * Update an existing user's profile.
     * Accessible by the user themselves or administrators.
     */
    updateUser: async (parent: any, { id, input }: any, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid User ID format.');
      }
      // Authorization: User can only update their own profile unless they are an admin
      if (id !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to update this user profile.');
      }
      const updatedUser = await userService.updateUser(id, input);
      if (!updatedUser) {
        throw new ApolloError('User not found or update failed.', 'UPDATE_USER_FAILED');
      }
      const { password, ...userWithoutPassword } = updatedUser; // Omit password
      return userWithoutPassword;
    },

    /**
     * Delete a user.
     * Only accessible by administrators.
     */
    deleteUser: async (parent: any, { id }: { id: string }, context: IContext) => {
      checkAdmin(context); // Admin-only access
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid User ID format.');
      }
      const success = await userService.deleteUser(id);
      if (!success) {
        throw new ApolloError('User not found or delete failed.', 'DELETE_USER_FAILED');
      }
      return success;
    },

    /**
     * Create a new card.
     * Accessible by authenticated users to create cards for themselves, or by admins to create for any user.
     */
    createCard: async (parent: any, { input }: any, context: IContext) => {
      checkAuth(context);
      // Determine the target user ID for the new card

      // Authorization: User can only create a card for themselves unless they are an admin
      if (targetUserId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to create a card for another user.');
      }
      if (!isValidUUID(targetUserId)) {
        throw new UserInputError('Invalid User ID format for card creation.');
      }

      // Ensure the target user actually exists
      const userExists = await userService.getUserById(targetUserId);
      if (!userExists) {
        throw new ApolloError('User not found for card creation.', 'USER_NOT_FOUND');
      }

      return cardService.createCard(targetUserId, input.balance || 0, input.nickname);
    },

    /**
     * Update an existing card's details.
     * Accessible by the card owner or administrators.
     */
    updateCard: async (parent: any, { id, input }: any, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      const existingCard = await cardService.getCardById(id);
      if (!existingCard) {
        throw new ApolloError('Card not found.', 'NOT_FOUND');
      }
      // Authorization: User must own the card or be an admin
      if (existingCard.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to update this card.');
      }
      const updatedCard = await cardService.updateCard(id, input);
      if (!updatedCard) {
        throw new ApolloError('Card not found or update failed.', 'UPDATE_CARD_FAILED');
      }
      return updatedCard;
    },

    /**
     * Delete a card.
     * Accessible by the card owner or administrators.
     */
    deleteCard: async (parent: any, { id }: { id: string }, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(id)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      if (!existingCard) {
        throw new ApolloError('Card not found.', 'NOT_FOUND');
      }
      // Authorization: User must own the card or be an admin
      if (existingCard.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to delete this card.');
      }
      if (!success) {
        throw new ApolloError('Card not found or delete failed.', 'DELETE_CARD_FAILED');
      }
      return success;
    },

    /**
     * Link an existing card to a specific user.
     * Primarily an administrative function for correcting or assigning cards.
     */
    linkCardToUser: async (parent: any, { cardId, userId }: { cardId: string, userId: string }, context: IContext) => {
      checkAdmin(context); // Admin-only access
      if (!isValidUUID(cardId) || !isValidUUID(userId)) {
        throw new UserInputError('Invalid Card ID or User ID format.');
      }
      const linkedCard = await cardService.linkCardToUser(cardId, userId);
      if (!linkedCard) {
        throw new ApolloError('Card or User not found, or linking failed.', 'LINK_CARD_FAILED');
      }
      return linkedCard;
    },

    /**
     * Transfer funds between two cards.
     * The authenticated user must own the `fromCardId` or be an admin.
     */
    transferFunds: async (parent: any, { fromCardId, toCardId, amount }: any, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(fromCardId) || !isValidUUID(toCardId)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      if (amount <= 0) {
        throw new UserInputError('Amount must be positive for transfer.');
      }

      // Verify ownership of the `fromCard` for authorization
      const fromCard = await cardService.getCardById(fromCardId);
      if (!fromCard || (fromCard.userId !== context.user!.id && context.user!.role !== 'ADMIN')) {
        throw new AuthorizationError('You are not authorized to transfer funds from this card.');
      }

      const toCard = await cardService.getCardById(toCardId);
      if (!toCard) {
        throw new ApolloError('Destination card not found.', 'CARD_NOT_FOUND');
      }

      // Check if both cards are active to allow transactions
      if (fromCard.status !== CardStatus.ACTIVE || toCard.status !== CardStatus.ACTIVE) {
        throw new ApolloError('One or both cards are not active and cannot participate in transfer.', 'CARD_INACTIVE');
      }

      try {
        return await cardService.transferFunds(fromCardId, toCardId, amount);
      } catch (error: any) {
        if (error.message.includes('Insufficient funds')) {
          throw new UserInputError(error.message);
        }
        throw new ApolloError(`Transfer failed: ${error.message}`, 'TRANSFER_FAILED');
      },

    /**
     * Top up a card with funds.
     * The authenticated user must own the card or be an admin.
     * This simulates a payment coming into the system.
     */
    topUpCard: async (parent: any, { cardId, amount }: { cardId: string, amount: number }, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(cardId)) {
        throw new UserInputError('Invalid Card ID format.');
      }
      if (amount <= 0) {
        throw new UserInputError('Amount must be positive for top-up.');
      }

      if (!card || (card.userId !== context.user!.id && context.user!.role !== 'ADMIN')) {
        throw new AuthorizationError('You are not authorized to top up this card.');
      }
      if (card.status !== CardStatus.ACTIVE) {
        throw new ApolloError('Card is not active and cannot be topped up.', 'CARD_INACTIVE');
      }

      try {
        return await cardService.topUpCard(cardId, amount);
      } catch (error: any) {
        throw new ApolloError(`Top-up failed: ${error.message}`, 'TOP_UP_FAILED');
      },

    /**
     * Simulate making a payment from a card to a merchant.
     * The authenticated user must own the `fromCardId` or be an admin.
     */
    makePayment: async (parent: any, { fromCardId, merchantId, amount }: any, context: IContext) => {
      checkAuth(context);
      if (!isValidUUID(fromCardId) || !isValidUUID(merchantId)) { // merchantId also expected to be UUID
        throw new UserInputError('Invalid Card ID or Merchant ID format.');
      }
      if (amount <= 0) {
        throw new UserInputError('Amount must be positive for payment.');
      }

      if (!fromCard || (fromCard.userId !== context.user!.id && context.user!.role !== 'ADMIN')) {
        throw new AuthorizationError('You are not authorized to make a payment from this card.');
      }
      if (fromCard.status !== CardStatus.ACTIVE) {
        throw new ApolloError('Card is not active and cannot be used for payments.', 'CARD_INACTIVE');
      }

      // In a real application, `merchantId` would correspond to an actual merchant account,
      // and this transaction would likely involve an external payment gateway.
      // For this simulation, we deduct from the card and record a transaction.
      try {
        return await cardService.makePayment(fromCardId, merchantId, amount);
      } catch (error: any) {
        if (error.message.includes('Insufficient funds')) {
          throw new UserInputError(error.message);
        }
        throw new ApolloError(`Payment failed: ${error.message}`, 'PAYMENT_FAILED');
      }
  },

  /**
   * Type-specific Resolvers: Resolve fields on custom types.
   * These are called when a field on a specific type (e.g., `User.cards`) is requested.
   */
  User: {
    /**
     * Resolve the `cards` field for a User object.
     * `parent` argument here is the `User` object itself.
     */
    cards: async (parent: any, args: any, context: IContext) => {
      checkAuth(context);
      // Authorization: A user can only see their own cards, or an admin can see any user's cards.
      if (parent.id !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view these cards.');
      }
      return cardService.listCardsForUser(parent.id);
    },
    // Example: If a 'password' field ever accidentally surfaces from the service layer,
    // you can explicitly nullify it here before sending to the client.
    // password: (parent: any) => null,
  },

  Card: {
    /**
     * Resolve the `owner` field for a Card object.
     * `parent` argument here is the `Card` object itself.
     */
    owner: async (parent: any, args: any, context: IContext) => {
      checkAuth(context);
      // Authorization: Ensure the user owns the card or is an admin before revealing owner details
      if (parent.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view the owner of this card.');
      }
      const owner = await userService.getUserById(parent.userId);
      if (!owner) {
        throw new ApolloError('Owner not found for this card.', 'OWNER_NOT_FOUND');
      }
      const { password, ...ownerWithoutPassword } = owner; // Omit password for security
      return ownerWithoutPassword;
    },

    /**
     * Resolve the `transactions` field for a Card object.
     * `parent` argument here is the `Card` object itself.
     */
    transactions: async (parent: any, args: any, context: IContext) => {
      checkAuth(context);
      // Authorization: Ensure the user owns the card or is an admin before revealing transactions
      if (parent.userId !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new AuthorizationError('You are not authorized to view transactions for this card.');
      }
      return transactionService.getTransactionsByCardId(parent.id);
    },
  },

  // If you have custom scalar types defined in your GraphQL schema (e.g., `Date`, `JSON`),
  // you would provide their serialization/deserialization logic here.
  // Example for a custom Date scalar:
  // Date: new GraphQLScalarType({
  //   name: 'Date',
  //   description: 'Date custom scalar type',
  //   parseValue(value) {
  //     return new Date(value); // Value from the client
  //   },
  //   serialize(value) {
  //     return value.toISOString(); // Value sent to the client (ISO 8601 string)
  //   },
  //   parseLiteral(ast) {
  //     if (ast.kind === Kind.STRING) { // Assuming date is passed as string
  //       return new Date(ast.value);
  //     }
  //     return null;
  //   },
  // }),
};

export default resolvers;

}
}
}
}
}
}
}
}
