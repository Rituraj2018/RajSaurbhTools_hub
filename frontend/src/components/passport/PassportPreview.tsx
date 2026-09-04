import React, { useState, useRef, useCallback } from 'react';
import {
  Download,
  Printer,
  FileImage,
  FileText,
  CheckCircle,
  Layers,
  ZoomIn,
  ZoomOut,
  GripHorizontal,
} from 'lucide-react';
import {
  PaperSize,
  SheetOptions,
  downloadCanvasImage,
  PASSPORT_WIDTH_MM,
  PASSPORT_HEIGHT_MM,
  calculatePrintGrid,
} from '../../utils/passportProcessor';
import { generatePDFSheet } from '../../utils/pdfGenerator';
import { Button } from '../common/Button';
import { GoogleDriveButton } from '../cloud';

export interface PassportPreviewProps {
  passportCanvas: HTMLCanvasElement | null;
  sheetCanvas: HTMLCanvasElement | null;
  paperSize: PaperSize;
  copies: number;
  /** Current photo group offset (px in canvas space). */
  photoPosition: { x: number; y: number };
  onPhotoPositionChange: (pos: { x: number; y: number }) => void;
  /** Needed to compute boundary limits during drag. */
  sheetOptions: SheetOptions;
}

export const PassportPreview: React.FC<PassportPreviewProps> = ({
  passportCanvas,
  sheetCanvas,
  paperSize,
  copies,
  photoPosition,
  onPhotoPositionChange,
  sheetOptions,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'sheet'>('sheet');
  const [sheetZoom, setSheetZoom] = useState<number>(1);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs for drag tracking (avoid stale closure issues)
  const dragStartPtr  = useRef<{ x: number; y: number } | null>(null);
  const dragStartPos  = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sheetImgRef   = useRef<HTMLImageElement | null>(null);

  // Compute clamped position using current grid boundaries
  const clampPosition = useCallback(
    (rawX: number, rawY: number): { x: number; y: number } => {
      const grid = calculatePrintGrid(
        sheetOptions.paperSize,
        sheetOptions.copies,
        sheetOptions.landscape
      );
      const totalGridW = grid.cols * grid.photoWidthPx + (grid.cols - 1) * grid.gapXPx;
      const totalGridH = grid.rows * grid.photoHeightPx + (grid.rows - 1) * grid.gapYPx;
      const minX = -grid.startX;
      const maxX = grid.sheetWidthPx - grid.startX - totalGridW;
      const minY = -grid.startY;
      const maxY = grid.sheetHeightPx - grid.startY - totalGridH;
      return {
        x: Math.round(Math.min(maxX, Math.max(minX, rawX))),
        y: Math.round(Math.min(maxY, Math.max(minY, rawY))),
      };
    },
    [sheetOptions]
  );

  // --- Pointer-event drag handlers ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sheetCanvas) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartPtr.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: photoPosition.x, y: photoPosition.y };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartPtr.current || !sheetCanvas) return;

    // Scale ratio: CSS display width / canvas actual width
    const displayedWidth = sheetImgRef.current?.getBoundingClientRect().width ?? sheetCanvas.width;
    const scaleRatio = displayedWidth / sheetCanvas.width;

    const deltaPxCanvas = {
      x: (e.clientX - dragStartPtr.current.x) / scaleRatio,
      y: (e.clientY - dragStartPtr.current.y) / scaleRatio,
    };

    const newPos = clampPosition(
      dragStartPos.current.x + deltaPxCanvas.x,
      dragStartPos.current.y + deltaPxCanvas.y
    );
    onPhotoPositionChange(newPos);
  };

  const handlePointerUp = () => {
    dragStartPtr.current = null;
    setIsDragging(false);
  };

  // Single Photo Downloads
  const handleDownloadSingleJpg = () => {
    if (!passportCanvas) return;
    downloadCanvasImage(passportCanvas, `Passport_Photo_35x45mm_${Date.now()}`, 'jpg', 0.95);
  };

  const handleDownloadSinglePng = () => {
    if (!passportCanvas) return;
    downloadCanvasImage(passportCanvas, `Passport_Photo_35x45mm_${Date.now()}`, 'png');
  };

  // Sheet Downloads
  const handleDownloadSheetJpg = () => {
    if (!sheetCanvas) return;
    downloadCanvasImage(
      sheetCanvas,
      `Passport_Print_Sheet_${paperSize}_${copies}Copies_${Date.now()}`,
      'jpg',
      0.95
    );
  };

  const handleDownloadSheetPng = () => {
    if (!sheetCanvas) return;
    downloadCanvasImage(
      sheetCanvas,
      `Passport_Print_Sheet_${paperSize}_${copies}Copies_${Date.now()}`,
      'png'
    );
  };

  const handleDownloadPDF = async () => {
    if (!sheetCanvas) return;
    try {
      setIsExportingPDF(true);
      await generatePDFSheet(sheetCanvas, {
        paperSize,
        filename: `Passport_Print_Sheet_${paperSize}_${copies}Copies_${Date.now()}`,
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleBrowserPrint = () => {
    if (!sheetCanvas) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataUrl = sheetCanvas.toDataURL('image/png');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Passport Photo Studio - Print Sheet</title>
          <style>
            @page {
              size: ${paperSize === 'A4' ? 'A4 portrait' : '4in 6in portrait'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Preview Tab Switcher */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sheet'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Print Sheet Preview ({copies} Copies)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Single Photo (35 × 45 mm)</span>
          </button>
        </div>

        {activeTab === 'sheet' && (
          <div className="hidden sm:flex items-center gap-1 pr-2">
            <button
              onClick={() => setSheetZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 min-w-[32px] text-center">
              {Math.round(sheetZoom * 100)}%
            </span>
            <button
              onClick={() => setSheetZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Visual Display */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-8 flex items-center justify-center min-h-[420px] overflow-hidden shadow-2xl relative">
        {activeTab === 'single' ? (
          /* Single Photo Display */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fadeIn">
            <div className="relative group">
              {/* Dimensions Labels */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-blue-400 font-mono">
                {PASSPORT_WIDTH_MM} mm
              </div>
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 -rotate-90 text-[11px] font-bold text-blue-400 font-mono">
                {PASSPORT_HEIGHT_MM} mm
              </div>

              {passportCanvas ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/80 shadow-2xl shadow-blue-500/20 bg-white">
                  <img
                    src={passportCanvas.toDataURL('image/png')}
                    alt="Passport Preview 35x45mm"
                    className="w-48 sm:w-56 h-auto object-contain block"
                  />
                </div>
              ) : (
                <div className="w-48 h-60 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  Generating preview...
                </div>
              )}
            </div>

            {/* Compliance Badge list */}
            <div className="space-y-3 max-w-xs text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
                Biometric Specifications
              </h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exact 35mm × 45mm Proportions (7:9)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>300 DPI Ultra High Resolution (413 × 531 px)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ready for Visa, Passport & Govt IDs</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Full Sheet Display */
          <div className="animate-fadeIn max-w-full overflow-auto flex items-center justify-center p-2">
            {sheetCanvas ? (
              <div
                style={{ transform: `scale(${sheetZoom})`, transition: 'transform 0.15s ease-out' }}
                className="rounded-lg shadow-2xl overflow-hidden border border-slate-700 bg-white"
              >
                {/* Draggable wrapper */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                  title="Drag to reposition photo group"
                >
                  <img
                    ref={sheetImgRef}
                    src={sheetCanvas.toDataURL('image/jpeg', 0.9)}
                    alt="Print Sheet Preview"
                    className="max-h-[500px] w-auto block object-contain select-none"
                    draggable={false}
                  />
                  {/* Drag hint badge */}
                  <div
                    className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-amber-300 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
                      isDragging ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <GripHorizontal className="w-3 h-3" />
                    Drag to move photos
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-72 h-96 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                Rendering Print Sheet...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Download Actions Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">Download & Print Export Options</h4>
            <p className="text-[11px] text-slate-400">
              Export in high-resolution JPG, PNG, or print-ready PDF formats
            </p>
          </div>

          {/* Actions: Print & Google Drive */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="gradient"
              size="md"
              onClick={handleBrowserPrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              <span>Print Sheet Directly</span>
            </Button>
            <GoogleDriveButton
              variant="secondary"
              size="md"
              label="Save to Google Drive"
              onGetFile={async () => {
                const canvasToSave = activeTab === 'single' ? passportCanvas : sheetCanvas;
                if (!canvasToSave) return null;
                return new Promise((resolve) => {
                  canvasToSave.toBlob((blob) => {
                    if (!blob) return;
                    const suffix = activeTab === 'single' ? 'Single_35x45mm' : `Sheet_${paperSize}_${copies}Copies`;
                    resolve({
                      blob,
                      fileName: `Passport_${suffix}_${Date.now()}.png`,
                      mimeType: 'image/png',
                      category: 'Images',
                    });
                  }, 'image/png');
                });
              }}
            />
          </div>
        </div>

        {/* Download Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* PDF Print Sheet */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/40 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Download PDF Sheet</p>
                <p className="text-[10px] text-slate-400">{paperSize} Page (Vector mm scale)</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-red-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Sheet Image (JPG / PNG) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Sheet Image</p>
                <p className="text-[10px] text-slate-400">{copies} Copies at 300 DPI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadSheetJpg}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
              >
                JPG
              </button>
              <button
                onClick={handleDownloadSheetPng}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
              >
                PNG
              </button>
            </div>
          </div>

          {/* Single Photo (JPG / PNG) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Single 35×45mm Photo</p>
                <p className="text-[10px] text-slate-400">Single Cutout / Portrait</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadSingleJpg}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30"
              >
                JPG
              </button>
              <button
                onClick={handleDownloadSinglePng}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30"
              >
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
