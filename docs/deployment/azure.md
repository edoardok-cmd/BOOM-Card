# Azure Deployment Guide for BOOM Card Platform

## Prerequisites

- Azure Account with active subscription
- Azure CLI installed (`az --version`)
- Docker installed locally
- Node.js 18+ and npm/yarn
- PostgreSQL client tools
- Domain name configured with DNS

## Azure Resources Required

### Core Infrastructure
- **Azure Kubernetes Service (AKS)** - Container orchestration
- **Azure Database for PostgreSQL** - Primary database
- **Azure Cache for Redis** - Session management and caching
- **Azure Container Registry (ACR)** - Docker image storage
- **Azure Application Gateway** - Load balancer with WAF
- **Azure Key Vault** - Secrets management
- **Azure Storage Account** - Static assets and backups
- **Azure Monitor** - Logging and monitoring

### Networking
- **Virtual Network (VNet)** - Isolated network environment
- **Network Security Groups (NSG)** - Firewall rules
- **Azure CDN** - Content delivery
- **Azure Front Door** - Global load balancing

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create resource group
az group create \
  --name boom-card-prod \
  --location westeurope

# Set default resource group
az configure --defaults group=boom-card-prod location=westeurope
```

### 2. Create Azure Container Registry

```bash
# Create ACR
az acr create \
  --name boomcardregistry \
  --sku Premium \
  --admin-enabled true

# Get ACR credentials
az acr credential show --name boomcardregistry

# Login to ACR
az acr login --name boomcardregistry
```

### 3. Setup PostgreSQL Database

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --name boom-card-db \
  --resource-group boom-card-prod \
  --location westeurope \
  --admin-user boomadmin \
  --admin-password "SecurePassword123!" \
  --sku-name Standard_D2ds_v4 \
  --tier GeneralPurpose \
  --storage-size 128 \
  --version 14 \
  --high-availability Enabled \
  --backup-retention 30 \
  --geo-redundant-backup Enabled

# Configure firewall rules
az postgres flexible-server firewall-rule create \
  --name AllowAzureServices \
  --server boom-card-db \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Create databases
az postgres flexible-server db create \
  --server-name boom-card-db \
  --database-name boom_production

az postgres flexible-server db create \
  --server-name boom-card-db \
  --database-name boom_analytics
```

### 4. Setup Redis Cache

```bash
# Create Redis instance
az redis create \
  --name boom-card-cache \
  --sku Premium \
  --vm-size P1 \
  --enable-non-ssl-port false \
  --redis-configuration maxmemory-policy="allkeys-lru"

# Get Redis connection string
az redis list-keys --name boom-card-cache
```

### 5. Create Key Vault

```bash
# Create Key Vault
az keyvault create \
  --name boom-card-vault \
  --enable-rbac-authorization false \
  --enable-soft-delete true \
  --retention-days 90

# Add secrets
az keyvault secret set \
  --vault-name boom-card-vault \
  --name "database-connection" \
  --value "postgresql://boomadmin:password@boom-card-db.postgres.database.azure.com:5432/boom_production?ssl=true"

az keyvault secret set \
  --vault-name boom-card-vault \
  --name "redis-connection" \
  --value "boom-card-cache.redis.cache.windows.net:6380,password=YOUR_REDIS_KEY,ssl=True,abortConnect=False"

az keyvault secret set \
  --vault-name boom-card-vault \
  --name "jwt-secret" \
  --value "your-super-secret-jwt-key"

az keyvault secret set \
  --vault-name boom-card-vault \
  --name "stripe-api-key" \
  --value "sk_live_..."

az keyvault secret set \
  --vault-name boom-card-vault \
  --name "sendgrid-api-key" \
  --value "SG...."
```

### 6. Create Storage Account

```bash
# Create storage account
az storage account create \
  --name boomcardstorage \
  --sku Standard_LRS \
  --kind StorageV2 \
  --https-only true \
  --min-tls-version TLS1_2

# Create containers
az storage container create \
  --name uploads \
  --account-name boomcardstorage \
  --public-access off

az storage container create \
  --name static \
  --account-name boomcardstorage \
  --public-access blob

az storage container create \
  --name backups \
  --account-name boomcardstorage \
  --public-access off
```

