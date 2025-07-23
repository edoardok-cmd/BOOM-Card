#!/bin/bash

# BOOM Card Project Setup Script
# This script helps set up the project for local development

echo "🚀 BOOM Card Project Setup"
echo "========================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Function to install dependencies
install_deps() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "\n${YELLOW}Installing dependencies for $name...${NC}"
        cd "$dir" || exit
        
        if [ -f "package.json" ]; then
            npm install
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ $name dependencies installed${NC}"
            else
                echo -e "${RED}❌ Failed to install $name dependencies${NC}"
            fi
        else
            echo -e "${RED}❌ No package.json found in $dir${NC}"
        fi
        
        cd - > /dev/null || exit
    else
        echo -e "${RED}❌ Directory $dir not found${NC}"
    fi
}

# Install dependencies for all services
echo -e "\n${YELLOW}📦 Installing project dependencies...${NC}"

install_deps "frontend" "Frontend"
install_deps "backend" "Backend"
install_deps "api-gateway" "API Gateway"

# Install microservices dependencies
echo -e "\n${YELLOW}📦 Installing microservices dependencies...${NC}"

for service in services/*; do
    if [ -d "$service" ]; then
        service_name=$(basename "$service")
        install_deps "$service" "$service_name"
    fi
done

# Create environment files
echo -e "\n${YELLOW}🔧 Creating environment files...${NC}"

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
REACT_APP_STRIPE_PUBLIC_KEY=YOUR_STRIPE_PUBLIC_KEY
REACT_APP_ENVIRONMENT=development
EOF
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists${NC}"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boom_card
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=boom-card-uploads

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# Logging
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

# API Gateway .env
if [ ! -f "api-gateway/.env" ]; then
    cat > api-gateway/.env << EOF
NODE_ENV=development
PORT=8000

# Services
USER_SERVICE_URL=http://localhost:3002
PARTNER_SERVICE_URL=http://localhost:3003
TRANSACTION_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
ANALYTICS_SERVICE_URL=http://localhost:3006

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
EOF
    echo -e "${GREEN}✓ Created api-gateway/.env${NC}"
else
    echo -e "${YELLOW}⚠️  api-gateway/.env already exists${NC}"
fi

# Create directories
echo -e "\n${YELLOW}📁 Creating necessary directories...${NC}"

mkdir -p logs
mkdir -p uploads
mkdir -p temp

echo -e "${GREEN}✓ Directories created${NC}"

# Database setup reminder
echo -e "\n${YELLOW}💾 Database Setup Required:${NC}"
echo "1. Install PostgreSQL if not already installed"
echo "2. Create database: createdb boom_card"
echo "3. Run migrations: cd database && node migrate.js"

echo -e "\n${YELLOW}🔧 Additional Services Required:${NC}"
echo "1. Redis - For caching and sessions"
echo "2. Elasticsearch - For search functionality"
echo "3. PostgreSQL - For main database"

echo -e "\n${YELLOW}🚀 To start the development servers:${NC}"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. API Gateway: cd api-gateway && npm run dev"

echo -e "\n${GREEN}✅ Setup completed!${NC}"
echo -e "${YELLOW}⚠️  Remember to update the .env files with your actual credentials${NC}"