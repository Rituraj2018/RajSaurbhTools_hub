/**
 * Advanced Image to SVG Vectorization Engine
 * 100% Client-side Processing:
 * - Smart Image Analysis & Classification (Logo, Icon, Illustration, Signature, B&W, Photograph)
 * - Multi-layer Color Quantization (Median Cut / K-Means / Otsu Thresholding)
 * - Dual-Grid Marching Squares Boundary Contour Extraction
 * - Noise Despeckling & Island Removal
 * - Ramer-Douglas-Peucker (RDP) Polygon Simplification
 * - Corner-Preserving Smooth Cubic Bézier Curve Fitting
 * - Background Detection & Selective Transparency Removal
 * - Output Size Optimization & Custom Target KB Engine
 * - SVG Assembly, Sanitization, Optimization, and Strict Validation
 */

export type ImageClassification =
  | 'Logo'
  | 'Icon'
  | 'Illustration'
  | 'Signature'
  | 'Black & White'
  | 'Photograph';

export type VectorizationMode =
  | 'Auto'
  | 'Logo'
  | 'Icon'
  | 'Illustration'
  | 'Signature'
  | 'Black & White'
  | 'Custom';

export type ColorMode =
  | 'Auto'
  | 'Full Color'
  | 'Limited Colors'
  | 'Grayscale'
  | 'Black & White';

export type DetailLevel = 'Auto' | 'Low' | 'Medium' | 'High' | 'Ultra';

export type BackgroundHandling =
  | 'Auto'
  | 'Preserve'
  | 'Transparent'
  | 'Remove White'
  | 'Custom Color';

export type SvgOptimization = 'Auto' | 'Standard' | 'Maximum Optimization';

export type OutputSizePreset = 'auto' | 'small' | 'balanced' | 'high' | 'custom';

export interface SvgConverterSettings {
  autoOptimize: boolean;
  outputSizePreset: OutputSizePreset;
  customTargetKb: number; // in KB, e.g. 100
  vectorMode: VectorizationMode;
  colorMode: ColorMode;
  colorCount: number; // 2 to 32 (or 0 for auto)
  detailLevel: DetailLevel;
  edgeSmoothing: number; // 0 to 10
  noiseRemoval: number; // 0 to 10 (despeckle min area)
  pathSimplification: number; // 0 to 10 (RDP epsilon)
  background: BackgroundHandling;
  customBgColor?: string;
  svgOptimization: SvgOptimization;
  logoQualityMode: boolean;
}

export interface ImageAnalysisResult {
  classification: ImageClassification;
  confidence: number;
  width: number;
  height: number;
  aspectRatio: number;
  hasTransparency: boolean;
  transparencyRatio: number;
  dominantColors: string[];
  estimatedUniqueColors: number;
  edgeComplexity: number; // 0 (flat) to 100 (highly complex)
  isMonochrome: boolean;
  isLikelySignature: boolean;
  isLikelyLogoOrIcon: boolean;
  recommendedSettings: Partial<SvgConverterSettings>;
}

export interface SvgConversionResult {
  svgString: string;
  optimizedSvgString: string;
  width: number;
  height: number;
  viewBox: string;
  pathCount: number;
  colorCount: number;
  colorsUsed: string[];
  originalSizeBytes: number;
  svgSizeBytes: number;
  optimizedSvgSizeBytes: number;
  processingTimeMs: number;
  analysis: ImageAnalysisResult;
  isValid: boolean;
  validationError?: string;
  targetKb?: number;
  actualKb: number;
  sizeChangePercent: number;
}

export interface LoadedVectorImage {
  file: File;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  aspectRatio: number;
  dataUrl: string;
  imageData: ImageData;
  analysis: ImageAnalysisResult;
}

export const DEFAULT_SVG_SETTINGS: SvgConverterSettings = {
  autoOptimize: true,
  outputSizePreset: 'auto',
  customTargetKb: 100,
  vectorMode: 'Auto',
  colorMode: 'Auto',
  colorCount: 8,
  detailLevel: 'Medium',
  edgeSmoothing: 5,
  noiseRemoval: 4,
  pathSimplification: 5,
  background: 'Auto',
  svgOptimization: 'Standard',
  logoQualityMode: true,
};

// ─────────────────────────────────────────────────────────────
// 1. SMART IMAGE ANALYSIS & AUTO SETUP
// ─────────────────────────────────────────────────────────────

