import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

/**
 * @desc    Get all notifications for the authenticated user (newest first)
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError(401, 'Authentication required');

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        total,
        unreadCount,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError(401, 'Authentication required');

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id }, // scoped to this user only
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  }
);

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError(401, 'Authentication required');

    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: result.modifiedCount },
    });
  }
);

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError(401, 'Authentication required');

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid notification ID');
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      data: { id },
    });
  }
);

/**
 * @desc    Create a notification (internal utility – used by other controllers)
 * @access  Internal
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
): Promise<void> => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (err) {
    // Non-fatal — log but don't throw
    console.error('[Notification] Failed to create notification:', err);
  }
};
