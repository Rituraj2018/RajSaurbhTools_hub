/**
 * File Password Protector — Core Encryption/Decryption Engine
 *
 * Algorithm : AES-256-GCM  (authenticated, tamper-proof)
 * KDF       : PBKDF2-SHA256, 600 000 iterations, 16-byte random salt
 * IV        : 12-byte random per encryption
 *
 * SECURITY GUARANTEES
 *   • Password is NEVER stored, logged, sent to the server, or persisted anywhere.
 *   • Recovery key is shown to the user ONCE and NEVER stored on the server.
 *   • No admin bypass: the server never holds any key material.
 *   • AES-GCM provides both confidentiality AND integrity (AEAD).
 *
 * CONTAINER FORMAT  (JSON, base64-encoded fields)
 * {
 *   v          : 1,                        // container version
 *   alg        : "AES-256-GCM",
 *   kdf        : "PBKDF2-SHA256",
 *   iterations : 600000,
 *   salt       : "<base64>",               // 16 bytes, random
 *   iv         : "<base64>",               // 12 bytes, random
 *   data       : "<base64>",               // AES-GCM ciphertext
 *   name       : "<originalFileName>",     // e.g. "photo.jpg"
 *   mime       : "<mimeType>",             // e.g. "image/jpeg"
 *   pwHash     : "<base64>",               // HKDF-derived verifier (NOT the password)
 * }
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProtectedContainer {
  v: number;
  alg: string;
  kdf: string;
  iterations: number;
  salt: string;          // base64
  iv: string;            // base64
  data: string;          // base64 ciphertext
  name: string;
  mime: string;
  pwHash: string;        // base64 verifier for fast wrong-password detection
}

export interface EncryptResult {
  containerBytes: Uint8Array;
  recoveryKey: string;           // shown to user ONCE, never stored
  outputName: string;
}

export interface DecryptResult {
  data: Uint8Array;
  originalName: string;
  mimeType: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;   // 0=very weak … 4=very strong
  label: string;
  color: string;
  isAcceptable: boolean;        // score >= 2
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const RECOVERY_KEY_BYTES = 32;   // 256-bit random recovery key

// ---------------------------------------------------------------------------
// Helpers — byte/base64 conversion
// ---------------------------------------------------------------------------

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

// ---------------------------------------------------------------------------
// Key Derivation — PBKDF2
// ---------------------------------------------------------------------------

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a short verifier token from the password so we can detect wrong
 * passwords quickly without storing the password itself.
 * Uses PBKDF2 with a different domain separator so the verifier cannot be
 * used to derive the encryption key.
 */
async function deriveVerifier(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  // Domain-separated salt: prefix "verify:" to prevent cross-use with the
  // encryption key derivation.
  const verifySalt = new Uint8Array(SALT_BYTES + 7);
  verifySalt.set(enc.encode('verify:'));
  verifySalt.set(salt, 7);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: verifySalt.buffer as ArrayBuffer,
      iterations: 100_000,
    },
    baseKey,
    128
  );
  return toBase64(new Uint8Array(bits));
}

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

/**
 * Encrypts the given file bytes and returns an encrypted container.
 * Also generates a one-time recovery key (= second decryption secret).
 *
 * @param plainBytes  - Raw file bytes to encrypt
 * @param password    - User-chosen password (never stored)
 * @param originalName - Original filename (e.g. "photo.jpg")
 * @param mimeType    - File MIME type (e.g. "image/jpeg")
 * @returns           - Container bytes + recovery key string + suggested output name
 */
