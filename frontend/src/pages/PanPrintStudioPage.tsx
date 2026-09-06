import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Crop,
  Sliders,
  LayoutGrid,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  PanUploader,
  PanCropper,
  PanEnhancer,
  PanPrintLayout,
  PanPreview,
} from '../components/pan';
import {
  PanDocItem,
  PanPrintOptions,
  DEFAULT_PAN_PRINT_OPTIONS,
  DEFAULT_PAN_FRONT_CROP,
  DEFAULT_PAN_BACK_CROP,
  DEFAULT_PAN_ADJUSTMENTS,
  PanCropBox,
  PanImageAdjustments,
} from '../utils/panProcessor';
import { Button } from '../components/common/Button';

export const PanPrintStudioPage: React.FC = () => {
  const [documents, setDocuments] = useState<PanDocItem[]>([]);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<'crop' | 'enhance' | 'layout'>('crop');
  const [printOptions, setPrintOptions] = useState<PanPrintOptions>(DEFAULT_PAN_PRINT_OPTIONS);

  const activeDoc = documents[activeDocIndex] || documents[0];

  const handleDocumentLoaded = (name: string, canvas: HTMLCanvasElement) => {
    const newItem: PanDocItem = {
      id: `pan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      originalCanvas: canvas,
      frontCrop: { ...DEFAULT_PAN_FRONT_CROP },
      backCrop: { ...DEFAULT_PAN_BACK_CROP },
      hasBackCard: true,
      adjustments: { ...DEFAULT_PAN_ADJUSTMENTS },
    };

    setDocuments((prev) => {
      if (prev.length >= 5) {
        return [...prev.slice(0, 4), newItem];
      }
      return [...prev, newItem];
    });
    setActiveDocIndex(documents.length);
    setActiveStep('crop');
  };

  const handleCropChange = (
    frontCrop: PanCropBox,
    backCrop: PanCropBox,
    hasBackCard: boolean
  ) => {
    if (!activeDoc) return;
    setDocuments((prev) =>
      prev.map((doc, idx) =>
        idx === activeDocIndex ? { ...doc, frontCrop, backCrop, hasBackCard } : doc
      )
    );
  };

  const handleAdjustmentsChange = (adjustments: PanImageAdjustments) => {
    if (!activeDoc) return;
    setDocuments((prev) =>
      prev.map((doc, idx) =>
        idx === activeDocIndex ? { ...doc, adjustments } : doc
      )
    );
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== index));
    setActiveDocIndex(0);
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
            <Link to="/tools?category=Document" className="hover:text-blue-400 transition-colors">
              Document Lab
            </Link>
            <span>/</span>
            <span className="text-blue-400">PAN / CR80 Print Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                PAN / CR80 Print Studio Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Crop NSDL & UTIITSL e-PAN cards, sharpen blue/black signatures, and print direct CR80 PVC or 1-5 cards on A4.
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

      {/* Main Workspace */}
      {documents.length === 0 ? (
        /* Empty State: Uploader + Highlights */
        <div className="space-y-8">
          <PanUploader onDocumentLoaded={handleDocumentLoaded} hasDocuments={false} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">ISO Standard CR80 Sizing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-calibrated for exact 85.6 × 54 mm card proportions compatible with PVC card printers and thermal laminators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Signature Ink Sharpening</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Boosts faint pen strokes and QR code contrast so fine biometric details print crystal clear on glossy media.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confidential identity cards and passwords never leave your browser or get saved onto external cloud servers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Loaded Multi-Document Workspace */
        <div className="space-y-6 animate-fadeIn">
          {/* Multi-Document Selector Tabs (1 to 5 docs) */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Cards ({documents.length}/5):
              </span>

              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    idx === activeDocIndex
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setActiveDocIndex(idx)}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{doc.name}</span>
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDoc(idx);
                      }}
                      className="text-slate-300 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {documents.length < 5 && (
              <div className="w-auto">
                <PanUploader onDocumentLoaded={handleDocumentLoaded} hasDocuments={true} />
              </div>
            )}
          </div>

          {/* 3-Step Wizard Navigation */}
          <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveStep('crop')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeStep === 'crop'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crop className="w-4 h-4" />
              <span>1. Crop & Sizing</span>
            </button>

            <button
              onClick={() => setActiveStep('enhance')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeStep === 'enhance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Ink & Clarity Boost</span>
            </button>

            <button
              onClick={() => setActiveStep('layout')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeStep === 'layout'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>3. A4 Print Layout</span>
            </button>
          </div>

          {/* Workspace 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Active Step Tool */}
            <div className="lg:col-span-7 space-y-6">
              {activeStep === 'crop' && (
                <PanCropper
                  documentItem={activeDoc}
                  onChangeCrop={handleCropChange}
                />
              )}

              {activeStep === 'enhance' && (
                <PanEnhancer
                  adjustments={activeDoc.adjustments}
                  onChangeAdjustments={handleAdjustmentsChange}
                />
              )}

              {activeStep === 'layout' && (
                <PanPrintLayout
                  options={printOptions}
                  onChangeOptions={setPrintOptions}
                />
              )}
            </div>

            {/* Right Column (5 cols): Sticky Live Sheet Preview & Download Panel */}
            <div className="lg:col-span-5 space-y-6 sticky top-6">
              <PanPreview
                documents={documents}
                printOptions={printOptions}
                activeDocIndex={activeDocIndex}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
