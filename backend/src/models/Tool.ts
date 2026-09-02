import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Valid Tool Categories
 */
export type ToolCategory = 'Photo' | 'PDF' | 'Document' | 'Image';

export const TOOL_CATEGORIES: ToolCategory[] = ['Photo', 'PDF', 'Document', 'Image'];

/**
 * TypeScript interface representing Tool properties
 */
export interface ITool {
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  icon: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeScript interface for Tool Mongoose Document
 */
export interface IToolDocument extends Document, Omit<ITool, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for Tool
 */
const toolSchema = new Schema<IToolDocument>(
  {
    name: {
      type: String,
      required: [true, 'Tool name is required'],
      trim: true,
      minlength: [2, 'Tool name must be at least 2 characters'],
      maxlength: [100, 'Tool name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Tool slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Tool description is required'],
      trim: true,
      maxlength: [500, 'Tool description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Tool category is required'],
      enum: {
        values: TOOL_CATEGORIES,
        message: '{VALUE} is not a supported tool category',
      },
      index: true,
    },
    icon: {
      type: String,
      default: 'Wrench',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
 * Mongoose Model for Tool
 */
export const Tool: Model<IToolDocument> =
  mongoose.models.Tool || mongoose.model<IToolDocument>('Tool', toolSchema);

export default Tool;
