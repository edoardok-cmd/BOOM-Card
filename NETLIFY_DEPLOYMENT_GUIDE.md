# BOOM Card Netlify Deployment Guide

## 🚀 Quick Deployment Steps

The project is fully configured and ready for Netlify deployment. The build has been tested and works correctly.

### Prerequisites Completed ✅
- ✅ Netlify CLI installed globally
- ✅ Project built successfully
- ✅ netlify.toml configuration in place
- ✅ Environment variables configured in .env.local

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"

2. **Connect Git Repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Choose the BOOM Card repository
   - Set branch to deploy: `main` or `master`

3. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`

4. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
   NEXT_PUBLIC_APP_NAME=BOOM Card
   NEXT_PUBLIC_APP_URL=https://your-netlify-app.netlify.app
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete (2-3 minutes)

### Option 2: Deploy via CLI

1. **Login to Netlify**
   ```bash
   cd frontend
   netlify login
   ```

2. **Initialize Netlify (if not done)**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name or leave blank

3. **Deploy to Preview**
   ```bash
   netlify deploy
   ```
   - This creates a preview URL for testing

4. **Deploy to Production**
   ```bash
   netlify deploy --prod
   ```

### Option 3: Drag & Drop Deploy

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Visit Netlify Drop**
   - Go to https://app.netlify.com/drop
   - Drag the `frontend/.next` folder to the browser
   - Get instant deployment!

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

```env
# Required for production
NEXT_PUBLIC_API_URL=https://boom-card-api.herokuapp.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
```

### 2. Configure Custom Domain

1. Go to Domain settings in Netlify dashboard
2. Add custom domain (e.g., boomcard.bg)
3. Update DNS records:
   - A record: Point to Netlify's IP
   - CNAME: Point www to your Netlify subdomain

### 3. Enable HTTPS

- Netlify provides free SSL certificates
- Automatic HTTPS is enabled by default
- Force HTTPS in Domain settings

### 4. Set up Deploy Notifications

1. Go to Site settings → Build & deploy → Deploy notifications
2. Add webhook for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

### 5. Configure Headers and Redirects

The `netlify.toml` file already includes:
- Security headers
- Caching rules
- Next.js optimizations

## 🌐 Backend API Deployment

For the backend API, you'll need to deploy it separately:

### Option 1: Heroku
```bash
cd backend
heroku create boom-card-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Option 2: Railway
- Visit https://railway.app
- Connect GitHub repo
- Deploy backend folder
- Add PostgreSQL database

### Option 3: Render
- Visit https://render.com
- Create new Web Service
- Connect GitHub repo
- Set root directory to `backend`

## 📱 Mobile App Considerations

When deployed, update your mobile apps with:
- Production API URL
- Production web app URL for OAuth callbacks

## 🔍 Monitoring

After deployment:
1. Check Netlify Analytics
2. Monitor build times
3. Set up error tracking (Sentry)
4. Configure uptime monitoring

## 🚨 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### 404 Errors
- Next.js routing is handled by netlify.toml
- Check [[redirects]] section if needed

### API Connection Issues
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check CORS settings on backend
- Ensure backend is deployed and running

## 🎉 Success!

Once deployed, your BOOM Card app will be available at:
- Preview: `https://[site-name].netlify.app`
- Production: `https://[your-custom-domain]`

## 📞 Support

For issues:
- Netlify Support: https://www.netlify.com/support/
- Next.js Docs: https://nextjs.org/docs
- BOOM Card Team: support@boomcard.bg