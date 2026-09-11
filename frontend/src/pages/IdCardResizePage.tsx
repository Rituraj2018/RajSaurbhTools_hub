import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, ArrowLeft, ShieldCheck, Upload, FileImage } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { IdCardDimensionPicker } from '../components/idCard';
import { CardDimensions, CARD_PRESETS, validateCardImage, fileToDataUrl, loadImage, downloadCanvasAsImage } from '../utils/idCardProcessor';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardResizePage: React.FC = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('card.png');
  const [sourceFileSize, setSourceFileSize] = useState<number>(0);
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const v = validateCardImage(file);
    if (!v.valid) { setError(v.error || 'Invalid'); return; }
    try {
      setSourceFileName(file.name);
      setSourceFileSize(file.size);
      const url = await fileToDataUrl(file);
      setSourceUrl(url);
      setSourceImg(await loadImage(url));
    } catch { setError('Failed to load image'); }
  };

  const renderPreview = useCallback(() => {
    if (!sourceImg || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = dimensions.widthPx;
    c.height = dimensions.heightPx;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImg, 0, 0, c.width, c.height);
  }, [sourceImg, dimensions]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const handleDownload = (fmt: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const outName = `ID_Card_Resized_${Date.now()}.${fmt === 'jpeg' ? 'jpg' : 'png'}`;
    downloadCanvasAsImage(canvasRef.current, `ID_Card_Resized_${Date.now()}`, fmt, quality / 100);

    recordToolHistorySafely({
      tool: 'id-card-resize',
      toolName: 'ID Card Resize',
      inputFiles: [{ name: sourceFileName, size: sourceFileSize, type: 'image/*' }],
      outputFile: { name: outName, type: fmt === 'jpeg' ? 'image/jpeg' : 'image/png' },
      status: 'completed',
      metadata: { width: dimensions.widthPx, height: dimensions.heightPx, dpi: dimensions.dpi, format: fmt, quality },
    }).catch(() => {});
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card Resize</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Resize</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Resize ID card images to CR80 or custom dimensions with quality control.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      {!sourceUrl ? (
        <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all" role="button" tabIndex={0} aria-label="Upload card image">
          <Upload className="w-10 h-10 text-slate-500" />
          <p className="text-sm font-semibold text-slate-300">Drop card image or click to upload</p>
          <p className="text-xs text-slate-500">JPG, PNG, WebP — Max 20MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} className="hidden" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />
            <Input id="resize-quality" label={`Quality (${quality}%)`} type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setSourceUrl(null); setSourceImg(null); }}>Change Image</Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 flex items-center justify-center overflow-auto">
              <canvas ref={canvasRef} className="shadow-xl rounded-lg max-w-full" style={{ maxHeight: '400px' }} />
            </div>
            <div className="text-[10px] text-slate-500">Output: {dimensions.widthPx} × {dimensions.heightPx} px @ {dimensions.dpi} DPI</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleDownload('png')} leftIcon={<FileImage className="w-3.5 h-3.5 text-emerald-400" />}>PNG</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload('jpeg')} leftIcon={<FileImage className="w-3.5 h-3.5 text-amber-400" />}>JPG</Button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
};
