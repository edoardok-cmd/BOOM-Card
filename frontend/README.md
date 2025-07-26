# BOOM Card Frontend

This is the Next.js frontend application for the BOOM Card platform - a multi-country subscription service for deals and discounts with POS integration.

Last build: 2025-01-27

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📦 Deployment to Netlify

This project is configured for easy deployment to Netlify with automatic builds and optimizations.

### Prerequisites

1. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Create a Netlify account at [netlify.com](https://netlify.com)

### First-Time Setup

1. Initialize Netlify in this project:
```bash
netlify init
```

2. Follow the prompts:
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name (or leave blank for random)

### Deployment Commands

We've added convenient deployment scripts to package.json:

```bash
# Deploy to a preview URL (for testing)
npm run deploy

# Deploy to production
npm run deploy:prod

# Deploy to a named preview (e.g., "preview")
npm run deploy:preview
```

### Manual Deployment

You can also deploy manually:

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --dir=.next

# Deploy to production
netlify deploy --dir=.next --prod
```

### Drag & Drop Deployment

1. Build your project: `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the `.next` folder to the Netlify dashboard

### Environment Variables

Set these environment variables in Netlify dashboard (Site settings → Environment variables):

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Automatic Deployments from GitHub

1. Connect your GitHub repository in Netlify dashboard
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Every push to main branch will trigger automatic deployment

### Custom Domain

1. Go to Domain settings in Netlify dashboard
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔧 Netlify Configuration

The `netlify.toml` file includes:
- Build settings optimized for Next.js
- Security headers
- Caching rules for static assets
- Next.js plugin for serverless functions
- Environment-specific configurations

## 📊 Post-Deployment

After deployment, you can:
- View deployment logs in Netlify dashboard
- Access analytics and performance metrics
- Set up form notifications
- Configure deploy notifications
- Enable deploy previews for pull requests

## 🆘 Troubleshooting

If deployment fails:

1. Check build logs in Netlify dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set
4. Run `npm run build` locally to test
5. Check Next.js version compatibility

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify CLI Docs](https://docs.netlify.com/cli/get-started/)

---

Built with ❤️ using Next.js and deployed on Netlify