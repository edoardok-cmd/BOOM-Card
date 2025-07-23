#!/bin/bash

# BOOM Card - Free Database Setup Script
# This script helps you set up free PostgreSQL and Redis databases

echo "🗄️ BOOM Card - Free Database Setup"
echo "=================================="
echo ""
echo "This script will help you set up free databases for BOOM Card"
echo ""

# Function to setup Supabase (PostgreSQL)
setup_supabase() {
    echo "📊 Setting up Supabase (PostgreSQL)..."
    echo ""
    echo "1. Go to https://supabase.com and create a free account"
    echo "2. Create a new project (choose a region close to you)"
    echo "3. Wait for the project to be provisioned (~2 minutes)"
    echo "4. Go to Settings → Database"
    echo "5. Copy the connection string (URI)"
    echo ""
    read -p "Enter your Supabase database URL: " SUPABASE_URL
    echo ""
    echo "DATABASE_URL=\"$SUPABASE_URL\"" >> .env.database
    echo "✅ Supabase PostgreSQL configured!"
}

# Function to setup Neon (PostgreSQL Alternative)
setup_neon() {
    echo "📊 Setting up Neon (PostgreSQL)..."
    echo ""
    echo "1. Go to https://neon.tech and create a free account"
    echo "2. Create a new project"
    echo "3. Copy the connection string from the dashboard"
    echo ""
    read -p "Enter your Neon database URL: " NEON_URL
    echo ""
    echo "DATABASE_URL=\"$NEON_URL\"" >> .env.database
    echo "✅ Neon PostgreSQL configured!"
}

# Function to setup Upstash (Redis)
setup_upstash() {
    echo "🔴 Setting up Upstash (Redis)..."
    echo ""
    echo "1. Go to https://upstash.com and create a free account"
    echo "2. Create a new Redis database"
    echo "3. Choose a region close to your users"
    echo "4. Go to the Details tab"
    echo ""
    read -p "Enter your Upstash Redis URL: " UPSTASH_URL
    read -p "Enter your Upstash Redis Token: " UPSTASH_TOKEN
    echo ""
    echo "REDIS_URL=\"$UPSTASH_URL\"" >> .env.database
    echo "REDIS_TOKEN=\"$UPSTASH_TOKEN\"" >> .env.database
    echo "✅ Upstash Redis configured!"
}

# Function to setup Redis Cloud
setup_redis_cloud() {
    echo "🔴 Setting up Redis Cloud..."
    echo ""
    echo "1. Go to https://redis.com/try-free/ and create account"
    echo "2. Create a new database (30MB free)"
    echo "3. Choose your cloud provider and region"
    echo "4. Copy the endpoint and password"
    echo ""
    read -p "Enter Redis host (e.g., redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com): " REDIS_HOST
    read -p "Enter Redis port (default 12345): " REDIS_PORT
    read -p "Enter Redis password: " REDIS_PASSWORD
    echo ""
    echo "REDIS_URL=\"redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT\"" >> .env.database
    echo "✅ Redis Cloud configured!"
}

# Main menu
echo "Choose your database providers:"
echo ""
echo "PostgreSQL Options:"
echo "1) Supabase (500MB storage, unlimited API requests)"
echo "2) Neon (3GB storage, autoscaling)"
echo ""
read -p "Select PostgreSQL provider (1-2): " pg_choice

echo ""
echo "Redis Options:"
echo "3) Upstash (10,000 commands/day, serverless)"
echo "4) Redis Cloud (30MB storage, persistent)"
echo ""
read -p "Select Redis provider (3-4): " redis_choice

# Create env file
echo "# BOOM Card Database Configuration" > .env.database
echo "# Generated on $(date)" >> .env.database
echo "" >> .env.database

# Setup PostgreSQL
case $pg_choice in
    1)
        setup_supabase
        ;;
    2)
        setup_neon
        ;;
    *)
        echo "Invalid PostgreSQL choice"
        exit 1
        ;;
esac

echo ""

# Setup Redis
case $redis_choice in
    3)
        setup_upstash
        ;;
    4)
        setup_redis_cloud
        ;;
    *)
        echo "Invalid Redis choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Database configuration complete!"
echo ""
echo "Your database credentials have been saved to .env.database"
echo ""
echo "Next steps:"
echo "1. Copy .env.database contents to your backend/.env file"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Seed initial data: npm run db:seed"
echo ""
echo "⚠️  IMPORTANT: Add .env.database to .gitignore!"
echo ""