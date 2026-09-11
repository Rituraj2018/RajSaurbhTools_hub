import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  FileCode,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  ImageToSvgUploader,
  ImageToSvgControls,
  ImageToSvgPreview,
  ImageToSvgCodeViewer,
} from '../components/imageToSvg';
import {
  LoadedVectorImage,
  SvgConverterSettings,
  SvgConversionResult,
  DEFAULT_SVG_SETTINGS,
  convertImageToSvg,
  downloadSvgFile,
} from '../utils/imageToSvgProcessor';
import { Button } from '../components/common/Button';
import { recordToolHistorySafely } from '../api/historyApi';

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Upload Your Raster Image',
    desc: 'Select or drag & drop a PNG, JPG, or WebP image (such as a logo, icon, illustration, or signature).',
  },
  {
    step: 2,
    title: 'Choose Output Size & Quality',
    desc: 'Use Auto Optimize, pick a size preset (Small, Balanced, High Quality), or enter a custom target KB limit.',
  },
  {
    step: 3,
    title: 'Preview & Compare',
    desc: 'Use the Side-by-Side or Split Slider comparison to inspect smooth Bézier curves and sharp vector boundaries.',
  },
  {
    step: 4,
    title: 'Download Scalable SVG',
    desc: 'Download clean, resolution-independent SVG files ready for web development, UI design, and high-DPI printing.',
  },
];

