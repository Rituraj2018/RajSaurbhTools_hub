import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  RefreshCw,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  AadhaarDocItem,
  AadhaarPrintOptions,
  generateAadhaarA4SheetCanvas,
  generateAadhaarPDF,
  generateAadhaarCardPDF,
  downloadCanvasImage,
  extractCardCanvas,
} from '../../utils/aadhaarProcessor';
import { Button } from '../common/Button';
import { GoogleDriveButton } from '../cloud';

export interface AadhaarPreviewProps {
  documents: AadhaarDocItem[];
  options: AadhaarPrintOptions;
}

export const AadhaarPreview: React.FC<AadhaarPreviewProps> = ({
  documents,
  options,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'cards'>('sheet');
  const [printSizeMode, setPrintSizeMode] = useState<'a4' | 'actual'>('a4');
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

  // ── Existing A4 handlers (unchanged) ──────────────────────────────────────
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

  // ── Actual Card Size handlers ──────────────────────────────────────────────
  const currentDoc = documents.length > 0 ? documents[0] : null;

  const frontCardCanvas = currentDoc
    ? extractCardCanvas(currentDoc.originalCanvas, currentDoc.frontCrop, currentDoc.adjustments)
    : null;

  const backCardCanvas = currentDoc
    ? extractCardCanvas(currentDoc.originalCanvas, currentDoc.backCrop, currentDoc.adjustments)
    : null;

  const handleDownloadActualPdf = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCardCanvas : backCardCanvas;
    if (!canvas) return;
    const label = side === 'front' ? 'Front' : 'Back';
    generateAadhaarCardPDF(canvas, `Aadhaar_CR80_${label}_Card`);
  };

  const handleDownloadActualJpg = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCardCanvas : backCardCanvas;
    if (!canvas) return;
    const label = side === 'front' ? 'Front' : 'Back';
    downloadCanvasImage(canvas, `Aadhaar_CR80_${label}_Card`, 'image/jpeg');
  };

  const handleDownloadActualPng = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCardCanvas : backCardCanvas;
    if (!canvas) return;
    const label = side === 'front' ? 'Front' : 'Back';
    downloadCanvasImage(canvas, `Aadhaar_CR80_${label}_Card`, 'image/png');
  };

  const handlePrintActualSize = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCardCanvas : backCardCanvas;
    if (!canvas) return;
    const label = side === 'front' ? 'Front' : 'Back';
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
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
            <title>Print Aadhaar ${label} Card — CR80 Actual Size</title>
            <style>
              /*
               * @page size: 85.6mm 54mm targets printers that support CR80 / PAN card size paper.
               * On standard A4 printers, the card prints at 85.6×54mm — trim along the card edge.
               * IMPORTANT: Select Scale 100% in print dialog — do NOT use Fit to Page.
               */
              @page {
                size: 85.6mm 54mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: #fff;
                display: flex;
                align-items: flex-start;
                justify-content: flex-start;
              }
              img {
                width: 85.6mm;
                height: 54mm;
                display: block;
                object-fit: fill;
              }
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

        {/* Tab Buttons — only relevant in A4 mode */}
        {printSizeMode === 'a4' && (
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
        )}
      </div>

      {/* ── PRINT OUTPUT SIZE TOGGLE ──────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>Print Output Size</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* A4 Sheet option */}
          <button
            type="button"
            onClick={() => {
              setPrintSizeMode('a4');
              setActiveTab('sheet');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              printSizeMode === 'a4'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  printSizeMode === 'a4'
                    ? 'border-blue-400'
                    : 'border-slate-600'
                }`}
              >
                {printSizeMode === 'a4' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </div>
              <p className="text-xs font-bold text-white">A4 Sheet</p>
            </div>
            <p className="text-[10px] text-slate-400 pl-5.5">
              210 × 297 mm — tiles 1–5 card pairs
            </p>
          </button>

          {/* Actual Card Size option */}
          <button
            type="button"
            onClick={() => setPrintSizeMode('actual')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              printSizeMode === 'actual'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  printSizeMode === 'actual'
                    ? 'border-emerald-400'
                    : 'border-slate-600'
                }`}
              >
                {printSizeMode === 'actual' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
              <p className="text-xs font-bold text-white">Actual Card Size</p>
            </div>
            <p className="text-[10px] text-slate-400 pl-5.5">
              85.6 × 54 mm — CR80 / PAN Card Size
            </p>
          </button>
        </div>
      </div>

      {/* ── A4 SHEET MODE ────────────────────────────────────────────────── */}
      {printSizeMode === 'a4' && (
        <>
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
                    src={frontCardCanvas!.toDataURL('image/jpeg', 0.95)}
                    alt="Front Card Zoom"
                    className="w-full h-auto block"
                  />
                </div>
              </div>

              <div className="w-full max-w-md space-y-2">
                <span className="text-xs font-semibold text-slate-300">Back Card (85.6 × 54 mm)</span>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-white shadow-xl">
                  <img
                    src={backCardCanvas!.toDataURL('image/jpeg', 0.95)}
                    alt="Back Card Zoom"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action CTA Buttons — Download & Print (existing, unchanged) */}
          <div className="space-y-3 pt-2">

            {/* ── Primary Download: PDF ── */}
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
              <span>Download A4 Sheet (PDF)</span>
            </Button>

            {/* ── Secondary Download: Image Formats ── */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!sheetCanvas}
                onClick={handleDownloadJpg}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download A4 JPG
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!sheetCanvas}
                onClick={handleDownloadPng}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download A4 PNG
              </Button>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* ── Print A4 Sheet ── */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-blue-500/40 text-blue-300 hover:border-blue-400 hover:text-blue-200 hover:bg-blue-500/10"
              disabled={!sheetCanvas}
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4 text-blue-400" />}
            >
              Print A4 Sheet
            </Button>

            {/* ── Save to Google Drive ── */}
            <GoogleDriveButton
              variant="secondary"
              size="md"
              label="Save to Google Drive"
              className="w-full justify-center"
              disabled={!sheetCanvas}
              onGetFile={async () => {
                if (!sheetCanvas) return null;
                return new Promise((resolve) => {
                  sheetCanvas.toBlob((blob) => {
                    if (!blob) return;
                    resolve({
                      blob,
                      fileName: `Aadhaar_A4_Print_Sheet_${Date.now()}.png`,
                      mimeType: 'image/png',
                      category: 'Documents',
                    });
                  }, 'image/png');
                });
              }}
            />

            {/* ── Print hint ── */}
            {sheetCanvas && (
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                Print dialog will show only the A4 Aadhaar layout — no UI elements.
              </p>
            )}
          </div>
        </>
      )}

      {/* ── ACTUAL CARD SIZE MODE ─────────────────────────────────────────── */}
      {printSizeMode === 'actual' && (
        <>
          {/* Card Size Info Banner */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">CR80 / PAN Card Size</p>
                <p className="text-[10px] text-emerald-400/70">85.6 × 54 mm — Physical Card Dimensions</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              300 DPI
            </span>
          </div>

          {/* Front Card Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Front Card
              </span>
              <span className="text-[10px] font-mono text-slate-500">85.6 × 54 mm</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-emerald-700/40 bg-white shadow-xl">
              {frontCardCanvas && (
                <img
                  src={frontCardCanvas.toDataURL('image/jpeg', 0.95)}
                  alt="Front Card — CR80 Actual Size"
                  className="w-full h-auto block"
                />
              )}
            </div>

            {/* Front Card Actions */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant="gradient"
                size="sm"
                className="w-full text-xs"
                disabled={!frontCardCanvas}
                onClick={() => handleDownloadActualPdf('front')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!frontCardCanvas}
                onClick={() => handleDownloadActualJpg('front')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                JPG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!frontCardCanvas}
                onClick={() => handleDownloadActualPng('front')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                PNG
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/10"
              disabled={!frontCardCanvas}
              onClick={() => handlePrintActualSize('front')}
              leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Print Front Card (Actual Size)
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Back Card</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Back Card Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Back Card
              </span>
              <span className="text-[10px] font-mono text-slate-500">85.6 × 54 mm</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-emerald-700/40 bg-white shadow-xl">
              {backCardCanvas && (
                <img
                  src={backCardCanvas.toDataURL('image/jpeg', 0.95)}
                  alt="Back Card — CR80 Actual Size"
                  className="w-full h-auto block"
                />
              )}
            </div>

            {/* Back Card Actions */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant="gradient"
                size="sm"
                className="w-full text-xs"
                disabled={!backCardCanvas}
                onClick={() => handleDownloadActualPdf('back')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!backCardCanvas}
                onClick={() => handleDownloadActualJpg('back')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                JPG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled={!backCardCanvas}
                onClick={() => handleDownloadActualPng('back')}
                leftIcon={<Download className="w-3 h-3" />}
              >
                PNG
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/10"
              disabled={!backCardCanvas}
              onClick={() => handlePrintActualSize('back')}
              leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Print Back Card (Actual Size)
            </Button>
          </div>

          {/* Print Scale Notice */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                Important — Print Settings
              </p>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-[10px] text-amber-400/80 leading-relaxed">
              <li>
                Set <strong className="text-amber-300">Scale: 100%</strong> in the print dialog
              </li>
              <li>
                <strong className="text-amber-300">Disable</strong> "Fit to Page" / "Shrink to Fit"
              </li>
              <li>
                If your printer supports CR80 paper — select it for direct card printing
              </li>
              <li>
                On A4 printers — the card prints at 85.6 × 54 mm; trim along the edge
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