export async function encryptFileBytes(
  plainBytes: Uint8Array,
  password: string,
  originalName: string,
  mimeType: string
): Promise<EncryptResult> {
  if (!password) throw new Error('Password is required');

  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);

  const key = await deriveKey(password, salt);
  const pwHash = await deriveVerifier(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    plainBytes.buffer as ArrayBuffer
  );

  // Generate recovery key — an independent random 256-bit secret.
  // It is encrypted with its OWN key derivation so that knowing only the
  // recovery key is sufficient to decrypt (via the recoverWithKey function).
  const rawRecoveryKey = randomBytes(RECOVERY_KEY_BYTES);
  const recoveryKeyStr = toBase64(rawRecoveryKey); // shown to user once

  // Wrap the AES-GCM ciphertext inside a recovery-key envelope as well.
  // This means the recovery key can ALSO decrypt the file independently.
  const recoverySalt = randomBytes(SALT_BYTES);
  const recoveryIv = randomBytes(IV_BYTES);
  const recoveryDerivedKey = await deriveKey(recoveryKeyStr, recoverySalt);
  const recoveryCiphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: recoveryIv.buffer as ArrayBuffer },
    recoveryDerivedKey,
    plainBytes.buffer as ArrayBuffer
  );

  const container: ProtectedContainer & {
    recoverySalt?: string;
    recoveryIv?: string;
    recoveryData?: string;
  } = {
    v: 1,
    alg: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext)),
    name: originalName,
    mime: mimeType,
    pwHash,
    // Recovery envelope (independently decryptable with recovery key)
    recoverySalt: toBase64(recoverySalt),
    recoveryIv: toBase64(recoveryIv),
    recoveryData: toBase64(new Uint8Array(recoveryCiphertext)),
  };

  const containerJson = JSON.stringify(container);
  const containerBytes = new TextEncoder().encode(containerJson);

  // Output name: preserve extension pattern per spec
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const safeBase = sanitizeFilename(baseName);

  // For PDFs → _protected.pdf  |  For images → _protected.zip
  const isPdf = mimeType === 'application/pdf';
  const outputName = isPdf ? `${safeBase}_protected.pdf` : `${safeBase}_protected.zip`;

  return { containerBytes, recoveryKey: recoveryKeyStr, outputName };
}

// ---------------------------------------------------------------------------
// Decrypt (password)
// ---------------------------------------------------------------------------

/**
 * Decrypts a protected container using the user's password.
 * Throws with a user-friendly message on wrong password or corrupted data.
 */
export async function decryptFileBytes(
  containerBytes: Uint8Array,
  password: string
): Promise<DecryptResult> {
  if (!password) throw new Error('Password is required');

  let container: ProtectedContainer & {
    recoverySalt?: string;
    recoveryIv?: string;
    recoveryData?: string;
  };

  try {
    const json = new TextDecoder().decode(containerBytes);
    container = JSON.parse(json);
  } catch {
    throw new Error('Invalid protected file — the file may be corrupted or is not a protected file created by this tool.');
  }

  if (!container.v || !container.salt || !container.iv || !container.data) {
    throw new Error('Invalid protected file format. This file was not created by the File Password Protector.');
  }

  // Fast verifier check (avoids running full PBKDF2 then failing at GCM)
  try {
    const salt = fromBase64(container.salt);
    const expectedHash = await deriveVerifier(password, salt);
    if (expectedHash !== container.pwHash) {
      throw new Error('WRONG_PASSWORD');
    }
  } catch (e: any) {
    if (e?.message === 'WRONG_PASSWORD') {
      throw new Error('Incorrect password. Please enter the password used to protect this file.');
    }
    // Verifier check failed for other reasons — fall through and try full decrypt
  }

  const salt = fromBase64(container.salt);
  const iv = fromBase64(container.iv);
  const ciphertext = fromBase64(container.data);

  const key = await deriveKey(password, salt);

  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ciphertext.buffer as ArrayBuffer
    );
  } catch {
    throw new Error('Incorrect password. Please enter the password used to protect this file.');
  }

  return {
    data: new Uint8Array(plainBuffer),
    originalName: container.name || 'file',
    mimeType: container.mime || 'application/octet-stream',
  };
}

// ---------------------------------------------------------------------------
// Decrypt (recovery key)
// ---------------------------------------------------------------------------

/**
 * Decrypts a protected container using the recovery key instead of the password.
 * The recovery key is a base64 string shown to the user once at protect time.
 */
export async function decryptWithRecoveryKey(
  containerBytes: Uint8Array,
  recoveryKeyStr: string
): Promise<DecryptResult> {
  if (!recoveryKeyStr.trim()) throw new Error('Recovery key is required');

  let container: ProtectedContainer & {
    recoverySalt?: string;
    recoveryIv?: string;
    recoveryData?: string;
  };

  try {
    const json = new TextDecoder().decode(containerBytes);
    container = JSON.parse(json);
  } catch {
    throw new Error('Invalid protected file — the file may be corrupted or is not a protected file created by this tool.');
  }

  if (!container.recoverySalt || !container.recoveryIv || !container.recoveryData) {
    throw new Error('This file does not have a recovery key envelope. It may have been created with an older version of the tool.');
  }

  const recoverySalt = fromBase64(container.recoverySalt);
  const recoveryIv = fromBase64(container.recoveryIv);
  const recoveryCiphertext = fromBase64(container.recoveryData);

  const key = await deriveKey(recoveryKeyStr.trim(), recoverySalt);

  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: recoveryIv.buffer as ArrayBuffer },
      key,
      recoveryCiphertext.buffer as ArrayBuffer
    );
  } catch {
    throw new Error('Incorrect recovery key. Please check the recovery key you saved when protecting this file.');
  }

  return {
    data: new Uint8Array(plainBuffer),
    originalName: container.name || 'file',
    mimeType: container.mime || 'application/octet-stream',
  };
}

// ---------------------------------------------------------------------------
// Download helpers
// ---------------------------------------------------------------------------

export function downloadProtectedFile(bytes: Uint8Array, outputName: string): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  triggerDownload(blob, outputName);
}

export function downloadDecryptedFile(
  data: Uint8Array,
  originalName: string,
  mimeType: string
): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
  // Produce unlocked output name: document.pdf → document_unlocked.pdf
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const base = originalName.replace(/\.[^/.]+$/, '');
  const outName = ext ? `${base}_unlocked.${ext}` : `${base}_unlocked`;
  triggerDownload(blob, outName);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------------------------------------------------------------------------
// Multi-file image packaging
// ---------------------------------------------------------------------------

/**
 * Packs multiple files into a single JSON container, then encrypts the whole bundle.
 * Output: a single encrypted container that, when decrypted, yields individual files.
 */
export interface BundleEntry {
  name: string;
  mime: string;
  data: string; // base64
}

export async function encryptMultipleFiles(
  files: File[],
  password: string
): Promise<EncryptResult> {
  if (files.length === 0) throw new Error('No files selected');

  const entries: BundleEntry[] = await Promise.all(
    files.map(async (f) => {
      const ab = await f.arrayBuffer();
      return {
        name: f.name,
        mime: f.type,
        data: toBase64(new Uint8Array(ab)),
      };
    })
  );

  const bundleJson = JSON.stringify({ bundle: true, files: entries });
  const bundleBytes = new TextEncoder().encode(bundleJson);

  const result = await encryptFileBytes(
    bundleBytes,
    password,
    'protected_images.bundle',
    'application/x-rajprotected-bundle'
  );

  return { ...result, outputName: 'protected_images.zip' };
}

/**
 * Decrypts a multi-file bundle and returns the individual files.
 */
export async function decryptMultipleFiles(
  containerBytes: Uint8Array,
  password: string
): Promise<{ name: string; mime: string; data: Uint8Array }[]> {
  const result = await decryptFileBytes(containerBytes, password);
  try {
    const parsed = JSON.parse(new TextDecoder().decode(result.data));
    if (!parsed.bundle || !Array.isArray(parsed.files)) {
      throw new Error('Not a multi-file bundle');
    }
    return parsed.files.map((e: BundleEntry) => ({
      name: e.name,
      mime: e.mime,
      data: fromBase64(e.data),
    }));
  } catch {
    // Single-file container — return as-is
    return [{ name: result.originalName, mime: result.mimeType, data: result.data }];
  }
}

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

export function validatePasswords(
  password: string,
  confirmPassword: string
): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  const strength = getPasswordStrength(password);
  if (!strength.isAcceptable) {
    return 'Password is too weak. Use a mix of letters, numbers, and symbols.';
  }
  return null;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  const capped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return {
    score: capped,
    label: labels[capped],
    color: colors[capped],
    isAcceptable: capped >= 2,
  };
}

// ---------------------------------------------------------------------------
// Filename safety
// ---------------------------------------------------------------------------

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 200);
}

// ---------------------------------------------------------------------------
// File type helpers
// ---------------------------------------------------------------------------

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const SUPPORTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export function isSupportedFile(file: File): boolean {
  return SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
}

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf';
}

export function isImageFile(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type.toLowerCase());
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB for this tool
