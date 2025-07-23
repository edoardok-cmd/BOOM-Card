# Locations API Examples

## Overview
The Locations API provides endpoints for managing geographical data including countries, cities, regions, and location-based searches for the BOOM Card platform.

## Authentication
All endpoints require authentication using Bearer token in the Authorization header.

```bash
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get All Countries
Retrieve a list of all supported countries.

#### Request
```http
GET /api/v1/locations/countries
Accept: application/json
Accept-Language: en
```

#### Response
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "id": "bg",
        "code": "BG",
        "name": "Bulgaria",
        "flag": "🇧🇬",
        "phoneCode": "+359",
        "currency": "BGN",
        "languages": ["bg", "en"],
        "timezone": "Europe/Sofia"
      },
      {
        "id": "uk",
        "code": "GB",
        "name": "United Kingdom",
        "flag": "🇬🇧",
        "phoneCode": "+44",
        "currency": "GBP",
        "languages": ["en"],
        "timezone": "Europe/London"
      }
    ],
    "total": 2
  }
}
```

### 2. Get Cities by Country
Retrieve all cities for a specific country.

#### Request
```http
GET /api/v1/locations/countries/bg/cities
Accept: application/json
Accept-Language: bg
```

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for city names

#### Response
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": "sofia",
        "name": "София",
        "nameEn": "Sofia",
        "countryCode": "BG",
        "region": "София-град",
        "population": 1236047,
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "timezone": "Europe/Sofia"
      },
      {
        "id": "plovdiv",
        "name": "Пловдив",
        "nameEn": "Plovdiv",
        "countryCode": "BG",
        "region": "Пловдив",
        "population": 346893,
        "coordinates": {
          "lat": 42.1354,
          "lng": 24.7453
        },
        "timezone": "Europe/Sofia"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 257,
      "pages": 13
    }
  }
}
```

### 3. Search Locations
Search for locations by name or coordinates.

#### Request
```http
POST /api/v1/locations/search
Content-Type: application/json
Accept-Language: en

{
  "query": "Sofia",
  "types": ["city", "region"],
  "countryCode": "BG",
  "limit": 10
}
```

#### Request Body Parameters
- `query` (required): Search query string
- `types` (optional): Array of location types to search ["city", "region", "poi"]
- `countryCode` (optional): Filter by country code
- `coordinates` (optional): Search near coordinates
  - `lat`: Latitude
  - `lng`: Longitude
  - `radius`: Search radius in kilometers (default: 50)
- `limit` (optional): Maximum results (default: 10, max: 50)

#### Response
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "sofia",
        "type": "city",
        "name": "Sofia",
        "displayName": "Sofia, Bulgaria",
        "countryCode": "BG",
        "region": "Sofia City",
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "relevance": 1.0
      },
      {
        "id": "sofia-region",
        "type": "region",
        "name": "Sofia Region",
        "displayName": "Sofia Region, Bulgaria",
        "countryCode": "BG",
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        },
        "relevance": 0.8
      }
    ],
    "total": 2
  }
}
```

### 4. Get Location by Coordinates (Reverse Geocoding)
Get location information from coordinates.

#### Request
```http
GET /api/v1/locations/reverse-geocode?lat=42.6977&lng=23.3219
Accept: application/json
```

#### Query Parameters
- `lat` (required): Latitude
- `lng` (required): Longitude
- `types` (optional): Comma-separated location types to return

#### Response
```json
{
  "success": true,
  "data": {
    "location": {
      "address": "bul. Vitosha 1, 1000 Sofia, Bulgaria",
      "city": "Sofia",
      "region": "Sofia City",
      "country": "Bulgaria",
      "countryCode": "BG",
      "postalCode": "1000",
      "coordinates": {
        "lat": 42.6977,
        "lng": 23.3219
      },
      "components": {
        "streetNumber": "1",
        "street": "bul. Vitosha",
        "neighborhood": "Center",
        "city": "Sofia",
        "region": "Sofia City",
        "country": "Bulgaria"
      }
    }
  }
}
```

### 5. Get Nearby Cities
Get cities within a specified radius of coordinates.

#### Request
```http
GET /api/v1/locations/nearby-cities?lat=42.6977&lng=23.3219&radius=100
Accept: application/json
```

