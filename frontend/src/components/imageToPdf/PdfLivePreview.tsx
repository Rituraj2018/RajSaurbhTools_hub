import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  ImageFileItem,
  PdfSettings,
  renderPagePreviewCanvas,
  convertImagesToPDF,
  downloadPdfBlob,
} from '../../utils/imageToPdfProcessor';
import { Button } from '../common/Button';

export interface PdfLivePreviewProps {
  images: ImageFileItem[];
  settings: PdfSettings;
}

export const PdfLivePreview: React.FC<PdfLivePreviewProps> = ({ images, settings }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Keep current page index within range
  useEffect(() => {
    if (currentPageIndex >= images.length) {
      setCurrentPageIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, currentPageIndex]);

  // Render preview canvas for current page
  useEffect(() => {
    if (images.length === 0) {
      setPreviewCanvas(null);
      return;
    }

    const currentItem = images[currentPageIndex] || images[0];
    let isCancelled = false;

    renderPagePreviewCanvas(currentItem, settings, 460)
      .then((canvas) => {
        if (!isCancelled) {
          setPreviewCanvas(canvas);
        }
      })
      .catch((err) => {
        console.error('Preview render error:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [images, currentPageIndex, settings]);

  const handleGenerateAndDownload = async () => {
    if (images.length === 0) return;

    try {
      setIsGenerating(true);
      setProgressPercent(0);

      const blob = await convertImagesToPDF(images, settings, (percent) => {
        setProgressPercent(percent);
      });

      downloadPdfBlob(blob, settings.filename || 'Converted_Document');
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (images.length === 0) return;

    try {
      setIsGenerating(true);
      const blob = await convertImagesToPDF(images, settings);
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
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">PDF Document Live Preview</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {images.length} {images.length === 1 ? 'Page' : 'Pages'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
            {settings.pageSize}
          </span>
        </div>
      </div>

      {/* Main Page Simulator Canvas */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[380px] shadow-inner relative overflow-hidden">
        {previewCanvas ? (
          <div className="relative group rounded-lg shadow-2xl overflow-hidden border border-slate-700 bg-white transition-transform duration-200">
            <img
              src={previewCanvas.toDataURL('image/png')}
              alt={`Page ${currentPageIndex + 1} Preview`}
              className="max-h-[360px] w-auto block object-contain"
            />

            {/* Page Number Watermark Badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-white backdrop-blur-sm shadow">
              Page {currentPageIndex + 1} of {images.length}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Rendering PDF Preview...</span>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      {images.length > 1 && (
        <div className="flex items-center justify-between px-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold text-slate-300">
            Page <strong className="text-white">{currentPageIndex + 1}</strong> of{' '}
            <strong className="text-white">{images.length}</strong>
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPageIndex === images.length - 1}
            onClick={() => setCurrentPageIndex((p) => Math.min(images.length - 1, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Progress Bar (during assembly) */}
      {isGenerating && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Assembling PDF in Browser...</span>
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isGenerating}
          onClick={handleGenerateAndDownload}
          leftIcon={
            isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )
          }
        >
          <span>{isGenerating ? `Generating (${progressPercent}%)...` : 'Convert & Download PDF'}</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={isGenerating}
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isGenerating}
            onClick={handleGenerateAndDownload}
            leftIcon={<FileText className="w-3.5 h-3.5 text-red-400" />}
          >
            Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
