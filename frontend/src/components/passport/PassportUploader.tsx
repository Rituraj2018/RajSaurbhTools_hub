import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button';

export interface PassportUploaderProps {
  onImageSelected: (image: HTMLImageElement, file: File | null) => void;
  currentImage: HTMLImageElement | null;
  fileName?: string;
  onClearImage?: () => void;
}

export const PassportUploader: React.FC<PassportUploaderProps> = ({
  onImageSelected,
  currentImage,
  fileName,
  onClearImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, WEBP, or BMP.');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File exceeds 25MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageSelected(img, file);
      };
      img.onerror = () => {
        setErrorMessage('Failed to decode image file. Please try another picture.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  /**
   * Generates a sample portrait canvas for instant 1-click testing
   */
  const handleLoadSamplePortrait = () => {
    setIsLoadingSample(true);
    setErrorMessage(null);

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Soft studio gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 600, 750);
      bgGrad.addColorStop(0, '#E2E8F0');
      bgGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 750);

      // Shoulders / Dark suit
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(300, 650, 220, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // White shirt collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(250, 500);
      ctx.lineTo(300, 570);
      ctx.lineTo(350, 500);
      ctx.closePath();
      ctx.fill();

      // Tie
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(290, 520);
      ctx.lineTo(310, 520);
      ctx.lineTo(315, 660);
      ctx.lineTo(300, 690);
      ctx.lineTo(285, 660);
      ctx.closePath();
      ctx.fill();

      // Neck
      ctx.fillStyle = '#E2B29F';
      ctx.fillRect(265, 410, 70, 100);

      // Head / Face
      ctx.fillStyle = '#F5C6AA';
      ctx.beginPath();
      ctx.ellipse(300, 320, 110, 140, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(300, 230, 120, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.arc(260, 310, 8, 0, Math.PI * 2);
      ctx.arc(340, 310, 8, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(245, 292);
      ctx.quadraticCurveTo(260, 285, 275, 292);
      ctx.moveTo(325, 292);
      ctx.quadraticCurveTo(340, 285, 355, 292);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#D99B82';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 310);
      ctx.lineTo(295, 350);
      ctx.lineTo(305, 350);
      ctx.stroke();

      // Smile
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(300, 380, 24, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      const img = new Image();
      img.onload = () => {
        setIsLoadingSample(false);
        onImageSelected(img, null);
      };
      img.src = canvas.toDataURL('image/png');
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Selected File State */}
      {currentImage ? (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={currentImage.src}
                alt="Uploaded portrait"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm font-bold text-white truncate">
                  {fileName || 'Sample Portrait Image'}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Resolution: {currentImage.naturalWidth || currentImage.width} ×{' '}
                {currentImage.naturalHeight || currentImage.height} px
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Replace Photo
            </Button>
            {onClearImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearImage}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 shadow-xl'
          }`}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Upload Photo for Passport Processing
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Drag and drop your portrait image here, or{' '}
                <span className="text-blue-400 font-semibold underline underline-offset-4">
                  browse files
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                JPEG, PNG, WEBP, BMP
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                Up to 25 MB
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                35mm × 45mm Output
              </span>
            </div>

            {/* Quick Demo button */}
            <div
              className="pt-4"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadSamplePortrait}
                disabled={isLoadingSample}
                leftIcon={
                  isLoadingSample ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )
                }
              >
                <span>{isLoadingSample ? 'Generating...' : 'Try with Sample Portrait'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Specification Hint */}
      <div className="flex items-start gap-2 px-1 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span>
          <strong>Standard Biometric Guidelines:</strong> Ensure face is centered looking straight
          forward with neutral expression, shoulders leveled, and adequate head clearance.
        </span>
      </div>
    </div>
  );
};
