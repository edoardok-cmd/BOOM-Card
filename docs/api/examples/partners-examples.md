# Partners API Examples

This document provides comprehensive examples for interacting with the BOOM Card Partners API endpoints.

## Authentication

All partner API requests require authentication using a JWT token obtained through the login endpoint.

```typescript
// Authentication header format
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

## Partner Registration

### Request Example

```typescript
POST /api/v1/partners/register

{
  "businessName": "Sofia Sky Bar",
  "businessNameBg": "София Скай Бар",
  "email": "contact@sofiaskybar.bg",
  "password": "SecurePassword123!",
  "phone": "+359888123456",
  "category": "bars",
  "subcategory": "sky-bars",
  "description": {
    "en": "Premium rooftop bar with panoramic city views",
    "bg": "Премиум бар на покрив с панорамна гледка към града"
  },
  "address": {
    "street": "bul. Vitosha 123",
    "city": "Sofia",
    "postalCode": "1000",
    "country": "Bulgaria",
    "coordinates": {
      "lat": 42.6977,
      "lng": 23.3219
    }
  },
  "contactPerson": {
    "firstName": "Ivan",
    "lastName": "Petrov",
    "position": "Manager",
    "phone": "+359888123456"
  },
  "businessRegistration": {
    "taxId": "BG123456789",
    "registrationNumber": "123456789"
  }
}
```

### Response Example

```typescript
201 Created

{
  "success": true,
  "data": {
    "partnerId": "part_2024_abc123",
    "status": "pending_verification",
    "message": {
      "en": "Registration successful. Your account is pending verification.",
      "bg": "Регистрацията е успешна. Вашият акаунт очаква потвърждение."
    },
    "nextSteps": [
      "Upload required documents",
      "Complete business verification",
      "Add discount offers"
    ]
  }
}
```

## Partner Login

### Request Example

```typescript
POST /api/v1/partners/login

{
  "email": "contact@sofiaskybar.bg",
  "password": "SecurePassword123!"
}
```

### Response Example

```typescript
200 OK

{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "partner": {
      "id": "part_2024_abc123",
      "businessName": "Sofia Sky Bar",
      "email": "contact@sofiaskybar.bg",
      "status": "active",
      "category": "bars",
      "subcategory": "sky-bars"
    },
    "permissions": [
      "manage_offers",
      "view_analytics",
      "process_transactions",
      "manage_staff"
    ]
  }
}
```

## Create Discount Offer

### Request Example

```typescript
POST /api/v1/partners/offers

{
  "title": {
    "en": "Happy Hour Special",
    "bg": "Специална оферта Щастлив час"
  },
  "description": {
    "en": "50% off all cocktails from 5-7 PM",
    "bg": "50% отстъпка на всички коктейли от 17-19 ч."
  },
  "discountType": "percentage",
  "discountValue": 50,
  "category": "drinks",
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "schedule": {
    "monday": { "from": "17:00", "to": "19:00" },
    "tuesday": { "from": "17:00", "to": "19:00" },
    "wednesday": { "from": "17:00", "to": "19:00" },
    "thursday": { "from": "17:00", "to": "19:00" },
    "friday": { "from": "17:00", "to": "19:00" }
  },
  "terms": {
    "en": [
      "Valid for BOOM Card holders only",
      "Cannot be combined with other offers",
      "Minimum 2 cocktails per table"
    ],
    "bg": [
      "Валидно само за притежатели на BOOM Card",
      "Не може да се комбинира с други оферти",
      "Минимум 2 коктейла на маса"
    ]
  },
  "maxUsagePerCustomer": 2,
  "totalUsageLimit": 1000,
  "requiresReservation": false
}
```

### Response Example

```typescript
201 Created

{
  "success": true,
  "data": {
    "offerId": "offer_2024_xyz789",
    "status": "active",
    "qrCode": "https://api.boomcard.bg/qr/offer_2024_xyz789",
    "shortUrl": "https://boom.bg/o/xyz789"
  }
}
```

## Update Partner Profile

### Request Example

```typescript
PUT /api/v1/partners/profile

