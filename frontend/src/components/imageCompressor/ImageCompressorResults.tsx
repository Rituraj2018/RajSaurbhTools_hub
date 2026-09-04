import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  TrendingDown,
  Target,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  ImageInfo,
  CompressedResult,
  CompressionOptions,
  OutputFormat,
  OUTPUT_FORMATS,
  formatFileSize,
  generateFilename,
  compressToFormat,
  downloadBlob,
} from '../../utils/imageCompressorProcessor';

interface ImageCompressorResultsProps {
  original: ImageInfo | null;
  compressed: CompressedResult | null;
  options: CompressionOptions;
  onReset: () => void;
}

export const ImageCompressorResults: React.FC<ImageCompressorResultsProps> = ({
  original,
  compressed,
  options,
  onReset,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!original || !compressed) return null;

  const savedBytes = original.size - compressed.size;
  const reductionPercent =
    original.size > 0 ? ((savedBytes / original.size) * 100).toFixed(1) : '0';
  const isSmaller = savedBytes > 0;

  const handlePrimaryDownload = () => {
    const filename = generateFilename(original.name, options, original.width, original.height);
    downloadBlob(compressed.blob, filename);
  };

  const handleFormatDownload = async (fmt: OutputFormat) => {
    const fmtEntry = OUTPUT_FORMATS.find((f) => f.value === fmt);
    if (!fmtEntry) return;

    setDownloadingFormat(fmtEntry.label);
    try {
      const result = await compressToFormat(original, options, fmt);
      const baseName = original.name.replace(/\.[^.]+$/, '');
      const filename = `${baseName}-compressed.${fmtEntry.ext}`;
      downloadBlob(result.blob, filename);
    } catch {
      // Silently fail — format may not be supported
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ---- Compression Summary ---- */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Compression Result</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Original Size */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Original</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {formatFileSize(original.size)}
            </div>
          </div>

          {/* Compressed Size */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Compressed</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {formatFileSize(compressed.size)}
            </div>
          </div>

          {/* Saved */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Saved</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                isSmaller ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isSmaller ? '' : '+'}
              {formatFileSize(Math.abs(savedBytes))}
            </div>
          </div>

          {/* Reduction % */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Reduction</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                isSmaller ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isSmaller ? '-' : '+'}
              {Math.abs(parseFloat(reductionPercent))}%
            </div>
          </div>
        </div>

        {/* Target vs Actual */}
        {options.targetSizeBytes !== null && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">
              Target: <strong className="text-white">{formatFileSize(options.targetSizeBytes)}</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] text-slate-400">
              Actual: <strong className="text-emerald-400">{formatFileSize(compressed.size)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ---- Download Section ---- */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Download</span>
        </div>

        {/* Primary Download */}
        <Button
          id="image-compressor-download-primary"
          variant="gradient"
          size="md"
          onClick={handlePrimaryDownload}
          leftIcon={<Download className="w-4 h-4" />}
          className="w-full"
        >
          Download {compressed.format}
        </Button>

        {/* Format-specific Downloads */}
        <div className="grid grid-cols-3 gap-2">
          {OUTPUT_FORMATS.map((fmt) => (
            <Button
              key={fmt.value}
              id={`image-compressor-download-${fmt.ext}`}
              variant="secondary"
              size="sm"
              onClick={() => handleFormatDownload(fmt.value)}
              disabled={downloadingFormat !== null}
              isLoading={downloadingFormat === fmt.label}
            >
              {fmt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---- Reset ---- */}
      <Button
        id="image-compressor-reset"
        variant="outline"
        size="sm"
        onClick={onReset}
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        className="w-full"
      >
        Reset Settings
      </Button>
    </div>
  );
};
