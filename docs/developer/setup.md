# BOOM Card Developer Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **PostgreSQL** (v14.0 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v7.0 or higher) - [Download](https://redis.io/download/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Docker** (optional, for containerized development) - [Download](https://www.docker.com/get-started)

### Recommended IDE

- **Visual Studio Code** with the following extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - PostgreSQL
  - Docker (if using Docker)

## Project Structure

```
boom-card/
├── apps/
│   ├── web/                 # Consumer-facing Next.js application
│   ├── partner-dashboard/   # Partner management portal
│   ├── admin-panel/        # Platform administration
│   └── mobile/             # React Native mobile app
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── database/           # Database schemas and migrations
│   ├── api-client/         # API client library
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── services/
│   ├── api-gateway/        # Main API service
│   ├── auth-service/       # Authentication microservice
│   ├── payment-service/    # Payment processing
│   ├── analytics-service/  # Analytics and reporting
│   └── notification-service/ # Email/SMS notifications
├── infrastructure/
│   ├── docker/             # Docker configurations
│   ├── kubernetes/         # K8s manifests
│   └── terraform/          # Infrastructure as Code
└── docs/                   # Documentation
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/boom-card/platform.git
cd platform
```

### 2. Install Dependencies

We use npm workspaces for monorepo management:

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment files:

```bash
# Root environment
cp .env.example .env

# Service-specific environments
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/payment-service/.env.example services/payment-service/.env
cp services/analytics-service/.env.example services/analytics-service/.env
cp services/notification-service/.env.example services/notification-service/.env

# App-specific environments
cp apps/web/.env.example apps/web/.env
cp apps/partner-dashboard/.env.example apps/partner-dashboard/.env
cp apps/admin-panel/.env.example apps/admin-panel/.env
```

Update the environment variables according to your local setup:

#### Root .env
```bash
# Database
DATABASE_URL=postgresql://boom_user:boom_password@localhost:5432/boom_card_dev
DATABASE_TEST_URL=postgresql://boom_user:boom_password@localhost:5432/boom_card_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
TWILIO_AUTH_TOKEN=...
GOOGLE_MAPS_API_KEY=...

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER boom_user WITH PASSWORD 'boom_password';
CREATE DATABASE boom_card_dev OWNER boom_user;
CREATE DATABASE boom_card_test OWNER boom_user;
GRANT ALL PRIVILEGES ON DATABASE boom_card_dev TO boom_user;
GRANT ALL PRIVILEGES ON DATABASE boom_card_test TO boom_user;

# Enable required extensions
\c boom_card_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c boom_card_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### Run Migrations

```bash
# Development database
npm run db:migrate

# Test database
npm run db:migrate:test

# Seed development data
npm run db:seed
```

### 5. Redis Setup

Start Redis server:

```bash
# macOS (using Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows (using WSL or Docker)
docker run -d -p 6379:6379 redis:alpine
```

### 6. SSL Certificates (for local HTTPS)

Generate self-signed certificates for local development:

```bash
# Create certificates directory
mkdir -p .certificates

# Generate certificate
openssl req -x509 -out .certificates/localhost.crt -keyout .certificates/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# Trust certificate (macOS)
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .certificates/localhost.crt
```

## Running the Application

### Development Mode

Start all services in development mode:

```bash
# Start all services concurrently
npm run dev

# Or start specific services
npm run dev:api        # API Gateway only
npm run dev:web        # Consumer web app only
npm run dev:partner    # Partner dashboard only
npm run dev:admin      # Admin panel only
```

### Service URLs

After starting the services, they will be available at:

- **Consumer Web App**: https://localhost:3000
- **Partner Dashboard**: https://localhost:3001
- **Admin Panel**: https://localhost:3002
- **API Gateway**: https://localhost:4000
- **Auth Service**: https://localhost:4001
- **Payment Service**: https://localhost:4002
- **Analytics Service**: https://localhost:4003
- **Notification Service**: https://localhost:4004

### Docker Development

For a containerized development environment:

```bash
# Build and start all services
docker-compose up --build

# Start specific services
docker-compose up api-gateway web

# Run with hot reload
docker-compose -f docker-compose.dev.yml up
```

## Development Workflow

### 1. Code Style and Linting

We use ESLint and Prettier for code consistency:

```bash
# Lint all code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### 2. Git Hooks

Pre-commit hooks are configured using Husky:

```bash
# Install git hooks
npm run prepare
```

This will automatically:
- Run linting on staged files
- Format code with Prettier
- Run type checking
- Validate commit messages

### 3. Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests for specific package/app
npm run test --workspace=@boom-card/api-gateway
```

### 4. Database Management

```bash
# Create a new migration
npm run db:migrate:create -- --name=add_user_preferences

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Reset database (drop, create, migrate, seed)
npm run db:reset

# Access database CLI
npm run db:cli
```

### 5. API Documentation

API documentation is auto-generated using OpenAPI/Swagger:

```bash
# Generate API docs
npm run docs:api

# View API docs (after starting services)
open http://localhost:4000/api-docs
```

## Debugging

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Gateway",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/services/api-gateway/src/index.ts",
      "preLaunchTask": "tsc: build - services/api-gateway/tsconfig.json",
      "outFiles": ["${workspaceFolder}/services/api-gateway/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Next.js Web",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/apps/web/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Logging

Development logs are written to:
- Console output (with color coding)
- `logs/` directory for each service

View logs:
```bash
# Tail all logs
npm run logs

# Tail specific service logs
npm run logs:api
npm run logs:auth
```

## Common Issues and Solutions

### Port Already in Use

If you get "EADDRINUSE" errors:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports in .env files
```

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   systemctl status postgresql
   ```

2. Check connection string in `.env`
3. Verify user permissions

### Redis Connection Issues

1. Check if Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Clear Redis cache if needed:
   ```bash
   redis-cli FLUSHALL
   ```

### TypeScript Build Errors

```bash
# Clean build artifacts
npm run clean

# Rebuild all packages
npm run build

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
```

## Performance Monitoring

### Local Performance Profiling

1. Enable performance monitoring in `.env`:
   ```bash
   ENABLE_PERFORMANCE_MONITORING=true
   ```

2. Access performance dashboard:
   ```
   http://localhost:4000/metrics
   ```

### Memory Profiling

```bash
# Start with memory profiling
NODE_OPTIONS="--inspect" npm run dev:api

# Connect Chrome DevTools
chrome://inspect
```

## Security Considerations

### Local Development Secu