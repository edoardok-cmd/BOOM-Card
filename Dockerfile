# Railway Dockerfile for BOOM Card Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy production package file
COPY backend/package.production.json ./package.json

# Install only production dependencies
RUN npm install --production

# Copy backend source code
COPY backend/server-simple.js ./
COPY backend/.env* ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "server-simple.js"]