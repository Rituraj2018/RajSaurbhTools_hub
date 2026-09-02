import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Crop,
  Sliders,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import {
  AadhaarUploader,
  AadhaarCropper,
  AadhaarEnhancer,
  AadhaarPrintLayout,
  AadhaarPreview,
} from '../components/aadhaar';
import {
  AadhaarDocItem,
  AadhaarPrintOptions,
  DEFAULT_PRINT_OPTIONS,
  CardCropBox,
  ImageAdjustments,
} from '../utils/aadhaarProcessor';
import { Button } from '../components/common/Button';

export const AadhaarPrintStudioPage: React.FC = () => {
  const [documents, setDocuments] = useState<AadhaarDocItem[]>([]);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<'crop' | 'enhance' | 'layout'>('crop');
  const [printOptions, setPrintOptions] = useState<AadhaarPrintOptions>(DEFAULT_PRINT_OPTIONS);

  const activeDoc = documents[activeDocIndex] || documents[0];

  const handleDocumentLoaded = (item: AadhaarDocItem) => {
    setDocuments((prev) => {
      // Allow up to 5 documents
      if (prev.length >= 5) {
        return [...prev.slice(0, 4), item];
      }
      return [...prev, item];
    });
    setActiveDocIndex(documents.length);
    setActiveStep('crop');
  };

  const handleCropChange = (frontCrop: CardCropBox, backCrop: CardCropBox) => {
    if (!activeDoc) return;
    setDocuments((prev) =>
      prev.map((doc, idx) =>
        idx === activeDocIndex ? { ...doc, frontCrop, backCrop } : doc
      )
    );
  };

  const handleAdjustmentsChange = (adjustments: ImageAdjustments) => {
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
            <Link to="/tools?category=Photo" className="hover:text-blue-400 transition-colors">
              Document & Photo Studio
            </Link>
            <span>/</span>
            <span className="text-blue-400">Aadhaar Print Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Aadhaar Print Studio Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Crop standard CR80 Front & Back card regions, enhance contrast, and tile 1 to 5 cards on A4 sheets.
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
        /* Empty State: Uploader + Privacy Features */
        <AadhaarUploader onDocumentLoaded={handleDocumentLoaded} hasDocuments={false} />
      ) : (
        /* Loaded Workspace */
        <div className="space-y-6 animate-fadeIn">
          {/* Multi-Document Selector Tabs (1 to 5 docs) */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Documents ({documents.length}/5):
              </span>

              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocIndex(idx)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    idx === activeDocIndex
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
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
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {documents.length < 5 && (
              <div className="w-auto">
                <AadhaarUploader
                  onDocumentLoaded={handleDocumentLoaded}
                  hasDocuments={true}
                  totalDocsCount={documents.length}
                />
              </div>
            )}
          </div>

          {/* Workflow Step Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStep('crop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'crop'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>1. Crop Front & Back (85.6 × 54 mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('enhance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'enhance'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Clarity & Contrast</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('layout')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'layout'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>3. A4 Sheet Layout & Download</span>
            </button>
          </div>

          {/* Step 1: Crop Front & Back */}
          {activeStep === 'crop' && (
            <div className="animate-fadeIn">
              <AadhaarCropper
                documentItem={activeDoc}
                onChangeCrop={handleCropChange}
              />
            </div>
          )}

          {/* Step 2: Enhance */}
          {activeStep === 'enhance' && (
            <div className="animate-fadeIn">
              <AadhaarEnhancer
                documentItem={activeDoc}
                onChangeAdjustments={handleAdjustmentsChange}
              />
            </div>
          )}

          {/* Step 3: Layout & Export */}
          {activeStep === 'layout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              <div className="lg:col-span-6">
                <AadhaarPrintLayout
                  options={printOptions}
                  onChangeOptions={setPrintOptions}
                  totalDocuments={documents.length}
                />
              </div>

              <div className="lg:col-span-6 sticky top-6">
                <AadhaarPreview
                  documents={documents}
                  options={printOptions}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
