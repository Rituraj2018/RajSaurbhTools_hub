import { config } from '../config/env';

/**
 * Service for Google Drive integration configuration and status checks.
 * Note: File uploads occur directly from the client browser to Google Drive,
 * ensuring zero permanent storage on our servers.
 */
export class GoogleDriveService {
  /**
   * Check if Google Drive integration has an active OAuth Client ID configured.
   */
  public static isConfigured(): boolean {
    return Boolean(config.googleDrive.clientId && config.googleDrive.clientId.trim().length > 0);
  }

  /**
   * Get public configuration required for client-side OAuth flow.
   * Never exposes client secrets or private credentials.
   */
  public static getPublicConfig(): { clientId: string; isConfigured: boolean } {
    return {
      clientId: config.googleDrive.clientId || '',
      isConfigured: this.isConfigured(),
    };
  }
}
