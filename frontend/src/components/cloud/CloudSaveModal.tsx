import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Folder,
  FileCheck,
  LogOut,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  DriveUploadOptions,
  DriveUploadResult,
  hasValidDriveToken,
  requestDriveAccessToken,
  uploadBlobToGoogleDrive,
  clearDriveAccessToken,
} from '../../services/googleDriveService';

/**
 * Official Google Drive 3-color brand icon SVG
 */
export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 87.3 78" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
);

export type ModalStep = 'initial' | 'connecting' | 'saving' | 'success' | 'error';

export interface CloudSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetFile: () =>
    | Promise<DriveUploadOptions | null>
    | DriveUploadOptions
    | null;
}

export const CloudSaveModal: React.FC<CloudSaveModalProps> = ({
  isOpen,
  onClose,
  onGetFile,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [step, setStep] = useState<ModalStep>('initial');
  const [statusText, setStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DriveUploadResult | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; category: string }>({
    name: 'Generated File',
    category: 'Documents',
  });

  // Reset or inspect connection status when modal opens
  useEffect(() => {
    if (isOpen) {
      const connected = hasValidDriveToken();
      setIsConnected(connected);
      setStep('initial');
      setErrorMessage(null);
      setResult(null);
      setStatusText('');

      // Preview file metadata if ready
      try {
        const maybePromise = onGetFile();
        if (maybePromise instanceof Promise) {
          maybePromise.then((file) => {
            if (file) {
              setFileMeta({
                name: file.fileName || 'Generated File',
                category: file.category || 'Documents',
              });
            }
          }).catch(() => {});
        } else if (maybePromise) {
          setFileMeta({
            name: maybePromise.fileName || 'Generated File',
            category: maybePromise.category || 'Documents',
          });
        }
      } catch {
        // will be handled during actual save
      }
    }
  }, [isOpen]);

  // Handle "Connect Google Drive"
  const handleConnect = async () => {
    try {
      setErrorMessage(null);
      setStep('connecting');
      setStatusText('Connecting to Google Drive...');
      await requestDriveAccessToken();
      setIsConnected(true);
      setStep('initial');
    } catch (err: any) {
      console.error('[CloudSaveModal] Connect failed:', err);
      setErrorMessage(
        err?.message ||
          'Google Drive connection was cancelled or could not be established.'
      );
      setStep('error');
    }
  };

  // Handle "Save File"
  const handleSaveFile = async () => {
    try {
      setErrorMessage(null);
      setStep('saving');
      setStatusText('Preparing file...');

      const fileOptions = await onGetFile();
      if (!fileOptions || !fileOptions.blob) {
        throw new Error('No generated file is ready to be saved.');
      }

      setFileMeta({
        name: fileOptions.fileName || 'Generated File',
        category: fileOptions.category || 'Documents',
      });

      setStatusText('Saving to Google Drive...');
      const uploadResult = await uploadBlobToGoogleDrive(fileOptions, (text) => {
        setStatusText(text);
      });

      setResult(uploadResult);
      setStep('success');
    } catch (err: any) {
      console.error('[CloudSaveModal] Save failed:', err);
      const msg =
        err?.message ||
        'Unable to save to Google Drive. Please check your connection and try again.';
      setErrorMessage(msg);
      setStep('error');
    }
  };

  const handleDisconnect = () => {
    clearDriveAccessToken();
    setIsConnected(false);
  };

  const handleClose = () => {
    if (step === 'saving') return; // prevent closing during upload
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showCloseButton={step !== 'saving'}
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-inner">
            <GoogleDriveIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Save to Google Drive</h3>
            <p className="text-[11px] text-slate-400">Direct Personal Cloud Storage</p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Zero server storage • 100% private</span>
          </div>

          <div className="flex items-center gap-2">
            {step === 'error' ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={isConnected ? handleSaveFile : handleConnect}
                >
                  Try Again
                </Button>
              </>
            ) : step === 'success' ? (
              <Button variant="primary" size="sm" onClick={handleClose}>
                Done
              </Button>
            ) : step === 'saving' || step === 'connecting' ? (
              <Button variant="ghost" size="sm" disabled>
                Processing...
              </Button>
            ) : isConnected ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSaveFile}
                  leftIcon={<GoogleDriveIcon className="w-4 h-4" />}
                >
                  Save File
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleConnect}
                  leftIcon={<GoogleDriveIcon className="w-4 h-4" />}
                >
                  Connect Google Drive
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        {/* Destination / Target File Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{fileMeta.name}</p>
              <p className="text-[11px] text-slate-400 truncate">
                Target Folder: <span className="text-slate-300 font-medium">Vikas Tool Hub / {fileMeta.category}</span>
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          )}
        </div>

        {/* ── STATE 1: NOT CONNECTED (Requirement 4) ── */}
        {step === 'initial' && !isConnected && (
          <div className="flex flex-col items-center justify-center py-6 px-3 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-lg shadow-blue-500/5">
              <GoogleDriveIcon className="w-10 h-10" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-sm font-bold text-white">Connect Your Google Drive</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Connect your Google account to save your generated document directly to your personal Google Drive storage.
              </p>
            </div>
            <Button
              variant="gradient"
              size="md"
              onClick={handleConnect}
              className="w-full max-w-xs justify-center shadow-lg shadow-blue-600/20"
              leftIcon={<GoogleDriveIcon className="w-4 h-4" />}
            >
              Connect Google Drive
            </Button>
          </div>
        )}

        {/* ── STATE 2: CONNECTED (Requirement 5) ── */}
        {step === 'initial' && isConnected && (
          <div className="flex flex-col items-center justify-center py-5 px-3 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-7 h-7" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-sm font-bold text-white">Save to Google Drive</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Your Google Drive account is ready. Click below to save your file directly to your Google Drive.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <Button
                variant="gradient"
                size="md"
                onClick={handleSaveFile}
                className="w-full justify-center shadow-lg shadow-emerald-600/20"
                leftIcon={<GoogleDriveIcon className="w-4 h-4" />}
              >
                Save File
              </Button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect Google Drive</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: CONNECTING OR SAVING (Requirement 11) ── */}
        {(step === 'saving' || step === 'connecting') && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                {step === 'saving' ? 'Saving to Google Drive...' : 'Connecting to Google Drive...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {statusText || 'Please wait while we interact with your Google Drive...'}
              </p>
            </div>
          </div>
        )}

        {/* ── STATE 4: SUCCESS (Requirement 10) ── */}
        {step === 'success' && result && (
          <div className="flex flex-col items-center justify-center py-6 px-3 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">✓ File saved successfully</p>
              <p className="text-xs text-slate-300 mt-1">
                Saved into <strong className="text-white">{result.folderPath}</strong>
              </p>
            </div>

            {result.webViewLink && (
              <a
                href={result.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition-all hover:scale-105 shadow-md shadow-emerald-500/10"
              >
                <span>Open Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* ── STATE 5: ERROR (Requirement 12) ── */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-6 px-3 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="max-w-sm">
              <p className="text-sm font-bold text-rose-300">
                {errorMessage || 'Google Drive operation could not be completed.'}
              </p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Please verify that you have authorized Drive access and that your network is reachable, then try again.
              </p>
            </div>
          </div>
        )}

        {/* Technical Privacy Guarantee Notice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Security Guarantee:</strong> Your files are uploaded directly from your browser memory to your personal Google Drive. No documents are uploaded to or stored on our servers.
          </p>
        </div>
      </div>
    </Modal>
  );
};
