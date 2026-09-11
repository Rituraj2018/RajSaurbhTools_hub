import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck, Upload, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { IdCardDimensionPicker, IdCardSheetLayout, IdCardExportPanel } from '../components/idCard';
import {
  CardDimensions,
  CARD_PRESETS,
  validateCardImage,
  fileToDataUrl,
  downloadCanvasAsImage,
} from '../utils/idCardProcessor';
import { generateSheetPdfFromImages } from '../utils/idCardPdfGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardPrintStudioPage: React.FC = () => {
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [sheetCanvas, setSheetCanvas] = useState<HTMLCanvasElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);
    const newImages: string[] = [];
    for (const file of files) {
      const validation = validateCardImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        continue;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        newImages.push(dataUrl);
      } catch {
        setError('Failed to read one or more files');
      }
    }
    setCardImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setCardImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSheetReady = useCallback((canvas: HTMLCanvasElement) => {
    setSheetCanvas(canvas);
  }, []);

  const handleDownloadPng = async () => {
    if (!sheetCanvas) return;
    const filename = `ID_Card_Sheet_${Date.now()}.png`;
    downloadCanvasAsImage(sheetCanvas, filename.replace(/\.png$/, ''), 'png');
    await recordToolHistorySafely({
      tool: 'id-card-print-studio',
      toolName: 'ID Card Print Studio',
      inputFiles: cardImages.map((_, idx) => ({ name: `Card_${idx + 1}.png`, type: 'image/png' })),
      outputFile: { name: filename, type: 'image/png' },
      status: 'completed',
      metadata: { cardCount: cardImages.length, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'png' },
    });
  };

  const handleDownloadJpg = async () => {
    if (!sheetCanvas) return;
    const filename = `ID_Card_Sheet_${Date.now()}.jpg`;
    downloadCanvasAsImage(sheetCanvas, filename.replace(/\.jpg$/, ''), 'jpeg');
    await recordToolHistorySafely({
      tool: 'id-card-print-studio',
      toolName: 'ID Card Print Studio',
      inputFiles: cardImages.map((_, idx) => ({ name: `Card_${idx + 1}.jpg`, type: 'image/jpeg' })),
      outputFile: { name: filename, type: 'image/jpeg' },
      status: 'completed',
      metadata: { cardCount: cardImages.length, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'jpeg' },
    });
  };

  const handleDownloadPdf = async () => {
    if (!sheetCanvas) return;
    setExporting(true);
    const filename = `ID_Card_Sheet_${Date.now()}.pdf`;
    try {
      await generateSheetPdfFromImages(sheetCanvas);
      await recordToolHistorySafely({
        tool: 'id-card-print-studio',
        toolName: 'ID Card Print Studio',
        inputFiles: cardImages.map((_, idx) => ({ name: `Card_${idx + 1}.png`, type: 'image/png' })),
        outputFile: { name: filename, type: 'application/pdf' },
        status: 'completed',
        metadata: { cardCount: cardImages.length, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'pdf' },
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link>
            <span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link>
            <span>/</span>
            <span className="text-teal-400">ID Card Print Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ID Card Print Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Arrange ID cards on A4 sheets for high-quality printing with custom dimensions and spacing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side
          </span>
          <Link to="/tools">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back to Tools</Button>
          </Link>
        </div>
      </div>

      {/* Upload cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Upload Card Images</h3>
          <label className="cursor-pointer">
            <Button variant="secondary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={() => document.getElementById('print-studio-upload')?.click()}>
              Add Images
            </Button>
            <input
              id="print-studio-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        {cardImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {cardImages.map((img, i) => (
              <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-700 group">
                <img src={img} alt={`Card ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove card ${i + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dimensions */}
      <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />

      {/* Sheet Layout */}
      <IdCardSheetLayout
        cardImages={cardImages}
        cardWidthPx={dimensions.widthPx}
        cardHeightPx={dimensions.heightPx}
        onSheetReady={handleSheetReady}
      />

      {/* Export */}
      <IdCardExportPanel
        onDownloadPng={handleDownloadPng}
        onDownloadJpg={handleDownloadJpg}
        onDownloadPdf={handleDownloadPdf}
        disabled={cardImages.length === 0 || exporting}
        loading={exporting}
      />
    </div>
  );
};
