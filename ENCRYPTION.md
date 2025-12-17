# Encryption-at-Rest Documentation

## Overview
This document describes the encryption mechanisms protecting data in the T-Rex Motors application.

## Database Encryption

### Railway PostgreSQL
Railway's managed PostgreSQL instances include encryption at rest by default:
- **Storage Encryption**: AES-256 encryption
- **Key Management**: Managed by Railway infrastructure
- **No Configuration Required**: Enabled automatically

### Verification
To verify encryption status:
1. Railway Dashboard > Database > Settings
2. Check "Encryption at Rest" status

## Object Storage Encryption

### Google Cloud Storage
If using GCS for vehicle images:
```bash
# Enable default encryption on bucket
gsutil defencryptionkey gs://your-bucket

# Verify encryption
gsutil ls -L gs://your-bucket | grep Encryption
```

### Configuration
Set encryption in storage configuration:
```javascript
// Object storage should use server-side encryption
const uploadOptions = {
  predefinedAcl: 'private',
  metadata: {
    contentType: mimeType,
  },
  // GCS handles encryption automatically
};
```

## Application-Level Encryption

### Sensitive Fields
Consider additional application-level encryption for:
- SSN (if collected in financing applications)
- Bank account numbers
- Credit card details (use Stripe instead)

### Implementation Pattern
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

## Key Management

### Environment Variables
Required secrets for encryption:
- `SESSION_SECRET` - Session encryption (required in production)
- `ENCRYPTION_KEY` - Field-level encryption (optional, 32 bytes hex)

### Key Rotation
1. Generate new key
2. Re-encrypt affected data with new key
3. Update environment variable
4. Remove old key after verification

## Transport Layer Security

### HTTPS Enforcement
Railway automatically provisions TLS certificates:
- Automatic HTTPS redirect
- TLS 1.2+ only
- HSTS headers recommended

### Security Headers
Add to response:
```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## Backup Encryption

### Automated Backups
Railway backups inherit database encryption settings.

### Manual Backups
Encrypt manual backup files:
```bash
# Create encrypted backup
pg_dump $DATABASE_URL | gpg --symmetric --cipher-algo AES256 > backup.sql.gpg

# Restore encrypted backup
gpg --decrypt backup.sql.gpg | psql $DATABASE_URL
```

## Compliance Summary

| Data Type | At Rest | In Transit | Application |
|-----------|---------|------------|-------------|
| Database | ✅ AES-256 (Railway) | ✅ TLS 1.2+ | Optional |
| Object Storage | ✅ GCS Default | ✅ HTTPS | N/A |
| Backups | ✅ Inherited | ✅ HTTPS | Recommended |
| Sessions | N/A | ✅ Secure cookies | ✅ Encrypted |

## Audit

### Regular Checks
- Monthly: Verify encryption settings in Railway dashboard
- Quarterly: Review key rotation schedule
- Annually: Security assessment of encryption practices
