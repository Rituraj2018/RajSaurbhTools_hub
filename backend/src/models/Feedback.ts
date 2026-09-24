import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type FeedbackType =
  | 'bug'
  | 'feature'
  | 'improve_tool'
  | 'new_tool'
  | 'praise'
  | 'other';

export type RatingEmoji = 'poor' | 'okay' | 'good' | 'great' | 'excellent';

export interface IFeedback {
  feedbackType: FeedbackType;
  rating: number; // 1 to 5
  ratingEmoji: RatingEmoji;
  toolId?: string;
  toolName?: string;
  message: string;
  featureTitle?: string;
  featureBenefit?: string;
  newToolName?: string;
  newToolUse?: string;
  expectedResult?: string;
  actualResult?: string;
  email?: string;
  user?: Types.ObjectId;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedbackDocument
  extends Document,
    Omit<IFeedback, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedbackDocument>(
  {
    feedbackType: {
      type: String,
      enum: ['bug', 'feature', 'improve_tool', 'new_tool', 'praise', 'other'],
      required: [true, 'Feedback type is required'],
      index: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      required: [true, 'Rating is required'],
    },
    ratingEmoji: {
      type: String,
      enum: ['poor', 'okay', 'good', 'great', 'excellent'],
      required: [true, 'Rating emoji is required'],
    },
    toolId: {
      type: String,
      trim: true,
      default: null,
    },
    toolName: {
      type: String,
      trim: true,
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    featureTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Feature title cannot exceed 200 characters'],
      default: null,
    },
    featureBenefit: {
      type: String,
      trim: true,
      maxlength: [500, 'Feature benefit cannot exceed 500 characters'],
      default: null,
    },
    newToolName: {
      type: String,
      trim: true,
      maxlength: [200, 'New tool name cannot exceed 200 characters'],
      default: null,
    },
    newToolUse: {
      type: String,
      trim: true,
      maxlength: [500, 'New tool use cannot exceed 500 characters'],
      default: null,
    },
    expectedResult: {
      type: String,
      trim: true,
      maxlength: [500, 'Expected result cannot exceed 500 characters'],
      default: null,
    },
    actualResult: {
      type: String,
      trim: true,
      maxlength: [500, 'Actual result cannot exceed 500 characters'],
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      match: [
        /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
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

// Performance Indexes
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1 });

export const Feedback: Model<IFeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<IFeedbackDocument>('Feedback', feedbackSchema);

export default Feedback;
