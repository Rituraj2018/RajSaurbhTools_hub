/**
 * Cloud Storage Provider Abstraction Layer
 *
 * Defines a common interface for all cloud storage providers (Google Drive, OneDrive).
 * Workspace and Library code interacts through this abstraction, never directly
 * with provider-specific APIs.
 */

/**
 * Result of a successful cloud provider connection
 */
export interface CloudConnectionResult {
  providerAccountId: string;
  providerEmail: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

/**
 * Metadata for a file stored in the user's cloud account
 */
export interface CloudFileMetadata {
  cloudFileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  webViewLink?: string;
  folderPath: string;
  createdTime?: string;
  modifiedTime?: string;
}

/**
 * Result of uploading a file to the user's cloud
 */
export interface CloudUploadResult {
  cloudFileId: string;
  fileName: string;
  fileUrl: string;
  webViewLink?: string;
  folderPath: string;
  fileSize: number;
}

/**
 * Connection status information
 */
export interface CloudConnectionStatus {
  isConnected: boolean;
  provider: string;
  providerEmail?: string;
  connectedAt?: Date;
  tokenExpiresAt?: Date;
  connectionStatus?: string;
}

/**
 * Cloud Storage Provider Interface
 *
 * All cloud storage providers must implement these operations.
 */
export interface ICloudStorageProvider {
  /** Unique provider identifier */
  readonly providerName: 'google_drive' | 'onedrive';

  /**
   * Generate the OAuth authorization URL for the user to visit.
   * @param state - Opaque state string for CSRF protection
   */
  getAuthUrl(state: string): string;

  /**
   * Exchange an authorization code for tokens and user info.
   * @param code - OAuth authorization code from the callback
   */
  exchangeCodeForTokens(code: string): Promise<CloudConnectionResult>;

  /**
   * Refresh an expired access token using the stored refresh token.
   * @param refreshToken - The stored refresh token (decrypted)
   * @returns New access token and its expiry in seconds
   */
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresInSeconds: number }>;

  /**
   * Upload a file to the user's cloud storage.
   * @param accessToken - Valid access token for the user's account
   * @param buffer - File content buffer
   * @param fileName - Display name for the file
   * @param mimeType - MIME type of the file
   * @param category - Subfolder category (Images, PDFs, Documents)
   */
  uploadFile(
    accessToken: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    category?: 'Images' | 'PDFs' | 'Documents'
  ): Promise<CloudUploadResult>;

  /**
   * List files in the user's app folder.
   * @param accessToken - Valid access token
   */
  listFiles(accessToken: string): Promise<CloudFileMetadata[]>;

  /**
   * Download a file's content from the user's cloud storage.
   * @param accessToken - Valid access token
   * @param cloudFileId - Provider-specific file identifier
   */
  downloadFile(accessToken: string, cloudFileId: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }>;

  /**
   * Delete a file from the user's cloud storage.
   * @param accessToken - Valid access token
   * @param cloudFileId - Provider-specific file identifier
   */
  deleteFile(accessToken: string, cloudFileId: string): Promise<void>;

  /**
   * Revoke a user's OAuth tokens (optional, best-effort).
   * @param accessToken - Token to revoke
   */
  revokeToken?(accessToken: string): Promise<void>;
}
