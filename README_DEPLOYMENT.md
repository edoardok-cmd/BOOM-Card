# BOOM Card - Deployment Guide

## 🚀 Frontend Deployment (Netlify)

The BOOM Card frontend is pre-configured for easy deployment to Netlify, a free hosting platform perfect for Next.js applications.

### Quick Deploy with Script

We've included a deployment script for convenience:

```bash
cd frontend
./deploy-to-netlify.sh
```

### Manual Deployment Steps

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   cd frontend
   npm install
   npm run build
   netlify deploy
   ```

3. **Deploy to Production**:
   ```bash
   netlify deploy --prod
   ```

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Environment Variables

Set these in your Netlify dashboard (Site settings → Environment variables):

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"..."}
```

### Post-Deployment

1. **Custom Domain**: Add your domain in Netlify settings
2. **SSL Certificate**: Automatically provisioned by Netlify
3. **Analytics**: Enable Netlify Analytics for insights
4. **Forms**: Netlify can handle contact forms automatically

## 🔧 Backend Deployment Options

### Option 1: Render.com (Recommended for Free Tier)

1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Set environment variables
5. Deploy automatically on push

### Option 2: Railway.app

1. Install Railway CLI: `npm install -g @railway/cli`
2. Initialize: `railway login && railway init`
3. Deploy: `railway up`

### Option 3: Heroku (Paid)

1. Create Heroku app
2. Add PostgreSQL and Redis addons
3. Deploy with Git

## 📦 Database Hosting

### PostgreSQL Options
- **Supabase**: 500MB free
- **Neon**: 3GB free
- **ElephantSQL**: 20MB free

### Redis Options
- **Upstash**: 10,000 commands/day free
- **Redis Cloud**: 30MB free

## 🎯 Full Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Netlify        │────▶│  Render.com     │
│  (Frontend)     │     │  (Backend API)  │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
              │           │ │         │ │         │
              │ Supabase  │ │ Upstash │ │ Stripe  │
              │ (DB)      │ │ (Redis) │ │ (Pay)   │
              │           │ │         │ │         │
              └───────────┘ └─────────┘ └─────────┘
```

## 🚨 Important Notes

1. **API URL**: Update `NEXT_PUBLIC_API_URL` after backend deployment
2. **CORS**: Configure backend to accept requests from Netlify domain
3. **Secrets**: Never commit API keys or secrets to Git
4. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot)

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

For detailed deployment instructions for each service, check the `/docs/deployment/` directory.