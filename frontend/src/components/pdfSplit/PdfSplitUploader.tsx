import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface PdfSplitUploaderProps {
  onFileLoaded: (file: File) => void;
  isLoading?: boolean;
  loadingProgress?: { current: number; total: number } | null;
}

export const PdfSplitUploader: React.FC<PdfSplitUploaderProps> = ({
  onFileLoaded,
  isLoading = false,
  loadingProgress = null,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessFile = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100 MB limit.');
      return;
    }

    onFileLoaded(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isLoading) fileInputRef.current?.click();
        }}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-red-500 bg-red-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <FileText className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isLoading ? 'Reading & Rendering Pages...' : 'Drop your PDF file here'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {isLoading && loadingProgress ? (
                <span>
                  Rendering page {loadingProgress.current} of {loadingProgress.total}...
                </span>
              ) : (
                'or click to browse from your computer (Up to 100 MB)'
              )}
            </p>
          </div>

          {!isLoading && (
            <div className="pt-2">
              <Button variant="gradient" size="md" leftIcon={<Upload className="w-4 h-4" />}>
                Select PDF File
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs pt-4 border-t border-slate-800/60">
            <span>🔒 100% Client-Side Processing</span>
            <span>⚡ Zero Cloud Upload</span>
            <span>📑 Instant Page Extraction</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