export async function loadImageFromFile(file: File): Promise<LoadedVectorImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Limit maximum analysis canvas resolution for responsive performance
          const maxDim = 1200;
          let canvasWidth = width;
          let canvasHeight = height;
          if (canvasWidth > maxDim || canvasHeight > maxDim) {
            const scale = maxDim / Math.max(canvasWidth, canvasHeight);
            canvasWidth = Math.round(canvasWidth * scale);
            canvasHeight = Math.round(canvasHeight * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            throw new Error('Canvas 2D context creation failed.');
          }

          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          const analysis = analyzeRasterImage(imageData, width, height);

          resolve({
            file,
            name: file.name,
            sizeBytes: file.size,
            width,
            height,
            aspectRatio: width / (height || 1),
            dataUrl,
            imageData,
            analysis,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Perform detailed raster image inspection:
 * - Color histogram & clustering
 * - Edge density via Sobel operator
 * - Alpha transparency distribution
 * - Image type heuristics
 */
export function analyzeRasterImage(
  imageData: ImageData,
  origWidth: number,
  origHeight: number
): ImageAnalysisResult {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  let transparentPixels = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  let grayPixels = 0;

  // Color frequency map (5-bit quantization for rapid dominant color grouping)
  const colorBuckets = new Map<number, { count: number; r: number; g: number; b: number }>();

  // Sample stride to ensure responsiveness
  const step = totalPixels > 250000 ? 2 : 1;
  let sampledCount = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      sampledCount++;

      if (a < 30) {
        transparentPixels++;
        continue;
      }

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 50) darkPixels++;
      if (lum > 210) brightPixels++;

      const isGray = Math.abs(r - g) < 15 && Math.abs(r - b) < 15 && Math.abs(g - b) < 15;
      if (isGray) grayPixels++;

      // 5-bit color quantization key
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const existing = colorBuckets.get(key);
      if (existing) {
        existing.count++;
        existing.r += r;
        existing.g += g;
        existing.b += b;
      } else {
        colorBuckets.set(key, { count: 1, r, g, b });
      }
    }
  }

  const transparencyRatio = transparentPixels / (sampledCount || 1);
  const hasTransparency = transparencyRatio > 0.02;

  // Extract top dominant colors sorted by frequency
  const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);
  const topBuckets = sortedBuckets.slice(0, 8);
  const dominantColors = topBuckets.map((b) => {
    const avgR = Math.round(b.r / b.count);
    const avgG = Math.round(b.g / b.count);
    const avgB = Math.round(b.b / b.count);
    return rgbToHex(avgR, avgG, avgB);
  });

  const estimatedUniqueColors = colorBuckets.size;

  // Measure edge complexity using Sobel gradient sampling
  let edgeSum = 0;
  let edgeSamples = 0;
  const edgeStep = Math.max(2, Math.floor(Math.min(width, height) / 80));

  for (let y = 1; y < height - 1; y += edgeStep) {
    for (let x = 1; x < width - 1; x += edgeStep) {
      const getLum = (px: number, py: number) => {
        const i = (py * width + px) * 4;
        return data[i + 3] < 30 ? 255 : 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      };

      const gx =
        -1 * getLum(x - 1, y - 1) + 1 * getLum(x + 1, y - 1) +
        -2 * getLum(x - 1, y)     + 2 * getLum(x + 1, y) +
        -1 * getLum(x - 1, y + 1) + 1 * getLum(x + 1, y + 1);

      const gy =
        -1 * getLum(x - 1, y - 1) - 2 * getLum(x, y - 1) - 1 * getLum(x + 1, y - 1) +
         1 * getLum(x - 1, y + 1) + 2 * getLum(x, y + 1) + 1 * getLum(x + 1, y + 1);

      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag > 40) {
        edgeSum++;
      }
      edgeSamples++;
    }
  }

  const edgeDensity = (edgeSum / (edgeSamples || 1)) * 100;
  const edgeComplexity = Math.min(100, Math.round(edgeDensity * 2.5));

  const isMonochrome = grayPixels / (sampledCount || 1) > 0.85;
  const isLikelySignature =
    (isMonochrome || topBuckets.length <= 4) &&
    darkPixels > 0 &&
    darkPixels / (sampledCount || 1) < 0.35 &&
    (brightPixels / (sampledCount || 1) > 0.55 || hasTransparency);

  const isLikelyLogoOrIcon =
    estimatedUniqueColors < 350 &&
    (topBuckets.length <= 16 || topBuckets.slice(0, 6).reduce((sum, b) => sum + b.count, 0) / (sampledCount || 1) > 0.8);

  // Classify image
  let classification: ImageClassification = 'Illustration';
  let confidence = 85;

  if (isLikelySignature) {
    classification = 'Signature';
    confidence = 92;
  } else if (isMonochrome && estimatedUniqueColors < 120) {
    classification = 'Black & White';
    confidence = 90;
  } else if (isLikelyLogoOrIcon && (width <= 400 || height <= 400)) {
    classification = 'Icon';
    confidence = 88;
  } else if (isLikelyLogoOrIcon) {
    classification = 'Logo';
    confidence = 94;
  } else if (estimatedUniqueColors > 800 || edgeComplexity > 65) {
    classification = 'Photograph';
    confidence = 82;
  } else {
    classification = 'Illustration';
    confidence = 80;
  }

  // Generate recommended settings based on image classification
  const recommendedSettings: Partial<SvgConverterSettings> = {};

  switch (classification) {
    case 'Signature':
      recommendedSettings.vectorMode = 'Signature';
      recommendedSettings.colorMode = 'Black & White';
      recommendedSettings.colorCount = 2;
      recommendedSettings.edgeSmoothing = 6;
      recommendedSettings.noiseRemoval = 3;
      recommendedSettings.pathSimplification = 4;
      recommendedSettings.background = 'Remove White';
      recommendedSettings.logoQualityMode = true;
      break;

    case 'Logo':
      recommendedSettings.vectorMode = 'Logo';
      recommendedSettings.colorMode = 'Limited Colors';
      recommendedSettings.colorCount = Math.min(8, Math.max(3, topBuckets.length + 1));
      recommendedSettings.edgeSmoothing = 6;
      recommendedSettings.noiseRemoval = 5;
      recommendedSettings.pathSimplification = 5;
      recommendedSettings.background = hasTransparency ? 'Transparent' : 'Auto';
      recommendedSettings.logoQualityMode = true;
      break;

    case 'Icon':
      recommendedSettings.vectorMode = 'Icon';
      recommendedSettings.colorMode = 'Limited Colors';
      recommendedSettings.colorCount = Math.min(6, Math.max(2, topBuckets.length));
      recommendedSettings.edgeSmoothing = 7;
      recommendedSettings.noiseRemoval = 6;
      recommendedSettings.pathSimplification = 6;
      recommendedSettings.background = hasTransparency ? 'Transparent' : 'Auto';
      recommendedSettings.logoQualityMode = true;
      break;

    case 'Black & White':
      recommendedSettings.vectorMode = 'Black & White';
      recommendedSettings.colorMode = 'Black & White';
      recommendedSettings.colorCount = 2;
      recommendedSettings.edgeSmoothing = 5;
      recommendedSettings.noiseRemoval = 5;
      recommendedSettings.pathSimplification = 5;
      recommendedSettings.background = 'Auto';
      recommendedSettings.logoQualityMode = false;
      break;

    case 'Photograph':
      recommendedSettings.vectorMode = 'Illustration';
      recommendedSettings.colorMode = 'Full Color';
      recommendedSettings.colorCount = 16;
      recommendedSettings.edgeSmoothing = 4;
      recommendedSettings.noiseRemoval = 5;
      recommendedSettings.pathSimplification = 5;
      recommendedSettings.background = 'Preserve';
      recommendedSettings.logoQualityMode = false;
      break;

    case 'Illustration':
    default:
      recommendedSettings.vectorMode = 'Illustration';
      recommendedSettings.colorMode = 'Limited Colors';
      recommendedSettings.colorCount = 12;
      recommendedSettings.edgeSmoothing = 5;
      recommendedSettings.noiseRemoval = 4;
      recommendedSettings.pathSimplification = 5;
      recommendedSettings.background = hasTransparency ? 'Transparent' : 'Auto';
      recommendedSettings.logoQualityMode = false;
      break;
  }

  return {
    classification,
    confidence,
    width: origWidth,
    height: origHeight,
    aspectRatio: origWidth / (origHeight || 1),
    hasTransparency,
    transparencyRatio,
    dominantColors,
    estimatedUniqueColors,
    edgeComplexity,
    isMonochrome,
    isLikelySignature,
    isLikelyLogoOrIcon,
    recommendedSettings,
  };
}

