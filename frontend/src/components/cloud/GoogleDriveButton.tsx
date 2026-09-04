import React, { useState } from 'react';
import { DriveUploadOptions } from '../../services/googleDriveService';
import { CloudSaveModal, GoogleDriveIcon } from './CloudSaveModal';

export interface GoogleDriveButtonProps {
  /**
   * Callback that produces the file blob, filename, and mimeType on-demand when saving.
   */
  onGetFile: () =>
    | Promise<DriveUploadOptions | null>
    | DriveUploadOptions
    | null;
  /**
   * Button label override (defaults to "Save to Google Drive").
   */
  label?: string;
  /**
   * Visual style variant.
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'compact' | 'inline';
  /**
   * Size variant.
   */
  size?: 'sm' | 'md';
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Extra styling classes.
   */
  className?: string;
}

export const GoogleDriveButton: React.FC<GoogleDriveButtonProps> = ({
  onGetFile,
  label = 'Save to Google Drive',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Styling based on variant and size
  const sizeClasses =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-xs font-semibold';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30';
      break;
    case 'compact':
      variantClasses =
        'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 shadow-sm';
      break;
    case 'outline':
      variantClasses =
        'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600';
      break;
    case 'inline':
      variantClasses =
        'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      break;
    case 'secondary':
    default:
      variantClasses =
        'bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 shadow-md';
      break;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] ${sizeClasses} ${variantClasses} ${className}`}
        title="Save privately to your personal Google Drive"
      >
        <GoogleDriveIcon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
        <span>{label}</span>
      </button>

      <CloudSaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGetFile={onGetFile}
      />
    </>
  );
};
