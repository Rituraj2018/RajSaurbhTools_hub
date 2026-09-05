import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

// Ensure local uploads directory exists (used as fallback when Cloudinary is not configured)
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Allowed MIME Types & Extension Mappings
 */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

/**
 * 10 Megabytes in bytes
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Multer File Filter to validate MIME types and extensions
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = ALLOWED_MIME_TYPES[mimeType];

  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return cb(
      new ApiError(
        400,
        `Unsupported file type '${ext || mimeType}'. Only JPG, JPEG, PNG, WEBP and PDF files are allowed.`
      )
    );
  }

  cb(null, true);
};

/**
 * Storage strategy:
 * Always use memoryStorage so that req.file.buffer is available for both:
 * - Cloud storage upload (Google Drive / OneDrive via fileController)
 * - Cloudinary upload (via cloudinaryService)
 * File binary is never persisted to server disk.
 */
const storage: StorageEngine = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Express middleware for single file upload with standard error handling.
 * Works transparently with both Cloudinary (memory buffer) and local disk storage.
 */
export const uploadSingleFile = (fieldName = 'file') => {
  const upload = multerUpload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(
              400,
              `File size exceeds the 10MB limit. Please upload a smaller file.`
            )
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      if (!req.file) {
        return next(new ApiError(400, 'No file was provided for upload'));
      }

      next();
    });
  };
};
