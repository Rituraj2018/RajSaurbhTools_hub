import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, LogOut, Loader2, Folder } from 'lucide-react';
import {
  hasValidDriveToken,
  requestDriveAccessToken,
  clearDriveAccessToken,
} from '../../services/googleDriveService';
import { Button } from '../common/Button';

export interface GoogleDriveConnectProps {
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export const GoogleDriveConnect: React.FC<GoogleDriveConnectProps> = ({
  className = '',
  onConnectionChange,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connected = hasValidDriveToken();
    setIsConnected(connected);
  }, []);

  const handleConnect = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      await requestDriveAccessToken();
      setIsConnected(true);
      onConnectionChange?.(true);
    } catch (err: any) {
      console.error('[GoogleDriveConnect] Connect failed:', err);
      setError(err?.message || 'Google Drive connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearDriveAccessToken();
    setIsConnected(false);
    onConnectionChange?.(false);
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Google Drive Integration</h4>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Not Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Folder className="w-3 h-3 text-slate-500" />
            <span>Saves directly to your Drive: <strong className="text-slate-300">Vikas Tool Hub/</strong></span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
            leftIcon={
              isConnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )
            }
          >
            {isConnecting ? 'Connecting...' : 'Connect Drive'}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-rose-400 w-full mt-1">{error}</p>}
    </div>
  );
};
