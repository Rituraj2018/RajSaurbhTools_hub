import React, { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check, FileDown, ShieldCheck, Printer, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import {
  QrStylingOptions,
  generateQrCanvas,
  generateQrSvg,
  downloadQrPng,
  downloadQrSvg,
  downloadQrPdf,
} from '../../utils/qrGeneratorProcessor';

interface QrPreviewCardProps {
  payloadText: string;
  stylingOptions: QrStylingOptions;
  title?: string;
  subtitle?: string;
}

export const QrPreviewCard: React.FC<QrPreviewCardProps> = ({
  payloadText,
  stylingOptions,
  title = 'Scan with Phone',
  subtitle = 'Point your camera to scan',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const renderQr = async () => {
      if (!payloadText.trim()) {
        setError(null);
        return;
      }

      try {
        setError(null);
        const canvas = await generateQrCanvas(payloadText, stylingOptions);
        const svg = await generateQrSvg(payloadText, stylingOptions);

        if (!isCancelled) {
          canvasRef.current = canvas;
          setSvgContent(svg);

          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.borderRadius = '1rem';
            canvas.style.display = 'block';
            containerRef.current.appendChild(canvas);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to generate QR code:', err);
          setError(err?.message || 'Failed to generate QR code.');
        }
      }
    };

    renderQr();

    return () => {
      isCancelled = true;
    };
  }, [payloadText, stylingOptions]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    downloadQrPng(canvasRef.current, 'QRCode_RajTools');
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    downloadQrSvg(svgContent, 'QRCode_RajTools');
  };

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    downloadQrPdf(canvasRef.current, title, subtitle, 'QRCode_PrintReady_RajTools');
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.warn('Clipboard write not supported:', err);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-2xl sticky top-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Live QR Preview</h3>
            <p className="text-xs text-slate-400">High-DPI vector & raster</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyImage}
          disabled={!payloadText.trim()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Copy image to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* QR Canvas Display */}
      <div className="relative aspect-square max-w-[320px] mx-auto rounded-2xl bg-white p-4 flex items-center justify-center shadow-2xl border border-slate-700 overflow-hidden">
        {payloadText.trim() ? (
          <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Enter Details to Generate</p>
            <p className="text-[11px] text-slate-400">
              Fill in UPI ID, URL or text to render a live QR code.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Download Actions Grid */}
      <div className="space-y-3 pt-2">
        <Button
          variant="gradient"
          size="md"
          className="w-full"
          disabled={!payloadText.trim()}
          onClick={handleDownloadPng}
          leftIcon={<Download className="w-4 h-4" />}
        >
          <span>Download High-Res PNG ({stylingOptions.size}px)</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={!payloadText.trim()}
            onClick={handleDownloadSvg}
            leftIcon={<FileDown className="w-3.5 h-3.5 text-purple-400" />}
          >
            <span>Vector SVG</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={!payloadText.trim()}
            onClick={handleDownloadPdf}
            leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-400" />}
          >
            <span>Print PDF Standee</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center pt-2 border-t border-slate-800/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Generated 100% offline in browser • No tracking</span>
      </div>
    </div>
  );
};
