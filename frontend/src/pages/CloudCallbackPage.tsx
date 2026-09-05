import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * CloudCallbackPage — Handles the OAuth redirect inside the popup window.
 *
 * The backend redirects the OAuth popup to /cloud/callback with query params:
 *   ?success=true&provider=google_drive
 *   ?error=<message>&provider=onedrive
 *
 * This page:
 * 1. Reads the query params
 * 2. Sends a postMessage to the opener window (CloudStorageSettings listens for CLOUD_OAUTH_CALLBACK)
 * 3. Auto-closes the popup after a short delay
 */
export const CloudCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const provider = searchParams.get('provider') || '';

  const providerLabel =
    provider === 'google_drive'
      ? 'Google Drive'
      : provider === 'onedrive'
        ? 'Microsoft OneDrive'
        : 'Cloud Storage';

  useEffect(() => {
    if (success === 'true') {
      setStatus('success');
      setMessage(`${providerLabel} connected successfully!`);
    } else if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
    } else {
      setStatus('error');
      setMessage('Unknown callback state.');
    }

    // Notify the opener window (CloudStorageSettings listens for this)
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: 'CLOUD_OAUTH_CALLBACK',
            success: success === 'true',
            provider,
            error: error || null,
          },
          window.location.origin
        );
      }
    } catch (err) {
      console.warn('[CloudCallback] Failed to send postMessage to opener:', err);
    }

    // Auto-close the popup after a short delay so the user sees the result
    const timer = setTimeout(() => {
      try {
        window.close();
      } catch {
        // If window.close() is blocked, the user can close manually
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [success, error, provider, providerLabel]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <p className="text-sm font-bold text-white">Processing connection...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">{message}</p>
              <p className="text-xs text-slate-400 mt-1.5">
                This window will close automatically...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-300">Connection Failed</p>
              <p className="text-xs text-slate-400 mt-1.5">{message}</p>
              <p className="text-[11px] text-slate-500 mt-3">
                You can close this window and try again.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
