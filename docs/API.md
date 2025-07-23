# BOOM Card API Documentation

## Overview

The BOOM Card API provides programmatic access to the discount card platform, enabling integration with POS systems, partner applications, and third-party services. All API endpoints use RESTful conventions and return JSON responses.

## Base URL

```
Production: https://api.boomcard.bg/v1
Staging: https://staging-api.boomcard.bg/v1
```

## Authentication

The API uses OAuth 2.0 and API key authentication depending on the endpoint type.

### API Key Authentication

For POS integrations and partner systems:

```
Authorization: Bearer YOUR_API_KEY
```

### OAuth 2.0

For user-authenticated requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Rate Limiting

- Standard tier: 1,000 requests per hour
- Premium tier: 10,000 requests per hour
- Enterprise tier: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Common Response Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "request_id": "req_123456789"
  }
}
```

## Endpoints

### Authentication

#### POST /auth/login

Authenticate user and receive access tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_123456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout

Invalidate current access token.

### Users

#### GET /users/profile

Get current user profile.

**Response:**
```json
{
  "id": "usr_123456",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+359887123456",
  "language": "bg",
  "subscription": {
    "id": "sub_789012",
    "status": "active",
    "plan": "premium",
    "expires_at": "2024-12-31T23:59:59Z"
  },
  "preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "categories": ["restaurants", "hotels", "spa"]
  }
}
```

#### PUT /users/profile

Update user profile.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+359887123456",
  "language": "en",
  "preferences": {
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

### Partners

#### GET /partners

List all partners with filtering and pagination.

**Query Parameters:**
- `category` - Filter by category (restaurants, hotels, spa, entertainment)
- `city` - Filter by city
- `discount_min` - Minimum discount percentage
- `lat` & `lng` - Coordinates for location-based search
- `radius` - Search radius in km (default: 10)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (name, discount, distance, rating)
- `order` - Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "prt_123456",
      "name": "Restaurant Sofia",
      "category": "restaurants",
      "subcategory": "fine_dining",
      "discount": 15,
      "description": {
        "bg": "Изискан ресторант в центъра на София",
        "en": "Fine dining restaurant in Sofia center"
      },
      "images": [
        {
          "url": "https://cdn.boomcard.bg/partners/123456/main.jpg",
          "type": "main"
        }
      ],
      "location": {
        "address": "ul. Vitosha 15, Sofia",
        "city": "Sofia",
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        }
      },
      "rating": {
        "average": 4.5,
        "count": 234
      },
      "amenities": ["wifi", "parking", "outdoor_seating"],
      "working_hours": {
        "monday": { "open": "10:00", "close": "23:00" },
        "tuesday": { "open": "10:00", "close": "23:00" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /partners/:id

Get detailed partner information.

**Response:**
```json
{
  "id": "prt_123456",
  "name": "Restaurant Sofia",
  "full_details": true,
  "menu_url": "https://boomcard.bg/partners/123456/menu",
  "booking_enabled": true,
  "contact": {
    "phone": "+359888123456",
    "email": "contact@restaurant.bg",
    "website": "https://restaurant.bg"
  }
}
```

### Transactions

#### POST /transactions/redeem

Process discount redemption at partner location.

**Request:**
```json
{
  "user_card_number": "BOOM123456789",
  "partner_id": "prt_123456",
  "amount": 150.00,
  "currency": "BGN",
  "pos_terminal_id": "POS_001",
  "items": [
    {
      "name": "Main Course",
      "quantity": 2,
      "price": 75.00
    }
  ]
}
```

**Response:**
```json
{
  "transaction_id": "trx_987654321",
  "status": "completed",
  "discount_applied": 22.50,
  "final_amount": 127.50,
  "savings": {
    "amount": 22.50,
    "percentage": 15
  },
  "receipt": {
    "url": "https://api.boomcard.bg/receipts/trx_987654321",
    "qr_code": "data:image/png;base64,..."
  }
}
```

#### GET /transactions

Get user transaction history.

**Query Parameters:**
- `start_date` - Filter from date (ISO 8601)
- `end_date` - Filter to date (ISO 8601)
- `partner_id` - Filter by partner
- `status` - Filter by status (completed, pending, failed)

**Response:**
```json
{
  "data": [
    {
      "id": "trx_987654321",
      "date": "2024-01-15T14:30:00Z",
      "partner": {
        "id": "prt_123456",
        "name": "Restaurant Sofia"
      },
      "amount": 150.00,
      "discount": 22.50,
      "final_amount": 127.50,
      "status": "completed"
    }
  ],
  "summary": {
    "total_transactions": 45,
    "total_savings": 450.00,
    "average_discount": 15.5
  }
}
```

### Subscriptions

#### GET /subscriptions/plans

Get available subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "plan_basic",
      "name": {
        "bg": "Основен",
        "en": "Basic"
      },
      "price": {
        "monthly": 9.99,
        "yearly": 99.99,
        "currency": "BGN"
      },
      "features": [
        "10% discount at all partners",
        "Basic support"
      ]
    },
    {
      "id": "plan_premium",
      "name": {
        "bg": "Премиум",
        "en": "Premium"
      },
      "price": {
        "monthly": 19.99,
        "yearly": 199.99,
        "currency": "BGN"
      },
      "features": [
        "15% discount at all partners",
        "Priority support",
        "Exclusive deals"
      ]
    }
  ]
}
```

