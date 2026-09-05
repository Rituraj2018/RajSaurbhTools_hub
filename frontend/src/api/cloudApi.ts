import { axiosClient } from './axiosClient';

/**
 * Cloud provider status for a single provider
 */
export interface CloudProviderStatus {
  isConnected: boolean;
  isConfigured: boolean;
  connectionStatus?: string;
  providerEmail?: string;
  connectedAt?: string;
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
 * Cloud storage API client.
 * Handles cloud connection status, OAuth flows, and disconnect.
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
