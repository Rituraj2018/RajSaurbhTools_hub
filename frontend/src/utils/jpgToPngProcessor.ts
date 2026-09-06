/**
 * Client-Side JPG to PNG Conversion Engine
 * 100% in-browser Canvas processing with optional transparency keying
 */

export interface LoadedJpgImage {
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number;
  previewUrl: string;
  imageElement: HTMLImageElement;
}

export interface PngConversionOptions {
  removeBackground?: boolean;
  transparentColor?: 'white' | 'black' | 'custom';
  customColorHex?: string;
  colorThreshold?: number; // 0 - 100
  imageSmoothing?: boolean;
}

export interface ConvertedPngResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  compressionRatio: number; // diff from JPG (e.g. +25% or -10%)
  hasTransparency: boolean;
}

/**
 * Validate that the uploaded file is a valid JPG or JPEG
 */
export const validateJpgFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected. Please choose a JPG or JPEG file.' };
  }

  const nameLower = file.name.toLowerCase();
  const isJpgExt = nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg');
  const isJpgMime = file.type === 'image/jpeg' || file.type === 'image/pjpeg';

  if (!isJpgMime && !isJpgExt) {
    return {
      valid: false,
      error: `Invalid file format: "${file.name}". Only JPG and JPEG (.jpg, .jpeg) files are supported for this tool.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected JPG/JPEG file is empty (0 bytes).' };
  }

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 50MB.`,
    };
  }

  return { valid: true };
};

/**
 * Load a JPG/JPEG file into an HTMLImageElement
 */
export const loadJpgImage = (file: File): Promise<LoadedJpgImage> => {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        file,
        name: file.name,
        size: file.size,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspectRatio: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
        previewUrl,
        imageElement: img,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('Failed to read and render the JPG/JPEG image. The file may be corrupt or invalid.'));
    };

    img.src = previewUrl;
  });
};

/**
 * Helper to parse hex color into RGB components
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

/**
 * Convert a loaded JPG/JPEG to high-fidelity PNG using HTML5 Canvas
 */
export const convertJpgToPng = async (
  loaded: LoadedJpgImage,
  options: PngConversionOptions = {}
): Promise<ConvertedPngResult> => {
  const {
    removeBackground = false,
    transparentColor = 'white',
    customColorHex = '#ffffff',
    colorThreshold = 25,
    imageSmoothing = true,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = loaded.width;
  canvas.height = loaded.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: removeBackground });
  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized.');
  }

  ctx.imageSmoothingEnabled = imageSmoothing;
  ctx.imageSmoothingQuality = 'high';

  // Draw the original JPG onto canvas
  ctx.drawImage(loaded.imageElement, 0, 0, canvas.width, canvas.height);

  let hasTransparency = false;

  // Optional background removal / color keying
  if (removeBackground) {
    let targetR = 255;
    let targetG = 255;
    let targetB = 255;

    if (transparentColor === 'black') {
      targetR = 0;
      targetG = 0;
      targetB = 0;
    } else if (transparentColor === 'custom') {
      const rgb = hexToRgb(customColorHex);
      targetR = rgb.r;
      targetG = rgb.g;
      targetB = rgb.b;
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const thresholdSq = (colorThreshold * 2.55) ** 2;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const distSq = (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2;
      if (distSq <= thresholdSq) {
        data[i + 3] = 0; // Transparent
        hasTransparency = true;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // Export to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG conversion failed during canvas rasterization.'));
        return;
      }

      const url = URL.createObjectURL(blob);
      const originalBase = loaded.name.replace(/\.[^/.]+$/, '');
      const filename = `${originalBase}.png`;
      const diff = ((blob.size - loaded.size) / loaded.size) * 100;

      resolve({
        blob,
        url,
        size: blob.size,
        width: canvas.width,
        height: canvas.height,
        filename,
        compressionRatio: parseFloat(diff.toFixed(1)),
        hasTransparency,
      });
    }, 'image/png');
  });
};

/**
 * Format bytes to human readable string (e.g. "1.2 MB" or "450 KB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Download the converted PNG file directly in the browser
 */
export const downloadPngFile = (result: ConvertedPngResult): void => {
  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
