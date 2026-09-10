import React, { useState } from 'react';
import { Copy, Check, ShieldAlert, Eye, EyeOff, KeyRound } from 'lucide-react';

export interface FileProtectorRecoveryKeyProps {
  recoveryKey: string;
  onConfirmed: (confirmed: boolean) => void;
}

/**
 * Displays the one-time recovery key after a file is protected.
 * Requires the user to explicitly confirm they've saved it before download
 * is enabled.
 *
 * SECURITY: The recovery key is shown ONLY here and NEVER stored anywhere.
 * The user must copy or write it down now.
 */
export const FileProtectorRecoveryKey: React.FC<FileProtectorRecoveryKeyProps> = ({
  recoveryKey,
  onConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — fallback: select the text
    }
  };

  const handleConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConfirmed(checked);
    onConfirmed(checked);
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-orange-950/20 border border-amber-500/30 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <KeyRound className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Recovery Key — Save This Now</h3>
          <p className="text-[11px] text-amber-300/80">This key will not be shown again</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
        <span>
          Save your Recovery Key securely. Anyone with this Recovery Key can recover
          access to the encrypted file. This key is not stored anywhere — if you lose
          it, there is no other way to recover the file if you forget your password.
        </span>
      </div>

      {/* Key display */}
      <div className="space-y-2">
        <div className="relative">
          <div className={`w-full px-3 py-2.5 pr-20 rounded-xl bg-slate-950/80 border border-slate-700 font-mono text-xs text-emerald-300 break-all leading-relaxed ${showKey ? '' : 'filter blur-sm select-none'}`}>
            {recoveryKey}
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label={showKey ? 'Hide recovery key' : 'Show recovery key'}
              title={showKey ? 'Hide key' : 'Reveal key'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
              aria-label="Copy recovery key"
              title="Copy key"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        {!showKey && (
          <p className="text-[10px] text-slate-500 text-center">Click the eye icon to reveal your recovery key</p>
        )}
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer group" htmlFor="recovery-confirmed">
        <input
          id="recovery-confirmed"
          type="checkbox"
          checked={confirmed}
          onChange={handleConfirm}
          className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer"
        />
        <span className="text-[12px] text-slate-300 group-hover:text-slate-100 transition-colors leading-relaxed">
          I have securely saved my Recovery Key and understand that without it or my password, I cannot recover this encrypted file.
        </span>
      </label>
    </div>
  );
};
