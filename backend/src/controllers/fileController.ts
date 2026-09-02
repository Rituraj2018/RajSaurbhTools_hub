import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { FileRecord } from '../models/File';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryReady,
} from '../services/cloudinaryService';

/**
 * Helper to determine file classification type
 */
const classifyFileType = (mimeType: string): 'image' | 'pdf' | 'document' => {
  if (mimeType.toLowerCase() === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType.toLowerCase().startsWith('image/')) {
    return 'image';
  }
  return 'document';
};

/**
 * @desc    Upload a single file — Cloudinary when configured, local disk fallback
 * @route   POST /api/files/upload
 * @access  Private (Requires Authentication)
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  if (!req.user) {
    throw new ApiError(401, 'Authentication required to upload files');
  }

  const { originalname, mimetype, size } = req.file;
  const fileType = classifyFileType(mimetype);

  let fileUrl: string;
  let fileName: string;
  let cloudinaryPublicId: string | undefined;
  let storageProvider: 'cloudinary' | 'local';

  if (isCloudinaryReady() && req.file.buffer) {
    /* ── Cloudinary Path ── */
    const userId = req.user._id.toString();
    const cloudResult = await uploadToCloudinary(req.file.buffer, mimetype, `user_${userId}`);

    fileUrl = cloudResult.secureUrl;
    cloudinaryPublicId = cloudResult.publicId;
    // Use the publicId's last segment as the stored fileName for reference
    fileName = cloudResult.publicId.split('/').pop() || `cloudinary_${Date.now()}`;
    storageProvider = 'cloudinary';
  } else {
    /* ── Local Disk Fallback ── */
    if (!req.file.filename) {
      throw new ApiError(500, 'Local storage filename missing — check multer configuration');
    }
    fileName = req.file.filename;
    fileUrl = `/uploads/${fileName}`;
    cloudinaryPublicId = undefined;
    storageProvider = 'local';
  }

  // Persist record to MongoDB
  const fileDoc = await FileRecord.create({
    user: req.user._id,
    originalName: originalname,
    fileName,
    fileType,
    mimeType: mimetype,
    fileSize: size,
    fileUrl,
    cloudinaryPublicId: cloudinaryPublicId ?? null,
    storageProvider,
  });

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      file: {
        id: fileDoc._id.toString(),
        user: req.user._id.toString(),
        originalName: fileDoc.originalName,
        fileName: fileDoc.fileName,
        fileType: fileDoc.fileType,
        mimeType: fileDoc.mimeType,
        fileSize: fileDoc.fileSize,
        fileUrl: fileDoc.fileUrl,
        cloudinaryPublicId: fileDoc.cloudinaryPublicId ?? null,
        storageProvider: fileDoc.storageProvider,
        createdAt: fileDoc.createdAt,
      },
    },
  });
});

/**
 * @desc    Get user files with search, type filter, sorting, and pagination
 * @route   GET /api/files
 * @access  Private (Requires Authentication)
 */
export const getUserFiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
  const skip = (page - 1) * limit;

  const search = (req.query.search as string)?.trim();
  const fileType = (req.query.type as string)?.trim().toLowerCase();
  const sortBy = (req.query.sortBy as string) || 'newest';

  // Base filter: user can ONLY access their own files
  const query: Record<string, any> = {
    user: req.user._id,
  };

  // Search filter by original name
  if (search) {
    query.originalName = { $regex: search, $options: 'i' };
  }

  // Type filter (image, pdf, document)
  if (fileType && fileType !== 'all') {
    query.fileType = fileType;
  }

  // Sorting options
  let sortOption: Record<string, any> = { createdAt: -1 };
  switch (sortBy) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'size_desc':
      sortOption = { fileSize: -1 };
      break;
    case 'size_asc':
      sortOption = { fileSize: 1 };
      break;
    case 'name_asc':
      sortOption = { originalName: 1 };
      break;
    case 'name_desc':
      sortOption = { originalName: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [files, totalFiles, allUserFiles] = await Promise.all([
    FileRecord.find(query).sort(sortOption).skip(skip).limit(limit),
    FileRecord.countDocuments(query),
    // Aggregate storage metrics for the user
    FileRecord.find({ user: req.user._id }).select('fileSize fileType'),
  ]);

  const totalPages = Math.ceil(totalFiles / limit) || 1;

  // Compute aggregate user storage statistics
  const totalStorageBytes = allUserFiles.reduce((acc, f) => acc + f.fileSize, 0);
  const imageCount = allUserFiles.filter((f) => f.fileType === 'image').length;
  const pdfCount = allUserFiles.filter((f) => f.fileType === 'pdf').length;
  const documentCount = allUserFiles.filter((f) => f.fileType === 'document').length;

  res.status(200).json({
    success: true,
    message: 'User files retrieved successfully',
    data: {
      files,
      totalFiles,
      totalPages,
      currentPage: page,
      limit,
      stats: {
        totalStorageBytes,
        totalFilesCount: allUserFiles.length,
        imageCount,
        pdfCount,
        documentCount,
      },
    },
  });
});

/**
 * @desc    Get a single file by ID (or trigger download stream)
 * @route   GET /api/files/:id
 * @access  Private (Requires Authentication)
 */
export const getFileById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const fileDoc = await FileRecord.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!fileDoc) {
    throw new ApiError(404, 'File not found or unauthorized access');
  }

  // If download query is requested, handle per storage provider
  if (req.query.download === 'true') {
    if (fileDoc.storageProvider === 'cloudinary') {
      // Cloudinary files have a public secure URL — redirect
      res.redirect(fileDoc.fileUrl);
      return;
    }

    // Local disk: stream the file as an attachment
    const filePath = path.join(__dirname, '../../uploads', fileDoc.fileName);
    if (fs.existsSync(filePath)) {
      res.download(filePath, fileDoc.originalName);
      return;
    }
  }

  res.status(200).json({
    success: true,
    message: 'File retrieved successfully',
    data: {
      file: fileDoc,
    },
  });
});

/**
 * @desc    Delete a file record — removes from Cloudinary or local disk + MongoDB
 * @route   DELETE /api/files/:id
 * @access  Private (Requires Authentication)
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const fileDoc = await FileRecord.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!fileDoc) {
    throw new ApiError(404, 'File not found or you do not have permission to delete it');
  }

  if (fileDoc.storageProvider === 'cloudinary' && fileDoc.cloudinaryPublicId) {
    /* ── Delete from Cloudinary ── */
    await deleteFromCloudinary(fileDoc.cloudinaryPublicId, fileDoc.mimeType);
  } else {
    /* ── Delete from local disk ── */
    const filePath = path.join(__dirname, '../../uploads', fileDoc.fileName);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (unlinkErr) {
      console.error(`Warning: Failed to delete physical file at ${filePath}:`, unlinkErr);
    }
  }

  // Remove MongoDB record
  await FileRecord.deleteOne({ _id: fileDoc._id });

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
    data: {
      id: fileDoc._id.toString(),
      fileName: fileDoc.fileName,
      originalName: fileDoc.originalName,
      storageProvider: fileDoc.storageProvider,
    },
  });
});
