import React, { useState } from 'react';
import { Download, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import {
  downloadCroppedSignature,
  LoadedSignatureImage,
} from '../../utils/signatureCropperProcessor';

interface SignatureCroppedPreviewProps {
  croppedCanvas: HTMLCanvasElement;
  originalImage: LoadedSignatureImage;
  onRecrop: () => void;
  onReset: () => void;
}

export const SignatureCroppedPreview: React.FC<SignatureCroppedPreviewProps> = ({
  croppedCanvas,
  originalImage,
  onRecrop,
  onReset,
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const previewDataUrl = croppedCanvas.toDataURL(
    downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png',
    0.95
  );

  const handleDownload = () => {
    downloadCroppedSignature(croppedCanvas, originalImage.name, downloadFormat);
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  const ratioVal = (croppedCanvas.width / croppedCanvas.height).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Result Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Cropped Signature Preview
              </h3>
              <p className="text-xs text-slate-400">
                Ready for digital forms, exams, PAN applications, or bank documents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecrop}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Adjust Crop</span>
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              New Image
            </button>
          </div>
        </div>

        {/* Cropped Signature Display Area with subtle contrast grid */}
        <div className="relative rounded-2xl bg-white p-6 sm:p-10 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden min-h-[180px]">
          <img
            src={previewDataUrl}
            alt="Cropped signature"
            className="max-w-full max-h-[260px] object-contain shadow-sm"
          />
        </div>

        {/* Metadata Details Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-medium block">Resolution</span>
            <span className="text-xs font-bold text-white font-mono">
              {croppedCanvas.width} × {croppedCanvas.height} px
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-medium block">Aspect Ratio</span>
            <span className="text-xs font-bold text-white font-mono">{ratioVal} : 1</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-medium block">Source</span>
            <span className="text-xs font-bold text-white truncate block" title={originalImage.name}>
              {originalImage.name}
            </span>
          </div>
        </div>

        {/* Format Selector */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">Select Export Format</h4>
            <p className="text-[11px] text-slate-400">
              PNG retains maximum sharpness; JPG is standard for online government portals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDownloadFormat('png')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                downloadFormat === 'png'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              PNG (Lossless)
            </button>
            <button
              onClick={() => setDownloadFormat('jpeg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                downloadFormat === 'jpeg'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              JPG (Standard)
            </button>
          </div>
        </div>

        {/* Download Action */}
        <div className="space-y-3 pt-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleDownload}
            leftIcon={
              hasDownloaded ? (
                <Check className="w-5 h-5 text-emerald-300" />
              ) : (
                <Download className="w-5 h-5" />
              )
            }
          >
            <span>
              {hasDownloaded
                ? 'Downloaded Successfully!'
                : `Download Cropped Signature (${downloadFormat.toUpperCase()})`}
            </span>
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Processed entirely in your browser • Zero server uploads</span>
          </div>
        </div>
      </div>
    </div>
  );
};
