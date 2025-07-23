# Users API Documentation

## Overview

The Users API provides endpoints for user management, authentication, profile operations, and subscription handling in the BOOM Card platform.

## Base URL

```
https://api.boomcard.com/v1/users
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359888123456",
  "dateOfBirth": "1990-01-15",
  "language": "en",
  "acceptedTerms": true,
  "marketingConsent": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+359888123456",
      "language": "en",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

#### Login

```http
POST /auth/login
```

Authenticates a user and returns access tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "subscriptionStatus": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
```

Refreshes the access token using a refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### Logout

```http
POST /auth/logout
```

Invalidates the current session.

**Headers:**

```
Authorization: Bearer <token>
```

#### Request Password Reset

```http
POST /auth/password/reset-request
```

Initiates password reset process.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /auth/password/reset
```

Resets password using reset token.

**Request Body:**

```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

### User Profile

#### Get Current User Profile

```http
GET /me
```

Returns the authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+359888123456",
    "dateOfBirth": "1990-01-15",
    "language": "en",
    "avatar": "https://cdn.boomcard.com/avatars/usr_1234567890.jpg",
    "emailVerified": true,
    "phoneVerified": false,
    "subscription": {
      "status": "active",
      "plan": "premium",
      "validUntil": "2024-12-31T23:59:59Z",
      "autoRenew": true
    },
    "preferences": {
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "favoriteCategories": ["restaurants", "spa"],
      "dietaryPreferences": ["vegetarian"]
    },
    "stats": {
      "totalSavings": 1250.50,
      "transactionsCount": 45,
      "memberSince": "2023-01-15T10:30:00Z"
    }
  }
}
```

#### Update Profile

```http
PUT /me
```

Updates user profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+359888123456",
  "dateOfBirth": "1990-01-15",
  "language": "bg"
}
```

#### Upload Avatar

```http
POST /me/avatar
```

Uploads user avatar image.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `avatar`: Image file (JPEG, PNG, max 5MB)

#### Delete Avatar

```http
DELETE /me/avatar
```

Removes user avatar.

**Headers:**

```
Authorization: Bearer <token>
```

#### Update Preferences

```http
PUT /me/preferences
```

Updates user preferences.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "favoriteCategories": ["restaurants", "spa", "entertainment"],
  "dietaryPreferences": ["vegetarian", "gluten-free"],
  "communicationLanguage": "bg"
}
```

### Subscription Management

#### Get Subscription Details

```http
GET /me/subscription
```

Returns current subscription details.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "userId": "usr_1234567890",
    "plan": "premium",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-12-31T23:59:59Z",
    "autoRenew": true,
    "paymentMethod": {
      "type": "card",
      "last4": "4242",
      "brand": "visa"
    },
    "features": [
      "unlimited_discounts",
      "premium_partners",
      "early_access",
      "exclusive_events"
    ],
    "usage": {
      "discountsUsed": 45,
      "totalSavings": 1250.50
    }
  }
}
```

#### Subscribe to Plan

```http
POST /me/subscription
```

Creates a new subscription.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "planId": "plan_premium_annual",
  "paymentMethodId": "pm_1234567890",
  "promoCode": "WELCOME20"
}
```

#### Update Subscription

```http
PUT /me/subscription
```

Updates subscription settings.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "autoRenew": false,
  "paymentMethodId": "pm_0987654321"
}
```

#### Cancel Subscription

```http
DELETE /me/subscription
```

Cancels the current subscription.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "reason": "too_expensive",
  "feedback": "Optional feedback text"
}
```

### Transaction History

#### Get User Transactions

```http
GET /me/transactions
```

Returns user's transaction history.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `startDate` (string): Filter by start date (ISO 8601)
- `endDate` (string): Filter by end date (ISO 8601)
- `partnerId` (string): Filter by partner ID
- `category` (string): Filter by category

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "trx_1234567890",
        "userId": "usr_1234567890",
        "partnerId": "ptr_0987654321",
        "partnerName": "Restaurant Sofia",
        "category": "restaurants",
        "originalAmount": 100.00,
        "discountPercentage": 20,
        "discountAmount": 20.00,
        "finalAmount": 80.00,
        "currency": "BGN",
        "status": "completed",
        "qrCodeId": "qr_1234567890",
        "timestamp": "2024-01-15T19:30:00Z",
        "location": {
          "name": "Restaurant Sofia - Center",
          "address": "ul. Vitosha 123, Sofia"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "summary": {
      "totalSavings": 450.50,
      "transactionCount": 45
    }
  }
}
```

### Favorites

#### Get Favorite Partners

```http
GET /me/favorites
```

Returns user's favorite partners.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `category` (string): Filter by category
- `page` (integer): Page number
- `limit` (integer): Items per page

#### Add Favorite

```http
POST /me/favorites
```

Adds a partner to favorites.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "partnerId": "ptr_0987654321"
}
```

#### Remove Favorite

```http
DELETE /me/favorites/:partnerId
```

Removes a partner from favorites.

**Headers:**

```
Authorization: Bearer <token>
```

### Security & Privacy

#### Change Password

```http
PUT /me/password
```

Changes user password.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

#### Get Active Sessions

```http
GET /me/sessions
```

Returns all active sessions.

**Headers:**

```
Authorization: Bearer <token>
```

#### Revoke Session

```http
DELETE /me/sessions/:sessionId
```

Revokes a specific session.

**Headers:**

```
Authorization: Bearer <token>
```

#### Enable Two-Factor Authentication

```http
POST /me/security/2fa/enable
```

Initiates 2FA setup.

**Headers:**

```
Authorization: Bearer <token>
```

#### Disable Two-Factor Authentication

```http
POST /me/security/2fa/disable
```

Disables 2FA.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "password": "CurrentPass123!",
  "code": "123456"
}
```

#### Export User Data

```http
POST /me/data/export
```

Requests user data export (GDPR).

**Headers:**

```
Authorization: Bearer <token>
```

#### Delete Account

```http
DELETE /me
```

Permanently deletes user account.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "password": "CurrentPass123!",
  "reason": "no_longer_needed",
  "feedback": "Optional feedback"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `CONFLI