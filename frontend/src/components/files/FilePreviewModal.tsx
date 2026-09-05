import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Calendar,
  HardDrive,
  FileType,
  FileText,
  FileImage,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { UserFileItem } from '../../types/file.types';
import { Button } from '../common/Button';
import { axiosClient } from '../../api/axiosClient';
import { filesApi } from '../../api/filesApi';

export interface FilePreviewModalProps {
  file: UserFileItem | null;
  onClose: () => void;
  onDownload: (file: UserFileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
}) => {
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;

    if (!file || file.fileType !== 'image') {
      setPreviewSrc('');
      setIsLoadingImage(false);
      setHasImageError(false);
      return;
    }

    const fileId = file.id || file._id || '';

    const loadImage = async () => {
      setIsLoadingImage(true);
      setHasImageError(false);

      // Cloud-stored files (Google Drive / OneDrive) require authenticated stream proxy
      if (file.storageProvider === 'google_drive' || file.storageProvider === 'onedrive') {
        try {
          const url = await filesApi.getFileBlobUrl(fileId);
          if (active) {
            blobUrl = url;
            setPreviewSrc(url);
            setIsLoadingImage(false);
          } else {
            URL.revokeObjectURL(url);
          }
        } catch (err) {
          console.error('[FilePreviewModal] Failed to load cloud image stream:', err);
          if (active) {
            setHasImageError(true);
            setIsLoadingImage(false);
          }
        }
        return;
      }

      // Cloudinary or Local uploads: use direct URL
      const fullUrl = file.fileUrl.startsWith('http')
        ? file.fileUrl
        : `${axiosClient.defaults.baseURL?.replace('/api', '') || ''}${file.fileUrl}`;

      if (active) {
        setPreviewSrc(fullUrl);
        setIsLoadingImage(false);
      }
    };

    loadImage();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  if (!file) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getFullFileUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    const base = axiosClient.defaults.baseURL?.replace('/api', '') || '';
    return `${base}${url}`;
  };

  const fullUrl = getFullFileUrl(file.fileUrl);

  const handleImageError = async () => {
    // Fallback: try fetching as blob if direct URL failed
    const fileId = file.id || file._id || '';
    if (fileId && !previewSrc.startsWith('blob:')) {
      try {
        setIsLoadingImage(true);
        const url = await filesApi.getFileBlobUrl(fileId);
        setPreviewSrc(url);
        setIsLoadingImage(false);
        setHasImageError(false);
        return;
      } catch (err) {
        console.error('[FilePreviewModal] Fallback blob fetch also failed:', err);
      }
    }
    setHasImageError(true);
    setIsLoadingImage(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              {file.fileType === 'image' ? (
                <FileImage className="w-5 h-5" />
              ) : file.fileType === 'pdf' ? (
                <FileText className="w-5 h-5" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md" title={file.originalName}>
                {file.originalName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {file.mimeType} • {formatBytes(file.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownload(file)}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Preview Area (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center min-h-[340px] overflow-hidden">
            {file.fileType === 'image' ? (
              isLoadingImage ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Loading image preview...</p>
                </div>
              ) : hasImageError ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Preview Unavailable</p>
                    <p className="text-xs text-slate-400">Could not load preview. You can still download the file.</p>
                  </div>
                </div>
              ) : (
                <img
                  src={previewSrc || fullUrl}
                  alt={file.originalName}
                  onError={handleImageError}
                  className="max-h-[460px] w-auto h-auto max-w-full rounded-lg object-contain shadow-md"
                />
              )
            ) : file.fileType === 'pdf' ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{file.originalName}</p>
                  <p className="text-xs text-slate-400">Portable Document Format (PDF)</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white">{file.originalName}</p>
                <p className="text-xs text-slate-400">Standard Data / Document File</p>
              </div>
            )}
          </div>

          {/* Metadata Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                File Details & Properties
              </h4>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <FileType className="w-3 h-3" />
                  <span>File Name</span>
                </span>
                <p className="text-slate-300 font-mono break-all text-[11px]">{file.originalName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>File Size</span>
                </span>
                <p className="text-slate-300 font-mono text-[11px]">{formatBytes(file.fileSize)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <FileType className="w-3 h-3" />
                  <span>MIME Type</span>
                </span>
                <p className="text-slate-300 font-mono text-[11px]">{file.mimeType}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Uploaded At</span>
                </span>
                <p className="text-slate-300 font-mono text-[11px]">{formatDate(file.createdAt)}</p>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              className="w-full"
              onClick={() => onDownload(file)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
