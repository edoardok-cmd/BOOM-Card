# Deals API

## Overview

The Deals API provides endpoints for managing discount deals, offers, and promotions across the BOOM Card platform. This API handles deal creation, retrieval, updates, and analytics for both partners and consumers.

## Base URL

```
https://api.boomcard.bg/v1/deals
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

## Endpoints

### List Deals

```
GET /deals
```

Retrieves a paginated list of active deals based on filters.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| category | string | No | Filter by category (food, entertainment, accommodation, services) |
| subcategory | string | No | Filter by subcategory |
| location | string | No | Filter by city or region |
| lat | float | No | Latitude for proximity search |
| lng | float | No | Longitude for proximity search |
| radius | integer | No | Search radius in km (default: 10) |
| discount_min | integer | No | Minimum discount percentage |
| discount_max | integer | No | Maximum discount percentage |
| partner_id | string | No | Filter by specific partner |
| search | string | No | Search in deal titles and descriptions |
| sort | string | No | Sort by: popular, newest, discount, distance |
| status | string | No | Filter by status (active, scheduled, expired) |
| lang | string | No | Language code (en, bg) |

#### Response

```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_123456",
        "partner_id": "partner_789",
        "partner": {
          "id": "partner_789",
          "name": "Restaurant Sofia",
          "logo_url": "https://cdn.boomcard.bg/partners/logo_789.jpg",
          "category": "food",
          "subcategory": "fine_dining",
          "rating": 4.5,
          "review_count": 234
        },
        "title": {
          "en": "20% off all main courses",
          "bg": "20% отстъпка за всички основни ястия"
        },
        "description": {
          "en": "Enjoy 20% discount on all main courses. Valid for dine-in only.",
          "bg": "Насладете се на 20% отстъпка за всички основни ястия. Валидно само за консумация на място."
        },
        "discount_type": "percentage",
        "discount_value": 20,
        "original_price": null,
        "discounted_price": null,
        "conditions": {
          "en": "Not valid with other promotions. Maximum 4 people per table.",
          "bg": "Не важи с други промоции. Максимум 4 души на маса."
        },
        "valid_from": "2024-01-01T00:00:00Z",
        "valid_until": "2024-12-31T23:59:59Z",
        "availability": {
          "monday": { "start": "12:00", "end": "22:00" },
          "tuesday": { "start": "12:00", "end": "22:00" },
          "wednesday": { "start": "12:00", "end": "22:00" },
          "thursday": { "start": "12:00", "end": "22:00" },
          "friday": { "start": "12:00", "end": "23:00" },
          "saturday": { "start": "12:00", "end": "23:00" },
          "sunday": { "start": "12:00", "end": "21:00" }
        },
        "locations": [
          {
            "id": "loc_123",
            "address": "123 Vitosha Blvd, Sofia",
            "city": "Sofia",
            "postal_code": "1000",
            "lat": 42.6954,
            "lng": 23.3239,
            "phone": "+359 2 123 4567"
          }
        ],
        "images": [
          "https://cdn.boomcard.bg/deals/deal_123456_1.jpg",
          "https://cdn.boomcard.bg/deals/deal_123456_2.jpg"
        ],
        "tags": ["dinner", "bulgarian_cuisine", "romantic"],
        "usage_count": 1234,
        "view_count": 5678,
        "favorite_count": 234,
        "is_featured": true,
        "is_new": false,
        "status": "active",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 245,
      "pages": 13,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "categories": [
        { "key": "food", "count": 120 },
        { "key": "entertainment", "count": 65 },
        { "key": "accommodation", "count": 40 },
        { "key": "services", "count": 20 }
      ],
      "discount_ranges": [
        { "min": 10, "max": 20, "count": 80 },
        { "min": 21, "max": 30, "count": 100 },
        { "min": 31, "max": 50, "count": 50 },
        { "min": 51, "max": 100, "count": 15 }
      ]
    }
  }
}
```

### Get Deal Details

```
GET /deals/{deal_id}
```

Retrieves detailed information about a specific deal.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deal_id | string | Yes | Unique deal identifier |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lang | string | No | Language code (en, bg) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "deal_123456",
    "partner_id": "partner_789",
    "partner": {
      "id": "partner_789",
      "name": "Restaurant Sofia",
      "logo_url": "https://cdn.boomcard.bg/partners/logo_789.jpg",
      "cover_image": "https://cdn.boomcard.bg/partners/cover_789.jpg",
      "category": "food",
      "subcategory": "fine_dining",
      "rating": 4.5,
      "review_count": 234,
      "description": {
        "en": "Award-winning restaurant serving modern Bulgarian cuisine",
        "bg": "Награждаван ресторант, сервиращ модерна българска кухня"
      },
      "website": "https://restaurant-sofia.bg",
      "social_media": {
        "facebook": "https://facebook.com/restaurantsofia",
        "instagram": "https://instagram.com/restaurantsofia"
      }
    },
    "title": {
      "en": "20% off all main courses",
      "bg": "20% отстъпка за всички основни ястия"
    },
    "description": {
      "en": "Enjoy 20% discount on all main courses. Valid for dine-in only.",
      "bg": "Насладете се на 20% отстъпка за всички основни ястия. Валидно само за консумация на място."
    },
    "long_description": {
      "en": "Experience the finest Bulgarian cuisine with our special BOOM Card offer...",
      "bg": "Изживейте най-добрата българска кухня с нашата специална оферта за BOOM Card..."
    },
    "discount_type": "percentage",
    "discount_value": 20,
    "original_price": null,
    "discounted_price": null,
    "max_discount_amount": 50.00,
    "currency": "BGN",
    "conditions": {
      "en": "Not valid with other promotions. Maximum 4 people per table.",
      "bg": "Не важи с други промоции. Максимум 4 души на маса."
    },
    "restrictions": [
      {
        "type": "blackout_dates",
        "dates": ["2024-12-24", "2024-12-25", "2024-12-31"]
      },
      {
        "type": "minimum_spend",
        "amount": 30.00,
        "currency": "BGN"
      },
      {
        "type": "advance_booking",
        "hours": 24
      }
    ],
    "valid_from": "2024-01-01T00:00:00Z",
    "valid_until": "2024-12-31T23:59:59Z",
    "availability": {
      "monday": { "start": "12:00", "end": "22:00" },
      "tuesday": { "start": "12:00", "end": "22:00" },
      "wednesday": { "start": "12:00", "end": "22:00" },
      "thursday": { "start": "12:00", "end": "22:00" },
      "friday": { "start": "12:00", "end": "23:00" },
      "saturday": { "start": "12:00", "end": "23:00" },
      "sunday": { "start": "12:00", "end": "21:00" }
    },
    "redemption_method": "qr_code",
    "redemption_limit": {
      "per_user": 5,
      "per_day": 50,
      "total": 1000
    },
    "redemption_count": {
      "today": 12,
      "total": 456
    },
    "locations": [
      {
        "id": "loc_123",
        "name": "Main Restaurant",
        "address": "123 Vitosha Blvd, Sofia",
        "city": "Sofia",
        "postal_code": "1000",
        "country": "BG",
        "lat": 42.6954,
        "lng": 23.3239,
        "phone": "+359 2 123 4567",
        "email": "info@restaurant-sofia.bg",
        "working_hours": {
          "monday": { "start": "12:00", "end": "22:00" },
          "tuesday": { "start": "12:00", "end": "22:00" },
          "wednesday": { "start": "12:00", "end": "22:00" },
          "thursday": { "start": "12:00", "end": "22:00" },
          "friday": { "start": "12:00", "end": "23:00" },
          "saturday": { "start": "12:00", "end": "23:00" },
          "sunday": { "start": "12:00", "end": "21:00" }
        }
      }
    ],
    "images": [
      {
        "url": "https://cdn.boomcard.bg/deals/deal_123456_1.jpg",
        "type": "main",
        "alt": "Restaurant interior"
      },
      {
        "url": "https://cdn.boomcard.bg/deals/deal_123456_2.jpg",
        "type": "gallery",
        "alt": "Signature dish"
      }
    ],
    "videos": [
      {
        "url": "https://cdn.boomcard.bg/deals/deal_123456_video.mp4",
        "thumbnail": "https://cdn.boomcard.bg/deals/deal_123456_video_thumb.jpg",
        "duration": 30
      }
    ],
    "tags": ["dinner", "bulgarian_cuisine", "romantic", "business_lunch"],
    "seo": {
      "title": {
        "en": "20% Off Fine Dining at Restaurant Sofia | BOOM Card",
        "bg": "20% Отстъпка в Ресторант София | BOOM Card"
      },
      "description": {
        "en": "Save 20% on all main courses at Restaurant Sofia with BOOM Card...",
        "bg": "Спестете 20% от всички основни ястия в Ресторант София с BOOM Card..."
      },
      "keywords": ["restaurant", "sofia", "discount", "bulgarian cuisine"]
    },
    "analytics": {
      "usage_count": 1234,
      "view_count": 5678,
      "favorite_count": 234,
      "share_count": 89,
      "average_rating": 4.7,
      "conversion_rate": 21.5
    },
    "related_deals": [
      {
        "id": "deal_234567",
        "title": "15% off lunch menu",
        "partner_na