import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  ArrowLeft,
  Sparkles,
  Crop,
  Sliders,
  Palette,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PassportUploader,
  PhotoEditor,
  PhotoControls,
  BackgroundSelector,
  PrintLayout,
  PassportPreview,
} from '../components/passport';
import {
  CropArea,
  ImageAdjustments,
  BackgroundSettings,
  SheetOptions,
  calculateAutoCrop,
  extractCroppedCanvas,
  applyImageEnhancements,
  applyBackgroundColor,
  generatePrintSheetCanvas,
  PASSPORT_WIDTH_PX,
  PASSPORT_HEIGHT_PX,
} from '../utils/passportProcessor';
import { Button } from '../components/common/Button';

export const PassportPhotoStudioPage: React.FC = () => {
  // 1. Image state
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // 2. Crop & Transform state
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: PASSPORT_WIDTH_PX,
    height: PASSPORT_HEIGHT_PX,
  });
  const [rotation, setRotation] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [showBiometricGuides, setShowBiometricGuides] = useState<boolean>(true);

  // 3. Image Enhancement Adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    grayscale: false,
  });

  // 4. Background Color Settings
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    mode: 'original',
    customColor: '#FFFFFF',
    tolerance: 35,
    feather: 2,
  });

  // 5. Print Sheet Options
  const [sheetOptions, setSheetOptions] = useState<SheetOptions>({
    paperSize: 'A4',
    copies: 8,
    showCuttingGuides: true,
    showBorder: true,
    landscape: false,
  });

  // 5b. Photo Group Position Offset (pixel delta from centered default)
  const [photoPosition, setPhotoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 6. Active Workspace Tab
  const [activeStep, setActiveStep] = useState<'crop' | 'enhance' | 'background' | 'print'>(
    'crop'
  );

  // Processed Output Canvases
  const [singlePassportCanvas, setSinglePassportCanvas] = useState<HTMLCanvasElement | null>(null);
  const [printSheetCanvas, setPrintSheetCanvas] = useState<HTMLCanvasElement | null>(null);

  // Handle new image upload
  const handleImageSelected = (img: HTMLImageElement, file: File | null) => {
    setSourceImage(img);
    setFileName(file?.name || 'Sample_Portrait.png');
    // Calculate auto crop
    const initialCrop = calculateAutoCrop(img.naturalWidth, img.naturalHeight);
    setCropArea(initialCrop);
    setRotation(0);
    setFlipHorizontal(false);
    setActiveStep('crop');
  };

  const handleClearImage = () => {
    setSourceImage(null);
    setFileName('');
    setSinglePassportCanvas(null);
    setPrintSheetCanvas(null);
  };

  const handleAutoCropTrigger = () => {
    if (!sourceImage) return;
    const auto = calculateAutoCrop(sourceImage.naturalWidth, sourceImage.naturalHeight);
    setCropArea(auto);
  };

  const handleResetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      grayscale: false,
    });
  };

  // Re-process image whenever crop, rotation, adjustments, or background settings change
  const updateProcessingPipeline = useCallback(() => {
    if (!sourceImage) return;

    // 1. Extract Cropped & Rotated 35x45mm Canvas
    const cropped = extractCroppedCanvas(sourceImage, cropArea, rotation, flipHorizontal);

    // 2. Apply Brightness, Contrast, Saturation, Sharpness
    const enhanced = applyImageEnhancements(cropped, adjustments);

    // 3. Apply Background Color
    const finalPassport = applyBackgroundColor(enhanced, backgroundSettings);
    setSinglePassportCanvas(finalPassport);

    // 4. Generate Print Sheet (inject current photoPosition so export matches preview)
    const sheet = generatePrintSheetCanvas(finalPassport, { ...sheetOptions, photoPosition });
    setPrintSheetCanvas(sheet);
  }, [sourceImage, cropArea, rotation, flipHorizontal, adjustments, backgroundSettings, sheetOptions, photoPosition]);

  useEffect(() => {
    updateProcessingPipeline();
  }, [updateProcessingPipeline]);

  // Standard Specification Presets
  const applySpecPreset = (preset: 'india' | 'schengen' | 'uk' | 'us') => {
    switch (preset) {
      case 'india':
        setBackgroundSettings((prev) => ({ ...prev, mode: 'white' }));
        setSheetOptions((prev) => ({ ...prev, paperSize: 'A4', copies: 8 }));
        break;
      case 'schengen':
        setBackgroundSettings((prev) => ({ ...prev, mode: 'light-grey' }));
        setSheetOptions((prev) => ({ ...prev, paperSize: 'A4', copies: 6 }));
        break;
      case 'uk':
        setBackgroundSettings((prev) => ({ ...prev, mode: 'light-grey' }));
        setSheetOptions((prev) => ({ ...prev, paperSize: '4x6', copies: 4 }));
        break;
      case 'us':
        setBackgroundSettings((prev) => ({ ...prev, mode: 'white' }));
        setSheetOptions((prev) => ({ ...prev, paperSize: '4x6', copies: 4 }));
        break;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Breadcrumb & Header */}
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
            <span className="text-blue-400">Passport Photo Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Passport Photo Studio Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Biometric 35mm × 45mm cropping, color enhancement, backdrop replacement, and print sheet layout.
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

      {/* Specification Presets Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Standard Specs:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applySpecPreset('india')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            🇮🇳 India Passport (35×45mm White)
          </button>
          <button
            onClick={() => applySpecPreset('schengen')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            🇪🇺 Schengen Visa (35×45mm Grey)
          </button>
          <button
            onClick={() => applySpecPreset('uk')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            🇬🇧 UK Passport (35×45mm)
          </button>
          <button
            onClick={() => applySpecPreset('us')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
          >
            🇺🇸 US Visa (2×2 Inch White)
          </button>
        </div>
      </div>

      {/* Step 1: Upload Section (Shown when no image is loaded) */}
      {!sourceImage ? (
        <div className="space-y-6">
          <PassportUploader
            onImageSelected={handleImageSelected}
            currentImage={sourceImage}
            fileName={fileName}
            onClearImage={handleClearImage}
          />

          {/* Quick Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Crop className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Biometric 35×45mm Crop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precision 7:9 ratio frame with oval head guides and eye/chin reference lines meeting international ICAO standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Backdrop Color Selection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replace backdrops with standard White, Light Blue, Dark Blue, Light Grey, or Red right inside your browser.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Multi-Copy Print Sheets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate 4 to 24 copies on A4 or 4×6 photo paper with scissor cutting guide lines and instant PDF export.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2+: Full Studio Workspace */
        <div className="space-y-6 animate-fadeIn">
          {/* Active File Bar */}
          <PassportUploader
            onImageSelected={handleImageSelected}
            currentImage={sourceImage}
            fileName={fileName}
            onClearImage={handleClearImage}
          />

          {/* Workflow Tabs Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setActiveStep('crop')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'crop'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Crop className="w-4 h-4" />
              <span>1. Crop & Align</span>
            </button>

            <button
              onClick={() => setActiveStep('enhance')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'enhance'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Image Enhancement</span>
            </button>

            <button
              onClick={() => setActiveStep('background')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'background'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>3. Background Color</span>
            </button>

            <button
              onClick={() => setActiveStep('print')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'print'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>4. Print & Download</span>
            </button>
          </div>

          {/* Main Workspace Layout (Editor + Controls + Live Output Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Center Column (8 cols): Interactive Editor or Preview */}
            <div className="lg:col-span-7 space-y-6">
              {activeStep === 'crop' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Position Crop Frame (35mm × 45mm)
                    </h3>
                    <span className="text-xs text-blue-400">Drag handles or frame to adjust</span>
                  </div>
                  <PhotoEditor
                    image={sourceImage}
                    cropArea={cropArea}
                    onCropChange={setCropArea}
                    rotation={rotation}
                    onRotationChange={setRotation}
                    flipHorizontal={flipHorizontal}
                    onFlipChange={setFlipHorizontal}
                    showBiometricGuides={showBiometricGuides}
                    onToggleGuides={setShowBiometricGuides}
                    onAutoCrop={handleAutoCropTrigger}
                  />
                </div>
              )}

              {activeStep === 'enhance' && (
                <div className="space-y-6">
                  <PhotoControls
                    adjustments={adjustments}
                    onChange={setAdjustments}
                    onReset={handleResetAdjustments}
                  />
                </div>
              )}

              {activeStep === 'background' && (
                <div className="space-y-6">
                  <BackgroundSelector
                    settings={backgroundSettings}
                    onChange={setBackgroundSettings}
                  />
                </div>
              )}

              {activeStep === 'print' && (
                <div className="space-y-6">
                  <PrintLayout
                    options={sheetOptions}
                    onChange={setSheetOptions}
                    photoPosition={photoPosition}
                    onPhotoPositionChange={setPhotoPosition}
                  />
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Live Dual Output Preview & Quick Actions */}
            <div className="lg:col-span-5 space-y-6 sticky top-6">
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">Live Studio Output</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    300 DPI Ultra HD
                  </span>
                </div>

                {/* Passport Preview Component */}
                <PassportPreview
                  passportCanvas={singlePassportCanvas}
                  sheetCanvas={printSheetCanvas}
                  paperSize={sheetOptions.paperSize}
                  copies={sheetOptions.copies}
                  photoPosition={photoPosition}
                  onPhotoPositionChange={setPhotoPosition}
                  sheetOptions={sheetOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
