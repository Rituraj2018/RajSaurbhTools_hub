import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * File Document Interface
 */
export interface IFile {
  user: Types.ObjectId;
  originalName: string;
  fileName: string;
  fileType: 'image' | 'document' | 'pdf';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  /** Cloudinary public_id — populated when storageProvider is 'cloudinary' */
  cloudinaryPublicId?: string;
  /** Where the file is physically stored */
  storageProvider: 'local' | 'cloudinary';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeScript interface for File Mongoose Document
 */
export interface IFileDocument extends Document, Omit<IFile, 'createdAt' | 'updatedAt'> {
  cloudinaryPublicId?: string;
  storageProvider: 'local' | 'cloudinary';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for Uploaded File
 */
const fileSchema = new Schema<IFileDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Unique file name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type classification is required'],
      enum: ['image', 'document', 'pdf'],
      index: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size cannot be empty'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: null,
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Mongoose Model for Uploaded File
 */
export const FileRecord: Model<IFileDocument> =
  mongoose.models.FileRecord || mongoose.model<IFileDocument>('FileRecord', fileSchema);

export default FileRecord;
