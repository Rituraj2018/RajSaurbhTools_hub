import React, { useState } from 'react';
import {
  Printer,
  Layers,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  FileType,
  Eye,
} from 'lucide-react';
import {
  PdfFileItem,
  mergePdfDocuments,
  downloadMergedPdf,
} from '../../utils/pdfMergeProcessor';
import { Button } from '../common/Button';
import { GoogleDriveButton } from '../cloud';

export interface PdfMergeActionCardProps {
  files: PdfFileItem[];
}

export const PdfMergeActionCard: React.FC<PdfMergeActionCardProps> = ({ files }) => {
  const [filename, setFilename] = useState<string>('Merged_Document');
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [mergedBytes, setMergedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validFiles = files.filter((f) => f.arrayBuffer && !f.error);
  const totalPages = validFiles.reduce((acc, f) => acc + f.pageCount, 0);
  const totalBytes = validFiles.reduce((acc, f) => acc + f.size, 0);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleMerge = async () => {
    if (validFiles.length < 2) {
      setErrorMessage('Please add at least 2 valid PDF documents to merge.');
      return;
    }

    try {
      setErrorMessage(null);
      setIsMerging(true);
      setMergeProgress(0);

      const bytes = await mergePdfDocuments(validFiles, (progress) => {
        setMergeProgress(progress);
      });

      setMergedBytes(bytes);
      // Auto-trigger download
      downloadMergedPdf(bytes, filename || 'Merged_Document');
    } catch (err: any) {
      console.error('Merge failed:', err);
      setErrorMessage(err?.message || 'Failed to merge PDF files. Please verify documents are valid.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!mergedBytes) return;
    downloadMergedPdf(mergedBytes, filename || 'Merged_Document');
  };

  const handleOpenPreview = () => {
    if (!mergedBytes) return;
    const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    if (!mergedBytes) return;
    const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 3000);
    };
  };

  if (files.length === 0) return null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">Merge Document Summary</h3>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
          Ready to Compile
        </span>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Files</span>
          <p className="text-base font-extrabold text-white">{validFiles.length}</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
          <span className="text-[10px] uppercase font-semibold text-purple-400">Combined Pages</span>
          <p className="text-base font-extrabold text-purple-300 font-mono">{totalPages}</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
          <span className="text-[10px] uppercase font-semibold text-blue-400">Est. Size</span>
          <p className="text-base font-extrabold text-blue-300 font-mono">{formatFileSize(totalBytes)}</p>
        </div>
      </div>

      {/* Custom Filename Configuration */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileType className="w-3.5 h-3.5 text-blue-400" />
          <span>Output PDF Filename</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Merged_Document"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 outline-none"
          />
          <span className="text-xs font-mono text-slate-500">.pdf</span>
        </div>
      </div>

      {/* Progress State during Merge */}
      {isMerging && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Merging Documents in Memory...</span>
            </span>
            <span className="font-mono">{mergeProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
              style={{ width: `${mergeProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {mergedBytes && !isMerging && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Merged successfully! (<strong>{totalPages} pages</strong>)
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadAgain}
            className="text-[11px] font-bold underline underline-offset-2 hover:text-emerald-200"
          >
            Download again
          </button>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-1">
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isMerging || validFiles.length < 2}
          onClick={handleMerge}
          leftIcon={
            isMerging ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Layers className="w-4 h-4" />
            )
          }
        >
          <span>
            {isMerging
              ? `Merging (${mergeProgress}%)...`
              : `Merge ${validFiles.length} PDF Files (${totalPages} Pages)`}
          </span>
        </Button>

        {mergedBytes && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleOpenPreview}
              leftIcon={<Eye className="w-3.5 h-3.5 text-blue-400" />}
            >
              Open in Tab
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5 text-purple-400" />}
            >
              Print Merged PDF
            </Button>
          </div>
        )}

        {/* Save to Google Drive */}
        <GoogleDriveButton
          variant="secondary"
          size="md"
          label="Save to Google Drive"
          className="w-full justify-center"
          disabled={isMerging || validFiles.length < 2}
          onGetFile={async () => {
            let bytes = mergedBytes;
            if (!bytes) {
              bytes = await mergePdfDocuments(validFiles);
              setMergedBytes(bytes);
            }
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            return {
              blob,
              fileName: `${filename || 'Merged_Document'}.pdf`,
              mimeType: 'application/pdf',
              category: 'PDFs',
            };
          }}
        />
      </div>
    </div>
  );
};
