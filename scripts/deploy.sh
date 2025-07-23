#!/bin/bash

# BOOM Card Platform Deployment Script
# Production deployment with zero-downtime strategy

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/deploy_${TIMESTAMP}.log"
BACKUP_DIR="${PROJECT_ROOT}/backups/${TIMESTAMP}"

# Environment variables
ENVIRONMENT="${DEPLOY_ENV:-production}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Service configuration
declare -A SERVICES=(
    ["api"]="boom-api"
    ["web"]="boom-web"
    ["admin"]="boom-admin"
    ["partner"]="boom-partner"
    ["worker"]="boom-worker"
)

# Function to log messages
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${message}"
            ;;
    esac
    
    echo "[${timestamp}] [${level}] ${message}" >> "${LOG_FILE}"
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    local required_commands=("docker" "docker-compose" "git" "node" "npm" "psql" "redis-cli")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log "ERROR" "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node -v | cut -d 'v' -f 2)
    local required_node_version="18.0.0"
    
    if [ "$(printf '%s\n' "$required_node_version" "$node_version" | sort -V | head -n1)" != "$required_node_version" ]; then
        log "ERROR" "Node.js version must be >= ${required_node_version} (current: ${node_version})"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running"
        exit 1
    fi
    
    log "SUCCESS" "All prerequisites satisfied"
}

# Function to validate environment
validate_environment() {
    log "INFO" "Validating environment configuration..."
    
    # Check required environment variables
    local required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASS"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log "ERROR" "Required environment variable '${var}' is not set"
            exit 1
        fi
    done
    
    # Test database connection
    if ! psql "${DATABASE_URL}" -c "SELECT 1" &> /dev/null; then
        log "ERROR" "Cannot connect to database"
        exit 1
    fi
    
    # Test Redis connection
    if ! redis-cli -u "${REDIS_URL}" ping &> /dev/null; then
        log "ERROR" "Cannot connect to Redis"
        exit 1
    fi
    
    log "SUCCESS" "Environment validation passed"
}

# Function to create backup
create_backup() {
    log "INFO" "Creating backup..."
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup database
    local db_backup="${BACKUP_DIR}/database_${TIMESTAMP}.sql"
    pg_dump "${DATABASE_URL}" > "${db_backup}"
    gzip "${db_backup}"
    
    # Backup uploaded files
    if [ -d "${PROJECT_ROOT}/uploads" ]; then
        tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C "${PROJECT_ROOT}" uploads/
    fi
    
    # Backup environment configuration
    cp "${PROJECT_ROOT}/.env.${ENVIRONMENT}" "${BACKUP_DIR}/"
    
    # Upload backup to S3
    if command -v aws &> /dev/null; then
        aws s3 sync "${BACKUP_DIR}" "s3://boom-backups/${TIMESTAMP}/" --quiet
        log "SUCCESS" "Backup uploaded to S3"
    fi
    
    log "SUCCESS" "Backup completed: ${BACKUP_DIR}"
}

# Function to build services
build_services() {
    log "INFO" "Building services..."
    
    cd "${PROJECT_ROOT}"
    
    # Install dependencies
    npm ci --production=false
    
    # Run tests
    log "INFO" "Running tests..."
    npm run test:ci
    
    # Build TypeScript
    npm run build
    
    # Build Docker images
    for service in "${!SERVICES[@]}"; do
        local image_name="${SERVICES[$service]}"
        local dockerfile="${PROJECT_ROOT}/docker/Dockerfile.${service}"
        
        if [ -f "${dockerfile}" ]; then
            log "INFO" "Building ${service} image..."
            
            docker build \
                --build-arg NODE_ENV=production \
                --build-arg BUILD_TIMESTAMP="${TIMESTAMP}" \
                --tag "${image_name}:${IMAGE_TAG}" \
                --tag "${image_name}:latest" \
                --file "${dockerfile}" \
                "${PROJECT_ROOT}"
                
            if [ -n "${DOCKER_REGISTRY}" ]; then
                docker tag "${image_name}:${IMAGE_TAG}" "${DOCKER_REGISTRY}/${image_name}:${IMAGE_TAG}"
                docker push "${DOCKER_REGISTRY}/${image_name}:${IMAGE_TAG}"
            fi
        fi
    done
    
    log "SUCCESS" "Build completed successfully"
}

