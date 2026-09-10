import { axiosClient } from './axiosClient';

/**
 * Real Google Drive storage quota returned from Google Drive API about.get
 */
export interface DriveStorageQuota {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  usagePercentage: number;
}

/**
 * Format bytes into human-readable MB / GB / TB string
 */
export const formatStorageBytes = (bytes: number = 0): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val >= 10 || i === 0 ? val.toFixed(1) : val.toFixed(2)} ${sizes[i]}`;
};

/**
 * Cloud provider status for a single provider
 */
export interface CloudProviderStatus {
  isConnected: boolean;
  isConfigured: boolean;
  connectionStatus?: string;
  providerEmail?: string;
  connectedAt?: string;
  storageQuota?: DriveStorageQuota | null;
}

/**
 * Full cloud status response
 */
export interface CloudStatusResponse {
  hasActiveConnection: boolean;
  activeProvider: 'google_drive' | 'onedrive' | null;
  providers: {
    google_drive: CloudProviderStatus;
    onedrive: CloudProviderStatus;
  };
}

/**
 * Dedicated Google Drive storage response
 */
export interface DriveStorageResponse {
  isConnected: boolean;
  provider?: string;
  providerEmail?: string;
  storageQuota?: DriveStorageQuota | null;
  error?: string;
}

/**
 * Cloud storage API client.
 * Handles cloud connection status, OAuth flows, storage quota, and disconnect.
 */
export const cloudApi = {
  /**
   * Get the cloud connection status for the authenticated user
   */
  getStatus: async (): Promise<CloudStatusResponse> => {
    const response = await axiosClient.get<{ success: boolean; data: CloudStatusResponse }>(
      '/cloud/status'
    );
    return response.data.data;
  },

  /**
   * Get dedicated Google Drive live storage quota
   */
  getDriveStorage: async (): Promise<DriveStorageResponse> => {
    const response = await axiosClient.get<{ success: boolean; data: DriveStorageResponse }>(
      '/cloud/drive-storage'
    );
    return response.data.data;
  },

  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await axiosClient.get<{ success: boolean; data: { authUrl: string } }>(
      '/cloud/google/auth-url'
    );
    return response.data.data.authUrl;
  },

  /**
   * Get Microsoft OAuth authorization URL
   */
  getMicrosoftAuthUrl: async (): Promise<string> => {
    const response = await axiosClient.get<{ success: boolean; data: { authUrl: string } }>(
      '/cloud/microsoft/auth-url'
    );
    return response.data.data.authUrl;
  },

  /**
   * Disconnect a cloud provider
   */
  disconnect: async (provider: 'google_drive' | 'onedrive'): Promise<void> => {
    await axiosClient.post('/cloud/disconnect', { provider });
  },
};

