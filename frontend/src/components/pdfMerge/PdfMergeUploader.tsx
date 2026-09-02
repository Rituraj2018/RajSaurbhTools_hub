import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  PdfFileItem,
  loadAndInspectPdf,
  createSamplePdf,
} from '../../utils/pdfMergeProcessor';
import { Button } from '../common/Button';

export interface PdfMergeUploaderProps {
  onFilesAdded: (newFiles: PdfFileItem[]) => void;
  hasFiles: boolean;
  totalFilesCount?: number;
}

export const PdfMergeUploader: React.FC<PdfMergeUploaderProps> = ({
  onFilesAdded,
  hasFiles,
  totalFilesCount = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setIsParsing(true);

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (file.size <= 100 * 1024 * 1024) {
          // 100 MB limit
          validFiles.push(file);
        }
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid PDF documents (.pdf).');
      setIsParsing(false);
      return;
    }

    const items: PdfFileItem[] = [];

    for (const file of validFiles) {
      try {
        const item = await loadAndInspectPdf(file);
        items.push(item);
      } catch (err: any) {
        items.push({
          id: `pdf_err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: 0,
          arrayBuffer: null,
          error: err?.message || 'Failed to inspect PDF file.',
        });
      }
    }

    setIsParsing(false);
    if (items.length > 0) {
      onFilesAdded(items);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  /**
   * Generates 3 authentic multi-page sample PDFs client-side for 1-click testing
   */
  const handleLoadSamplePdfs = async () => {
    setIsLoadingSample(true);
    setErrorMessage(null);

    try {
      const sample1 = await createSamplePdf(
        'Annual Financial Report',
        'Executive Revenue & Profit Margin Summary',
        2,
        { r: 0.08, g: 0.25, b: 0.55 } // Blue theme
      );

      const sample2 = await createSamplePdf(
        'Technical Architecture Specifications',
        'System Modules & Client-Side PDF Synthesis',
        3,
        { r: 0.05, g: 0.45, b: 0.35 } // Green theme
      );

      const sample3 = await createSamplePdf(
        'Compliance & Privacy Appendix',
        'Zero Cloud Upload & Data Isolation Statement',
        1,
        { r: 0.45, g: 0.12, b: 0.55 } // Purple theme
      );

      onFilesAdded([sample1, sample2, sample3]);
    } catch (err: any) {
      setErrorMessage(`Failed to generate sample PDFs: ${err?.message}`);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 shadow-xl'
        }`}
      >
        {/* Glow ambient background mesh */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
            {isParsing ? (
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            ) : (
              <UploadCloud className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {hasFiles ? 'Add More PDF Files to Merge' : 'Select or Drop PDF Files to Merge'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {isParsing
                ? 'Validating PDF structures and extracting page counts...'
                : 'Drag and drop multiple PDF files here, or browse from your computer'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              PDF Documents Only
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Up to 100 MB per file
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
              Client-Side Fast Merge
            </span>
          </div>

          {/* Quick Demo Sample Button */}
          {!hasFiles && (
            <div
              className="pt-3"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadSamplePdfs}
                disabled={isLoadingSample || isParsing}
                leftIcon={
                  isLoadingSample ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )
                }
              >
                <span>{isLoadingSample ? 'Generating Samples...' : 'Try with 3 Sample PDF Files (6 Pages)'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Queue Banner when files exist */}
      {hasFiles && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>
              <strong className="text-white">{totalFilesCount}</strong> {totalFilesCount === 1 ? 'file' : 'files'} in merge queue
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add More PDFs
          </Button>
        </div>
      )}
    </div>
  );
};
