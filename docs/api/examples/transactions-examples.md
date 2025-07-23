# Transaction API Examples

## Overview

This document provides comprehensive examples for integrating with the BOOM Card Transaction API. All transactions are processed through QR code scanning at partner locations.

## Authentication

All API requests require authentication using Bearer tokens:

```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-API-Version': '1.0'
};
```

## Transaction Flow

### 1. Initialize Transaction (Partner POS)

**POST** `/api/v1/transactions/initialize`

```typescript
// Request
{
  "partnerId": "partner_123456",
  "locationId": "loc_789012",
  "posTerminalId": "term_345678",
  "amount": 150.00,
  "currency": "BGN",
  "items": [
    {
      "name": "Premium Steak Dinner",
      "quantity": 2,
      "unitPrice": 65.00,
      "category": "main_course"
    },
    {
      "name": "House Wine",
      "quantity": 1,
      "unitPrice": 20.00,
      "category": "beverage"
    }
  ],
  "metadata": {
    "tableNumber": "12",
    "serverId": "emp_901234"
  }
}

// Response
{
  "transactionId": "txn_567890123456",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "qrPayload": "boom://txn/567890123456",
  "expiresAt": "2024-01-15T20:30:00Z",
  "discountPercentage": 15,
  "estimatedSavings": 22.50
}
```

### 2. Scan & Validate (Consumer App)

**POST** `/api/v1/transactions/validate`

```typescript
// Request
{
  "qrPayload": "boom://txn/567890123456",
  "userId": "user_123456",
  "deviceId": "device_789012",
  "location": {
    "latitude": 42.6977,
    "longitude": 23.3219
  }
}

// Response
{
  "valid": true,
  "transaction": {
    "id": "txn_567890123456",
    "partner": {
      "id": "partner_123456",
      "name": "The Grand Restaurant",
      "logo": "https://cdn.boomcard.bg/partners/grand-restaurant.png"
    },
    "amount": 150.00,
    "discountAmount": 22.50,
    "finalAmount": 127.50,
    "currency": "BGN",
    "items": [...],
    "expiresIn": 180 // seconds
  }
}
```

### 3. Confirm Transaction (Consumer)

**POST** `/api/v1/transactions/confirm`

```typescript
// Request
{
  "transactionId": "txn_567890123456",
  "userId": "user_123456",
  "confirmationMethod": "pin", // or "biometric"
  "confirmationData": {
    "pin": "1234" // or biometric token
  }
}

// Response
{
  "success": true,
  "transaction": {
    "id": "txn_567890123456",
    "status": "completed",
    "completedAt": "2024-01-15T20:15:30Z",
    "amount": 150.00,
    "discountAmount": 22.50,
    "finalAmount": 127.50,
    "savingsToDate": 450.75,
    "receipt": {
      "url": "https://receipts.boomcard.bg/txn_567890123456",
      "qr": "data:image/png;base64,..."
    }
  }
}
```

### 4. Process Payment (Partner POS)

**POST** `/api/v1/transactions/process-payment`

```typescript
// Request
{
  "transactionId": "txn_567890123456",
  "paymentMethod": "card", // "cash", "card", "mobile"
  "paymentDetails": {
    "lastFourDigits": "1234",
    "cardType": "visa"
  },
  "tipAmount": 12.75
}

// Response
{
  "success": true,
  "payment": {
    "id": "pay_901234567890",
    "transactionId": "txn_567890123456",
    "subtotal": 150.00,
    "discount": 22.50,
    "tip": 12.75,
    "total": 140.25,
    "partnersShare": 119.21, // 85% after commission
    "platformFee": 21.04
  }
}
```

## Transaction Types

### Restaurant Transaction

```typescript
// Full dining experience with split bill support
{
  "type": "restaurant",
  "splitBill": {
    "enabled": true,
    "participants": [
      {
        "userId": "user_123456",
        "amount": 75.00,
        "items": ["item_1", "item_3"]
      },
      {
        "userId": "user_789012",
        "amount": 75.00,
        "items": ["item_2", "item_4"]
      }
    ]
  }
}
```

### Hotel Transaction

```typescript
// Hotel booking with multi-night stay
{
  "type": "hotel",
  "booking": {
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "rooms": [
      {
        "type": "deluxe",
        "guests": 2,
        "ratePerNight": 180.00
      }
    ],
    "extras": [
      {
        "type": "breakfast",
        "quantity": 8,
        "unitPrice": 15.00
      }
    ]
  }
}
```

### Spa Transaction

```typescript
// Spa services with package deals
{
  "type": "spa",
  "services": [
    {
      "id": "srv_massage_90",
      "name": "90-min Full Body Massage",
      "therapist": "emp_345",
      "scheduledAt": "2024-01-20T14:00:00Z"
    }
  ],
  "packages": [
    {
      "id": "pkg_relax_day",
      "includes": ["srv_massage_90", "srv_facial_60", "srv_pool_access"]
    }
  ]
}
```

## Batch Transactions

### Group Booking

**POST** `/api/v1/transactions/batch`

