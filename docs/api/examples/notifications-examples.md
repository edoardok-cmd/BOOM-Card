# Notifications API Examples

## Overview

The BOOM Card notifications system provides real-time updates to users about their transactions, new offers, subscription status, and partner updates. This document provides comprehensive examples for implementing notifications across different scenarios.

## Authentication

All notification endpoints require authentication using JWT tokens.

```typescript
// Required headers for all requests
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'Accept-Language': 'en' // or 'bg' for Bulgarian
};
```

## Notification Types

### Transaction Notifications

#### Successful Discount Applied

```typescript
// POST /api/v1/notifications/transaction
{
  "type": "TRANSACTION_SUCCESS",
  "recipientId": "user_123",
  "data": {
    "transactionId": "txn_abc123",
    "partnerId": "partner_456",
    "partnerName": "Restaurant Sofia",
    "discountAmount": 25.50,
    "discountPercentage": 15,
    "originalAmount": 170.00,
    "finalAmount": 144.50,
    "currency": "BGN",
    "timestamp": "2024-01-15T14:30:00Z"
  },
  "channels": ["push", "in_app"],
  "priority": "high"
}

// Response
{
  "success": true,
  "notificationId": "notif_789",
  "deliveryStatus": {
    "push": "delivered",
    "in_app": "delivered"
  }
}
```

#### Failed Transaction

```typescript
// POST /api/v1/notifications/transaction
{
  "type": "TRANSACTION_FAILED",
  "recipientId": "user_123",
  "data": {
    "transactionId": "txn_def456",
    "partnerId": "partner_456",
    "reason": "SUBSCRIPTION_EXPIRED",
    "attemptedAt": "2024-01-15T15:00:00Z"
  },
  "channels": ["push", "in_app", "email"],
  "priority": "high"
}
```

### Subscription Notifications

#### Subscription Renewal Reminder

```typescript
// POST /api/v1/notifications/subscription
{
  "type": "SUBSCRIPTION_RENEWAL_REMINDER",
  "recipientId": "user_123",
  "data": {
    "subscriptionId": "sub_123",
    "currentPlan": "premium",
    "expiryDate": "2024-02-01",
    "daysRemaining": 7,
    "renewalAmount": 29.99,
    "currency": "BGN"
  },
  "channels": ["email", "push"],
  "priority": "medium",
  "scheduledFor": "2024-01-25T09:00:00Z"
}
```

#### Subscription Expired

```typescript
// POST /api/v1/notifications/subscription
{
  "type": "SUBSCRIPTION_EXPIRED",
  "recipientId": "user_123",
  "data": {
    "subscriptionId": "sub_123",
    "expiredAt": "2024-02-01T00:00:00Z",
    "gracePeriodEnds": "2024-02-08T00:00:00Z"
  },
  "channels": ["email", "push", "in_app"],
  "priority": "high"
}
```

### Partner Updates

#### New Partner Added

```typescript
// POST /api/v1/notifications/partner-updates
{
  "type": "NEW_PARTNER_NEARBY",
  "recipientIds": ["user_123", "user_456"], // Bulk notification
  "data": {
    "partnerId": "partner_789",
    "partnerName": "Sky Bar Vitosha",
    "category": "bars",
    "location": {
      "lat": 42.6977,
      "lng": 23.3219,
      "address": "123 Vitosha Blvd, Sofia"
    },
    "discountPercentage": 20,
    "distance": 1.2, // km from user's saved location
    "featuredUntil": "2024-02-15"
  },
  "channels": ["push"],
  "priority": "low",
  "targeting": {
    "radius": 5, // km
    "categories": ["bars", "nightlife"]
  }
}
```

#### Special Offer Alert

```typescript
// POST /api/v1/notifications/offers
{
  "type": "LIMITED_TIME_OFFER",
  "recipientIds": "broadcast", // Send to all active users
  "data": {
    "offerId": "offer_123",
    "partnerId": "partner_456",
    "partnerName": "Spa Paradise",
    "offerTitle": "Weekend Special - 30% Off All Services",
    "validFrom": "2024-01-20T00:00:00Z",
    "validUntil": "2024-01-22T23:59:59Z",
    "terms": "Valid for premium members only",
    "imageUrl": "https://cdn.boomcard.bg/offers/spa-weekend-special.jpg"
  },
  "channels": ["push", "in_app"],
  "priority": "medium",
  "targeting": {
    "subscriptionTypes": ["premium", "vip"],
    "userSegments": ["spa_lovers", "weekend_active"]
  }
}
```

## Batch Notifications

### Monthly Savings Report

```typescript
// POST /api/v1/notifications/batch
{
  "type": "MONTHLY_SAVINGS_REPORT",
  "recipientIds": "all_active_users",
  "data": {
    "reportMonth": "2024-01",
    "template": "monthly_savings",
    "personalized": true
  },
  "channels": ["email"],
  "priority": "low",
  "scheduledFor": "2024-02-01T10:00:00Z",
  "batchConfig": {
    "batchSize": 1000,
    "delayBetweenBatches": 60000, // 1 minute in ms
    "maxRetries": 3
  }
}
```

## Notification Preferences

### Get User Preferences

