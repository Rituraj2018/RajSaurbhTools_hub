import React, { useRef, useState } from 'react';
import { Upload, PenTool, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import {
  validateAndLoadSignatureImage,
  LoadedSignatureImage,
} from '../../utils/signatureCropperProcessor';

interface SignatureUploaderProps {
  onImageLoaded: (image: LoadedSignatureImage) => void;
}

export const SignatureUploader: React.FC<SignatureUploaderProps> = ({ onImageLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const loaded = await validateAndLoadSignatureImage(file);
      onImageLoaded(loaded);
    } catch (err: any) {
      setError(err?.message || 'Failed to process signature image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isLoading) fileInputRef.current?.click();
        }}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <PenTool className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isLoading ? 'Loading Signature...' : 'Drop your Signature Image here'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Supports JPG, JPEG, PNG, or WebP photo or paper scan (Up to 20 MB)
            </p>
          </div>

          {!isLoading && (
            <div className="pt-2">
              <Button variant="gradient" size="md" leftIcon={<Upload className="w-4 h-4" />}>
                Select Signature Image
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs pt-4 border-t border-slate-800/60">
            <span>🔒 100% Client-Side Private</span>
            <span>⚡ Zero Cloud Upload</span>
            <span>✂️ Standard 3:1 & Freeform Crop</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
