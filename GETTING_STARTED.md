# BOOM Card - Getting Started Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for database services)
- Git

### Option 1: Using Docker (Recommended)

1. **Clone and navigate to the project**
   ```bash
   cd "BOOM Card_20250722_085243"
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database
   - Redis cache
   - Elasticsearch
   - All microservices

3. **Run database migrations**
   ```bash
   cd database && node migrate.js
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

1. **Run the setup script**
   ```bash
   ./setup.sh
   ```

   This will:
   - Install all npm dependencies
   - Create .env files
   - Set up necessary directories

2. **Start external services**
   ```bash
   # PostgreSQL
   brew services start postgresql  # macOS
   # or
   sudo systemctl start postgresql  # Linux

   # Redis
   brew services start redis  # macOS
   # or
   sudo systemctl start redis  # Linux

   # Elasticsearch
   # Download and run from https://www.elastic.co/downloads/elasticsearch
   ```

3. **Create and setup database**
   ```bash
   createdb boom_card
   cd database && node migrate.js
   ```

4. **Start the services**

   In separate terminal windows:

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev

   # Terminal 3 - API Gateway
   cd api-gateway && npm run dev
   ```

## 📝 Environment Configuration

### Required Environment Variables

Update the `.env` files in each directory with your actual values:

**backend/.env**
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - Strong secret for JWT tokens
- `SMTP_USER` / `SMTP_PASS` - Email service credentials
- `STRIPE_SECRET_KEY` - Stripe API key (for payments)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - AWS credentials

**frontend/.env**
- `REACT_APP_GOOGLE_MAPS_KEY` - Google Maps API key
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe publishable key

## 🏗️ Project Structure

```
BOOM Card/
├── frontend/          # React TypeScript frontend
├── backend/          # Express.js backend API
├── api-gateway/      # API Gateway for microservices
├── services/         # Microservices
│   ├── user-service/
│   ├── partner-service/
│   ├── transaction-service/
│   ├── notification-service/
│   └── analytics-service/
├── database/         # Database migrations and seeds
├── scripts/          # Utility scripts
└── docker-compose.yml
```

## 🧪 Testing

Run tests for each service:

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Run all tests
npm run test:all
```

## 🔍 Common Issues

### Port Already in Use
If you get a "port already in use" error:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Failed
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `psql -l | grep boom_card`

### Redis Connection Failed
1. Ensure Redis is running
2. Check Redis connection in `.env`
3. Test connection: `redis-cli ping`

## 📚 API Documentation

Once the services are running:
- Swagger UI: http://localhost:8000/docs
- API Health Check: http://localhost:8000/health

## 🛠️ Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Docker

### Useful Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Build for production
npm run build

# Run in production mode
npm start
```

## 🚢 Deployment

For production deployment:

1. Update all `.env` files with production values
2. Build Docker images: `docker-compose build`
3. Deploy using your preferred platform (AWS, GCP, Heroku, etc.)

## 📞 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f [service-name]`
2. Review error messages in browser console
3. Ensure all environment variables are set correctly

## 🎉 Next Steps

1. Explore the codebase
2. Review API documentation
3. Start building new features
4. Join our developer community

Happy coding! 🚀