export const ImageToSvgPage: React.FC = () => {
  const [loadedImage, setLoadedImage] = useState<LoadedVectorImage | null>(null);
  const [settings, setSettings] = useState<SvgConverterSettings>(DEFAULT_SVG_SETTINGS);
  const [result, setResult] = useState<SvgConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('Ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Perform vectorization whenever image loads or settings are applied
  const executeConversion = useCallback(
    async (img: LoadedVectorImage, activeSettings: SvgConverterSettings) => {
      try {
        setIsConverting(true);
        setErrorMessage(null);
        setProgressStep('Analyzing image...');

        const convResult = await convertImageToSvg(
          img,
          activeSettings,
          (step) => setProgressStep(step)
        );

        if (!convResult.isValid || convResult.pathCount === 0) {
          setErrorMessage(convResult.validationError || 'SVG validation failed. No visible vector paths were generated.');
          setResult(null);
          return;
        }

        setResult(convResult);

        // Record history event safely
        recordToolHistorySafely({
          tool: 'image-to-svg',
          toolName: 'Image to SVG Converter',
          inputFiles: [
            {
              name: img.name,
              size: img.sizeBytes,
              type: img.file.type || 'image/png',
            },
          ],
          outputFile: {
            name: `${img.name.replace(/\.[^/.]+$/, '')}.svg`,
            size: convResult.svgSizeBytes,
            type: 'image/svg+xml',
          },
          status: 'completed',
          metadata: {
            classification: convResult.analysis.classification,
            pathCount: convResult.pathCount,
            colorCount: convResult.colorCount,
            svgSizeBytes: convResult.svgSizeBytes,
          },
        });
      } catch (err: any) {
        console.error('Vectorization error:', err);
        setErrorMessage(err.message || 'Failed to convert image to SVG.');
        setResult(null);
      } finally {
        setIsConverting(false);
      }
    },
    []
  );

  const handleImageLoaded = useCallback(
    (img: LoadedVectorImage) => {
      setLoadedImage(img);
      // Initialize settings with auto recommendations
      const initialSettings: SvgConverterSettings = {
        ...DEFAULT_SVG_SETTINGS,
        outputSizePreset: 'auto',
        autoOptimize: true,
        ...img.analysis.recommendedSettings,
      };
      setSettings(initialSettings);
      executeConversion(img, initialSettings);
    },
    [executeConversion]
  );

  const handleSettingsChange = (newSettings: SvgConverterSettings) => {
    setSettings(newSettings);
    if (loadedImage) {
      executeConversion(loadedImage, newSettings);
    }
  };

  const handleReConvert = () => {
    if (loadedImage) {
      executeConversion(loadedImage, settings);
    }
  };

  const handleDownloadSvg = (optimized: boolean = false) => {
    if (!result || !loadedImage) return;

    if (!result.isValid || result.pathCount === 0 || !result.svgString) {
      setErrorMessage('Cannot download: Generated SVG is empty or failed validation checks.');
      return;
    }

    const baseName = loadedImage.name.replace(/\.[^/.]+$/, '');
    const suffix = optimized ? '-optimized.svg' : '.svg';
    const svgData = optimized ? result.optimizedSvgString : result.svgString;

    downloadSvgFile(svgData, `${baseName}${suffix}`);
  };

  const handleCopySvgCode = async () => {
    if (!result?.svgString) return;
    try {
      await navigator.clipboard.writeText(result.svgString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
    }
  };

  const handleClear = () => {
    setLoadedImage(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* ── BREADCRUMBS & BACK LINK ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </Link>
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Image Vectorizer</span>
        </span>
      </div>

      {/* ── HEADER BANNER ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-purple-950/70 border border-slate-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
              <Zap className="w-3.5 h-3.5" />
              <span>100% Client-Side Vectorization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Image to SVG Converter
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transform raster PNG, JPG, and WebP graphics into clean, scalable SVG vector files.
              Engineered for logos, icons, badges, signatures, and flat illustrations with smart auto setup and custom target size optimization.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGuide(!showGuide)}
              rightIcon={showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            >
              How it works
            </Button>
          </div>
        </div>
      </div>

      {/* ── HOW-TO GUIDE ACCORDION ── */}
      {showGuide && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-400" />
            <span>How to Convert Images to Scalable Vectors</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_TO_STEPS.map((s) => (
              <div
                key={s.step}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                  {s.step}
                </div>
                <h4 className="text-xs font-bold text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ERROR BANNER ── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* ── STEP 1: UPLOAD AREA ── */}
      <ImageToSvgUploader
        loadedImage={loadedImage}
        onImageLoaded={handleImageLoaded}
        onClear={handleClear}
        isLoading={isConverting}
      />

      {/* ── STEP 2 & 3: CONTROLS, PREVIEW & CODE VIEWER (When Image Loaded) ── */}
      {loadedImage && (
        <div className="space-y-8 animate-fadeIn">
          {/* Controls */}
          <ImageToSvgControls
            settings={settings}
            analysis={loadedImage.analysis}
            onChange={handleSettingsChange}
            onReConvert={handleReConvert}
            isConverting={isConverting}
          />

          {/* Progress / Status indicator during conversion */}
          {isConverting && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
              <span className="text-xs font-semibold text-blue-300">
                {progressStep}
              </span>
            </div>
          )}

          {/* Interactive Preview Canvas */}
          <ImageToSvgPreview
            loadedImage={loadedImage}
            result={result}
            isConverting={isConverting}
          />

          {/* Action Download & Export Bar */}
          {result && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-sm font-bold text-white">Vector File Ready for Export</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Validated SVG
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ready to download in high quality standard or minified SVG format.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCopySvgCode}
                  leftIcon={
                    isCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                >
                  {isCopied ? 'Copied to Clipboard' : 'Copy SVG Code'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleDownloadSvg(true)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Optimized SVG
                </Button>

                <Button
                  variant="gradient"
                  size="md"
                  onClick={() => handleDownloadSvg(false)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download SVG
                </Button>
              </div>
            </div>
          )}

          {/* SVG Code Viewer */}
          {result?.svgString && <ImageToSvgCodeViewer svgCode={result.svgString} />}
        </div>
      )}

      {/* ── FEATURE HIGHLIGHTS (When No Image is Loaded) ── */}
      {!loadedImage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Smart Auto Setup</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-detects image classification, color palette, and edge density to choose the best vector parameters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Logo Quality Mode</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailored smoothing and color clustering algorithm crafted specifically for crisp company logos and badges.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">100% Client-Side</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All vectorization runs right in your browser. Your images and vector output never leave your computer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Pure Scalable SVG</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates genuine multi-layer Bézier curve vector paths with zero blurriness at any zoom or screen resolution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
