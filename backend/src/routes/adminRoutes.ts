import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  blockUser,
  unblockUser,
  deleteAdminUser,
  changeUserRole,
  getAdminFiles,
} from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Dashboard statistics aggregation
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/users
 * @desc    List all users with search & pagination
 */
router.get('/users', getAdminUsers);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role (promote/demote)
 */
router.patch('/users/:id/role', changeUserRole);

/**
 * @route   PATCH /api/admin/users/:id/block
 * @desc    Block a user account
 */
router.patch('/users/:id/block', blockUser);

/**
 * @route   PATCH /api/admin/users/:id/unblock
 * @desc    Unblock a user account
 */
router.patch('/users/:id/unblock', unblockUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Hard delete a user + cascade data
 */
router.delete('/users/:id', deleteAdminUser);

/**
 * @route   GET /api/admin/files
 * @desc    List all uploaded files with user population
 */
router.get('/files', getAdminFiles);

export default router;
