# Locations API

## Overview

The Locations API provides endpoints for managing geographic locations, cities, regions, and location-based search functionality for the BOOM Card platform.

## Base URL

```
https://api.boomcard.bg/v1/locations
```

## Authentication

All endpoints require authentication using Bearer token:

```
Authorization: Bearer <access_token>
```

## Endpoints

### List All Countries

```http
GET /countries
```

Returns a list of all supported countries.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lang | string | No | Language code (en, bg). Defaults to user's preferred language |
| active | boolean | No | Filter by active status |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "bg",
      "name": "Bulgaria",
      "name_bg": "България",
      "code": "BG",
      "phone_code": "+359",
      "currency": "BGN",
      "active": true
    }
  ]
}
```

### List Cities

```http
GET /cities
```

Returns a paginated list of cities.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| country | string | No | Filter by country code |
| region | string | No | Filter by region ID |
| search | string | No | Search by city name |
| popular | boolean | No | Return only popular cities |
| has_partners | boolean | No | Return only cities with active partners |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field (name, partner_count, population) |
| order | string | No | Sort order (asc, desc) |

#### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sofia",
        "name": "Sofia",
        "name_bg": "София",
        "slug": "sofia",
        "country_code": "BG",
        "region": {
          "id": "sofia-region",
          "name": "Sofia Region"
        },
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "population": 1236000,
        "partner_count": 245,
        "popular": true,
        "timezone": "Europe/Sofia"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Get City Details

```http
GET /cities/{cityId}
```

Returns detailed information about a specific city.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cityId | string | Yes | City ID or slug |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sofia",
    "name": "Sofia",
    "name_bg": "София",
    "slug": "sofia",
    "description": "The capital and largest city of Bulgaria",
    "description_bg": "Столицата и най-големият град на България",
    "country_code": "BG",
    "region": {
      "id": "sofia-region",
      "name": "Sofia Region",
      "name_bg": "Софийска област"
    },
    "coordinates": {
      "lat": 42.6977,
      "lng": 23.3219
    },
    "bounds": {
      "north": 42.7505,
      "south": 42.6243,
      "east": 23.4327,
      "west": 23.1905
    },
    "population": 1236000,
    "area_km2": 492,
    "postal_codes": ["1000-1799"],
    "phone_area_code": "02",
    "timezone": "Europe/Sofia",
    "partner_stats": {
      "total": 245,
      "restaurants": 120,
      "hotels": 45,
      "entertainment": 50,
      "wellness": 30
    },
    "popular_areas": [
      {
        "id": "city-center",
        "name": "City Center",
        "name_bg": "Център",
        "partner_count": 85
      }
    ],
    "images": {
      "cover": "https://cdn.boomcard.bg/cities/sofia-cover.jpg",
      "thumbnail": "https://cdn.boomcard.bg/cities/sofia-thumb.jpg"
    }
  }
}
```

### List Regions

```http
GET /regions
```

Returns a list of regions/states.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| country | string | No | Filter by country code |
| search | string | No | Search by region name |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "sofia-region",
      "name": "Sofia Region",
      "name_bg": "Софийска област",
      "country_code": "BG",
      "capital_city": "sofia",
      "city_count": 12,
      "partner_count": 280
    }
  ]
}
```

### Search Locations

```http
GET /search
```

Search across all location types (cities, areas, addresses).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (min 2 characters) |
| types | string[] | No | Location types to search (city, area, address) |
| country | string | No | Limit search to specific country |
| limit | integer | No | Max results (default: 10) |
| lat | number | No | User latitude for proximity ranking |
| lng | number | No | User longitude for proximity ranking |

#### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "city",
        "id": "sofia",
        "name": "Sofia",
        "display_name": "Sofia, Bulgaria",
        "country_code": "BG",
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "relevance_score": 0.95
      },
      {
        "type": "area",
        "id": "sofia-center",
        "name": "Sofia Center",
        "display_name": "Sofia Center, Sofia, Bulgaria",
        "city_id": "sofia",
        "coordinates": {
          "lat": 42.6975,
          "lng": 23.3245
        },
        "relevance_score": 0.85
      }
    ]
  }
}
```

