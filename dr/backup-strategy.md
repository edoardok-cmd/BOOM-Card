# Backup Strategy Document

## Overview

This document outlines the comprehensive backup and disaster recovery strategy for the BOOM Card discount platform. Our strategy ensures business continuity, data integrity, and rapid recovery in case of system failures or data loss incidents.

## Backup Scope

### Critical Data Categories

1. **Database Systems**
   - PostgreSQL primary database (user data, transactions, partner information)
   - Redis cache data (session states, temporary data)
   - Configuration databases

2. **Application Data**
   - Uploaded files (partner images, QR codes, user documents)
   - Static assets and media files
   - Application logs and audit trails

3. **System Configuration**
   - Server configurations
   - Environment variables and secrets
   - Infrastructure as Code (IaC) templates
   - CI/CD pipeline configurations

4. **Code Repositories**
   - Source code
   - Documentation
   - Database migration scripts
   - Deployment scripts

## Backup Types and Schedules

### 1. Full Backups
- **Frequency**: Weekly (Sundays at 2:00 AM UTC)
- **Retention**: 4 weeks rolling
- **Storage**: Primary: AWS S3, Secondary: Azure Blob Storage
- **Encryption**: AES-256 encryption at rest

### 2. Incremental Backups
- **Frequency**: Daily (2:00 AM UTC)
- **Retention**: 7 days
- **Storage**: AWS S3 with lifecycle policies
- **Method**: PostgreSQL WAL archiving, file system snapshots

### 3. Real-time Replication
- **Database**: PostgreSQL streaming replication to standby servers
- **Redis**: Redis Sentinel for automatic failover
- **Files**: Real-time sync to secondary storage regions

### 4. Point-in-Time Recovery (PITR)
- **Capability**: Restore to any point within the last 7 days
- **Method**: Continuous WAL archiving
- **Testing**: Monthly PITR drill

## Backup Infrastructure

### Storage Locations

1. **Primary Storage**
   ```
   AWS S3 Buckets:
   - boom-card-db-backups-prod (Database backups)
   - boom-card-files-backups-prod (File backups)
   - boom-card-config-backups-prod (Configuration backups)
   ```

2. **Secondary Storage**
   ```
   Azure Blob Storage:
   - boomcard-dr-primary (Cross-region replication)
   - boomcard-dr-secondary (Archive tier for long-term)
   ```

3. **Geographic Distribution**
   - Primary: EU-Central-1 (Frankfurt)
   - Secondary: EU-West-1 (Ireland)
   - Tertiary: US-East-1 (Virginia) - For compliance

### Backup Automation

```yaml
# Backup Schedule Configuration
backup_schedules:
  database:
    full:
      cron: "0 2 * * 0"  # Weekly on Sunday
      retention_days: 28
    incremental:
      cron: "0 2 * * *"  # Daily
      retention_days: 7
    transaction_logs:
      interval: "5m"      # Every 5 minutes
      retention_days: 7
  
  files:
    media:
      cron: "0 3 * * *"  # Daily at 3 AM
      retention_days: 30
    configs:
      on_change: true     # Triggered on configuration changes
      retention_days: 90
```

## Recovery Procedures

### Recovery Time Objectives (RTO)

| System Component | RTO | RPO |
|-----------------|-----|-----|
| Database (Critical) | 15 minutes | 5 minutes |
| Application Servers | 30 minutes | 1 hour |
| File Storage | 1 hour | 4 hours |
| Full System | 2 hours | 1 hour |

### Recovery Priority Levels

1. **Priority 1 (Critical)**
   - User authentication database
   - Transaction records
   - Payment data

2. **Priority 2 (High)**
   - Partner information
   - Active QR codes
   - Current promotions

3. **Priority 3 (Medium)**
   - Historical analytics
   - Archived transactions
   - User preferences

4. **Priority 4 (Low)**
   - Marketing materials
   - Old log files
   - Cached data

## Disaster Recovery Procedures

### 1. Database Recovery

```bash
# PostgreSQL Recovery Steps
1. Stop the corrupted database
   systemctl stop postgresql

2. Restore from latest full backup
   pg_restore -h localhost -p 5432 -U postgres -d boom_card_prod \
     /backups/full/boom_card_prod_20240120.dump

3. Apply incremental changes
   pg_wal_replay -t '2024-01-21 14:30:00' \
     /backups/wal/

4. Verify data integrity
   psql -U postgres -d boom_card_prod -c "SELECT verify_backup_integrity();"

5. Update connection strings and restart services
```

### 2. Application Recovery

```bash
# Application Recovery Playbook
1. Deploy from last known good configuration
   kubectl apply -f /backups/k8s/boom-card-prod-20240120.yaml

2. Restore environment variables
   kubectl create secret generic boom-card-secrets \
     --from-file=/backups/secrets/prod-secrets.enc

3. Verify health checks
   kubectl get pods -n boom-card-prod
   curl https://api.boom-card.com/health

4. Run smoke tests
   npm run test:e2e:critical
```

### 3. File Storage Recovery

```bash
# S3 Recovery Process
1. List available backups
   aws s3 ls s3://boom-card-files-backups-prod/

2. Sync files to production bucket
   aws s3 sync s3://boom-card-files-backups-prod/20240120/ \
     s3://boom-card-files-prod/ --delete

3. Verify CDN cache invalidation
   aws cloudfront create-invalidation \
     --distribution-id E1234567890 \
     --paths "/*"
```

