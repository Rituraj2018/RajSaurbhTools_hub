import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import { UserFileItem } from '../../types/file.types';
import { Button } from '../common/Button';

export interface FileDeleteModalProps {
  file: UserFileItem | null;
  onClose: () => void;
  onConfirm: (file: UserFileItem) => Promise<void>;
}

export const FileDeleteModal: React.FC<FileDeleteModalProps> = ({
  file,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!file) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(file);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Delete File</h3>
              <p className="text-[11px] text-slate-400">This action cannot be undone</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Confirmation */}
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Are you sure you want to permanently delete this file from your personal cloud vault?
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <p className="text-xs font-bold text-white truncate">{file.originalName}</p>
            <p className="text-[11px] font-mono text-slate-400">{file.mimeType}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            leftIcon={
              isDeleting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )
            }
          >
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
