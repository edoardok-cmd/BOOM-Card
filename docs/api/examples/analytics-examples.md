# Analytics API Examples

## Overview

The Analytics API provides comprehensive data insights for the BOOM Card platform. This document contains practical examples for common analytics operations including sales tracking, partner performance, user behavior analysis, and revenue reporting.

## Authentication

All analytics endpoints require authentication. Include the API key in the request headers:

```bash
Authorization: Bearer YOUR_API_KEY
```

## Base URL

```
https://api.boomcard.bg/v1/analytics
```

## Sales Analytics

### Get Daily Sales Summary

```bash
GET /sales/daily?date=2024-01-15
```

Response:
```json
{
  "date": "2024-01-15",
  "totalTransactions": 1847,
  "totalRevenue": 45230.50,
  "averageTransactionValue": 24.49,
  "uniqueUsers": 892,
  "topCategories": [
    {
      "category": "restaurants",
      "transactions": 823,
      "revenue": 18920.30
    },
    {
      "category": "entertainment",
      "transactions": 412,
      "revenue": 12340.20
    }
  ],
  "hourlyBreakdown": [
    {
      "hour": "12:00",
      "transactions": 234,
      "revenue": 5670.20
    }
  ]
}
```

### Get Monthly Sales Report

```bash
GET /sales/monthly?year=2024&month=1
```

Response:
```json
{
  "period": {
    "year": 2024,
    "month": 1
  },
  "summary": {
    "totalTransactions": 48392,
    "totalRevenue": 1234567.89,
    "averageTransactionValue": 25.50,
    "growthRate": 12.5,
    "newCustomers": 3421,
    "returningCustomers": 8932
  },
  "dailyTrends": [
    {
      "date": "2024-01-01",
      "transactions": 1523,
      "revenue": 38920.50
    }
  ],
  "categoryPerformance": [
    {
      "category": "restaurants",
      "revenue": 523400.20,
      "transactions": 21340,
      "averageDiscount": 15.5
    }
  ]
}
```

## Partner Performance Analytics

### Get Partner Performance Metrics

```bash
GET /partners/performance?partnerId=12345&period=last30days
```

Response:
```json
{
  "partnerId": "12345",
  "partnerName": "Sofia Sky Bar",
  "period": "last30days",
  "metrics": {
    "totalTransactions": 892,
    "totalRevenue": 45230.50,
    "averageTransactionValue": 50.71,
    "uniqueCustomers": 743,
    "repeatCustomerRate": 0.23,
    "averageRating": 4.7,
    "totalReviews": 234
  },
  "trends": {
    "revenueGrowth": 15.3,
    "transactionGrowth": 12.8,
    "customerGrowth": 18.2
  },
  "peakHours": [
    {
      "hour": "20:00",
      "averageTransactions": 45
    },
    {
      "hour": "21:00",
      "averageTransactions": 52
    }
  ],
  "topDiscountUsage": [
    {
      "discountType": "15% off drinks",
      "usageCount": 342,
      "revenue": 12340.50
    }
  ]
}
```

### Compare Partner Performance

```bash
POST /partners/compare
Content-Type: application/json

{
  "partnerIds": ["12345", "67890", "11111"],
  "metrics": ["revenue", "transactions", "customerSatisfaction"],
  "period": "last90days"
}
```

Response:
```json
{
  "comparison": [
    {
      "partnerId": "12345",
      "partnerName": "Sofia Sky Bar",
      "metrics": {
        "revenue": 134520.30,
        "transactions": 2341,
        "customerSatisfaction": 4.7
      }
    },
    {
      "partnerId": "67890",
      "partnerName": "Vitosha Restaurant",
      "metrics": {
        "revenue": 98230.40,
        "transactions": 3421,
        "customerSatisfaction": 4.5
      }
    }
  ],
  "winner": {
    "revenue": "12345",
    "transactions": "67890",
    "customerSatisfaction": "12345"
  }
}
```

## User Behavior Analytics

### Get User Engagement Metrics

```bash
GET /users/engagement?period=last7days
```

Response:
```json
{
  "period": "last7days",
  "activeUsers": {
    "daily": 12340,
    "weekly": 34520,
    "monthly": 89230
  },
  "engagement": {
    "averageSessionDuration": "8:32",
    "averageTransactionsPerUser": 2.3,
    "mostActiveHours": ["12:00-14:00", "19:00-21:00"],
    "deviceBreakdown": {
      "mobile": 0.72,
      "desktop": 0.23,
      "tablet": 0.05
    }
  },
  "userJourney": {
    "averageTimeToFirstTransaction": "2.3 days",
    "conversionRate": 0.34,
    "churnRate": 0.12
  }
}
```

### Get User Segmentation Analysis

```bash
GET /users/segments
```

Response:
```json
{
  "segments": [
    {
      "name": "Power Users",
      "size": 2340,
      "characteristics": {
        "averageMonthlyTransactions": 12,
        "averageMonthlySpend": 234.50,
        "preferredCategories": ["restaurants", "nightlife"],
        "loyaltyScore": 95
      }
    },
    {
      "name": "Casual Users",
      "size": 15670,
      "characteristics": {
        "averageMonthlyTransactions": 2,
        "averageMonthlySpend": 45.20,
        "preferredCategories": ["restaurants"],
        "loyaltyScore": 45
      }
    },
    {
      "name": "New Users",
      "size": 4520,
      "characteristics": {
        "averageMonthlyTransactions": 1,
        "averageMonthlySpend": 23.40,
        "preferredCategories": ["experiences"],
        "loyaltyScore": 20
      }
    }
  ]
}
```

