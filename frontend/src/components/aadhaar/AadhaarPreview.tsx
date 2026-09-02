import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  RefreshCw,
} from 'lucide-react';
import {
  AadhaarDocItem,
  AadhaarPrintOptions,
  generateAadhaarA4SheetCanvas,
  generateAadhaarPDF,
  downloadCanvasImage,
  extractCardCanvas,
} from '../../utils/aadhaarProcessor';
import { Button } from '../common/Button';

export interface AadhaarPreviewProps {
  documents: AadhaarDocItem[];
  options: AadhaarPrintOptions;
}

export const AadhaarPreview: React.FC<AadhaarPreviewProps> = ({
  documents,
  options,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'cards'>('sheet');
  const [sheetCanvas, setSheetCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (documents.length === 0) {
      setSheetCanvas(null);
      return;
    }

    try {
      const canvas = generateAadhaarA4SheetCanvas(documents, options);
      setSheetCanvas(canvas);
    } catch (err) {
      console.error('Failed to generate A4 sheet preview:', err);
    }
  }, [documents, options]);

  const handleDownloadPdf = () => {
    if (!sheetCanvas) return;
    setIsGenerating(true);
    try {
      generateAadhaarPDF(sheetCanvas, 'Aadhaar_A4_Print_Sheet');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadJpg = () => {
    if (!sheetCanvas) return;
    downloadCanvasImage(sheetCanvas, 'Aadhaar_A4_Print_Sheet', 'image/jpeg');
  };

  const handleDownloadPng = () => {
    if (!sheetCanvas) return;
    downloadCanvasImage(sheetCanvas, 'Aadhaar_A4_Print_Sheet', 'image/png');
  };

  const handlePrint = () => {
    if (!sheetCanvas) return;
    const dataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Aadhaar Sheet</title>
            <style>
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; }
              img { width: 100vw; height: 100vh; object-fit: contain; display: block; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }
  };

  if (documents.length === 0) return null;

  const currentDoc = documents[0];
  const frontCardCanvas = extractCardCanvas(
    currentDoc.originalCanvas,
    currentDoc.frontCrop,
    currentDoc.adjustments
  );
  const backCardCanvas = extractCardCanvas(
    currentDoc.originalCanvas,
    currentDoc.backCrop,
    currentDoc.adjustments
  );

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Print Sheet Live Preview
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sheet'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A4 Print Sheet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Card Pair Zoom
          </button>
        </div>
      </div>

      {/* Main Canvas Simulator */}
      {activeTab === 'sheet' ? (
        /* A4 Sheet Simulator */
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px] shadow-inner relative overflow-hidden">
          {sheetCanvas ? (
            <div className="relative group rounded-lg shadow-2xl overflow-hidden border border-slate-700 bg-white transition-transform duration-200">
              <img
                src={sheetCanvas.toDataURL('image/jpeg', 0.85)}
                alt="A4 Sheet Preview"
                className="max-h-[440px] w-auto block object-contain"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-white backdrop-blur-sm shadow">
                A4 • 300 DPI
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Generating A4 layout...</span>
            </div>
          )}
        </div>
      ) : (
        /* Card Pair Zoom */
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center gap-6 min-h-[420px]">
          <div className="w-full max-w-md space-y-2">
            <span className="text-xs font-semibold text-slate-300">Front Card (85.6 × 54 mm)</span>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-white shadow-xl">
              <img
                src={frontCardCanvas.toDataURL('image/jpeg', 0.95)}
                alt="Front Card Zoom"
                className="w-full h-auto block"
              />
            </div>
          </div>

          <div className="w-full max-w-md space-y-2">
            <span className="text-xs font-semibold text-slate-300">Back Card (85.6 × 54 mm)</span>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-white shadow-xl">
              <img
                src={backCardCanvas.toDataURL('image/jpeg', 0.95)}
                alt="Back Card Zoom"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isGenerating || !sheetCanvas}
          onClick={handleDownloadPdf}
          leftIcon={
            isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )
          }
        >
          <span>Download Print-Ready A4 PDF</span>
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={handleDownloadJpg}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            A4 JPG
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={handleDownloadPng}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            A4 PNG
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-blue-400" />}
          >
            Print Sheet
          </Button>
        </div>
      </div>
    </div>
  );
};