// ─────────────────────────────────────────────────────────────
// 2. VECTORIZATION PIPELINE & SVG GENERATION
// ─────────────────────────────────────────────────────────────

interface ColorRGB {
  r: number;
  g: number;
  b: number;
  hex: string;
}

interface Point {
  x: number;
  y: number;
}

export async function convertImageToSvg(
  loadedImage: LoadedVectorImage,
  settings: SvgConverterSettings,
  onProgress?: (step: string, percent: number) => void
): Promise<SvgConversionResult> {
  const startTime = performance.now();

  onProgress?.('Analyzing image...', 10);

  // If custom target KB is selected, run custom iterative optimizer
  if (settings.outputSizePreset === 'custom' && settings.customTargetKb > 0) {
    return runCustomTargetOptimizer(loadedImage, settings, startTime, onProgress);
  }

  // Standard single-pass vectorization
  return runSingleVectorizationPass(loadedImage, settings, startTime, onProgress);
}

/**
 * Execute a single vectorization pass with specified settings
 */
async function runSingleVectorizationPass(
  loadedImage: LoadedVectorImage,
  settings: SvgConverterSettings,
  startTime: number,
  onProgress?: (step: string, percent: number) => void,
  precisionOverride?: number
): Promise<SvgConversionResult> {
  const { width: origW, height: origH, analysis, sizeBytes } = loadedImage;

  // Resolve active configuration (Apply preset / Auto / Logo Mode defaults)
  const activeSettings = resolveActiveSettings(settings, analysis);

  onProgress?.('Detecting colors and edges...', 25);

  // 1. Resample raster grid based on Detail Level
  const targetScale = getDetailScale(activeSettings.detailLevel, origW, origH);
  const workW = Math.max(10, Math.round(origW * targetScale));
  const workH = Math.max(10, Math.round(origH * targetScale));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = workW;
  workCanvas.height = workH;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!workCtx) {
    throw new Error('Failed to create internal vector processing canvas.');
  }

  // Draw original image scaled onto working canvas
  const tempImg = new Image();
  await new Promise<void>((resolve, reject) => {
    tempImg.onload = () => resolve();
    tempImg.onerror = () => reject(new Error('Failed to load image buffer for vectorization.'));
    tempImg.src = loadedImage.dataUrl;
  });

  workCtx.imageSmoothingEnabled = true;
  workCtx.imageSmoothingQuality = 'high';
  workCtx.drawImage(tempImg, 0, 0, workW, workH);

  const workImageData = workCtx.getImageData(0, 0, workW, workH);

  // 2. Color Quantization & Segmentation
  const { quantizedGrid, palette, backgroundLayerIdx } = quantizeImageColors(
    workImageData,
    activeSettings
  );

  // Despeckle raster grid to eliminate single-pixel noise before tracing
  despeckleGrid(quantizedGrid, workW, workH, activeSettings.noiseRemoval);

  onProgress?.('Generating vector paths...', 50);

  // 3. Dual-Grid Marching Squares Boundary Extraction for Each Color Layer
  const svgPaths: { color: string; d: string; area: number }[] = [];
  const minArea = getMinNoiseArea(activeSettings.noiseRemoval, workW, workH);
  const rdpEpsilon = getRdpEpsilon(activeSettings.pathSimplification, workW, workH);
  const smoothingFactor = activeSettings.edgeSmoothing / 10;
  const precision = precisionOverride !== undefined ? precisionOverride : getCoordinatePrecision(activeSettings);

  const scaleX = origW / workW;
  const scaleY = origH / workH;

  for (let colorIdx = 0; colorIdx < palette.length; colorIdx++) {
    // Check if this layer should be omitted as transparent background
    if (colorIdx === backgroundLayerIdx && shouldOmitBackground(activeSettings.background, analysis)) {
      continue;
    }

    const color = palette[colorIdx];
    const mask = createBinaryMask(quantizedGrid, workW, workH, colorIdx);

    // Trace closed boundary loops using dual-grid Marching Squares
    const loops = traceDualGridContours(mask, workW, workH);

    const pathSegments: string[] = [];
    let totalLayerArea = 0;

    for (const loop of loops) {
      const area = calculatePolygonArea(loop);
      if (Math.abs(area) < minArea) {
        continue; // Discard tiny noise speckles
      }

      totalLayerArea += Math.abs(area);

      // Scale loop back to original image coordinate space
      const scaledLoop: Point[] = loop.map((pt) => ({
        x: Number((pt.x * scaleX).toFixed(precision)),
        y: Number((pt.y * scaleY).toFixed(precision)),
      }));

      // Simplify polygon vertices via Ramer-Douglas-Peucker (RDP)
      const simplified = simplifyRdp(scaledLoop, rdpEpsilon);
      if (simplified.length < 3) continue;

      // Fit smooth cubic Bézier curves or output crisp polygon path
      const d = fitBezierCurves(simplified, smoothingFactor, precision);
      if (d) {
        pathSegments.push(d);
      }
    }

    if (pathSegments.length > 0) {
      svgPaths.push({
        color: color.hex,
        d: pathSegments.join(' '),
        area: totalLayerArea,
      });
    }
  }

  // If no paths generated (e.g. extreme noise filtering), generate fallback layer
  if (svgPaths.length === 0 && palette.length > 0) {
    const mainColor = palette[0].hex;
    svgPaths.push({
      color: mainColor,
      d: `M 0 0 L ${origW} 0 L ${origW} ${origH} L 0 ${origH} Z`,
      area: origW * origH,
    });
  }

  onProgress?.('Optimizing SVG...', 75);

  // Sort paths background-to-foreground (larger area rendered first)
  svgPaths.sort((a, b) => b.area - a.area);

  // 4. Assemble SVG Document Markup
  const svgMarkup = buildSvgMarkup(origW, origH, svgPaths, 'standard');
  const optimizedSvgMarkup = buildSvgMarkup(origW, origH, svgPaths, 'optimized');

  onProgress?.('Validating output...', 90);

  // 5. Sanitize and Validate Output
  const validation = validateSvg(svgMarkup);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Generated SVG failed validation.');
  }

  const processingTimeMs = Math.round(performance.now() - startTime);
  const svgSizeBytes = new Blob([svgMarkup]).size;
  const optimizedSvgSizeBytes = new Blob([optimizedSvgMarkup]).size;

  onProgress?.('Ready', 100);

  const colorsUsed = svgPaths.map((p) => p.color);
  const uniqueColors = Array.from(new Set(colorsUsed));

  const actualKb = Number((svgSizeBytes / 1024).toFixed(1));
  const origKb = Number((sizeBytes / 1024).toFixed(1));
  const sizeChangePercent = origKb > 0 ? Math.round(((actualKb - origKb) / origKb) * 100) : 0;

  return {
    svgString: svgMarkup,
    optimizedSvgString: optimizedSvgMarkup,
    width: origW,
    height: origH,
    viewBox: `0 0 ${origW} ${origH}`,
    pathCount: svgPaths.length,
    colorCount: uniqueColors.length,
    colorsUsed: uniqueColors,
    originalSizeBytes: sizeBytes,
    svgSizeBytes,
    optimizedSvgSizeBytes,
    processingTimeMs,
    analysis,
    isValid: validation.isValid,
    validationError: validation.error,
    targetKb: settings.outputSizePreset === 'custom' ? settings.customTargetKb : undefined,
    actualKb,
    sizeChangePercent,
  };
}

