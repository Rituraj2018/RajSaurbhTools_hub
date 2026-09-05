import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { config } from '../config/env';
import {
  ICloudStorageProvider,
  CloudConnectionResult,
  CloudUploadResult,
  CloudFileMetadata,
} from './cloudStorageProvider';

const ROOT_FOLDER_NAME = 'RajSaurbh Tools Hub';
const SCOPES = ['Files.ReadWrite', 'User.Read', 'offline_access'];
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

/**
 * Microsoft OneDrive implementation of ICloudStorageProvider.
 * Uses @azure/msal-node for OAuth and Microsoft Graph API for file operations.
 * All operations target the individual user's personal OneDrive.
 */
export class OneDriveProvider implements ICloudStorageProvider {
  readonly providerName = 'onedrive' as const;

  private createMsalApp(): ConfidentialClientApplication {
    const msalConfig: Configuration = {
      auth: {
        clientId: config.microsoft.clientId,
        authority: `https://login.microsoftonline.com/${config.microsoft.tenantId}`,
        clientSecret: config.microsoft.clientSecret,
      },
    };
    return new ConfidentialClientApplication(msalConfig);
  }

  /**
   * Generate Microsoft OAuth consent URL for OneDrive access.
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.microsoft.clientId,
      response_type: 'code',
      redirect_uri: config.microsoft.redirectUri,
      scope: SCOPES.join(' '),
      state,
      response_mode: 'query',
      prompt: 'consent',
    });

    return `https://login.microsoftonline.com/${config.microsoft.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens and get user info.
   */
  async exchangeCodeForTokens(code: string): Promise<CloudConnectionResult> {
    const msalApp = this.createMsalApp();

    const tokenResponse = await msalApp.acquireTokenByCode({
      code,
      redirectUri: config.microsoft.redirectUri,
      scopes: SCOPES,
    });

    if (!tokenResponse || !tokenResponse.accessToken) {
      throw new Error('Microsoft OAuth did not return an access token');
    }

    // Get user info from Graph API
    const userResponse = await fetch(`${GRAPH_BASE}/me`, {
      headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to retrieve Microsoft user information');
    }

    const userData = await userResponse.json();

    // Extract refresh token from the MSAL token cache
    const cache = msalApp.getTokenCache().serialize();
    const cacheData = JSON.parse(cache);
    let refreshToken = '';

    // MSAL stores refresh tokens in the cache
    const refreshTokens = cacheData.RefreshToken || {};
    const refreshTokenKeys = Object.keys(refreshTokens);
    if (refreshTokenKeys.length > 0) {
      refreshToken = refreshTokens[refreshTokenKeys[0]].secret || '';
    }

    if (!refreshToken) {
      throw new Error('Microsoft OAuth did not return a refresh token. Please try again.');
    }

    return {
      providerAccountId: userData.id || tokenResponse.uniqueId || '',
      providerEmail: userData.mail || userData.userPrincipalName || '',
      accessToken: tokenResponse.accessToken,
      refreshToken,
      expiresInSeconds: tokenResponse.expiresOn
        ? Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000)
        : 3600,
    };
  }

