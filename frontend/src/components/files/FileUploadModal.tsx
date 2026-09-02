import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  X,
  RefreshCw,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button } from '../common/Button';
import { filesApi } from '../../api/filesApi';
import { UserFileItem } from '../../types/file.types';

export interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploadedFile: UserFileItem) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum 10MB limit.');
      return;
    }

    try {
      setErrorMessage(null);
      setIsUploading(true);

      const uploaded = await filesApi.uploadFile(file);
      onSuccess(uploaded);
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Upload File to Personal Vault
              </h3>
              <p className="text-[11px] text-slate-400">Save images, PDFs, and documents</p>
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

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6 animate-pulse" />
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {isUploading ? 'Uploading file...' : 'Click to select or drop file here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, PDF, WEBP up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Browse Computer
          </Button>
        </div>
      </div>
    </div>
  );
};
