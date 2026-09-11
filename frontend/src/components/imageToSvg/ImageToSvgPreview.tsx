import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Columns2,
  Eye,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  LoadedVectorImage,
  SvgConversionResult,
} from '../../utils/imageToSvgProcessor';

interface ImageToSvgPreviewProps {
  loadedImage: LoadedVectorImage;
  result: SvgConversionResult | null;
  isConverting?: boolean;
}

type ViewMode = 'side-by-side' | 'split' | 'svg-only' | 'original-only';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ImageToSvgPreview: React.FC<ImageToSvgPreviewProps> = ({
  loadedImage,
  result,
  isConverting = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [zoom, setZoom] = useState<number>(100);
  const [showCheckerboard, setShowCheckerboard] = useState<boolean>(true);
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const isDraggingSplit = useRef<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(400, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(25, z - 25));
  const handleFitScreen = () => setZoom(100);

  // Split slider drag handling
  const handleSplitMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDraggingSplit.current || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (e as MouseEvent).clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPos(percent);
  };

  const handleSplitMouseUp = () => {
    isDraggingSplit.current = false;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleSplitMouseMove(e);
    const onUp = () => handleSplitMouseUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const checkerboardStyle = showCheckerboard
    ? {
        backgroundImage: `
          linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }
    : {};

  return (
    <div className="space-y-4">
      {/* ── TOP PREVIEW TOOLBAR ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur-md">
        {/* View Mode Segmented Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('svg-only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'svg-only'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>SVG Only</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original-only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'original-only'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Original</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          {/* Checkerboard toggle */}
          <button
            type="button"
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showCheckerboard
                ? 'bg-slate-800 text-blue-400 border-blue-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle transparency grid"
          >
            Grid
          </button>

          {/* Zoom buttons */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-slate-300 min-w-[45px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleFitScreen}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Fit to screen (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── COMPLEX IMAGE HELPFUL NOTICE ── */}
      {loadedImage.analysis.classification === 'Photograph' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold">Detailed Photograph Detected: </span>
            <span>
              Complex photographic images produce larger SVG files. For logos, icons, badges, signatures, and flat graphics, our engine creates ultra-compact scalable vector artwork.
            </span>
          </div>
        </div>
      )}

      {/* ── MAIN PREVIEW CANVAS AREA ── */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden min-h-[420px] flex items-center justify-center p-4 sm:p-6">
        {/* Loading Overlay */}
        {isConverting && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <p className="text-sm font-bold text-white">Generating Scalable SVG...</p>
          </div>
        )}

        {/* 1. SIDE-BY-SIDE MODE */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Original Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1 font-bold text-slate-400">
                <span>Original Raster Image</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatBytes(loadedImage.sizeBytes)}
                </span>
              </div>
              <div
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 h-[340px] flex items-center justify-center overflow-hidden relative"
                style={checkerboardStyle}
              >
                <img
                  src={loadedImage.dataUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-slate-400">
                  {loadedImage.width} × {loadedImage.height} px
                </span>
              </div>
            </div>

            {/* SVG Result Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1 font-bold text-slate-400">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Generated Scalable SVG
                </span>
                {result && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {formatBytes(result.svgSizeBytes)}
                    </span>
                    {result.sizeChangePercent !== 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 ${
                          result.sizeChangePercent < 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {result.sizeChangePercent < 0 ? (
                          <TrendingDown className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingUp className="w-2.5 h-2.5" />
                        )}
                        {result.sizeChangePercent > 0 ? `+${result.sizeChangePercent}%` : `${result.sizeChangePercent}%`}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                className="rounded-2xl border border-blue-500/30 bg-slate-900/60 p-4 h-[340px] flex items-center justify-center overflow-hidden relative shadow-inner"
                style={checkerboardStyle}
              >
                {result?.svgString ? (
                  <div
                    className="max-h-full max-w-full flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                    dangerouslySetInnerHTML={{ __html: result.svgString }}
                  />
                ) : (
                  <div className="text-xs text-slate-500">Processing SVG...</div>
                )}
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase">
                  Vector Scalable
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. SPLIT SLIDER MODE */}
        {viewMode === 'split' && (
          <div
            ref={splitContainerRef}
            className="relative w-full h-[400px] rounded-2xl border border-slate-800 overflow-hidden select-none"
            style={checkerboardStyle}
          >
            {/* Background: Original Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={loadedImage.dataUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>

            {/* Foreground: SVG Overlay clipped to splitPos */}
            {result?.svgString && (
              <div
                className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden border-r-2 border-blue-500"
                style={{
                  clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                }}
              >
                <div
                  className="max-h-full max-w-full flex items-center justify-center"
                  style={{ transform: `scale(${zoom / 100})` }}
                  dangerouslySetInnerHTML={{ __html: result.svgString }}
                />
              </div>
            )}

            {/* Split Handle */}
            <div
              className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-20"
              style={{ left: `${splitPos}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                isDraggingSplit.current = true;
              }}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center border-2 border-white">
                <Split className="w-3 h-3" />
              </div>
            </div>

            {/* Badges */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-bold text-blue-400">
              Generated SVG ({splitPos}%)
            </span>
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-bold text-slate-400">
              Original ({100 - splitPos}%)
            </span>
          </div>
        )}

        {/* 3. SVG ONLY MODE */}
        {viewMode === 'svg-only' && (
          <div
            className="w-full h-[380px] rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-6 relative"
            style={checkerboardStyle}
          >
            {result?.svgString && (
              <div
                className="max-h-full max-w-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
                dangerouslySetInnerHTML={{ __html: result.svgString }}
              />
            )}
            <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-slate-400">
              Scalable Vector View
            </span>
          </div>
        )}

        {/* 4. ORIGINAL ONLY MODE */}
        {viewMode === 'original-only' && (
          <div
            className="w-full h-[380px] rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-6 relative"
            style={checkerboardStyle}
          >
            <img
              src={loadedImage.dataUrl}
              alt="Original"
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            />
            <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-slate-400">
              Original Raster View
            </span>
          </div>
        )}
      </div>

      {/* ── BOTTOM EXPORT METRICS BAR ── */}
      {result && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Original Size
            </span>
            <span className="font-mono text-slate-300 font-bold">
              {formatBytes(result.originalSizeBytes)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              SVG File Size
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formatBytes(result.svgSizeBytes)}
            </span>
          </div>

          {result.targetKb ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target vs Actual
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {result.targetKb} KB → {result.actualKb} KB
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Size Change
              </span>
              <span
                className={`font-mono font-bold ${
                  result.sizeChangePercent <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {result.sizeChangePercent > 0 ? `+${result.sizeChangePercent}%` : `${result.sizeChangePercent}%`}
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Vector Paths
            </span>
            <span className="font-mono font-bold text-blue-400">
              {result.pathCount} Paths
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Colors Used
            </span>
            <span className="font-mono font-bold text-purple-400">
              {result.colorCount} Colors
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Processing Speed
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {result.processingTimeMs} ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
