/**
 * Passport Photo Processor Engine
 * Handles Canvas-based image manipulation, 35x45mm biometric cropping,
 * color enhancements, background keying/replacement, and print sheet tiling.
 */

export interface CropArea {
  x: number; // in pixels relative to original image
  y: number;
  width: number;
  height: number;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100 (0 = default)
  contrast: number; // -100 to 100 (0 = default)
  saturation: number; // -100 to 100 (0 = default, 100% normal)
  sharpness: number; // 0 to 100 (0 = none)
  grayscale: boolean;
}

export type BackgroundPreset =
  | 'original'
  | 'white'
  | 'light-blue'
  | 'dark-blue'
  | 'light-grey'
  | 'red'
  | 'custom';

export interface BackgroundSettings {
  mode: BackgroundPreset;
  customColor: string; // Hex color code e.g. '#ffffff'
  tolerance: number; // 10 to 90 color similarity threshold for keying
  feather: number; // 1 to 5 edge feathering
}

export type PaperSize = 'A4' | '4x6';
export type PhotoCopies = number;

export interface SheetOptions {
  paperSize: PaperSize;
  copies: PhotoCopies;
  showCuttingGuides: boolean;
  showBorder: boolean;
  borderColor?: string;
  landscape?: boolean;
  /** Pixel offset from the default centered position. {x:0, y:0} = centered (default). */
  photoPosition?: { x: number; y: number };
}

// 300 DPI Standard Dimensions
// 1 mm = 11.811 pixels at 300 DPI
export const PASSPORT_WIDTH_MM = 35;
export const PASSPORT_HEIGHT_MM = 45;
export const PASSPORT_WIDTH_PX = 413; // 35mm * 11.811
export const PASSPORT_HEIGHT_PX = 531; // 45mm * 11.811
export const PASSPORT_ASPECT_RATIO = PASSPORT_WIDTH_PX / PASSPORT_HEIGHT_PX; // ~0.7778 (7:9)

// Paper Dimensions in mm & pixels @ 300 DPI
export const PAPER_SPECS = {
  A4: {
    name: 'A4 Paper',
    widthMm: 210,
    heightMm: 297,
    widthPx: 2480,
    heightPx: 3508,
  },
  '4x6': {
    name: '4 x 6 Inch Photo Paper',
    widthMm: 101.6,
    heightMm: 152.4,
    widthPx: 1200,
    heightPx: 1800,
  },
};

export const BACKGROUND_COLORS: Record<BackgroundPreset, { label: string; hex: string }> = {
  original: { label: 'Original', hex: 'transparent' },
  white: { label: 'White (Standard)', hex: '#FFFFFF' },
  'light-blue': { label: 'Light Blue', hex: '#BCE0FD' },
  'dark-blue': { label: 'Dark Blue', hex: '#163E75' },
  'light-grey': { label: 'Light Grey', hex: '#E5E7EB' },
  red: { label: 'Red', hex: '#DC2626' },
  custom: { label: 'Custom Color', hex: '#3B82F6' },
};

/**
 * Calculates optimal default 35:45 crop box centered on an image
 */
