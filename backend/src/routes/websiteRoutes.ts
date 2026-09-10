import { Router } from 'express';
import {
  getWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
} from '../controllers/websiteController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

/**
 * @route   GET /api/websites
 * @desc    Get all useful websites (Public)
 * @access  Public
 */
router.get('/', getWebsites);

/**
 * @route   GET /api/websites/:id
 * @desc    Get single website by ID (Public)
 * @access  Public
 */
router.get('/:id', getWebsiteById);

/**
 * @route   POST /api/websites
 * @desc    Add a new useful website (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireAdmin, createWebsite);

/**
 * @route   PUT /api/websites/:id
 * @desc    Update a website (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, updateWebsite);

/**
 * @route   DELETE /api/websites/:id
 * @desc    Delete a website (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteWebsite);

export default router;
