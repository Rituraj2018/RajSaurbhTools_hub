import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Sparkles,
  FileImage,
  Sliders,
  Layers,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ImageToPdfUploader,
  ImageOrderList,
  ImageToPdfSettings,
  PdfLivePreview,
} from '../components/imageToPdf';
import {
  ImageFileItem,
  PdfSettings,
  DEFAULT_PDF_SETTINGS,
} from '../utils/imageToPdfProcessor';
import { Button } from '../components/common/Button';

export const ImageToPdfPage: React.FC = () => {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_PDF_SETTINGS);
  const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');

  const handleImagesAdded = (newImages: ImageFileItem[]) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleReorder = (reordered: ImageFileItem[]) => {
    setImages(reordered);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRotate = (id: string) => {
    setImages((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  };

  const handleClearAll = () => {
    setImages([]);
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'standard' | 'fullbleed' | 'slides') => {
    switch (preset) {
      case 'standard':
        setSettings((prev) => ({
          ...prev,
          pageSize: 'A4',
          orientation: 'portrait',
          margin: 'small',
          imageFit: 'contain',
        }));
        break;
      case 'fullbleed':
        setSettings((prev) => ({
          ...prev,
          pageSize: 'A4',
          orientation: 'auto',
          margin: 'none',
          imageFit: 'cover',
        }));
        break;
      case 'slides':
        setSettings((prev) => ({
          ...prev,
          pageSize: 'Letter',
          orientation: 'landscape',
          margin: 'standard',
          imageFit: 'contain',
        }));
        break;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=PDF" className="hover:text-blue-400 transition-colors">
              PDF Suite
            </Link>
            <span>/</span>
            <span className="text-blue-400">Image to PDF</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Image to PDF Converter Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Convert JPG, PNG, WEBP, and BMP images into organized, high-resolution PDF documents.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* Preset Profiles Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Document Presets:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('standard')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            📄 Standard A4 (5mm Margins)
          </button>
          <button
            onClick={() => applyPreset('fullbleed')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            🖼️ Full Bleed Photo Album (0mm Margin)
          </button>
          <button
            onClick={() => applyPreset('slides')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            📊 Landscape Slides (US Letter)
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      {images.length === 0 ? (
        /* Empty State */
        <div className="space-y-8">
          <ImageToPdfUploader
            onImagesAdded={handleImagesAdded}
            hasImages={false}
          />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Drag & Drop Multi-Image Assembly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add multiple images at once, reorder pages, rotate individual sheets, and preview before compiling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Standard & Custom Page Sizes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select A4, US Letter, or custom millimeter sizes with portrait, landscape, or auto-detect orientation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All document conversion runs locally in your browser with zero server uploads and instant export speed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace with Uploaded Images */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Left Column (7 cols): Queue & Settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'queue'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>1. Organize Pages ({images.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>2. Page & Margin Settings</span>
              </button>
            </div>

            {/* Tab 1: Image Queue and Reordering */}
            {activeTab === 'queue' && (
              <div className="space-y-6 animate-fadeIn">
                <ImageOrderList
                  images={images}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                  onRotate={handleRotate}
                  onClearAll={handleClearAll}
                />

                {/* Additional file uploader at bottom */}
                <ImageToPdfUploader
                  onImagesAdded={handleImagesAdded}
                  hasImages={true}
                  totalImagesCount={images.length}
                />
              </div>
            )}

            {/* Tab 2: PDF Settings */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn">
                <ImageToPdfSettings settings={settings} onChange={setSettings} />
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Sticky Live Preview & Download Action */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <PdfLivePreview images={images} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};