### Geocoding

```http
GET /geocode
```

Convert coordinates to location information.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude |
| lng | number | Yes | Longitude |

#### Response

```json
{
  "success": true,
  "data": {
    "address": {
      "street": "Vitosha Boulevard",
      "street_number": "15",
      "postal_code": "1000",
      "area": "City Center",
      "city": "Sofia",
      "region": "Sofia Region",
      "country": "Bulgaria",
      "country_code": "BG"
    },
    "city": {
      "id": "sofia",
      "name": "Sofia",
      "slug": "sofia"
    },
    "coordinates": {
      "lat": 42.6975,
      "lng": 23.3245
    }
  }
}
```

### Reverse Geocoding

```http
POST /reverse-geocode
```

Convert address to coordinates.

#### Request Body

```json
{
  "address": "Vitosha Boulevard 15, Sofia, Bulgaria",
  "country_code": "BG"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coordinates": {
      "lat": 42.6975,
      "lng": 23.3245
    },
    "address": {
      "formatted": "Vitosha Boulevard 15, 1000 Sofia, Bulgaria",
      "street": "Vitosha Boulevard",
      "street_number": "15",
      "postal_code": "1000",
      "city": "Sofia",
      "country": "Bulgaria"
    },
    "confidence": 0.95
  }
}
```

### Distance Calculation

```http
POST /distance
```

Calculate distance between two points.

#### Request Body

```json
{
  "from": {
    "lat": 42.6977,
    "lng": 23.3219
  },
  "to": {
    "lat": 42.6975,
    "lng": 23.3245
  },
  "unit": "km"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "distance": 0.215,
    "unit": "km",
    "duration": {
      "walking": 180,
      "driving": 60
    }
  }
}
```

### Nearby Locations

```http
GET /nearby
```

Find locations near a point.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Center latitude |
| lng | number | Yes | Center longitude |
| radius | number | No | Search radius in km (default: 5) |
| type | string | No | Location type filter |
| limit | integer | No | Max results (default: 20) |

#### Response

```json
{
  "success": true,
  "data": {
    "center": {
      "lat": 42.6977,
      "lng": 23.3219
    },
    "radius_km": 5,
    "locations": [
      {
        "type": "area",
        "id": "vitosha-blvd",
        "name": "Vitosha Boulevard",
        "distance_km": 0.5,
        "bearing": "SW",
        "partner_count": 25
      }
    ]
  }
}
```

### Popular Areas

```http
GET /cities/{cityId}/areas
```

Get popular areas within a city.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cityId | string | Yes | City ID or slug |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| popular | boolean | No | Return only popular areas |
| has_partners | boolean | No | Return only areas with partners |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "city-center",
      "name": "City Center",
      "name_bg": "Център",
      "city_id": "sofia",
      "bounds": {
        "north": 42.7020,
        "south": 42.6930,
        "east": 23.3290,
        "west": 23.3190
      },
      "center": {
        "lat": 42.6975,
        "lng": 23.3240
      },
      "partner_count": 85,
      "popular": true,
      "tags": ["shopping", "dining", "nightlife"]
    }
  ]
}
```

### Location Suggestions

```http
GET /suggestions
```

Get location suggestions based on user behavior and popularity.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | No | User latitude |
| lng | number | No | User longitude |
| category | string | No | Partner category filter |

#### Response

```json
{
  "success": true,
  "data": {
    "user_location": {
      "city": "Sofia",
      "area": "City Center"
    },
    "suggestions": [
      {
        "type": "trending",
        "locations": [
          {
            "id": "vitosha-blvd",
            "name": "Vitosha Boulevard",
            "reason": "High partner density",
            "partner_count": 45
          }
        ]
      },