  /**
   * Refresh an expired access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresInSeconds: number }> {
    // Use the token endpoint directly for refresh
    const tokenUrl = `https://login.microsoftonline.com/${config.microsoft.tenantId}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: config.microsoft.clientId,
      client_secret: config.microsoft.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: SCOPES.join(' '),
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OneDriveProvider] Token refresh failed:', errorText);
      throw new Error('Failed to refresh Microsoft OneDrive access token');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresInSeconds: data.expires_in || 3600,
    };
  }

  /**
   * Helper for Graph API requests with error handling.
   */
  private async graphRequest(
    accessToken: string,
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = path.startsWith('http') ? path : `${GRAPH_BASE}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
    return response;
  }

  /**
   * Ensure a folder exists in the user's OneDrive under their root.
   * Returns the folder's driveItem id.
   */
  private async ensureFolder(
    accessToken: string,
    folderName: string,
    parentPath: string = '/drive/root'
  ): Promise<string> {
    // Try to get the folder first
    const checkPath = `${parentPath}:/${folderName}`;
    const checkRes = await this.graphRequest(accessToken, `/me${checkPath}`);

    if (checkRes.ok) {
      const folderData = await checkRes.json();
      return folderData.id;
    }

    // Create the folder
    const createPath = `${parentPath}/children`;
    const createRes = await this.graphRequest(accessToken, `/me${createPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'fail',
      }),
    });

    if (!createRes.ok) {
      // If conflict (409), folder already exists — try to get it again
      if (createRes.status === 409) {
        const retryRes = await this.graphRequest(accessToken, `/me${checkPath}`);
        if (retryRes.ok) {
          const folderData = await retryRes.json();
          return folderData.id;
        }
      }
      const errText = await createRes.text();
      throw new Error(`Failed to create OneDrive folder "${folderName}": ${errText}`);
    }

    const folderData = await createRes.json();
    return folderData.id;
  }

  /**
   * Ensure the standard folder hierarchy:
   * RajSaurbh Tools Hub / Images|PDFs|Documents
   */
  private async ensureFolderHierarchy(
    accessToken: string,
    category: string = 'Images'
  ): Promise<{ rootFolderId: string; targetFolderId: string; folderPath: string }> {
    const rootFolderId = await this.ensureFolder(accessToken, ROOT_FOLDER_NAME);
    const targetFolderId = await this.ensureFolder(
      accessToken,
      category,
      `/drive/items/${rootFolderId}`
    );

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
   * Upload a file to the user's OneDrive.
   */
  async uploadFile(
    accessToken: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    category?: 'Images' | 'PDFs' | 'Documents'
  ): Promise<CloudUploadResult> {
    const resolvedCategory = this.categorizeFile(mimeType, category);
    const { targetFolderId, folderPath } = await this.ensureFolderHierarchy(
      accessToken,
      resolvedCategory
    );

    // For files up to 4MB, use simple upload. For larger files, use upload session.
    const MAX_SIMPLE_SIZE = 4 * 1024 * 1024;

    let uploadRes: Response;

    if (buffer.length <= MAX_SIMPLE_SIZE) {
      // Simple PUT upload
      const uploadPath = `/me/drive/items/${targetFolderId}:/${encodeURIComponent(fileName)}:/content`;
      uploadRes = await this.graphRequest(accessToken, uploadPath, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: buffer as unknown as BodyInit,
      });
    } else {
      // Create upload session for large files
      const sessionPath = `/me/drive/items/${targetFolderId}:/${encodeURIComponent(fileName)}:/createUploadSession`;
      const sessionRes = await this.graphRequest(accessToken, sessionPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
            name: fileName,
          },
        }),
      });

      if (!sessionRes.ok) {
        const errText = await sessionRes.text();
        throw new Error(`Failed to create OneDrive upload session: ${errText}`);
      }

      const sessionData = await sessionRes.json();
      const uploadUrl = sessionData.uploadUrl;

      // Upload the entire file in one request (up to 60MB)
      uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes 0-${buffer.length - 1}/${buffer.length}`,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer as unknown as BodyInit,
      });
    }

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`OneDrive file upload failed: ${errText}`);
    }

    const fileData = await uploadRes.json();

    return {
      cloudFileId: fileData.id,
      fileName: fileData.name || fileName,
      fileUrl: fileData.webUrl || '',
      webViewLink: fileData.webUrl || undefined,
      folderPath,
      fileSize: fileData.size || buffer.length,
    };
  }

  /**
   * List files in the user's app folder.
   */
  async listFiles(accessToken: string): Promise<CloudFileMetadata[]> {
    // Check if root folder exists
    const rootCheckRes = await this.graphRequest(
      accessToken,
      `/me/drive/root:/${ROOT_FOLDER_NAME}`
    );

    if (!rootCheckRes.ok) {
      return []; // No root folder means no files yet
    }

    const rootFolder = await rootCheckRes.json();
    const rootFolderId = rootFolder.id;

    // List subfolders
    const subFolderRes = await this.graphRequest(
      accessToken,
      `/me/drive/items/${rootFolderId}/children`
    );

    if (!subFolderRes.ok) {
      return [];
    }

    const subFolders = await subFolderRes.json();
    const allFiles: CloudFileMetadata[] = [];

    for (const folder of subFolders.value || []) {
      if (!folder.folder) continue; // Skip non-folder items

      const filesRes = await this.graphRequest(
        accessToken,
        `/me/drive/items/${folder.id}/children?$orderby=createdDateTime desc`
      );

      if (!filesRes.ok) continue;

      const filesData = await filesRes.json();
      for (const file of filesData.value || []) {
        if (file.folder) continue; // Skip sub-subfolders

        allFiles.push({
          cloudFileId: file.id,
          fileName: file.name || 'Unknown',
          mimeType: file.file?.mimeType || 'application/octet-stream',
          fileSize: file.size || 0,
          webViewLink: file.webUrl || undefined,
          folderPath: `${ROOT_FOLDER_NAME} / ${folder.name}`,
          createdTime: file.createdDateTime || undefined,
          modifiedTime: file.lastModifiedDateTime || undefined,
        });
      }
    }

    return allFiles;
  }

  /**
   * Download a file from the user's OneDrive.
   */
  async downloadFile(
    accessToken: string,
    cloudFileId: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    // Get file metadata
    const metaRes = await this.graphRequest(
      accessToken,
      `/me/drive/items/${cloudFileId}`
    );

    if (!metaRes.ok) {
      throw new Error('Failed to retrieve OneDrive file metadata');
    }

    const meta = await metaRes.json();

    // Download file content
    const contentRes = await this.graphRequest(
      accessToken,
      `/me/drive/items/${cloudFileId}/content`
    );

    if (!contentRes.ok) {
      throw new Error('Failed to download file from OneDrive');
    }

    const arrayBuffer = await contentRes.arrayBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: meta.file?.mimeType || 'application/octet-stream',
      fileName: meta.name || 'download',
    };
  }

  /**
   * Delete a file from the user's OneDrive.
   */
  async deleteFile(accessToken: string, cloudFileId: string): Promise<void> {
    const res = await this.graphRequest(
      accessToken,
      `/me/drive/items/${cloudFileId}`,
      { method: 'DELETE' }
    );

    if (!res.ok && res.status !== 404) {
      const errText = await res.text();
      throw new Error(`Failed to delete OneDrive file: ${errText}`);
    }
  }
}

/** Singleton instance */
export const oneDriveProvider = new OneDriveProvider();
