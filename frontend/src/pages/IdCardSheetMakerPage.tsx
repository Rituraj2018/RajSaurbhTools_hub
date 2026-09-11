import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft, ShieldCheck, Upload, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { IdCardDimensionPicker, IdCardSheetLayout, IdCardExportPanel } from '../components/idCard';
import { CardDimensions, CARD_PRESETS, validateCardImage, fileToDataUrl, downloadCanvasAsImage } from '../utils/idCardProcessor';
import { generateSheetPdfFromImages } from '../utils/idCardPdfGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardSheetMakerPage: React.FC = () => {
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [sheetCanvas, setSheetCanvas] = useState<HTMLCanvasElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);
    const urls: string[] = [];
    for (const f of files) {
      const v = validateCardImage(f);
      if (!v.valid) { setError(v.error || 'Invalid'); continue; }
      try { urls.push(await fileToDataUrl(f)); } catch { setError('Failed to read file'); }
    }
    setCardImages(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  const handleSheetReady = useCallback((canvas: HTMLCanvasElement) => { setSheetCanvas(canvas); }, []);

  const handleDownloadPng = () => {
    if (sheetCanvas) {
      const outName = `Sheet_${Date.now()}.png`;
      downloadCanvasAsImage(sheetCanvas, `Sheet_${Date.now()}`, 'png');
      recordToolHistorySafely({
        tool: 'id-card-sheet-maker',
        toolName: 'ID Card Sheet Maker',
        inputFiles: cardImages.map((_, i) => ({ name: `card_${i + 1}.png`, type: 'image/png' })),
        outputFile: { name: outName, type: 'image/png' },
        status: 'completed',
        metadata: { format: 'png', cardCount: cardImages.length, width: dimensions.widthPx, height: dimensions.heightPx },
      }).catch(() => {});
    }
  };

  const handleDownloadJpg = () => {
    if (sheetCanvas) {
      const outName = `Sheet_${Date.now()}.jpg`;
      downloadCanvasAsImage(sheetCanvas, `Sheet_${Date.now()}`, 'jpeg');
      recordToolHistorySafely({
        tool: 'id-card-sheet-maker',
        toolName: 'ID Card Sheet Maker',
        inputFiles: cardImages.map((_, i) => ({ name: `card_${i + 1}.jpg`, type: 'image/jpeg' })),
        outputFile: { name: outName, type: 'image/jpeg' },
        status: 'completed',
        metadata: { format: 'jpg', cardCount: cardImages.length, width: dimensions.widthPx, height: dimensions.heightPx },
      }).catch(() => {});
    }
  };

  const handleDownloadPdf = async () => {
    if (!sheetCanvas) return;
    setExporting(true);
    try {
      const outName = `Sheet_${Date.now()}.pdf`;
      await generateSheetPdfFromImages(sheetCanvas, { filename: `Sheet_${Date.now()}` });
      await recordToolHistorySafely({
        tool: 'id-card-sheet-maker',
        toolName: 'ID Card Sheet Maker',
        inputFiles: cardImages.map((_, i) => ({ name: `card_${i + 1}.png`, type: 'image/png' })),
        outputFile: { name: outName, type: 'application/pdf' },
        status: 'completed',
        metadata: { format: 'pdf', cardCount: cardImages.length, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card Sheet Maker</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Sheet Maker</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Arrange multiple card images on a printable A4 sheet.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Card Images ({cardImages.length})</h3>
          <label className="cursor-pointer">
            <Button variant="secondary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={() => document.getElementById('sheet-upload')?.click()}>Add Images</Button>
            <input id="sheet-upload" type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>
        </div>
        {cardImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {cardImages.map((img, i) => (
              <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-700 group">
                <img src={img} alt={`Card ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => setCardImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${i + 1}`}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
      </div>

      <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />
      <IdCardSheetLayout cardImages={cardImages} cardWidthPx={dimensions.widthPx} cardHeightPx={dimensions.heightPx} onSheetReady={handleSheetReady} />
      <IdCardExportPanel onDownloadPng={handleDownloadPng} onDownloadJpg={handleDownloadJpg} onDownloadPdf={handleDownloadPdf} disabled={cardImages.length === 0 || exporting} loading={exporting} />
    </div>
  );
};
