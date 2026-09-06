import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, ArrowLeft, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { ImageResizerUploader, ImageResizerWorkspace } from '../components/imageResizer';
import { LoadedImageForResize, loadImageForResize } from '../utils/imageResizerProcessor';
import { Button } from '../components/common/Button';

export const ImageResizerPage: React.FC = () => {
  const [loadedImg, setLoadedImg] = useState<LoadedImageForResize | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const img = await loadImageForResize(file);
      setLoadedImg(img);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load and inspect the selected image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (loadedImg) {
      URL.revokeObjectURL(loadedImg.previewUrl);
    }
    setLoadedImg(null);
    setLoadError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-emerald-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Image" className="hover:text-emerald-400 transition-colors">
              Image Tools
            </Link>
            <span>/</span>
            <span className="text-emerald-400">Image Resizer</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Image Resizer
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Resize JPG, PNG, and WebP images by exact pixel dimensions or percentage while maintaining crystal-clear aspect ratio.
              </p>
            </div>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {loadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm max-w-2xl mx-auto">
          {loadError}
        </div>
      )}

      {/* Main Content Area */}
      {!loadedImg ? (
        <div className="space-y-8">
          <ImageResizerUploader onFileSelected={handleFileSelected} isLoading={isLoading} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Maximize2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Pixel-Perfect Rescaling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resize to custom width and height, common HD presets, or proportional percentage scales with high-quality interpolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Aspect Ratio Constraint</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically keep proportions synchronized to avoid image stretching, or unlock ratio for custom dimensions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Private</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All image processing happens locally within your browser canvas. No server uploads and zero permanent storage.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ImageResizerWorkspace image={loadedImg} onReset={handleReset} />
      )}
    </div>
  );
};
