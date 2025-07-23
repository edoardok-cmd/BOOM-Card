import { gql } from 'apollo-server-express';
import { makeExecutableSchema, GraphQLSchema } from 'graphql-tools';

// TypeScript Interfaces and Types

// User related
export interface IUser {
    id: string;
    username: string;
    email: string;
    role: 'PLAYER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}

// Card related
export interface ICard {
    id: string;
    name: string;
    description: string;
    cost: number; // e.g., mana, energy
    attack?: number; // Optional for non-creature cards (spells, items)
    defense?: number; // Optional for non-creature cards
    type: 'CREATURE' | 'SPELL' | 'ITEM';
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

// Deck related
export interface IDeck {
    id: string;
    name: string;
    userId: string; // Owner of the deck
    cardIds: string[]; // IDs of cards in the deck
    cardCount: number; // Redundant but useful for queries
    createdAt: Date;
    updatedAt: Date;
}

// Game session related
export interface IGameSession {
    id: string;
    player1Id: string;
    player2Id: string;
    currentPlayerId: string; // Whose turn it is
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    winnerId?: string; // ID of the winner, if game is completed
    turnNumber: number;
    createdAt: Date;
    updatedAt: Date;
}

// Transaction/Marketplace related
export interface ITransaction {
    id: string;
    userId: string;
    cardId?: string; // If buying/selling a specific card
    amount: number; // Price or quantity
    type: 'BUY' | 'SELL' | 'REWARD';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
}

// Authentication Payload
export interface IAuthPayload {
    token: string;
    user: IUser;
}

// Generic Interfaces for GraphQL Arguments/Inputs
export interface IPaginationArgs {
    skip?: number;
    take?: number;
}

export interface IOrderByArgs {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface IStringFilterArgs {
    equals?: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
}

export interface INumberFilterArgs {
    equals?: number;
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
}

// GraphQL Context Interface (for resolvers)
export interface IGraphQLContext {
    user?: IUser; // The currently authenticated user, if any
    // Placeholder for data sources (e.g., db, redis) which will be injected
}

// Type aliases for GraphQL Enums (for type safety in TypeScript resolvers)
export type UserRole = 'PLAYER' | 'ADMIN';
export type CardType = 'CREATURE' | 'SPELL' | 'ITEM';
export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type GameStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type TransactionType = 'BUY' | 'SELL' | 'REWARD';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type OrderDirection = 'ASC' | 'DESC';

// Constants and Configuration

// Pagination defaults and limits
export const DEFAULT_PAGINATION_TAKE = 20;
export const MAX_PAGINATION_TAKE = 100;

// Game-specific constants
export const MAX_CARDS_PER_DECK = 30; // A typical deck size in card games
export const STARTING_HAND_SIZE = 7;
export const MAX_PLAYER_HEALTH = 20;

// Authentication constants
export const JWT_EXPIRES_IN = '7d';

// Decorators or Metadata (Not typically used with raw graphql-tools)
// (This section is intentionally empty as graphql-tools does not use decorators like TypeGraphQL)

// Middleware functions for authentication and authorization
const authenticated = (resolver: Function) => (parent: any, args: any, context: IGraphQLContext, info: any) => {
  if (!context.userId) {
    throw new AuthenticationError('Not authenticated. Please log in.');
  }
  return resolver(parent, args, context, info);
};

const authorized = (roles: string[]) => (resolver: Function) => async (parent: any, args: any, context: IGraphQLContext, info: any) => {
  if (!context.userId) {
    throw new AuthenticationError('Not authenticated. Please log in.');
  }
  const user = await context.userService.getUserById(context.userId);
  if (!user || !user.roles || !roles.some(role => user.roles.includes(role))) {
    throw new ForbiddenError('You are not authorized to perform this action.');
  }
  return resolver(parent, args, context, info);
};

export const resolvers = {
  Query: {
    me: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      return context.userService.getUserById(context.userId);
    }),

    user: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      const currentUser = await context.userService.getUserById(context.userId); // Fetch current user to check roles
      if (!user || (user.id !== context.userId && !currentUser?.roles.includes('ADMIN'))) {
        throw new ForbiddenError('You are not authorized to view this user profile.');
      }
      return user;
    }),

    users: authenticated(authorized(['ADMIN'])(async (parent: any, args: any, context: IGraphQLContext) => {
      return context.userService.getAllUsers();
    })),

