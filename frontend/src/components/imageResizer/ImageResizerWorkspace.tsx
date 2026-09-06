import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedImageForResize,
  ResizedImageResult,
  resizeImage,
  downloadResizedImage,
  formatBytes,
} from '../../utils/imageResizerProcessor';

interface ImageResizerWorkspaceProps {
  image: LoadedImageForResize;
  onReset: () => void;
}

export const ImageResizerWorkspace: React.FC<ImageResizerWorkspaceProps> = ({
  image,
  onReset,
}) => {
  const [width, setWidth] = useState<number>(image.width);
  const [height, setHeight] = useState<number>(image.height);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [quality, setQuality] = useState<number>(0.92);

  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeResult, setResizeResult] = useState<ResizedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle Width change with aspect ratio locking
  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspectRatio && image.aspectRatio > 0 && newWidth > 0) {
      setHeight(Math.round(newWidth / image.aspectRatio));
    }
  };

  // Handle Height change with aspect ratio locking
  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspectRatio && image.aspectRatio > 0 && newHeight > 0) {
      setWidth(Math.round(newHeight * image.aspectRatio));
    }
  };

  // Preset percentage scaling
  const handleScalePercent = (percent: number) => {
    const scale = percent / 100;
    const w = Math.round(image.width * scale);
    const h = Math.round(image.height * scale);
    setWidth(w);
    setHeight(h);
  };

  // Preset dimensions
  const handlePresetDimension = (targetW: number, targetH: number) => {
    setLockAspectRatio(false);
    setWidth(targetW);
    setHeight(targetH);
  };

  const runResize = useCallback(async () => {
    if (width <= 0 || height <= 0) {
      setError('Width and Height must be positive numbers greater than 0.');
      return;
    }

    setIsResizing(true);
    setError(null);

    try {
      const result = await resizeImage(image, {
        targetWidth: width,
        targetHeight: height,
        format: exportFormat,
        quality,
      });
      setResizeResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to resize image.');
    } finally {
      setIsResizing(false);
    }
  }, [image, width, height, exportFormat, quality]);

  // Run resize initially and when options change
  useEffect(() => {
    runResize();
  }, [runResize]);

  const handleDownload = () => {
    if (resizeResult) {
      downloadResizedImage(resizeResult);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Controls Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-tight">
              Resize Dimensions & Options
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="truncate max-w-[220px] font-medium text-slate-300">{image.name}</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">{image.width} × {image.height} px</span>
            <span>•</span>
            <span>{formatBytes(image.size)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dimension Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Target Pixel Dimensions</span>
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  lockAspectRatio
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lockAspectRatio ? (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Aspect Ratio Locked</span>
                  </>
                ) : (
                  <>
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Ratio Unlocked</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Percentage Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 block font-medium">Quick Scale:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleScalePercent(pct)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Presets & Format Settings */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">Common Resolution Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
                  { label: 'HD (1280×720)', w: 1280, h: 720 },
                  { label: 'Square (1080×1080)', w: 1080, h: 1080 },
                  { label: 'Web Standard (800×600)', w: 800, h: 600 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetDimension(preset.w, preset.h)}
                    className="px-2.5 py-2 rounded-xl text-xs font-medium text-left border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300 transition-all truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Export Format</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Original: {image.format.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'Original', val: 'original' },
                  { label: 'JPG', val: 'jpeg' },
                  { label: 'PNG', val: 'png' },
                  { label: 'WebP', val: 'webp' },
                ].map((fmt) => (
                  <button
                    key={fmt.val}
                    type="button"
                    onClick={() => setExportFormat(fmt.val as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      exportFormat === fmt.val
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Quality Slider (when format is lossy) */}
              {(exportFormat === 'jpeg' ||
                exportFormat === 'webp' ||
                (exportFormat === 'original' && image.format !== 'png')) && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Compression Quality</span>
                    <span className="text-emerald-400 font-mono">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={1.0}
                    step={0.02}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Image
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {formatBytes(image.size)}
            </span>
          </div>

          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-950/60 relative">
            <img
              src={image.previewUrl}
              alt="Original"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {image.width} × {image.height} px</span>
            <span className="font-medium text-slate-300">Format: {image.format.toUpperCase()}</span>
          </div>
        </div>

        {/* Resized Image */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Resized Preview
              </span>
            </div>
            {resizeResult && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {formatBytes(resizeResult.size)}
              </span>
            )}
          </div>

          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-950/60 relative">
            {isResizing ? (
              <div className="flex flex-col items-center gap-3 text-emerald-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Rescaling image...</span>
              </div>
            ) : resizeResult ? (
              <img
                src={resizeResult.url}
                alt="Resized preview"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <span className="text-xs text-slate-500">No preview available</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {width} × {height} px</span>
            {resizeResult && (
              <span className="font-semibold text-emerald-400">
                Format: {resizeResult.format} ({resizeResult.sizeDiffRatio < 0 ? `${resizeResult.sizeDiffRatio}%` : `+${resizeResult.sizeDiffRatio}%`})
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Action Footer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="secondary"
          size="md"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Choose Another Image
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleDownload}
            disabled={!resizeResult || isResizing}
            leftIcon={<Download className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            <span>Download Resized Image ({width}×{height})</span>
          </Button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Your images are resized 100% locally in your browser canvas and are never uploaded or permanently stored.</span>
      </div>
    </div>
  );
};
