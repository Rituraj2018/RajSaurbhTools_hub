import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  FileCheck,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedPdfDocument,
  ConvertedWordResult,
  convertPdfToWord,
  downloadWordFile,
  formatBytes,
} from '../../utils/pdfToWordProcessor';

interface PdfToWordWorkspaceProps {
  document: LoadedPdfDocument;
  onReset: () => void;
}

export const PdfToWordWorkspace: React.FC<PdfToWordWorkspaceProps> = ({
  document,
  onReset,
}) => {
  const [includeImages, setIncludeImages] = useState<boolean>(true);
  const [preservePageBreaks, setPreservePageBreaks] = useState<boolean>(true);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<ConvertedWordResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsConverting(true);
    setProgressPercent(5);
    setProgressStatus('Starting PDF extraction...');
    setError(null);

    try {
      const result = await convertPdfToWord(
        document,
        {
          includeImages,
          preservePageBreaks,
        },
        (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        }
      );
      setConversionResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert PDF to Word document.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult) {
      downloadWordFile(conversionResult);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Document Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md">
                {document.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">{formatBytes(document.size)}</span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">{document.totalPages} Pages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              disabled={isConverting}
            >
              Choose Another PDF
            </Button>
          </div>
        </div>

        {/* Workspace Body: Thumbnail & Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Document Preview Thumbnail */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="w-full h-48 sm:h-56 rounded-lg overflow-hidden flex items-center justify-center bg-slate-900/50 border border-slate-800 relative">
              {document.thumbnailUrl ? (
                <img
                  src={document.thumbnailUrl}
                  alt="PDF Page 1 Preview"
                  className="max-h-full max-w-full object-contain shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <FileText className="w-10 h-10" />
                  <span className="text-xs">Preview unavailable</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Page 1 of {document.totalPages}</span>
          </div>

          {/* Settings & Options */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Conversion Options</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preservePageBreaks}
                  onChange={(e) => setPreservePageBreaks(e.target.checked)}
                  disabled={isConverting || !!conversionResult}
                  className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500/30 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Preserve PDF Page Breaks
                  </span>
                  <p className="text-xs text-slate-400">
                    Inserts native Word page breaks between each PDF page to maintain pagination.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  disabled={isConverting || !!conversionResult}
                  className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500/30 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Scanned Page Snapshot Fallback
                  </span>
                  <p className="text-xs text-slate-400">
                    If pages contain scanned images or no selectable text, automatically embeds high-resolution snapshots into Word.
                  </p>
                </div>
              </label>
            </div>

            {/* Convert Button or Progress */}
            {!conversionResult && !isConverting && (
              <div className="pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleConvert}
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Convert to Word (.docx)
                </Button>
              </div>
            )}

            {isConverting && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{progressStatus}</span>
                  <span className="font-mono text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Converted Result Panel */}
      {conversionResult && (
        <div className="bg-gradient-to-b from-blue-950/30 to-slate-900/80 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {conversionResult.filename}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valid Microsoft Word OpenXML (.docx) format • {formatBytes(conversionResult.size)}
                </p>
              </div>
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Download Word Document ({formatBytes(conversionResult.size)})
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                Pages
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                {conversionResult.pageCount}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                Words Extracted
              </span>
              <span className="text-sm sm:text-base font-bold text-blue-400">
                {conversionResult.wordCount}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                Paragraphs
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">
                {conversionResult.paragraphCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>100% Client-Side Private — No PDF files or Word documents are uploaded or permanently stored.</span>
      </div>
    </div>
  );
};
