import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  ImageCompressorUpload,
  ImageCompressorControls,
  ImageCompressorPreview,
  ImageCompressorResults,
} from '../components/imageCompressor';
import { Button } from '../components/common/Button';
import {
  ImageInfo,
  CompressedResult,
  CompressionOptions,
  DEFAULT_OPTIONS,
  compressImage,
} from '../utils/imageCompressorProcessor';

export const ImageCompressorPage: React.FC = () => {
  // State
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<CompressedResult | null>(null);
  const [options, setOptions] = useState<CompressionOptions>(DEFAULT_OPTIONS);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState(100);
  const [customTargetSize, setCustomTargetSize] = useState('');
  const [customTargetUnit, setCustomTargetUnit] = useState<'KB' | 'MB'>('KB');

  // Image loaded callback
  const handleImageLoaded = useCallback((info: ImageInfo) => {
    setImageInfo(info);
    setCompressed(null);
    setError(null);
    setActivePreset(100);

    // Detect the best output format based on input
    let outputFormat = DEFAULT_OPTIONS.outputFormat;
    if (info.file.type === 'image/png') outputFormat = 'image/png';
    else if (info.file.type === 'image/webp') outputFormat = 'image/webp';

    setOptions({
      ...DEFAULT_OPTIONS,
      width: info.width,
      height: info.height,
      outputFormat,
    });
  }, []);

  // Clear image
  const handleClear = useCallback(() => {
    setImageInfo(null);
    setCompressed(null);
    setOptions(DEFAULT_OPTIONS);
    setError(null);
    setActivePreset(100);
    setMaintainAspectRatio(true);
    setCustomTargetSize('');
    setCustomTargetUnit('KB');
  }, []);

  // Reset only settings (keep the image)
  const handleReset = useCallback(() => {
    if (!imageInfo) return;

    let outputFormat = DEFAULT_OPTIONS.outputFormat;
    if (imageInfo.file.type === 'image/png') outputFormat = 'image/png';
    else if (imageInfo.file.type === 'image/webp') outputFormat = 'image/webp';

    setOptions({
      ...DEFAULT_OPTIONS,
      width: imageInfo.width,
      height: imageInfo.height,
      outputFormat,
    });
    setCompressed(null);
    setError(null);
    setActivePreset(100);
    setMaintainAspectRatio(true);
    setCustomTargetSize('');
    setCustomTargetUnit('KB');
  }, [imageInfo]);

  // Compress
  const handleCompress = useCallback(async () => {
    if (!imageInfo) return;

    // Validate dimensions
    if (options.width < 1 || options.height < 1) {
      setError('Width and Height must be at least 1 pixel.');
      return;
    }
    if (options.width > 16384 || options.height > 16384) {
      setError('Maximum supported dimension is 16,384 pixels per side.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await compressImage(imageInfo, options);
      setCompressed(result);
    } catch (err: any) {
      setError(err?.message || 'Compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageInfo, options]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Image Processing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Image Compressor Pro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compress, resize, and convert images — all processed locally in your browser.
          </p>
        </div>

        {imageInfo && (
          <Button
            id="image-compressor-compress-btn"
            variant="gradient"
            size="lg"
            onClick={handleCompress}
            disabled={isProcessing}
            leftIcon={
              isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )
            }
          >
            {isProcessing ? 'Processing...' : 'Compress Image'}
          </Button>
        )}
      </div>

      {/* ---- Upload Section ---- */}
      <ImageCompressorUpload
        onImageLoaded={handleImageLoaded}
        currentImage={imageInfo}
        onClear={handleClear}
      />

      {/* ---- Error Banner ---- */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---- Main Content: Controls + Preview ---- */}
      {imageInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <ImageCompressorControls
              imageInfo={imageInfo}
              options={options}
              onChange={setOptions}
              maintainAspectRatio={maintainAspectRatio}
              onToggleAspectRatio={() => setMaintainAspectRatio((prev) => !prev)}
              customTargetSize={customTargetSize}
              customTargetUnit={customTargetUnit}
              onCustomTargetSizeChange={setCustomTargetSize}
              onCustomTargetUnitChange={setCustomTargetUnit}
              activePreset={activePreset}
              onPresetChange={setActivePreset}
            />

            {/* Results + Downloads (shown below controls after compression) */}
            <ImageCompressorResults
              original={imageInfo}
              compressed={compressed}
              options={options}
              onReset={handleReset}
            />
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ImageCompressorPreview original={imageInfo} compressed={compressed} />
          </div>
        </div>
      )}
    </div>
  );
};
