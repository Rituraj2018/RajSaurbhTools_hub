// ============================================================
// Image Compressor Processor — 100% Browser-Side
// ============================================================
// All image compression, resizing and format conversion is done
// locally in the user's browser using the Canvas API.
// No images are uploaded to any server.
// ============================================================

// ---- Types ----

export interface ImageInfo {
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
  dataUrl: string;
  imgElement: HTMLImageElement;
}

export type CompressionMode = 'lossy' | 'lossless';
export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface CompressionOptions {
  width: number;
  height: number;
  quality: number; // 0.1 – 1.0
  mode: CompressionMode;
  outputFormat: OutputFormat;
  targetSizeBytes: number | null; // null = no target
}

export interface CompressedResult {
  blob: Blob;
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  format: string;
  mimeType: OutputFormat;
}

export const SUPPORTED_INPUT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
];

export const SUPPORTED_INPUT_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg';

export const OUTPUT_FORMATS: { label: string; value: OutputFormat; ext: string }[] = [
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
];

export const TARGET_SIZE_OPTIONS: { label: string; bytes: number | null }[] = [
  { label: 'No Target', bytes: null },
  { label: '20 KB', bytes: 20 * 1024 },
  { label: '50 KB', bytes: 50 * 1024 },
  { label: '100 KB', bytes: 100 * 1024 },
  { label: '200 KB', bytes: 200 * 1024 },
  { label: '500 KB', bytes: 500 * 1024 },
  { label: '1 MB', bytes: 1024 * 1024 },
  { label: '2 MB', bytes: 2 * 1024 * 1024 },
];

export const RESIZE_PRESETS = [
  { label: 'Original', value: 100 },
  { label: '75%', value: 75 },
  { label: '50%', value: 50 },
  { label: '25%', value: 25 },
  { label: 'Custom', value: -1 },
];

export const DEFAULT_OPTIONS: CompressionOptions = {
  width: 0,
  height: 0,
  quality: 0.8,
  mode: 'lossy',
  outputFormat: 'image/jpeg',
  targetSizeBytes: null,
};

// ---- Helpers ----

/**
 * Format byte count into a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, units.length - 1);
  return parseFloat((bytes / Math.pow(k, idx)).toFixed(2)) + ' ' + units[idx];
}

/**
 * Extract the human-readable format label from a MIME type.
 */
export function mimeToLabel(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'JPG';
    case 'image/png':
      return 'PNG';
    case 'image/webp':
      return 'WebP';
    case 'image/gif':
      return 'GIF';
    case 'image/bmp':
      return 'BMP';
    case 'image/svg+xml':
      return 'SVG';
    default:
      return mime.split('/').pop()?.toUpperCase() || 'UNKNOWN';
  }
}

/**
 * Extract extension from a filename.
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Get the MIME-derived extension for an output format.
 */
function formatToExt(mime: OutputFormat): string {
  const entry = OUTPUT_FORMATS.find((f) => f.value === mime);
  return entry ? entry.ext : 'jpg';
}

/**
 * Generate a meaningful download filename.
 */
export function generateFilename(
  originalName: string,
  options: CompressionOptions,
  originalWidth: number,
  originalHeight: number
): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = formatToExt(options.outputFormat);

  const dimensionsChanged =
    options.width !== originalWidth || options.height !== originalHeight;

  if (dimensionsChanged) {
    return `${baseName}-${options.width}x${options.height}.${ext}`;
  }
  return `${baseName}-compressed.${ext}`;
}

/**
 * Detect if a GIF is animated by checking for multiple image frames.
 * This is a heuristic: look for multiple GIF graphic control extension blocks.
 */
export async function isAnimatedGif(file: File): Promise<boolean> {
  if (file.type !== 'image/gif') return false;
  const buffer = await file.arrayBuffer();
  const view = new Uint8Array(buffer);
  let frameCount = 0;
  for (let i = 0; i < view.length - 2; i++) {
    // Graphic Control Extension: 0x21 0xF9
    if (view[i] === 0x21 && view[i + 1] === 0xf9) {
      frameCount++;
      if (frameCount > 1) return true;
    }
  }
  return false;
}

