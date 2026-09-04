import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, ArrowUpCircle, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';
import {
  ImageInfo,
  loadImageFromFile,
  formatFileSize,
  isAnimatedGif,
  SUPPORTED_INPUT_EXTENSIONS,
} from '../../utils/imageCompressorProcessor';

interface ImageCompressorUploadProps {
  onImageLoaded: (info: ImageInfo) => void;
  currentImage: ImageInfo | null;
  onClear: () => void;
}

export const ImageCompressorUpload: React.FC<ImageCompressorUploadProps> = ({
  onImageLoaded,
  currentImage,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gifWarning, setGifWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setGifWarning(null);

      // Size guard — 50 MB max for browser processing
      if (file.size > 50 * 1024 * 1024) {
        setError('File is too large (max 50 MB). Please choose a smaller image.');
        return;
      }

      try {
        // Warn about animated GIFs
        const animated = await isAnimatedGif(file);
        if (animated) {
          setGifWarning(
            'This is an animated GIF. Browser processing will flatten it to a single frame. The animation will be lost.'
          );
        }

        const info = await loadImageFromFile(file);
        onImageLoaded(info);
      } catch (err: any) {
        setError(err?.message || 'Unable to process this image. Please try another file.');
      }
    },
    [onImageLoaded]
  );

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setError(null);
    setGifWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  // ---- Uploaded State ----
  if (currentImage) {
    return (
      <div className="space-y-3">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentImage.dataUrl}
                alt={currentImage.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentImage.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                  <span>{formatFileSize(currentImage.size)}</span>
                  <span>•</span>
                  <span>{currentImage.width} × {currentImage.height} px</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-slate-300">{currentImage.format}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {gifWarning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{gifWarning}</span>
          </div>
        )}

        {/* Privacy Statement */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
          <span>Your image is processed locally in your browser and is not permanently stored on our servers.</span>
        </div>
      </div>
    );
  }

  // ---- Upload State ----
  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_INPUT_EXTENSIONS}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative p-8 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all duration-300 backdrop-blur-sm select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-600/10 scale-[1.01] shadow-xl shadow-blue-500/10'
            : 'border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg ${
              isDragging
                ? 'bg-blue-600 text-white scale-110'
                : 'bg-blue-600/10 text-blue-400 group-hover:scale-110 border border-blue-500/20'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
              Click to upload or drag & drop your image
            </p>
            <p className="text-xs text-slate-400">
              Supports JPG, PNG, WebP, GIF, BMP, SVG (max 50 MB)
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Browse Local Storage</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Privacy Statement */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
        <span>Your image is processed locally in your browser and is not permanently stored on our servers.</span>
      </div>
    </div>
  );
};