export function calculateAutoCrop(
  imgWidth: number,
  imgHeight: number,
  aspectRatio: number = PASSPORT_ASPECT_RATIO
): CropArea {
  let cropWidth = imgWidth;
  let cropHeight = cropWidth / aspectRatio;

  if (cropHeight > imgHeight) {
    cropHeight = imgHeight;
    cropWidth = cropHeight * aspectRatio;
  }

  // Scale down slightly (85% coverage) to frame portrait nicely with margin
  cropWidth = Math.round(cropWidth * 0.85);
  cropHeight = Math.round(cropHeight * 0.85);

  // Position crop box with upper-bias (standard head position: ~8% from top)
  const x = Math.round((imgWidth - cropWidth) / 2);
  const y = Math.round(Math.max(0, Math.min(imgHeight - cropHeight, (imgHeight - cropHeight) * 0.25)));

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * Extracts cropped image region to high-resolution 35mm x 45mm Canvas (413 x 531 px)
 */
export function extractCroppedCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  crop: CropArea,
  rotation: number = 0, // In degrees (0, 90, 180, 270)
  flipHorizontal: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PASSPORT_WIDTH_PX;
  canvas.height = PASSPORT_HEIGHT_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Temporary canvas to extract the crop rectangle first
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(1, Math.round(crop.width));
  tempCanvas.height = Math.max(1, Math.round(crop.height));
  const tempCtx = tempCanvas.getContext('2d');

  if (tempCtx) {
    tempCtx.drawImage(
      sourceImage,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );
  }

  // Draw into target canvas with rotation / flip
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (flipHorizontal) {
    ctx.scale(-1, 1);
  }

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  ctx.drawImage(
    tempCanvas,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  ctx.restore();
  return canvas;
}

/**
 * Applies color adjustments (brightness, contrast, saturation, sharpness, grayscale) to a canvas
 */
export function applyImageEnhancements(
  canvas: HTMLCanvasElement,
  adjustments: ImageAdjustments
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const { brightness, contrast, saturation, grayscale } = adjustments;

  // Convert adjustments to multipliers
  // Brightness: -100 to 100 -> -255 to 255
  const bVal = (brightness / 100) * 128;

  // Contrast factor
  const cFactor = (contrast + 100) / 100; // 0 to 2
  const cVal = cFactor * cFactor;

  // Saturation factor
  const sFactor = (saturation + 100) / 100; // 0 to 2

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness
    r += bVal;
    g += bVal;
    b += bVal;

    // 2. Contrast
    r = (r - 128) * cVal + 128;
    g = (g - 128) * cVal + 128;
    b = (b - 128) * cVal + 128;

    // 3. Saturation & Grayscale (Luminance Rec. 709: 0.2126 R + 0.7152 G + 0.0722 B)
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (grayscale) {
      r = gray;
      g = gray;
      b = gray;
    } else if (saturation !== 0) {
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    // Clamp values 0 - 255
    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  ctx.putImageData(imageData, 0, 0);

  // 4. Sharpness (Convolution Unsharp Mask if > 0)
  if (adjustments.sharpness > 0) {
    applySharpness(canvas, adjustments.sharpness);
  }

  return canvas;
}

/**
 * Fast 3x3 unsharp convolution kernel for studio portrait crispness
 */
function applySharpness(canvas: HTMLCanvasElement, amount: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;

  const destData = ctx.createImageData(width, height);
  const dest = destData.data;

  const strength = (amount / 100) * 0.6; // Scale factor
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        let val = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pIdx = ((y + ky) * width + (x + kx)) * 4 + c;
            val += src[pIdx] * kernel[k++];
          }
        }
        dest[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
      }
      dest[idx + 3] = src[idx + 3]; // preserve alpha
    }
  }

  ctx.putImageData(destData, 0, 0);
}

/**
 * Background replacement via solid fill for cutouts or threshold keying on solid backdrops
 */
