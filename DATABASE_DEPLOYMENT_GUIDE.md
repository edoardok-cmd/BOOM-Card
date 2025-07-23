# BOOM Card Database Deployment Guide

## Overview
This guide will help you deploy the BOOM Card database to free hosting solutions:
- **PostgreSQL**: Supabase (free tier: 500MB database, 2 projects)
- **Redis**: Upstash (free tier: 10,000 commands/day)

## Step 1: Set up Supabase PostgreSQL

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub or email
3. Create a new project:
   - Project name: `boom-card`
   - Database password: [Generate a strong password and save it]
   - Region: Choose closest to Bulgaria (e.g., Frankfurt)

### 1.2 Get Database Credentials
Once the project is created (takes ~2 minutes), go to Settings > Database and note:
- **Host**: [your-project].supabase.co
- **Database name**: postgres
- **Port**: 5432
- **User**: postgres
- **Password**: [the password you set]
- **Connection string**: Will be in format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 1.3 Run Database Migrations
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy the contents of `database/schema.sql`
4. Run the query to create all tables and types

## Step 2: Set up Upstash Redis

### 2.1 Create Upstash Account
1. Go to [https://upstash.com](https://upstash.com)
2. Sign up with GitHub or email
3. Create a new Redis database:
   - Name: `boom-card-redis`
   - Region: Choose EU region
   - Type: Regional (not Global)

### 2.2 Get Redis Credentials
From the database details page, note:
- **Endpoint**: [your-endpoint].upstash.io
- **Port**: [port number]
- **Password**: [your password]
- **Redis URL**: `redis://default:[password]@[endpoint]:[port]`

## Step 3: Update Backend Environment Variables

### 3.1 Create Production Environment File
Create `backend/.env.production` with the following:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis
REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT]:[PORT]

# JWT Secrets (generate new ones for production)
JWT_SECRET=[GENERATE-NEW-SECRET]
JWT_REFRESH_SECRET=[GENERATE-NEW-SECRET]

# Frontend URL
FRONTEND_URL=https://[your-netlify-domain].netlify.app

# API Settings
PORT=3001
NODE_ENV=production

# Stripe (if you have keys)
STRIPE_SECRET_KEY=[YOUR-STRIPE-SECRET]
STRIPE_WEBHOOK_SECRET=[YOUR-STRIPE-WEBHOOK-SECRET]

# Email Service (optional)
EMAIL_FROM=noreply@boomcard.bg
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 3.2 Generate JWT Secrets
Use this command to generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Deploy Backend to Railway/Render

Since Netlify is for static sites, you'll need a separate hosting for the backend API.

### Option A: Railway (Recommended)
1. Go to [https://railway.app](https://railway.app)
2. Connect your GitHub account
3. New Project > Deploy from GitHub repo
4. Select the BOOM-Card repository
5. Add service > Select backend folder
6. Add all environment variables from .env.production
7. Deploy

### Option B: Render
1. Go to [https://render.com](https://render.com)
2. New > Web Service
3. Connect GitHub and select BOOM-Card
4. Configuration:
   - Name: boom-card-api
   - Root Directory: backend
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Create Web Service

## Step 5: Update Frontend Environment

### 5.1 Update Netlify Environment Variables
In Netlify dashboard > Site settings > Environment variables, add:

```
NEXT_PUBLIC_API_URL=https://[your-backend-url]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[if-using-stripe]
```

### 5.2 Redeploy Frontend
Trigger a new deployment in Netlify to use the new environment variables.

## Step 6: Test the Deployment

### 6.1 Database Connection Test
```bash
# Test from your local machine
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Should connect successfully
\dt  # List tables
\q   # Quit
```

### 6.2 API Health Check
```bash
curl https://[your-backend-url]/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Troubleshooting

### Database Connection Issues
- Ensure your backend IP is whitelisted (Supabase allows all IPs by default)
- Check connection string format
- Verify SSL mode (Supabase requires SSL)

### Redis Connection Issues
- Upstash connections use TLS by default
- Make sure to use the correct Redis URL format
- Check if you've exceeded the free tier limits

### Backend Deployment Issues
- Ensure all environment variables are set
- Check deployment logs for errors
- Verify Node.js version compatibility (use 18.x)

## Next Steps

1. Set up monitoring (optional):
   - Supabase has built-in monitoring
   - Upstash provides usage metrics
   - Railway/Render provide deployment logs

2. Set up backups:
   - Supabase automatically backs up daily
   - Consider setting up additional backup strategy

3. Configure production settings:
   - Enable Row Level Security in Supabase
   - Set up proper CORS in backend
   - Configure rate limiting

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Upstash Docs: https://docs.upstash.com
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs