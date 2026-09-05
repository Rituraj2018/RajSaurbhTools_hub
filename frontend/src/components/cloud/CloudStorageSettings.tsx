import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  CheckCircle2,
  LogOut,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '../common/Button';
import { cloudApi, CloudStatusResponse } from '../../api/cloudApi';
import { GoogleDriveIcon } from './CloudSaveModal';
import { OneDriveIcon } from './OneDriveIcon';

export interface CloudStorageSettingsProps {
  className?: string;
  /** Called when connection status changes so parent can refresh */
  onConnectionChange?: () => void;
}

/**
 * Compact cloud storage connection panel for the MyFilesPage.
 * Shows connection status for Google Drive and OneDrive with connect/disconnect actions.
 * Uses existing project styling patterns (Button, card patterns).
 */
export const CloudStorageSettings: React.FC<CloudStorageSettingsProps> = ({
  className = '',
  onConnectionChange,
}) => {
  const [status, setStatus] = useState<CloudStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudApi.getStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('[CloudStorageSettings] Failed to load status:', err);
      // Suppress noisy auth errors during initial status fetch
      if (
        err?.statusCode !== 401 &&
        !err?.message?.includes('Authentication') &&
        !err?.message?.includes('User account')
      ) {
        setError(err?.message || 'Failed to load cloud storage status');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CLOUD_OAUTH_CALLBACK') {
        // OAuth callback completed — reload status
        setConnectingProvider(null);
        loadStatus();
        onConnectionChange?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadStatus, onConnectionChange]);

  // Also listen for focus events (in case popup redirect doesn't send postMessage)
  useEffect(() => {
    const handleFocus = () => {
      if (connectingProvider) {
        // Small delay to let backend process the callback
        setTimeout(() => {
          setConnectingProvider(null);
          loadStatus();
          onConnectionChange?.();
        }, 1500);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [connectingProvider, loadStatus, onConnectionChange]);

  const handleConnect = async (provider: 'google_drive' | 'onedrive') => {
    try {
      setError(null);
      setConnectingProvider(provider);

      let authUrl: string;
      if (provider === 'google_drive') {
        authUrl = await cloudApi.getGoogleAuthUrl();
      } else {
        authUrl = await cloudApi.getMicrosoftAuthUrl();
      }

      // Open OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        authUrl,
        'cloud_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    } catch (err: any) {
      console.error('[CloudStorageSettings] Connect error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to initiate cloud connection');
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: 'google_drive' | 'onedrive') => {
    try {
      setError(null);
      setDisconnectingProvider(provider);
      await cloudApi.disconnect(provider);
      await loadStatus();
      onConnectionChange?.();
    } catch (err: any) {
      console.error('[CloudStorageSettings] Disconnect error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to disconnect cloud storage');
    } finally {
      setDisconnectingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="w-40 h-4 rounded bg-slate-800" />
            <div className="w-64 h-3 rounded bg-slate-800/60" />
          </div>
        </div>
      </div>
    );
  }

  const googleStatus = status?.providers?.google_drive;
  const onedriveStatus = status?.providers?.onedrive;
  const hasAnyConnection = status?.hasActiveConnection;

  return (
    <div className={`rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Personal Cloud Storage</h4>
            <p className="text-[10px] text-slate-400">
              {hasAnyConnection
                ? 'Your files are stored in your personal cloud'
                : 'Connect to store files in your personal cloud'}
            </p>
          </div>
        </div>

        {hasAnyConnection && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      {/* Provider Cards */}
      <div className="p-3 space-y-2">
        {/* Google Drive */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
              <GoogleDriveIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">Google Drive</p>
              {googleStatus?.isConnected ? (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  {googleStatus.providerEmail || 'Connected'}
                </p>
              ) : (
                <p className="text-[10px] text-slate-500">Not connected</p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {googleStatus?.isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect('google_drive')}
                disabled={disconnectingProvider === 'google_drive'}
                leftIcon={
                  disconnectingProvider === 'google_drive' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )
                }
              >
                {disconnectingProvider === 'google_drive' ? '...' : 'Disconnect'}
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => handleConnect('google_drive')}
                disabled={connectingProvider === 'google_drive'}
                leftIcon={
                  connectingProvider === 'google_drive' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LinkIcon className="w-3 h-3" />
                  )
                }
              >
                {connectingProvider === 'google_drive' ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>

        {/* OneDrive */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
              <OneDriveIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">Microsoft OneDrive</p>
              {onedriveStatus?.isConnected ? (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  {onedriveStatus.providerEmail || 'Connected'}
                </p>
              ) : (
                <p className="text-[10px] text-slate-500">Not connected</p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {onedriveStatus?.isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect('onedrive')}
                disabled={disconnectingProvider === 'onedrive'}
                leftIcon={
                  disconnectingProvider === 'onedrive' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )
                }
              >
                {disconnectingProvider === 'onedrive' ? '...' : 'Disconnect'}
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => handleConnect('onedrive')}
                disabled={connectingProvider === 'onedrive'}
                leftIcon={
                  connectingProvider === 'onedrive' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LinkIcon className="w-3 h-3" />
                  )
                }
              >
                {connectingProvider === 'onedrive' ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
