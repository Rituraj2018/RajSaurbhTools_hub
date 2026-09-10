/**
 * FileProtectorPage — Universal File Password Protector
 *
 * Supports: PDF (single), JPG/JPEG/PNG/WEBP (single or multi)
 *
 * All encryption is performed in the browser using AES-256-GCM + PBKDF2
 * (Web Crypto API). No file content, password, or key is ever sent to the
 * server or stored in localStorage / sessionStorage.
 *
 * History entries are recorded (tool usage metadata only — never password).
 */
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Info,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  Package,
} from 'lucide-react';
import {
  FileProtectorDropZone,
  FileProtectorPasswordPanel,
  FileProtectorRecoveryKey,
  FileProtectorActionBar,
} from '../components/fileProtector';
import {
  encryptFileBytes,
  encryptMultipleFiles,
  decryptFileBytes,
  decryptWithRecoveryKey,
  decryptMultipleFiles,
  downloadProtectedFile,
  downloadDecryptedFile,
  validatePasswords,
  isPdf,
  isImageFile,
} from '../utils/fileProtectorProcessor';
import { recordToolHistorySafely } from '../api/historyApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = 'protect' | 'unlock';

interface ProtectResult {
  containerBytes: Uint8Array;
  recoveryKey: string;
  outputName: string;
}

