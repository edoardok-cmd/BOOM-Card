#!/bin/bash

# BOOM Card Platform - Database Restore Script
# Purpose: Restore PostgreSQL database from backup
# Usage: ./restore.sh [backup_file] [options]

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Default values
BACKUP_FILE=""
DB_NAME="${POSTGRES_DB:-boomcard}"
DB_USER="${POSTGRES_USER:-boomcard_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
FORCE_RESTORE=false
SKIP_VALIDATION=false
CREATE_DB=false
CLEAN_RESTORE=false

# Function to display usage
usage() {
    echo "Usage: $0 [backup_file] [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -d, --database NAME     Database name (default: $DB_NAME)"
    echo "  -u, --user USER         Database user (default: $DB_USER)"
    echo "  -H, --host HOST         Database host (default: $DB_HOST)"
    echo "  -p, --port PORT         Database port (default: $DB_PORT)"
    echo "  -f, --force             Force restore without confirmation"
    echo "  -s, --skip-validation   Skip backup file validation"
    echo "  -c, --create-db         Create database if it doesn't exist"
    echo "  -C, --clean             Drop existing database before restore"
    echo "  --list                  List available backups"
    echo ""
    echo "Examples:"
    echo "  $0 backup_20240115_120000.sql"
    echo "  $0 --list"
    echo "  $0 backup_20240115_120000.sql --force --clean"
    exit 1
}

# Function to log messages
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log errors
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Function to log warnings
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to log success
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to list available backups
list_backups() {
    log "Available backups in $BACKUP_DIR:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    local count=0
    for file in "$BACKUP_DIR"/*.{sql,sql.gz,dump,backup} 2>/dev/null; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            local date=$(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo "Unknown")
            printf "  %-40s %10s  %s\n" "$filename" "$size" "$date"
            ((count++))
        fi
    done
    
    if [ $count -eq 0 ]; then
        warning "No backup files found in $BACKUP_DIR"
    else
        echo ""
        log "Total: $count backup(s) found"
    fi
}

# Function to validate backup file
validate_backup() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        error "Backup file not found: $file"
        return 1
    fi
    
    # Check file extension
    case "$file" in
        *.sql|*.sql.gz|*.dump|*.backup)
            ;;
        *)
            warning "Unusual file extension. Expected .sql, .sql.gz, .dump, or .backup"
            ;;
    esac
    
    # Check if file is empty
    if [ ! -s "$file" ]; then
        error "Backup file is empty: $file"
        return 1
    fi
    
    # For SQL files, check for basic SQL structure
    if [[ "$file" == *.sql ]]; then
        if ! head -n 100 "$file" | grep -qE "(CREATE|INSERT|ALTER|DROP)" 2>/dev/null; then
            warning "File doesn't appear to contain SQL statements"
        fi
    fi
    
    # Check for PostgreSQL dump signature
    if [[ "$file" == *.dump ]] || [[ "$file" == *.backup ]]; then
        if ! file "$file" | grep -q "PostgreSQL" 2>/dev/null; then
            warning "File doesn't appear to be a PostgreSQL dump"
        fi
    fi
    
    return 0
}

# Function to check database connection
check_db_connection() {
    log "Checking database connection..."
    
    if PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
        success "Database connection successful"
        return 0
    else
        error "Failed to connect to database"
        return 1
    fi
}

# Function to check if database exists
database_exists() {
    local db_name=$1
    
    if PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        return 0
    else
        return 1
    fi
}

# Function to create database
create_database() {
    local db_name=$1
    
    log "Creating database: $db_name"
    
    if PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $db_name;" 2>/dev/null; then
        success "Database created: $db_name"
        return 0
    else
        error "Failed to create database: $db_name"
        return 1
    fi
}

# Function to drop database
drop_database() {
    local db_name=$1
    
    log "Dropping database: $db_name"
    
    # Terminate existing connections
    PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '$db_name' AND pid <> pg_backend_pid();" 2>/dev/null || true
    
    if PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $db_name;" 2>/dev/null; then
        success "Database dropped: $db_name"
        return 0
    else
        error "Failed to drop database: $db_name"
        return 1
    fi
}

# Function to get backup metadata
get_backup_metadata() {
    local file=$1
    
    echo "Backup Information:"
    echo "  File: $(basename "$file")"
    echo "  Size: $(du -h "$file" | cut -f1)"
    echo "  Modified: $(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo "Unknown")"
    
    # Try to extract version info from backup
    if [[ "$file" == *.sql ]]; then
        local version=$(head -n 50 "$file" | grep -i "postgresql database dump" | head -1 || echo "")
        if [ -n "$version" ]; then
            echo "  Version: $version"
        fi
    fi
}

# Function to restore from SQL file
restore_sql() {
    local file=$1
    local db_name=$2
    
    log "Restoring from SQL file..."
    
    if [[ "$file" == *.gz ]]; then
        # Compressed SQL file
        if gunzip -c "$file" | PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -v ON_ERROR_STOP=1; then
            return 0
        else
            return 1
        fi
    else
        # Plain SQL file
        if PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -v ON_ERROR_STOP=1 -f "$file"; then
            return 0
        else
            return 1
        fi
    fi
}

# Function to restore from dump file
restore_dump() {
    local file=$1
    local db_name=$2
    
    log "Restoring from dump file..."
    
    if PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -v "$file"; then
        return 0
    else
        return 1
    fi
}

# Function to perform post-restore tasks
post_restore_tasks() {
    local db_name=$1
    
    log "Running post-restore tasks..."
    
    # Update sequences
    log "Updating sequences..."
    PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -c "
        DO \$\$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN 
                SELECT schemaname, tablename, columnname, sequencename
                FROM pg_sequences
                JOIN information_schema.columns ON columns.column_default LIKE '%' || sequencename || '%'
                WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            LOOP
                EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 1))',
                    r.sequencename, r.columnname, r.schemaname, r.tablename);
            END LOOP;
        END \$\$;" 2>/dev/null || warning "Failed to update some sequences"
    
    # Analyze database
    log "Analyzing database..."
    PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -c "ANALYZE;" 2>/dev/null || warning "Failed to analyze database"
    
    # Clear Redis cache if available
    if command -v redis-cli &> /dev/null && [ -n "${REDIS_HOST:-}" ]; then
        log "Clearing Redis cache..."
        redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" FLUSHDB 2>/dev/null || warning "Failed to clear Redis cache"
    fi
    
    success "Post-restore tasks completed"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -H|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_RESTORE=true
            shift
            ;;
        -s|--skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        -c|--create-db)
            CREATE_DB=true
            shift
            ;;
        -C|--clean)
            CLEAN_RESTORE=true
            shift
            ;;
        --list)
            list_backups
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            usage
            ;;
        *)
        