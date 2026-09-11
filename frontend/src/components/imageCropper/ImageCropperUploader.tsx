import React, { useRef, useState, useCallback } from 'react';
import { Upload, Crop, AlertCircle, Loader2, X, RefreshCw, FileImage } from 'lucide-react';
import { Button } from '../common/Button';
import { loadCropImage, LoadedCropImage, formatBytes } from '../../utils/imageCropperProcessor';

interface ImageCropperUploaderProps {
  onImageLoaded: (image: LoadedCropImage) => void;
}

export const ImageCropperUploader: React.FC<ImageCropperUploaderProps> = ({ onImageLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loaded, setLoaded]           = useState<LoadedCropImage | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const img = await loadCropImage(file);
      setLoaded(img);
      onImageLoaded(img);
    } catch (err: any) {
      setError(err?.message || 'Failed to load image.');
    } finally {
      setIsLoading(false);
    }
  }, [onImageLoaded]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleReplace = () => {
    setLoaded(null);
    setError(null);
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setLoaded(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        id="image-cropper-file-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        aria-label="Upload image for cropping"
        onChange={handleChange}
      />

      {/* Loaded state — show file info bar */}
      {loaded && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileImage className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{loaded.name}</p>
            <p className="text-xs text-slate-400">
              {loaded.naturalWidth} × {loaded.naturalHeight} px &nbsp;·&nbsp; {formatBytes(loaded.size)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              id="image-cropper-replace-btn"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleReplace}
              title="Replace image"
            >
              Replace
            </Button>
            <Button
              id="image-cropper-remove-btn"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              title="Remove image"
              aria-label="Remove uploaded image"
              className="text-slate-400 hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload zone — only shown when no image loaded */}
      {!loaded && (
        <div
          role="button"
          tabIndex={0}
          id="image-cropper-upload-zone"
          aria-label="Drop zone — click or drag an image to upload"
          onDragOver={(e) => { e.preventDefault(); if (!isLoading) setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isLoading) fileInputRef.current?.click(); }}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isLoading) fileInputRef.current?.click(); }}
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 outline-none ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
        >
          <div className="max-w-md mx-auto space-y-4">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Crop className="w-8 h-8" />
              )}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {isLoading ? 'Loading Image…' : (isDragOver ? 'Drop to Upload' : 'Drop your Image here')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Supports JPG, PNG, and WebP — up to 50 MB
              </p>
            </div>

            {!isLoading && (
              <div className="pt-2">
                <Button
                  id="image-cropper-select-btn"
                  variant="gradient"
                  size="md"
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Select Image
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs pt-4 border-t border-slate-800/60">
              <span>🔒 100% Client-Side</span>
              <span>⚡ Zero Server Upload</span>
              <span>✂️ Advanced Cropper</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
