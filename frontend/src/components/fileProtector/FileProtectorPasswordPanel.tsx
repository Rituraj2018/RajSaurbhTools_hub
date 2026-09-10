import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Info } from 'lucide-react';
import {
  getPasswordStrength,
  PasswordStrength,
} from '../../utils/fileProtectorProcessor';

export interface FileProtectorPasswordPanelProps {
  mode: 'protect' | 'unlock';
  password: string;
  confirmPassword: string;
  onPasswordChange: (val: string) => void;
  onConfirmChange: (val: string) => void;
  /** Set to true to show recovery key section */
  showRecoveryKeyInput?: boolean;
  recoveryKey?: string;
  onRecoveryKeyChange?: (val: string) => void;
  /** Validation error message to display */
  validationError?: string | null;
}

export const FileProtectorPasswordPanel: React.FC<FileProtectorPasswordPanelProps> = ({
  mode,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmChange,
  showRecoveryKeyInput = false,
  recoveryKey = '',
  onRecoveryKeyChange,
  validationError,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [useRecoveryKey, setUseRecoveryKey] = useState(false);

  const strength: PasswordStrength | null =
    mode === 'protect' && password.length > 0 ? getPasswordStrength(password) : null;

  const strengthBarWidth = strength ? `${(strength.score / 4) * 100}%` : '0%';

  return (
    <div className="space-y-4">
      {/* Security Warning */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[11px] leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-px" />
        <span>
          Your password is required to unlock the protected file. Keep it safe.
          Without the correct password or supported recovery method, the encrypted file
          may not be recoverable.
        </span>
      </div>

      {/* Unlock mode: toggle between password and recovery key */}
      {mode === 'unlock' && showRecoveryKeyInput && (
        <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setUseRecoveryKey(false)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              !useRecoveryKey
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Use Password
          </button>
          <button
            type="button"
            onClick={() => setUseRecoveryKey(true)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              useRecoveryKey
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Use Recovery Key
          </button>
        </div>
      )}

      {/* Password field — hidden when using recovery key in unlock mode */}
      {!(mode === 'unlock' && useRecoveryKey) && (
        <div className="space-y-1.5">
          <label
            htmlFor="fp-password"
            className="text-xs font-semibold text-slate-300 block"
          >
            {mode === 'protect' ? 'Create Password' : 'Enter Password'}
          </label>
          <div className="relative">
            <input
              id="fp-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder={mode === 'protect' ? 'Create a strong password…' : 'Enter protection password…'}
              autoComplete={mode === 'protect' ? 'new-password' : 'current-password'}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {strength && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Password strength</span>
                <span style={{ color: strength.color }} className="font-semibold">
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: strengthBarWidth, backgroundColor: strength.color }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Password — protect mode only */}
      {mode === 'protect' && !(useRecoveryKey) && (
        <div className="space-y-1.5">
          <label
            htmlFor="fp-confirm"
            className="text-xs font-semibold text-slate-300 block"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="fp-confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onConfirmChange(e.target.value)}
              placeholder="Re-enter password…"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                confirmPassword.length > 0 && password !== confirmPassword
                  ? 'border-rose-500/60 focus:ring-rose-500/40'
                  : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500/50'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-[11px] text-rose-400">Passwords do not match.</p>
          )}
          {confirmPassword.length > 0 && password === confirmPassword && (
            <p className="text-[11px] text-emerald-400">✓ Passwords match</p>
          )}
        </div>
      )}

      {/* Recovery Key input — unlock mode, using recovery key */}
      {mode === 'unlock' && useRecoveryKey && (
        <div className="space-y-1.5">
          <label
            htmlFor="fp-recovery-input"
            className="text-xs font-semibold text-slate-300 block"
          >
            Recovery Key
          </label>
          <div className="relative">
            <input
              id="fp-recovery-input"
              type={showRecovery ? 'text' : 'password'}
              value={recoveryKey}
              onChange={(e) => onRecoveryKeyChange?.(e.target.value)}
              placeholder="Paste your recovery key here…"
              autoComplete="off"
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowRecovery((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showRecovery ? 'Hide recovery key' : 'Show recovery key'}
            >
              {showRecovery ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 shrink-0 mt-px text-blue-400" />
            <span>Enter the recovery key you saved when you protected this file.</span>
          </div>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-px" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Returns whether the current panel state means "use recovery key" for unlocking.
 * Exported so the page can read this state via a ref or callback.
 */
export function isUsingRecoveryKey(_mode: string, _recoveryKey: string): boolean {
  // This logic is controlled internally via local state in the component above.
  // The page passes recoveryKey and checks if it's non-empty as the signal.
  return _recoveryKey.trim().length > 0;
}
