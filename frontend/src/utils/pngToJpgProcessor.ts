/**
 * Client-Side PNG to JPG Conversion Engine
 * 100% in-browser Canvas processing with alpha channel background synthesis
 */

export interface LoadedPngImage {
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number;
  previewUrl: string;
  imageElement: HTMLImageElement;
}

export interface JpgConversionOptions {
  quality: number; // 0.1 to 1.0 (default 0.92)
  backgroundColor: string; // Hex color for transparent areas (default #ffffff)
}

export interface ConvertedJpgResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  quality: number;
  compressionRatio: number; // e.g. -45%
}

/**
 * Validate that the uploaded file is a valid PNG
 */
export const validatePngFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected. Please choose a PNG file.' };
  }

  const isPngMime = file.type === 'image/png';
  const isPngExt = file.name.toLowerCase().endsWith('.png');

  if (!isPngMime && !isPngExt) {
    return {
      valid: false,
      error: `Invalid file format: "${file.name}". Only PNG (.png) files are supported for this tool.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected PNG file is empty (0 bytes).' };
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
 * Load a PNG file into an HTMLImageElement
 */
export const loadPngImage = (file: File): Promise<LoadedPngImage> => {
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
      reject(new Error('Failed to read and render the PNG image. The file may be corrupt.'));
    };

    img.src = previewUrl;
  });
};

/**
 * Convert a loaded PNG to high-quality JPG using HTML5 Canvas
 */
export const convertPngToJpg = async (
  loaded: LoadedPngImage,
  options: JpgConversionOptions
): Promise<ConvertedJpgResult> => {
  const { quality = 0.92, backgroundColor = '#ffffff' } = options;

  const canvas = document.createElement('canvas');
  canvas.width = loaded.width;
  canvas.height = loaded.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized.');
  }

  // 1. Fill background (crucial for PNGs with transparent alpha)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Composite original PNG image
  ctx.drawImage(loaded.imageElement, 0, 0, canvas.width, canvas.height);

  // 3. Export to JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('JPEG conversion failed during canvas rasterization.'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const originalBase = loaded.name.replace(/\.[^/.]+$/, '');
        const filename = `${originalBase}.jpg`;
        const diff = ((blob.size - loaded.size) / loaded.size) * 100;

        resolve({
          blob,
          url,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          filename,
          quality,
          compressionRatio: parseFloat(diff.toFixed(1)),
        });
      },
      'image/jpeg',
      quality
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
 * Download the converted JPG file directly in the browser
 */
export const downloadJpgFile = (result: ConvertedJpgResult): void => {
  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
