# BOOM Card API v1 Reference

## Base URL
```
https://api.boomcard.bg/v1
```

## Authentication

All API requests require authentication using Bearer tokens in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (30 days) for obtaining new access tokens

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Partner APIs**: 5000 requests per minute per partner

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp for limit reset

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Pagination
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| AUTH_INVALID | 401 | Invalid authentication credentials |
| AUTH_EXPIRED | 401 | Authentication token expired |
| ACCESS_DENIED | 403 | Access forbidden |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359888123456",
  "language": "en",
  "acceptTerms": true,
  "marketingConsent": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/login
Authenticate user and obtain tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "subscription": {
        "active": true,
        "planId": "plan_premium",
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

#### POST /auth/logout
Invalidate current tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123!"
}
```

### User Management

#### GET /users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+359888123456",
    "language": "en",
    "subscription": {
      "active": true,
      "planId": "plan_premium",
      "startDate": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-12-31T23:59:59Z",
      "autoRenew": true
    },
    "stats": {
      "totalSavings": 1250.50,
      "transactionsCount": 45,
      "memberSince": "2023-01-15T00:00:00Z"
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
}
```

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359888123456",
  "language": "bg",
  "preferences": {
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    },
    "categories": ["restaurants", "entertainment"]
  }
}
```

#### PUT /users/password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123!",
  "newPassword": "newSecurePassword123!"
}
```

#### DELETE /users/account
Delete user account.

**Request Body:**
```json
{
  "password": "currentPassword123!",
  "reason": "no_longer_needed",
  "feedback": "Optional feedback text"
}
```

### Partners

#### GET /partners
Get list of all partners with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `subcategory` (string): Filter by subcategory
- `city` (string): Filter by city
- `search` (string): Search in name and description
- `minDiscount` (integer): Minimum discount percentage
- `maxDiscount` (integer): Maximum discount percentage
- `lat` (float): Latitude for location-based search
- `lng` (float): Longitude for location-based search
- `radius` (integer): Radius in km for location search (default: 10)
- `sort` (string): Sort by: relevance, name, discount, rating, distance
- `tags` (array): Filter by tags

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prt_123456",
      "name": "Restaurant Sofia",
      "slug": "restaurant-sofia",
      "category": "food_drink",
      "subcategory": "fine_dining",
      "description": {
        "en": "Fine dining restaurant in the heart of Sofia",
        "bg": "Ресторант за изискана кухня в сърцето на София"
      },
      "logo": "https://cdn.boomcard.bg/partners/prt_123456/logo.jpg",
      "images": [
        "https://cdn.boomcard.bg/partners/prt_123456/img1.jpg",
        "https://cdn.boomcard.bg/partners/prt_123456/img2.jpg"
      ],
      "discount": {
        "percentage": 15,
        "conditions": {
          "en": "Valid for food only, not applicable with other offers",
          "bg": "Валидно само за храна, не се комбинира с други оферти"
        }
      },
      "locations": [
        {
          "id": "loc_123",
          "address": "123 Main St, Sofia",
          "city": "Sofia",
          "postalCode": "1000",
          "coordinates": {
            "lat": 42.6977,
            "lng": 23.3219
          },
          "phone": "+359888123456",
          "workingHours": {
            "monday": "10:00-22:00",
            "tuesday": "10:00-22:00",
            "wednesday": "10:00-22:00",
            "thursday": "10:00-22:00",
            "friday": "10:00-23:00",
            "saturday": "10:00-23:00",
            "sunday": "11:00-21:00"
          }
        }
      ],
      "tags": ["fine_dining", "bulgarian_cuisine", "romantic"],
      "rating": {
        "average": 4.5,
        "count": 234
      },
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /partners/{id}
Get detailed partner information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prt_123456",
    "name": "Restaurant Sofia",
    "slug": "restaurant-sofia",
    "category": "food_drink",
    "subcategory": "fine_dining",
    "description": {
      "en": "Fine dining restaurant...",
      "bg": "Ресторант за изискана кухня..."
    },
    "extendedDescription": {
      "en": "Extended description with more details...",
      "bg": "Разширено описание с повече детайли..."
    },
    "logo": "https://cdn.boomcard.bg/partners/prt_123456/logo.jpg",
    "images": [],
    "videos": [],
    "discount": {
      "percentage": 15,
      "conditions": {},
      "validUntil": "2024-12-31T23:59:59Z"
    },
    "locations": [],
    "tags": [],
    "rating": {},
    "reviews": {
      "recent": [],
      "stats": {
        "5": 150,
        "4": 50,
        "3": 20,
        "2": 10,
        "1": 4
      }
    },
    "amenities": ["wifi", "parking", "wheelchair_accessible"],
    "socialMedia": {
      "facebook": "https://facebook.com/restaurantsofia",
      "instagram": "https://instagram.com/restaurantsofia"
    },
    "active": true,
    "joinedAt": "2023-01-15T00:00:00Z"
  }
}
```

#### GET /partners/search
Advanced partner search with full-text search capabilities.

**Request Body:**
```json
{
  "query": "italian pizza",
  "filters": {
    "categories": ["food_drink"],
    "cities": ["Sofia", "Plovdiv"],
    "priceRange": {
      "min": 10,
      "max": 50
    },
    "rating": {
      "min": 4.0
    },
    "amenities": ["wifi", "parking"],
    "dietaryOptions": ["vegan", "gluten_free"]
  },
  "location": {
    "lat": 42.6977,
    "lng": 23.3219,
    "radius": 5
  },
  "sort": {
    "field": "relevance",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

### Transactions

#### POST /transactions/initiate
Initiate a discount transaction at partner location.

**Request Body:**
```json
{
  "partnerId": "prt_123456",
  "locationId": "loc_123",
  "amount": 100.00,
  "currency": "BGN",
  "items": [
    {
      "name": "Main Course",
      "quantity": 2,
      "price": 35.00
    },
    {
      "name": "Dessert",
      "quantity": 2,
      "price": 15.00
    }
  ]
}
```

**Response:**
```json
{
  "success": 