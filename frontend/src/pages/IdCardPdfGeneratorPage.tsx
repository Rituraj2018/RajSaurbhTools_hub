import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldCheck, Upload, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { IdCardDimensionPicker } from '../components/idCard';
import { CardDimensions, CARD_PRESETS, validateCardImage, fileToDataUrl, loadImage, calculateSheetLayout } from '../utils/idCardProcessor';
import { generateSheetPdfFromImages, generateA4CardPdf } from '../utils/idCardPdfGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardPdfGeneratorPage: React.FC = () => {
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [frontFileName, setFrontFileName] = useState<string>('front.png');
  const [frontFileSize, setFrontFileSize] = useState<number>(0);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'sheet'>('single');
  const [copies, setCopies] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGeneratePdf = async () => {
    if (!frontImage) { setError('Please upload a front-side card image.'); return; }
    setExporting(true);
    try {
      const img = await loadImage(frontImage);
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.widthPx;
      canvas.height = dimensions.heightPx;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let outName = '';
      if (mode === 'single') {
        outName = `ID_Card_PDF_${Date.now()}.pdf`;
        await generateA4CardPdf(canvas, { filename: `ID_Card_PDF_${Date.now()}` });
      } else {
        outName = `ID_Card_Sheet_PDF_${Date.now()}.pdf`;
        const layout = calculateSheetLayout(dimensions.widthPx, dimensions.heightPx);
        const images = Array(Math.min(copies, layout.rows * layout.cols)).fill(frontImage);
        const { renderSheetFromImages } = await import('../utils/idCardProcessor');
        const sheetCanvas = await renderSheetFromImages(images, layout);
        await generateSheetPdfFromImages(sheetCanvas, { filename: `ID_Card_Sheet_PDF_${Date.now()}` });
      }

      await recordToolHistorySafely({
        tool: 'id-card-pdf-generator',
        toolName: 'ID Card PDF Generator',
        inputFiles: [{ name: frontFileName, size: frontFileSize, type: 'image/*' }],
        outputFile: { name: outName, type: 'application/pdf' },
        status: 'completed',
        metadata: { mode, copies: mode === 'sheet' ? copies : 1, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } catch (e: any) {
      setError(e.message || 'PDF generation failed');
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
            <span className="text-teal-400">ID Card PDF Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card PDF Generator</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Convert ID card images to print-ready PDF documents.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex gap-2">
            <button onClick={() => setMode('single')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${mode === 'single' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
              Single Card PDF
            </button>
            <button onClick={() => setMode('sheet')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${mode === 'sheet' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
              A4 Sheet PDF
            </button>
          </div>

          <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />

          {/* Front upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Front Side</label>
            {frontImage ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
                <button onClick={() => setFrontImage(null)} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400" aria-label="Remove front"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-500" /><span className="text-xs text-slate-400">Upload front card</span>
                <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'front'); e.target.value = ''; }} className="hidden" />
              </label>
            )}
          </div>

          {/* Back upload (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Back Side (optional)</label>
            {backImage ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                <img src={backImage} alt="Back" className="w-full h-full object-cover" />
                <button onClick={() => setBackImage(null)} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-900/80 text-slate-300 hover:text-rose-400" aria-label="Remove back"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-500" /><span className="text-xs text-slate-400">Upload back card</span>
                <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'back'); e.target.value = ''; }} className="hidden" />
              </label>
            )}
          </div>

          {mode === 'sheet' && (
            <Input id="pdf-copies" label="Cards per sheet" type="number" min={1} max={10} value={copies} onChange={e => setCopies(Number(e.target.value) || 1)} />
          )}
        </div>

        <div className="space-y-4">
          {frontImage && (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 flex items-center justify-center">
              <img src={frontImage} alt="Preview" className="max-h-60 rounded-lg shadow-lg" />
            </div>
          )}
          <Button variant="gradient" size="md" onClick={handleGeneratePdf} disabled={!frontImage || exporting} isLoading={exporting} leftIcon={<FileText className="w-4 h-4" />}>
            Generate PDF
          </Button>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};
