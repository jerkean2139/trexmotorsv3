# Database Backup Strategy

## Overview
This document outlines the backup and disaster recovery strategy for the T-Rex Motors dealership application.

## Railway PostgreSQL Backups

### Automatic Backups (Railway Pro)
Railway Pro plans include automatic daily backups with 7-day retention. To enable:
1. Upgrade to Railway Pro plan
2. Backups are enabled automatically for PostgreSQL databases
3. Access backups via Railway dashboard > Database > Backups tab

### Manual Backup Procedure
For development/staging environments or additional backup redundancy:

```bash
# Export database using pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

## Backup Schedule Recommendations

| Environment | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Production  | Daily     | 30 days   | Railway automatic + weekly manual export |
| Staging     | Weekly    | 7 days    | Manual pg_dump |
| Development | On-demand | 3 days    | Manual pg_dump before major changes |

## Recovery Point Objective (RPO)
- **Production**: 24 hours maximum data loss acceptable
- **Critical data** (financing applications): Consider more frequent backups or transaction logging

## Recovery Time Objective (RTO)
- **Target**: 4 hours for full database restoration
- **Procedure**: Documented below

## Disaster Recovery Procedure

### Step 1: Assess the Issue
- Check Railway status page for outages
- Review application logs for database errors
- Verify if issue is data corruption vs connection issue

### Step 2: Restore from Backup
1. Navigate to Railway dashboard
2. Select the PostgreSQL database
3. Go to Backups tab
4. Select the most recent clean backup
5. Click "Restore"
6. Verify application functionality

### Step 3: Manual Restoration (if needed)
```bash
# Create new database instance
railway add postgresql

# Restore from manual backup
psql $NEW_DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Update environment variables
railway variables set DATABASE_URL=$NEW_DATABASE_URL
```

## Data Categories and Backup Priority

### Critical (Always backup)
- `users` - Admin authentication
- `dealerships` - Multi-tenant configuration
- `vehicles` - Complete inventory data
- `financing_applications` - Customer PII, financial data

### Important (Regular backup)
- `inquiries` - Customer contact information

## Monitoring and Alerts

### Recommended Setup
1. Configure Railway webhook for database events
2. Set up monitoring for:
   - Database connection failures
   - Disk space utilization
   - Query performance degradation

### Health Check Endpoint
The application includes a health check at `/api/health` that verifies database connectivity.

## Compliance Considerations

### PII Data Handling
- Financing applications contain sensitive PII
- Backups inherit same access controls as production
- Consider encrypting backup files at rest
- Implement retention policies per data classification

### Backup Access Control
- Limit backup access to admin personnel only
- Log all backup restore operations
- Review backup access quarterly

## Testing Backup Restoration

### Monthly Test Procedure
1. Create test environment
2. Restore latest backup to test environment
3. Verify data integrity:
   - Check vehicle count matches
   - Verify user authentication works
   - Test dealership data isolation
4. Document test results
5. Update procedures if issues found

## Contact Information

For database emergencies:
- Railway Support: https://railway.app/help
- Application Admin: [Configure in environment]
