#!/bin/bash

# BOOM Card Platform Backup Script
# Performs automated backups of database, uploaded files, and configurations
# Usage: ./backup.sh [--type <database|files|full>] [--destination <path>]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="/var/backups/boomcard"
LOG_FILE="/var/log/boomcard/backup.log"
RETENTION_DAYS=30

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-boomcard}"
DB_USER="${DB_USER:-boomcard_user}"
PGPASSFILE="${PGPASSFILE:-$HOME/.pgpass}"

# S3 configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_REGION="${S3_REGION:-eu-central-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
BACKUP_TYPE="full"
CUSTOM_DESTINATION=""
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
    local level=$1
    shift
    local message="$@"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    log "ERROR" "$1"
    exit 1
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
    log "INFO" "$1"
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    log "WARNING" "$1"
}

check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check if running as appropriate user
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root is not recommended"
    fi
    
    # Check required commands
    local required_commands=("pg_dump" "tar" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "Required command '$cmd' not found"
        fi
    done
    
    # Check AWS CLI if S3 backup is configured
    if [[ -n "$S3_BUCKET" ]]; then
        if ! command -v "aws" &> /dev/null; then
            error_exit "AWS CLI not found but S3 backup is configured"
        fi
    fi
    
    # Create backup directories
    mkdir -p "$BACKUP_ROOT"/{database,files,config}
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Check disk space
    local available_space=$(df -BG "$BACKUP_ROOT" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $available_space -lt 5 ]]; then
        error_exit "Insufficient disk space. At least 5GB required, only ${available_space}GB available"
    fi
    
    log "INFO" "Prerequisites check completed"
}

backup_database() {
    log "INFO" "Starting database backup..."
    
    local backup_dir="$BACKUP_ROOT/database"
    local backup_file="$backup_dir/boomcard_db_${TIMESTAMP}.sql.gz"
    
    # Set PostgreSQL password file permissions
    if [[ -f "$PGPASSFILE" ]]; then
        chmod 600 "$PGPASSFILE"
    fi
    
    # Perform database dump
    log "INFO" "Dumping database $DB_NAME..."
    
    if PGPASSWORD="${PGPASSWORD:-}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-privileges \
        --format=plain \
        --encoding=UTF8 \
        --clean \
        --if-exists \
        2>> "$LOG_FILE" | gzip -9 > "$backup_file"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        success "Database backed up successfully ($size)"
        log "INFO" "Database backup completed: $backup_file ($size)"
        
        # Create symlink to latest backup
        ln -sf "$backup_file" "$backup_dir/latest.sql.gz"
        
        echo "$backup_file"
    else
        error_exit "Database backup failed"
    fi
}