{
  "description": {
    "en": "Award-winning rooftop bar with 360° city views and signature cocktails",
    "bg": "Наградения бар на покрив с 360° гледка към града и авторски коктейли"
  },
  "operatingHours": {
    "monday": { "open": "10:00", "close": "02:00" },
    "tuesday": { "open": "10:00", "close": "02:00" },
    "wednesday": { "open": "10:00", "close": "02:00" },
    "thursday": { "open": "10:00", "close": "02:00" },
    "friday": { "open": "10:00", "close": "03:00" },
    "saturday": { "open": "10:00", "close": "03:00" },
    "sunday": { "open": "10:00", "close": "00:00" }
  },
  "amenities": [
    "outdoor_seating",
    "live_music",
    "vip_area",
    "parking",
    "wheelchair_accessible"
  ],
  "socialMedia": {
    "facebook": "https://facebook.com/sofiaskybar",
    "instagram": "https://instagram.com/sofiaskybar",
    "website": "https://sofiaskybar.bg"
  },
  "images": {
    "logo": "https://cdn.boomcard.bg/partners/part_2024_abc123/logo.jpg",
    "cover": "https://cdn.boomcard.bg/partners/part_2024_abc123/cover.jpg",
    "gallery": [
      "https://cdn.boomcard.bg/partners/part_2024_abc123/gallery_1.jpg",
      "https://cdn.boomcard.bg/partners/part_2024_abc123/gallery_2.jpg",
      "https://cdn.boomcard.bg/partners/part_2024_abc123/gallery_3.jpg"
    ]
  }
}
```

### Response Example

```typescript
200 OK

{
  "success": true,
  "data": {
    "message": {
      "en": "Profile updated successfully",
      "bg": "Профилът е актуализиран успешно"
    },
    "updatedFields": [
      "description",
      "operatingHours",
      "amenities",
      "socialMedia",
      "images"
    ]
  }
}
```

## Process Transaction

### Request Example

```typescript
POST /api/v1/partners/transactions/process

{
  "customerId": "cust_2024_def456",
  "offerId": "offer_2024_xyz789",
  "amount": 120.50,
  "currency": "BGN",
  "items": [
    {
      "name": "Mojito Classic",
      "quantity": 2,
      "unitPrice": 15.00,
      "discount": 7.50
    },
    {
      "name": "Long Island Iced Tea",
      "quantity": 2,
      "unitPrice": 18.00,
      "discount": 9.00
    }
  ],
  "posTransactionId": "POS-2024-001234",
  "staffId": "staff_123",
  "notes": "Birthday celebration"
}
```

### Response Example

```typescript
200 OK

{
  "success": true,
  "data": {
    "transactionId": "trans_2024_ghi012",
    "timestamp": "2024-01-15T18:30:45Z",
    "originalAmount": 66.00,
    "discountAmount": 33.00,
    "finalAmount": 33.00,
    "savingsPercentage": 50,
    "customerNotification": {
      "sent": true,
      "method": ["email", "push", "sms"]
    },
    "receipt": {
      "url": "https://api.boomcard.bg/receipts/trans_2024_ghi012",
      "qrCode": "https://api.boomcard.bg/qr/receipt/trans_2024_ghi012"
    }
  }
}
```

## Get Analytics

### Request Example

```typescript
GET /api/v1/partners/analytics?from=2024-01-01&to=2024-01-31&granularity=daily
```

### Response Example

```typescript
200 OK

{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "totalTransactions": 245,
      "totalRevenue": 12450.50,
      "totalDiscountsGiven": 6225.25,
      "uniqueCustomers": 189,
      "averageTransactionValue": 50.82,
      "conversionRate": 0.73
    },
    "dailyBreakdown": [
      {
        "date": "2024-01-01",
        "transactions": 12,
        "revenue": 580.00,
        "discounts": 290.00,
        "uniqueCustomers": 11
      },
      // ... more daily data
    ],
    "topOffers": [
      {
        "offerId": "offer_2024_xyz789",
        "title": "Happy Hour Special",
        "usageCount": 89,
        "revenue": 4450.00
      }
    ],
    "customerInsights": {
      "repeatCustomerRate": 0.34,
      "averageVisitsPerCustomer": 1.8,
      "peakHours": [
        { "hour": 18, "percentage": 0.23 },
        { "hour": 19, "percentage": 0.31 }
      ]
    }
  }
}
```

## Manage Staff Access

### Request Example

```typescript
POST /api/v1/partners/staff

{
  "email": "waiter@sofiaskybar.bg",
  "firstName": "Georgi",
  "lastName": "Dimitrov",
  "