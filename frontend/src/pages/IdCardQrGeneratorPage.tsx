import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowLeft, ShieldCheck, Download, FileImage } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import QRCode from 'qrcode';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardQrGeneratorPage: React.FC = () => {
  const [data, setData] = useState('');
  const [size, setSize] = useState(200);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const generateQr = useCallback(async () => {
    if (!data.trim()) { setQrError(null); return; }
    setQrError(null);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, data.trim(), {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });
    } catch (err: any) {
      setQrError(err?.message || 'Failed to generate QR code');
    }
  }, [data, size, errorCorrection, fgColor, bgColor]);

  useEffect(() => { generateQr(); }, [generateQr]);

  const handleDownload = (format: 'png' | 'svg') => {
    if (!canvasRef.current || !data.trim()) return;
    const outName = `ID_Card_QR_${Date.now()}.${format}`;
    if (format === 'png') {
      canvasRef.current.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        recordToolHistorySafely({
          tool: 'id-card-qr-generator',
          toolName: 'ID Card QR Generator',
          inputFiles: [{ name: 'qr_data.txt', size: data.length, type: 'text/plain' }],
          outputFile: { name: outName, size: blob.size, type: 'image/png' },
          status: 'completed',
          metadata: { format: 'png', size, errorCorrection },
        }).catch(() => {});
      }, 'image/png');
    } else {
      QRCode.toString(data.trim(), {
        type: 'svg',
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      }).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        recordToolHistorySafely({
          tool: 'id-card-qr-generator',
          toolName: 'ID Card QR Generator',
          inputFiles: [{ name: 'qr_data.txt', size: data.length, type: 'text/plain' }],
          outputFile: { name: outName, size: blob.size, type: 'image/svg+xml' },
          status: 'completed',
          metadata: { format: 'svg', size, errorCorrection },
        }).catch(() => {});
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card QR Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card QR Generator</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Generate QR codes for use on ID cards — text, URLs, or reference data.</p>
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
          <Input id="qr-data" label="QR Data" value={data} onChange={e => setData(e.target.value)} placeholder="Enter text, URL, or ID reference" />
          <div className="grid grid-cols-2 gap-3">
            <Input id="qr-size" label="Size (px)" type="number" min={100} max={1000} value={size} onChange={e => setSize(Number(e.target.value) || 200)} />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Error Correction</label>
              <select value={errorCorrection} onChange={e => setErrorCorrection(e.target.value as any)} className="w-full h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/80" aria-label="Error correction level">
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="QR foreground color" />
                <span className="text-xs font-mono text-slate-400">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="QR background color" />
                <span className="text-xs font-mono text-slate-400">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 flex items-center justify-center min-h-[250px]">
            {data.trim() ? (
              <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
            ) : (
              <div className="text-center">
                <QrCode className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Enter data to generate QR code</p>
              </div>
            )}
          </div>
          {qrError && <p className="text-[11px] text-rose-400">{qrError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleDownload('png')} disabled={!data.trim()} leftIcon={<FileImage className="w-3.5 h-3.5 text-emerald-400" />}>Download PNG</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDownload('svg')} disabled={!data.trim()} leftIcon={<Download className="w-3.5 h-3.5 text-blue-400" />}>Download SVG</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
