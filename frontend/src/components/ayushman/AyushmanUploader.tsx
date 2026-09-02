import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AyushmanCardItem,
  renderAyushmanPdfToCanvas,
  renderAyushmanImageFileToCanvas,
  createSampleAyushmanCanvas,
  DEFAULT_AYUSHMAN_FRONT_CROP,
  DEFAULT_AYUSHMAN_BACK_CROP,
  DEFAULT_ADJUSTMENTS,
} from '../../utils/ayushmanProcessor';
import { Button } from '../common/Button';

export interface AyushmanUploaderProps {
  onCardsLoaded: (newCards: AyushmanCardItem[]) => void;
  hasCards: boolean;
  totalCardsCount?: number;
}

export const AyushmanUploader: React.FC<AyushmanUploaderProps> = ({
  onCardsLoaded,
  hasCards,
  totalCardsCount: _totalCardsCount = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setIsProcessing(true);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf') ||
        file.type.startsWith('image/')
      ) {
        if (file.size <= 50 * 1024 * 1024) {
          validFiles.push(file);
        }
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid PDF or image documents.');
      setIsProcessing(false);
      return;
    }

    const items: AyushmanCardItem[] = [];

    for (const file of validFiles) {
      try {
        let canvas: HTMLCanvasElement;
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          canvas = await renderAyushmanPdfToCanvas(arrayBuffer);
        } else {
          canvas = await renderAyushmanImageFileToCanvas(file);
        }

        items.push({
          id: `ayushman_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalCanvas: canvas,
          frontCrop: { ...DEFAULT_AYUSHMAN_FRONT_CROP },
          backCrop: { ...DEFAULT_AYUSHMAN_BACK_CROP },
          adjustments: { ...DEFAULT_ADJUSTMENTS },
        });
      } catch (err: any) {
        console.error('File load error:', err);
        setErrorMessage(err?.message || 'Failed to process document.');
      }
    }

    setIsProcessing(false);
    if (items.length > 0) {
      onCardsLoaded(items);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  /**
   * Generates a sample 3-card Ayushman batch for 1-click testing
   */
  const handleLoadSampleBatch = () => {
    setIsProcessing(true);
    try {
      const card1 = {
        id: `ayushman_sample_1`,
        name: 'Vikram_Singh_Ayushman',
        originalCanvas: createSampleAyushmanCanvas('Vikram Singh Verma', 'PMJ-9482-7391-4028', 'UTTAR PRADESH'),
        frontCrop: { ...DEFAULT_AYUSHMAN_FRONT_CROP },
        backCrop: { ...DEFAULT_AYUSHMAN_BACK_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
      };

      const card2 = {
        id: `ayushman_sample_2`,
        name: 'Sunita_Verma_Ayushman',
        originalCanvas: createSampleAyushmanCanvas('Sunita Devi Verma', 'PMJ-9482-7391-4029', 'UTTAR PRADESH'),
        frontCrop: { ...DEFAULT_AYUSHMAN_FRONT_CROP },
        backCrop: { ...DEFAULT_AYUSHMAN_BACK_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
      };

      const card3 = {
        id: `ayushman_sample_3`,
        name: 'Amit_Kumar_Ayushman',
        originalCanvas: createSampleAyushmanCanvas('Amit Kumar Verma', 'PMJ-9482-7391-4030', 'UTTAR PRADESH'),
        frontCrop: { ...DEFAULT_AYUSHMAN_FRONT_CROP },
        backCrop: { ...DEFAULT_AYUSHMAN_BACK_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
      };

      onCardsLoaded([card1, card2, card3]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">100% Client-Side Local Privacy</p>
            <p className="text-emerald-300/80 text-[11px]">
              Ayushman card PDF rendering, cropping, and A4 print sheet assembly occur strictly in your browser memory.
              No health card data is sent to or stored on any server.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-200 shrink-0 self-start sm:self-center">
          In-Memory Only
        </span>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 shadow-xl'
        }`}
      >
        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            ) : (
              <UploadCloud className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {hasCards ? 'Add More Ayushman Cards' : 'Select or Drop Ayushman Card PDFs'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {isProcessing
                ? 'Rendering documents in browser memory...'
                : 'Drag and drop up to 5 Ayushman Bharat (PM-JAY) card PDFs or scanned images'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Up to 5 Cards / Batch
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Standard CR80 Size (85.6 × 54 mm)
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
              A4 Sheet Layout
            </span>
          </div>

          {/* Quick Demo Sample Button */}
          {!hasCards && (
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
                disabled={isProcessing}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              >
                <span>Try with Sample Ayushman Batch (3 Cards)</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Add more button when cards exist */}
      {hasCards && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add More Cards
          </Button>
        </div>
      )}
    </div>
  );
};
