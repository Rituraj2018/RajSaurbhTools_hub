import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Supported cloud storage providers
 */
export type CloudProvider = 'google_drive' | 'onedrive';

/**
 * Connection status for a cloud provider
 */
export type CloudConnectionStatus = 'connected' | 'expired' | 'revoked';

/**
 * Cloud Connection Document Interface
 */
export interface ICloudConnection {
  user: Types.ObjectId;
  provider: CloudProvider;
  providerAccountId: string;
  providerEmail?: string;
  /** AES-256-GCM encrypted access token */
  encryptedAccessToken: string;
  /** AES-256-GCM encrypted refresh token */
  encryptedRefreshToken: string;
  /** When the current access token expires */
  tokenExpiresAt: Date;
  connectionStatus: CloudConnectionStatus;
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeScript interface for CloudConnection Mongoose Document
 */
export interface ICloudConnectionDocument
  extends Document,
    Omit<ICloudConnection, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for Cloud Connection
 */
const cloudConnectionSchema = new Schema<ICloudConnectionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    provider: {
      type: String,
      required: [true, 'Cloud provider is required'],
      enum: ['google_drive', 'onedrive'],
      index: true,
    },
    providerAccountId: {
      type: String,
      required: [true, 'Provider account ID is required'],
      trim: true,
    },
    providerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    encryptedAccessToken: {
      type: String,
      required: [true, 'Encrypted access token is required'],
      select: false, // Never returned in queries by default
    },
    encryptedRefreshToken: {
      type: String,
      required: [true, 'Encrypted refresh token is required'],
      select: false, // Never returned in queries by default
    },
    tokenExpiresAt: {
      type: Date,
      required: [true, 'Token expiration time is required'],
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'expired', 'revoked'],
      default: 'connected',
      index: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        // Never expose tokens in JSON output
        delete ret.encryptedAccessToken;
        delete ret.encryptedRefreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.encryptedAccessToken;
        delete ret.encryptedRefreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: one connection per provider per user
cloudConnectionSchema.index({ user: 1, provider: 1 }, { unique: true });

/**
 * Mongoose Model for Cloud Connection
 */
export const CloudConnection: Model<ICloudConnectionDocument> =
  mongoose.models.CloudConnection ||
  mongoose.model<ICloudConnectionDocument>('CloudConnection', cloudConnectionSchema);

export default CloudConnection;
