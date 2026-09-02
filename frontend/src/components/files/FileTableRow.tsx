import React from 'react';
import {
  FileImage,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { UserFileItem } from '../../types/file.types';

export interface FileTableRowProps {
  file: UserFileItem;
  onPreview: (file: UserFileItem) => void;
  onDownload: (file: UserFileItem) => void;
  onDelete: (file: UserFileItem) => void;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
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
        return <FileImage className="w-4 h-4 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'document':
      default:
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
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
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors group">
      {/* File Name & Icon */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            {getTypeIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <p
              onClick={() => onPreview(file)}
              className="text-xs sm:text-sm font-bold text-white truncate hover:text-blue-400 cursor-pointer transition-colors max-w-xs sm:max-w-md"
              title={file.originalName}
            >
              {file.originalName}
            </p>
          </div>
        </div>
      </td>

      {/* File Type */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadgeColor()}`}
        >
          {file.fileType}
        </span>
      </td>

      {/* File Size */}
      <td className="py-3.5 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
        {formatBytes(file.fileSize)}
      </td>

      {/* Upload Date */}
      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
        {formatDate(file.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
            title="Preview File"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

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
      </td>
    </tr>
  );
};
