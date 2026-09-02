import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  File,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchAdminFiles } from '../features/admin';
import { Button } from '../components/common/Button';

const FILE_TYPE_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  image: { icon: <ImageIcon className="w-4 h-4" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  pdf: { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  document: { icon: <File className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const AdminFilesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { files, filesTotal, filesPage, filesPages, filesLoading } = useAppSelector(
    (state) => state.admin
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document' | 'pdf'>('all');

  const loadFiles = (page = 1) => {
    dispatch(
      fetchAdminFiles({
        page,
        fileType: typeFilter !== 'all' ? typeFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadFiles(1);
  }, [typeFilter]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-emerald-400" /> Files Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {filesTotal.toLocaleString()} total files across all users
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => loadFiles(filesPage)}
          isLoading={filesLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        {(['all', 'image', 'pdf', 'document'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              typeFilter === t
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">File</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Uploaded By</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden xl:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filesLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                    No files found
                  </td>
                </tr>
              ) : (
                files.map((file) => {
                  const typeStyle = FILE_TYPE_STYLES[file.fileType] || FILE_TYPE_STYLES.document;
                  const user = file.user;
                  return (
                    <tr key={file._id} className="bg-slate-950/40 hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-lg border ${typeStyle.color} shrink-0`}>
                            {typeStyle.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                              {file.originalName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {file.mimeType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {user ? (
                          <div>
                            <p className="text-xs font-semibold text-white">{user.name}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Deleted user</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-400 tabular-nums">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${typeStyle.color}`}>
                          {file.fileType}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-[11px] text-slate-400">
                        {formatDate(file.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filesPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/40">
            <span className="text-xs text-slate-400">
              Page {filesPage} of {filesPages} · {filesTotal} files
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadFiles(filesPage - 1)}
                disabled={filesPage <= 1 || filesLoading}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadFiles(filesPage + 1)}
                disabled={filesPage >= filesPages || filesLoading}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
