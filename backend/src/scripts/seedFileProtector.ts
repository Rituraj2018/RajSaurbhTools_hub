/**
 * One-shot script: inserts the File Password Protector tool into MongoDB
 * Run: npx tsx src/scripts/seedFileProtector.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI!;

const toolSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  category: String,
  icon: String,
  isActive: Boolean,
  isFeatured: Boolean,
}, { timestamps: true });

const ToolModel = mongoose.models.Tool || mongoose.model('Tool', toolSchema);

async function run() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const existing = await ToolModel.findOne({ slug: 'file-password-protector' });
  if (existing) {
    // Update fields to match current definition
    existing.set({
      name: 'File Password Protector',
      description: 'Password-protect PDF and image files with AES-256-GCM encryption. All processing is done locally in your browser — your password never leaves your device.',
      category: 'Security',
      icon: 'Lock',
      isActive: true,
      isFeatured: true,
    });
    await existing.save();
    console.log('✅ Tool updated: File Password Protector');
  } else {
    await ToolModel.create({
      name: 'File Password Protector',
      slug: 'file-password-protector',
      description: 'Password-protect PDF and image files with AES-256-GCM encryption. All processing is done locally in your browser — your password never leaves your device.',
      category: 'Security',
      icon: 'Lock',
      isActive: true,
      isFeatured: true,
    });
    console.log('✅ Tool inserted: File Password Protector');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
