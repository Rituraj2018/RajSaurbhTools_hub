import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileImage, ArrowLeft, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { JpgUploader, JpgConversionWorkspace } from '../components/jpgToPng';
import { LoadedJpgImage, loadJpgImage } from '../utils/jpgToPngProcessor';
import { Button } from '../components/common/Button';

export const JpgToPngPage: React.FC = () => {
  const [loadedImage, setLoadedImage] = useState<LoadedJpgImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await loadJpgImage(file);
      setLoadedImage(loaded);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load the selected JPG image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (loadedImage) {
      URL.revokeObjectURL(loadedImage.previewUrl);
    }
    setLoadedImage(null);
    setLoadError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-amber-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Image" className="hover:text-amber-400 transition-colors">
              Image Tools
            </Link>
            <span>/</span>
            <span className="text-amber-400">JPG to PNG</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                JPG to PNG Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Convert JPG and JPEG photos into lossless PNG images with maximum pixel fidelity and optional transparency.
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
      {!loadedImage ? (
        <div className="space-y-8">
          <JpgUploader onFileSelected={handleFileSelected} isLoading={isLoading} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Lossless PNG Output</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retain maximum image sharpness and details with uncompressed 24-bit RGB and full alpha channel support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Smart Alpha Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optionally extract white, black, or custom solid backgrounds to create transparent PNG graphics easily.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Private</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All image processing happens locally within your browser canvas. No server uploads and zero data retention.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <JpgConversionWorkspace image={loadedImage} onReset={handleReset} />
      )}
    </div>
  );
};
