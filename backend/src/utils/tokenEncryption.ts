import crypto from 'crypto';
import { config } from '../config/env';

/**
 * AES-256-GCM encryption/decryption utility for OAuth tokens.
 * Derives a 256-bit key from the JWT_SECRET using SHA-256.
 * Each encryption produces a unique IV, ensuring identical plaintext
 * results in different ciphertext.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derive a 256-bit encryption key from JWT_SECRET using SHA-256.
 */
const getEncryptionKey = (): Buffer => {
  const secret = config.jwtSecret;
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt a plaintext string (e.g., an OAuth token) using AES-256-GCM.
 * Returns a base64-encoded string in the format: iv:authTag:ciphertext
 */
export const encryptToken = (plaintext: string): string => {
  if (!plaintext) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
};

/**
 * Decrypt an encrypted token string produced by encryptToken().
 * Returns the original plaintext string.
 * Throws on tampered or invalid ciphertext.
 */
export const decryptToken = (encryptedData: string): string => {
  if (!encryptedData) return '';

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
