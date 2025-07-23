# BOOM Card - Discount Card Platform

A comprehensive discount card platform that connects consumers with restaurants, hotels, spas, and entertainment venues through QR code-based transactions. The platform includes subscription management, POS system integration, and multi-stakeholder dashboards.

## Project Overview

BOOM Card is a modern discount platform designed to bridge the gap between businesses and consumers through digital discount cards. Users can discover deals, make purchases, and redeem discounts using QR codes, while businesses gain access to powerful analytics and customer insights.

### Key Benefits

- **For Consumers**: Access to exclusive discounts, easy QR code redemption, personalized recommendations
- **For Businesses**: Increased customer traffic, detailed analytics, targeted marketing capabilities
- **For Platform**: Scalable revenue model through subscriptions and transaction fees

## Features

### Consumer Features
- **Smart Search Engine** - Filter by location, category, discount percentage
- **QR Code Generation** - Unique codes for each transaction
- **Digital Wallet** - Store and manage discount cards
- **Purchase History** - Track savings and transactions
- **Personalized Recommendations** - AI-driven deal suggestions
- **Multi-language Support** - Bulgarian and English initially
- **Mobile Applications** - Native iOS and Android apps
- **Social Sharing** - Share deals with friends
- **Favorites System** - Save preferred venues and deals
- **Real-time Notifications** - Deal alerts and updates

### Business Partner Features
- **Partner Dashboard** - Comprehensive business management portal
- **Analytics Suite** - Customer behavior, peak hours, popular items
- **Campaign Management** - Create and manage discount campaigns
- **QR Code Scanner** - Mobile app for staff to validate discounts
- **Revenue Tracking** - Real-time transaction monitoring
- **Customer Insights** - Demographics and purchasing patterns
- **Inventory Management** - Track deal availability
- **Staff Management** - Multi-user access with roles
- **API Access** - POS system integration
- **Marketing Tools** - Email campaigns and promotions

### Admin Features
- **Platform Analytics** - System-wide metrics and KPIs
- **User Management** - Consumer and partner account administration
- **Content Moderation** - Review and approve partner content
- **Financial Dashboard** - Revenue, subscriptions, commissions
- **Support System** - Ticket management and communication
- **Compliance Tools** - GDPR and regulatory compliance
- **System Configuration** - Platform settings and features
- **Audit Logs** - Complete activity tracking
- **Automated Reporting** - Scheduled reports and alerts
- **A/B Testing** - Feature and pricing experiments

## Tech Stack Details

### Frontend
```javascript
// Web Application
- React 18.2+ with TypeScript
- Next.js 14+ for SSR/SSG
- Redux Toolkit for state management
- Material-UI v5 for components
- React Query for data fetching
- Framer Motion for animations
- Chart.js for analytics visualization

// Mobile Applications
- React Native 0.72+
- React Navigation 6
- React Native Paper
- AsyncStorage for offline data
- React Native Camera for QR scanning
```

### Backend
```javascript
// API Services
- Node.js 20 LTS with TypeScript
- Express.js / Fastify framework
- GraphQL with Apollo Server
- REST API for third-party integrations
- WebSocket for real-time updates

// Microservices
- Authentication Service
- Payment Processing Service
- Analytics Service
- Notification Service
- QR Code Service
```

### Database
```sql
-- Primary Database
PostgreSQL 15+ with:
- User accounts and profiles
- Business partner data
- Transaction records
- Analytics data

-- Caching Layer
Redis 7+ for:
- Session management
- API response caching
- Real-time analytics
- Rate limiting
```

### Infrastructure
```yaml
# Cloud Services
- AWS/GCP/Azure deployment
- Kubernetes orchestration
- Docker containerization
- CloudFront CDN
- S3/Cloud Storage for assets

# Monitoring
- Prometheus + Grafana
- ELK Stack for logging
- Sentry for error tracking
- New Relic APM
```

## Prerequisites

### Development Environment
```bash
# Required Software
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Git 2.40+

# Optional but Recommended
- VS Code with extensions
- Postman/Insomnia
- pgAdmin 4
- Redis Commander
```

### System Requirements
- **OS**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 20GB free space
- **CPU**: 4+ cores recommended

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
cp apps/mobile/.env.example apps/mobile/.env.local

# Edit configuration files with your values
nano .env.local
```

### 3. Database Setup
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Or use yarn
yarn install
yarn workspaces run install
```

### 5. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:api    # Backend API
npm run dev:web    # Web frontend
npm run dev:admin  # Admin panel
```

## Configuration

### Environment Variables
```bash
# API Configuration (.env.api)
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/boomcard
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@boomcard.com

# AWS Services
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
S3_BUCKET_NAME=boomcard-assets

# Web Configuration (.env.web)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
```

### Database Configuration
```javascript
// config/database.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'boomcard_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' }
  }
};
```

## Usage Examples

### Consumer Registration
```javascript
// POST /api/auth/register
const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    })
  });
  
  const { user, tokens } = await response.json();
  localStorage.setItem('accessToken', tokens.access);
  return user;
};
```

### QR Code Generation
```javascript
// POST /api/qr/generate
const generateQRCode = async (dealId, userId) => {
  const response = await fetch(`${API_URL}/qr/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dealId,
      userId,
      expiresIn: 300 // 5 minutes
    })
  });
  
  const { qrCode, transactionId } = await response.json();
  return { qrCode, transactionId };
};
```

### Partner Dashboard Analytics
```javascript
// GET /api/analytics/partner/:partnerId
const getPartnerAnalytics = async (partnerId, dateRange) => {
  const params = new URLSearchParams({
    startDate: dateRange.start,
    endDate: dateRange.end,
    metrics: 'revenue,customers,transactions'
  });
  
  const response = await fetch(
    `${API_URL}/analytics/partner/${partnerId}?${params}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  
  return response.json();
};
```

## API Documentation

### Authentication Endpoints
```typescript
// Register new user
POST /api/auth/register
Body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Login
POST /api/auth/login
Body: {
  email: string;
  password: string;
}

// Refresh token
POST /api/auth/refresh
Body: {
  refreshToken: string;
}

// Logout
POST /api/auth/logout
Headers: {
  Authorization: Bearer <token>
}
```

### Deal Management
```typescript
// Get all deals with filters
GET /api/deals
Query: {
  category?: string;
  location?: string;
  minDiscount?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Get deal details
GET /api/deals/:dealId

// Create deal (Partner only)
POST /api/deals
Headers: {
  Authorization: Bearer <token>
}
Body: {
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  validFrom: Date;
  validUntil: Date;
  maxRedemptions?: number;
  terms?: string[];
}
```

### Transaction Processing
```typescript
// Create transaction
POST /api/transactions
Body: {
  dealId: string;
  qrCode: string;
  amount: number;
}

// Validate QR code
POST /api/transactions/validate
Body: {
  qrCode: string;
  partnerId: string;
}

// Get transaction history
GET /api/transactions/history
Query: {
  userId?: string;
  partnerId?: string;
  startDate?: Date;
  endDate?: Date;
}
```

## Project Structure

```
boom-card/
├── apps/
│   ├── web/                 # Next.js consumer web app
│   │   ├── src/
│   