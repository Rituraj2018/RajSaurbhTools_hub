import React from 'react';
import { Eye } from 'lucide-react';
import {
  ImageInfo,
  CompressedResult,
  formatFileSize,
} from '../../utils/imageCompressorProcessor';

interface ImageCompressorPreviewProps {
  original: ImageInfo | null;
  compressed: CompressedResult | null;
}

export const ImageCompressorPreview: React.FC<ImageCompressorPreviewProps> = ({
  original,
  compressed,
}) => {
  if (!original) {
    return (
      <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex flex-col items-center justify-center text-center min-h-[340px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-600 mb-4">
          <Eye className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">No Image Loaded</p>
        <p className="text-xs text-slate-600 mt-1">Upload an image to see the preview here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
        <Eye className="w-3.5 h-3.5 text-blue-400" />
        <span>Preview</span>
      </div>

      {/* Side-by-Side / Stacked Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Original
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/40 flex items-center justify-center">
            <img
              src={original.dataUrl}
              alt="Original"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-slate-500">Size</div>
              <div className="text-xs font-bold text-white">{formatFileSize(original.size)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Dimensions</div>
              <div className="text-xs font-bold text-white">
                {original.width} × {original.height}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Format</div>
              <div className="text-xs font-bold text-white">{original.format}</div>
            </div>
          </div>
        </div>

        {/* Compressed */}
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Compressed
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/40 flex items-center justify-center">
            {compressed ? (
              <img
                src={compressed.dataUrl}
                alt="Compressed"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-600 italic">
                Click "Compress" to generate
              </div>
            )}
          </div>
          {compressed ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500">Size</div>
                <div className="text-xs font-bold text-emerald-400">
                  {formatFileSize(compressed.size)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Dimensions</div>
                <div className="text-xs font-bold text-white">
                  {compressed.width} × {compressed.height}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Format</div>
                <div className="text-xs font-bold text-white">{compressed.format}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center opacity-40">
              <div>
                <div className="text-[10px] text-slate-500">Size</div>
                <div className="text-xs font-bold text-slate-600">—</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Dimensions</div>
                <div className="text-xs font-bold text-slate-600">—</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Format</div>
                <div className="text-xs font-bold text-slate-600">—</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