/**
 * Intelligent iterative custom size optimizer:
 * Progressively adjusts vector detail and simplification to match target KB
 */
async function runCustomTargetOptimizer(
  loadedImage: LoadedVectorImage,
  settings: SvgConverterSettings,
  startTime: number,
  onProgress?: (step: string, percent: number) => void
): Promise<SvgConversionResult> {
  const targetKb = Math.max(10, Math.min(5000, settings.customTargetKb));

  // Initial estimate based on target size
  let workSettings: SvgConverterSettings = {
    ...settings,
    autoOptimize: false,
  };

  if (targetKb < 40) {
    workSettings.detailLevel = 'Low';
    workSettings.colorCount = Math.min(4, settings.colorCount || 4);
    workSettings.pathSimplification = 7;
    workSettings.noiseRemoval = 6;
  } else if (targetKb < 120) {
    workSettings.detailLevel = 'Medium';
    workSettings.colorCount = Math.min(8, settings.colorCount || 8);
    workSettings.pathSimplification = 5;
    workSettings.noiseRemoval = 4;
  } else {
    workSettings.detailLevel = 'High';
    workSettings.colorCount = Math.min(16, settings.colorCount || 16);
    workSettings.pathSimplification = 3;
    workSettings.noiseRemoval = 3;
  }

  let bestResult: SvgConversionResult | null = null;
  let minDiff = Infinity;

  // Max 3 iterations to prevent UI lag
  for (let iter = 0; iter < 3; iter++) {
    onProgress?.(`Optimizing vector paths (pass ${iter + 1}/3)...`, 30 + iter * 20);

    const res = await runSingleVectorizationPass(
      loadedImage,
      workSettings,
      startTime,
      undefined,
      targetKb < 50 ? 1 : 2
    );

    const currentKb = res.svgSizeBytes / 1024;
    const diff = Math.abs(currentKb - targetKb);

    if (diff < minDiff) {
      minDiff = diff;
      bestResult = res;
    }

    // If within 15% of target, stop
    if (diff / targetKb < 0.15) {
      break;
    }

    // Adjust parameters for next iteration
    if (currentKb > targetKb) {
      // Too large -> increase simplification, increase noise threshold, reduce colors
      workSettings = {
        ...workSettings,
        pathSimplification: Math.min(10, workSettings.pathSimplification + 2),
        noiseRemoval: Math.min(10, workSettings.noiseRemoval + 2),
        colorCount: Math.max(2, Math.round(workSettings.colorCount * 0.75)),
        detailLevel: workSettings.detailLevel === 'High' ? 'Medium' : 'Low',
      };
    } else {
      // Significantly below target and safe to improve quality
      if (currentKb < targetKb * 0.5 && iter === 0) {
        workSettings = {
          ...workSettings,
          pathSimplification: Math.max(1, workSettings.pathSimplification - 2),
          colorCount: Math.min(24, workSettings.colorCount + 4),
          detailLevel: 'High',
        };
      } else {
        break;
      }
    }
  }

  if (!bestResult) {
    return runSingleVectorizationPass(loadedImage, settings, startTime, onProgress);
  }

  bestResult.targetKb = targetKb;
  onProgress?.('Ready', 100);
  return bestResult;
}

