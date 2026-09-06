import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  FileType,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  FileCheck,
  FileText,
  AlignLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedWordDocument,
  ConvertedPdfResult,
  convertWordToPdf,
  downloadPdfFile,
  formatBytes,
} from '../../utils/wordToPdfProcessor';

interface WordToPdfWorkspaceProps {
  document: LoadedWordDocument;
  onReset: () => void;
}

export const WordToPdfWorkspace: React.FC<WordToPdfWorkspaceProps> = ({
  document,
  onReset,
}) => {
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [headerTitle, setHeaderTitle] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'large'>('normal');

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<ConvertedPdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsConverting(true);
    setProgressPercent(10);
    setProgressStatus('Initializing Word to PDF engine...');
    setError(null);

    try {
      const result = await convertWordToPdf(
        document,
        {
          includePageNumbers,
          headerTitle,
          fontSize,
        },
        (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        }
      );
      setConversionResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert Word document to PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult) {
      downloadPdfFile(conversionResult);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Document Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FileType className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md">
                {document.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">{formatBytes(document.size)}</span>
                <span>•</span>
                <span className="text-indigo-400 font-semibold">{document.wordCount} Words</span>
                <span>•</span>
                <span>~{document.estimatedPages} Pages</span>
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
              Choose Another File
            </Button>
          </div>
        </div>

        {/* Workspace Body: Document Preview & Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Document Text Preview Window */}
          <div className="flex flex-col p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800/60">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                Document Content Excerpt
              </span>
              <span className="text-[11px] font-mono">{document.charCount} chars</span>
            </div>

            <div className="w-full h-48 sm:h-56 overflow-y-auto pr-1 text-xs text-slate-300 font-sans leading-relaxed space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
              {document.rawText ? (
                <p className="whitespace-pre-line text-slate-300 text-xs">
                  {document.rawText.substring(0, 1000)}
                  {document.rawText.length > 1000 ? '...' : ''}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FileText className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-xs">No text preview available</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 text-right">Extracted client-side with Mammoth</span>
          </div>

          {/* Settings & Controls */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>PDF Styling & Export Settings</span>
            </div>

            {/* Font Size Preset */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Typographic Scale:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Compact', val: 'compact' },
                  { label: 'Standard', val: 'normal' },
                  { label: 'Enlarged', val: 'large' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setFontSize(preset.val as any)}
                    disabled={isConverting || !!conversionResult}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      fontSize === preset.val
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  disabled={isConverting || !!conversionResult}
                  className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500/30 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    Include Page Numbering in Footer
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Prints "Page X of Y" pagination in the footer of every converted page.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.checked)}
                  disabled={isConverting || !!conversionResult}
                  className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500/30 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    Include Document Header Rule
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Prints document name with a clean dividing line at the top margin.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Button or Progress */}
            {!conversionResult && !isConverting && (
              <div className="pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleConvert}
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Convert to PDF Document
                </Button>
              </div>
            )}

            {isConverting && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{progressStatus}</span>
                  <span className="font-mono text-indigo-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
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
        <div className="bg-gradient-to-b from-indigo-950/30 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
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
                  Standard A4 PDF format • {formatBytes(conversionResult.size)} • {conversionResult.pageCount} Pages
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
              Download PDF ({formatBytes(conversionResult.size)})
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                Total Pages
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                {conversionResult.pageCount}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                Words Converted
              </span>
              <span className="text-sm sm:text-base font-bold text-indigo-400">
                {conversionResult.wordCount}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                PDF File Size
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">
                {formatBytes(conversionResult.size)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>100% Client-Side Private — Word files and PDFs are processed in browser memory and never stored permanently.</span>
      </div>
    </div>
  );
};
