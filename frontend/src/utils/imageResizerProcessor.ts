/**
 * Client-Side Image Resizer Engine
 * 100% in-browser HTML5 Canvas processing with aspect ratio constraints
 * Zero server uploads and zero permanent storage
 */

export interface LoadedImageForResize {
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number;
  format: 'jpeg' | 'png' | 'webp';
  previewUrl: string;
  imageElement: HTMLImageElement;
}

export interface ImageResizeOptions {
  targetWidth: number;
  targetHeight: number;
  format?: 'original' | 'jpeg' | 'png' | 'webp';
  quality?: number; // 0.1 - 1.0 (default 0.92)
}

export interface ResizedImageResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  format: string;
  sizeDiffRatio: number; // e.g. -45%
}

/**
 * Validate image file format and size
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected. Please choose an image file.' };
  }

  const nameLower = file.name.toLowerCase();
  const isJpgExt = nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg');
  const isPngExt = nameLower.endsWith('.png');
  const isWebpExt = nameLower.endsWith('.webp');

  const isJpgMime = file.type === 'image/jpeg' || file.type === 'image/pjpeg';
  const isPngMime = file.type === 'image/png';
  const isWebpMime = file.type === 'image/webp';

  if (!isJpgExt && !isPngExt && !isWebpExt && !isJpgMime && !isPngMime && !isWebpMime) {
    return {
      valid: false,
      error: `Invalid file format: "${file.name}". Only JPG, PNG, and WebP images are supported.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected image file is empty (0 bytes).' };
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
 * Load an image file into an HTMLImageElement
 */
export const loadImageForResize = (file: File): Promise<LoadedImageForResize> => {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const nameLower = file.name.toLowerCase();
      let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
      if (nameLower.endsWith('.png') || file.type === 'image/png') {
        format = 'png';
      } else if (nameLower.endsWith('.webp') || file.type === 'image/webp') {
        format = 'webp';
      }

      resolve({
        file,
        name: file.name,
        size: file.size,
        width,
        height,
        aspectRatio: width / height,
        format,
        previewUrl,
        imageElement: img,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('Failed to read and render the image. The file may be corrupt or invalid.'));
    };

    img.src = previewUrl;
  });
};

/**
 * Resize image to target width and height using HTML5 Canvas
 */
export const resizeImage = async (
  loaded: LoadedImageForResize,
  options: ImageResizeOptions
): Promise<ResizedImageResult> => {
  const {
    targetWidth,
    targetHeight,
    format = 'original',
    quality = 0.92,
  } = options;

  const validW = Math.max(1, Math.round(targetWidth));
  const validH = Math.max(1, Math.round(targetHeight));

  const canvas = document.createElement('canvas');
  canvas.width = validW;
  canvas.height = validH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If converting to JPEG, fill white background to avoid transparent black artifacts
  let exportMime = 'image/jpeg';
  let exportExt = 'jpg';

  const effectiveFormat = format === 'original' ? loaded.format : format;

  if (effectiveFormat === 'png') {
    exportMime = 'image/png';
    exportExt = 'png';
  } else if (effectiveFormat === 'webp') {
    exportMime = 'image/webp';
    exportExt = 'webp';
  } else {
    exportMime = 'image/jpeg';
    exportExt = 'jpg';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, validW, validH);
  }

  // Draw image at target dimensions
  ctx.drawImage(loaded.imageElement, 0, 0, validW, validH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image resize failed during canvas rasterization.'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const baseName = loaded.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_${validW}x${validH}.${exportExt}`;
        const diff = ((blob.size - loaded.size) / loaded.size) * 100;

        resolve({
          blob,
          url,
          size: blob.size,
          width: validW,
          height: validH,
          filename,
          format: exportExt.toUpperCase(),
          sizeDiffRatio: parseFloat(diff.toFixed(1)),
        });
      },
      exportMime,
      exportMime === 'image/png' ? undefined : quality
    );
  });
};

/**
 * Format bytes to readable string (e.g. "1.2 MB" or "450 KB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Download the resized image directly in the browser
 */
export const downloadResizedImage = (result: ResizedImageResult): void => {
  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