```typescript
// Request
{
  "groupId": "grp_123456",
  "transactions": [
    {
      "userId": "user_123456",
      "items": [...],
      "amount": 85.00
    },
    {
      "userId": "user_789012",
      "items": [...],
      "amount": 92.50
    }
  ],
  "metadata": {
    "occasion": "birthday_party",
    "organizerId": "user_123456"
  }
}

// Response
{
  "batchId": "batch_567890",
  "transactions": [
    {
      "transactionId": "txn_111111",
      "userId": "user_123456",
      "status": "pending"
    },
    {
      "transactionId": "txn_222222",
      "userId": "user_789012",
      "status": "pending"
    }
  ],
  "totalAmount": 177.50,
  "totalDiscount": 26.63,
  "qrCode": "data:image/png;base64,..."
}
```

## Transaction History

### Get User Transactions

**GET** `/api/v1/users/{userId}/transactions`

```typescript
// Query Parameters
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "category": "restaurant",
  "status": "completed",
  "limit": 20,
  "offset": 0
}

// Response
{
  "transactions": [
    {
      "id": "txn_567890123456",
      "date": "2024-01-15T20:15:30Z",
      "partner": {
        "name": "The Grand Restaurant",
        "category": "fine_dining"
      },
      "amount": 150.00,
      "savings": 22.50,
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0
  },
  "summary": {
    "totalSpent": 2340.50,
    "totalSaved": 351.08,
    "averageDiscount": 15
  }
}
```

### Get Partner Transactions

**GET** `/api/v1/partners/{partnerId}/transactions`

```typescript
// Query Parameters
{
  "date": "2024-01-15",
  "locationId": "loc_789012",
  "status": "completed",
  "groupBy": "hour"
}

// Response
{
  "transactions": {
    "summary": {
      "count": 47,
      "totalRevenue": 3560.00,
      "totalDiscounts": 534.00,
      "averageTransaction": 75.74
    },
    "hourly": [
      {
        "hour": "12:00",
        "count": 8,
        "revenue": 620.00
      },
      {
        "hour": "13:00",
        "count": 12,
        "revenue": 980.00
      }
    ]
  }
}
```

## Refunds & Cancellations

### Refund Transaction

**POST** `/api/v1/transactions/{transactionId}/refund`

```typescript
// Request
{
  "reason": "customer_request",
  "amount": 127.50, // full or partial
  "items": ["item_1", "item_3"], // optional for partial refund
  "notes": "Customer allergic reaction"
}

// Response
{
  "refundId": "ref_123456789",
  "transactionId": "txn_567890123456",
  "amount": 127.50,
  "status": "processing",
  "estimatedCompletion": "2024-01-17T12:00:00Z",
  "adjustments": {
    "savingsReversed": 22.50,
    "newLifetimeSavings": 428.25
  }
}
```

### Cancel Pending Transaction

**DELETE** `/api/v1/transactions/{transactionId}`

```typescript
// Request Headers
{
  "X-Cancellation-Reason": "timeout"
}

// Response
{
  "success": true,
  "transactionId": "txn_567890123456",
  "status": "cancelled",
  "cancelledAt": "2024-01-15T20:18:00Z"
}
```

## Webhooks

### Transaction Completed

```typescript
// POST to partner webhook URL
{
  "event": "transaction.completed",
  "timestamp": "2024-01-15T20:15:30Z",
  "data": {
    "transactionId": "txn_567890123456",
    "partnerId": "partner_123456",
    "amount": 150.00,
    "discount": 22.50,
    "netAmount": 127.50,
    "commission": 21.04,
    "settlement": 106.46
  },
  "signature": "sha256=..." // HMAC signature
}
```

### Daily Settlement

```typescript
// POST to partner webhook URL
{
  "event": "settlement.daily",
  "timestamp": "2024-01-16T00:00:00Z",
  "data": {
    "partnerId": "partner_123456",
    "date": "2024-01-15",
    "transactions": 47,
    "grossRevenue": 3560.00,
    "discounts": 534.00,
    "commissions": 456.90,
    "netSettlement": 2569.10,
    "paymentScheduled": "2024-01-17T12:00:00Z"
  }
}
```

## Error Handling

### Common Error Responses

```typescript
// 400 Bad Request
{
  "error": {
    "code": "INVALID_QR_CODE",
    "message": "The QR code has expired or is invalid",
    "details": {
      "qrPayload": "boom://txn/567890123456",
      "expiredAt": "2024-01-15T20:30:00Z"
    }
  }
}

// 402 Payment Required
{
  "error": {
    "code": "SUBSCRIPTION_EXPIRED",
    "message": "User subscription has expired",
    "details": {
      "userId": "user_123456",
      "expiredAt": "2024-01-10T00:00:00Z",
      "renewalUrl": "https://boomcard.bg/subscription/renew"
    }
  }
}

// 409 Conflict
{
  "error": {
    "code": "TRANSACTION_ALREADY_PROCESSED",
    "message": "This transaction has already been completed",
    "details": {
      "transactionId": "txn_567890123456",
      "completedAt": "2024-01-15T20:15:30Z"
    }
  }
}

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "window": "1h",
      "retryAfter": 3600
    }
  }
}
```

## SDKs & Code Examples

### JavaScript/TypeScript

```typescript
import { BoomCardAPI } from '@boomcard/sdk';

const client = new BoomCardAPI({
  apiKey: process.env.BOOM_API_KEY,
  environment: 'production'
});

// Initialize transaction
const transaction = await client.transactions.initialize({
  partnerId: 'partner_123456',
  amount: 150.00,
  items: [...]
});

// Handle webhook
app.post('/webhooks/boomcard', (req, res) => {
  const signature = req.headers['x-boom-signature'];
  
  if (!clie