// ─────────────────────────────────────────────────────────────
// 3. COLOR QUANTIZATION (Median-Cut & K-Means Clustering)
// ─────────────────────────────────────────────────────────────

function quantizeImageColors(
  imageData: ImageData,
  settings: SvgConverterSettings
): { quantizedGrid: Int16Array; palette: ColorRGB[]; backgroundLayerIdx: number } {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const quantizedGrid = new Int16Array(pixelCount);

  // Handle Black & White / Signature Mode with Otsu thresholding
  if (
    settings.colorMode === 'Black & White' ||
    settings.vectorMode === 'Signature' ||
    settings.vectorMode === 'Black & White'
  ) {
    const threshold = calculateOtsuThreshold(imageData);
    const palette: ColorRGB[] = [
      { r: 0, g: 0, b: 0, hex: '#000000' },
      { r: 255, g: 255, b: 255, hex: '#ffffff' },
    ];

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const a = data[idx + 3];
      if (a < 30) {
        quantizedGrid[i] = 1; // Treat transparent as white background
        continue;
      }
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      quantizedGrid[i] = lum < threshold ? 0 : 1; // 0 = Black ink, 1 = White bg
    }

    return { quantizedGrid, palette, backgroundLayerIdx: 1 };
  }

  // Handle Grayscale Mode
  if (settings.colorMode === 'Grayscale') {
    const k = Math.min(16, Math.max(2, settings.colorCount || 6));
    const palette: ColorRGB[] = [];
    const step = 255 / (k - 1 || 1);
    for (let i = 0; i < k; i++) {
      const val = Math.round(i * step);
      palette.push({ r: val, g: val, b: val, hex: rgbToHex(val, val, val) });
    }

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const a = data[idx + 3];
      if (a < 30) {
        quantizedGrid[i] = -1; // Transparent
        continue;
      }
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const level = Math.min(k - 1, Math.max(0, Math.round(lum / step)));
      quantizedGrid[i] = level;
    }

    return { quantizedGrid, palette, backgroundLayerIdx: k - 1 };
  }

  // Full Color / Limited Color: Median-Cut Clustering
  const targetColors = Math.min(32, Math.max(2, settings.colorCount || 8));
  const pixels: ColorRGB[] = [];

  // Sample pixels for color palette creation
  const sampleStep = Math.max(1, Math.floor(Math.sqrt(pixelCount / 4000)));
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a >= 30) {
        pixels.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          hex: '',
        });
      }
    }
  }

  const palette = medianCutQuantize(pixels, targetColors);

  // Detect corner background color to identify backgroundLayerIdx
  const cornerColors = [
    getPixelColor(data, 0, 0, width),
    getPixelColor(data, width - 1, 0, width),
    getPixelColor(data, 0, height - 1, width),
    getPixelColor(data, width - 1, height - 1, width),
  ];

  const bgCandidate: ColorRGB = cornerColors[0];
  const backgroundLayerIdx = findClosestColorIndex(bgCandidate, palette);

  // Map each pixel to nearest palette index
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const a = data[idx + 3];
    if (a < 30) {
      quantizedGrid[i] = -1; // Transparent pixel
    } else {
      const pxColor: ColorRGB = {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        hex: '',
      };
      quantizedGrid[i] = findClosestColorIndex(pxColor, palette);
    }
  }

  return { quantizedGrid, palette, backgroundLayerIdx };
}

/**
 * Fast 3x3 majority filter to despeckle isolated single-pixel raster noise
 */
function despeckleGrid(
  grid: Int16Array,
  width: number,
  height: number,
  noiseRemoval: number
): void {
  if (noiseRemoval <= 1) return;

  const copy = new Int16Array(grid);
  const minNeighbors = noiseRemoval >= 6 ? 4 : 3;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const cur = copy[y * width + x];
      if (cur === -1) continue;

      let matching = 0;
      // Check 8 neighbors
      if (copy[(y - 1) * width + (x - 1)] === cur) matching++;
      if (copy[(y - 1) * width + x] === cur) matching++;
      if (copy[(y - 1) * width + (x + 1)] === cur) matching++;
      if (copy[y * width + (x - 1)] === cur) matching++;
      if (copy[y * width + (x + 1)] === cur) matching++;
      if (copy[(y + 1) * width + (x - 1)] === cur) matching++;
      if (copy[(y + 1) * width + x] === cur) matching++;
      if (copy[(y + 1) * width + (x + 1)] === cur) matching++;

      if (matching < minNeighbors) {
        // Replace with top neighbor
        grid[y * width + x] = copy[(y - 1) * width + x];
      }
    }
  }
}

