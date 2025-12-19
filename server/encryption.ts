import crypto from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey(): Buffer | null {
  const keySource = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY;
  if (!keySource) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL: No encryption key available. Set SESSION_SECRET or ENCRYPTION_KEY');
      return null;
    }
    logger.warn('No encryption key set - using development fallback (NOT SECURE FOR PRODUCTION)');
    return crypto.scryptSync('dev-fallback-key-not-secure', 'salt', 32);
  }
  return crypto.scryptSync(keySource, 'trex-motors-salt', 32);
}

export function encryptField(plaintext: string): string | null {
  try {
    const key = getEncryptionKey();
    if (!key) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption failed', { error });
    return null;
  }
}

export function decryptField(encryptedData: string): string | null {
  try {
    const key = getEncryptionKey();
    if (!key) return null;
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      return encryptedData;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.warn('Decryption failed - returning original value (may be unencrypted legacy data)');
    return encryptedData;
  }
}

export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  return parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
}

export function maskSensitiveData(value: string | null | undefined): string {
  if (!value) return '***';
  if (value.length <= 4) return '***';
  return '***' + value.slice(-2);
}
