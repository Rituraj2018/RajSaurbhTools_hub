import React, { useEffect, useRef, useState } from 'react';
import { Download, Printer, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import {
  PanDocItem,
  PanPrintOptions,
  generatePanPrintSheet,
  generatePanA4Pdf,
  generatePanCr80DirectPdf,
} from '../../utils/panProcessor';

interface PanPreviewProps {
  documents: PanDocItem[];
  printOptions: PanPrintOptions;
  activeDocIndex: number;
}

export const PanPreview: React.FC<PanPreviewProps> = ({
  documents,
  printOptions,
  activeDocIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const printSheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Re-generate print sheet whenever docs or options update
  useEffect(() => {
    if (documents.length === 0) return;

    setIsGenerating(true);
    const timer = setTimeout(() => {
      try {
        const sheet = generatePanPrintSheet(documents, printOptions);
        printSheetCanvasRef.current = sheet;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          sheet.style.width = '100%';
          sheet.style.height = 'auto';
          sheet.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
          sheet.style.display = 'block';
          containerRef.current.appendChild(sheet);
        }
      } catch (err) {
        console.error('Failed to generate sheet:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [documents, printOptions]);

  // Download A4 Print PDF
  const handleDownloadA4Pdf = () => {
    if (!printSheetCanvasRef.current) return;
    const pdf = generatePanA4Pdf(printSheetCanvasRef.current);
    pdf.save('PAN_Cards_A4_PrintSheet_RajTools.pdf');
  };

  // Download Direct CR80 PDF for Plastic Card Printers
  const handleDownloadCr80Pdf = () => {
    const activeDoc = documents[activeDocIndex] || documents[0];
    if (!activeDoc) return;
    const pdf = generatePanCr80DirectPdf(activeDoc);
    pdf.save(`${activeDoc.name.replace(/\.[^/.]+$/, '')}_CR80_PlasticCard.pdf`);
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!printSheetCanvasRef.current) return;
    const a = document.createElement('a');
    a.href = printSheetCanvasRef.current.toDataURL('image/png');
    a.download = 'PAN_Cards_A4_PrintSheet_RajTools.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct Browser Print
  const handlePrint = () => {
    if (!printSheetCanvasRef.current) return;
    const imgData = printSheetCanvasRef.current.toDataURL('image/jpeg', 0.98);
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print PAN Cards - RajSaurbh Tools_Hub</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: 210mm;
              height: 297mm;
              display: block;
              page-break-after: avoid;
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-2xl sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Live Print Preview</h3>
            <p className="text-xs text-slate-400">
              {documents.length} {documents.length === 1 ? 'Card' : 'Cards'} on A4 Sheet
            </p>
          </div>
        </div>

        {isGenerating && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
      </div>

      {/* Live Canvas Sheet Preview */}
      <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-2 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[460px] overflow-y-auto custom-scrollbar">
        <div ref={containerRef} className="w-full max-w-[320px] transition-opacity duration-200" />
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleDownloadA4Pdf}
          leftIcon={<Download className="w-5 h-5" />}
        >
          <span>Download A4 Print PDF ({documents.length} {documents.length === 1 ? 'Card' : 'Cards'})</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCr80Pdf}
            leftIcon={<CreditCard className="w-3.5 h-3.5 text-blue-400" />}
          >
            <span>Direct CR80 PVC</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-400" />}
          >
            <span>Direct Print</span>
          </Button>
        </div>

        <button
          type="button"
          onClick={handleDownloadPng}
          className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Download High-Res Sheet Image (PNG)
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center pt-2 border-t border-slate-800/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>300 DPI true dimensions • Ideal for PVC card laminating</span>
      </div>
    </div>
  );
};