    card: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      const card = await context.cardService.getCardById(id);
      if (!card || (card.userId !== context.userId && !currentUser?.roles.includes('ADMIN'))) {
        throw new ForbiddenError('Card not found or you do not have access.');
      }
      return card;
    }),

    cards: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      return context.cardService.getCardsByUserId(context.userId);
    }),

    transaction: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      const transaction = await context.transactionService.getTransactionById(id);
      if (!transaction) {
        throw new UserInputError('Transaction not found.');
      }
      if (!card || (card.userId !== context.userId && !currentUser?.roles.includes('ADMIN'))) {
        throw new ForbiddenError('Transaction not found or you do not have access.');
      }
      return transaction;
    }),

    transactions: authenticated(async (parent: any, { cardId }: { cardId?: string }, context: IGraphQLContext) => {
      if (cardId) {
        if (!card || (card.userId !== context.userId && !currentUser?.roles.includes('ADMIN'))) {
          throw new ForbiddenError('Card not found or you do not have access to its transactions.');
        }
        return context.transactionService.getTransactionsByCardId(cardId);
      }
      const userCards = await context.cardService.getCardsByUserId(context.userId);
      const cardIds = userCards.map((card: any) => card.id);
      return context.transactionService.getTransactionsByCardIds(cardIds);
    }),
  },

  Mutation: {
    login: async (parent: any, { email, password }: any, context: IGraphQLContext) => {
      const { user, token } = await context.authService.login(email, password);
      return { user, token };
    },

    createUser: async (parent: any, { input }: any, context: IGraphQLContext) => {
      return context.userService.createUser(input);
    },

    updateUser: authenticated(async (parent: any, { id, input }: any, context: IGraphQLContext) => {
      if (id !== context.userId) {
        if (!currentUser?.roles.includes('ADMIN')) {
          throw new ForbiddenError('You are not authorized to update this user.');
        }
      return context.userService.updateUser(id, input);
    }),

    deleteUser: authenticated(authorized(['ADMIN'])(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      if (id === context.userId) {
        throw new UserInputError('Cannot delete your own account via this mutation. Please use a self-deactivation feature.');
      }
      return context.userService.deleteUser(id);
    })),

    createCard: authenticated(async (parent: any, { input }: any, context: IGraphQLContext) => {
      return context.cardService.createCard({ ...input, userId: context.userId });
    }),

    updateCard: authenticated(async (parent: any, { id, input }: any, context: IGraphQLContext) => {
      if (!card || card.userId !== context.userId) {
        throw new ForbiddenError('Card not found or you do not have permission to update it.');
      }
      return context.cardService.updateCard(id, input);
    }),

    deleteCard: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      if (!card || card.userId !== context.userId) {
        throw new ForbiddenError('Card not found or you do not have permission to delete it.');
      }
      return context.cardService.deleteCard(id);
    }),

    activateCard: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      if (!card || card.userId !== context.userId) {
        throw new ForbiddenError('Card not found or you do not have permission.');
      }
      return context.cardService.activateCard(id);
    }),

    deactivateCard: authenticated(async (parent: any, { id }: { id: string }, context: IGraphQLContext) => {
      if (!card || card.userId !== context.userId) {
        throw new ForbiddenError('Card not found or you do not have permission.');
      }
      return context.cardService.deactivateCard(id);
    }),

    loadCard: authenticated(async (parent: any, { id, amount }: { id: string, amount: number }, context: IGraphQLContext) => {
      if (!card || (card.userId !== context.userId && !currentUser?.roles.includes('ADMIN'))) {
        throw new ForbiddenError('Card not found or you do not have permission to load funds onto it.');
      }
      if (amount <= 0) {
        throw new UserInputError('Amount must be positive.');
      }
      return context.cardService.loadCardFunds(id, amount);
    }),

    recordTransaction: authenticated(async (parent: any, { input }: any, context: IGraphQLContext) => {
      const { cardId, type, amount, description, merchantName } = input;

      if (amount <= 0) {
        throw new UserInputError('Transaction amount must be positive.');
      }

      if (!card || card.userId !== context.userId) {
        throw new ForbiddenError('Card not found or you do not have permission to use it for transactions.');
      }
      if (!card.isActive) {
        throw new UserInputError('Card is not active and cannot be used for transactions.');
      }
      if (type === 'DEBIT' && card.balance < amount) {
        throw new UserInputError('Insufficient funds on the card for this transaction.');
      }

      return context.transactionService.recordTransaction(cardId, type, amount, description, merchantName);
    }),
  },

  User: {
    cards: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      if (parent.id !== context.userId && !currentUser?.roles.includes('ADMIN')) {
        throw new ForbiddenError('You are not authorized to view cards for this user.');
      }
      return context.cardService.getCardsByUserId(parent.id);
    }),
    transactions: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      if (parent.id !== context.userId && !currentUser?.roles.includes('ADMIN')) {
        throw new ForbiddenError('You are not authorized to view transactions for this user.');
      }
      return context.transactionService.getTransactionsByCardIds(cardIds);
    }),
  },

  Card: {
    user: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      if (parent.userId !== context.userId && !currentUser?.roles.includes('ADMIN')) {
        throw new ForbiddenError('You are not authorized to view the user for this card.');
      }
      return context.userService.getUserById(parent.userId);
    }),
    transactions: authenticated(async (parent: any, args: any, context: IGraphQLContext) => {
      if (parent.userId !== context.userId && !currentUser?.roles.includes('ADMIN')) {
        throw new ForbiddenError('You are not authorized to view transactions for this card.');
      }
      return context.transactionService.getTransactionsByCardId(parent.id);
    }),
  },
};

}
