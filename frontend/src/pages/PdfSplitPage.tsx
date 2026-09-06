import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowLeft, RotateCcw, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import {
  PdfSplitUploader,
  PdfSplitPageGrid,
  PdfSplitControls,
  PdfSplitActionCard,
} from '../components/pdfSplit';
import {
  PdfDocumentInfo,
  SplitMode,
  loadAndInspectPdfForSplit,
  parsePageRange,
  extractPagesToSinglePdf,
  extractAllIndividualPages,
  triggerFileDownload,
} from '../utils/pdfSplitProcessor';
import { Button } from '../components/common/Button';

export const PdfSplitPage: React.FC = () => {
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Split state
  const [splitMode, setSplitMode] = useState<SplitMode>('selected-pages');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeText, setRangeText] = useState<string>('');
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  // Handle PDF file uploaded
  const handleFileLoaded = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    setProcessSuccess(false);
    setLoadingProgress(null);

    try {
      const info = await loadAndInspectPdfForSplit(file, (current, total) => {
        setLoadingProgress({ current, total });
      });
      setDocInfo(info);
      // Select all pages by default
      const allPages = Array.from({ length: info.totalPages }, (_, i) => i + 1);
      setSelectedPages(allPages);
      setRangeText(`1-${info.totalPages}`);
      setOutputFilename(`${file.name.replace(/\.pdf$/i, '')}_Split`);
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      setLoadError(err?.message || 'Failed to inspect PDF document.');
    } finally {
      setIsLoading(false);
      setLoadingProgress(null);
    }
  };

  // Range validation
  const rangeValidation = useMemo(() => {
    if (!docInfo) return { pages: [], error: null };
    if (splitMode !== 'custom-range') return { pages: [], error: null };
    return parsePageRange(rangeText, docInfo.totalPages);
  }, [rangeText, docInfo, splitMode]);

  // Actual effective pages to extract
  const effectivePagesToExtract = useMemo(() => {
    if (!docInfo) return [];
    if (splitMode === 'all-individual') {
      return Array.from({ length: docInfo.totalPages }, (_, i) => i + 1);
    }
    if (splitMode === 'custom-range') {
      return rangeValidation.pages;
    }
    return selectedPages;
  }, [docInfo, splitMode, rangeValidation.pages, selectedPages]);

  // Page selection actions
  const handleTogglePage = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!docInfo) return;
    const all = Array.from({ length: docInfo.totalPages }, (_, i) => i + 1);
    setSelectedPages(all);
  };

  const handleClearAll = () => {
    setSelectedPages([]);
  };

  const handleInvertSelection = () => {
    if (!docInfo) return;
    const inverted: number[] = [];
    for (let i = 1; i <= docInfo.totalPages; i++) {
      if (!selectedPages.includes(i)) {
        inverted.push(i);
      }
    }
    setSelectedPages(inverted);
  };

  // Reset to upload another file
  const handleReset = () => {
    setDocInfo(null);
    setSelectedPages([]);
    setRangeText('');
    setOutputFilename('');
    setProcessSuccess(false);
  };

  // Execute Split
  const handleExecuteSplit = async () => {
    if (!docInfo) return;
    setIsProcessing(true);
    setProcessSuccess(false);

    try {
      if (splitMode === 'all-individual') {
        const results = await extractAllIndividualPages(docInfo.arrayBuffer, docInfo.name);
        for (let i = 0; i < results.length; i++) {
          triggerFileDownload(results[i].bytes, results[i].filename);
          // Slight delay between sequential browser downloads
          if (i < results.length - 1) {
            await new Promise((res) => setTimeout(res, 350));
          }
        }
      } else {
        const pages = effectivePagesToExtract;
        if (pages.length === 0) return;

        const bytes = await extractPagesToSinglePdf(docInfo.arrayBuffer, pages);
        const finalName = (outputFilename.trim() || 'Extracted_Pages') + '.pdf';
        triggerFileDownload(bytes, finalName);
      }
      setProcessSuccess(true);
    } catch (err: any) {
      console.error('Split error:', err);
      alert('Failed to split PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const canExecute = docInfo !== null && effectivePagesToExtract.length > 0 && !rangeValidation.error;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=PDF" className="hover:text-blue-400 transition-colors">
              PDF Suite
            </Link>
            <span>/</span>
            <span className="text-blue-400">PDF Split</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                PDF Split Master Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Extract specific page ranges or split into individual documents with zero cloud uploads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {docInfo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Upload Another
            </Button>
          )}
          <Link to="/tools">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {processSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3 animate-fadeIn">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>PDF split completed successfully! File has been downloaded to your computer.</span>
        </div>
      )}

      {/* Main Workspace */}
      {!docInfo ? (
        <div className="space-y-8">
          <PdfSplitUploader
            onFileLoaded={handleFileLoaded}
            isLoading={isLoading}
            loadingProgress={loadingProgress}
          />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Visual Thumbnail Grid</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preview high-res miniature thumbnails of every page in your document before splitting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Flexible Range Syntax</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extract chapters or intervals using standard notation like <code>1-5, 8, 12-20</code>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents remain completely local in your browser memory with zero external server transmission.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Left Column (7 cols): Page Grid & Split Mode Controls */}
          <div className="lg:col-span-7 space-y-6">
            <PdfSplitControls
              splitMode={splitMode}
              onSplitModeChange={setSplitMode}
              rangeText={rangeText}
              onRangeTextChange={setRangeText}
              rangeError={rangeValidation.error}
              totalPages={docInfo.totalPages}
            />

            {/* Visual Thumbnail Grid */}
            {splitMode !== 'all-individual' && (
              <PdfSplitPageGrid
                pages={docInfo.pages}
                selectedPages={effectivePagesToExtract}
                onTogglePage={handleTogglePage}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                onInvertSelection={handleInvertSelection}
              />
            )}
          </div>

          {/* Right Column (5 cols): Sticky Summary & Split Action */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <PdfSplitActionCard
              documentName={docInfo.name}
              totalPages={docInfo.totalPages}
              selectedCount={effectivePagesToExtract.length}
              splitMode={splitMode}
              outputFilename={outputFilename}
              onOutputFilenameChange={setOutputFilename}
              onExecuteSplit={handleExecuteSplit}
              isProcessing={isProcessing}
              canExecute={canExecute}
            />
          </div>
        </div>
      )}
    </div>
  );
};
