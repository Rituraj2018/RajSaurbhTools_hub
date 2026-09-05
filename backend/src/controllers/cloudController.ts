import { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { encryptToken, decryptToken } from '../utils/tokenEncryption';
import { CloudConnection, CloudProvider } from '../models/CloudConnection';
import { googleDriveProvider } from '../services/googleDriveProvider';
import { oneDriveProvider } from '../services/oneDriveProvider';
import { ICloudStorageProvider } from '../services/cloudStorageProvider';
import { config } from '../config/env';

/**
 * Get the provider instance by name.
 */
const getProvider = (provider: CloudProvider): ICloudStorageProvider => {
  switch (provider) {
    case 'google_drive':
      return googleDriveProvider;
    case 'onedrive':
      return oneDriveProvider;
    default:
      throw new ApiError(400, `Unsupported cloud provider: ${provider}`);
  }
};

/**
 * @desc    Get cloud connection status for the authenticated user
 * @route   GET /api/cloud/status
 * @access  Private
 */
export const getCloudStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const connections = await CloudConnection.find({
    user: req.user._id,
    connectionStatus: { $in: ['connected', 'expired'] },
  });

  const providers: Record<string, any> = {
    google_drive: {
      isConnected: false,
      isConfigured: config.googleDrive.isConfigured,
    },
    onedrive: {
      isConnected: false,
      isConfigured: config.microsoft.isConfigured,
    },
  };

  for (const conn of connections) {
    providers[conn.provider] = {
      isConnected: conn.connectionStatus === 'connected',
      connectionStatus: conn.connectionStatus,
      providerEmail: conn.providerEmail || undefined,
      connectedAt: conn.connectedAt,
      isConfigured: true,
    };
  }

  // Determine the active provider (first connected one)
  const activeProvider = connections.find((c) => c.connectionStatus === 'connected');

  res.status(200).json({
    success: true,
    message: 'Cloud connection status retrieved',
    data: {
      hasActiveConnection: !!activeProvider,
      activeProvider: activeProvider?.provider || null,
      providers,
    },
  });
});

/**
 * @desc    Get Google OAuth authorization URL
 * @route   GET /api/cloud/google/auth-url
 * @access  Private
 */
export const getGoogleAuthUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!config.googleDrive.isConfigured) {
    throw new ApiError(503, 'Google Drive integration is not configured on this server. Please add GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in backend/.env');
  }

  // Generate a CSRF-safe state parameter that encodes the user ID
  const statePayload = JSON.stringify({
    userId: req.user._id.toString(),
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  const state = Buffer.from(statePayload).toString('base64url');

  const authUrl = googleDriveProvider.getAuthUrl(state);

  res.status(200).json({
    success: true,
    message: 'Google OAuth URL generated',
    data: { authUrl },
  });
});

/**
 * @desc    Handle Google OAuth callback — exchange code for tokens
 * @route   GET /api/cloud/google/callback
 * @access  Public (redirect from Google)
 */
export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { code, state, error } = req.query;

  const clientUrl = config.clientUrl || 'http://localhost:5173';

  if (error) {
    res.redirect(`${clientUrl}/cloud/callback?error=${encodeURIComponent(String(error))}&provider=google_drive`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${clientUrl}/cloud/callback?error=missing_params&provider=google_drive`);
    return;
  }

  try {
    // Decode state to get userId
    const statePayload = JSON.parse(Buffer.from(String(state), 'base64url').toString());
    const userId = statePayload.userId;

    if (!userId) {
      res.redirect(`${clientUrl}/cloud/callback?error=invalid_state&provider=google_drive`);
      return;
    }

    // Exchange code for tokens
    const result = await googleDriveProvider.exchangeCodeForTokens(String(code));

    // Store encrypted tokens in MongoDB
    await CloudConnection.findOneAndUpdate(
      { user: userId, provider: 'google_drive' },
      {
        user: userId,
        provider: 'google_drive',
        providerAccountId: result.providerAccountId,
        providerEmail: result.providerEmail,
        encryptedAccessToken: encryptToken(result.accessToken),
        encryptedRefreshToken: encryptToken(result.refreshToken),
        tokenExpiresAt: new Date(Date.now() + result.expiresInSeconds * 1000),
        connectionStatus: 'connected',
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.redirect(`${clientUrl}/cloud/callback?success=true&provider=google_drive`);
  } catch (err: any) {
    console.error('[CloudController] Google callback error:', err);
    res.redirect(
      `${clientUrl}/cloud/callback?error=${encodeURIComponent(err?.message || 'connection_failed')}&provider=google_drive`
    );
  }
});

/**
 * @desc    Get Microsoft OAuth authorization URL
 * @route   GET /api/cloud/microsoft/auth-url
 * @access  Private
 */
export const getMicrosoftAuthUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!config.microsoft.isConfigured) {
    throw new ApiError(503, 'Microsoft OneDrive integration is not configured on this server. Please add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in backend/.env');
  }

  const statePayload = JSON.stringify({
    userId: req.user._id.toString(),
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  const state = Buffer.from(statePayload).toString('base64url');

  const authUrl = oneDriveProvider.getAuthUrl(state);

  res.status(200).json({
    success: true,
    message: 'Microsoft OAuth URL generated',
    data: { authUrl },
  });
});

/**
 * @desc    Handle Microsoft OAuth callback — exchange code for tokens
 * @route   GET /api/cloud/microsoft/callback
 * @access  Public (redirect from Microsoft)
 */
export const handleMicrosoftCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { code, state, error, error_description } = req.query;

  const clientUrl = config.clientUrl || 'http://localhost:5173';

  if (error) {
    const msg = error_description || error;
    res.redirect(`${clientUrl}/cloud/callback?error=${encodeURIComponent(String(msg))}&provider=onedrive`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${clientUrl}/cloud/callback?error=missing_params&provider=onedrive`);
    return;
  }

  try {
    const statePayload = JSON.parse(Buffer.from(String(state), 'base64url').toString());
    const userId = statePayload.userId;

    if (!userId) {
      res.redirect(`${clientUrl}/cloud/callback?error=invalid_state&provider=onedrive`);
      return;
    }

    const result = await oneDriveProvider.exchangeCodeForTokens(String(code));

    await CloudConnection.findOneAndUpdate(
      { user: userId, provider: 'onedrive' },
      {
        user: userId,
        provider: 'onedrive',
        providerAccountId: result.providerAccountId,
        providerEmail: result.providerEmail,
        encryptedAccessToken: encryptToken(result.accessToken),
        encryptedRefreshToken: encryptToken(result.refreshToken),
        tokenExpiresAt: new Date(Date.now() + result.expiresInSeconds * 1000),
        connectionStatus: 'connected',
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.redirect(`${clientUrl}/cloud/callback?success=true&provider=onedrive`);
  } catch (err: any) {
    console.error('[CloudController] Microsoft callback error:', err);
    res.redirect(
      `${clientUrl}/cloud/callback?error=${encodeURIComponent(err?.message || 'connection_failed')}&provider=onedrive`
    );
  }
});

