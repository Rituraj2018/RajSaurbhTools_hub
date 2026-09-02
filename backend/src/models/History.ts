import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type HistoryStatus = 'processing' | 'completed' | 'failed';

export interface IHistoryInputFile {
  name: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface IHistoryOutputFile {
  name: string;
  size?: number;
  type?: string;
  url?: string;
}

/**
 * Processing History Document Interface
 */
export interface IHistory {
  user: Types.ObjectId;
  tool: string;
  toolName?: string;
  inputFiles: Array<IHistoryInputFile | string>;
  outputFile?: IHistoryOutputFile | string;
  status: HistoryStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeScript interface for History Mongoose Document
 */
export interface IHistoryDocument extends Document, Omit<IHistory, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for Processing History
 */
const historySchema = new Schema<IHistoryDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    tool: {
      type: String,
      required: [true, 'Tool identifier is required'],
      trim: true,
      index: true,
    },
    toolName: {
      type: String,
      trim: true,
    },
    inputFiles: {
      type: [Schema.Types.Mixed],
      default: [],
      required: [true, 'Input files are required'],
    },
    outputFile: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
 * Mongoose Model for Processing History
 */
export const HistoryRecord: Model<IHistoryDocument> =
  mongoose.models.HistoryRecord || mongoose.model<IHistoryDocument>('HistoryRecord', historySchema);

export default HistoryRecord;
