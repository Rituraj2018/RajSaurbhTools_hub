import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IWebsite {
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebsiteDocument
  extends Document,
    Omit<IWebsite, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

// Regex to strictly allow http:// and https:// and reject schemes like javascript:, data:, vbscript:
export const HTTP_URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/i;

const websiteSchema = new Schema<IWebsiteDocument>(
  {
    name: {
      type: String,
      required: [true, 'Website name is required'],
      trim: true,
      maxlength: [100, 'Website name cannot exceed 100 characters'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return false;
          // Must start with http:// or https://
          if (!/^https?:\/\//i.test(v)) return false;
          // Reject dangerous schemes or patterns
          if (/^(javascript|data|vbscript|file):/i.test(v)) return false;
          return HTTP_URL_REGEX.test(v);
        },
        message: 'Please provide a valid HTTP or HTTPS URL (e.g., https://example.com)',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    iconUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
websiteSchema.index({ isActive: 1, createdAt: -1 });

export const Website: Model<IWebsiteDocument> =
  mongoose.models.Website || mongoose.model<IWebsiteDocument>('Website', websiteSchema);

export default Website;
