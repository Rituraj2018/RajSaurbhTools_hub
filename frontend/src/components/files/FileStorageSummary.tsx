import React from 'react';
import {
  HardDrive,
  FileImage,
  FileText,
} from 'lucide-react';
import { FileStorageStats } from '../../types/file.types';

export interface FileStorageSummaryProps {
  stats?: FileStorageStats;
}

export const FileStorageSummary: React.FC<FileStorageSummaryProps> = ({ stats }) => {
  const formatBytes = (bytes: number = 0): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalFiles = stats?.totalFilesCount || 0;
  const totalStorage = stats?.totalStorageBytes || 0;
  const imageCount = stats?.imageCount || 0;
  const pdfCount = stats?.pdfCount || 0;
  const docCount = stats?.documentCount || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Files */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total User Files</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{totalFiles}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Total Storage */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-400">Storage Used</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">
              {formatBytes(totalStorage)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Image Files */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400">Photos & Images</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{imageCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileImage className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. PDF & Documents */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-400">PDFs & Docs</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">
              {pdfCount + docCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
