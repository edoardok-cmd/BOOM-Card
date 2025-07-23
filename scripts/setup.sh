#!/bin/bash

# BOOM Card Platform Setup Script
# This script initializes the development environment for the BOOM Card platform

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    local required_version="18.0.0"
    local current_version=$(node -v | cut -d 'v' -f 2)
    
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_message $RED "Error: Node.js version $required_version or higher is required. Current version: $current_version"
        exit 1
    fi
}

# Function to check PostgreSQL
check_postgresql() {
    if ! command_exists psql; then
        print_message $RED "Error: PostgreSQL is not installed"
        exit 1
    fi
}

# Function to check Redis
check_redis() {
    if ! command_exists redis-cli; then
        print_message $RED "Error: Redis is not installed"
        exit 1
    fi
}

# Function to create directory structure
create_directory_structure() {
    print_message $YELLOW "Creating project directory structure..."
    
    # Root directories
    mkdir -p config
    mkdir -p scripts
    mkdir -p docker
    mkdir -p docs
    
    # Backend directories
    mkdir -p backend/src/{controllers,middleware,models,routes,services,utils,types,validators}
    mkdir -p backend/src/database/{migrations,seeds}
    mkdir -p backend/tests/{unit,integration,e2e}
    
    # Frontend directories
    mkdir -p frontend/src/{components,pages,services,hooks,utils,types,styles,contexts,constants}
    mkdir -p frontend/src/components/{common,layout,auth,dashboard,partners,consumers}
    mkdir -p frontend/src/locales/{en,bg}
    mkdir -p frontend/public/{images,icons,fonts}
    mkdir -p frontend/tests/{unit,integration,e2e}
    
    # Shared directories
    mkdir -p shared/types
    mkdir -p shared/constants
    mkdir -p shared/utils
    
    print_message $GREEN "✓ Directory structure created"
}

# Function to initialize git repository
init_git_repo() {
    print_message $YELLOW "Initializing Git repository..."
    
    if [ ! -d .git ]; then
        git init
        
        # Create .gitignore
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
build/
dist/
out/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS Files
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo
*.swn
*.bak

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Database
*.sqlite
*.sqlite3

# Redis
dump.rdb

# Certificates
*.pem
*.key
*.crt

# Temporary files
tmp/
temp/
.cache/

# Build files
.next/
.nuxt/
.turbo/
.vercel/

# TypeScript
*.tsbuildinfo

# Upload files
uploads/
EOF
        
        print_message $GREEN "✓ Git repository initialized"
    else
        print_message $YELLOW "Git repository already exists"
    fi
}

# Function to create environment files
create_env_files() {
    print_message $YELLOW "Creating environment configuration files..."
    
    # Backend .env.example
    cat > backend/.env.example << 'EOF'
# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boom_card_dev
DB_USER=boom_user
DB_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=boom-card-uploads

# SMS Gateway
SMS_API_KEY=your_sms_api_key
SMS_API_URL=https://api.smsgateway.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET=your_session_secret
SESSION_MAX_AGE=86400000

# QR Code
QR_CODE_BASE_URL=https://app.boomcard.bg

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs

# Cache
CACHE_TTL=3600
EOF

    # Frontend .env.example
    cat > frontend/.env.example << 'EOF'
# Application
NEXT_PUBLIC_APP_NAME=BOOM Card
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_tracking_id

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=your_fb_pixel_id

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true

# Social Media
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# App Store Links
NEXT_PUBLIC_IOS_APP_URL=https://apps.apple.com/app/boom-card
NEXT_PUBLIC_ANDROID_APP_URL=https://play.google.com/store/apps/details?id=com.boomcard
EOF

    print_message $GREEN "✓ Environment files created"
}

# Function to create Docker configuration
create_docker_config() {
    print_message $YELLOW "Creating Docker configuration..."
    
    # docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: boom_postgres
    environment:
      POSTGRES_USER: boom_user
      POSTGRES_PASSWORD: boom_password
      POSTGRES_DB: boom_card_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - boom_network

  redis:
    image: redis:7-alpine
    container_name: boom_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - boom_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: boom_backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - boom_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: boom_frontend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - boom_network

volumes:
  postgres_data:
  redis_data:

networks:
  boom_network:
    driver: bridge
EOF

    # Backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
EOF

    # Frontend Dockerfile
    cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
EOF

    print_message $GREEN "✓ Docker configuration created"
}

# Function to create TypeScript configuration
create_typescript_config() {
    print_message $YELLOW "Creating TypeScript configuration..."
    
    # Root tsconfig.json
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "exclude": ["node_modules", "dist", "build", "coverage"]
}
EOF

    # Backend tsconfig.json
    cat > backend/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "coverage", "tests"]
}
EOF

    # Frontend tsconfig.json
    cat > frontend/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": [