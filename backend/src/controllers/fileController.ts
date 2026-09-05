import crypto from 'crypto';
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
import { getUserCloudContext, getValidAccessToken } from '../controllers/cloudController';
import { CloudProvider } from '../models/CloudConnection';
import { ICloudStorageProvider } from '../services/cloudStorageProvider';
import { googleDriveProvider } from '../services/googleDriveProvider';
import { oneDriveProvider } from '../services/oneDriveProvider';

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
 * Get the provider instance by name.
 */
const getProviderInstance = (provider: string): ICloudStorageProvider => {
  switch (provider) {
    case 'google_drive':
      return googleDriveProvider;
    case 'onedrive':
      return oneDriveProvider;
    default:
      throw new ApiError(400, `Unsupported cloud provider: ${provider}`);
  }
};

/**
 * Determine upload category from MIME type.
 */
const getUploadCategory = (mimeType: string): 'Images' | 'PDFs' | 'Documents' => {
  if (mimeType.startsWith('image/')) return 'Images';
  if (mimeType === 'application/pdf') return 'PDFs';
  return 'Documents';
};

/**
 * @desc    Upload a single file — routes to connected cloud storage, Cloudinary, or local disk
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
  const userId = req.user._id.toString();

  // 1. Check if user has connected personal cloud storage (Google Drive / OneDrive)
  const cloudContext = await getUserCloudContext(userId);

  let fileUrl = '';
  let fileName = '';
  let cloudFileId: string | null = null;
  let cloudinaryPublicId: string | null = null;
  let storageProvider: 'local' | 'cloudinary' | 'google_drive' | 'onedrive';

  if (cloudContext) {
    // Upload to user's connected personal cloud storage
    const { provider, accessToken, providerInstance } = cloudContext;
    const category = getUploadCategory(mimetype);

    try {
      const uploadResult = await providerInstance.uploadFile(
        accessToken,
        req.file.buffer,
        originalname,
        mimetype,
        category
      );

      fileUrl = uploadResult.fileUrl || uploadResult.webViewLink || '';
      fileName = uploadResult.fileName;
      cloudFileId = uploadResult.cloudFileId;
      storageProvider = provider;
    } catch (uploadErr: any) {
      console.error(`[FileController] Cloud upload failed (${provider}):`, uploadErr);

      if (uploadErr?.message?.includes('expired') || uploadErr?.message?.includes('revoked')) {
        throw new ApiError(
          401,
          'Your cloud storage session has expired. Please reconnect your cloud storage.'
        );
      }
      throw new ApiError(
        500,
        `Failed to upload file to your ${provider === 'google_drive' ? 'Google Drive' : 'OneDrive'}. Please try again.`
      );
    }
  } else if (isCloudinaryReady()) {
    // 2. Upload to Cloudinary (if configured)
    const result = await uploadToCloudinary(req.file.buffer, mimetype, `user_${userId}`);
    fileUrl = result.secureUrl;
    cloudinaryPublicId = result.publicId;
    fileName = `${result.publicId}.${result.format || 'jpg'}`;
    storageProvider = 'cloudinary';
  } else {
    // 3. Local disk storage fallback
    const ext = path.extname(originalname).toLowerCase();
    const baseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const uniqueFileName = `${baseName}-${uniqueSuffix}${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, uniqueFileName);
    await fs.promises.writeFile(filePath, req.file.buffer);

    fileUrl = `/uploads/${uniqueFileName}`;
    fileName = uniqueFileName;
    storageProvider = 'local';
  }

  // Persist metadata record to MongoDB
  const fileDoc = await FileRecord.create({
    user: req.user._id,
    originalName: originalname,
    fileName,
    fileType,
    mimeType: mimetype,
    fileSize: size,
    fileUrl,
    cloudinaryPublicId,
    cloudFileId,
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
        cloudFileId: fileDoc.cloudFileId ?? null,
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

  const isDownload = req.query.download === 'true';
  const isView = req.query.view === 'true';

  // If download or view/stream query is requested, handle per storage provider
  if (isDownload || isView) {
    if (fileDoc.storageProvider === 'google_drive' || fileDoc.storageProvider === 'onedrive') {
      // Cloud-stored files: download via provider and stream to client
      if (!fileDoc.cloudFileId) {
        throw new ApiError(500, 'Cloud file reference is missing');
      }

      try {
        const accessToken = await getValidAccessToken(
          req.user._id.toString(),
          fileDoc.storageProvider as CloudProvider
        );
        const providerInstance = getProviderInstance(fileDoc.storageProvider);
        const { buffer, mimeType, fileName } = await providerInstance.downloadFile(
          accessToken,
          fileDoc.cloudFileId
        );

        const disposition = isView ? 'inline' : 'attachment';
        res.setHeader(
          'Content-Disposition',
          `${disposition}; filename="${encodeURIComponent(fileDoc.originalName)}"`
        );
        res.setHeader('Content-Type', mimeType || fileDoc.mimeType);
        res.setHeader('Content-Length', buffer.length.toString());
        res.send(buffer);
        return;
      } catch (err: any) {
        console.error(`[FileController] Cloud stream failed:`, err);
        throw new ApiError(
          500,
          'Failed to retrieve file from your cloud storage. Please check your connection.'
        );
      }
    }

    if (fileDoc.storageProvider === 'cloudinary') {
      // Cloudinary files have a public secure URL — redirect
      res.redirect(fileDoc.fileUrl);
      return;
    }

    // Local disk: stream or download the file
    const filePath = path.resolve(process.cwd(), 'uploads', fileDoc.fileName);
    if (fs.existsSync(filePath)) {
      if (isView) {
        res.setHeader('Content-Type', fileDoc.mimeType);
        res.sendFile(filePath);
      } else {
        res.download(filePath, fileDoc.originalName);
      }
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
 * @desc    Delete a file record — removes from cloud storage, Cloudinary, or local disk + MongoDB
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

  if (
    (fileDoc.storageProvider === 'google_drive' || fileDoc.storageProvider === 'onedrive') &&
    fileDoc.cloudFileId
  ) {
    /* ── Delete from user's cloud storage ── */
    try {
      const accessToken = await getValidAccessToken(
        req.user._id.toString(),
        fileDoc.storageProvider as CloudProvider
      );
      const providerInstance = getProviderInstance(fileDoc.storageProvider);
      await providerInstance.deleteFile(accessToken, fileDoc.cloudFileId);
    } catch (err: any) {
      console.error(`[FileController] Cloud delete failed (${fileDoc.storageProvider}):`, err);
      // Non-fatal: still remove MongoDB record even if cloud delete fails
    }
  } else if (fileDoc.storageProvider === 'cloudinary' && fileDoc.cloudinaryPublicId) {
    /* ── Delete from Cloudinary ── */
    await deleteFromCloudinary(fileDoc.cloudinaryPublicId, fileDoc.mimeType);
  } else {
    /* ── Delete from local disk ── */
    const filePath = path.resolve(process.cwd(), 'uploads', fileDoc.fileName);
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