# Function to run database migrations
run_migrations() {
    log "INFO" "Running database migrations..."
    
    cd "${PROJECT_ROOT}"
    
    # Create migration backup
    pg_dump "${DATABASE_URL}" --schema-only > "${BACKUP_DIR}/schema_before_migration.sql"
    
    # Run migrations
    npm run migrate:up
    
    # Verify migrations
    npm run migrate:status
    
    log "SUCCESS" "Database migrations completed"
}

# Function to deploy service with zero downtime
deploy_service() {
    local service=$1
    local container_name="${SERVICES[$service]}"
    
    log "INFO" "Deploying ${service}..."
    
    # Get current container ID
    local old_container=$(docker ps -q -f "name=${container_name}")
    
    # Start new container
    local new_container_name="${container_name}_new"
    
    docker run -d \
        --name "${new_container_name}" \
        --env-file "${PROJECT_ROOT}/.env.${ENVIRONMENT}" \
        --network boom-network \
        --restart unless-stopped \
        "${container_name}:${IMAGE_TAG}"
    
    # Wait for health check
    local retries=0
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if docker exec "${new_container_name}" /healthcheck.sh &> /dev/null; then
            log "SUCCESS" "Health check passed for ${service}"
            break
        fi
        
        retries=$((retries + 1))
        log "INFO" "Waiting for ${service} to be healthy... (${retries}/${HEALTH_CHECK_RETRIES})"
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    if [ $retries -eq $HEALTH_CHECK_RETRIES ]; then
        log "ERROR" "Health check failed for ${service}"
        docker stop "${new_container_name}" && docker rm "${new_container_name}"
        return 1
    fi
    
    # Update load balancer
    update_load_balancer "${service}" "${new_container_name}"
    
    # Stop old container
    if [ -n "${old_container}" ]; then
        docker stop "${old_container}"
        docker rm "${old_container}"
    fi
    
    # Rename new container
    docker rename "${new_container_name}" "${container_name}"
    
    log "SUCCESS" "${service} deployed successfully"
}

# Function to update load balancer
update_load_balancer() {
    local service=$1
    local container_name=$2
    
    log "INFO" "Updating load balancer for ${service}..."
    
    # Get container IP
    local container_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "${container_name}")
    
    # Update nginx upstream
    local nginx_config="/etc/nginx/upstreams/${service}.conf"
    local temp_config="/tmp/${service}_upstream.conf"
    
    echo "upstream ${service} {" > "${temp_config}"
    echo "    server ${container_ip}:3000 max_fails=3 fail_timeout=30s;" >> "${temp_config}"
    echo "}" >> "${temp_config}"
    
    # Atomic config update
    sudo mv "${temp_config}" "${nginx_config}"
    
    # Reload nginx
    sudo nginx -t && sudo nginx -s reload
    
    log "SUCCESS" "Load balancer updated"
}

# Function to run post-deployment tasks
post_deployment() {
    log "INFO" "Running post-deployment tasks..."
    
    # Clear caches
    redis-cli -u "${REDIS_URL}" FLUSHDB
    
    # Warm up cache
    curl -s -o /dev/null "https://api.boomcard.bg/health"
    
    # Send deployment notification
    local notification_payload=$(cat <<EOF
{
    "text": "Deployment completed successfully",
    "environment": "${ENVIRONMENT}",
    "timestamp": "${TIMESTAMP}",
    "version": "${IMAGE_TAG}",
    "services": $(echo ${!SERVICES[@]} | jq -R -s -c 'split(" ")')
}
EOF
)
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST "${SLACK_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "${notification_payload}" \
            &> /dev/null
    fi
    
    # Update deployment tracking
    echo "${TIMESTAMP},${IMAGE_TAG},${ENVIRONMENT},success" >> "${PROJECT_ROOT}/logs/deployments.csv"
    
    log "SUCCESS" "Post-deployment tasks completed"
}

# Function to rollback deployment
rollback() {
    log "WARNING" "Rolling back deployment..."
    
    # Restore database from backup
    if [ -f "${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz" ]; then
        gunzip -c "${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz" | psql "${DATABASE_URL}"
        log "SUCCESS" "Database restored from backup"
    fi
    
    # Restore containers to previous version
    for service in "${!SERVICES[@]}"; do
        local container_name="${SERVICES[$service]}"
        local previous_tag