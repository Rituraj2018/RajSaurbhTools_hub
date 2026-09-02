import React from 'react';
import {
  FileImage,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { UserFileItem } from '../../types/file.types';

export interface FileCardProps {
  file: UserFileItem;
  onPreview: (file: UserFileItem) => void;
  onDownload: (file: UserFileItem) => void;
  onDelete: (file: UserFileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
  onDelete,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeIcon = () => {
    switch (file.fileType) {
      case 'image':
        return <FileImage className="w-6 h-6 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-400" />;
      case 'document':
      default:
        return <FileSpreadsheet className="w-6 h-6 text-purple-400" />;
    }
  };

  const getTypeBadgeColor = () => {
    switch (file.fileType) {
      case 'image':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'pdf':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'document':
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    }
  };

  return (
    <div className="group relative p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 hover:bg-slate-900">
      {/* Top Row: Icon + Type Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {getTypeIcon()}
        </div>

        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadgeColor()}`}
        >
          {file.fileType}
        </span>
      </div>

      {/* File Name & Metadata */}
      <div className="space-y-1.5 min-w-0">
        <h4
          className="text-sm font-bold text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
          title={file.originalName}
          onClick={() => onPreview(file)}
        >
          {file.originalName}
        </h4>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-slate-500" />
            <span>{formatBytes(file.fileSize)}</span>
          </span>

          <span>•</span>

          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{formatDate(file.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* Bottom Row: Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onPreview(file)}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          title="Preview File"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(file)}
            className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete File"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