function medianCutQuantize(pixels: ColorRGB[], targetCount: number): ColorRGB[] {
  if (pixels.length === 0) {
    return [{ r: 0, g: 0, b: 0, hex: '#000000' }];
  }

  const boxes: ColorRGB[][] = [pixels];

  while (boxes.length < targetCount) {
    let bestIdx = -1;
    let maxRange = -1;
    let splitChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.length <= 1) continue;

      let minR = 255, maxR = 0;
      let minG = 255, maxG = 0;
      let minB = 255, maxB = 0;

      for (const p of box) {
        if (p.r < minR) minR = p.r;
        if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g;
        if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b;
        if (p.b > maxB) maxB = p.b;
      }

      const rRange = maxR - minR;
      const gRange = maxG - minG;
      const bRange = maxB - minB;
      const currentMax = Math.max(rRange, gRange, bRange);

      if (currentMax > maxRange) {
        maxRange = currentMax;
        bestIdx = i;
        splitChannel = rRange === currentMax ? 'r' : gRange === currentMax ? 'g' : 'b';
      }
    }

    if (bestIdx === -1 || maxRange <= 2) break;

    const targetBox = boxes.splice(bestIdx, 1)[0];
    targetBox.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(targetBox.length / 2);
    boxes.push(targetBox.slice(0, mid));
    boxes.push(targetBox.slice(mid));
  }

  return boxes.map((box) => {
    let sumR = 0, sumG = 0, sumB = 0;
    for (const p of box) {
      sumR += p.r;
      sumG += p.g;
      sumB += p.b;
    }
    const count = box.length || 1;
    const r = Math.round(sumR / count);
    const g = Math.round(sumG / count);
    const b = Math.round(sumB / count);
    return { r, g, b, hex: rgbToHex(r, g, b) };
  });
}

function findClosestColorIndex(color: ColorRGB, palette: ColorRGB[]): number {
  let minDistance = Infinity;
  let bestIdx = 0;

  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = color.r - p.r;
    const dg = color.g - p.g;
    const db = color.b - p.b;
    const dist = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
    if (dist < minDistance) {
      minDistance = dist;
      bestIdx = i;
    }
  }

  return bestIdx;
}

function calculateOtsuThreshold(imageData: ImageData): number {
  const { data } = imageData;
  const histogram = new Array(256).fill(0);
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 30) {
      const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[lum]++;
      total++;
    }
  }

  if (total === 0) return 128;

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVar) {
      maxVar = variance;
      threshold = t;
    }
  }

  return threshold;
}

// ─────────────────────────────────────────────────────────────
// 4. DUAL-GRID MARCHING SQUARES CONTOUR TRACING
// ─────────────────────────────────────────────────────────────

function createBinaryMask(
  quantizedGrid: Int16Array,
  width: number,
  height: number,
  targetIdx: number
): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < quantizedGrid.length; i++) {
    mask[i] = quantizedGrid[i] === targetIdx ? 1 : 0;
  }
  return mask;
}

/**
 * Robust Dual-Grid Marching Squares contour extraction:
 * Guarantees closed, directed, non-self-intersecting boundary loops
 */
function traceDualGridContours(
  mask: Uint8Array,
  width: number,
  height: number
): Point[][] {
  const pw = width + 2;
  const ph = height + 2;
  const pmask = new Uint8Array(pw * ph);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pmask[(y + 1) * pw + (x + 1)] = mask[y * width + x];
    }
  }

  // Helper to generate unique integer key for half-grid vertex coordinates
  const pointKey = (x: number, y: number): string => `${Math.round(x * 2)},${Math.round(y * 2)}`;

  interface Segment {
    from: Point;
    to: Point;
  }

  const segments: Segment[] = [];
  const startMap = new Map<string, number[]>();

  const addSeg = (from: Point, to: Point) => {
    const segIdx = segments.length;
    segments.push({ from, to });
    const k = pointKey(from.x, from.y);
    if (!startMap.has(k)) {
      startMap.set(k, []);
    }
    startMap.get(k)!.push(segIdx);
  };

  for (let cy = 0; cy < ph - 1; cy++) {
    for (let cx = 0; cx < pw - 1; cx++) {
      const tl = pmask[cy * pw + cx];
      const tr = pmask[cy * pw + cx + 1];
      const br = pmask[(cy + 1) * pw + cx + 1];
      const bl = pmask[(cy + 1) * pw + cx];

      const caseIdx = tl | (tr << 1) | (br << 2) | (bl << 3);
      if (caseIdx === 0 || caseIdx === 15) continue;

      const top: Point = { x: cx + 0.5 - 1, y: cy - 1 };
      const right: Point = { x: cx + 1 - 1, y: cy + 0.5 - 1 };
      const bottom: Point = { x: cx + 0.5 - 1, y: cy + 1 - 1 };
      const left: Point = { x: cx - 1, y: cy + 0.5 - 1 };

      switch (caseIdx) {
        case 1:  addSeg(left, top); break;
        case 2:  addSeg(top, right); break;
        case 3:  addSeg(left, right); break;
        case 4:  addSeg(right, bottom); break;
        case 5:  addSeg(left, top); addSeg(right, bottom); break;
        case 6:  addSeg(top, bottom); break;
        case 7:  addSeg(left, bottom); break;
        case 8:  addSeg(bottom, left); break;
        case 9:  addSeg(bottom, top); break;
        case 10: addSeg(top, right); addSeg(bottom, left); break;
        case 11: addSeg(bottom, right); break;
        case 12: addSeg(right, left); break;
        case 13: addSeg(right, top); break;
        case 14: addSeg(top, left); break;
      }
    }
  }

  // Chain directed segments into closed polygon loops
  const visitedSegs = new Uint8Array(segments.length);
  const loops: Point[][] = [];

  for (let i = 0; i < segments.length; i++) {
    if (visitedSegs[i]) continue;

    const loop: Point[] = [];
    let curIdx = i;
    const startPointKey = pointKey(segments[curIdx].from.x, segments[curIdx].from.y);
    let steps = 0;
    const maxSteps = segments.length + 10;

    while (curIdx !== -1 && !visitedSegs[curIdx] && steps++ < maxSteps) {
      visitedSegs[curIdx] = 1;
      const seg = segments[curIdx];
      loop.push(seg.from);

      const nextKey = pointKey(seg.to.x, seg.to.y);
      if (nextKey === startPointKey) {
        break; // Loop closed cleanly
      }

      const candidates = startMap.get(nextKey);
      let nextIdx = -1;
      if (candidates) {
        for (const c of candidates) {
          if (!visitedSegs[c]) {
            nextIdx = c;
            break;
          }
        }
      }
      curIdx = nextIdx;
    }

    if (loop.length >= 3) {
      loops.push(loop);
    }
  }

  return loops;
}

