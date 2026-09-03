import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { FileRecord } from '../models/File';
import { HistoryRecord } from '../models/History';
import { Tool } from '../models/Tool';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

/**
 * @desc    Get aggregated admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
export const getAdminStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalFiles, totalProcessed, activeUsers, totalTools, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      FileRecord.countDocuments(),
      HistoryRecord.countDocuments({ status: 'completed' }),
      User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } }),
      Tool.countDocuments(),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role isBlocked createdAt'),
    ]);

  // Processing breakdown by tool (last 30 days)
  const processingByTool = await HistoryRecord.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$toolName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // User registrations by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    message: 'Admin statistics retrieved successfully',
    data: {
      stats: {
        totalUsers,
        totalFiles,
        totalProcessed,
        activeUsers,
        totalTools,
      },
      recentUsers,
      processingByTool,
      userGrowth,
    },
  });
});

/**
 * @desc    Get all users (with search & pagination)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAdminUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '20', role } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {};

  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (role && (role === 'admin' || role === 'user')) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-password -__v'),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

/**
 * @desc    Block a user account
 * @route   PATCH /api/admin/users/:id/block
 * @access  Private (Admin)
 */
export const blockUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  // Prevent admin from blocking themselves
  if (req.user && req.user._id.toString() === id) {
    throw new ApiError(400, 'You cannot block your own account');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true },
    { new: true, select: '-password -__v' }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: `User "${user.name}" has been blocked`,
    data: { user },
  });
});

/**
 * @desc    Unblock a user account
 * @route   PATCH /api/admin/users/:id/unblock
 * @access  Private (Admin)
 */
export const unblockUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: false },
    { new: true, select: '-password -__v' }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: `User "${user.name}" has been unblocked`,
    data: { user },
  });
});

/**
 * @desc    Delete a user and all their associated data
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteAdminUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    if (req.user && req.user._id.toString() === id) {
      throw new ApiError(400, 'You cannot delete your own account');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent deleting the last administrator
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new ApiError(400, 'Cannot delete the last administrator.');
      }
    }

    // Cascade delete associated files and history
    await Promise.all([
      FileRecord.deleteMany({ user: id }),
      HistoryRecord.deleteMany({ user: id }),
      User.findByIdAndDelete(id),
    ]);

    res.status(200).json({
      success: true,
      message: `User "${user.name}" and all associated data deleted successfully`,
      data: { id, name: user.name, email: user.email },
    });
  }
);

/**
 * @desc    Change a user's role (promote to admin or demote to user)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin)
 */
export const changeUserRole = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    // 2. Validate role strictly to 'user' | 'admin'
    if (!role || (role !== 'user' && role !== 'admin')) {
      throw new ApiError(
        400,
        'Invalid role. Valid roles are strictly "user" or "admin"'
      );
    }

    // 3. Prevent self-role modification
    if (req.user && req.user._id.toString() === id) {
      throw new ApiError(
        400,
        'You cannot modify your own administrative role'
      );
    }

    // 4. Find target user
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // 5. Check if user already has the requested role
    if (user.role === role) {
      throw new ApiError(400, `User is already assigned the "${role}" role`);
    }

    // 6. Last admin protection: prevent demoting the last remaining admin
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new ApiError(400, 'Cannot remove the last administrator.');
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // 7. Security audit log
    console.info(
      `[ADMIN AUDIT] Role changed: adminUserId=${req.user?._id}, targetUserId=${user._id}, oldRole=${oldRole}, newRole=${role}, timestamp=${new Date().toISOString()}`
    );

    // 8. Return updated safe user information (never password or sensitive tokens)
    res.status(200).json({
      success: true,
      message: `User "${user.name}" role successfully updated to "${role}"`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  }
);

/**
 * @desc    Get all files with user info (admin view)
 * @route   GET /api/admin/files
 * @access  Private (Admin)
 */
export const getAdminFiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '20', fileType } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {};
  if (fileType && ['image', 'document', 'pdf'].includes(fileType as string)) {
    filter.fileType = fileType;
  }

  const [files, total] = await Promise.all([
    FileRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email role'),
    FileRecord.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Files retrieved successfully',
    data: {
      files,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});
