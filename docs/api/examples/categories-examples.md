# Categories API Examples

## Get All Categories

### Request
```http
GET /api/v1/categories
Accept-Language: en
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "slug": "food-drink",
      "name": "Food & Drink",
      "description": "Restaurants, cafés, bars and more",
      "icon": "restaurant",
      "color": "#FF6B6B",
      "subcategories": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "slug": "restaurants",
          "name": "Restaurants",
          "parentId": "550e8400-e29b-41d4-a716-446655440001",
          "icon": "restaurant_menu",
          "partnersCount": 156
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "slug": "cafes-coffee",
          "name": "Cafés & Coffee Shops",
          "parentId": "550e8400-e29b-41d4-a716-446655440001",
          "icon": "coffee",
          "partnersCount": 89
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "slug": "bars-pubs",
          "name": "Bars & Pubs",
          "parentId": "550e8400-e29b-41d4-a716-446655440001",
          "icon": "local_bar",
          "partnersCount": 67
        }
      ],
      "partnersCount": 312,
      "averageDiscount": 15.5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "slug": "entertainment-nightlife",
      "name": "Entertainment & Nightlife",
      "description": "Clubs, venues, events and more",
      "icon": "nightlife",
      "color": "#4ECDC4",
      "subcategories": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440006",
          "slug": "nightclubs",
          "name": "Nightclubs",
          "parentId": "550e8400-e29b-41d4-a716-446655440005",
          "icon": "music_note",
          "partnersCount": 23
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440007",
          "slug": "live-music",
          "name": "Live Music Venues",
          "parentId": "550e8400-e29b-41d4-a716-446655440005",
          "icon": "mic",
          "partnersCount": 18
        }
      ],
      "partnersCount": 78,
      "averageDiscount": 20.0
    }
  ],
  "meta": {
    "totalCategories": 5,
    "totalSubcategories": 24
  }
}
```

## Get Single Category with Details

### Request
```http
GET /api/v1/categories/food-drink
Accept-Language: bg
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "food-drink",
    "name": "Храна и напитки",
    "description": "Ресторанти, кафенета, барове и още",
    "icon": "restaurant",
    "color": "#FF6B6B",
    "image": "https://cdn.boomcard.bg/categories/food-drink-hero.jpg",
    "seoTitle": "Отстъпки в ресторанти и барове | BOOM Card",
    "seoDescription": "Спестете до 30% в най-добрите ресторанти, кафенета и барове с BOOM Card",
    "subcategories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "slug": "restaurants",
        "name": "Ресторанти",
        "description": "Фини заведения, семейни ресторанти, бързо хранене",
        "parentId": "550e8400-e29b-41d4-a716-446655440001",
        "icon": "restaurant_menu",
        "filters": [
          {
            "key": "cuisine",
            "label": "Кухня",
            "type": "multi-select",
            "options": [
              { "value": "bulgarian", "label": "Българска" },
              { "value": "italian", "label": "Италианска" },
              { "value": "asian", "label": "Азиатска" },
              { "value": "mediterranean", "label": "Средиземноморска" }
            ]
          },
          {
            "key": "dietary",
            "label": "Диетични опции",
            "type": "multi-select",
            "options": [
              { "value": "vegan", "label": "Веган" },
              { "value": "vegetarian", "label": "Вегетарианско" },
              { "value": "gluten-free", "label": "Без глутен" },
              { "value": "halal", "label": "Халал" }
            ]
          },
          {
            "key": "priceRange",
            "label": "Ценови диапазон",
            "type": "select",
            "options": [
              { "value": "budget", "label": "€" },
              { "value": "moderate", "label": "€€" },
              { "value": "expensive", "label": "€€€" },
              { "value": "luxury", "label": "€€€€" }
            ]
          }
        ],
        "partnersCount": 156,
        "topPartners": [
          {
            "id": "partner-001",
            "name": "Ресторант Петрус",
            "logo": "https://cdn.boomcard.bg/partners/petrus-logo.jpg",
            "discount": 20,
            "rating": 4.8
          }
        ]
      }
    ],
    "partnersCount": 312,
    "averageDiscount": 15.5,
    "popularFilters": [
      {
        "type": "cuisine",
        "value": "bulgarian",
        "count": 89
      },
      {
        "type": "dietary",
        "value": "vegetarian",
        "count": 67
      }
    ],
    "featuredPartners": [
      {
        "id": "partner-002",
        "name": "Sky Bar & Dining",
        "slug": "sky-bar-dining",
        "logo": "https://cdn.boomcard.bg/partners/sky-bar-logo.jpg",
        "coverImage": "https://cdn.boomcard.bg/partners/sky-bar-cover.jpg",
        "category": "bars-pubs",
        "subcategory": "sky-bars",
        "discount": 25,
        "rating": 4.9,
        "reviewsCount": 234,
        "location": {
          "city": "София",
          "area": "Център"
        }
      }
    ]
  }
}
```

## Create New Category (Admin)

### Request
```http
POST /api/v1/admin/categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": {
    "en": "Health & Beauty",
    "bg": "Здраве и красота"
  },
  "description": {
    "en": "Spas, salons, wellness centers",
    "bg": "Спа центрове, салони, уелнес"
  },
  "slug": "health-beauty",
  "icon": "spa",
  "color": "#FF69B4",
  "seoTitle": {
    "en": "Health & Beauty Discounts | BOOM Card",
    "bg": "Отстъпки за здраве и красота | BOOM Card"
  },
  "seoDescription": {
    "en": "Save up to 30% on spa treatments, beauty services and wellness",
    "bg": "Спестете до 30% на спа процедури, козметични услуги и уелнес"
  },
  "order": 3,
  "isActive": true
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "slug": "health-beauty",
    "name": "Health & Beauty",
    "description": "Spas, salons, wellness centers",
    "icon": "spa",
    "color": "#FF69B4",
    "order": 3,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Update Category

### Request
```http
PATCH /api/v1/admin/categories/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": {
    "en": "Food & Beverages",
    "bg": "Храна и напитки"
  },
  "color": "#FF5252",
  "order": 1
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "food-drink",
    "name": "Food & Beverages",
    "color": "#FF5252",
    "order": 1,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## Delete Category

### Request
```http
DELETE /api/v1/admin/categories/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer {admin_token}
```

### Response
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

## Get Category Statistics

### Request
```http
GET /api/v1/admin/categories/550e8400-e29b-41d4-a716-446655440001/statistics
Authorization: Bearer {admin_token}
```

### Response
```json
{
  "success": true,
  "data": {
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "categoryName": "Food & Drink",
    "statistics": {
      "totalPartners": 312,
      "activePartners": 298,
      "totalTransactions": 45678,
      "totalSavings": 234567.89,
      "averageDiscount": 15.5,
      "topSubcategories": [
      