// ─────────────────────────────────────────────────────────────
// 5. PATH SIMPLIFICATION & BÉZIER CURVE FITTING
// ─────────────────────────────────────────────────────────────

/**
 * Ramer-Douglas-Peucker (RDP) polygon simplification
 */
function simplifyRdp(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyRdp(points.slice(0, index + 1), epsilon);
    const right = simplifyRdp(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [start, end];
  }
}

function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - p1.x, p.y - p1.y);
  }
  const u = Math.max(0, Math.min(1, ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / (dx * dx + dy * dy)));
  const projX = p1.x + u * dx;
  const projY = p1.y + u * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Converts simplified polygon points into smooth cubic Bézier curves
 * while preserving sharp corner angles.
 */
function fitBezierCurves(points: Point[], smoothing: number, precision: number): string {
  if (points.length < 3) return '';

  const n = points.length;
  const fmt = (val: number) => Number(val.toFixed(precision));

  let path = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;

  if (smoothing <= 0.05) {
    // Sharp Polygon lines
    for (let i = 1; i < n; i++) {
      path += ` L ${fmt(points[i].x)} ${fmt(points[i].y)}`;
    }
    path += ' Z';
    return path;
  }

  // Smooth Catmull-Rom to cubic Bézier curve fitting
  const tension = 0.22 * smoothing;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Preserve sharp corners (> 68 deg turn)
    const angle = calculateAngle(p0, p1, p2);
    if (angle < 1.2) {
      path += ` L ${fmt(p2.x)} ${fmt(p2.y)}`;
      continue;
    }

    const cp1x = fmt(p1.x + (p2.x - p0.x) * tension);
    const cp1y = fmt(p1.y + (p2.y - p0.y) * tension);
    const cp2x = fmt(p2.x - (p3.x - p1.x) * tension);
    const cp2y = fmt(p2.y - (p3.y - p1.y) * tension);

    path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }

  path += ' Z';
  return path;
}

function calculateAngle(p1: Point, p2: Point, p3: Point): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y) || 1;
  const mag2 = Math.hypot(v2.x, v2.y) || 1;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
}

