import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpCircle,
  Loader2,
} from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import { Button } from './Button';

export interface UploadedFileResponse {
  id: string;
  user: string;
  originalName: string;
  fileName: string;
  fileType: 'image' | 'document' | 'pdf';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface FileUploadProps {
  onUploadSuccess?: (file: UploadedFileResponse) => void;
  onUploadError?: (errorMessage: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  autoUpload?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = 10,
  autoUpload = true,
  className = '',
  label,
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // MIME type verification
    const fileMime = file.type.toLowerCase();
    const isAllowedMime =
      acceptedTypes.includes(fileMime) ||
      acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return false;
      });

    if (!isAllowedMime) {
      return `Invalid file type "${file.name}". Supported: JPG, PNG, WEBP, and PDF.`;
    }

    // Size verification
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size (${formatFileSize(file.size)}) exceeds the maximum allowed ${maxSizeMB}MB.`;
    }

    return null;
  };

  const uploadFileToBackend = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: { file: UploadedFileResponse };
      }>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      const uploadedData = response.data.data.file;
      setUploadedFile(uploadedData);
      setUploadProgress(100);
      setIsUploading(false);

      if (onUploadSuccess) {
        onUploadSuccess(uploadedData);
      }
    } catch (err: any) {
      setIsUploading(false);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload file. Please check your network and login status.';
      setErrorMessage(msg);
      if (onUploadError) {
        onUploadError(msg);
      }
    }
  };

  const handleFileProcess = useCallback(
    (file: File) => {
      setErrorMessage(null);
      setUploadedFile(null);

      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        if (onUploadError) onUploadError(validationError);
        return;
      }

      setSelectedFile(file);

      // Generate preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }

      if (autoUpload) {
        uploadFileToBackend(file);
      }
    },
    [autoUpload, maxSizeMB, acceptedTypes]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setErrorMessage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 block">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drop Zone */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative p-8 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all duration-300 backdrop-blur-sm select-none ${
            isDragging
              ? 'border-blue-500 bg-blue-600/10 scale-[1.01] shadow-xl shadow-blue-500/10'
              : 'border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg ${
                isDragging
                  ? 'bg-blue-600 text-white scale-110'
                  : 'bg-blue-600/10 text-blue-400 group-hover:scale-110 border border-blue-500/20'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Click to upload or drag & drop files here
              </p>
              <p className="text-xs text-slate-400">
                Supports JPG, PNG, WEBP and PDF documents (max {maxSizeMB}MB)
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Browse Local Storage</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected / Uploading File Card */
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Preview Thumbnail or Document Icon */}
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={selectedFile.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-slate-400">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </div>
              </div>
            </div>

            {/* Clear / Delete Button */}
            {!isUploading && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Bar & Status */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading securely...</span>
                </span>
                <span className="text-slate-300 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Success Badge */}
          {uploadedFile && (
            <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Uploaded & verified successfully</span>
              </div>
              <a
                href={uploadedFile.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline font-semibold"
              >
                View Stored File
              </a>
            </div>
          )}

          {/* Manual Upload Trigger Button if autoUpload is false */}
          {!autoUpload && !uploadedFile && !isUploading && (
            <div className="pt-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => uploadFileToBackend(selectedFile)}
                className="w-full"
              >
                <span>Upload File</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {helperText && !errorMessage && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
