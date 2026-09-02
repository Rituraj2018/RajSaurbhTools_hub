import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import { config } from '../config/env';

/**
 * Result of a Cloudinary upload operation
 */
export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  resourceType: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Supported resource types for upload
 */
type CloudinaryResourceType = 'image' | 'raw' | 'auto';

/**
 * Configure Cloudinary SDK once on module load.
 * No-op if credentials are not set (local fallback will be used).
 */
if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true, // Always return https URLs
  });
  console.log('[Cloudinary] Configured — uploads will use Cloudinary storage');
} else {
  console.log('[Cloudinary] Not configured — uploads will fall back to local disk storage');
}

/**
 * Determine Cloudinary folder and resource_type from MIME type
 */
const resolveUploadOptions = (
  mimeType: string
): { folder: string; resourceType: CloudinaryResourceType } => {
  if (mimeType.startsWith('image/')) {
    return { folder: 'rajsaurbh/images', resourceType: 'image' };
  }
  if (mimeType === 'application/pdf') {
    return { folder: 'rajsaurbh/pdfs', resourceType: 'raw' };
  }
  return { folder: 'rajsaurbh/documents', resourceType: 'raw' };
};

/**
 * Upload a file buffer to Cloudinary using an upload stream.
 * Supports images (JPEG, PNG, WebP, GIF) and raw files (PDF, documents).
 *
 * @param buffer  - The file buffer from multer's memoryStorage
 * @param mimeType - MIME type of the file
 * @param publicIdPrefix - Optional unique prefix for the public_id (e.g. 'user_123')
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  mimeType: string,
  publicIdPrefix = 'file'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const { folder, resourceType } = resolveUploadOptions(mimeType);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType as any,
        public_id: `${publicIdPrefix}_${Date.now()}`,
        overwrite: false,
        // For images: auto-quality + auto-format optimization
        ...(resourceType === 'image' && {
          quality: 'auto',
          fetch_format: 'auto',
        }),
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(
            new Error(error?.message || 'Cloudinary upload failed with no result')
          );
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format || '',
          bytes: result.bytes,
          resourceType: result.resource_type as CloudinaryUploadResult['resourceType'],
        });
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * Handles both image and raw resource types gracefully.
 *
 * @param publicId    - The Cloudinary public_id stored in the database
 * @param mimeType    - MIME type used to determine resource_type for deletion
 */
export const deleteFromCloudinary = async (
  publicId: string,
  mimeType: string
): Promise<void> => {
  if (!config.cloudinary.isConfigured) {
    // Cloudinary not configured — nothing to delete remotely
    return;
  }

  if (!publicId) {
    // No public ID stored — file was likely stored locally; skip
    return;
  }

  const { resourceType } = resolveUploadOptions(mimeType);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as any,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn(
        `[Cloudinary] Unexpected delete result for publicId="${publicId}": ${result.result}`
      );
    }
  } catch (err) {
    // Non-fatal — log but do not re-throw so the DB record can still be deleted
    console.error(`[Cloudinary] Error deleting publicId="${publicId}":`, err);
  }
};

/**
 * Returns true when Cloudinary is fully configured and ready for use
 */
export const isCloudinaryReady = (): boolean => config.cloudinary.isConfigured;
