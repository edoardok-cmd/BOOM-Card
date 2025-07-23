# BOOM Card Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.boomcard.com/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### 1. User Management

#### Register User
```
POST /users/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359 888 123 456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "cardNumber": "BC-2024-5849",
      "membershipType": "Basic",
      "validUntil": "2025-12-31"
    },
    "token": "eyJ..."
  }
}
```

#### Login
```
POST /users/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /users/profile
```
**Headers:** Authorization required

#### Update Profile
```
PUT /users/profile
```
**Headers:** Authorization required
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+359 888 123 456",
  "birthDate": "1990-01-01",
  "address": "123 Main St, Sofia"
}
```

#### Update Password
```
PUT /users/password
```
**Headers:** Authorization required
**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### 2. Review Management

#### Get Recent Reviews
```
GET /reviews/recent?limit=10
```
**Query Params:**
- `limit` (optional): Number of reviews to return (default: 10)

#### Get Partner Reviews
```
GET /reviews/partner/:partnerId
```

#### Get Partner Stats
```
GET /reviews/stats/:partnerId
```
**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25
  }
}
```

#### Get User's Reviews
```
GET /reviews/my-reviews
```
**Headers:** Authorization required

#### Create Review
```
POST /reviews
```
**Headers:** Authorization required
**Body:**
```json
{
  "partnerId": "restaurant-paradise",
  "partnerName": "Restaurant Paradise",
  "rating": 5,
  "content": "Amazing food and great service!"
}
```

#### Update Review
```
PUT /reviews/:id
```
**Headers:** Authorization required
**Body:**
```json
{
  "rating": 4,
  "content": "Updated review content"
}
```

#### Delete Review
```
DELETE /reviews/:id
```
**Headers:** Authorization required

### 3. QR Code Generation

#### Generate Membership QR Code
```
GET /qrcode/membership
```
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "cardNumber": "BC-2024-5847",
    "validUntil": "2025-12-31",
    "membershipType": "Premium"
  }
}
```

#### Generate Discount QR Code
```
POST /qrcode/discount
```
**Headers:** Authorization required
**Body:**
```json
{
  "partnerId": "restaurant-paradise",
  "discountCode": "SUMMER2024",
  "validDays": 30
}
```

#### Generate Partner QR Code
```
POST /qrcode/partner
```
**Headers:** Authorization required
**Body:**
```json
{
  "partnerId": "restaurant-paradise",
  "partnerName": "Restaurant Paradise"
}
```

#### Verify QR Code
```
POST /qrcode/verify
```
**Body:**
```json
{
  "qrData": "{\"type\":\"membership\",\"userId\":1,\"cardNumber\":\"BC-2024-5847\"}"
}
```

#### Download QR Code
```
GET /qrcode/download/:type
```
**Headers:** Authorization required
**Params:**
- `type`: One of `membership`, `discount`, `partner`

### 4. Health Check

#### API Health
```
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-07-22T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "requestId": "req_123456789_abc",
  "stack": "..." // Only in development
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  member_since TIMESTAMP DEFAULT NOW(),
  membership_type VARCHAR(20) DEFAULT 'Basic',
  card_number VARCHAR(20) UNIQUE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  partner_id VARCHAR(255) NOT NULL,
  partner_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Credentials

For development and testing:
- Email: `alex.stefanov@email.com`
- Password: `password123`

## Frontend Integration

The frontend should store the JWT token in localStorage:
```javascript
// Store token after login
localStorage.setItem('token', response.data.token);

// Use token in API calls
const response = await fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Next Steps

Future API endpoints to implement:
1. Partner management (CRUD operations for partners)
2. Subscription/membership plans management
3. Payment integration (Stripe)
4. Email notifications
5. SMS notifications
6. Analytics and reporting