backup_files() {
    log "INFO" "Starting files backup..."
    
    local backup_dir="$BACKUP_ROOT/files"
    local backup_file="$backup_dir/boomcard_files_${TIMESTAMP}.tar.gz"
    
    # Define directories to backup
    local dirs_to_backup=(
        "$PROJECT_ROOT/uploads"
        "$PROJECT_ROOT/public/assets"
        "$PROJECT_ROOT/temp"
    )
    
    # Check if directories exist
    local existing_dirs=()
    for dir in "${dirs_to_backup[@]}"; do
        if [[ -d "$dir" ]]; then
            existing_dirs+=("$dir")
        else
            warning "Directory $dir does not exist, skipping"
        fi
    done
    
    if [[ ${#existing_dirs[@]} -eq 0 ]]; then
        warning "No directories to backup"
        return
    fi
    
    # Create tar archive
    log "INFO" "Creating files archive..."
    
    if tar -czf "$backup_file" \
        --exclude="*.tmp" \
        --exclude="*.log" \
        --exclude="node_modules" \
        --exclude=".git" \
        -C / \
        "${existing_dirs[@]/#//}" \
        2>> "$LOG_FILE"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        success "Files backed up successfully ($size)"
        log "INFO" "Files backup completed: $backup_file ($size)"
        
        # Create symlink to latest backup
        ln -sf "$backup_file" "$backup_dir/latest.tar.gz"
        
        echo "$backup_file"
    else
        error_exit "Files backup failed"
    fi
}

backup_config() {
    log "INFO" "Starting configuration backup..."
    
    local backup_dir="$BACKUP_ROOT/config"
    local backup_file="$backup_dir/boomcard_config_${TIMESTAMP}.tar.gz"
    
    # Configuration files to backup
    local config_files=(
        "$PROJECT_ROOT/.env"
        "$PROJECT_ROOT/.env.production"
        "$PROJECT_ROOT/config"
        "$PROJECT_ROOT/docker-compose.yml"
        "$PROJECT_ROOT/docker-compose.prod.yml"
        "$PROJECT_ROOT/nginx"
        "$PROJECT_ROOT/package.json"
        "$PROJECT_ROOT/package-lock.json"
        "$PROJECT_ROOT/tsconfig.json"
    )
    
    # Check existing files
    local existing_files=()
    for file in "${config_files[@]}"; do
        if [[ -e "$file" ]]; then
            existing_files+=("$file")
        fi
    done
    
    if [[ ${#existing_files[@]} -eq 0 ]]; then
        warning "No configuration files to backup"
        return
    fi
    
    # Create tar archive
    if tar -czf "$backup_file" \
        -C / \
        "${existing_files[@]/#//}" \
        2>> "$LOG_FILE"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        success "Configuration backed up successfully ($size)"
        log "INFO" "Configuration backup completed: $backup_file ($size)"
        
        # Create symlink to latest backup
        ln -sf "$backup_file" "$backup_dir/latest.tar.gz"
        
        echo "$backup_file"
    else
        error_exit "Configuration backup failed"
    fi
}

upload_to_s3() {
    local file=$1
    
    if [[ -z "$S3_BUCKET" ]]; then
        return
    fi
    
    log "INFO" "Uploading $file to S3..."
    
    local filename=$(basename "$file")
    local s3_path="s3://$S3_BUCKET/backups/$(date +%Y/%m/%d)/$filename"
    
    if aws s3 cp "$file" "$s3_path" \
        --region "$S3_REGION" \
        --profile "$AWS_PROFILE" \
        --storage-class STANDARD_IA \
        2>> "$LOG_FILE"; then
        
        success "Uploaded to S3: $s3_path"
        log "INFO" "S3 upload completed: $s3_path"
    else
        warning "Failed to upload to S3"
    fi
}

cleanup_old_backups() {
    log "INFO" "Cleaning up old backups..."
    
    # Clean local backups
    find "$BACKUP_ROOT" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE" || true
    
    local deleted_count=$(find "$BACKUP_ROOT" -type f -name "*.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [[ $deleted_count -gt 0 ]]; then
        log "INFO" "Deleted $deleted_count old backup files"
    fi
    
    # Clean S3 backups if configured
    if [[ -n "$S3_BUCKET" ]]; then
        log "INFO" "Cleaning up old S3 backups..."
        
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        
        aws s3 ls "s3://$S3_BUCKET/backups/" \
            --recursive \
            --region "$S3_REGION" \
            --profile "$AWS_PROFILE" \
            2>> "$LOG_FILE" | \
        while read -r line; do
            local file_date=$(echo "$line" | awk '{print $1}')
            local file_path=$(echo "$line" | awk '{print $4}')
            
            if [[ "$file_date" < "$cutoff_date" ]]; then
                aws s3 rm "s3://$S3_BUCKET/$file_path" \
                    --region "$S3_REGION" \
                    --profile "$AWS_PROFILE" \
                    2>> "$LOG_FILE" || true
            fi
        done
    fi
}

send_notification() {
    local status=$1
    local message=$2
    
    # Send email notification if configured
    if [[ -n "${BACKUP_EMAIL:-}" ]]; then
        echo "$message" | mail -s "BOOM Card Backup $status" "$BACKUP_EMAIL" || true
    fi
    
    # Send Slack notification if configured
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"BOOM Card Backup $status: $message\"}" \
            2>> "$LOG_FILE" || true
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        --destination)
            CUSTOM_DESTINATION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--type <database|files|full>] [--destination <path>]"
            echo ""
            echo "Options:"
            echo "  --type          Type of backup (database, files, or full). Default: full"
            echo "  --destination   Custom backup destination path"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  DB_HOST         Database host (default: localhost)"
            echo "  DB_PORT         Database port (default: 5432)"
            echo "  DB_NAME         Database name (default: boomcard)"
            echo "  DB_USER         Database user (default: boomcard_user)"
            echo "  PGPASSWORD      Database password"
          