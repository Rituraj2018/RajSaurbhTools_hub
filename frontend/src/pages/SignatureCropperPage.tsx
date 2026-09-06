import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, ArrowLeft, ShieldCheck, Zap, Scissors } from 'lucide-react';
import {
  SignatureUploader,
  SignatureCropWorkspace,
  SignatureCroppedPreview,
} from '../components/signatureCropper';
import {
  LoadedSignatureImage,
} from '../utils/signatureCropperProcessor';
import { Button } from '../components/common/Button';

type CropperStage = 'upload' | 'crop' | 'preview';

export const SignatureCropperPage: React.FC = () => {
  const [stage, setStage] = useState<CropperStage>('upload');
  const [loadedImage, setLoadedImage] = useState<LoadedSignatureImage | null>(null);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleImageLoaded = (image: LoadedSignatureImage) => {
    setLoadedImage(image);
    setCroppedCanvas(null);
    setStage('crop');
  };

  const handleCropApplied = (canvas: HTMLCanvasElement) => {
    setCroppedCanvas(canvas);
    setStage('preview');
  };

  const handleRecrop = () => {
    setStage('crop');
  };

  const handleReset = () => {
    setLoadedImage(null);
    setCroppedCanvas(null);
    setStage('upload');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Photo" className="hover:text-blue-400 transition-colors">
              Photo Studio
            </Link>
            <span>/</span>
            <span className="text-blue-400">Signature Cropper</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Signature Cropper Studio Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Crop and isolate handwritten signatures with standard aspect ratios for exam forms, bank slips, and government portals.
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

      {/* Workspace Stages */}
      {stage === 'upload' && (
        <div className="space-y-8">
          <SignatureUploader onImageLoaded={handleImageLoaded} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Standard Exam/Bank 3:1 Ratio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-configured 3:1, 2:1, and freeform aspect ratios tailored for SSC, UPSC, IBPS, and PAN card uploads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">High Resolution Retention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts the signature directly from the source resolution without blurry downsampling or distortion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your signature is processed strictly in your browser memory and never uploaded or stored on any server.
              </p>
            </div>
          </div>
        </div>
      )}

      {stage === 'crop' && loadedImage && (
        <SignatureCropWorkspace
          image={loadedImage}
          onCropApplied={handleCropApplied}
          onCancel={handleReset}
        />
      )}

      {stage === 'preview' && croppedCanvas && loadedImage && (
        <SignatureCroppedPreview
          croppedCanvas={croppedCanvas}
          originalImage={loadedImage}
          onRecrop={handleRecrop}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
