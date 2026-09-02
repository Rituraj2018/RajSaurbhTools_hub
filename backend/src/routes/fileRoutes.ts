import { Router } from 'express';
import {
  uploadFile,
  getUserFiles,
  getFileById,
  deleteFile,
} from '../controllers/fileController';
import { authenticate } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/uploadMiddleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /api/files/upload
 * @desc    Upload a single image or PDF file (max 10MB)
 * @access  Private (Requires Bearer token)
 */
router.post('/upload', authenticate, uploadRateLimiter, uploadSingleFile('file'), uploadFile);

/**
 * @route   GET /api/files
 * @desc    Get all files uploaded by authenticated user (with search, filter, sort, pagination)
 * @access  Private
 */
router.get('/', authenticate, getUserFiles);

/**
 * @route   GET /api/files/:id
 * @desc    Get single file metadata or trigger download
 * @access  Private
 */
router.get('/:id', authenticate, getFileById);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete file record & purge from disk
 * @access  Private
 */
router.delete('/:id', authenticate, deleteFile);

export default router;