```typescript
// GET /api/v1/notifications/preferences/user_123

// Response
{
  "userId": "user_123",
  "preferences": {
    "channels": {
      "email": {
        "enabled": true,
        "frequency": "immediate",
        "categories": ["transactions", "subscription", "offers"]
      },
      "push": {
        "enabled": true,
        "frequency": "immediate",
        "categories": ["transactions", "nearby_partners"]
      },
      "sms": {
        "enabled": false
      }
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00",
      "timezone": "Europe/Sofia"
    },
    "language": "bg"
  }
}
```

### Update User Preferences

```typescript
// PUT /api/v1/notifications/preferences/user_123
{
  "channels": {
    "email": {
      "enabled": true,
      "frequency": "daily_digest",
      "categories": ["transactions", "subscription"]
    },
    "push": {
      "enabled": true,
      "frequency": "immediate",
      "categories": ["transactions"]
    }
  },
  "quietHours": {
    "enabled": true,
    "start": "23:00",
    "end": "07:00"
  }
}
```

## WebSocket Real-time Notifications

### Connection Setup

```typescript
// Client-side WebSocket connection
const ws = new WebSocket('wss://api.boomcard.bg/notifications/ws');

ws.onopen = () => {
  // Authenticate the WebSocket connection
  ws.send(JSON.stringify({
    type: 'auth',
    token: accessToken
  }));
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  switch(notification.type) {
    case 'TRANSACTION_SUCCESS':
      handleTransactionSuccess(notification);
      break;
    case 'NEW_OFFER':
      handleNewOffer(notification);
      break;
    default:
      console.log('Unknown notification type:', notification.type);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Implement reconnection logic
};
```

### Server-side WebSocket Push

```typescript
// POST /api/v1/notifications/websocket/push
{
  "userId": "user_123",
  "notification": {
    "id": "notif_realtime_123",
    "type": "INSTANT_DISCOUNT_AVAILABLE",
    "data": {
      "partnerId": "partner_456",
      "partnerName": "Coffee House Central",
      "discountPercentage": 25,
      "validFor": 3600, // seconds
      "message": "You're near Coffee House Central! Show this for 25% off"
    },
    "priority": "high",
    "expiresAt": "2024-01-15T15:30:00Z"
  }
}
```

## Push Notification Templates

### Transaction Success Template

```json
{
  "en": {
    "title": "Discount Applied! 🎉",
    "body": "You saved {{discountAmount}} {{currency}} at {{partnerName}}",
    "data": {
      "type": "transaction",
      "transactionId": "{{transactionId}}",
      "deepLink": "boomcard://transaction/{{transactionId}}"
    }
  },
  "bg": {
    "title": "Отстъпката е приложена! 🎉",
    "body": "Спестихте {{discountAmount}} {{currency}} в {{partnerName}}",
    "data": {
      "type": "transaction",
      "transactionId": "{{transactionId}}",
      "deepLink": "boomcard://transaction/{{transactionId}}"
    }
  }
}
```

### New Partner Template

```json
{
  "en": {
    "title": "New Partner Nearby! 📍",
    "body": "{{partnerName}} is now offering {{discountPercentage}}% off",
    "image": "{{partnerImageUrl}}",
    "data": {
      "type": "new_partner",
      "partnerId": "{{partnerId}}",
      "deepLink": "boomcard://partner/{{partnerId}}"
    }
  },
  "bg": {
    "title": "Нов партньор наблизо! 📍",
    "body": "{{partnerName}} вече предлага {{discountPercentage}}% отстъпка",
    "image": "{{partnerImageUrl}}",
    "data": {
      "type": "new_partner",
      "partnerId": "{{partnerId}}",
      "deepLink": "boomcard://partner/{{partnerId}}"
    }
  }
}
```

## Email Notification Templates

### Welcome Email

```typescript
// POST /api/v1/notifications/email
{
  "type": "WELCOME_EMAIL",
  "recipientId": "user_123",
  "template": "welcome_premium",
  "data": {
    "userName": "John Doe",
    "subscriptionType": "premium",
    "activationDate": "2024-01-15",
    "cardNumber": "BOOM-2024-0123",
    "onboardingSteps": [
      {
        "title": "Download the App",
        "description": "Get instant access to all partners",
        "ctaUrl": "https://boomcard.bg/download"
      },
      {
        "title": "Find Partners",
        "description": "Discover savings near you",
        "ctaUrl": "https://boomcard.bg/map"
      }
    ]
  },
  "channels": ["email"],
  "priority": "high"
}
```

### Monthly Statement

```typescript
// POST /api/v1/notifications/email
{
  "type": "MONTHLY_STATEMENT",
  "recipientId": "user_123",
  "template": "monthly_statement",
  "data": {
    "period": "2024-01",
    "summary": {
      "totalSavings": 245.50,
      "transactionCount": 12,
      "mostVisitedPartner": "Restaurant Sofia",
      "biggestSaving": {
        "amount": 45.00,
        "partner": "Hotel Grand",
        "date": "2024-01-20"
      }
    },
    "transactions": [
      {
        "date": "2024-01-05",
        "partner": "Café Central",
        "originalAmount": 25.00,
        "discount": 3.75,
        "finalAmount": 21.25
      }
      // ... more transactions
    ],
    "recommendations": [
      {
        "partnerId": "partner_789",
        "partnerName": "New Spa Resort",
        "reason": "Based on your wellness preferences",
        "discount": 20
      }
    ]
  },
  "channels": ["email"],
  "priority": "low",
  "attachments": [
    {
      "type": "pdf",
      "name": "statement_2024_01.pdf",
    