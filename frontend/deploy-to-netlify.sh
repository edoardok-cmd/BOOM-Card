#!/bin/bash

# BOOM Card Frontend - Netlify Deployment Script
# This script helps you deploy the frontend to Netlify

echo "🚀 BOOM Card Frontend - Netlify Deployment Helper"
echo "================================================"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed!"
    echo ""
    echo "Please install it with:"
    echo "  npm install -g netlify-cli"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Choose deployment option:"
echo "1) Deploy to preview URL (recommended for first time)"
echo "2) Deploy to production"
echo "3) Initialize new Netlify site"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Deploying to preview URL..."
        netlify deploy
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        echo "⚠️  WARNING: This will update your live site!"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            netlify deploy --prod
        else
            echo "Deployment cancelled."
        fi
        ;;
    3)
        echo ""
        echo "🆕 Initializing new Netlify site..."
        netlify init
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "✨ Done! Check the output above for your site URL."
echo ""
echo "Next steps:"
echo "- Set environment variables in Netlify dashboard"
echo "- Configure custom domain (optional)"
echo "- Enable automatic deployments from GitHub (optional)"
echo ""