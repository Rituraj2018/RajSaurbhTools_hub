import { google, drive_v3 } from 'googleapis';
import { config } from '../config/env';
import {
  ICloudStorageProvider,
  CloudConnectionResult,
  CloudUploadResult,
  CloudFileMetadata,
} from './cloudStorageProvider';
import { Readable } from 'stream';

const ROOT_FOLDER_NAME = 'RajSaurbh Tools Hub';
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'];

/**
 * Google Drive implementation of ICloudStorageProvider.
 * Uses the googleapis SDK with server-side OAuth2 authorization code flow.
 * All operations target the individual user's personal Google Drive.
 */
export class GoogleDriveProvider implements ICloudStorageProvider {
  readonly providerName = 'google_drive' as const;

  private createOAuth2Client() {
    return new google.auth.OAuth2(
      config.googleDrive.clientId,
      config.googleDrive.clientSecret,
      config.googleDrive.redirectUri
    );
  }

  /**
   * Generate Google OAuth consent URL for Drive access.
   */
  getAuthUrl(state: string): string {
    const client = this.createOAuth2Client();
    console.log('[Google Drive OAuth] Redirect URI:', config.googleDrive.redirectUri);
    return client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      scope: SCOPES,
      state,
      prompt: 'consent', // Force consent to get refresh token every time
      include_granted_scopes: true,
    });
  }

  /**
   * Exchange authorization code for tokens and get user email.
   */
  async exchangeCodeForTokens(code: string): Promise<CloudConnectionResult> {
    const client = this.createOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Google OAuth did not return an access token');
    }
    if (!tokens.refresh_token) {
      throw new Error('Google OAuth did not return a refresh token. Please revoke access and try again.');
    }

    // Get user info to identify the account
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();

    return {
      providerAccountId: userInfo.data.id || '',
      providerEmail: userInfo.data.email || '',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresInSeconds: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600,
    };
  }

  /**
   * Refresh an expired access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresInSeconds: number }> {
    const client = this.createOAuth2Client();
    client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error('Failed to refresh Google Drive access token');
    }

    return {
      accessToken: credentials.access_token,
      expiresInSeconds: credentials.expiry_date
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
        : 3600,
    };
  }

  /**
   * Helper to create an authenticated Drive API client.
   */
  private getDriveClient(accessToken: string): drive_v3.Drive {
    const client = this.createOAuth2Client();
    client.setCredentials({ access_token: accessToken });
    return google.drive({ version: 'v3', auth: client });
  }

  /**
   * Find or create a folder in the user's Google Drive.
   */
  private async findOrCreateFolder(
    drive: drive_v3.Drive,
    folderName: string,
    parentId?: string
  ): Promise<string> {
    const parentQuery = parentId ? `'${parentId}' in parents` : `'root' in parents`;
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and ${parentQuery}`;

    const searchRes = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id!;
    }

    // Create the folder
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      },
      fields: 'id',
    });

    return createRes.data.id!;
  }

  /**
   * Ensure the standard folder hierarchy exists:
   * RajSaurbh Tools Hub / Images|PDFs|Documents
   */
  private async ensureFolderHierarchy(
    drive: drive_v3.Drive,
    category: string = 'Images'
  ): Promise<{ rootFolderId: string; targetFolderId: string; folderPath: string }> {
    const rootFolderId = await this.findOrCreateFolder(drive, ROOT_FOLDER_NAME);
    const targetFolderId = await this.findOrCreateFolder(drive, category, rootFolderId);

    return {
      rootFolderId,
      targetFolderId,
      folderPath: `${ROOT_FOLDER_NAME} / ${category}`,
    };
  }

  /**
   * Determine subfolder category from MIME type.
   */
  private categorizeFile(mimeType: string, explicitCategory?: string): string {
    if (explicitCategory) return explicitCategory;
    if (mimeType.startsWith('image/')) return 'Images';
    if (mimeType === 'application/pdf') return 'PDFs';
    return 'Documents';
  }

  /**
   * Upload a file to the user's Google Drive.
   */
  async uploadFile(
    accessToken: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    category?: 'Images' | 'PDFs' | 'Documents'
  ): Promise<CloudUploadResult> {
    const drive = this.getDriveClient(accessToken);
    const resolvedCategory = this.categorizeFile(mimeType, category);
    const { targetFolderId, folderPath } = await this.ensureFolderHierarchy(drive, resolvedCategory);

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [targetFolderId],
        description: 'Uploaded from RajSaurbh Tools Hub',
      },
      media: {
        mimeType,
        body: readable,
      },
      fields: 'id, name, webViewLink, size',
    });

    return {
      cloudFileId: uploadRes.data.id!,
      fileName: uploadRes.data.name || fileName,
      fileUrl: uploadRes.data.webViewLink || '',
      webViewLink: uploadRes.data.webViewLink || undefined,
      folderPath,
      fileSize: Number(uploadRes.data.size) || buffer.length,
    };
  }

  /**
   * List files in the user's app folder.
   */
  async listFiles(accessToken: string): Promise<CloudFileMetadata[]> {
    const drive = this.getDriveClient(accessToken);

    // Find root folder first
    const query = `name = '${ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and 'root' in parents`;
    const folderRes = await drive.files.list({
      q: query,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (!folderRes.data.files || folderRes.data.files.length === 0) {
      return []; // No root folder means no files yet
    }

    const rootFolderId = folderRes.data.files[0].id!;

    // List all non-folder files recursively under the root folder
    const filesQuery = `'${rootFolderId}' in parents and trashed = false`;
    const subFolders = await drive.files.list({
      q: filesQuery,
      fields: 'files(id, name, mimeType)',
      spaces: 'drive',
    });

    const allFiles: CloudFileMetadata[] = [];

    // Search within each subfolder
    for (const folder of subFolders.data.files || []) {
      if (folder.mimeType === 'application/vnd.google-apps.folder') {
        const subQuery = `'${folder.id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
        const subFiles = await drive.files.list({
          q: subQuery,
          fields: 'files(id, name, mimeType, size, webViewLink, createdTime, modifiedTime)',
          spaces: 'drive',
          orderBy: 'createdTime desc',
        });

        for (const file of subFiles.data.files || []) {
          allFiles.push({
            cloudFileId: file.id!,
            fileName: file.name || 'Unknown',
            mimeType: file.mimeType || 'application/octet-stream',
            fileSize: Number(file.size) || 0,
            webViewLink: file.webViewLink || undefined,
            folderPath: `${ROOT_FOLDER_NAME} / ${folder.name}`,
            createdTime: file.createdTime || undefined,
            modifiedTime: file.modifiedTime || undefined,
          });
        }
      }
    }

    return allFiles;
  }

  /**
   * Download a file from the user's Google Drive.
   */
  async downloadFile(
    accessToken: string,
    cloudFileId: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    const drive = this.getDriveClient(accessToken);

    // Get file metadata first
    const meta = await drive.files.get({
      fileId: cloudFileId,
      fields: 'name, mimeType',
    });

    // Download the file content
    const response = await drive.files.get(
      { fileId: cloudFileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return {
      buffer: Buffer.from(response.data as ArrayBuffer),
      mimeType: meta.data.mimeType || 'application/octet-stream',
      fileName: meta.data.name || 'download',
    };
  }

  /**
   * Delete a file from the user's Google Drive.
   */
  async deleteFile(accessToken: string, cloudFileId: string): Promise<void> {
    const drive = this.getDriveClient(accessToken);
    await drive.files.delete({ fileId: cloudFileId });
  }

  /**
   * Revoke Google OAuth token.
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      const client = this.createOAuth2Client();
      await client.revokeToken(accessToken);
    } catch (err) {
      console.warn('[GoogleDriveProvider] Token revocation failed (non-fatal):', err);
    }
  }
}

/** Singleton instance */
export const googleDriveProvider = new GoogleDriveProvider();
