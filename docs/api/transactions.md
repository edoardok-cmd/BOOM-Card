# Transactions API Documentation

## Overview

The Transactions API handles all discount card usage transactions within the BOOM Card platform. This includes transaction creation, validation, processing, and reporting.

## Base URL

```
https://api.boomcard.com/v1/transactions
```

## Authentication

All endpoints require authentication using Bearer tokens in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Create Transaction

Creates a new transaction when a customer uses their BOOM Card at a partner location.

**POST** `/transactions`

#### Request Body

```json
{
  "cardId": "string",
  "partnerId": "string",
  "locationId": "string",
  "originalAmount": "number",
  "discountPercentage": "number",
  "discountAmount": "number",
  "finalAmount": "number",
  "currency": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number",
      "category": "string"
    }
  ],
  "posTransactionId": "string",
  "posTerminalId": "string",
  "paymentMethod": "string",
  "metadata": {
    "tableNumber": "string",
    "serverName": "string",
    "customFields": {}
  }
}
```

#### Response

```json
{
  "transactionId": "trx_abc123def456",
  "status": "completed",
  "cardId": "card_789xyz",
  "partnerId": "partner_123",
  "locationId": "loc_456",
  "originalAmount": 100.00,
  "discountPercentage": 20,
  "discountAmount": 20.00,
  "finalAmount": 80.00,
  "currency": "BGN",
  "savingsToDate": 250.00,
  "createdAt": "2024-01-15T10:30:00Z",
  "processedAt": "2024-01-15T10:30:02Z",
  "receipt": {
    "url": "https://receipts.boomcard.com/trx_abc123def456",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Get Transaction

Retrieves details of a specific transaction.

**GET** `/transactions/{transactionId}`

#### Response

```json
{
  "transactionId": "trx_abc123def456",
  "status": "completed",
  "cardDetails": {
    "cardId": "card_789xyz",
    "cardNumber": "****1234",
    "holderName": "John Doe"
  },
  "partnerDetails": {
    "partnerId": "partner_123",
    "businessName": "Restaurant Sofia",
    "locationName": "Main Branch",
    "locationAddress": "123 Vitosha Blvd, Sofia"
  },
  "transactionDetails": {
    "originalAmount": 100.00,
    "discountPercentage": 20,
    "discountAmount": 20.00,
    "finalAmount": 80.00,
    "currency": "BGN",
    "items": [
      {
        "name": "Main Course",
        "quantity": 2,
        "unitPrice": 35.00,
        "totalPrice": 70.00,
        "category": "food"
      },
      {
        "name": "Beverage",
        "quantity": 2,
        "unitPrice": 15.00,
        "totalPrice": 30.00,
        "category": "drinks"
      }
    ]
  },
  "posData": {
    "posTransactionId": "POS123456",
    "posTerminalId": "TERM001",
    "paymentMethod": "card"
  },
  "timestamps": {
    "createdAt": "2024-01-15T10:30:00Z",
    "processedAt": "2024-01-15T10:30:02Z",
    "voidedAt": null
  },
  "metadata": {
    "tableNumber": "12",
    "serverName": "Maria",
    "customFields": {}
  }
}
```

### List Transactions

Retrieves a list of transactions with filtering and pagination options.

**GET** `/transactions`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cardId | string | No | Filter by card ID |
| partnerId | string | No | Filter by partner ID |
| locationId | string | No | Filter by location ID |
| status | string | No | Filter by status (pending, completed, failed, voided) |
| fromDate | ISO 8601 | No | Start date for date range filter |
| toDate | ISO 8601 | No | End date for date range filter |
| minAmount | number | No | Minimum transaction amount |
| maxAmount | number | No | Maximum transaction amount |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| sortBy | string | No | Sort field (createdAt, amount, discount) |
| sortOrder | string | No | Sort order (asc, desc) |

#### Response

```json
{
  "transactions": [
    {
      "transactionId": "trx_abc123def456",
      "cardId": "card_789xyz",
      "partnerId": "partner_123",
      "businessName": "Restaurant Sofia",
      "originalAmount": 100.00,
      "discountAmount": 20.00,
      "finalAmount": 80.00,
      "currency": "BGN",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "summary": {
    "totalTransactions": 200,
    "totalOriginalAmount": 15000.00,
    "totalDiscountAmount": 3000.00,
    "totalFinalAmount": 12000.00,
    "averageDiscountPercentage": 20
  }
}
```

### Void Transaction

Voids a completed transaction (requires special permissions).

**POST** `/transactions/{transactionId}/void`

#### Request Body

```json
{
  "reason": "string",
  "authorizedBy": "string",
  "voidType": "full|partial",
  "partialAmount": "number"
}
```

#### Response

```json
{
  "transactionId": "trx_abc123def456",
  "status": "voided",
  "voidedAt": "2024-01-15T11:00:00Z",
  "voidDetails": {
    "reason": "Customer request",
    "authorizedBy": "manager_123",
    "voidType": "full",
    "originalAmount": 100.00,
    "voidedAmount": 100.00,
    "refundedAmount": 80.00
  }
}
```

### Transaction Analytics

Get analytics data for transactions.

**GET** `/transactions/analytics`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| partnerId | string | No | Filter by partner ID |
| locationId | string | No | Filter by location ID |
| period | string | No | Time period (today, week, month, quarter, year, custom) |
| fromDate | ISO 8601 | No | Start date for custom period |
| toDate | ISO 8601 | No | End date for custom period |
| groupBy | string | No | Group results by (day, week, month, partner, location, category) |

#### Response

```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "summary": {
    "totalTransactions": 5420,
    "totalRevenue": 432000.00,
    "totalDiscounts": 86400.00,
    "averageTransactionValue": 79.70,
    "averageDiscountPercentage": 20,
    "uniqueCards": 1230,
    "repeatCustomers": 480,
    "repeatRate": 39.02
  },
  "trends": {
    "transactionGrowth": 12.5,
    "revenueGrowth": 15.3,
    "averageValueGrowth": 2.4
  },
  "breakdown": {
    "byCategory": [
      {
        "category": "restaurants",
        "transactions": 3200,
        "revenue": 256000.00,
        "discounts": 51200.00,
        "percentage": 59.04
      },
      {
        "category": "entertainment",
        "transactions": 1500,
        "revenue": 120000.00,
        "discounts": 24000.00,
        "percentage": 27.68
      }
    ],
    "byDayOfWeek": [
      {
        "day": "Monday",
        "transactions": 620,
        "revenue": 49600.00
      }
    ],
    "byHour": [
      {
        "hour": "12",
        "transactions": 450,
        "revenue": 36000.00
      }
    ]
  },
  "topPartners": [
    {
      "partnerId": "partner_123",
      "businessName": "Restaurant Sofia",
      "transactions": 320,
      "revenue": 25600.00,
      "averageTransaction": 80.00
    }
  ]
}
```

### Batch Transaction Upload

Upload multiple transactions in batch (for POS system integration).

**POST** `/transactions/batch`

#### Request Body

```json
{
  "batchId": "string",
  "partnerId": "string",
  "locationId": "string",
  "transactions": [
    {
      "externalId": "string",
      "cardId": "string",
      "originalAmount": "number",
      "discountPercentage": "number",
      "finalAmount": "number",
      "timestamp": "ISO 8601",
      "items": []
    }
  ]
}
```

#### Response

```json
{
  "batchId": "batch_123",
  "status": "processing",
  "totalTransactions": 50,
  "processed": 0,
  "failed": 0,
  "webhookUrl": "https://api.boomcard.com/v1/transactions/batch/batch_123/status"
}
```

### Get Batch Status

**GET** `/transactions/batch/{batchId}/status`

#### Response

```json
{
  "batchId": "batch_123",
  "status": "completed",
  "totalTransactions": 50,
  "processed": 48,
  "failed": 2,
  "completedAt": "2024-01-15T11:30:00Z",
  "results": {
    "successful": [
      {
        "externalId": "ext_001",
        "transactionId": "trx_123",
        "status": "completed"
      }
    ],
    "failed": [
      {
        "externalId": "ext_049",
        "error": "Invalid card ID",
        "code": "INVALID_CARD"
      }
    ]
  }
}
```

## Error Responses

### Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| INVALID_CARD | 400 | Card ID is invalid or inactive |
| INSUFFICIENT_BALANCE | 400 | Card has insufficient balance |
| PARTNER_NOT_ACTIVE | 400 | Partner account is not active |
| DUPLICATE_TRANSACTION | 409 | Transaction already exists |
| TRANSACTION_NOT_FOUND | 404 | Transaction ID not found |
| VOID_NOT_ALLOWED | 403 | Transaction cannot be voided |
| INVALID_DISCOUNT | 400 | Discount percentage exceeds limits |
| POS_ERROR | 500 | POS system integration error |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

## Webhooks

### Transaction Events

Partners can subscribe to transaction events via webhooks:

- `transaction.completed` - Transaction successfully processed
- `transaction.failed` - Transaction failed
- `transaction.voided` - Transaction was voided
- `batch.completed` - Batch processing completed

### Webhook Payload

```json
{
  "event": "transaction.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "transactionId": "trx_abc123def456",
    "cardId": "card_789xyz",
    "partnerId": "par