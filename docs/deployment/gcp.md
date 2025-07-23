# Google Cloud Platform Deployment Guide

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed locally
- Domain name configured (boom-card.com)
- SSL certificates ready

## Project Setup

### 1. Initialize GCP Project

```bash
# Create new project
gcloud projects create boom-card-prod --name="BOOM Card Production"

# Set as active project
gcloud config set project boom-card-prod

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudrun.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable monitoring.googleapis.com
```

### 2. Configure Service Accounts

```bash
# Create service accounts
gcloud iam service-accounts create boom-card-api \
    --display-name="BOOM Card API Service"

gcloud iam service-accounts create boom-card-worker \
    --display-name="BOOM Card Worker Service"

# Grant permissions
gcloud projects add-iam-policy-binding boom-card-prod \
    --member="serviceAccount:boom-card-api@boom-card-prod.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding boom-card-prod \
    --member="serviceAccount:boom-card-api@boom-card-prod.iam.gserviceaccount.com" \
    --role="roles/redis.editor"
```

## Infrastructure Setup

### 1. Cloud SQL (PostgreSQL)

```bash
# Create PostgreSQL instance
gcloud sql instances create boom-card-db \
    --database-version=POSTGRES_15 \
    --tier=db-n1-standard-4 \
    --region=europe-west1 \
    --network=default \
    --backup-start-time=02:00 \
    --backup-location=eu \
    --enable-point-in-time-recovery \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=3

# Create databases
gcloud sql databases create boom_card_prod \
    --instance=boom-card-db

# Create users
gcloud sql users create boom_api \
    --instance=boom-card-db \
    --password=[SECURE_PASSWORD]
```

### 2. Memorystore (Redis)

```bash
# Create Redis instance
gcloud redis instances create boom-card-cache \
    --size=5 \
    --region=europe-west1 \
    --zone=europe-west1-b \
    --redis-version=redis_7_0 \
    --display-name="BOOM Card Cache" \
    --tier=STANDARD_HA
```

### 3. Cloud Storage Buckets

```bash
# Create buckets
gsutil mb -l EU gs://boom-card-uploads
gsutil mb -l EU gs://boom-card-static
gsutil mb -l EU gs://boom-card-backups

# Configure CORS for uploads
cat > cors.json << EOF
[
  {
    "origin": ["https://boom-card.com", "https://app.boom-card.com"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://boom-card-uploads
```

### 4. VPC Configuration

```bash
# Create VPC network
gcloud compute networks create boom-card-vpc \
    --subnet-mode=custom \
    --bgp-routing-mode=regional

# Create subnets
gcloud compute networks subnets create boom-card-subnet \
    --network=boom-card-vpc \
    --region=europe-west1 \
    --range=10.0.0.0/24

# Configure private IP access
gcloud compute addresses create google-managed-services-boom-card-vpc \
    --global \
    --purpose=VPC_PEERING \
    --prefix-length=24 \
    --network=boom-card-vpc
```

## Application Deployment

### 1. Container Registry Setup

```bash
# Configure Docker authentication
gcloud auth configure-docker

# Build and push images
docker build -t gcr.io/boom-card-prod/api:latest ./backend
docker push gcr.io/boom-card-prod/api:latest

docker build -t gcr.io/boom-card-prod/web:latest ./frontend
docker push gcr.io/boom-card-prod/web:latest
```

### 2. Cloud Run Deployment

#### API Service

```bash
# Deploy API service
gcloud run deploy boom-card-api \
    --image gcr.io/boom-card-prod/api:latest \
    --platform managed \
    --region europe-west1 \
    --allow-unauthenticated \
    --service-account boom-card-api@boom-card-prod.iam.gserviceaccount.com \
    --set-env-vars="NODE_ENV=production" \
    --set-secrets="DATABASE_URL=boom-card-db-url:latest" \
    --set-secrets="REDIS_URL=boom-card-redis-url:latest" \
    --set-secrets="JWT_SECRET=boom-card-jwt:latest" \
    --vpc-connector boom-card-connector \
    --vpc-egress all-traffic \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 1000 \
    --min-instances 2 \
    --max-instances 100
```

#### Web Application

```bash
# Deploy web app
gcloud run deploy boom-card-web \
    --image gcr.io/boom-card-prod/web:latest \
    --platform managed \
    --region europe-west1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 60 \
    --concurrency 1000 \
    --min-instances 1 \
    --max-instances 50
```

### 3. Load Balancer Configuration

