export interface SignatureCropBox {
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
  width: number; // percentage (0..100)
  height: number; // percentage (0..100)
}

export interface LoadedSignatureImage {
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  dataUrl: string;
  imgElement: HTMLImageElement;
}

export type AspectRatioPreset = 'free' | '3:1' | '2:1' | '4:1' | '1:1';

export const ASPECT_RATIO_PRESETS: { id: AspectRatioPreset; label: string; ratio: number | null }[] = [
  { id: 'free', label: 'Freeform', ratio: null },
  { id: '3:1', label: '3:1 (Exam/Bank Standard)', ratio: 3 / 1 },
  { id: '2:1', label: '2:1 (Compact)', ratio: 2 / 1 },
  { id: '4:1', label: '4:1 (Wide Slip)', ratio: 4 / 1 },
  { id: '1:1', label: '1:1 (Square)', ratio: 1 },
];

export const DEFAULT_CROP_BOX: SignatureCropBox = {
  x: 10,
  y: 25,
  width: 80,
  height: 50,
};

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates and loads an image file into memory with natural dimensions
 */
export function validateAndLoadSignatureImage(file: File): Promise<LoadedSignatureImage> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected. Please select a signature image.'));
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidMime = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
    const isValidExt = SUPPORTED_EXTENSIONS.includes(ext);

    if (!isValidMime && !isValidExt) {
      reject(
        new Error(
          'Unsupported file format. Please upload a JPG, JPEG, PNG, or WebP signature image.'
        )
      );
      return;
    }

    if (file.size === 0) {
      reject(new Error('The uploaded file is empty. Please select a valid image.'));
      return;
    }

    const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE_BYTES) {
      reject(new Error('File size exceeds the 20 MB limit. Please choose a smaller image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error('The image could not be decoded. The file may be corrupted.'));
          return;
        }

        resolve({
          file,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataUrl,
          imgElement: img,
        });
      };
      img.onerror = () => reject(new Error('Failed to parse image. Please verify file integrity.'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Crops the signature from source image using the percentage crop box
 */
export function executeSignatureCrop(
  sourceImage: HTMLImageElement,
  cropBox: SignatureCropBox
): HTMLCanvasElement {
  const srcW = sourceImage.naturalWidth;
  const srcH = sourceImage.naturalHeight;

  // Compute pixel values from percentages
  const pixelX = Math.max(0, Math.round((cropBox.x / 100) * srcW));
  const pixelY = Math.max(0, Math.round((cropBox.y / 100) * srcH));
  const pixelW = Math.max(1, Math.min(srcW - pixelX, Math.round((cropBox.width / 100) * srcW)));
  const pixelH = Math.max(1, Math.min(srcH - pixelY, Math.round((cropBox.height / 100) * srcH)));

  const canvas = document.createElement('canvas');
  canvas.width = pixelW;
  canvas.height = pixelH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D rendering context is not available.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    sourceImage,
    pixelX,
    pixelY,
    pixelW,
    pixelH,
    0,
    0,
    pixelW,
    pixelH
  );

  return canvas;
}

/**
 * Downloads cropped canvas as a file in browser
 */
export function downloadCroppedSignature(
  canvas: HTMLCanvasElement,
  baseFilename: string,
  format: 'png' | 'jpeg' = 'png'
): void {
  const cleanBase = baseFilename.replace(/\.[^/.]+$/, '');
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const finalFilename = `${cleanBase}_cropped.${extension}`;

  const dataUrl = canvas.toDataURL(mimeType, 0.95);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Formats byte size to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