## Revenue Analytics

### Get Revenue Breakdown

```bash
GET /revenue/breakdown?period=thisMonth
```

Response:
```json
{
  "period": "2024-01",
  "totalRevenue": 234567.89,
  "breakdown": {
    "subscriptions": {
      "amount": 89230.00,
      "percentage": 38.0,
      "subscribers": {
        "new": 1234,
        "renewed": 3421,
        "churned": 234
      }
    },
    "transactionFees": {
      "amount": 123400.50,
      "percentage": 52.6,
      "averageFeePerTransaction": 2.50
    },
    "partnerFees": {
      "amount": 21937.39,
      "percentage": 9.4,
      "activePartners": 234
    }
  },
  "projections": {
    "nextMonth": 256789.00,
    "growthRate": 9.5
  }
}
```

### Get Revenue Forecasting

```bash
POST /revenue/forecast
Content-Type: application/json

{
  "period": "next6months",
  "includeSeasonality": true,
  "confidenceLevel": 0.95
}
```

Response:
```json
{
  "forecast": [
    {
      "month": "2024-02",
      "predictedRevenue": 245670.00,
      "confidenceInterval": {
        "lower": 234000.00,
        "upper": 257340.00
      },
      "factors": {
        "seasonality": 1.05,
        "growth": 1.08,
        "events": ["Valentine's Day boost"]
      }
    },
    {
      "month": "2024-03",
      "predictedRevenue": 267890.00,
      "confidenceInterval": {
        "lower": 254000.00,
        "upper": 281780.00
      }
    }
  ],
  "assumptions": {
    "averageGrowthRate": 0.095,
    "churnRate": 0.12,
    "newCustomerAcquisition": 1200
  }
}
```

## Geographic Analytics

### Get Location-Based Performance

```bash
GET /geographic/performance?city=Sofia
```

Response:
```json
{
  "location": {
    "city": "Sofia",
    "country": "Bulgaria"
  },
  "metrics": {
    "activeUsers": 23450,
    "activePartners": 456,
    "monthlyTransactions": 89230,
    "monthlyRevenue": 234567.89
  },
  "districts": [
    {
      "name": "City Center",
      "users": 8920,
      "partners": 123,
      "revenue": 89230.50,
      "popularCategories": ["restaurants", "nightlife"]
    },
    {
      "name": "Vitosha",
      "users": 5670,
      "partners": 89,
      "revenue": 56780.30,
      "popularCategories": ["spa", "restaurants"]
    }
  ],
  "heatmap": {
    "hotspots": [
      {
        "latitude": 42.6977,
        "longitude": 23.3219,
        "intensity": 0.95,
        "dominantCategory": "nightlife"
      }
    ]
  }
}
```

## Custom Reports

### Generate Custom Analytics Report

```bash
POST /reports/custom
Content-Type: application/json

{
  "name": "Q1 Executive Summary",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "metrics": [
    "totalRevenue",
    "newUsers",
    "partnerSatisfaction",
    "marketPenetration"
  ],
  "breakdowns": ["category", "location", "userSegment"],
  "format": "pdf",
  "schedule": "monthly"
}
```

Response:
```json
{
  "reportId": "rpt_abc123",
  "status": "processing",
  "estimatedCompletion": "2024-01-15T15:30:00Z",
  "downloadUrl": null,
  "schedule": {
    "frequency": "monthly",
    "nextRun": "2024-02-01T00:00:00Z",
    "recipients": ["admin@boomcard.bg"]
  }
}
```

### Get Report Status

```bash
GET /reports/status/rpt_abc123
```

Response:
```json
{
  "reportId": "rpt_abc123",
  "status": "completed",
  "completedAt": "2024-01-15T15:28:32Z",
  "downloadUrl": "https://api.boomcard.bg/v1/reports/download/rpt_abc123",
  "expiresAt": "2024-01-22T15:28:32Z",
  "metadata": {
    "pages": 24,
    "fileSize": "2.3MB",
    "format": "pdf"
  }
}
```

## Real-time Analytics

### Subscribe to Real-time Metrics

WebSocket connection:
```javascript
const ws = new WebSocket('wss://api.boomcard.bg/v1/analytics/realtime');

ws.send(JSON.stringify({
  action: 'subscribe',
  metrics: ['transactions', 'revenue', 'activeUsers'],
  interval: 1000 // milliseconds
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

Sample real-time data:
```json
{
  "timestamp": "2024-01-15T12:34:56Z",
  "metrics": {
    "transactions": {
      "current": 234,
      "trend": "up",
      "changePercent": 12.5
    },
    "revenue": {
      "current": 5678.90,
      "trend": "up",
      "changePercent": 8.3
    },
    "activeUsers": {
      "current": 1234,
      "trend": "stable",
      "changePercent": 0.2
    }
  }
}
```

## Rate Limiting

Analytics API endpoints have the following rate limits:
- Standard endpoints: 1000 requests per hour
- Real-time endpoints: 100 connections per account
- Custom reports: 10 reports per day

## Error Handling

Common error responses:

```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Date range cannot exceed 365 days",
    "details": {
      "maxDays": 365,
      "requestedDays": 400
    }
  }
}
```

```json
{
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Not enough data available for the requested period",
    "details": {
      "availableFrom": "2024-01-01",
      "requestedFrom": "2023-01-01"
    }
  }
}
```
