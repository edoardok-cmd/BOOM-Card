# Partners API Documentation

## Overview

The Partners API provides endpoints for managing business partners (restaurants, hotels, spas, entertainment venues) on the BOOM Card platform. This includes partner registration, profile management, offer creation, and analytics access.

## Base URL

```
Production: https://api.boomcard.bg/v1
Staging: https://staging-api.boomcard.bg/v1
```

## Authentication

All partner endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- Default: 100 requests per minute per API key
- Bulk operations: 10 requests per minute
- Analytics endpoints: 50 requests per minute

## Endpoints

### Partner Registration

#### POST /partners/register

Register a new partner business.

**Request Body:**

```json
{
  "businessName": "string",
  "businessNameEn": "string",
  "registrationNumber": "string",
  "vatNumber": "string",
  "category": "restaurant|hotel|spa|entertainment",
  "subcategory": "string",
  "contactPerson": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "position": "string"
  },
  "address": {
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "bankDetails": {
    "bankName": "string",
    "iban": "string",
    "swift": "string"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "partnerId": "string",
    "status": "pending_verification",
    "verificationToken": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Partner Authentication

#### POST /partners/login

Authenticate partner and receive access token.

**Request Body:**

```json
{
  "email": "string",
  "password": "string",
  "remember": "boolean"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600,
    "partner": {
      "id": "string",
      "businessName": "string",
      "email": "string",
      "status": "active"
    }
  }
}
```

#### POST /partners/refresh-token

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

### Partner Profile

#### GET /partners/:partnerId

Get partner profile details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "businessName": "string",
    "businessNameEn": "string",
    "category": "restaurant",
    "subcategory": "fine_dining",
    "description": "string",
    "descriptionEn": "string",
    "logo": "string",
    "images": ["string"],
    "contact": {
      "phone": "string",
      "email": "string",
      "website": "string"
    },
    "address": {
      "street": "string",
      "city": "string",
      "postalCode": "string",
      "coordinates": {
        "lat": "number",
        "lng": "number"
      }
    },
    "operatingHours": {
      "monday": { "open": "09:00", "close": "22:00" },
      "tuesday": { "open": "09:00", "close": "22:00" },
      "wednesday": { "open": "09:00", "close": "22:00" },
      "thursday": { "open": "09:00", "close": "22:00" },
      "friday": { "open": "09:00", "close": "23:00" },
      "saturday": { "open": "10:00", "close": "23:00" },
      "sunday": { "open": "10:00", "close": "21:00" }
    },
    "features": ["wifi", "parking", "petFriendly", "wheelchair"],
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string"
    },
    "rating": {
      "average": 4.5,
      "count": 128
    },
    "status": "active",
    "verifiedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /partners/:partnerId

Update partner profile.

**Request Body:**

```json
{
  "businessName": "string",
  "businessNameEn": "string",
  "description": "string",
  "descriptionEn": "string",
  "contact": {
    "phone": "string",
    "email": "string",
    "website": "string"
  },
  "operatingHours": "object",
  "features": ["string"],
  "socialMedia": "object"
}
```

### Partner Locations

#### GET /partners/:partnerId/locations

Get all locations for a partner.

**Response:**

```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": "string",
        "name": "string",
        "address": "object",
        "isMainLocation": true,
        "operatingHours": "object",
        "contact": "object"
      }
    ],
    "total": 3
  }
}
```

#### POST /partners/:partnerId/locations

Add a new location.

**Request Body:**

```json
{
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "operatingHours": "object",
  "contact": {
    "phone": "string",
    "email": "string"
  }
}
```

### Partner Offers

#### GET /partners/:partnerId/offers

Get all offers for a partner.

**Query Parameters:**

- `status`: active|inactive|scheduled|expired
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `sortBy`: createdAt|discount|usageCount

**Response:**

```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "string",
        "title": "string",
        "titleEn": "string",
        "description": "string",
        "descriptionEn": "string",
        "discountType": "percentage|fixed",
        "discountValue": 20,
        "category": "string",
        "conditions": ["string"],
        "validFrom": "2024-01-01T00:00:00Z",
        "validUntil": "2024-12-31T23:59:59Z",
        "daysOfWeek": [1, 2, 3, 4, 5],
        "timeRestrictions": {
          "from": "11:00",
          "to": "15:00"
        },
        "maxUsagePerUser": 5,
        "totalUsageLimit": 1000,
        "currentUsage": 245,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### POST /partners/:partnerId/offers

Create a new offer.

**Request Body:**

```json
{
  "title": "string",
  "titleEn": "string",
  "description": "string",
  "descriptionEn": "string",
  "discountType": "percentage|fixed",
  "discountValue": "number",
  "category": "string",
  "conditions": ["string"],
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "timeRestrictions": {
    "from": "11:00",
    "to": "15:00"
  },
  "maxUsagePerUser": "number",
  "totalUsageLimit": "number",
  "autoRenew": false,
  "locations": ["locationId"]
}
```

#### PUT /partners/:partnerId/offers/:offerId

Update an existing offer.

#### DELETE /partners/:partnerId/offers/:offerId

Delete an offer.

### Partner Analytics

#### GET /partners/:partnerId/analytics/overview

Get analytics overview.

**Query Parameters:**

- `period`: today|week|month|year|custom
- `from`: date (YYYY-MM-DD)
- `to`: date (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "metrics": {
      "totalScans": 1245,
      "uniqueUsers": 892,
      "totalSavings": 24500.50,
      "averageDiscount": 19.7,
      "conversionRate": 72.5
    },
    "trends": {
      "scansChange": 15.2,
      "usersChange": 12.8,
      "savingsChange": 18.9
    }
  }
}
```

#### GET /partners/:partnerId/analytics/transactions

Get detailed transaction history.

**Query Parameters:**

- `page`: number
- `limit`: number
- `from`: date
- `to`: date
- `offerId`: string

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "string",
        "userId": "string",
        "offerId": "string",
        "offerTitle": "string",
        "originalAmount": 150.00,
        "discountAmount": 30.00,
        "finalAmount": 120.00,
        "timestamp": "2024-01-01T14:30:00Z",
        "location": "string",
        "status": "completed"
      }
    ],
    "summary": {
      "totalTransactions": 245,
      "totalOriginalAmount": 36750.00,
      "totalDiscountGiven": 7350.00,
      "totalFinalAmount": 29400.00
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "pages": 5
    }
  }
}
```

#### GET /partners/:partnerId/analytics/demographics

Get user demographics data.

**Response:**

```json
{
  "success": true,
  "data": {
    "ageGroups": {
      "18-24": 15.2,
      "25-34": 32.8,
      "35-44": 28.5,
      "45-54": 18.3,
      "55+": 5.2
    },
    "gender": {
      "male": 48.5,
      "female": 51.5
    },
    "topCities": [
      { "city": "Sofia", "percentage": 45.2 },
      { "city": "Plovdiv", "percentage": 18.7 },
      { "city": "Varna", "percentage": 12.3 }
    ],
    "visitFrequency": {
      "firstTime": 35.2,
      "occasional": 42.8,
      "regular": 22.0
    }
  }
}
```

### Partner Staff Management

#### GET /partners/:partnerId/staff

Get all staff members.

**Response:**

```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "manager|cashier|admin",
        "permissions": ["scan_qr", "view_analytics", "manage_offers"],
        "status": "active",
        "lastLogin": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 5
  }
}
```

#### POST /partners/:partnerId/staff

Add a new staff member.

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "manager|cashier|admin",
  "permissions": ["scan_qr", "view_analytics"],
  "locationIds": ["string"]
}
```

### Partner Integrations

#### GET /partners/:partnerId/integrations

Get available integrations.

**Response:**

```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "pos_system",
        "name": "POS System Integration",
        "status": "connected",
        "provider": "SquarePOS",
        "lastSync": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /partners/:partnerId/integrations/pos

Configure POS integration.

**Request Body:**

```json
{
  "provider": "square|clover|toast",
  "apiKey": "string",
  "merchantId": "string",
  "locationIds": ["string"]
}
```

### Partner Notifications

#### GET /partners/:partnerId/notifications

Get partner notifications.

**Query Parameters:**

- `status`: read|unread|all
- `type`: system|transaction|offer|review

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "transaction",
        "title": "New transaction",
        "message": "Customer redeemed 20% discount",
        "data": {
          "transactionId": "string",
          "amount": 120.00
        },
        "read": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### Partner Reviews

#### GET /partners/:partnerId/reviews

Get customer reviews.

**Query Parameters:**

- `rating`: 1-5
- `verified`: boolean
- `sortBy`: recent|rating

**Response:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "userId": "string",
        "userName": "John D.",
        "rating": 5,
        "comment": "Great service and amazing discount!",
        "verifiedPurchase": true,
        "helpfulCount": 12,
        "createdAt": "2024-01-01T00:00:00Z",
        "partnerResponse": {
          "message": "Thank you for your feedback!",
          "respondedAt": "2024-01-02T00:00:00Z"
        }
      }
    ],
    "statistics": {
      "averageRating": 4.5,
      "totalReviews": 128,
      "ratingDistribution": {
        "5": 65,
        "4": 42,
        "3": 15,
        "2": 4,
        "1": 2
      }
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "PARTNER_NOT_F