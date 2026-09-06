import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedPngImage,
  ConvertedJpgResult,
  convertPngToJpg,
  downloadJpgFile,
  formatBytes,
} from '../../utils/pngToJpgProcessor';

interface PngConversionWorkspaceProps {
  image: LoadedPngImage;
  onReset: () => void;
}

export const PngConversionWorkspace: React.FC<PngConversionWorkspaceProps> = ({
  image,
  onReset,
}) => {
  const [quality, setQuality] = useState<number>(0.92);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<ConvertedJpgResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runConversion = useCallback(async () => {
    setIsConverting(true);
    setError(null);
    try {
      const result = await convertPngToJpg(image, {
        quality,
        backgroundColor: bgColor,
      });
      setConversionResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert PNG to JPG');
    } finally {
      setIsConverting(false);
    }
  }, [image, quality, bgColor]);

  // Initial conversion and on options change
  useEffect(() => {
    runConversion();
  }, [runConversion]);

  const handleDownload = () => {
    if (conversionResult) {
      downloadJpgFile(conversionResult);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Settings / Controls Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-tight">
              JPG Conversion Settings
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
          {/* Quality Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Compression Quality: {Math.round(quality * 100)}%
              </span>
              <span className="text-slate-400">
                {quality >= 0.95 ? 'Maximum' : quality >= 0.88 ? 'High' : 'Balanced'}
              </span>
            </div>

            <input
              type="range"
              min={0.5}
              max={1.0}
              step={0.02}
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'Balanced (80%)', val: 0.8 },
                { label: 'High (92%)', val: 0.92 },
                { label: 'Max (100%)', val: 1.0 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setQuality(preset.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    quality === preset.val
                      ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Synthesis for Transparency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Background (For Alpha Transparency)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{bgColor.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-3">
              {[
                { label: 'White', color: '#ffffff' },
                { label: 'Black', color: '#000000' },
                { label: 'Light Gray', color: '#f1f5f9' },
              ].map((bg) => (
                <button
                  key={bg.label}
                  onClick={() => setBgColor(bg.color)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    bgColor.toLowerCase() === bg.color.toLowerCase()
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0"
                    style={{ backgroundColor: bg.color }}
                  />
                  <span>{bg.label}</span>
                </button>
              ))}

              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                  title="Custom Background Color"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              JPG doesn&apos;t support transparency. Transparent areas will blend with this color.
            </p>
          </div>
        </div>
      </div>

      {/* Before / After Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before: Original PNG */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original PNG
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {formatBytes(image.size)}
            </span>
          </div>

          {/* Image Container with checkerboard background to visualize transparency */}
          <div
            className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 relative"
            style={{
              backgroundImage: `linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)`,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            <img
              src={image.previewUrl}
              alt="Original PNG"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {image.width} × {image.height} px</span>
            <span className="text-slate-400 font-medium">Format: PNG</span>
          </div>
        </div>

        {/* After: Converted JPG */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Converted JPG
              </span>
            </div>
            {conversionResult && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {formatBytes(conversionResult.size)}
              </span>
            )}
          </div>

          {/* Converted Image Container */}
          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-950/60 relative">
            {isConverting ? (
              <div className="flex flex-col items-center gap-3 text-emerald-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Encoding JPG...</span>
              </div>
            ) : conversionResult ? (
              <img
                src={conversionResult.url}
                alt="Converted JPG"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <span className="text-xs text-slate-400">No preview available</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dimensions: {image.width} × {image.height} px</span>
            {conversionResult && (
              <span
                className={`font-semibold ${
                  conversionResult.compressionRatio < 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {conversionResult.compressionRatio < 0
                  ? `${Math.abs(conversionResult.compressionRatio)}% smaller`
                  : `+${conversionResult.compressionRatio}% size`}
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
            <span>Download JPG ({conversionResult ? formatBytes(conversionResult.size) : ''})</span>
          </Button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Your images are processed 100% locally in your browser and are never uploaded to any server.</span>
      </div>
    </div>
  );
};