// ---- Core Processing ----

/**
 * Load an image file and extract metadata.
 */
export function loadImageFromFile(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    // Validate type
    const mime = file.type.toLowerCase();
    const ext = getExtension(file.name);
    const isAllowed =
      SUPPORTED_INPUT_TYPES.includes(mime) ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext);

    if (!isAllowed) {
      reject(new Error(`Unsupported image format "${file.name}". Supported: JPG, PNG, WebP, GIF, BMP, SVG.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the image file. It may be corrupted.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to process this image. The file may be corrupted or in an unsupported format.'));
      img.onload = () => {
        const format = mimeToLabel(file.type || `image/${ext}`);
        resolve({
          file,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          format,
          dataUrl,
          imgElement: img,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress / resize / convert an image using the Canvas API.
 */
export async function compressImage(
  imageInfo: ImageInfo,
  options: CompressionOptions
): Promise<CompressedResult> {
  const { imgElement } = imageInfo;
  const { width, height, quality, mode, outputFormat, targetSizeBytes } = options;

  // If target size is set, use binary search on quality
  if (targetSizeBytes !== null && outputFormat !== 'image/png') {
    return compressToTargetSize(imgElement, width, height, outputFormat, targetSizeBytes);
  }

  // Determine effective quality
  let effectiveQuality: number | undefined;
  if (outputFormat === 'image/png') {
    // PNG is always lossless — quality parameter is ignored
    effectiveQuality = undefined;
  } else if (mode === 'lossless') {
    effectiveQuality = 1.0;
  } else {
    effectiveQuality = quality;
  }

  const blob = await renderToBlob(imgElement, width, height, outputFormat, effectiveQuality);
  const dataUrl = await blobToDataUrl(blob);

  return {
    blob,
    dataUrl,
    size: blob.size,
    width,
    height,
    format: mimeToLabel(outputFormat),
    mimeType: outputFormat,
  };
}

/**
 * Render an image onto a canvas and export as a Blob.
 */
function renderToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: OutputFormat,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Browser canvas is not available. Please try a different browser.'));
      return;
    }

    // For JPEG, fill white background (no alpha channel)
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress the image. The browser may not support this format.'));
          return;
        }
        resolve(blob);
      },
      format,
      quality
    );
  });
}

/**
 * Binary-search to find the quality that produces a blob closest to the target size.
 */
async function compressToTargetSize(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: OutputFormat,
  targetBytes: number,
  maxIterations = 15,
  tolerance = 0.05 // 5% tolerance
): Promise<CompressedResult> {
  let lo = 0.05;
  let hi = 1.0;
  let bestBlob: Blob | null = null;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const blob = await renderToBlob(img, width, height, format, mid);

    if (!bestBlob || Math.abs(blob.size - targetBytes) < Math.abs(bestBlob.size - targetBytes)) {
      bestBlob = blob;
    }

    const ratio = blob.size / targetBytes;

    if (ratio > 1 + tolerance) {
      // Too large, lower quality
      hi = mid;
    } else if (ratio < 1 - tolerance) {
      // Too small, raise quality
      lo = mid;
    } else {
      // Within tolerance
      break;
    }
  }

  if (!bestBlob) {
    // Fallback — just compress at default quality
    bestBlob = await renderToBlob(img, width, height, format, 0.8);
  }

  const dataUrl = await blobToDataUrl(bestBlob);
  return {
    blob: bestBlob,
    dataUrl,
    size: bestBlob.size,
    width,
    height,
    format: mimeToLabel(format),
    mimeType: format,
  };
}

/**
 * Convert a Blob to a data URL.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to generate preview.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a compressed blob in a specific format (used for multi-format download).
 */
export async function compressToFormat(
  imageInfo: ImageInfo,
  options: CompressionOptions,
  targetFormat: OutputFormat
): Promise<CompressedResult> {
  return compressImage(imageInfo, { ...options, outputFormat: targetFormat });
}

/**
 * Trigger a browser download of a blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
