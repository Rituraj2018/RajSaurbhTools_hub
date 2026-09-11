import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft, ShieldCheck, Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { BarcodeFormat, BarcodeOptions, BARCODE_FORMATS, validateBarcodeData, generateBarcodeCanvas, downloadBarcode } from '../utils/barcodeGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardBarcodeGeneratorPage: React.FC = () => {
  const [data, setData] = useState('');
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(80);
  const [showValue, setShowValue] = useState(true);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const renderPreview = useCallback(() => {
    if (!previewRef.current) return;
    previewRef.current.innerHTML = '';
    if (!data.trim()) return;

    const validation = validateBarcodeData(data, format);
    if (!validation.valid) {
      setError(validation.error || 'Invalid data');
      return;
    }
    setError(null);

    const opts: BarcodeOptions = {
      format, data: data.trim(), width: barWidth, height: barHeight,
      displayValue: showValue, lineColor: fgColor, background: bgColor,
    };
    const canvas = generateBarcodeCanvas(opts);
    canvas.style.maxWidth = '100%';
    canvas.style.borderRadius = '8px';
    canvas.className = 'shadow-lg';
    previewRef.current.appendChild(canvas);
  }, [data, format, barWidth, barHeight, showValue, fgColor, bgColor]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const handleDownload = () => {
    if (!data.trim()) return;
    const validation = validateBarcodeData(data, format);
    if (!validation.valid) { setError(validation.error || 'Invalid'); return; }
    const outName = `ID_Card_Barcode_${Date.now()}.png`;
    downloadBarcode({ format, data: data.trim(), width: barWidth, height: barHeight, displayValue: showValue, lineColor: fgColor, background: bgColor }, `ID_Card_Barcode_${Date.now()}`);

    recordToolHistorySafely({
      tool: 'id-card-barcode-generator',
      toolName: 'ID Card Barcode Generator',
      inputFiles: [{ name: 'barcode_data.txt', size: data.length, type: 'text/plain' }],
      outputFile: { name: outName, type: 'image/png' },
      status: 'completed',
      metadata: { format, barWidth, barHeight, showValue },
    }).catch(() => {});
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card Barcode Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Barcode Generator</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Generate barcodes in Code128, Code39, EAN, UPC, and more for ID cards.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Barcode Format</label>
            <select value={format} onChange={e => { setFormat(e.target.value as BarcodeFormat); setError(null); }}
              className="w-full h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/80" aria-label="Barcode format">
              {BARCODE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label} — {f.description}</option>)}
            </select>
          </div>
          <Input id="barcode-data" label="Data" value={data} onChange={e => setData(e.target.value)} placeholder="Enter barcode data" />
          <div className="grid grid-cols-2 gap-3">
            <Input id="bar-width" label="Bar Width" type="number" min={1} max={5} value={barWidth} onChange={e => setBarWidth(Number(e.target.value) || 2)} />
            <Input id="bar-height" label="Bar Height (px)" type="number" min={30} max={200} value={barHeight} onChange={e => setBarHeight(Number(e.target.value) || 80)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={showValue} onChange={e => setShowValue(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-teal-500" />
            Show data value below barcode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Line Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Barcode line color" />
                <span className="text-xs font-mono text-slate-400">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Barcode background color" />
                <span className="text-xs font-mono text-slate-400">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div ref={previewRef} className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 flex items-center justify-center min-h-[200px]">
            {!data.trim() && (
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Enter data to generate barcode</p>
              </div>
            )}
          </div>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
          <Button variant="gradient" size="sm" onClick={handleDownload} disabled={!data.trim()} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Download Barcode PNG
          </Button>
        </div>
      </div>
    </div>
  );
};