### 7. Setup Virtual Network

```bash
# Create VNet
az network vnet create \
  --name boom-card-vnet \
  --address-prefix 10.0.0.0/16

# Create subnets
az network vnet subnet create \
  --vnet-name boom-card-vnet \
  --name aks-subnet \
  --address-prefix 10.0.1.0/24

az network vnet subnet create \
  --vnet-name boom-card-vnet \
  --name gateway-subnet \
  --address-prefix 10.0.2.0/24

az network vnet subnet create \
  --vnet-name boom-card-vnet \
  --name database-subnet \
  --address-prefix 10.0.3.0/24
```

### 8. Create AKS Cluster

```bash
# Create AKS cluster
az aks create \
  --name boom-card-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --network-plugin azure \
  --vnet-subnet-id $(az network vnet subnet show --vnet-name boom-card-vnet --name aks-subnet --query id -o tsv) \
  --docker-bridge-address 172.17.0.1/16 \
  --dns-service-ip 10.2.0.10 \
  --service-cidr 10.2.0.0/24 \
  --enable-managed-identity \
  --enable-addons monitoring,azure-policy,azure-keyvault-secrets-provider \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --zones 1 2 3 \
  --attach-acr boomcardregistry

# Get credentials
az aks get-credentials --name boom-card-aks
```

### 9. Build and Push Docker Images

Create `Dockerfile.api`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3000
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

Create `Dockerfile.web`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

Build and push:
```bash
# Build API
docker build -f Dockerfile.api -t boomcardregistry.azurecr.io/boom-api:latest ./backend
docker push boomcardregistry.azurecr.io/boom-api:latest

# Build Web
docker build -f Dockerfile.web -t boomcardregistry.azurecr.io/boom-web:latest ./frontend
docker push boomcardregistry.azurecr.io/boom-web:latest
```

### 10. Deploy to Kubernetes

Create `k8s/namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: boom-card
```

Create `k8s/configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: boom-config
  namespace: boom-card
data:
  NODE_ENV: "production"
  API_PORT: "3000"
  WEB_PORT: "3000"
  REDIS_HOST: "boom-card-cache.redis.cache.windows.net"
  REDIS_PORT: "6380"
  REDIS_TLS: "true"
  DATABASE_HOST: "boom-card-db.postgres.database.azure.com"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "boom_production"
  DATABASE_SSL: "true"
```

Create `k8s/secrets.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: boom-secrets
  namespace: boom-card
type: Opaque
stringData:
  DATABASE_USER: "boomadmin"
  DATABASE_PASSWORD: "SecurePassword123!"
  REDIS_PASSWORD: "YOUR_REDIS_PASSWORD"
  JWT_SECRET: "your-jwt-secret"
  STRIPE_API_KEY: "sk_live_..."
  SENDGRID_API_KEY: "SG...."
```

Create `k8s/api-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boom-api
  namespace: boom-card
spec:
  replicas: 3
  selector:
    matchLabels:
      app: boom-api
  template:
    metadata:
      labels:
        app: boom-api
    spec:
      containers:
      - name: api
        image: boomcardregistry.azurecr.io/boom-api:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: boom-config
        - secretRef:
            name: boom-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: boom-api-service
  namespace: boom-card
spec:
  selector:
    app: boom-api
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

Create `k8s/web-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boom-web
  namespace: boom-card
spec:
  replicas: 3
  selector:
    matchLabels:
      app: boom-web
  template:
    metadata:
      labels:
        app: boom-web
    spec:
      containers:
      - name: web
        image: boomcardregistry.azurecr.io/boom-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.boomcard.bg"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: boom-web-service
  namespace: boom-card
spec:
  selector:
    app: boom-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

Create `k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: boom-ingress
  namespace: boom-card
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
    cert-manager