interface UnlockResult {
  data: Uint8Array;
  originalName: string;
  mimeType: string;
  outputFiles?: { name: string; mime: string; data: Uint8Array }[];
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export const FileProtectorPage: React.FC = () => {
  // Mode
  const [mode, setMode] = useState<Mode>('protect');

  // Files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Protect result
  const [protectResult, setProtectResult] = useState<ProtectResult | null>(null);
  const [recoveryKeyConfirmed, setRecoveryKeyConfirmed] = useState(false);

  // Unlock result
  const [unlockResult, setUnlockResult] = useState<UnlockResult | null>(null);

  // Validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setSelectedFiles([]);
    setPassword('');
    setConfirmPassword('');
    setRecoveryKeyInput('');
    setError(null);
    setValidationError(null);
    setProtectResult(null);
    setUnlockResult(null);
    setRecoveryKeyConfirmed(false);
  }, []);

  const handleFilesSelected = useCallback((incoming: File[]) => {
    setSelectedFiles((prev) => {
      // For unlock mode, replace
      if (mode === 'unlock') return incoming.slice(0, 1);
      // For protect mode, append images
      const prevImages = prev.filter((f) => isImageFile(f));
      const newImages = incoming.filter((f) => isImageFile(f));
      const pdfs = incoming.filter((f) => isPdf(f));
      if (pdfs.length > 0) return pdfs.slice(0, 1);
      return [...prevImages, ...newImages].slice(0, 20);
    });
    setError(null);
    setValidationError(null);
    setProtectResult(null);
    setUnlockResult(null);
  }, [mode]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---------------------------------------------------------------------------
  // Protect
  // ---------------------------------------------------------------------------

  const handleProtect = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setValidationError('Please select a file to protect.');
      return;
    }

    const passwordErr = validatePasswords(password, confirmPassword);
    if (passwordErr) {
      setValidationError(passwordErr);
      return;
    }

    setValidationError(null);
    setError(null);
    setIsProcessing(true);

    try {
      let result: ProtectResult;

      if (selectedFiles.length === 1) {
        const file = selectedFiles[0];
        const ab = await file.arrayBuffer();
        const bytes = new Uint8Array(ab);
        const encResult = await encryptFileBytes(bytes, password, file.name, file.type);
        result = {
          containerBytes: encResult.containerBytes,
          recoveryKey: encResult.recoveryKey,
          outputName: encResult.outputName,
        };
      } else {
        // Multiple images
        const encResult = await encryptMultipleFiles(selectedFiles, password);
        result = {
          containerBytes: encResult.containerBytes,
          recoveryKey: encResult.recoveryKey,
          outputName: encResult.outputName,
        };
      }

      setProtectResult(result);

      // Record history (no password, no file content)
      const primaryFile = selectedFiles[0];
      await recordToolHistorySafely({
        tool: 'file-password-protector',
        toolName: 'File Password Protector',
        inputFiles: selectedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        outputFile: { name: result.outputName },
        status: 'completed',
        metadata: {
          action: 'protect',
          fileType: isPdf(primaryFile) ? 'pdf' : 'image',
          fileCount: selectedFiles.length,
          // NOTE: password, recoveryKey, and key material are NEVER recorded here
        },
      });
    } catch (err: any) {
      setError(
        err?.message || 'Encryption failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, password, confirmPassword]);

  // ---------------------------------------------------------------------------
  // Download protected
  // ---------------------------------------------------------------------------

  const handleDownloadProtected = useCallback(() => {
    if (!protectResult) return;
    downloadProtectedFile(protectResult.containerBytes, protectResult.outputName);
  }, [protectResult]);

  // ---------------------------------------------------------------------------
  // Unlock
  // ---------------------------------------------------------------------------

  const handleUnlock = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setValidationError('Please select a protected file to unlock.');
      return;
    }

    const usingRecovery = recoveryKeyInput.trim().length > 0;

    if (!usingRecovery && !password) {
      setValidationError('Please enter your password or recovery key.');
      return;
    }

    setValidationError(null);
    setError(null);
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const ab = await file.arrayBuffer();
      const containerBytes = new Uint8Array(ab);

      let result: UnlockResult;

      if (usingRecovery) {
        // Recovery key path
        const decResult = await decryptWithRecoveryKey(containerBytes, recoveryKeyInput.trim());
        // Try to detect bundle
        if (decResult.mimeType === 'application/x-rajprotected-bundle') {
          const entries = await decryptMultipleFiles(containerBytes, recoveryKeyInput.trim());
          result = {
            data: decResult.data,
            originalName: decResult.originalName,
            mimeType: decResult.mimeType,
            outputFiles: entries,
          };
        } else {
          result = decResult;
        }
      } else {
        // Password path
        const decResult = await decryptFileBytes(containerBytes, password);
        if (decResult.mimeType === 'application/x-rajprotected-bundle') {
          const entries = await decryptMultipleFiles(containerBytes, password);
          result = {
            data: decResult.data,
            originalName: decResult.originalName,
            mimeType: decResult.mimeType,
            outputFiles: entries,
          };
        } else {
          result = decResult;
        }
      }

      setUnlockResult(result);

      // Record history (no password)
      await recordToolHistorySafely({
        tool: 'file-password-protector',
        toolName: 'File Password Protector',
        inputFiles: [{ name: file.name, size: file.size, type: file.type }],
        outputFile: {
          name: result.outputFiles
            ? `${result.outputFiles.length} files unlocked`
            : result.originalName,
        },
        status: 'completed',
        metadata: {
          action: 'unlock',
          usedRecoveryKey: usingRecovery,
          // NOTE: password and key material are NEVER recorded here
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Decryption failed. Please check your password and try again.');

      await recordToolHistorySafely({
        tool: 'file-password-protector',
        toolName: 'File Password Protector',
        inputFiles: [{ name: selectedFiles[0].name, size: selectedFiles[0].size }],
        status: 'failed',
        metadata: { action: 'unlock' },
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, password, recoveryKeyInput]);

  // ---------------------------------------------------------------------------
  // Download unlocked
  // ---------------------------------------------------------------------------

  const handleDownloadUnlocked = useCallback(() => {
    if (!unlockResult) return;

    if (unlockResult.outputFiles && unlockResult.outputFiles.length > 1) {
      // Download each file individually
      unlockResult.outputFiles.forEach((f, i) => {
        setTimeout(() => {
          downloadDecryptedFile(f.data, f.name, f.mime);
        }, i * 300);
      });
    } else if (unlockResult.outputFiles && unlockResult.outputFiles.length === 1) {
      const f = unlockResult.outputFiles[0];
      downloadDecryptedFile(f.data, f.name, f.mime);
    } else {
      downloadDecryptedFile(unlockResult.data, unlockResult.originalName, unlockResult.mimeType);
    }
  }, [unlockResult]);

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setPassword('');
    setConfirmPassword('');
    setRecoveryKeyInput('');
    setError(null);
    setValidationError(null);
    setProtectResult(null);
    setUnlockResult(null);
    setRecoveryKeyConfirmed(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const canProtect =
    selectedFiles.length > 0 &&
    password.length >= 1 &&
    !isProcessing &&
    !protectResult;

  const canUnlock =
    selectedFiles.length > 0 &&
    (password.length >= 1 || recoveryKeyInput.trim().length > 0) &&
    !isProcessing &&
    !unlockResult;

  const isMultipleImages =
    selectedFiles.length > 1 && selectedFiles.every((f) => isImageFile(f));

  const primaryFile = selectedFiles[0] ?? null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tools</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Tools</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Universal File Password Protector
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Encrypt files with AES-256-GCM · 100% browser-side · No upload required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works info strip ── */}
      <div className="flex flex-wrap gap-4">
        {[
          { icon: <Lock className="w-3.5 h-3.5 text-emerald-400" />, text: 'AES-256-GCM encryption' },
          { icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />, text: 'Password never stored' },
          { icon: <Info className="w-3.5 h-3.5 text-purple-400" />, text: 'No server upload' },
        ].map((item) => (
          <div
            key={item.text}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300"
          >
            {item.icon}
            {item.text}
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left column — File + Password */}
        <div className="lg:col-span-7 space-y-5">
          {/* File section */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              {isMultipleImages ? (
                <Package className="w-4 h-4 text-blue-400" />
              ) : primaryFile && isPdf(primaryFile) ? (
                <FileText className="w-4 h-4 text-red-400" />
              ) : (
                <ImageIcon className="w-4 h-4 text-purple-400" />
              )}
              <h2 className="text-sm font-bold text-white">
                {mode === 'protect' ? 'Select File(s) to Protect' : 'Select Protected File'}
              </h2>
            </div>

            <FileProtectorDropZone
              mode={mode}
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />

            {/* File type info */}
            {mode === 'protect' && selectedFiles.length === 0 && (
              <div className="flex items-start gap-2 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 shrink-0 mt-px text-slate-600" />
                <span>
                  Supported: PDF (single), or JPG / JPEG / PNG / WEBP (up to 20 images at once).
                  Images are bundled into a single encrypted archive.
                </span>
              </div>
            )}
          </div>

          {/* Password section */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <h2 className="text-sm font-bold text-white mb-4">
              {mode === 'protect' ? 'Set Protection Password' : 'Enter Password to Unlock'}
            </h2>
            <FileProtectorPasswordPanel
              mode={mode}
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirmPassword}
              showRecoveryKeyInput={mode === 'unlock'}
              recoveryKey={recoveryKeyInput}
              onRecoveryKeyChange={setRecoveryKeyInput}
              validationError={validationError}
            />
          </div>
        </div>

        {/* Right column — Actions + Recovery + Results */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* Action bar */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <FileProtectorActionBar
              mode={mode}
              onModeChange={handleModeChange}
              isProcessing={isProcessing}
              protectedReady={!!protectResult}
              recoveryKeyConfirmed={recoveryKeyConfirmed}
              onProtect={handleProtect}
              onDownloadProtected={handleDownloadProtected}
              unlockedReady={!!unlockResult}
              onUnlock={handleUnlock}
              onDownloadUnlocked={handleDownloadUnlocked}
              onReset={handleReset}
              canProtect={canProtect}
              canUnlock={canUnlock}
            />
          </div>

          {/* Recovery Key — shown after successful protect */}
          {protectResult && (
            <FileProtectorRecoveryKey
              recoveryKey={protectResult.recoveryKey}
              onConfirmed={setRecoveryKeyConfirmed}
            />
          )}

          {/* Unlock result summary */}
          {unlockResult && (
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-2 animate-fadeIn">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Decrypted Contents
              </h3>
              {unlockResult.outputFiles ? (
                <ul className="space-y-1">
                  {unlockResult.outputFiles.map((f) => (
                    <li key={f.name} className="flex items-center gap-2 text-xs text-slate-300">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {f.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  {isPdf({ type: unlockResult.mimeType } as File) ? (
                    <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                  {unlockResult.originalName}
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-px" />
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Supported formats info card */}
          {!protectResult && !unlockResult && (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Supported Formats</h3>
              <div className="space-y-2">
                {[
                  {
                    icon: <FileText className="w-3.5 h-3.5 text-red-400" />,
                    label: 'PDF',
                    note: 'Single file · AES-256-GCM encrypted container',
                    output: 'document_protected.pdf',
                  },
                  {
                    icon: <ImageIcon className="w-3.5 h-3.5 text-blue-400" />,
                    label: 'JPG / JPEG / PNG / WEBP',
                    note: 'Up to 20 images · Encrypted bundle',
                    output: 'photo_protected.zip',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2.5 text-[11px]">
                    <div className="mt-0.5 shrink-0">{row.icon}</div>
                    <div>
                      <span className="font-semibold text-slate-200">{row.label}</span>
                      <span className="text-slate-500 mx-1">·</span>
                      <span className="text-slate-400">{row.note}</span>
                      <div className="text-slate-600 font-mono mt-0.5">→ {row.output}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-500">
                <Info className="w-3 h-3 shrink-0 mt-px text-slate-600" />
                <span>
                  JPG/PNG/WEBP files do not natively support password encryption.
                  They are encrypted into a secure container file that requires your password to extract.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
