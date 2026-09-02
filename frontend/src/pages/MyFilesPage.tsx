import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  FileStorageSummary,
  FileSearchFilterBar,
  FileCard,
  FileTableRow,
  FilePreviewModal,
  FileDeleteModal,
  FileUploadModal,
} from '../components/files';
import {
  UserFileItem,
  FileListResponse,
  FileTypeFilter,
  FileSortOption,
} from '../types/file.types';
import { filesApi } from '../api/filesApi';
import { Button } from '../components/common/Button';

export const MyFilesPage: React.FC = () => {
  const [filesData, setFilesData] = useState<FileListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<FileTypeFilter>('all');
  const [sortBy, setSortBy] = useState<FileSortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [previewFile, setPreviewFile] = useState<UserFileItem | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UserFileItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Load user files from backend
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await filesApi.getFiles({
        search: searchQuery || undefined,
        type: selectedType,
        sortBy,
        page: currentPage,
        limit: 12,
      });

      setFilesData(data);
    } catch (err: any) {
      console.error('Failed to load files:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load your files.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, sortBy, currentPage]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDownload = (file: UserFileItem) => {
    filesApi.downloadFile(file);
  };

  const handleConfirmDelete = async (file: UserFileItem) => {
    await filesApi.deleteFile(file.id || file._id || '');
    // Reload files after delete
    loadFiles();
  };

  const handleUploadSuccess = () => {
    loadFiles();
  };

  const files = filesData?.files || [];
  const totalFiles = filesData?.totalFiles || 0;
  const totalPages = filesData?.totalPages || 1;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Files Cloud Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Securely view, search, download, and organize all your processed documents and photos.
            </p>
          </div>
        </div>

        {/* Upload Action Button */}
        <Button
          variant="gradient"
          size="md"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Upload File
        </Button>
      </div>

      {/* Storage Utilization Summary Cards */}
      <FileStorageSummary stats={filesData?.stats} />

      {/* Search, Type Filter & Sort Toolbar */}
      <FileSearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(s) => {
          setSortBy(s);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      {/* Main Files Display */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse space-y-4 min-h-[160px]"
            >
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="w-16 h-5 rounded-full bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 rounded bg-slate-800" />
                <div className="w-1/2 h-3 rounded bg-slate-800/60" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-12 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Files</h3>
            <p className="text-xs text-rose-300 mt-1">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadFiles} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </div>
      ) : files.length === 0 ? (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Files Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedType !== 'all'
                ? 'No files matched your current search or filter criteria. Try resetting filters.'
                : 'Your cloud vault is currently empty. Upload documents or process tools to save files here.'}
            </p>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Upload File
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <FileCard
              key={file.id || file._id}
              file={file}
              onPreview={setPreviewFile}
              onDownload={handleDownload}
              onDelete={setFileToDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <FileTableRow
                    key={file.id || file._id}
                    file={file}
                    onPreview={setPreviewFile}
                    onDownload={handleDownload}
                    onDelete={setFileToDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 px-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold text-slate-300">
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong> ({totalFiles} total files)
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      <FileDeleteModal
        file={fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};
