import { axiosClient } from '../api/axiosClient';

/**
 * Interface representing metadata for a file to be saved to Google Drive.
 */
export interface DriveUploadOptions {
  blob: Blob;
  fileName: string;
  mimeType: string;
  category?: 'Images' | 'PDFs' | 'Documents';
}

/**
 * Upload result returned after saving to Google Drive.
 */
export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
  folderPath: string;
}

/**
 * Ephemeral in-memory token state.
 * Never persisted in localStorage, sessionStorage, or databases.
 */
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number = 0;
let cachedClientId: string | null = null;

// The minimum permission required: only access files created/opened by this app
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/**
 * Dynamically ensures the official Google Identity Services client script is loaded.
 */
export const loadGoogleGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error(`Failed to load Google Identity Services: ${err}`));
    document.head.appendChild(script);
  });
};

/**
 * Retrieves the Google OAuth Client ID from frontend environment or backend config.
 */
export const getGoogleClientId = async (): Promise<string> => {
  if (cachedClientId) return cachedClientId;

  // 1. Check frontend Vite environment variable
  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envId && typeof envId === 'string' && envId.trim().length > 0) {
    cachedClientId = envId.trim();
    return cachedClientId;
  }

  // 2. Fetch from backend config endpoint
  try {
    const res = await axiosClient.get('/drive/config');
    const backendId = res.data?.data?.clientId;
    if (backendId && typeof backendId === 'string' && backendId.trim().length > 0) {
      cachedClientId = backendId.trim();
      return cachedClientId;
    }
  } catch (err) {
    console.warn('[GoogleDrive] Could not fetch client ID from backend:', err);
  }

  return '';
};

/**
 * Checks if the current in-memory access token is valid and unexpired.
 */
export const hasValidDriveToken = (): boolean => {
  if (!inMemoryAccessToken) return false;
  // Give a 60-second grace window before actual expiration
  return Date.now() < tokenExpiresAt - 60000;
};

/**
 * Stores the ephemeral access token in memory with an expiration timestamp.
 */
export const setDriveAccessToken = (token: string, expiresInSeconds: number = 3500): void => {
  inMemoryAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
};

/**
 * Clears the ephemeral access token from memory.
 */
export const clearDriveAccessToken = (): void => {
  inMemoryAccessToken = null;
  tokenExpiresAt = 0;
};

/**
 * Requests a Google Drive OAuth access token via Google Identity Services token client.
 */
export const requestDriveAccessToken = async (): Promise<string> => {
  if (hasValidDriveToken() && inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  const clientId = await getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment.'
    );
  }

  await loadGoogleGsiScript();

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services client is unavailable in this browser.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_SCOPE,
        prompt: '',
        callback: (response: any) => {
          if (response.error) {
            if (response.error === 'access_denied') {
              reject(new Error('Google Drive permission was denied. Please grant permission to save files.'));
            } else if (response.error === 'popup_closed_by_user' || response.error === 'user_logged_out') {
              reject(new Error('Google authorization was cancelled.'));
            } else {
              reject(new Error(`Google authorization error: ${response.error}`));
            }
            return;
          }

          if (response.access_token) {
            const expiresIn = Number(response.expires_in) || 3599;
            setDriveAccessToken(response.access_token, expiresIn);
            resolve(response.access_token);
          } else {
            reject(new Error('Google Drive connection failed: No access token received.'));
          }
        },
        error_callback: (err: any) => {
          if (err?.type === 'popup_closed' || err?.message?.includes('closed')) {
            reject(new Error('Google authorization was cancelled.'));
          } else {
            reject(new Error(err?.message || 'Google authorization failed.'));
          }
        },
      });

      // Launch token consent / selection popup
      tokenClient.requestAccessToken();
    } catch (err: any) {
      reject(new Error(err?.message || 'Failed to initialize Google Drive authorization.'));
    }
  });
};

/**
 * Helper to find or create a folder in the user's Google Drive.
 */
const findOrCreateFolder = async (
  token: string,
  folderName: string,
  parentId?: string
): Promise<string> => {
  const parentQuery = parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentQuery}`;

  // 1. Search for existing folder
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('[GoogleDrive] Folder search failed:', errText);
    throw new Error('Unable to access Google Drive folders.');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create folder if it doesn't exist
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('[GoogleDrive] Folder creation failed:', errText);
    throw new Error(`Unable to create Google Drive folder "${folderName}".`);
  }

  const createData = await createRes.json();
  return createData.id;
};

/**
 * Ensures the standard folder structure exists in user's Drive:
 * Vikas Tool Hub/
 *    ├── Images/
 *    ├── PDFs/
 *    └── Documents/
 */
export const ensureDriveFolderHierarchy = async (
  token: string,
  category: 'Images' | 'PDFs' | 'Documents' = 'Images'
): Promise<{ rootFolderId: string; targetFolderId: string; folderPath: string }> => {
  const rootFolderName = 'Vikas Tool Hub';
  const rootFolderId = await findOrCreateFolder(token, rootFolderName);
  const targetFolderId = await findOrCreateFolder(token, category, rootFolderId);

  return {
    rootFolderId,
    targetFolderId,
    folderPath: `${rootFolderName} / ${category}`,
  };
};

/**
 * Directly uploads a Blob from browser memory into the user's personal Google Drive.
 * Zero files are sent to or stored on our backend or Cloudinary.
 */
export const uploadBlobToGoogleDrive = async (
  options: DriveUploadOptions,
  onProgress?: (statusText: string) => void
): Promise<DriveUploadResult> => {
  const { blob, fileName, mimeType, category = 'Images' } = options;

  onProgress?.('Connecting to Google Drive...');
  const token = await requestDriveAccessToken();

  onProgress?.('Preparing Google Drive folder...');
  const { targetFolderId, folderPath } = await ensureDriveFolderHierarchy(token, category);

  onProgress?.('Saving file to your Google Drive...');

  // Build multipart/related request payload
  const boundary = `-------VikasToolHub${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType || 'application/octet-stream',
    parents: [targetFolderId],
    description: 'Saved privately from Vikas Tool Hub Pro',
  };

  // Convert blob to ArrayBuffer for binary transmission
  const fileArrayBuffer = await blob.arrayBuffer();

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}\r\n`;
  const mediaHeader = `${delimiter}Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(mediaHeader);
  const closeBytes = encoder.encode(closeDelimiter);

  // Combine into single Uint8Array payload
  const totalLength =
    metadataBytes.length + mediaHeaderBytes.length + fileArrayBuffer.byteLength + closeBytes.length;
  const combinedPayload = new Uint8Array(totalLength);

  let offset = 0;
  combinedPayload.set(metadataBytes, offset);
  offset += metadataBytes.length;
  combinedPayload.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.length;
  combinedPayload.set(new Uint8Array(fileArrayBuffer), offset);
  offset += fileArrayBuffer.byteLength;
  combinedPayload.set(closeBytes, offset);

  // Directly perform multipart upload to Google Drive REST API
  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: combinedPayload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[GoogleDrive] Upload failed:', response.status, errorText);

    if (response.status === 401) {
      clearDriveAccessToken();
      throw new Error('Google Drive session expired. Please try again.');
    }
    if (response.status === 403) {
      throw new Error('Google Drive permission was not granted or storage quota exceeded.');
    }

    throw new Error('Unable to save the file. Please try again.');
  }

  const result = await response.json();
  onProgress?.('✓ File saved successfully');

  return {
    id: result.id,
    name: result.name || fileName,
    webViewLink: result.webViewLink,
    folderPath,
  };
};
