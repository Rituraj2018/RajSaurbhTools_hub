import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft, ShieldCheck, Printer, Upload, X, RotateCw, Maximize } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { IdCardDimensionPicker, IdCardExportPanel } from '../components/idCard';
import { CardDimensions, CARD_PRESETS, validateCardImage, fileToDataUrl, loadImage, downloadCanvasAsImage, calculateSheetLayout, renderSheetFromImages } from '../utils/idCardProcessor';
import { generateA4CardPdf, generateSheetPdfFromImages } from '../utils/idCardPdfGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardPrintPreviewPage: React.FC = () => {
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [frontFileName, setFrontFileName] = useState<string>('card_front.png');
  const [frontFileSize, setFrontFileSize] = useState<number>(0);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'a4' | 'multi'>('card');
  const [copies, setCopies] = useState(4);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = async (file: File, side: 'front' | 'back') => {
    setError(null);
    const v = validateCardImage(file);
    if (!v.valid) { setError(v.error || 'Invalid'); return; }
    try {
      const url = await fileToDataUrl(file);
      if (side === 'front') {
        setFrontImage(url);
        setFrontFileName(file.name);
        setFrontFileSize(file.size);
      } else {
        setBackImage(url);
      }
    } catch { setError('Failed to read file'); }
  };

  // Render card preview
  const renderCardPreview = useCallback(async () => {
    const imgSrc = showBack && backImage ? backImage : frontImage;
    if (!imgSrc || !cardCanvasRef.current) return;
    try {
      const img = await loadImage(imgSrc);
      const c = cardCanvasRef.current;
      c.width = dimensions.widthPx;
      c.height = dimensions.heightPx;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
    } catch {}
  }, [frontImage, backImage, showBack, dimensions]);

  // Render sheet preview
  const renderSheetPreview = useCallback(async () => {
    if (!frontImage || !sheetCanvasRef.current) return;
    try {
      const layout = calculateSheetLayout(dimensions.widthPx, dimensions.heightPx);
      const images = Array(Math.min(copies, layout.rows * layout.cols)).fill(frontImage);
      const sheet = await renderSheetFromImages(images, layout);
      const c = sheetCanvasRef.current;
      c.width = sheet.width;
      c.height = sheet.height;
      c.getContext('2d')!.drawImage(sheet, 0, 0);
    } catch {}
  }, [frontImage, copies, dimensions]);

  useEffect(() => { renderCardPreview(); }, [renderCardPreview]);
  useEffect(() => { if (viewMode === 'multi' || viewMode === 'a4') renderSheetPreview(); }, [renderSheetPreview, viewMode]);

  const handlePrint = () => {
    window.print();
    recordToolHistorySafely({
      tool: 'id-card-print-preview',
      toolName: 'ID Card Print Preview',
      inputFiles: [{ name: frontFileName, size: frontFileSize, type: 'image/*' }],
      status: 'completed',
      metadata: { action: 'print', viewMode, copies: viewMode === 'multi' ? copies : 1 },
    }).catch(() => {});
  };

  const handleDownloadPng = () => {
    const c = viewMode === 'card' ? cardCanvasRef.current : sheetCanvasRef.current;
    if (c) {
      const outName = `Print_Preview_${Date.now()}.png`;
      downloadCanvasAsImage(c, `Print_Preview_${Date.now()}`, 'png');
      recordToolHistorySafely({
        tool: 'id-card-print-preview',
        toolName: 'ID Card Print Preview',
        inputFiles: [{ name: frontFileName, size: frontFileSize, type: 'image/*' }],
        outputFile: { name: outName, type: 'image/png' },
        status: 'completed',
        metadata: { format: 'png', viewMode, width: dimensions.widthPx, height: dimensions.heightPx },
      }).catch(() => {});
    }
  };

  const handleDownloadJpg = () => {
    const c = viewMode === 'card' ? cardCanvasRef.current : sheetCanvasRef.current;
    if (c) {
      const outName = `Print_Preview_${Date.now()}.jpg`;
      downloadCanvasAsImage(c, `Print_Preview_${Date.now()}`, 'jpeg');
      recordToolHistorySafely({
        tool: 'id-card-print-preview',
        toolName: 'ID Card Print Preview',
        inputFiles: [{ name: frontFileName, size: frontFileSize, type: 'image/*' }],
        outputFile: { name: outName, type: 'image/jpeg' },
        status: 'completed',
        metadata: { format: 'jpg', viewMode, width: dimensions.widthPx, height: dimensions.heightPx },
      }).catch(() => {});
    }
  };

  const handleDownloadPdf = async () => {
    if (!frontImage) return;
    setExporting(true);
    try {
      let outName = '';
      if (viewMode === 'card') {
        outName = `ID_Card_PDF_${Date.now()}.pdf`;
        const img = await loadImage(frontImage);
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.widthPx;
        canvas.height = dimensions.heightPx;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await generateA4CardPdf(canvas);
      } else if (sheetCanvasRef.current) {
        outName = `ID_Card_Sheet_PDF_${Date.now()}.pdf`;
        await generateSheetPdfFromImages(sheetCanvasRef.current);
      }
      await recordToolHistorySafely({
        tool: 'id-card-print-preview',
        toolName: 'ID Card Print Preview',
        inputFiles: [{ name: frontFileName, size: frontFileSize, type: 'image/*' }],
        outputFile: { name: outName || 'preview.pdf', type: 'application/pdf' },
        status: 'completed',
        metadata: { format: 'pdf', viewMode, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card Print Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Print Preview</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Preview your ID card at actual size before printing or downloading.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {/* Upload */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Front Side</label>
            {frontImage ? (
              <div className="relative w-28 h-18 rounded-lg overflow-hidden border border-slate-700">
                <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
                <button onClick={() => setFrontImage(null)} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400" aria-label="Remove front"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-500" /><span className="text-xs text-slate-400">Upload front</span>
                <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'front'); e.target.value = ''; }} className="hidden" />
              </label>
            )}
            <label className="text-xs font-semibold text-slate-300">Back Side (optional)</label>
            {backImage ? (
              <div className="relative w-28 h-18 rounded-lg overflow-hidden border border-slate-700">
                <img src={backImage} alt="Back" className="w-full h-full object-cover" />
                <button onClick={() => setBackImage(null)} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400" aria-label="Remove back"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-500" /><span className="text-xs text-slate-400">Upload back</span>
                <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'back'); e.target.value = ''; }} className="hidden" />
              </label>
            )}
          </div>

          <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />

          {/* View mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">View Mode</label>
            <div className="flex flex-wrap gap-2">
              {(['card', 'a4', 'multi'] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === m ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {m === 'card' ? 'Single Card' : m === 'a4' ? 'A4 Page' : 'Multi-Card'}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'multi' && (
            <Input id="pp-copies" label="Cards" type="number" min={1} max={10} value={copies} onChange={e => setCopies(Number(e.target.value) || 1)} />
          )}

          {backImage && viewMode === 'card' && (
            <Button variant="secondary" size="sm" onClick={() => setShowBack(!showBack)} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
              {showBack ? 'Show Front' : 'Show Back'}
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handlePrint} disabled={!frontImage} leftIcon={<Printer className="w-3.5 h-3.5" />}>Print</Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
            {!frontImage ? (
              <div className="text-center"><Eye className="w-10 h-10 text-slate-600 mx-auto mb-2" /><p className="text-xs text-slate-500">Upload a card image to preview</p></div>
            ) : viewMode === 'card' ? (
              <canvas ref={cardCanvasRef} className="shadow-xl rounded-lg max-w-full" style={{ maxHeight: '400px' }} />
            ) : (
              <canvas ref={sheetCanvasRef} className="shadow-xl rounded max-w-full" style={{ maxHeight: '500px' }} />
            )}
          </div>

          {frontImage && (
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{dimensions.widthMm} × {dimensions.heightMm} mm</span>
              <span>{dimensions.widthPx} × {dimensions.heightPx} px</span>
              <span>{dimensions.dpi} DPI</span>
            </div>
          )}

          <IdCardExportPanel onDownloadPng={handleDownloadPng} onDownloadJpg={handleDownloadJpg} onDownloadPdf={handleDownloadPdf} disabled={!frontImage || exporting} loading={exporting} />
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};