#### Query Parameters
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in kilometers (default: 50, max: 500)
- `limit` (optional): Maximum results (default: 10, max: 50)

#### Response
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": "sofia",
        "name": "Sofia",
        "countryCode": "BG",
        "distance": 0,
        "coordinates": {
          "lat": 42.6977,
          "lng": 23.3219
        }
      },
      {
        "id": "pernik",
        "name": "Pernik",
        "countryCode": "BG",
        "distance": 31.2,
        "coordinates": {
          "lat": 42.6000,
          "lng": 23.0333
        }
      },
      {
        "id": "samokov",
        "name": "Samokov",
        "countryCode": "BG",
        "distance": 55.8,
        "coordinates": {
          "lat": 42.3333,
          "lng": 23.5500
        }
      }
    ],
    "searchCenter": {
      "lat": 42.6977,
      "lng": 23.3219
    },
    "radius": 100
  }
}
```

### 6. Create Custom Location (Admin Only)
Add a custom location or point of interest.

#### Request
```http
POST /api/v1/locations/custom
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "type": "poi",
  "name": {
    "en": "Vitosha Boulevard",
    "bg": "Булевард Витоша"
  },
  "description": {
    "en": "Main shopping street in Sofia",
    "bg": "Главната търговска улица в София"
  },
  "cityId": "sofia",
  "countryCode": "BG",
  "coordinates": {
    "lat": 42.6934,
    "lng": 23.3201
  },
  "metadata": {
    "category": "shopping",
    "popularTimes": {
      "saturday": "14:00-20:00",
      "sunday": "14:00-19:00"
    }
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "location": {
      "id": "poi_vitosha_blvd",
      "type": "poi",
      "name": {
        "en": "Vitosha Boulevard",
        "bg": "Булевард Витоша"
      },
      "description": {
        "en": "Main shopping street in Sofia",
        "bg": "Главната търговска улица в София"
      },
      "cityId": "sofia",
      "countryCode": "BG",
      "coordinates": {
        "lat": 42.6934,
        "lng": 23.3201
      },
      "metadata": {
        "category": "shopping",
        "popularTimes": {
          "saturday": "14:00-20:00",
          "sunday": "14:00-19:00"
        }
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 7. Bulk Import Locations (Admin Only)
Import multiple locations from CSV or JSON.

#### Request
```http
POST /api/v1/locations/bulk-import
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

{
  "file": <csv_or_json_file>,
  "type": "city",
  "countryCode": "BG",
  "overwrite": false
}
```

#### CSV Format Example
```csv
name,nameEn,region,lat,lng,population
София,Sofia,София-град,42.6977,23.3219,1236047
Пловдив,Plovdiv,Пловдив,42.1354,24.7453,346893
```

#### Response
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "skipped": 0,
    "errors": [],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

### 8. Get Location Statistics
Get statistics about locations in the system.

#### Request
```http
GET /api/v1/locations/stats
Accept: application/json
Authorization: Bearer <admin_token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "stats": {
      "countries": 2,
      "cities": 512,
      "regions": 28,
      "pointsOfInterest": 1847,
      "customLocations": 234,
      "lastUpdated": "2024-01-15T00:00:00Z",
      "byCountry": {
        "BG": {
          "cities": 257,
          "regions": 28,
          "pointsOfInterest": 1523
        },
        "GB": {
          "cities": 255,
          "regions": 0,
          "pointsOfInterest": 324
        }
      }
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "Invalid latitude or longitude values",
    "details": {
      "lat": "Must be between -90 and 90",
      "lng": "Must be between -180 and 180"
    }
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Location not found",
    "details": {
      "id": "invalid-city-id"
    }
  }
}
```

### 429 Rate Limit Exceeded
```json
{
  "success": false,
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

## Rate Limiting
- General endpoints: 100 requests per hour
- Search endpoints: 50 requests per hour
- Bulk operations: 10 requests per hour

## Webhooks
Subscribe to location updates:

```json
{
  "event": "location.created",
  "data": {
    "id": "new-location-id",
    "type": "city",
    "name": "New City",
    "countryCode": "BG"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { BoomCardAPI } from '@boomcard/sdk';

const api = new BoomCardAPI({ apiKey: 'your-api-key' });

// Search locations
const results = await api.locations.search({
  query: