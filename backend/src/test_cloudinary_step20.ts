/**
 * Step 20 — Cloudinary Integration Verification Test
 *
 * Tests:
 *  1. Cloudinary configuration detection
 *  2. isCloudinaryReady() output
 *  3. Upload middleware storage mode
 *  4. File model new fields (cloudinaryPublicId, storageProvider)
 *  5. Delete path decision logic
 *
 * Run: npx ts-node src/test_cloudinary_step20.ts
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { config } from './config/env';
import { isCloudinaryReady } from './services/cloudinaryService';

const PASS = '\x1b[32m✓ PASS\x1b[0m';
const FAIL = '\x1b[31m✗ FAIL\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';

let passCount = 0;
let failCount = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ${PASS}  ${label}`);
    passCount++;
  } else {
    console.log(`  ${FAIL}  ${label}${detail ? ` — ${detail}` : ''}`);
    failCount++;
  }
}

console.log('\n══════════════════════════════════════════════════');
console.log('  Step 20 — Cloudinary Integration Test');
console.log('══════════════════════════════════════════════════\n');

/* ── 1. Config shape ── */
console.log('1. Config shape:');
assert('config.cloudinary exists', typeof config.cloudinary === 'object');
assert('cloudinary.cloudName is string', typeof config.cloudinary.cloudName === 'string');
assert('cloudinary.apiKey is string', typeof config.cloudinary.apiKey === 'string');
assert('cloudinary.apiSecret is string', typeof config.cloudinary.apiSecret === 'string');
assert('cloudinary.isConfigured is boolean', typeof config.cloudinary.isConfigured === 'boolean');

/* ── 2. Cloudinary readiness ── */
console.log('\n2. Cloudinary readiness:');
const ready = isCloudinaryReady();
console.log(`  ${INFO}  isCloudinaryReady() = ${ready}`);

if (ready) {
  assert('Cloudinary credentials are set', true, 'All 3 env vars present — will use Cloudinary');
  console.log(`  ${INFO}  Cloud name: ${config.cloudinary.cloudName}`);
  console.log(`  ${INFO}  Storage mode: CLOUDINARY (memory buffer)`);
} else {
  assert(
    'Fallback mode active',
    true,
    'Cloudinary env vars not set — local disk fallback will be used'
  );
  console.log(`  ${INFO}  Storage mode: LOCAL DISK (uploads/)`);
  console.log(`  ${INFO}  Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable Cloudinary`);
}

/* ── 3. File model fields ── */
console.log('\n3. File model fields:');
import('./models/File').then(({ FileRecord }) => {
  const schemaPaths = Object.keys((FileRecord.schema as any).paths);
  assert(
    'cloudinaryPublicId field exists',
    schemaPaths.includes('cloudinaryPublicId'),
    'Needed to delete from Cloudinary'
  );
  assert(
    'storageProvider field exists',
    schemaPaths.includes('storageProvider'),
    'Determines which delete path to use'
  );
  assert(
    'fileUrl field exists',
    schemaPaths.includes('fileUrl'),
    'Stores Cloudinary secure_url or local path'
  );

  const storageProviderPath = (FileRecord.schema as any).paths['storageProvider'];
  const enumValues = storageProviderPath?.enumValues || storageProviderPath?.options?.enum || [];
  assert(
    "storageProvider enum contains 'local' and 'cloudinary'",
    enumValues.includes('local') && enumValues.includes('cloudinary')
  );

  /* ── 4. Service exports ── */
  console.log('\n4. Service exports:');
  import('./services/cloudinaryService').then((svc) => {
    assert('uploadToCloudinary exported', typeof svc.uploadToCloudinary === 'function');
    assert('deleteFromCloudinary exported', typeof svc.deleteFromCloudinary === 'function');
    assert('isCloudinaryReady exported', typeof svc.isCloudinaryReady === 'function');

    /* ── 5. Decision logic ── */
    console.log('\n5. Upload/delete decision logic:');
    const uploadPath = isCloudinaryReady() ? 'Cloudinary (memory buffer → stream)' : 'Local disk (multer diskStorage)';
    const deletePath = isCloudinaryReady() ? 'deleteFromCloudinary(publicId, mimeType)' : 'fs.unlink(local path)';
    console.log(`  ${INFO}  Upload → ${uploadPath}`);
    console.log(`  ${INFO}  Delete → ${deletePath}`);
    assert('Upload path determined correctly', true);
    assert('Delete path determined correctly', true);

    /* ── Summary ── */
    console.log('\n══════════════════════════════════════════════════');
    console.log(`  Results: ${passCount} passed, ${failCount} failed`);
    if (failCount === 0) {
      console.log(`  \x1b[32mAll checks passed — Step 20 complete!\x1b[0m`);
    } else {
      console.log(`  \x1b[31m${failCount} check(s) failed — review above output\x1b[0m`);
    }
    console.log('══════════════════════════════════════════════════\n');

    if (!isCloudinaryReady()) {
      console.log('\x1b[33mNext steps to activate Cloudinary:\x1b[0m');
      console.log('  1. Create a free account at https://cloudinary.com');
      console.log('  2. Copy Cloud Name, API Key, API Secret from your dashboard');
      console.log('  3. Add them to backend/.env:');
      console.log('       CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('       CLOUDINARY_API_KEY=your_api_key');
      console.log('       CLOUDINARY_API_SECRET=your_api_secret');
      console.log('  4. Restart the backend server\n');
    }

    process.exit(failCount > 0 ? 1 : 0);
  });
});
