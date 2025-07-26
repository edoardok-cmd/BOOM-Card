// Central export for all services
export { boomApi, BoomApiService } from './boomApi';
export { authService } from './authService';
export { partnerService } from './partnerService';
export { subscriptionService } from './subscriptionService';
export { userService } from './userService';

// Re-export types used by services
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthTokens,
  Partner,
  PartnerFilters,
  PartnerCategory,
  City,
  SubscriptionPlan,
  Subscription,
  Transaction,
  Activity,
  Achievement,
  Favorite,
  UserStats,
  ApiResponse,
  PaginatedResponse,
  ContactForm,
  ReviewForm,
  QRCodeData,
  ConnectedAccount,
  ApiError
} from '../types';

// Re-export error utilities
export { AppError, ErrorTypes, parseApiError, showErrorToast } from '../utils/errorHandler';