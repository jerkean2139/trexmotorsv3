# Data Retention and Privacy Policy

## Overview
This document outlines the data retention policies and PII handling procedures for the T-Rex Motors dealership application.

## Data Classification

### Tier 1: Sensitive PII (Financial)
**Tables**: `financing_applications`
**Data**: SSN (if collected), income, employment info, credit-related data
**Retention**: 7 years (tax/financial compliance)
**Access**: Admin only, audit logged

### Tier 2: Contact PII
**Tables**: `inquiries`, `financing_applications`
**Data**: Names, emails, phone numbers, addresses
**Retention**: 3 years or until customer requests deletion
**Access**: Admin only

### Tier 3: Business Data
**Tables**: `vehicles`, `dealerships`, `users`
**Data**: Inventory, pricing, admin accounts
**Retention**: Indefinite (business operational data)
**Access**: Based on role

## Retention Schedule

| Data Type | Retention Period | Auto-Delete | Manual Review |
|-----------|-----------------|-------------|---------------|
| Financing Applications | 7 years | No | Annual |
| Customer Inquiries | 3 years | Optional | Quarterly |
| Vehicle Listings | Until deleted | No | N/A |
| Admin Activity Logs | 2 years | Yes | N/A |
| Session Data | 24 hours | Yes (automatic) | N/A |

## Data Deletion Procedures

### Customer Data Deletion Request (CCPA/GDPR)
1. Verify customer identity
2. Query all tables for customer email/phone
3. Delete or anonymize records:
   ```sql
   -- Anonymize inquiry (preserves analytics)
   UPDATE inquiries 
   SET first_name = 'DELETED', 
       last_name = 'USER',
       email = 'deleted@example.com',
       phone = '000-000-0000',
       message = '[REDACTED]'
   WHERE email = 'customer@email.com';
   
   -- For financing applications, consult legal before deletion
   -- Financial records may have regulatory retention requirements
   ```
4. Document deletion in audit log
5. Notify customer of completion

### Scheduled Data Cleanup
Run monthly to remove expired data:
```sql
-- Delete old inquiries (older than 3 years)
DELETE FROM inquiries 
WHERE created_at < NOW() - INTERVAL '3 years';

-- Anonymize financing apps after 7 years (keep for compliance)
UPDATE financing_applications 
SET first_name = 'ARCHIVED',
    last_name = 'RECORD',
    email = 'archived@internal.com',
    phone = '000-000-0000',
    street_address = '[ARCHIVED]'
WHERE created_at < NOW() - INTERVAL '7 years'
AND first_name != 'ARCHIVED';
```

## Privacy Controls

### Data Minimization
- Only collect necessary fields for business purpose
- Financing form collects minimum required for credit inquiry
- Inquiry form limited to contact essentials

### Consent Tracking
- Add timestamp when customer submits form
- Store consent acknowledgment in database
- Recommend adding explicit consent checkbox

### Access Controls
- Admin authentication required for PII access
- Session-based access with 24-hour expiry
- CSRF protection on all data-modifying operations
- Rate limiting prevents enumeration attacks

## Encryption Requirements

### In Transit
- All connections over HTTPS (enforced by Railway)
- TLS 1.2+ required

### At Rest
- Railway PostgreSQL: Encrypted at rest by default
- Object Storage: Enable encryption (see ENCRYPTION.md)
- Backups: Inherit database encryption

## Audit Requirements

### What to Log
- Admin login/logout events
- Vehicle create/update/delete
- Access to customer PII (inquiries, financing apps)
- Data deletion requests

### Log Retention
- 2 years minimum
- Secure storage, separate from application logs

## Compliance Checklist

### CCPA (California)
- [ ] Right to know what data is collected
- [ ] Right to delete personal information
- [ ] Right to opt-out of data sales (N/A - not selling)
- [ ] Non-discrimination for privacy rights

### General Best Practices
- [ ] Privacy policy displayed on website
- [ ] Data collection purposes documented
- [ ] Third-party data sharing disclosed
- [ ] Breach notification procedure in place

## Contact

For data deletion requests or privacy concerns:
- Email: [Configure in application]
- Response time: 30 days maximum
