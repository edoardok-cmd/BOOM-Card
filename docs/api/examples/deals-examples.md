# Deals API Examples

## Overview

The Deals API provides endpoints for managing discount offers across various categories including restaurants, entertainment, accommodation, and services. This document provides practical examples for common use cases.

## Authentication

All API requests require authentication using Bearer tokens:

```bash
Authorization: Bearer <your-api-token>
```

## Base URL

```
https://api.boomcard.com/v1
```

## Deal Object Structure

```typescript
interface Deal {
  id: string;
  partnerId: string;
  title: {
    en: string;
    bg: string;
  };
  description: {
    en: string;
    bg: string;
  };
  category: 'food_drink' | 'entertainment' | 'accommodation' | 'services';
  subcategory: string;
  discountPercentage: number;
  discountType: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
  validFrom: string; // ISO 8601
  validUntil: string; // ISO 8601
  terms: {
    en: string;
    bg: string;
  };
  restrictions: {
    minSpend?: number;
    maxDiscount?: number;
    daysOfWeek?: number[]; // 0-6, where 0 is Sunday
    timeRestrictions?: {
      from: string; // HH:MM
      to: string; // HH:MM
    };
    maxUsesPerUser?: number;
    maxUsesTotal?: number;
  };
  images: {
    thumbnail: string;
    full: string;
  };
  location: {
    lat: number;
    lng: number;
    address: {
      en: string;
      bg: string;
    };
    city: string;
    postalCode: string;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}
```

## Get All Deals

### Request

```http
GET /deals
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| category | string | Filter by category | food_drink |
| subcategory | string | Filter by subcategory | fine_dining |
| city | string | Filter by city | Sofia |
| minDiscount | number | Minimum discount percentage | 10 |
| maxDiscount | number | Maximum discount percentage | 50 |
| sortBy | string | Sort field | discountPercentage |
| sortOrder | string | Sort order (asc/desc) | desc |
| page | number | Page number | 1 |
| limit | number | Items per page | 20 |
| lang | string | Response language | en |

### Example Request

```bash
curl -X GET "https://api.boomcard.com/v1/deals?category=food_drink&city=Sofia&minDiscount=15&sortBy=discountPercentage&sortOrder=desc&page=1&limit=10" \
  -H "Authorization: Bearer your-token-here" \
  -H "Accept-Language: en"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_123456",
        "partnerId": "partner_789",
        "title": {
          "en": "20% Off All Main Courses",
          "bg": "20% отстъпка за всички основни ястия"
        },
        "description": {
          "en": "Enjoy 20% discount on all main courses at our restaurant",
          "bg": "Насладете се на 20% отстъпка за всички основни ястия в нашия ресторант"
        },
        "category": "food_drink",
        "subcategory": "fine_dining",
        "discountPercentage": 20,
        "discountType": "percentage",
        "validFrom": "2024-01-01T00:00:00Z",
        "validUntil": "2024-12-31T23:59:59Z",
        "terms": {
          "en": "Valid for dine-in only. Cannot be combined with other offers.",
          "bg": "Валидно само за консумация на място. Не може да се комбинира с други оферти."
        },
        "restrictions": {
          "minSpend": 50,
          "daysOfWeek": [1, 2, 3, 4, 5],
          "timeRestrictions": {
            "from": "12:00",
            "to": "15:00"
          },
          "maxUsesPerUser": 5
        },
        "images": {
          "thumbnail": "https://cdn.boomcard.com/deals/thumb_123456.jpg",
          "full": "https://cdn.boomcard.com/deals/full_123456.jpg"
        },
        "location": {
          "lat": 42.6977,
          "lng": 23.3219,
          "address": {
            "en": "123 Vitosha Blvd, Sofia",
            "bg": "бул. Витоша 123, София"
          },
          "city": "Sofia",
          "postalCode": "1000"
        },
        "tags": ["italian", "pasta", "wine", "romantic"],
        "status": "active",
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16
    }
  }
}
```

## Get Deal by ID

### Request

```http
GET /deals/:dealId
```

### Example Request

```bash
curl -X GET "https://api.boomcard.com/v1/deals/deal_123456" \
  -H "Authorization: Bearer your-token-here"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "deal_123456",
    "partnerId": "partner_789",
    "title": {
      "en": "20% Off All Main Courses",
      "bg": "20% отстъпка за всички основни ястия"
    },
    "description": {
      "en": "Enjoy 20% discount on all main courses at our restaurant",
      "bg": "Насладете се на 20% отстъпка за всички основни ястия в нашия ресторант"
    },
    "category": "food_drink",
    "subcategory": "fine_dining",
    "discountPercentage": 20,
    "discountType": "percentage",
    "validFrom": "2024-01-01T00:00:00Z",
    "validUntil": "2024-12-31T23:59:59Z",
    "partner": {
      "id": "partner_789",
      "name": "La Bella Vista",
      "rating": 4.5,
      "reviewCount": 234
    }
  }
}
```

## Search Deals by Location

### Request

```http
POST /deals/search/location
```

### Request Body

```json
{
  "lat": 42.6977,
  "lng": 23.3219,
  "radius": 5000,
  "unit": "meters",
  "categories": ["food_drink", "entertainment"],
  "minDiscount": 10
}
```

### Example Request

```bash
curl -X POST "https://api.boomcard.com/v1/deals/search/location" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 42.6977,
    "lng": 23.3219,
    "radius": 5000,
    "unit": "meters",
    "categories": ["food_drink"],
    "minDiscount": 15
  }'
```

### Example Response

```json
{
  "success": true,
  