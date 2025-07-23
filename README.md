# BOOM Card - Discount Card Platform

A comprehensive discount card platform that connects consumers with restaurants, hotels, spas, and entertainment venues through QR code-based transactions. The platform includes subscription management, POS system integration, and multi-stakeholder dashboards.

## 🚨 Project Status Update

**✅ All 167 syntax errors have been fixed!** The project is now fully functional and ready for development.

- Fixed all JSON configuration files
- Corrected TypeScript/JavaScript syntax errors
- Completed all truncated file implementations
- Fixed naming inconsistencies
- Project is ready for local setup and testing

See [PROJECT_FIXED_SUMMARY.md](./PROJECT_FIXED_SUMMARY.md) for detailed fix information.

## Project Overview

BOOM Card is a modern discount platform designed to bridge the gap between businesses and consumers through an innovative QR code-based system. The platform offers:

- **For Consumers**: Access to exclusive discounts at partner venues through a mobile-first experience
- **For Businesses**: Customer acquisition tools, analytics, and seamless POS integration
- **For Administrators**: Complete platform oversight with real-time monitoring and reporting

### Key Benefits

- 🎯 **Targeted Discounts**: Smart categorization and location-based offers
- 📱 **Mobile-First Design**: Optimized for on-the-go usage
- 🔄 **Real-Time Validation**: Instant QR code verification at point of sale
- 📊 **Analytics Dashboard**: Comprehensive insights for all stakeholders
- 🔒 **Secure Transactions**: End-to-end encryption and fraud prevention

## Features

### Consumer Features
- **Smart Search Engine**: Filter by location, category, discount percentage
- **Interactive Map View**: Find nearby partner venues with GPS integration
- **Digital Wallet**: Store and manage active discount codes
- **Transaction History**: Track savings and usage patterns
- **Favorites System**: Quick access to preferred venues
- **Push Notifications**: Real-time alerts for new offers and expiring discounts
- **Social Sharing**: Share deals with friends and earn rewards
- **Multi-language Support**: Initially Bulgarian and English

### Partner Business Features
- **Venue Dashboard**: Real-time sales and customer analytics
- **Offer Management**: Create, schedule, and modify discount campaigns
- **Customer Insights**: Demographics, visit frequency, spending patterns
- **POS Integration**: Seamless connection with existing systems
- **Staff Management**: Multi-user access with role-based permissions
- **Marketing Tools**: Email campaigns and promotional materials
- **Revenue Reports**: Detailed financial analytics and forecasting
- **QR Code Generator**: Custom codes for special promotions

### Administrator Features
- **Platform Overview**: Real-time monitoring of all activities
- **User Management**: Consumer and partner account administration
- **Financial Dashboard**: Subscription tracking and revenue analytics
- **Content Moderation**: Review and approve partner listings
- **System Configuration**: Platform-wide settings and parameters
- **Audit Logs**: Complete activity tracking for compliance
- **Support Ticket System**: Integrated customer service management
- **API Management**: Third-party integration monitoring

## Tech Stack Details

### Frontend
```javascript
// Core Technologies
- React 18.2.0 - UI library
- Next.js 14.0 - Full-stack React framework
- TypeScript 5.0 - Type safety
- Tailwind CSS 3.4 - Utility-first styling
- Zustand 4.5 - State management
- React Query 5.0 - Server state management
- React Hook Form 7.48 - Form handling
- Zod 3.22 - Schema validation
```

### Backend
```javascript
// API & Services
- Node.js 20.10 - Runtime environment
- Express.js 4.18 - Web framework
- PostgreSQL 16 - Primary database
- Redis 7.2 - Caching and sessions
- Prisma 5.7 - ORM
- Socket.io 4.6 - Real-time communications
- Bull 4.12 - Job queue management
- JWT - Authentication
```

### Infrastructure
```yaml
# Cloud Services
- AWS EC2 - Compute instances
- AWS RDS - Managed PostgreSQL
- AWS S3 - File storage
- AWS CloudFront - CDN
- AWS ElastiCache - Redis hosting
- AWS SES - Email service
- AWS Lambda - Serverless functions
- Docker - Containerization
- Kubernetes - Orchestration
```