export function applyBackgroundColor(
  canvas: HTMLCanvasElement,
  bgSettings: BackgroundSettings
): HTMLCanvasElement {
  if (bgSettings.mode === 'original') {
    return canvas;
  }

  const targetHex =
    bgSettings.mode === 'custom'
      ? bgSettings.customColor
      : BACKGROUND_COLORS[bgSettings.mode]?.hex || '#FFFFFF';

  const hexR = parseInt(targetHex.slice(1, 3), 16) || 255;
  const hexG = parseInt(targetHex.slice(3, 5), 16) || 255;
  const hexB = parseInt(targetHex.slice(5, 7), 16) || 255;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner pixels to determine dominant background color
  const samplePoints = [
    0, // top-left
    (width - 1) * 4, // top-right
    ((height - 1) * width) * 4, // bottom-left
    ((height - 1) * width + (width - 1)) * 4, // bottom-right
  ];

  let sampleR = 0;
  let sampleG = 0;
  let sampleB = 0;
  let sampleCount = 0;

  for (const p of samplePoints) {
    if (data[p + 3] > 10) {
      sampleR += data[p];
      sampleG += data[p + 1];
      sampleB += data[p + 2];
      sampleCount++;
    }
  }

  if (sampleCount > 0) {
    sampleR = Math.round(sampleR / sampleCount);
    sampleG = Math.round(sampleG / sampleCount);
    sampleB = Math.round(sampleB / sampleCount);
  }

  const tolerance = (bgSettings.tolerance || 35) * 1.8;

  // Key background pixels matching corner backdrop or transparent pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Transparent pixel -> fill target background color
    if (a < 50) {
      data[i] = hexR;
      data[i + 1] = hexG;
      data[i + 2] = hexB;
      data[i + 3] = 255;
      continue;
    }

    // Measure color distance from sample corner backdrop
    const dist = Math.sqrt(
      (r - sampleR) ** 2 + (g - sampleG) ** 2 + (b - sampleB) ** 2
    );

    if (dist < tolerance) {
      // Smooth alpha blend at edge
      const factor = dist / tolerance; // 0 to 1
      if (factor < 0.6) {
        data[i] = hexR;
        data[i + 1] = hexG;
        data[i + 2] = hexB;
      } else {
        const blend = (factor - 0.6) / 0.4;
        data[i] = Math.round(hexR * (1 - blend) + r * blend);
        data[i + 1] = Math.round(hexG * (1 - blend) + g * blend);
        data[i + 2] = Math.round(hexB * (1 - blend) + b * blend);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Calculates optimal grid rows, columns, and centered spacing for print layout
 */
export function calculatePrintGrid(
  paperSize: PaperSize,
  copies: PhotoCopies,
  landscape: boolean = false
): {
  cols: number;
  rows: number;
  photoWidthPx: number;
  photoHeightPx: number;
  gapXPx: number;
  gapYPx: number;
  startX: number;
  startY: number;
  sheetWidthPx: number;
  sheetHeightPx: number;
} {
  const specs = PAPER_SPECS[paperSize];
  const sheetWidthPx = landscape ? specs.heightPx : specs.widthPx;
  const sheetHeightPx = landscape ? specs.widthPx : specs.heightPx;

  // Photo size at 300 DPI (35mm x 45mm)
  const photoWidthPx = PASSPORT_WIDTH_PX;
  const photoHeightPx = PASSPORT_HEIGHT_PX;

  // Determine optimal columns & rows based on paper type
  // A4 Standard: 5 columns x 6 rows (1 to 30 photos filling row by row)
  // 4x6 Photo Paper: 2 columns x up to 4 rows (1 to 8 photos)
  let cols = 5;
  let rows = 6;
  let gapXPx = Math.round(11.811 * 5); // 5mm
  let gapYPx = Math.round(11.811 * 5); // 5mm

  if (paperSize === '4x6') {
    // 4x6 photo paper (101.6 x 152.4 mm) - max 8 photos
    cols = 2;
    rows = Math.min(4, Math.max(1, Math.ceil(copies / 2)));
    gapXPx = Math.round(11.811 * 3);
    gapYPx = Math.round(11.811 * 3);
  } else {
    // A4 paper (210 x 297 mm) - Standard 5 columns x 6 rows (up to 30 photos)
    cols = 5;
    rows = 6;
    gapXPx = Math.round(11.811 * 5); // 5mm horizontal gap
    gapYPx = Math.round(11.811 * 5); // 5mm vertical gap
  }

  const totalGridWidth = cols * photoWidthPx + (cols - 1) * gapXPx;
  const totalGridHeight = rows * photoHeightPx + (rows - 1) * gapYPx;

  // Center symmetrically on the sheet so 5mm margins and gaps fit cleanly
  const startX = Math.max(0, Math.round((sheetWidthPx - totalGridWidth) / 2));
  const startY = Math.max(0, Math.round((sheetHeightPx - totalGridHeight) / 2));

  return {
    cols,
    rows,
    photoWidthPx,
    photoHeightPx,
    gapXPx,
    gapYPx,
    startX,
    startY,
    sheetWidthPx,
    sheetHeightPx,
  };
}

/**
 * Generates full print sheet canvas with copies arranged in a neat grid with cutting guides
 */
export function generatePrintSheetCanvas(
  passportPhotoCanvas: HTMLCanvasElement,
  options: SheetOptions
): HTMLCanvasElement {
  const { paperSize, copies, showCuttingGuides, showBorder, landscape, photoPosition } = options;
  const grid = calculatePrintGrid(paperSize, copies, landscape);

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = grid.sheetWidthPx;
  sheetCanvas.height = grid.sheetHeightPx;
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) return sheetCanvas;

  // Fill crisp white paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  // --- Photo Group Position Offset ---
  // photoPosition is a pixel delta from the default centered position.
  // Clamp so the entire group always stays inside the sheet.
  const totalGridWidth =
    grid.cols * grid.photoWidthPx + (grid.cols - 1) * grid.gapXPx;
  const totalGridHeight =
    grid.rows * grid.photoHeightPx + (grid.rows - 1) * grid.gapYPx;

  const maxOffsetX = grid.sheetWidthPx - grid.startX - totalGridWidth;  // room to the right
  const minOffsetX = -grid.startX;                                       // room to the left
  const maxOffsetY = grid.sheetHeightPx - grid.startY - totalGridHeight; // room downward
  const minOffsetY = -grid.startY;                                       // room upward

  const rawOffsetX = photoPosition?.x ?? 0;
  const rawOffsetY = photoPosition?.y ?? 0;

  const offsetX = Math.round(Math.min(maxOffsetX, Math.max(minOffsetX, rawOffsetX)));
  const offsetY = Math.round(Math.min(maxOffsetY, Math.max(minOffsetY, rawOffsetY)));

  let renderedCopies = 0;

  for (let r = 0; r < grid.rows && renderedCopies < copies; r++) {
    for (let c = 0; c < grid.cols && renderedCopies < copies; c++) {
      const x = grid.startX + offsetX + c * (grid.photoWidthPx + grid.gapXPx);
      const y = grid.startY + offsetY + r * (grid.photoHeightPx + grid.gapYPx);

      // Draw passport photo copy
      ctx.drawImage(
        passportPhotoCanvas,
        0,
        0,
        passportPhotoCanvas.width,
        passportPhotoCanvas.height,
        x,
        y,
        grid.photoWidthPx,
        grid.photoHeightPx
      );

      // Optional subtle 1px border around each photo for clean cutting
      if (showBorder) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, grid.photoWidthPx, grid.photoHeightPx);
      }

      // Cutting Guide Crosshairs / marks
      if (showCuttingGuides) {
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1;
        const markLen = 16;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y);
        ctx.lineTo(x, y);
        ctx.moveTo(x, y - markLen);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + grid.photoWidthPx, y);
        ctx.lineTo(x + grid.photoWidthPx + markLen, y);
        ctx.moveTo(x + grid.photoWidthPx, y - markLen);
        ctx.lineTo(x + grid.photoWidthPx, y);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y + grid.photoHeightPx);
        ctx.lineTo(x, y + grid.photoHeightPx);
        ctx.moveTo(x, y + grid.photoHeightPx);
        ctx.lineTo(x, y + grid.photoHeightPx + markLen);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + grid.photoWidthPx, y + grid.photoHeightPx);
        ctx.lineTo(x + grid.photoWidthPx + markLen, y + grid.photoHeightPx);
        ctx.moveTo(x + grid.photoWidthPx, y + grid.photoHeightPx);
        ctx.lineTo(x + grid.photoWidthPx, y + grid.photoHeightPx + markLen);
        ctx.stroke();
      }

      renderedCopies++;
    }
  }

  // Add subtle footer branding & print metadata only if there is sufficient sheet margin
  const remainingBottomSpace = sheetCanvas.height - (grid.startY + offsetY + totalGridHeight);
  if (remainingBottomSpace >= 30) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '18px sans-serif';
    const paperName = PAPER_SPECS[paperSize].name;
    const footerText = `Passport Studio Pro • 35x45mm • ${copies} Copies • ${paperName} (300 DPI)`;
    ctx.fillText(footerText, grid.startX + offsetX, sheetCanvas.height - 24);
  }

  return sheetCanvas;
}

/**
 * Downloads a canvas directly as JPG or PNG file
 */
export function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'jpg' | 'png' = 'png',
  quality: number = 0.95
): void {
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, quality);

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
