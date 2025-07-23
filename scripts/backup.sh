#!/bin/bash

# BOOM Card Platform - Database Backup Script
# This script performs automated backups of the PostgreSQL database
# with support for local and cloud storage (S3)

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/var/backups/boomcard}"
BACKUP_FILENAME="boomcard_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
MAX_RETRIES=3
RETRY_DELAY=5

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-boomcard}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

# S3 configuration (optional)
S3_BUCKET="${S3_BUCKET}"
S3_PREFIX="${S3_PREFIX:-database-backups}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

# Slack webhook for notifications (optional)
SLACK_WEBHOOK="${SLACK_WEBHOOK}"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

error_exit() {
    log "ERROR: $1"
    send_notification "error" "$1"
    exit 1
}

send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "${SLACK_WEBHOOK}" ]; then
        local color="good"
        local emoji=":white_check_mark:"
        
        if [ "$status" = "error" ]; then
            color="danger"
            emoji=":x:"
        fi
        
        curl -X POST "${SLACK_WEBHOOK}" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"${color}\",
                    \"fields\": [{
                        \"title\": \"Database Backup ${emoji}\",
                        \"value\": \"${message}\",
                        \"short\": false
                    }],
                    \"footer\": \"BOOM Card Backup System\",
                    \"ts\": $(date +%s)
                }]
            }" 2>/dev/null || log "Warning: Failed to send Slack notification"
    fi
}

check_requirements() {
    log "Checking requirements..."
    
    # Check if PostgreSQL client is installed
    if ! command -v pg_dump &> /dev/null; then
        error_exit "pg_dump command not found. Please install PostgreSQL client."
    fi
    
    # Check if AWS CLI is installed (if S3 backup is enabled)
    if [ -n "${S3_BUCKET}" ] && ! command -v aws &> /dev/null; then
        error_exit "AWS CLI not found but S3 backup is configured. Please install AWS CLI."
    fi
    
    # Create backup directory if it doesn't exist
    if [ ! -d "${BACKUP_DIR}" ]; then
        mkdir -p "${BACKUP_DIR}" || error_exit "Failed to create backup directory: ${BACKUP_DIR}"
    fi
    
    # Check database connectivity
    export PGPASSWORD="${DB_PASSWORD}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" > /dev/null 2>&1 || \
        error_exit "Failed to connect to database"
    
    log "All requirements met"
}

perform_backup() {
    log "Starting database backup..."
    
    local retry_count=0
    local backup_success=false
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" \
            --verbose \
            --no-owner \
            --no-privileges \
            --format=custom \
            --blobs \
            -f "${BACKUP_PATH}" 2>&1 | tee -a "${LOG_FILE}"; then
            
            backup_success=true
            break
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log "Backup attempt $retry_count failed. Retrying in ${RETRY_DELAY} seconds..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    if [ "$backup_success" = false ]; then
        error_exit "Database backup failed after ${MAX_RETRIES} attempts"
    fi
    
    # Compress the backup
    log "Compressing backup file..."
    gzip "${BACKUP_PATH}"
    BACKUP_PATH="${BACKUP_PATH}.gz"
    BACKUP_FILENAME="${BACKUP_FILENAME}.gz"
    
    # Calculate file size
    local file_size=$(du -h "${BACKUP_PATH}" | cut -f1)
    log "Backup completed successfully. File size: ${file_size}"
}

verify_backup() {
    log "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [ ! -f "${BACKUP_PATH}" ]; then
        error_exit "Backup file not found: ${BACKUP_PATH}"
    fi
    
    if [ ! -s "${BACKUP_PATH}" ]; then
        error_exit "Backup file is empty: ${BACKUP_PATH}"
    fi
    
    # Test backup file integrity
    if ! gzip -t "${BACKUP_PATH}" 2>/dev/null; then
        error_exit "Backup file is corrupted: ${BACKUP_PATH}"
    fi
    
    log "Backup verification passed"
}

upload_to_s3() {
    if [ -z "${S3_BUCKET}" ]; then
        log "S3 backup not configured, skipping upload"
        return
    fi
    
    log "Uploading backup to S3..."
    
    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILENAME}"
    
    if aws s3 cp "${BACKUP_PATH}" "${s3_path}" \
        --region "${AWS_REGION}" \
        --storage-class STANDARD_IA \
        --metadata "timestamp=${TIMESTAMP},database=${DB_NAME},host=${DB_HOST}"; then
        
        log "Backup uploaded successfully to S3: ${s3_path}"
        
        # Verify S3 upload
        if aws s3 ls "${s3_path}" --region "${AWS_REGION}" > /dev/null 2>&1; then
            log "S3 upload verification passed"
        else
            error_exit "S3 upload verification failed"
        fi
    else
        error_exit "Failed to upload backup to S3"
    fi
}

cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Clean local backups
    local deleted_count=0
    while IFS= read -r old_backup; do
        if rm -f "$old_backup"; then
            deleted_count=$((deleted_count + 1))
            log "Deleted old backup: $(basename "$old_backup")"
        fi
    done < <(find "${BACKUP_DIR}" -name "boomcard_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS})
    
    log "Deleted ${deleted_count} old local backups"
    
    # Clean S3 backups if configured
    if [ -n "${S3_BUCKET}" ]; then
        log "Cleaning up old S3 backups..."
        
        local cutoff_date=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
        
        aws s3api list-objects-v2 \
            --bucket "${S3_BUCKET}" \
            --prefix "${S3_PREFIX}/" \
            --query "Contents[?LastModified<='${cutoff_date}'].Key" \
            --output text | tr '\t' '\n' | while read -r key; do
            
            if [ -n "$key" ]; then
                aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
                log "Deleted old S3 backup: ${key}"
            fi
        done
    fi
}

generate_backup_report() {
    log "Generating backup report..."
    
    local report_file="${BACKUP_DIR}/backup_report_${TIMESTAMP}.json"
    local file_size=$(stat -c%s "${BACKUP_PATH}" 2>/dev/null || stat -f%z "${BACKUP_PATH}" 2>/dev/null)
    local duration=$(($(date +%s) - start_time))
    
    cat > "${report_file}" <<EOF
{
    "timestamp": "${TIMESTAMP}",
    "database": {
        "host": "${DB_HOST}",
        "port": "${DB_PORT}",
        "name": "${DB_NAME}"
    },
    "backup": {
        "filename": "${BACKUP_FILENAME}",
        "path": "${BACKUP_PATH}",
        "size_bytes": ${file_size},
        "duration_seconds": ${duration},
        "compression": "gzip"
    },
    "storage": {
        "local": "${BACKUP_PATH}",
        "s3": $([ -n "${S3_BUCKET}" ] && echo "\"s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILENAME}\"" || echo "null")
    },
    "retention_days": ${RETENTION_DAYS},
    "status": "success"
}
EOF
    
    log "Backup report saved to: ${report_file}"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    log "======================================"
    log "BOOM Card Database Backup Starting"
    log "======================================"
    log "Timestamp: ${TIMESTAMP}"
    log "Database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}"
    log "Backup directory: ${BACKUP_DIR}"
    
    # Execute backup steps
    check_requirements
    perform_backup
    verify_backup
    upload_to_s3
    cleanup_old_backups
    generate_backup_report
    
    # Calculate total duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "======================================"
    log "Backup completed successfully in ${duration} seconds"
    log "======================================"
    
    send_notification "success" "Database backup completed successfully\nFile: ${BACKUP_FILENAME}\nDuration: ${duration}s"
}

# Run main function
main "$@"
