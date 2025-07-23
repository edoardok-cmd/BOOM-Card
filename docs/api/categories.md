# Categories API

## Overview

The Categories API provides endpoints for managing and retrieving business categories and subcategories used throughout the BOOM Card platform. Categories are hierarchical and support multi-language content.

## Base URL

```
https://api.boomcard.bg/v1/categories
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Public endpoints are marked accordingly.

## Data Models

### Category Object

```typescript
interface Category {
  id: string;
  slug: string;
  parentId: string | null;
  type: 'primary' | 'secondary';
  sortOrder: number;
  isActive: boolean;
  icon: string;
  colorTheme: {
    primary: string;
    secondary: string;
    gradient?: string;
  };
  metadata: {
    searchKeywords: string[];
    popularityScore: number;
    partnerCount: number;
  };
  translations: {
    [locale: string]: {
      name: string;
      description: string;
      metaTitle?: string;
      metaDescription?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

### CategoryTree Object

```typescript
interface CategoryTree extends Category {
  children: CategoryTree[];
  path: string[];
  level: number;
}
```

## Endpoints

### List All Categories

Returns a hierarchical list of all active categories.

**Endpoint:** `GET /categories`

**Authentication:** Not required (public)

**Query Parameters:**
- `locale` (string, optional): Language code (en, bg). Default: bg
- `type` (string, optional): Filter by category type (primary, secondary)
- `includeInactive` (boolean, optional): Include inactive categories. Default: false
- `flat` (boolean, optional): Return flat list instead of tree. Default: false

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_food_drink",
        "slug": "food-and-drink",
        "parentId": null,
        "type": "primary",
        "sortOrder": 1,
        "isActive": true,
        "icon": "restaurant",
        "colorTheme": {
          "primary": "#FF6B6B",
          "secondary": "#FFE66D",
          "gradient": "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
        },
        "metadata": {
          "searchKeywords": ["restaurant", "food", "dining"],
          "popularityScore": 95,
          "partnerCount": 342
        },
        "translations": {
          "en": {
            "name": "Food & Drink",
            "description": "Discover restaurants, cafes, and bars"
          },
          "bg": {
            "name": "Храна и напитки",
            "description": "Открийте ресторанти, кафенета и барове"
          }
        },
        "children": [
          {
            "id": "cat_restaurants",
            "slug": "restaurants",
            "parentId": "cat_food_drink",
            "type": "secondary",
            "sortOrder": 1,
            "isActive": true,
            "icon": "restaurant_menu",
            "translations": {
              "en": {
                "name": "Restaurants",
                "description": "All types of restaurants"
              },
              "bg": {
                "name": "Ресторанти",
                "description": "Всички видове ресторанти"
              }
            },
            "children": []
          }
        ]
      }
    ],
    "total": 15
  }
}
```

### Get Category by ID

Retrieve details of a specific category.

**Endpoint:** `GET /categories/{categoryId}`

**Authentication:** Not required (public)

**Path Parameters:**
- `categoryId` (string, required): Category ID or slug

**Query Parameters:**
- `locale` (string, optional): Language code (en, bg). Default: bg
- `includeChildren` (boolean, optional): Include child categories. Default: true
- `includeParents` (boolean, optional): Include parent path. Default: false

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat_restaurants",
      "slug": "restaurants",
      "parentId": "cat_food_drink",
      "type": "secondary",
      "sortOrder": 1,
      "isActive": true,
      "icon": "restaurant_menu",
      "colorTheme": {
        "primary": "#FF6B6B",
        "secondary": "#FFE66D"
      },
      "metadata": {
        "searchKeywords": ["restaurant", "dining", "food"],
        "popularityScore": 88,
        "partnerCount": 215
      },
      "translations": {
        "en": {
          "name": "Restaurants",
          "description": "All types of restaurants",
          "metaTitle": "Restaurant Discounts | BOOM Card",
          "metaDescription": "Save up to 20% at top restaurants"
        },
        "bg": {
          "name": "Ресторанти",
          "description": "Всички видове ресторанти",
          "metaTitle": "Ресторантски отстъпки | BOOM Card",
          "metaDescription": "Спестете до 20% в топ ресторанти"
        }
      },
      "path": ["food-and-drink", "restaurants"],
      "parent": {
        "id": "cat_food_drink",
        "slug": "food-and-drink",
        "translations": {
          "en": { "name": "Food & Drink" },
          "bg": { "name": "Храна и напитки" }
        }
      },
      "children": [
        {
          "id": "cat_fine_dining",
          "slug": "fine-dining",
          "translations": {
            "en": { "name": "Fine Dining" },
            "bg": { "name": "Фино хранене" }
          }
        }
      ]
    }
  }
}
```

### Search Categories

Search categories by name or keywords.

**Endpoint:** `GET /categories/search`

**Authentication:** Not required (public)

**Query Parameters:**
- `q` (string, required): Search query
- `locale` (string, optional): Language code (en, bg). Default: bg
- `limit` (number, optional): Maximum results. Default: 10
- `type` (string, optional): Filter by category type

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "cat_italian",
        "slug": "italian-cuisine",
        "parentId": "cat_restaurants",
        "type": "secondary",
        "translations": {
          "en": {
            "name": "Italian Cuisine",
            "description": "Authentic Italian restaurants"
          },
          "bg": {
            "name": "Италианска кухня",
            "description": "Автентични италиански ресторанти"
          }
        },
        "path": ["food-and-drink", "restaurants", "italian-cuisine"],
        "matchScore": 0.95
      }
    ],
    "total": 3
  }
}
```

### Create Category (Admin)

Create a new category.

**Endpoint:** `POST /categories`

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "slug": "vegan-restaurants",
  "parentId": "cat_restaurants",
  "type": "secondary",
  "sortOrder": 5,
  "isActive": true,
  "icon": "eco",
  "colorTheme": {
    "primary": "#4CAF50",
    "secondary": "#8BC34A"
  },
  "metadata": {
    "searchKeywords": ["vegan", "plant-based", "vegetarian"],
    "popularityScore": 75
  },
  "translations": {
    "en": {
      "name": "Vegan Restaurants",
      "description": "Plant-based dining options",
      "metaTitle": "Vegan Restaurant Discounts | BOOM Card",
      "metaDescription": "Save at the best vegan restaurants"
    },
    "bg": {
      "name": "Веган ресторанти",
      "description": "Растителни хранителни опции",
      "metaTitle": "Отстъпки за веган ресторанти | BOOM Card",
      "metaDescription": "Спестете в най-добрите веган ресторанти"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat_vegan_restaurants",
      "slug": "vegan-restaurants",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Update Category (Admin)

Update an existing category.

**Endpoint:** `PUT /categories/{categoryId}`

**Authentication:** Required (Admin role)

**Path Parameters:**
- `categoryId` (string, required): Category ID

**Request Body:**
```json
{
  "sortOrder": 3,
  "isActive": true,
  "metadata": {
    "popularityScore": 85
  },
  "translations": {
    "en": {
      "description": "Best plant-based dining experiences"
    }
  }
}
```

### Delete Cate