import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedJpgImage,
  ConvertedPngResult,
  convertJpgToPng,
  downloadPngFile,
  formatBytes,
} from '../../utils/jpgToPngProcessor';

interface JpgConversionWorkspaceProps {
  image: LoadedJpgImage;
  onReset: () => void;
}

export const JpgConversionWorkspace: React.FC<JpgConversionWorkspaceProps> = ({
  image,
  onReset,
}) => {
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [transparentColor, setTransparentColor] = useState<'white' | 'black' | 'custom'>('white');
  const [customColorHex, setCustomColorHex] = useState<string>('#ffffff');
  const [colorThreshold, setColorThreshold] = useState<number>(25);
  const [imageSmoothing, setImageSmoothing] = useState<boolean>(true);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<ConvertedPngResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runConversion = useCallback(async () => {
    setIsConverting(true);
    setError(null);
    try {
      const result = await convertJpgToPng(image, {
        removeBackground,
        transparentColor,
        customColorHex,
        colorThreshold,
        imageSmoothing,
      });
      setConversionResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert JPG to PNG');
    } finally {
      setIsConverting(false);
    }
  }, [image, removeBackground, transparentColor, customColorHex, colorThreshold, imageSmoothing]);

  // Initial conversion and update on settings change
  useEffect(() => {
    runConversion();
  }, [runConversion]);

  const handleDownload = () => {
    if (conversionResult) {
      downloadPngFile(conversionResult);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Settings / Controls Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white tracking-tight">
              PNG Conversion Settings
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="truncate max-w-[220px] font-medium text-slate-300">
              {image.name}
            </span>
            <span>•</span>
            <span>{formatBytes(image.size)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format & Smoothing Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Rendering & Quality Engine
              </span>
              <span className="text-amber-400 font-medium">Lossless PNG</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setImageSmoothing(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  imageSmoothing
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {imageSmoothing && <Check className="w-3.5 h-3.5" />}
                <span>High-Fidelity Smoothing</span>
              </button>

              <button
                type="button"
                onClick={() => setImageSmoothing(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  !imageSmoothing
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {!imageSmoothing && <Check className="w-3.5 h-3.5" />}
                <span>Crisp Pixel (Exact 1:1)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              PNG export produces high-fidelity lossless bitmaps with full 24-bit RGB and 8-bit alpha depth.
            </p>
          </div>

          {/* Optional Transparency Extraction (Alpha Keying) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeBackground}
                  onChange={(e) => setRemoveBackground(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30 w-4 h-4"
                />
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Make Background Transparent
                </span>
              </label>
              {removeBackground && (
                <span className="text-amber-400 font-mono text-[11px]">
                  Threshold: {colorThreshold}%
                </span>
              )}
            </div>

            {removeBackground ? (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Color:</span>
                  {[
                    { label: 'White', color: 'white', hex: '#ffffff' },
                    { label: 'Black', color: 'black', hex: '#000000' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTransparentColor(preset.color as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        transparentColor === preset.color
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-slate-700 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-slate-400">Custom:</span>
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => {
                        setCustomColorHex(e.target.value);
                        setTransparentColor('custom');
                      }}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                      title="Custom Color to Remove"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={colorThreshold}
                    onChange={(e) => setColorThreshold(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Strict (Precise)</span>
                    <span>Tolerant (Broader)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pt-1">
                Enable to turn solid backgrounds (like white product/logo backdrops) into clean transparent PNG alpha.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Before / After Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before: Original JPG */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original JPG/JPEG
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {formatBytes(image.size)}
            </span>
          </div>

          {/* Original Image Container */}
          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-950/60 relative">
            <img
              src={image.previewUrl}
              alt="Original JPG"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {image.width} × {image.height} px</span>
            <span className="text-slate-400 font-medium">Format: JPG</span>
          </div>
        </div>

        {/* After: Converted PNG */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Converted PNG
              </span>
            </div>
            {conversionResult && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {formatBytes(conversionResult.size)}
              </span>
            )}
          </div>

          {/* PNG Image Container with checkerboard background to visualize transparency if enabled */}
          <div
            className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 relative"
            style={{
              backgroundImage: `linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)`,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            {isConverting ? (
              <div className="flex flex-col items-center gap-3 text-amber-400">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Generating Lossless PNG...</span>
              </div>
            ) : conversionResult ? (
              <img
                src={conversionResult.url}
                alt="Converted PNG"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <span className="text-xs text-slate-400">No preview available</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {image.width} × {image.height} px</span>
            {conversionResult && (
              <span className="font-semibold text-amber-400">
                Format: Lossless PNG {conversionResult.hasTransparency ? '(Alpha)' : ''}
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
          Convert Another Image
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleDownload}
            disabled={!conversionResult || isConverting}
            leftIcon={<Download className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            <span>Download PNG ({conversionResult ? formatBytes(conversionResult.size) : ''})</span>
          </Button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Your JPG images are processed 100% locally in your browser canvas and are never uploaded to any server.</span>
      </div>
    </div>
  );
};
