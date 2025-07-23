# Quick Database Setup for BOOM Card

## 🚀 Fast Track Setup (15 minutes)

### Step 1: Supabase (5 minutes)
1. Go to https://supabase.com and click "Start your project"
2. Sign in with GitHub
3. Click "New project" and fill:
   - Organization: Personal
   - Project name: `boom-card`
   - Database Password: Click "Generate" and **SAVE IT**
   - Region: Frankfurt (closest to Bulgaria)
4. Click "Create new project" and wait ~2 minutes

### Step 2: Get Database URL (1 minute)
1. Once created, go to Settings (gear icon) > Database
2. Find "Connection string" > URI
3. Copy it and replace `[YOUR-PASSWORD]` with your saved password
4. It should look like: `postgresql://postgres:YOUR-PASSWORD@db.xxxxx.supabase.co:5432/postgres`

### Step 3: Upstash Redis (3 minutes)
1. Go to https://console.upstash.com
2. Sign up/login
3. Click "Create Database"
   - Name: `boom-card`
   - Type: Regional
   - Region: EU-West-1
   - Click "Create"
4. Copy the "Redis URL" from the details page

### Step 4: Run Migration (3 minutes)
```bash
cd backend

# Create .env.production file
echo "DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.xxxxx.supabase.co:5432/postgres" > .env.production
echo "REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:xxxxx" >> .env.production

# Test connections
node scripts/test-db-connection.js
node scripts/test-redis-connection.js

# Run migration
node scripts/migrate-database.js
```

### Step 5: Deploy Backend (3 minutes)
Using Railway (fastest):
1. Go to https://railway.app
2. Login with GitHub
3. New Project > Deploy from GitHub repo
4. Select BOOM-Card
5. Add these environment variables:
   - Copy everything from .env.production
   - Add: `JWT_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - Add: `JWT_REFRESH_SECRET` (generate another one)
   - Add: `FRONTEND_URL=https://your-netlify-app.netlify.app`
6. Deploy!

### Step 6: Update Frontend (1 minute)
In Netlify:
1. Site settings > Environment variables
2. Add: `NEXT_PUBLIC_API_URL` = Your Railway URL (e.g., `https://boom-card-production.up.railway.app`)
3. Trigger redeploy

## ✅ You're Done!

Your database is now live and connected. The backend API is deployed and ready to serve your frontend.

## 🔧 Troubleshooting

**"Connection refused" error?**
- Wait 2-3 minutes after creating Supabase project
- Make sure you replaced [YOUR-PASSWORD] in the connection string

**"Migration failed" error?**
- If tables already exist, that's OK
- Check Supabase dashboard > Table Editor to see your tables

**Backend not deploying?**
- Make sure all environment variables are set in Railway
- Check deployment logs for specific errors

## 📝 Important URLs to Save
- Supabase Dashboard: https://app.supabase.com/project/[your-project-id]
- Upstash Console: https://console.upstash.com
- Railway Dashboard: https://railway.app/project/[your-project-id]
- Backend API: https://[your-app].up.railway.app
- Frontend: https://[your-app].netlify.app