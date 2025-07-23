# POS API Documentation

## Overview

The BOOM Card POS API enables point-of-sale systems to integrate with the BOOM Card platform for processing discount transactions, validating cards, and managing partner operations.

## Base URL

```
Production: https://api.boomcard.com/v1/pos
Staging: https://staging-api.boomcard.com/v1/pos
```

## Authentication

All API requests require authentication using API keys provided during partner onboarding.

### Headers

```
X-API-Key: your-api-key-here
X-Partner-ID: your-partner-id
Content-Type: application/json
```

## Rate Limiting

- 1000 requests per minute per API key
- 429 status code returned when limit exceeded
- X-RateLimit headers included in responses

## Endpoints

### 1. Validate Card

Validates a BOOM Card before processing a transaction.

**POST** `/validate`

#### Request Body

```json
{
  "cardNumber": "string",
  "qrCode": "string",
  "locationId": "string"
}
```

#### Response

```json
{
  "valid": true,
  "customerId": "cust_123456",
  "customerName": "John Doe",
  "subscriptionStatus": "active",
  "discountPercentage": 15,
  "restrictions": {
    "maxUsagePerDay": 1,
    "usedToday": 0,
    "validUntil": "2024-12-31T23:59:59Z"
  }
}
```

### 2. Process Transaction

Records a discount transaction in the system.

**POST** `/transaction`

#### Request Body

```json
{
  "customerId": "cust_123456",
  "locationId": "loc_789",
  "billAmount": 150.00,
  "discountAmount": 22.50,
  "finalAmount": 127.50,
  "items": [
    {
      "name": "Grilled Salmon",
      "quantity": 1,
      "unitPrice": 85.00,
      "category": "main_course"
    },
    {
      "name": "Caesar Salad",
      "quantity": 1,
      "unitPrice": 45.00,
      "category": "appetizer"
    }
  ],
  "posTransactionId": "POS-2024-001234",
  "timestamp": "2024-01-15T18:30:00Z"
}
```

#### Response

```json
{
  "transactionId": "txn_abc123",
  "status": "success",
  "discountApplied": 22.50,
  "pointsEarned": 127,
  "customerBalance": {
    "points": 1250,
    "tier": "gold"
  },
  "receipt": {
    "url": "https://receipts.boomcard.com/txn_abc123",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### 3. Cancel Transaction

Cancels a previously processed transaction.

**POST** `/transaction/{transactionId}/cancel`

#### Request Body

```json
{
  "reason": "customer_request",
  "posTransactionId": "POS-2024-001234"
}
```

#### Response

```json
{
  "transactionId": "txn_abc123",
  "status": "cancelled",
  "refundAmount": 22.50,
  "pointsDeducted": 127,
  "cancelledAt": "2024-01-15T19:00:00Z"
}
```

### 4. Get Location Settings

Retrieves current discount settings for a location.

**GET** `/location/{locationId}/settings`

#### Response

```json
{
  "locationId": "loc_789",
  "name": "Restaurant Sofia Center",
  "settings": {
    "discountPercentage": 15,
    "activeHours": {
      "monday": {"open": "11:00", "close": "23:00"},
      "tuesday": {"open": "11:00", "close": "23:00"},
      "wednesday": {"open": "11:00", "close": "23:00"},
      "thursday": {"open": "11:00", "close": "23:00"},
      "friday": {"open": "11:00", "close": "00:00"},
      "saturday": {"open": "11:00", "close": "00:00"},
      "sunday": {"open": "12:00", "close": "22:00"}
    },
    "blackoutDates": [
      "2024-12-24",
      "2024-12-25",
      "2024-12-31"
    ],
    "restrictions": {
      "minBillAmount": 30.00,
      "maxDiscountAmount": 100.00,
      "excludedCategories": ["alcohol", "tobacco"]
    }
  }
}
```

### 5. Daily Report

Retrieves transaction summary for a specific date.

**GET** `/reports/daily`

#### Query Parameters

- `locationId` (required): Location identifier
- `date` (required): Date in YYYY-MM-DD format

#### Response

```json
{
  "date": "2024-01-15",
  "locationId": "loc_789",
  "summary": {
    "totalTransactions": 45,
    "totalBillAmount": 6750.00,
    "totalDiscountGiven": 1012.50,
    "averageTransactionValue": 150.00,
    "uniqueCustomers": 42
  },
  "hourlyBreakdown": [
    {
      "hour": "12:00-13:00",
      "transactions": 12,
      "revenue": 1800.00,
      "discounts": 270.00
    }
  ],
  "topItems": [
    {
      "name": "Grilled Salmon",
      "quantity": 15,
      "revenue": 1275.00
    }
  ]
}
```

### 6. Customer Lookup

Search for customer by phone or email.

**GET** `/customer/lookup`

#### Query Parameters

- `phone`: Customer phone number
- `email`: Customer email address

#### Response

```json
{
  "found": true,
  "customer": {
    "id": "cust_123456",
    "name": "John Doe",
    "cardNumber": "BOOM-2024-123456",
    "subscriptionStatus": "active",
    "tier": "gold",
    "joinDate": "2023-06-15",
    "totalSavings": 2450.00,
    "visitCount": 85
  }
}
```

## Webhooks

Configure webhook endpoints to receive real-time notifications.

### Available Events

- `transaction.completed`
- `transaction.cancelled`
- `card.activated`
- `card.deactivated`
- `settings.updated`

### Webhook Payload

```json
{
  "event": "transaction.completed",
  "timestamp": "2024-01-15T18:30:00Z",
  "data": {
    "transactionId": "txn_abc123",
    "locationId": "loc_789",
    "customerId": "cust_123456",
    "amount": 127.50,
    "discount": 22.50
  }
}
```

### Webhook Security

All webhooks include a signature header for verification:

```
X-Boom-Signature: sha256=d2e8a5e5c8b9a7f6e4d3c2b1a0...
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_CARD",
    "message": "The provided card number is invalid or expired",
    "details": {
      "cardNumber": "BOOM-2024-999999",
      "expiredAt": "2023-12-31"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | Invalid or missing API key |
| `INVALID_CARD` | 400 | Card number invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | API key lacks required permissions |
| `LOCATION_NOT_FOUND` | 404 | Location ID not found |
| `DUPLICATE_TRANSACTION` | 409 | Transaction already processed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Integration Testing

### Test Environment

Use the staging environment for integration testing:

```
Base URL: https://staging-api.boomcard.com/v1/pos
Test API Key: test_pk_1234567890
```

### Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| `BOOM-TEST-SUCCESS` | Valid card, active subscription |
| `BOOM-TEST-EXPIRED` | Expired subscription |
| `BOOM-TEST-INVALID` | Invalid card |
| `BOOM-TEST-LIMIT` | Daily limit reached |

## SDK Libraries

Official SDKs available for:

- Node.js: `npm install @boomcard/pos-sdk`
- Python: `pip install boomcard-pos`
- PHP: `composer require boomcard/pos-sdk`
- Java: Maven dependency available

## Support

- Technical Documentation: https://developers.boomcard.com
- API Status: https://status.boomcard.com
- Support Email: api-support@boomcard.com
- Partner Portal: https://partners.boomcard.com
