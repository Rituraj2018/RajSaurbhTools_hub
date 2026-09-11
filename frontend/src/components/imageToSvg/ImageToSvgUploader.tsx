import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Sparkles,
  ArrowUpCircle,
  X,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import {
  LoadedVectorImage,
  loadImageFromFile,
  SAMPLE_PRESETS,
  loadPresetImage,
  SamplePreset,
} from '../../utils/imageToSvgProcessor';
import { Button } from '../common/Button';

interface ImageToSvgUploaderProps {
  loadedImage: LoadedVectorImage | null;
  onImageLoaded: (image: LoadedVectorImage) => void;
  onClear: () => void;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ImageToSvgUploader: React.FC<ImageToSvgUploaderProps> = ({
  loadedImage,
  onImageLoaded,
  onClear,
  isLoading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      const ext = file.name.toLowerCase();
      const isValidExt =
        ext.endsWith('.png') ||
        ext.endsWith('.jpg') ||
        ext.endsWith('.jpeg') ||
        ext.endsWith('.webp');

      if (!validTypes.includes(file.type) && !isValidExt) {
        setErrorMessage('Unsupported format. Please upload PNG, JPG, or WebP images.');
        return;
      }

      if (file.size > 30 * 1024 * 1024) {
        setErrorMessage('File exceeds the 30 MB limit. Please choose a smaller image.');
        return;
      }

      try {
        const loaded = await loadImageFromFile(file);
        onImageLoaded(loaded);
      } catch (err: any) {
        console.error('Failed to load image:', err);
        setErrorMessage(err.message || 'Failed to decode image file.');
      }
    },
    [onImageLoaded]
  );

  // Paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (loadedImage) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadedImage, processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = async (preset: SamplePreset) => {
    try {
      setLoadingPresetId(preset.id);
      setErrorMessage(null);
      const loaded = await loadPresetImage(preset);
      onImageLoaded(loaded);
    } catch (err: any) {
      setErrorMessage('Failed to load sample image.');
    } finally {
      setLoadingPresetId(null);
    }
  };

  // ── ACTIVE LOADED IMAGE STATE ──
  if (loadedImage) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner p-1 relative">
              <img
                src={loadedImage.dataUrl}
                alt={loadedImage.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Meta details */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {loadedImage.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {loadedImage.name.split('.').pop()?.toUpperCase() || 'IMAGE'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>
                  {loadedImage.width} × {loadedImage.height} px
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">
                  {formatBytes(loadedImage.sizeBytes)}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Vectorize
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              leftIcon={<ArrowUpCircle className="w-3.5 h-3.5" />}
            >
              Change Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isLoading}
              className="text-slate-400 hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── DROPZONE / INITIAL UPLOAD STATE ──
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative p-8 sm:p-12 rounded-3xl border-2 border-dashed cursor-pointer text-center transition-all duration-300 backdrop-blur-md select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-600/10 scale-[1.01] shadow-2xl shadow-blue-500/20'
            : 'border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/80 shadow-xl'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-xl ${
              isDragging
                ? 'bg-blue-600 text-white scale-110'
                : 'bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-blue-400 group-hover:scale-110 border border-blue-500/30'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              Click to upload or drag & drop image
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports <strong className="text-slate-300">PNG, JPG, WebP</strong> (up to 30 MB).
              Direct copy-paste (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono">Ctrl+V</kbd>) supported.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all">
              <ArrowUpCircle className="w-4 h-4" />
              <span>Browse Image File</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Smart Auto Setup</span>
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <X className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Demo Samples */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Or try with instant sample graphic:</span>
          </div>
          <span className="text-[11px] text-slate-500">1-Click Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={loadingPresetId !== null}
              onClick={() => handlePresetSelect(preset)}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition-all text-left flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform p-1">
                <img src={preset.svgDataUri} alt={preset.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                    {preset.name}
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
