import React from 'react';
import {
  Lock,
  LockOpen,
  Loader2,
  Download,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';

export interface FileProtectorActionBarProps {
  mode: 'protect' | 'unlock';
  onModeChange: (mode: 'protect' | 'unlock') => void;

  /** True when the protect/unlock operation is running */
  isProcessing: boolean;

  /** Set after successful protect before download */
  protectedReady: boolean;
  recoveryKeyConfirmed: boolean;
  onProtect: () => void;
  onDownloadProtected: () => void;

  /** Set after successful unlock before download */
  unlockedReady: boolean;
  onUnlock: () => void;
  onDownloadUnlocked: () => void;

  onReset: () => void;

  /** Whether there are files + password ready to proceed */
  canProtect: boolean;
  canUnlock: boolean;
}

export const FileProtectorActionBar: React.FC<FileProtectorActionBarProps> = ({
  mode,
  onModeChange,
  isProcessing,
  protectedReady,
  recoveryKeyConfirmed,
  onProtect,
  onDownloadProtected,
  unlockedReady,
  onUnlock,
  onDownloadUnlocked,
  onReset,
  canProtect,
  canUnlock,
}) => {
  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      {!protectedReady && !unlockedReady && (
        <div
          className="flex rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/60"
          role="tablist"
          aria-label="Protection mode"
        >
          <button
            role="tab"
            aria-selected={mode === 'protect'}
            id="tab-protect"
            onClick={() => onModeChange('protect')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-200 ${
              mode === 'protect'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-4 h-4" />
            Protect
          </button>
          <button
            role="tab"
            aria-selected={mode === 'unlock'}
            id="tab-unlock"
            onClick={() => onModeChange('unlock')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-200 ${
              mode === 'unlock'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LockOpen className="w-4 h-4" />
            Unlock
          </button>
        </div>
      )}

      {/* Protect Flow */}
      {mode === 'protect' && !protectedReady && (
        <Button
          id="fp-protect-btn"
          variant="gradient"
          size="lg"
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/30 shadow-emerald-600/20"
          disabled={!canProtect || isProcessing}
          onClick={onProtect}
          leftIcon={
            isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )
          }
        >
          {isProcessing ? 'Encrypting…' : 'Protect File'}
        </Button>
      )}

      {/* Protected — Recovery key confirmation + download */}
      {mode === 'protect' && protectedReady && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">File encrypted successfully!</span>
          </div>

          <Button
            id="fp-download-protected-btn"
            variant="gradient"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/30"
            disabled={!recoveryKeyConfirmed}
            onClick={onDownloadProtected}
            leftIcon={<Download className="w-4 h-4" />}
            title={!recoveryKeyConfirmed ? 'Confirm you saved the Recovery Key first' : undefined}
          >
            {recoveryKeyConfirmed ? 'Download Protected File' : 'Save Recovery Key First'}
          </Button>

          <Button
            id="fp-reset-after-protect-btn"
            variant="outline"
            size="md"
            className="w-full"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Protect Another File
          </Button>
        </div>
      )}

      {/* Unlock Flow */}
      {mode === 'unlock' && !unlockedReady && (
        <Button
          id="fp-unlock-btn"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={!canUnlock || isProcessing}
          onClick={onUnlock}
          leftIcon={
            isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LockOpen className="w-4 h-4" />
            )
          }
        >
          {isProcessing ? 'Decrypting…' : 'Unlock File'}
        </Button>
      )}

      {/* Unlocked — download */}
      {mode === 'unlock' && unlockedReady && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-semibold">File decrypted successfully!</span>
          </div>

          <Button
            id="fp-download-unlocked-btn"
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={onDownloadUnlocked}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Unlocked File
          </Button>

          <Button
            id="fp-reset-after-unlock-btn"
            variant="outline"
            size="md"
            className="w-full"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Unlock Another File
          </Button>
        </div>
      )}
    </div>
  );
};
