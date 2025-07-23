# Users API Examples

## Authentication

### Register a New User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359888123456",
  "language": "en",
  "marketingConsent": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456789",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+359888123456",
      "language": "en",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456789",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "subscription": {
        "status": "active",
        "plan": "premium",
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## User Profile

### Get Current User Profile

```http
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+359888123456",
    "language": "en",
    "emailVerified": true,
    "phoneVerified": false,
    "profileImage": "https://cdn.boomcard.bg/users/usr_123456789/profile.jpg",
    "preferences": {
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "categories": ["restaurants", "spas", "entertainment"]
    },
    "subscription": {
      "id": "sub_987654321",
      "status": "active",
      "plan": "premium",
      "startDate": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-12-31T23:59:59Z",
      "autoRenew": true
    },
    "stats": {
      "totalSavings": 1250.50,
      "totalTransactions": 45,
      "memberSince": "2024-01-01T00:00:00Z",
      "favoritePartners": 12
    }
  }
}
```

### Update User Profile

```http
PATCH /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+359888999888",
  "language": "bg",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": true
    },
    "categories": ["restaurants", "hotels", "entertainment", "spas"]
  }
}
```

### Upload Profile Image

```http
POST /api/v1/users/me/avatar
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

{
  "avatar": [binary file data]
}
```

### Change Password

```http
POST /api/v1/users/me/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

## Email Verification

### Send Verification Email

```http
POST /api/v1/auth/verify-email/send
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Verify Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verify_token_123456789"
}
```

## Password Reset

### Request Password Reset

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_123456789",
  "password": "NewSecurePass789!",
  "confirmPassword": "NewSecurePass789!"
}
```

## User Subscriptions

### Get User Subscriptions

```http
GET /api/v1/users/me/subscriptions
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "current": {
      "id": "sub_987654321",
      "status": "active",
      "plan": {
        "id": "plan_premium",
        "name": "Premium",
        "price": 19.99,
        "currency": "BGN",
        "interval": "month"
      },
      "startDate": "2024-01-01T00:00:00Z",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-01-31T23:59:59Z",
      "cancelAtPeriodEnd": false,
      "paymentMethod": {
        "type": "card",
        "last4": "4242",
        "brand": "visa"
      }
    },
    "history": [
      {
        "id": "sub_876543210",
        "plan": "basic",
        "startDate": "2023-06-01T00:00:00Z",
        "endDate": "2023-12-31T23:59:59Z",
        "status": "expired"
      }
    ]
  }
}
```

### Cancel Subscription

```http
POST /api/v1/users/me/subscriptions/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "reason": "too_expensive",
  "feedback": "The service is great but I can't afford it right now"
}
```

## User Transactions

### Get Transaction History

```http
GET /api/v1/users/me/transactions?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123456789",
        "partnerId": "ptr_987654321",
        "partnerName": "Restaurant Sofia",
        "location": {
          "name": "Main Branch",
          "address": "123 Vitosha Blvd, Sofia"
        },
        "amount": 120.00,
        "discount": 24.00,
        "finalAmount": 96.00,
        "discountPercentage": 20,
        "timestamp": "2024-01-15T19:30:00Z",
        "status": "completed",
        "category": "restaurants"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "summary": {
      "totalAmount": 2500.00,
      "totalSavings": 500.00,
      "transactionCount": 45
    }
  }
}
```

### Get Transaction Details

```http
GET /api/v1/users/me/transactions/txn_123456789
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Favorites

### Get Favorite Partners

```http
GET /api/v1/users/me/favorites
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "fav_123456789",
      "partnerId": "ptr_987654321",
      "partner": {
        "id": "ptr_987654321",
        "name": "Restaurant Sofia",
        "category": "restaurants",
        "logo": "https://cdn.boomcard.bg/partners/ptr_987654321/logo.jpg",
        "discount": 20,
        "rating": 4.5,
        "locations": [
          {
            "id": "loc_123",
            "name": "Main Branch",
            "address": "123 Vitosha Blvd, Sofia",
            "coordinates": {
              "lat": 42.6977,
              "lng": 23.3219
            }
          }
        ]
      },
      "addedAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Add to Favorites

```http
POST /api/v1/users/me/favorites
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "partnerId": "ptr_987654321"
}
```

### Remove from Favorites

```http
DELETE /api/v1/users/me/favorites/ptr_987654321
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Notifications

### Get User Notifications

```http
GET /api/v1/users/me/notifications?unreadOnly=true&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123456789",
        "type": "new_partner",
        "title": {
          "en": "New Partner Added!",
          "bg": "Добавен е нов партньор!"
        },
        "message": {
          "en": "Sky Bar Lounge now offers 25% discount",
          "bg": "Sky Bar Lounge вече предлага 25% отстъпка"
        },
        "data": {
          "partnerId": "ptr_112233445",
          "discount": 25
        },
        "read": false,
        "createdAt": "2024-01-15T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    },
    "unreadCount": 8
  }
}
```

### Mark Notification as Read

```http
PATCH /api/v1/users/me/notifications/notif_123456789/read
Authorization: Bearer eyJhbGciOiJIUzI5NiIs...
```

### Mark All Notifications as Read

```http
POST /api/v1/users/me/notifications/read-all
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## User Settings

### Get Notification Settings

```http
GET /api/v1/users/me/settings/notifications
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "email": {
      "newPartners": true,
      "specialOffers": true,
      "transactionReceipts": true,
      "subscriptionUpdates": true,
      "newsletter": false
    },
    "sms": {
      "specialOffers": false,
      "transactionConfirmations": true,
      "subscriptionExpiry": true
    },
    "push": {
      "newPartners": true,
      "nearbyOffers": true,
      "specialOffers": true,
      "transactionConfirmations": true
    }
  }
}
```

### Update Notification Settings

```http
PATCH /api/v1/users/me/settings/notifications
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "email": {
    "newsletter": true,
    "specialOffers": false
  },
  "push": {
    "nearbyOffers": false
  }
}
```

## Delete Account

### Request Account Deletion

```http
POST /api/v1/users/me/delete-request
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "password": "CurrentPassword123!"