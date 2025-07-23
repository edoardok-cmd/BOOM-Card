# Analytics API Documentation

## Overview

The Analytics API provides comprehensive data collection, processing, and reporting capabilities for the BOOM Card platform. This API tracks user behavior, partner performance, transaction patterns, and generates actionable insights for all stakeholders.

## Base URL

```
https://api.boomcard.bg/v1/analytics
```

## Authentication

All analytics endpoints require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer {token}
```

## Rate Limiting

- Standard users: 100 requests per minute
- Partner accounts: 500 requests per minute
- Admin accounts: Unlimited

## Endpoints

### User Analytics

#### Track User Activity

```http
POST /analytics/track
```

Track user interactions and behavior on the platform.

**Request Body:**

```json
{
  "userId": "string",
  "sessionId": "string",
  "eventType": "page_view | search | card_scan | transaction | app_open",
  "eventData": {
    "page": "string",
    "searchQuery": "string",
    "partnerId": "string",
    "transactionId": "string",
    "discountAmount": "number",
    "location": {
      "lat": "number",
      "lng": "number"
    },
    "device": {
      "type": "mobile | desktop | tablet",
      "os": "string",
      "browser": "string"
    }
  },
  "timestamp": "ISO 8601"
}
```

**Response:**

```json
{
  "success": true,
  "eventId": "string",
  "processed": "ISO 8601"
}
```

#### Get User Statistics

```http
GET /analytics/users/{userId}/stats
```

Retrieve comprehensive statistics for a specific user.

**Query Parameters:**

- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date
- `granularity` (optional): `day | week | month | year`

**Response:**

```json
{
  "userId": "string",
  "period": {
    "start": "ISO 8601",
    "end": "ISO 8601"
  },
  "statistics": {
    "totalSavings": 1234.56,
    "transactionCount": 45,
    "favoriteCategories": [
      {
        "category": "restaurants",
        "visits": 23,
        "savings": 456.78
      }
    ],
    "mostVisitedPartners": [
      {
        "partnerId": "string",
        "partnerName": "string",
        "visits": 12,
        "totalSaved": 234.56
      }
    ],
    "activityByDay": [
      {
        "date": "ISO 8601",
        "transactions": 3,
        "savings": 45.67
      }
    ],
    "averageDiscountUsed": 15.5,
    "cardUsageFrequency": "weekly"
  }
}
```

### Partner Analytics

#### Get Partner Dashboard Metrics

```http
GET /analytics/partners/{partnerId}/dashboard
```

Retrieve real-time dashboard metrics for partners.

**Query Parameters:**

- `period` (optional): `today | yesterday | week | month | year | custom`
- `startDate` (optional): ISO 8601 date (for custom period)
- `endDate` (optional): ISO 8601 date (for custom period)

**Response:**

```json
{
  "partnerId": "string",
  "businessName": "string",
  "period": {
    "start": "ISO 8601",
    "end": "ISO 8601"
  },
  "metrics": {
    "totalTransactions": 234,
    "uniqueCustomers": 187,
    "totalDiscountGiven": 3456.78,
    "averageTransactionValue": 45.67,
    "conversionRate": 23.45,
    "peakHours": [
      {
        "hour": 12,
        "transactions": 34
      }
    ],
    "customerRetentionRate": 34.56,
    "newVsReturning": {
      "new": 123,
      "returning": 64
    }
  },
  "comparison": {
    "previousPeriod": {
      "totalTransactions": 198,
      "changePercent": 18.18
    }
  }
}
```

#### Partner Performance Report

```http
GET /analytics/partners/{partnerId}/performance
```

Detailed performance analytics for partners.

**Response:**

```json
{
  "partnerId": "string",
  "performance": {
    "revenue": {
      "projectedLoss": 234.56,
      "actualCustomerSpend": 1234.56,
      "netBenefit": 1000.00
    },
    "customerAcquisition": {
      "newCustomers": 45,
      "acquisitionCost": 12.34,
      "lifetimeValue": 234.56
    },
    "marketingROI": 245.67,
    "competitorBenchmark": {
      "categoryAverage": {
        "transactions": 156,
        "discountRate": 12.5
      },
      "partnerRank": 3,
      "totalInCategory": 25
    }
  }
}
```

### Transaction Analytics

#### Transaction Summary

```http
GET /analytics/transactions/summary
```

Get aggregated transaction data.

**Query Parameters:**

- `startDate`: ISO 8601 date (required)
- `endDate`: ISO 8601 date (required)
- `groupBy`: `partner | category | location | user` (optional)
- `partnerId` (optional): Filter by specific partner
- `category` (optional): Filter by category

**Response:**

```json
{
  "summary": {
    "totalTransactions": 12345,
    "totalDiscountValue": 23456.78,
    "averageDiscountPercent": 15.5,
    "uniqueUsers": 3456,
    "uniquePartners": 234
  },
  "breakdown": [
    {
      "group": "restaurants",
      "transactions": 5678,
      "discountValue": 12345.67,
      "users": 2345
    }
  ],
  "trends": {
    "dailyAverage": 234,
    "growthRate": 12.5,
    "peakDay": "2024-01-15",
    "peakTransactions": 456
  }
}
```

#### Real-time Transaction Stream

```http
GET /analytics/transactions/stream
```

WebSocket endpoint for real-time transaction monitoring (admin only).

**WebSocket Message Format:**

```json
{
  "type": "transaction",
  "data": {
    "transactionId": "string",
    "timestamp": "ISO 8601",
    "userId": "string",
    "partnerId": "string",
    "amount": 123.45,
    "discount": 15.5,
    "location": {
      "lat": 42.6977,
      "lng": 23.3219
    }
  }
}
```

### Platform Analytics (Admin)

#### Platform Overview

```http
GET /analytics/platform/overview
```

Comprehensive platform metrics for administrators.

**Response:**

```json
{
  "platform": {
    "users": {
      "total": 12345,
      "active": 8901,
      "new": 234,
      "churnRate": 5.6
    },
    "partners": {
      "total": 567,
      "active": 534,
      "pendingApproval": 12,
      "byCategory": {
        "restaurants": 234,
        "hotels": 89,
        "entertainment": 123,
        "wellness": 121
      }
    },
    "subscriptions": {
      "active": 8901,
      "trial": 234,
      "cancelled": 567,
      "revenue": 123456.78,
      "mrr": 12345.67,
      "averageLifetime": 234
    },
    "transactions": {
      "today": 1234,
      "mtd": 23456,
      "totalDiscounts": 345678.90,
      "averageDiscount": 15.5
    }
  }
}
```

#### Revenue Analytics

```http
GET /analytics/platform/revenue
```

Detailed revenue analytics and projections.

**Query Parameters:**

- `period`: `daily | weekly | monthly | yearly`
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date

**Response:**

```json
{
  "revenue": {
    "subscriptions": {
      "total": 123456.78,
      "breakdown": {
        "monthly": 89012.34,
        "annual": 34444.44
      },
      "growth": 12.5
    },
    "partnerFees": {
      "total": 23456.78,
      "byTier": {
        "basic": 12345.67,
        "premium": 11111.11
      }
    },
    "projections": {
      "nextMonth": 134567.89,
      "nextQuarter": 456789.01,
      "confidence": 0.85
    }
  },
  "costs": {
    "infrastructure": 12345.67,
    "marketing": 23456.78,
    "operations": 34567.89
  },
  "profitability": {
    "grossMargin": 67.8,
    "netMargin": 23.4,
    "ebitda": 45678.90
  }
}
```

### Geographic Analytics

#### Heat Map Data

```http
GET /analytics/geographic/heatmap
```

Get geographic distribution of activity.

**Query Parameters:**

- `type`: `transactions | users | partners`
- `zoom`: `city | region | country`
- `bounds`: `minLat,minLng,maxLat,maxLng`

**Response:**

```json
{
  "heatmap": {
    "type": "transactions",
    "points": [
      {
        "lat": 42.6977,
        "lng": 23.3219,
        "intensity": 0.85,
        "count": 234,
        "details": {
          "city": "Sofia",
          "topPartners": ["partner1", "partner2"]
        }
      }
    ],
    "clusters": [
      {
        "center": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "radius": 5,
        "count": 456
      }
    ]
  }
}
```

### Custom Reports

#### Generate Custom Report

```http
POST /analytics/reports/custom
```

Create custom analytics reports with specific metrics and filters.

**Request Body:**

```json
{
  "name": "Monthly Partner Performance",
  "metrics": ["transactions", "revenue", "uniqueUsers"],
  "dimensions": ["partner", "category", "date"],
  "filters": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "partners": ["partner1", "partner2"],
    "categories": ["restaurants"]
  },
  "granularity": "daily",
  "format": "json | csv | pdf"
}
```

**Response:**

```json
{
  "reportId": "string",
  "status": "processing",
  "estimatedTime": 30,
  "downloadUrl": "string"
}
```

#### Get Report Status

```http
GET /analytics/reports/{reportId}/status
```

Check the status of a custom report generation.

**Response:**

```json
{
  "reportId": "string",
  "status": "completed | processing | failed",
  "progress": 85,
  "downloadUrl": "string",
  "expiresAt": "ISO 8601"
}
```

### Export Endpoints

#### Export Analytics Data

```http
POST /analytics/export
```

Export analytics data in various formats.

**Request Body:**

```json
{
  "type": "users | partners | transactions | platform",
  "format": "csv | excel | json",
  "dateRange": {
    "start": "ISO 8601",
    "end": "ISO 8601"
  },
  "filters": {
    "categories": ["string"],
    "partners": ["string"],
    "minTransactionValue": "number"
  },
  "columns": ["column1", "column2"]
}
```

**Response:**

```json
{
  "exportId": "string",
  "status": "queued",
  "estimatedSize": "15MB",
  "notificationEmail": "user@example.com"
}
```

## Data Models

### Event Types

```typescript
enum EventType {
  PAGE_VIEW = 'page_view',
  SEARCH = 'search',
  CARD_SCAN = 'card_scan',
  TRANSACTION = 'transaction',
  APP_OPEN = 'app_open',
  PARTNER_VIEW = 'partner_view',
  OFFER_CLAIM = 'offer_claim',
  SHARE = 'share',
  REFERRAL = 'referral'
}
```

### Metric Types

```typescript
interface Metric {
  name: string;
  value: number;
  unit: 'count' | 'currency' | 'percentage' | 'time';
  change: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
}
```

### Time Granularity

```typescript
enum Granularity {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}
```

## Webhooks

Analytics events can trigger webhooks for real-time integrations:

### Webhook Events

- `analytics.milestone.reached` - User or partner reaches a milestone
- `analytics.anomaly.detected` - Unusual activity detected
- `analytics.report.ready` - Custom report generation completed

### Webhook Payload

```json
{
  "event": "analytics.milestone.reached",
  "timestamp": "ISO 8601",
  "data": {
    "type": "user_savings",
    "userId": "string",
    "milestone": 1000,
    "currentValue": 1001.23
  }
}
```

## Error Responses

### Error Format

```json
{
  "error": {
    "code": "ANALYTICS_ERROR",
    "message": "Human-readable error message",
    "details": {
      "field": "startDate",
      "reason": "Invalid date format"
    }
  }
}
```

### Common Error Codes

- `INVALID_DATE_RANGE` - Date range is invalid or too large
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `METRIC_NOT_AVAILABLE` - Requested metric is not available
- `REPORT_GENERATION_FAILED` - Custom report generation failed
- `EXPORT_SIZE_LIMIT` - Export exceeds size limit

## Best Practices

1. **Data Collection**
   - Batch events when possible to reduce API calls
   - Include relevant context in event data
   - Use consistent event naming conventions

2. **Performance**
   - Cache frequently accessed reports
   - Use appropriate time granularity for date ranges
   - Implement pagination for large datasets

3. **Privacy**
   - Anonymize sensitive user data
   - Comply with GDPR requirements
   - Provide data export/deletion capabilities

4. **Integration**
   - Use webhooks for real-time updates
   - Implement retry logic for failed requests
   - Monitor API usage against rate limits
