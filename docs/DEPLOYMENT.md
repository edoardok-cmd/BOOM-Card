# BOOM Card Platform Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Infrastructure Requirements](#infrastructure-requirements)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Considerations](#security-considerations)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 7.x or higher
- Docker & Docker Compose (optional but recommended)
- Nginx or similar reverse proxy
- SSL certificates (Let's Encrypt recommended)
- PM2 for process management

### Required Services
- AWS S3 or compatible object storage
- SendGrid or similar email service
- Payment gateway account (Stripe/PayPal)
- SMS gateway (Twilio recommended)
- CDN service (CloudFlare recommended)

## Environment Setup

### Development Environment
```bash
# Clone repository
git clone https://github.com/your-org/boom-card-platform.git
cd boom-card-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.development
# Edit .env.development with your values

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start development servers
npm run dev
```

### Production Environment Variables
```bash
# Application
NODE_ENV=production
APP_NAME="BOOM Card"
APP_URL=https://boomcard.bg
API_URL=https://api.boomcard.bg
PORT=3000
API_PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/boomcard
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
SESSION_SECRET=your-session-secret

# Payment Processing
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx

# Email Service
SENDGRID_API_KEY=xxx
EMAIL_FROM=noreply@boomcard.bg

# SMS Service
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+xxx

# Storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=boomcard-assets
AWS_REGION=eu-central-1

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEW_RELIC_LICENSE_KEY=xxx

# i18n
DEFAULT_LOCALE=bg
SUPPORTED_LOCALES=bg,en
```

## Database Configuration

### PostgreSQL Setup
```sql
-- Create database and user
CREATE DATABASE boomcard;
CREATE USER boomcard_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE boomcard TO boomcard_user;

-- Enable required extensions
\c boomcard
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Database Migrations
```bash
# Run migrations
npm run db:migrate:production

# Rollback if needed
npm run db:rollback:production

# Create new migration
npm run db:migration:create -- --name=add_new_feature
```

### Redis Configuration
```conf
# /etc/redis/redis.conf
bind 127.0.0.1
protected-mode yes
port 6379
requirepass your-redis-password
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Application Deployment

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:14-3.2
    environment:
      POSTGRES_DB: boomcard
      POSTGRES_USER: boomcard_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your-redis-password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    ports:
      - "4000:4000"
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - api
    ports:
      - "3000:3000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### PM2 Deployment
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'boom-api',
      script: './dist/api/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'boom-web',
      script: './node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    },
    {
      name: 'boom-worker',
      script: './dist/worker/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_file: './logs/worker-combined.log',
      time: true
    }
  ]
};
```

### Nginx Configuration
```nginx
# nginx.conf
http {
    upstream api_backend {
        least_conn;
        server localhost:4000;
    }

    upstream web_backend {
        least_conn;
        server localhost:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web_limit:10m rate=30r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.boomcard.bg;

        ssl_certificate /etc/nginx/ssl/api.boomcard.bg.crt;
        ssl_certificate_key /etc/nginx/ssl/api.boomcard.bg.key;

        location / {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Web Application
    server {
        listen 443 ssl http2;
        server_name boomcard.bg www.boomcard.bg;

        ssl_certificate /etc/nginx/ssl/boomcard.bg.crt;
        ssl_certificate_key /etc/nginx/ssl/boomcard.bg.key;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            limit_req zone=web_limit burst=50 nodelay;
            
            proxy_pass http://web_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets
        location /_next/static {
            proxy_pass http://web_backend;
            proxy_cache_valid 200 365d;
            expires 365d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name boomcard.bg www.boomcard.bg api.boomcard.bg;
        return 301 https://$server_name$request_uri;
    }
}
```

## Infrastructure Requirements

### Minimum Production Requirements
- **Web/API Servers**: 2x instances (4 vCPU, 8GB RAM each)
- **Database Server**: 1x instance (8 vCPU, 32GB RAM, 500GB SSD)
- **Redis Server**: 1x instance (2 vCPU, 4GB RAM)
- **Load Balancer**: Application Load Balancer (AWS ALB or similar)
- **Storage**: 1TB S3 bucket for assets
- **Bandwidth**: 1TB/month minimum

### Recommended Production Setup
- **Web/API Servers**: 4x instances with auto-scaling
- **Database**: Primary + Read replica with automated backups
- **Redis**: Cluster mode with 3 nodes
- **CDN**: CloudFlare or AWS CloudFront
- **Monitoring**: New Relic or Datadog
- **Log Management**: ELK Stack or AWS CloudWatch

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            .next/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build-artifacts
      - name: Deploy to servers
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          SERVERS: ${{ secrets.PRODUCTION_SERVERS }}
        run: |
          # Add deployment script here
          ./scripts/deploy.sh
```

### Deployment Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Configuration
DEPLOY_USER="deploy"
APP_DIR="/var/www/boomcard"
BACKUP_DIR="/var/backups/boomcard"

# Create backup
echo "Creating backup..."
ssh $DEPLOY_USER@$SERVER "cd $APP_DIR && tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz ."

# Upload new files
echo "Uploading files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'logs' \
  --exclude 'uploads' \
  ./ $DEPLOY_USER@$SERVER:$APP_DIR/

# Install dependencies and build
echo "Installing dependencies..."
ssh $DEPLOY_USER@$SERVER "cd $APP_DIR && npm ci --production"

# Run migrations
echo "Running migrations..."
ssh $DEPLOY_USER@$SERVER "cd $APP_DIR && npm run db:migrate:production"

# Restart services
echo "Restarting services..."
ssh $DEPLOY_USER@$SERVER "cd $APP_DIR && pm2 reload ecosystem.config.js"

# Health check
echo "Running health check..."
sleep 10
curl -f https://api.boomcard.bg/health || exit 1

echo "Deployment completed successfully!"
```

## Monitoring & Logging

### Application Monitoring
```typescript
// src/monitoring/setup.ts
import * as Sentry from '@sentry/node';
import newrelic from 'newrelic';
import { StatsD } from 'node-statsd';

// Sentry setup
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentr