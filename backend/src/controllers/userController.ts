import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Tool } from '../models/Tool';
import { FileRecord } from '../models/File';
import { HistoryRecord } from '../models/History';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { seedInitialTools } from '../utils/seedTools';

/**
 * @desc    Toggle a tool in the authenticated user's favorites (Add if absent, Remove if present)
 * @route   POST /api/users/favorites/:toolId
 * @access  Private (Requires Authentication)
 */
export const toggleFavoriteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { toolId } = req.params;
  if (!toolId) {
    throw new ApiError(400, 'Tool ID or slug is required');
  }

  const cleanId = toolId.toLowerCase().trim();
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId);
  const tool = await Tool.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanId }] : []),
      { slug: cleanId },
      ...(cleanId === 'ayushman-print-tool' ? [{ slug: 'ayushman-card-print' }] : []),
    ],
  });

  if (!tool) {
    throw new ApiError(404, 'Tool not found');
  }

  const user = await User.findById(req.user._id).select('favoriteTools');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const toolObjectIdStr = tool._id.toString();
  const isCurrentlyFav = (user.favoriteTools || []).some(
    (favId: any) => favId.toString() === toolObjectIdStr
  );

  let updatedUser;
  if (isCurrentlyFav) {
    // Already in favorites -> Remove it
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favoriteTools: tool._id } },
      { new: true, select: 'favoriteTools' }
    );
  } else {
    // Not in favorites -> Add it atomically
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favoriteTools: tool._id } },
      { new: true, select: 'favoriteTools' }
    );
  }

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  const favoriteTools = (updatedUser.favoriteTools || []).map((id: any) => id.toString());

  res.status(200).json({
    success: true,
    message: isCurrentlyFav
      ? 'Tool removed from favorites successfully'
      : 'Tool added to favorites successfully',
    data: {
      isFavorite: !isCurrentlyFav,
      favoriteTools,
      toolId: tool._id.toString(),
    },
  });
});

export const addFavoriteTool = toggleFavoriteTool;

/**
 * @desc    Remove a tool from the authenticated user's favorites
 * @route   DELETE /api/users/favorites/:toolId
 * @access  Private (Requires Authentication)
 */
export const removeFavoriteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { toolId } = req.params;
  if (!toolId) {
    throw new ApiError(400, 'Tool ID or slug is required');
  }

  const cleanId = toolId.toLowerCase().trim();
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId);
  const tool = await Tool.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanId }] : []),
      { slug: cleanId },
      ...(cleanId === 'ayushman-print-tool' ? [{ slug: 'ayushman-card-print' }] : []),
    ],
  });

  const targetObjectId = tool
    ? tool._id
    : isObjectId
    ? new mongoose.Types.ObjectId(cleanId)
    : null;

  if (!targetObjectId) {
    throw new ApiError(404, 'Tool not found');
  }

  // Remove Tool ObjectId from favorites array
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteTools: targetObjectId } },
    { new: true, select: 'favoriteTools' }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  const favoriteTools = (updatedUser.favoriteTools || []).map((id: any) => id.toString());

  res.status(200).json({
    success: true,
    message: 'Tool removed from favorites successfully',
    data: {
      favoriteTools,
      toolId: tool ? tool._id.toString() : toolId,
    },
  });
});

/**
 * @desc    Get authenticated user's favorite tools list (populated Tool objects)
 * @route   GET /api/users/favorites
 * @access  Private (Requires Authentication)
 */
export const getFavoriteTools = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(req.user._id)
    .select('favoriteTools')
    .populate('favoriteTools')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Ensure only valid, active populated tool objects are returned
  const populatedTools = (user.favoriteTools || []).filter(
    (item: any) => item && typeof item === 'object' && item._id && item.isActive !== false
  );

  const favoriteIds: string[] = populatedTools.map((t: any) => t._id.toString());

  res.status(200).json({
    success: true,
    message: 'Favorite tools retrieved successfully',
    data: {
      favoriteIds,
      favorites: populatedTools,
      totalFavorites: favoriteIds.length,
    },
  });
});

/**
 * Helper to format byte sizes into readable strings (e.g. 1.4 MB)
 */
const formatByteSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * @desc    Get live dashboard metrics and user statistics
 * @route   GET /api/users/dashboard
 * @access  Private (Requires Authentication)
 */
export const getUserDashboardStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const userId = req.user._id;

  // Execute all user-scoped queries in parallel via Promise.all
  const [
    distinctTools,
    filesProcessed,
    userDoc,
    storageAggregation,
    completedHistoryWithSizes,
    recentHistoryRecords,
  ] = await Promise.all([
    // 1. Total Tools Used (distinct tools from completed history)
    HistoryRecord.distinct('tool', { user: userId, status: 'completed' }),

    // 2. Files Processed (count completed processing history)
    HistoryRecord.countDocuments({ user: userId, status: 'completed' }),

    // 3. User Favorites
    User.findById(userId).select('favoriteTools'),

    // 4. Storage Breakdown aggregated by fileType
    FileRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$fileType',
          totalBytes: { $sum: '$fileSize' },
          count: { $sum: 1 },
        },
      },
    ]),

    // 5. Query completed history to calculate real storage saved if size metadata exists
    HistoryRecord.find({ user: userId, status: 'completed' })
      .select('inputFiles outputFile')
      .lean(),

    // 6. Recent activities (latest 5 user history records)
    HistoryRecord.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Calculate Total Tools Used
  const totalToolsUsed = distinctTools.length;

  // Calculate Total Favorites
  const totalFavorites = userDoc?.favoriteTools?.length || 0;

  // Calculate Total Storage Used in Bytes from FileRecord
  const typeMap: Record<string, { totalBytes: number; count: number }> = {
    image: { totalBytes: 0, count: 0 },
    pdf: { totalBytes: 0, count: 0 },
    document: { totalBytes: 0, count: 0 },
  };

  let storageUsedBytes = 0;
  for (const item of storageAggregation) {
    if (item._id && typeMap[item._id] !== undefined) {
      typeMap[item._id] = { totalBytes: item.totalBytes, count: item.count };
    }
    storageUsedBytes += item.totalBytes || 0;
  }

  // Calculate dynamic storage breakdown percentages (zero if total is zero, never hardcoded)
  const storageBreakdown = [
    {
      fileType: 'pdf' as const,
      name: 'PDF Documents',
      bytes: typeMap.pdf.totalBytes,
      count: typeMap.pdf.count,
      percentage: storageUsedBytes > 0
        ? Math.round((typeMap.pdf.totalBytes / storageUsedBytes) * 1000) / 10
        : 0,
      color: 'bg-cyan-500',
    },
    {
      fileType: 'image' as const,
      name: 'Photos & Graphics',
      bytes: typeMap.image.totalBytes,
      count: typeMap.image.count,
      percentage: storageUsedBytes > 0
        ? Math.round((typeMap.image.totalBytes / storageUsedBytes) * 1000) / 10
        : 0,
      color: 'bg-purple-500',
    },
    {
      fileType: 'document' as const,
      name: 'Scanned & Text Documents',
      bytes: typeMap.document.totalBytes,
      count: typeMap.document.count,
      percentage: storageUsedBytes > 0
        ? Math.round((typeMap.document.totalBytes / storageUsedBytes) * 1000) / 10
        : 0,
      color: 'bg-blue-500',
    },
  ];

  // Calculate Storage Saved: only when reliable input/output byte data exists, otherwise 0
  let storageSavedBytes = 0;
  for (const entry of completedHistoryWithSizes) {
    let inBytes = 0;
    if (Array.isArray(entry.inputFiles)) {
      for (const file of entry.inputFiles) {
        if (file && typeof file === 'object' && typeof (file as any).size === 'number') {
          inBytes += (file as any).size;
        }
      }
    }
    let outBytes = 0;
    if (entry.outputFile && typeof entry.outputFile === 'object' && typeof (entry.outputFile as any).size === 'number') {
      outBytes = (entry.outputFile as any).size;
    }

    if (inBytes > 0 && outBytes > 0 && inBytes > outBytes) {
      storageSavedBytes += inBytes - outBytes;
    }
  }

  // Format Recent Activities for the dashboard table
  const recentActivities = recentHistoryRecords.map((h: any) => {
    let fileName = 'Processed File';
    let sizeBytes = 0;

    if (h.outputFile) {
      if (typeof h.outputFile === 'string') {
        fileName = h.outputFile;
      } else if (typeof h.outputFile === 'object') {
        if (h.outputFile.name) fileName = h.outputFile.name;
        if (typeof h.outputFile.size === 'number') sizeBytes = h.outputFile.size;
      }
    } else if (Array.isArray(h.inputFiles) && h.inputFiles.length > 0) {
      const firstInput = h.inputFiles[0];
      if (typeof firstInput === 'string') {
        fileName = firstInput;
      } else if (typeof firstInput === 'object') {
        if (firstInput.name) fileName = firstInput.name;
        if (typeof firstInput.size === 'number') sizeBytes = firstInput.size;
      }
    }

    return {
      id: h._id ? h._id.toString() : '',
      fileName,
      tool: h.tool || '',
      toolName: h.toolName || h.tool || 'Processing Tool',
      size: formatByteSize(sizeBytes),
      sizeBytes,
      status: h.status || 'completed',
      createdAt: h.createdAt,
    };
  });

  res.status(200).json({
    success: true,
    message: 'User dashboard statistics retrieved successfully',
    data: {
      metrics: {
        totalToolsUsed,
        filesProcessed,
        storageUsedBytes,
        storageSavedBytes,
        totalFavorites,
      },
      storageBreakdown,
      recentActivities,
    },
  });
});