#### POST /subscriptions

Create or update subscription.

**Request:**
```json
{
  "plan_id": "plan_premium",
  "billing_period": "monthly",
  "payment_method_id": "pm_123456"
}
```

### Analytics

#### GET /analytics/savings

Get user savings analytics.

**Query Parameters:**
- `period` - Time period (day, week, month, year, custom)
- `start_date` - Start date for custom period
- `end_date` - End date for custom period

**Response:**
```json
{
  "period": "month",
  "total_savings": 450.00,
  "transaction_count": 23,
  "average_discount": 15.5,
  "by_category": {
    "restaurants": {
      "savings": 250.00,
      "count": 15
    },
    "hotels": {
      "savings": 200.00,
      "count": 8
    }
  },
  "top_partners": [
    {
      "id": "prt_123456",
      "name": "Restaurant Sofia",
      "savings": 125.00
    }
  ]
}
```

### Partner API

#### POST /partner/transactions/validate

Validate card before transaction.

**Request:**
```json
{
  "card_number": "BOOM123456789",
  "amount": 150.00
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "name": "John Doe",
    "subscription_status": "active"
  },
  "discount": {
    "percentage": 15,
    "amount": 22.50
  }
}
```

#### GET /partner/analytics

Get partner-specific analytics.

**Headers:**
```
X-Partner-ID: prt_123456
Authorization: Bearer PARTNER_API_KEY
```

**Response:**
```json
{
  "period": "month",
  "metrics": {
    "total_transactions": 450,
    "total_revenue": 15000.00,
    "total_discounts_given": 2250.00,
    "unique_customers": 320,
    "average_transaction": 33.33
  },
  "customer_retention": {
    "returning_customers": 45,
    "new_customers": 275
  }
}
```

### Webhooks

Partners can subscribe to webhooks for real-time notifications.

#### Available Events

- `transaction.completed` - Transaction successfully processed
- `transaction.failed` - Transaction failed
- `subscription.created` - New subscription created
- `subscription.cancelled` - Subscription cancelled
- `review.created` - New review posted

#### Webhook Payload

```json
{
  "event": "transaction.completed",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "transaction_id": "trx_987654321",
    "amount": 150.00,
    "discount": 22.50
  }
}
```

#### Webhook Security

All webhooks include HMAC-SHA256 signature in header:

```
X-BOOM-Signature: sha256=abcdef123456...
```

Verify webhook signature:
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}
```

## SDK Libraries

Official SDKs available for:

- JavaScript/TypeScript: `npm install @boomcard/sdk`
- PHP: `composer requir