## Monitoring and Alerts

### Backup Health Monitoring

```yaml
monitoring:
  backup_jobs:
    - name: "Database Full Backup"
      alert_on_failure: true
      alert_channels: ["pagerduty", "slack", "email"]
      success_metric: "backup_size > 1GB"
    
    - name: "WAL Archiving"
      alert_on_failure: true
      max_lag_minutes: 10
      alert_channels: ["pagerduty"]
    
    - name: "File Sync Status"
      check_interval: "1h"
      alert_on_failure: true
      alert_channels: ["slack", "email"]
```

### Key Metrics

1. **Backup Success Rate**
   - Target: 99.9%
   - Alert threshold: < 99%

2. **Backup Size Trends**
   - Monitor for unexpected growth
   - Alert on > 20% deviation

3. **Recovery Time Testing**
   - Monthly recovery drills
   - Document actual RTO vs target

4. **Storage Utilization**
   - Monitor backup storage costs
   - Implement lifecycle policies

## Testing and Validation

### Monthly Disaster Recovery Drills

1. **First Monday**: Database recovery test
   - Restore to test environment
   - Verify data integrity
   - Test application connectivity

2. **Second Monday**: Application failover test
   - Simulate region failure
   - Test auto-scaling
   - Verify load balancer switching

3. **Third Monday**: Full system recovery
   - Complete DR scenario
   - Document recovery time
   - Update runbooks

4. **Fourth Monday**: Backup verification
   - Random restore testing
   - Verify backup encryption
   - Test backup rotation

### Validation Checklist

```markdown
## Pre-Recovery Validation
- [ ] Verify backup integrity checksums
- [ ] Confirm backup age < RTO requirement
- [ ] Check available storage space
- [ ] Notify stakeholders of maintenance

## Post-Recovery Validation
- [ ] Database connectivity test
- [ ] Application health checks passing
- [ ] User authentication working
- [ ] Payment processing functional
- [ ] QR code generation operational
- [ ] Partner portal accessible
- [ ] Analytics data flowing
- [ ] All integrations verified
```

## Security Considerations

### Encryption Standards

1. **At Rest**
   - AES-256 encryption for all backups
   - Separate encryption keys per environment
   - Key rotation every 90 days

2. **In Transit**
   - TLS 1.3 for all backup transfers
   - VPN tunnels for cross-region replication
   - Certificate pinning for critical connections

3. **Access Control**
   - IAM roles with least privilege
   - MFA required for backup access
   - Audit logs for all backup operations
   - Time-limited access tokens

### Compliance Requirements

1. **GDPR Compliance**
   - Right to erasure implementation
   - Data retention policies
   - Cross-border transfer controls

2. **PCI DSS Requirements**
   - Encrypted payment data backups
   - Separate backup streams for PCI data
   - Annual backup security assessment

## Cost Optimization

### Storage Tiers

```yaml
storage_lifecycle:
  hot_tier:
    age: 0-7 days
    storage_class: "S3 Standard"
    access_pattern: "Frequent"
  
  warm_tier:
    age: 8-30 days
    storage_class: "S3 Standard-IA"
    access_pattern: "Infrequent"
  
  cold_tier:
    age: 31-90 days
    storage_class: "S3 Glacier"
    access_pattern: "Rare"
  
  archive_tier:
    age: 91+ days
    storage_class: "S3 Glacier Deep Archive"
    access_pattern: "Compliance only"
```

### Cost Monitoring

- Monthly backup storage cost review
- Automated lifecycle transitions
- Deduplication for similar files
- Compression optimization

## Responsibilities

### Backup Team Responsibilities

1. **DevOps Team**
   - Maintain backup infrastructure
   - Monitor backup jobs
   - Perform recovery drills
   - Update backup procedures

2. **Database Team**
   - Configure database backups
   - Validate data integrity
   - Optimize backup performance
   - Maintain recovery scripts

3. **Security Team**
   - Manage encryption keys
   - Audit backup access
   - Ensure compliance
   - Security testing

4. **Platform Team**
   - Define RTO/RPO requirements
   - Approve backup policies
   - Participate in DR drills
   - Review backup reports

## Communication Plan

### Incident Communication

1. **Backup Failure**
   ```
   Severity: High
   Notification: Immediate
   Channels: PagerDuty → Slack → Email
   Escalation: 15 minutes
   ```

2. **Recovery Initiated**
   ```
   Severity: Critical
   Notification: All stakeholders
   Channels: All available
   Updates: Every 15 minutes
   ```

3. **Recovery Complete**
   ```
   Severity: Info
   Notification: All stakeholders
   Channels: Email + Slack
   Report: Within 24 hours
   ```

## Appendices

### A. Backup Scripts Location
- Repository: `boom-card-platform/scripts/backup/`
- Documentation: `boom-card-platform/docs/backup/`

### B. Contact Information
- On-call DevOps: +359-XXX-XXXX
- Backup Vendor Support: support@backupprovider.com
- AWS Support: Premium support plan

### C. Related Documents
- Disaster Recovery Plan: `dr/disaster-recovery-plan