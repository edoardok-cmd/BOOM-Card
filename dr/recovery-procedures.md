# BOOM Card Platform - Disaster Recovery Procedures

## Table of Contents
1. [Overview](#overview)
2. [Incident Classification](#incident-classification)
3. [Recovery Team Structure](#recovery-team-structure)
4. [System Recovery Procedures](#system-recovery-procedures)
5. [Data Recovery Procedures](#data-recovery-procedures)
6. [Communication Protocols](#communication-protocols)
7. [Post-Recovery Procedures](#post-recovery-procedures)
8. [Recovery Time Objectives](#recovery-time-objectives)
9. [Testing Schedule](#testing-schedule)

## Overview

This document outlines the disaster recovery procedures for the BOOM Card discount platform. These procedures ensure business continuity and minimal service disruption in case of system failures, data loss, or other disasters.

### Critical Systems Priority
1. Payment Processing System
2. API Gateway & POS Integrations
3. Consumer Web Application
4. Partner Dashboard
5. Admin Panel
6. Analytics Engine

## Incident Classification

### Severity Levels

#### Level 1 - Critical (Complete System Failure)
- Complete platform outage
- Payment processing failure
- Database corruption/loss
- Security breach affecting customer data
- **Response Time**: Immediate
- **Escalation**: All teams

#### Level 2 - High (Major Service Degradation)
- API Gateway partial failure
- Primary database offline
- Authentication service failure
- Partner dashboard inaccessible
- **Response Time**: Within 15 minutes
- **Escalation**: Core team + Management

#### Level 3 - Medium (Limited Impact)
- Analytics engine failure
- Reporting system offline
- Single microservice failure
- Performance degradation >50%
- **Response Time**: Within 1 hour
- **Escalation**: On-call team

#### Level 4 - Low (Minor Issues)
- Non-critical feature failure
- Scheduled maintenance issues
- Minor performance degradation
- **Response Time**: Within 4 hours
- **Escalation**: Standard support

## Recovery Team Structure

### Incident Commander
- Overall incident coordination
- External communication
- Resource allocation decisions
- Recovery strategy approval

### Technical Lead
- Technical recovery coordination
- System architecture decisions
- Recovery procedure execution
- Technical team management

### Database Administrator
- Database recovery operations
- Data integrity verification
- Backup restoration
- Replication management

### Infrastructure Engineer
- Server and network recovery
- Cloud resource management
- Load balancer configuration
- CDN and cache management

### Security Officer
- Security breach assessment
- Access control restoration
- Security audit post-recovery
- Compliance verification

### Communications Coordinator
- Stakeholder notifications
- Status page updates
- Partner communications
- Customer support coordination

## System Recovery Procedures

### 1. Initial Assessment (0-15 minutes)
```bash
# Check system status
./scripts/health-check-all.sh

# Verify database connectivity
psql -h $DB_HOST -U $DB_USER -d boom_card -c "SELECT 1"

# Check Redis connectivity
redis-cli -h $REDIS_HOST ping

# API Gateway status
curl -I https://api.boomcard.bg/health

# Review monitoring dashboards
# - Check Grafana: https://monitoring.boomcard.bg
# - Check error rates in Sentry
# - Review CloudWatch alarms
```

### 2. Database Recovery

#### Primary Database Failure
```bash
# 1. Promote read replica to primary
./scripts/promote-replica.sh production-replica-1

# 2. Update connection strings
kubectl set env deployment/api-gateway DB_HOST=production-replica-1.rds.amazonaws.com

# 3. Verify new primary
psql -h production-replica-1.rds.amazonaws.com -U postgres -d boom_card -c "SELECT pg_is_in_recovery();"

# 4. Create new replica
./scripts/create-replica.sh production-primary production-replica-2
```

#### Complete Database Loss
```bash
# 1. Restore from latest backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier boom-card-recovery \
  --db-snapshot-identifier boom-card-backup-$(date +%Y%m%d)

# 2. Restore point-in-time if available
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier boom-card-production \
  --target-db-instance-identifier boom-card-recovery \
  --restore-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S.000Z)

# 3. Apply transaction logs
./scripts/apply-wal-logs.sh /backups/wal/

# 4. Verify data integrity
./scripts/verify-database-integrity.sh
```

### 3. Application Recovery

#### API Gateway Recovery
```bash
# 1. Scale up healthy instances
kubectl scale deployment api-gateway --replicas=10

# 2. Deploy last known good version
kubectl set image deployment/api-gateway api-gateway=boomcard/api-gateway:stable-v1.2.3

# 3. Clear corrupted cache
redis-cli -h $REDIS_HOST FLUSHDB

# 4. Restart with clean state
kubectl rollout restart deployment/api-gateway
```

#### Microservices Recovery
```bash
# Payment Service
kubectl apply -f k8s/payment-service-recovery.yaml

# Partner Service
kubectl apply -f k8s/partner-service-recovery.yaml

# Consumer Service
kubectl apply -f k8s/consumer-service-recovery.yaml

# Verify all services
kubectl get pods -n production | grep -E "(payment|partner|consumer)"
```

### 4. Infrastructure Recovery

#### Load Balancer Failover
```bash
# Switch to backup load balancer
aws elbv2 modify-target-group \
  --target-group-arn $BACKUP_TG_ARN \
  --health-check-interval-seconds 5

# Update DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://dns-failover.json
```

#### CDN Recovery
```bash
# Purge corrupted cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

# Switch to backup origin
aws cloudfront update-distribution \
  --id $DIST_ID \
  --distribution-config file://backup-origin-config.json
```

## Data Recovery Procedures

### Backup Verification
```bash
# Daily backup verification script
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d)
BACKUP_FILE="/backups/boom-card-$BACKUP_DATE.sql.gz"

# Verify backup exists and is valid
if [ -f "$BACKUP_FILE" ]; then
    gunzip -t "$BACKUP_FILE"
    if [ $? -eq 0 ]; then
        echo "Backup valid: $BACKUP_FILE"
    else
        alert "Backup corrupted: $BACKUP_FILE"
    fi
fi

# Test restore to staging
./scripts/test-restore.sh $BACKUP_FILE staging-recovery
```

### Transaction Recovery
```sql
-- Identify missing transactions
WITH last_known AS (
    SELECT MAX(transaction_id) as last_id 
    FROM transactions 
    WHERE created_at < '2024-01-15 10:00:00'
)
SELECT * FROM audit_log 
WHERE transaction_id > (SELECT last_id FROM last_known)
ORDER BY created_at;

-- Replay missing transactions
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT * FROM audit_log WHERE needs_replay = true
    LOOP
        PERFORM replay_transaction(rec.transaction_data);
    END LOOP;
END $$;
```

### Partner Data Recovery
```bash
# Export partner data from backup
pg_dump -h backup-server -t partners -t partner_locations \
  -t partner_offers boom_card > partners_recovery.sql

# Import to production
psql -h production-server boom_card < partners_recovery.sql

# Verify partner QR codes
./scripts/verify-qr-codes.sh

# Regenerate missing QR codes
./scripts/regenerate-qr-batch.sh --missing-only
```

## Communication Protocols

### Internal Communication
1. **Immediate**: Slack #incident-response channel
2. **Updates**: Every 30 minutes during incident
3. **Escalation**: Phone calls for Level 1-2 incidents

### External Communication

#### Customer Communication Template
```
Subject: BOOM Card Service Update

Dear BOOM Card Members,

We are currently experiencing [brief description of issue]. Our team is actively working to resolve this issue.

Current Status: [Investigating/Partially Resolved/Monitoring]
Affected Services: [List affected features]
Expected Resolution: [Timeframe]

We apologize for any inconvenience and appreciate your patience.

For urgent matters, please contact: support@boomcard.bg

The BOOM Card Team
```

#### Partner Communication Template
```
Subject: Important: BOOM Card System Status Update

Dear Partner,

We are addressing a technical issue affecting [affected services].

Impact on your business:
- [Specific impact points]
- [Temporary workarounds if available]

We expect full service restoration by [time].

Your account manager will contact you directly with updates.

Technical Support: partners@boomcard.bg
Phone: +359 2 XXX XXXX

Best regards,
BOOM Card Partner Support
```

### Status Page Updates
```markdown
# Status Page Template

## [Incident Title]
**Status**: Investigating | Identified | Monitoring | Resolved
**Severity**: Critical | High | Medium | Low
**Started**: [Timestamp]

### Update [Time]
[Current status and actions being taken]

### Affected Components
- [ ] Payment Processing
- [ ] Partner Dashboard
- [ ] Consumer App
- [ ] API Services

### Next Update
In [X] minutes
```

## Post-Recovery Procedures

### 1. System Verification Checklist
- [ ] All services responding normally
- [ ] Database replication lag < 1 second
- [ ] Cache hit rates > 90%
- [ ] Error rates < 0.1%
- [ ] Payment processing functional
- [ ] QR code scanning operational
- [ ] Partner dashboards accessible
- [ ] Mobile apps connecting successfully

### 2. Data Integrity Verification
```sql
-- Check transaction consistency
SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_amount,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT partner_id) as unique_partners
FROM transactions
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Verify referential integrity
SELECT 
    'Orphaned Transactions' as issue,
    COUNT(*) as count
FROM transactions t
LEFT JOIN users u ON t.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Invalid QR Codes' as issue,
    COUNT(*) as count
FROM qr_codes q
LEFT JOIN partners p ON q.partner_id = p.id
WHERE p.id IS NULL;
```

### 3. Performance Baseline Verification
```bash
# Run performance tests
./scripts/performance-test.sh production

# Expected metric