```yaml
# load-balancer.yaml
apiVersion: compute.cnrm.cloud.google.com/v1beta1
kind: ComputeURLMap
metadata:
  name: boom-card-lb
spec:
  defaultService:
    backendServiceRef:
      name: boom-card-web-backend
  hostRule:
    - hosts:
        - "boom-card.com"
        - "www.boom-card.com"
      pathMatcher: boom-card-matcher
    - hosts:
        - "api.boom-card.com"
      pathMatcher: api-matcher
  pathMatcher:
    - name: boom-card-matcher
      defaultService:
        backendServiceRef:
          name: boom-card-web-backend
    - name: api-matcher
      defaultService:
        backendServiceRef:
          name: boom-card-api-backend
```

### 4. SSL Configuration

```bash
# Create managed SSL certificates
gcloud compute ssl-certificates create boom-card-cert \
    --domains=boom-card.com,www.boom-card.com,api.boom-card.com \
    --global

# Attach to load balancer
gcloud compute target-https-proxies create boom-card-https-proxy \
    --ssl-certificates=boom-card-cert \
    --global-url-map=boom-card-lb
```

## Environment Configuration

### 1. Secret Manager

```bash
# Create secrets
echo -n "postgresql://user:pass@host/db" | gcloud secrets create boom-card-db-url --data-file=-
echo -n "redis://host:6379" | gcloud secrets create boom-card-redis-url --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create boom-card-jwt --data-file=-
echo -n "your-stripe-key" | gcloud secrets create boom-card-stripe --data-file=-
```

### 2. Environment Variables

```yaml
# env-config.yaml
env_variables:
  NODE_ENV: production
  API_URL: https://api.boom-card.com
  WEB_URL: https://boom-card.com
  STORAGE_BUCKET: boom-card-uploads
  REDIS_PREFIX: boom:
  SESSION_DURATION: 86400
  CORS_ORIGINS: https://boom-card.com,https://app.boom-card.com
  SUPPORTED_LANGUAGES: en,bg
  DEFAULT_LANGUAGE: bg
  TIMEZONE: Europe/Sofia
  LOG_LEVEL: info
  ENABLE_SWAGGER: false
```

## CI/CD Pipeline

### 1. Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  # Run tests
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
    dir: 'backend'
  
  - name: 'gcr.io/cloud-builders/npm'
    args: ['test']
    dir: 'backend'
    env:
      - 'CI=true'
  
  # Build API
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA', '.']
    dir: 'backend'
  
  # Build Web
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/web:$COMMIT_SHA', '.']
    dir: 'frontend'
  
  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/web:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'boom-card-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'

options:
  machineType: 'N1_HIGHCPU_8'
  timeout: '1200s'
```

### 2. GitHub Actions Integration

```yaml
# .github/workflows/deploy-gcp.yml
name: Deploy to GCP

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'
      
      - name: 'Submit to Cloud Build'
        run: |
          gcloud builds submit \
            --config cloudbuild.yaml \
            --substitutions=COMMIT_SHA=${{ github.sha }}
```

## Monitoring & Logging

### 1. Cloud Monitoring Setup

```bash
# Create uptime checks
gcloud monitoring uptime-checks create boom-card-api \
    --display-name="BOOM Card API Health" \
    --resource-type="uptime-url" \
    --hostname="api.boom-card.com" \
    --path="/health" \
    --check-interval="60s"

# Create alerting policies
gcloud alpha monitoring policies create \
    --notification-channels=[CHANNEL_ID] \
    --display-name="High Error Rate" \
    --condition-display-name="Error rate > 1%" \
    --condition-metric-type="serviceruntime.googleapis.com/api/request_count" \
    --condition-filter='metric.label.response_code_class!="2xx"'
```

### 2. Log Aggregation

```yaml
# logging-config.yaml
apiVersion: logging.cnrm.cloud.google.com/v1beta1
kind: LoggingLogSink
metadata:
  name: boom-card-logs
spec:
  destination:
    bigqueryDatasetRef:
      name: boom-card-logs
  filter: |
    resource.type="cloud_run_revision"
    resource.labels.service_name=~"boom-card-*"
    severity >= "INFO"
```

## Backup & Disaster Recovery

### 1. Database Backups

```bash
# Configure automated backups
gcloud sql instances patch boom-card-db \
    --backup-start-time=02:00 \
    --retained-backups-count=30 \
    --retained-transaction-log-days=7

# Create backup schedule
gcloud schedul