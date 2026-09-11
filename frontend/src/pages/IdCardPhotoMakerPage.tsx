import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowLeft, ShieldCheck, SunMedium, Contrast, Paintbrush, RotateCcw, Upload, FileImage } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { validateCardImage, fileToDataUrl, loadImage, downloadCanvasAsImage } from '../utils/idCardProcessor';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardPhotoMakerPage: React.FC = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('photo.jpg');
  const [sourceFileSize, setSourceFileSize] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useBgColor, setUseBgColor] = useState(false);
  const [outputW, setOutputW] = useState(300);
  const [outputH, setOutputH] = useState(400);
  const [lockAspect, setLockAspect] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const v = validateCardImage(file);
    if (!v.valid) { setError(v.error || 'Invalid file'); return; }
    try {
      setSourceFileName(file.name);
      setSourceFileSize(file.size);
      const url = await fileToDataUrl(file);
      setSourceUrl(url);
      const img = await loadImage(url);
      setSourceImg(img);
      setOutputW(Math.min(img.width, 600));
      setOutputH(Math.min(img.height, 800));
    } catch { setError('Failed to load image'); }
  };

  const renderPreview = useCallback(() => {
    if (!sourceImg || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = outputW;
    c.height = outputH;
    const ctx = c.getContext('2d')!;
    if (useBgColor) { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, outputW, outputH); }
    const filters: string[] = [];
    if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`);
    if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`);
    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
    const ia = sourceImg.width / sourceImg.height;
    const oa = outputW / outputH;
    let dw: number, dh: number, dx: number, dy: number;
    if (ia > oa) { dh = outputH; dw = dh * ia; dx = (outputW - dw) / 2; dy = 0; }
    else { dw = outputW; dh = dw / ia; dx = 0; dy = (outputH - dh) / 2; }
    ctx.drawImage(sourceImg, dx, dy, dw, dh);
    ctx.filter = 'none';
  }, [sourceImg, brightness, contrast, bgColor, useBgColor, outputW, outputH]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const handleWidthChange = (w: number) => {
    setOutputW(w);
    if (lockAspect && sourceImg) setOutputH(Math.round(w / (sourceImg.width / sourceImg.height)));
  };
  const handleHeightChange = (h: number) => {
    setOutputH(h);
    if (lockAspect && sourceImg) setOutputW(Math.round(h * (sourceImg.width / sourceImg.height)));
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const outName = `ID_Photo_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    downloadCanvasAsImage(canvasRef.current, `ID_Photo_${Date.now()}`, format);

    recordToolHistorySafely({
      tool: 'id-card-photo-maker',
      toolName: 'ID Card Photo Maker',
      inputFiles: [{ name: sourceFileName, size: sourceFileSize, type: 'image/*' }],
      outputFile: { name: outName, type: format === 'jpeg' ? 'image/jpeg' : 'image/png' },
      status: 'completed',
      metadata: { width: outputW, height: outputH, format, brightness, contrast },
    }).catch(() => {});
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link>
            <span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link>
            <span>/</span>
            <span className="text-teal-400">ID Card Photo Maker</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Photo Maker</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Prepare and optimize photos for ID card use with crop, resize, and color adjustments.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />100% Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back to Tools</Button></Link>
        </div>
      </div>

      {!sourceUrl ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60 cursor-pointer transition-all"
          role="button"
          tabIndex={0}
          aria-label="Upload photo"
        >
          <Upload className="w-10 h-10 text-slate-500" />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">Drop photo here or click to upload</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP — Max 20MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} className="hidden" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-4">
              <h3 className="text-sm font-bold text-white">Output Size</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input id="pw" label="Width (px)" type="number" min={50} max={3000} value={outputW} onChange={(e) => handleWidthChange(Number(e.target.value) || 300)} />
                <Input id="ph" label="Height (px)" type="number" min={50} max={3000} value={outputH} onChange={(e) => handleHeightChange(Number(e.target.value) || 400)} />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-teal-500" />
                Lock aspect ratio
              </label>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-3">
              <h3 className="text-sm font-bold text-white">Adjustments</h3>
              <Input id="pb" label={`Brightness (${brightness})`} type="range" min={-50} max={50} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} leftIcon={<SunMedium className="w-3.5 h-3.5" />} />
              <Input id="pc" label={`Contrast (${contrast})`} type="range" min={-50} max={50} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} leftIcon={<Contrast className="w-3.5 h-3.5" />} />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={useBgColor} onChange={(e) => setUseBgColor(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-teal-500" />
                  <Paintbrush className="w-3.5 h-3.5 text-slate-400" /> Background
                </label>
                {useBgColor && <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Background color" />}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setBrightness(0); setContrast(0); setUseBgColor(false); }} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>Reset</Button>
              <Button variant="secondary" size="sm" onClick={() => { setSourceUrl(null); setSourceImg(null); }}>Change Photo</Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 flex items-center justify-center overflow-auto">
              <canvas ref={canvasRef} className="shadow-xl rounded-lg max-w-full" style={{ maxHeight: '400px' }} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleDownload('png')} leftIcon={<FileImage className="w-3.5 h-3.5 text-emerald-400" />}>Download PNG</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload('jpeg')} leftIcon={<FileImage className="w-3.5 h-3.5 text-amber-400" />}>Download JPG</Button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
};