/**
 * @desc    Disconnect a cloud provider for the authenticated user
 * @route   POST /api/cloud/disconnect
 * @access  Private
 */
export const disconnectProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { provider } = req.body;
  if (!provider || !['google_drive', 'onedrive'].includes(provider)) {
    throw new ApiError(400, 'Invalid provider. Must be "google_drive" or "onedrive".');
  }

  const connection = await CloudConnection.findOne({
    user: req.user._id,
    provider,
  }).select('+encryptedAccessToken');

  if (!connection) {
    throw new ApiError(404, 'No connection found for the specified provider');
  }

  // Best-effort token revocation
  try {
    const providerInstance = getProvider(provider as CloudProvider);
    if (providerInstance.revokeToken && connection.encryptedAccessToken) {
      const accessToken = decryptToken(connection.encryptedAccessToken);
      await providerInstance.revokeToken(accessToken);
    }
  } catch (err) {
    console.warn('[CloudController] Token revocation failed (non-fatal):', err);
  }

  // Remove the connection record
  await CloudConnection.deleteOne({ _id: connection._id });

  res.status(200).json({
    success: true,
    message: `${provider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive'} disconnected successfully`,
    data: { provider },
  });
});

/**
 * Helper: Get a valid access token for the user's connected provider.
 * Automatically refreshes expired tokens.
 * Used by the file controller for cloud operations.
 */
export const getValidAccessToken = async (
  userId: string,
  provider: CloudProvider
): Promise<string> => {
  const connection = await CloudConnection.findOne({
    user: userId,
    provider,
    connectionStatus: { $in: ['connected', 'expired'] },
  }).select('+encryptedAccessToken +encryptedRefreshToken');

  if (!connection) {
    throw new ApiError(400, 'No cloud storage connected. Please link your personal cloud storage.');
  }

  // Check if token is still valid (with 5-minute buffer)
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (connection.tokenExpiresAt.getTime() > now.getTime() + bufferMs) {
    // Token is still valid
    return decryptToken(connection.encryptedAccessToken);
  }

  // Token expired — try to refresh
  try {
    const providerInstance = getProvider(provider);
    const refreshToken = decryptToken(connection.encryptedRefreshToken);
    const result = await providerInstance.refreshAccessToken(refreshToken);

    // Update stored tokens
    connection.encryptedAccessToken = encryptToken(result.accessToken);
    connection.tokenExpiresAt = new Date(Date.now() + result.expiresInSeconds * 1000);
    connection.connectionStatus = 'connected';
    await connection.save();

    return result.accessToken;
  } catch (err) {
    // Mark connection as expired
    connection.connectionStatus = 'expired';
    await connection.save();
    throw new ApiError(
      401,
      'Your cloud storage session has expired. Please reconnect your cloud storage.'
    );
  }
};

/**
 * Helper: Get the user's active cloud provider and a valid access token.
 * Returns null if no provider is connected.
 */
export const getUserCloudContext = async (
  userId: string
): Promise<{ provider: CloudProvider; accessToken: string; providerInstance: ICloudStorageProvider } | null> => {
  // Find the user's active connection
  const connection = await CloudConnection.findOne({
    user: userId,
    connectionStatus: 'connected',
  });

  if (!connection) {
    return null;
  }

  const provider = connection.provider as CloudProvider;
  const accessToken = await getValidAccessToken(userId, provider);
  const providerInstance = getProvider(provider);

  return { provider, accessToken, providerInstance };
};
