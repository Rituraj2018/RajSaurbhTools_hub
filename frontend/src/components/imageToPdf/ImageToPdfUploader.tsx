import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { ImageFileItem } from '../../utils/imageToPdfProcessor';
import { Button } from '../common/Button';

export interface ImageToPdfUploaderProps {
  onImagesAdded: (newImages: ImageFileItem[]) => void;
  hasImages: boolean;
  totalImagesCount?: number;
}

export const ImageToPdfUploader: React.FC<ImageToPdfUploaderProps> = ({
  onImagesAdded,
  hasImages,
  totalImagesCount = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/gif',
      'image/svg+xml',
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validMimes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i)) {
        if (file.size <= 40 * 1024 * 1024) {
          validFiles.push(file);
        }
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WEBP, BMP, GIF, SVG).');
      return;
    }

    const items: ImageFileItem[] = [];

    for (const file of validFiles) {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        });

        items.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          url,
          name: file.name,
          size: file.size,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          rotation: 0,
        });
      } catch {
        console.error('Could not load image file dimensions:', file.name);
      }
    }

    if (items.length > 0) {
      onImagesAdded(items);
    }
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
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so same files can be re-added if desired
      e.target.value = '';
    }
  };

  /**
   * Generates a 3-page sample image batch for instant testing
   */
  const handleLoadSampleBatch = () => {
    setIsLoadingSample(true);
    setErrorMessage(null);

    const createSampleSlide = (
      title: string,
      subtitle: string,
      color1: string,
      color2: string,
      pageNo: number
    ): ImageFileItem => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient backdrop
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        // Glassmorphism card overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(80, 80, 1040, 640, 32);
        ctx.fill();
        ctx.stroke();

        // Slide Header
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 54px sans-serif';
        ctx.fillText(title, 140, 240);

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '28px sans-serif';
        ctx.fillText(subtitle, 140, 310);

        // Feature bullet pills
        const pills = [
          'High Resolution Vector Alignment',
          'Exact Paper Scale & Margins',
          'Multi-page Assembly Ready',
        ];
        pills.forEach((p, idx) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.roundRect(140, 380 + idx * 70, 500, 48, 12);
          ctx.fill();

          ctx.fillStyle = '#38BDF8';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(`✓  ${p}`, 160, 412 + idx * 70);
        });

        // Page stamp
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`Document Page ${pageNo} of 3`, 840, 660);
      }

      const dataUrl = canvas.toDataURL('image/png');
      return {
        id: `sample_slide_${pageNo}_${Date.now()}`,
        file: null,
        url: dataUrl,
        name: `Sample_Report_Page_${pageNo}.png`,
        size: 245000,
        width: 1200,
        height: 800,
        rotation: 0,
      };
    };

    const samples = [
      createSampleSlide(
        'Executive Project Brief',
        'RajSaurbh Tools_Hub • Image to PDF Engine',
        '#1E1B4B',
        '#312E81',
        1
      ),
      createSampleSlide(
        'Architecture Overview',
        'Client-Side jsPDF & Canvas Geometry Processing',
        '#064E3B',
        '#065F46',
        2
      ),
      createSampleSlide(
        'System Metrics & Verification',
        'High Fidelity 300 DPI Export with Customizable Margins',
        '#701A75',
        '#86198F',
        3
      ),
    ];

    onImagesAdded(samples);
    setIsLoadingSample(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden Multi-file Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/bmp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Upload Dropzone */}
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
        {/* Glow ambient background mesh */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {hasImages ? 'Add More Images to Document' : 'Upload Images to Convert into PDF'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Drag and drop single or batch images here, or{' '}
              <span className="text-blue-400 font-semibold underline underline-offset-4">
                browse files
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              JPG, PNG, WEBP, BMP, SVG
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Multiple Files Allowed
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
              Instant PDF Assembly
            </span>
          </div>

          {/* Quick Demo button */}
          {!hasImages && (
            <div
              className="pt-3"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadSampleBatch}
                disabled={isLoadingSample}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              >
                <span>{isLoadingSample ? 'Generating Batch...' : 'Try with Sample 3-Page Batch'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Action Button for when images already exist */}
      {hasImages && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileImage className="w-4 h-4 text-blue-400" />
            <span>
              <strong className="text-white">{totalImagesCount}</strong> {totalImagesCount === 1 ? 'page' : 'pages'} in queue
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add More Images
          </Button>
        </div>
      )}
    </div>
  );
};
