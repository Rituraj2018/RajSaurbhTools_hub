import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the current user (with unread count)
 */
router.get('/', getNotifications);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark ALL notifications as read (must be before /:id to avoid route conflict)
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 */
router.patch('/:id/read', markNotificationRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a single notification
 */
router.delete('/:id', deleteNotification);

export default router;