function calculatePolygonArea(points: Point[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
}

// ─────────────────────────────────────────────────────────────
// 6. SVG ASSEMBLY, OPTIMIZATION & VALIDATION
// ─────────────────────────────────────────────────────────────

function buildSvgMarkup(
  width: number,
  height: number,
  paths: { color: string; d: string }[],
  mode: 'standard' | 'optimized'
): string {
  // Group paths by color fill to reduce SVG overhead
  const colorGroups = new Map<string, string[]>();
  for (const p of paths) {
    if (!p.d) continue;
    if (!colorGroups.has(p.color)) {
      colorGroups.set(p.color, []);
    }
    colorGroups.get(p.color)!.push(p.d);
  }

  let pathsMarkup = '';
  for (const [color, dList] of colorGroups.entries()) {
    const combinedD = dList.join(' ');
    if (combinedD) {
      pathsMarkup += `  <path fill="${color}" fill-rule="evenodd" d="${combinedD}" />\n`;
    }
  }

  if (mode === 'optimized') {
    const compactPaths = pathsMarkup.replace(/\s+/g, ' ').trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width: 100%; max-height: 100%; height: auto;">${compactPaths}</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width: 100%; max-height: 100%; height: auto;">
${pathsMarkup}</svg>`;
}

export function validateSvg(svgString: string): { isValid: boolean; error?: string } {
  if (!svgString || typeof svgString !== 'string' || svgString.trim().length === 0) {
    return { isValid: false, error: 'Generated SVG output is empty.' };
  }

  // Security check
  if (/<script/i.test(svgString) || /javascript:/i.test(svgString) || /onload=/i.test(svgString)) {
    return { isValid: false, error: 'Unsafe executable content detected in SVG.' };
  }

  // Structure check
  if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
    return { isValid: false, error: 'Missing root <svg> wrapper tag.' };
  }

  // Must not contain NaN or Infinity in coordinates
  if (/NaN/i.test(svgString) || /Infinity/i.test(svgString)) {
    return { isValid: false, error: 'Corrupted numerical coordinates (NaN/Infinity) found in vector paths.' };
  }

  // Must contain actual vector elements (<path, <polygon, <rect, <circle)
  const hasVectorElements =
    svgString.includes('<path') ||
    svgString.includes('<polygon') ||
    svgString.includes('<rect') ||
    svgString.includes('<circle');

  if (!hasVectorElements) {
    return { isValid: false, error: 'SVG does not contain any visible vector geometry elements.' };
  }

  // Check XML parser
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return { isValid: false, error: parserError.textContent || 'XML parsing error.' };
    }

    const svgEl = doc.querySelector('svg');
    if (!svgEl) {
      return { isValid: false, error: 'No valid SVG element found in XML document.' };
    }

    const paths = svgEl.querySelectorAll('path');
    let totalDLength = 0;
    paths.forEach((p) => {
      const d = p.getAttribute('d') || '';
      totalDLength += d.trim().length;
    });

    if (paths.length > 0 && totalDLength === 0) {
      return { isValid: false, error: 'Vector paths contain empty path data (d attribute).' };
    }
  } catch (err: any) {
    return { isValid: false, error: err.message || 'SVG XML validation failed.' };
  }

  return { isValid: true };
}

// ─────────────────────────────────────────────────────────────
// 7. HELPER UTILITIES
// ─────────────────────────────────────────────────────────────

function resolveActiveSettings(
  settings: SvgConverterSettings,
  analysis: ImageAnalysisResult
): SvgConverterSettings {
  let merged = { ...settings };

  // Apply Output Size presets if set
  if (settings.outputSizePreset === 'small') {
    merged.detailLevel = 'Low';
    merged.pathSimplification = Math.max(merged.pathSimplification, 7);
    merged.noiseRemoval = Math.max(merged.noiseRemoval, 6);
    merged.colorCount = Math.min(merged.colorCount || 6, 6);
  } else if (settings.outputSizePreset === 'balanced') {
    merged.detailLevel = 'Medium';
    merged.pathSimplification = 5;
    merged.noiseRemoval = 4;
    merged.colorCount = Math.min(merged.colorCount || 8, 10);
  } else if (settings.outputSizePreset === 'high') {
    merged.detailLevel = 'High';
    merged.pathSimplification = 3;
    merged.noiseRemoval = 2;
    merged.colorCount = Math.max(merged.colorCount || 12, 16);
  } else if (settings.autoOptimize) {
    // Auto Optimize is ON -> overlay recommended settings from image analysis
    merged = { ...merged, ...analysis.recommendedSettings };
  }

  if (settings.logoQualityMode && (analysis.classification === 'Logo' || analysis.classification === 'Icon')) {
    merged.edgeSmoothing = Math.max(merged.edgeSmoothing, 6);
    merged.pathSimplification = Math.min(merged.pathSimplification, 5);
    merged.noiseRemoval = Math.max(merged.noiseRemoval, 4);
  }

  return merged;
}

function getDetailScale(detail: DetailLevel, width: number, height: number): number {
  const maxPixels =
    detail === 'Low'
      ? 120000
      : detail === 'High'
      ? 600000
      : detail === 'Ultra'
      ? 1200000
      : 300000; // Medium / Auto (balanced for fast 60fps responsiveness)

  const total = width * height;
  if (total <= maxPixels) return 1.0;
  return Math.sqrt(maxPixels / total);
}

function getMinNoiseArea(noiseRemoval: number, w: number, h: number): number {
  const total = w * h;
  const baseArea = (total / 100000) * (noiseRemoval * 2);
  return Math.max(3, baseArea);
}

function getRdpEpsilon(simplification: number, w: number, h: number): number {
  const dim = Math.max(w, h);
  return (dim / 1000) * (0.6 + simplification * 0.5);
}

function getCoordinatePrecision(settings: SvgConverterSettings): number {
  if (settings.outputSizePreset === 'small') return 1;
  if (settings.outputSizePreset === 'high') return 2;
  return 1;
}

function shouldOmitBackground(
  bgHandling: BackgroundHandling,
  analysis: ImageAnalysisResult
): boolean {
  if (bgHandling === 'Transparent' || bgHandling === 'Remove White') return true;
  if (bgHandling === 'Preserve') return false;
  // Auto mode: omit if transparency detected or clean logo/signature
  return analysis.hasTransparency || analysis.isLikelySignature;
}

function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): ColorRGB {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    hex: rgbToHex(data[idx], data[idx + 1], data[idx + 2]),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return `#${hex}`;
}

/**
 * Trigger local browser SVG file download
 */
export function downloadSvgFile(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─────────────────────────────────────────────────────────────
// 8. SAMPLE PRESETS FOR INSTANT DEMO TESTING
// ─────────────────────────────────────────────────────────────

export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  svgDataUri: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sample-logo',
    name: 'Tech Logo Badge',
    category: 'Logo',
    description: 'Modern geometric brand logo with vibrant aesthetic.',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="200" cy="200" r="140" fill="%233b82f6"/><polygon points="200,90 310,280 90,280" fill="%238b5cf6"/><circle cx="200" cy="210" r="45" fill="%23ffffff"/></svg>`,
  },
  {
    id: 'sample-icon',
    name: 'Rocket Launch Icon',
    category: 'Icon',
    description: 'Crisp flat startup rocket icon with transparent background.',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><path d="M150 30 C190 70 210 130 210 190 L90 190 C90 130 110 70 150 30 Z" fill="%23ef4444"/><circle cx="150" cy="120" r="30" fill="%2338bdf8"/><polygon points="90,190 50,240 100,220" fill="%23f97316"/><polygon points="210,190 250,240 200,220" fill="%23f97316"/><polygon points="130,190 150,260 170,190" fill="%23eab308"/></svg>`,
  },
  {
    id: 'sample-signature',
    name: 'Digital Signature',
    category: 'Signature',
    description: 'Clean ink signature sample on white background.',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200" viewBox="0 0 500 200"><rect width="500" height="200" fill="%23ffffff"/><path d="M50 130 Q90 40 130 110 T210 80 Q250 160 300 90 T400 120 Q440 60 460 140" stroke="%231e3a8a" stroke-width="8" fill="none" stroke-linecap="round"/></svg>`,
  },
];

export async function loadPresetImage(preset: SamplePreset): Promise<LoadedVectorImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 400;
        const height = img.naturalHeight || img.height || 400;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Failed to create canvas context.');

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const analysis = analyzeRasterImage(imageData, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate preset image blob.'));
            return;
          }
          const file = new File([blob], `${preset.id}.png`, { type: 'image/png' });
          resolve({
            file,
            name: `${preset.name}.png`,
            sizeBytes: blob.size,
            width,
            height,
            aspectRatio: width / (height || 1),
            dataUrl: canvas.toDataURL('image/png'),
            imageData,
            analysis,
          });
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to render preset SVG graphic.'));
    img.src = preset.svgDataUri;
  });
}