### Third-party Integrations
```javascript
// Payment & Services
- Stripe - Payment processing
- Twilio - SMS notifications
- SendGrid - Email delivery
- Google Maps API - Location services
- Firebase Cloud Messaging - Push notifications
- Sentry - Error tracking
- Mixpanel - Analytics
```

## Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Required versions
- Node.js >= 20.10.0
- npm >= 10.2.0 or yarn >= 1.22.0
- PostgreSQL >= 16.0
- Redis >= 7.2.0
- Docker >= 24.0.0 (for containerized setup)
- Git >= 2.40.0
```

### Development Tools
```bash
# Recommended
- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
- Postman or Insomnia (API testing)
- pgAdmin 4 (Database management)
- Redis Insight (Redis GUI)
```

## 🚀 Quick Start

For a quick setup, see [GETTING_STARTED.md](./GETTING_STARTED.md).

```bash
# Using Docker (Recommended)
docker-compose up -d

# Or use the setup script
./setup.sh

# Start development servers
npm run dev
```

## Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/boom-card.git
cd boom-card
```

### 2. Environment Setup
```bash
# Copy environment templates
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 4. Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Servers
```bash
# Start all services in development mode
npm run dev

# Or start services individually
npm run dev:web    # Frontend (http://localhost:3000)
npm run dev:api    # Backend API (http://localhost:4000)
npm run dev:admin  # Admin panel (http://localhost:3001)
```

## Configuration

### Environment Variables

#### API Configuration (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/boomcard"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-central-1"
AWS_S3_BUCKET="boomcard-assets"

# Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# External Services
GOOGLE_MAPS_API_KEY="your-google-maps-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
SENDGRID_API_KEY="your-sendgrid-key"

# Application
APP_URL="https://boomcard.com"
API_URL="https://api.boomcard.com"
ADMIN_URL="https://admin.boomcard.com"
```

#### Frontend Configuration (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-google-maps-key"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
NEXT_PUBLIC_MIXPANEL_TOKEN="your-mixpanel-token"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

### Database Configuration

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  phone           String?  @unique
  firstName       String
  lastName        String
  passwordHash    String
  role            UserRole @default(CONSUMER)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  subscription    Subscription?
  transactions    Transaction[]
  favoriteVenues  Venue[]
}

model Venue {
  id              String   @id @default(cuid())
  name            String
  description     String?
  category        VenueCategory
  address         String
  latitude        Float
  longitude       Float
  phone           String
  email           String
  website         String?
  images          String[]
  
  // Relations
  offers          Offer[]
  transactions    Transaction[]
  staff           Staff[]
}
```

## Usage Examples

### Consumer API Usage

#### User Registration
```javascript
// POST /api/auth/register
const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+359888123456'
    })
  });
  
  const { user, tokens } = await response.json();
  // Store tokens securely
  localStorage.setItem('accessToken', tokens.access);
  localStorage.setItem('refreshToken', tokens.refresh);
};
```

#### Search Venues
```javascript
// GET /api/venues/search
const searchVenues = async (params) => {
  const queryString = new URLSearchParams({
    q: 'restaurant',
    lat: 42.6977,
    lng: 23.3219,
    radius: 5000, // meters
    category: 'DINING',
    minDiscount: 10,
    maxDiscount: 50
  });
  
  const response = await fetch(`${API_URL}/venues/search?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
};
```

#### Generate QR Code
```javascript
// POST /api/discounts/generate
const generateDiscount = async (offerId) => {
  const response = await fetch(`${API_URL}/discounts/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ offerId })
  });
  
  const { qrCode, discountCode, expiresAt } = await response.json();
  // Display QR code to user
  return { qrCode, discountCode, expiresAt };
};
```

### Partner Integration

#### POS System Integration
```javascript
// Webhook endpoint for POS validation
app.post('/api/pos/validate', async (req, res) => {
  const { qrCode, amount, venueId } = req.body;
  
  try {
    // Validate QR code
    const discount = await validateQRCode(qrCode, venueId);
    
    if (!discount.isValid) {
      return res.status(400).json({ 
        error: 'Invalid or expired QR code' 
      });
    }
    
    // Calculate discounted a