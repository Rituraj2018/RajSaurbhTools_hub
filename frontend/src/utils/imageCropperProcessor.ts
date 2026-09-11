/**
 * imageCropperProcessor.ts
 * ────────────────────────
 * Client-side image cropping engine for the RajSaurabh Tools Hub.
 * 100% browser-side — no server uploads.
 */

// ─────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────

export interface LoadedCropImage {
  file: File;
  name: string;
  size: number;
  naturalWidth: number;
  naturalHeight: number;
  dataUrl: string;
  img: HTMLImageElement;
}

/**
 * Crop box in percentage of the effective (post-rotation) image dimensions.
 * x, y = top-left corner percentage; w, h = width/height percentage.
 * All values 0 – 100.
 */
export interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AspectRatioId =
  | 'free'
  | '1:1'
  | '4:3'
  | '3:2'
  | '16:9'
  | '3:4'
  | '2:3'
  | '9:16';

export const ASPECT_RATIO_PRESETS: { id: AspectRatioId; label: string; ratio: number | null }[] = [
  { id: 'free',  label: 'Free',  ratio: null },
  { id: '1:1',   label: '1 : 1', ratio: 1 },
  { id: '4:3',   label: '4 : 3', ratio: 4 / 3 },
  { id: '3:2',   label: '3 : 2', ratio: 3 / 2 },
  { id: '16:9',  label: '16 : 9', ratio: 16 / 9 },
  { id: '3:4',   label: '3 : 4', ratio: 3 / 4 },
  { id: '2:3',   label: '2 : 3', ratio: 2 / 3 },
  { id: '9:16',  label: '9 : 16', ratio: 9 / 16 },
];

export type PresetSizeId =
  | 'passport'
  | 'id-card'
  | 'profile'
  | 'square'
  | 'social-media'
  | 'custom';

export interface PresetSize {
  id: PresetSizeId;
  label: string;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
  description: string;
}

export const PRESET_SIZES: PresetSize[] = [
  { id: 'passport',     label: 'Passport Photo',   widthPx: 413,  heightPx: 531,  aspectRatio: 413 / 531,  description: '35 × 45 mm (standard)' },
  { id: 'id-card',      label: 'ID Card Photo',     widthPx: 295,  heightPx: 413,  aspectRatio: 295 / 413,  description: '25 × 35 mm' },
  { id: 'profile',      label: 'Profile Photo',     widthPx: 400,  heightPx: 400,  aspectRatio: 1,          description: '1 : 1 square' },
  { id: 'square',       label: 'Square Photo',      widthPx: 1080, heightPx: 1080, aspectRatio: 1,          description: '1080 × 1080 px' },
  { id: 'social-media', label: 'Social Media',      widthPx: 1200, heightPx: 630,  aspectRatio: 1200 / 630, description: '1200 × 630 px (FB/LinkedIn)' },
  { id: 'custom',       label: 'Custom',            widthPx: 0,    heightPx: 0,    aspectRatio: 0,          description: 'Enter custom dimensions' },
];

export interface CropState {
  cropBox: CropBox;

  // Transform
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;

  // View (display only — no effect on exported pixel dimensions)
  zoom: number;   // 0.5 → 3.0
  panX: number;   // px offset on display canvas
  panY: number;

  // Crop mode
  aspectRatioId: AspectRatioId;
  presetSizeId: PresetSizeId;

  // Custom output dimensions (0 = use crop natural size)
  customWidth: number;
  customHeight: number;

  // Shape
  circleCrop: boolean;
  cornerRadius: number; // px in the output image (0 = off)

  // Padding
  paddingEnabled: boolean;
  paddingSize: number;    // px in the output image
  paddingColor: string;   // CSS hex colour

  // Export
  outputFormat: 'jpeg' | 'png' | 'webp';
  outputQuality: number; // 0 – 1
}

export const DEFAULT_CROP_STATE: CropState = {
  cropBox: { x: 10, y: 10, w: 80, h: 80 },
  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
  panX: 0,
  panY: 0,
  aspectRatioId: 'free',
  presetSizeId: 'custom',
  customWidth: 0,
  customHeight: 0,
  circleCrop: false,
  cornerRadius: 0,
  paddingEnabled: false,
  paddingSize: 40,
  paddingColor: '#ffffff',
  outputFormat: 'jpeg',
  outputQuality: 0.92,
};

// ─────────────────────────────────────────────────────────────
// Image Loading
// ─────────────────────────────────────────────────────────────

const SUPPORTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const SUPPORTED_EXT  = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_BYTES      = 50 * 1024 * 1024; // 50 MB

export function loadCropImage(file: File): Promise<LoadedCropImage> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!SUPPORTED_MIME.includes(file.type.toLowerCase()) && !SUPPORTED_EXT.includes(ext)) {
      reject(new Error('Unsupported format. Please upload a JPG, PNG, or WebP image.'));
      return;
    }
    if (file.size === 0) {
      reject(new Error('The selected file is empty.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('File exceeds the 50 MB limit. Please choose a smaller image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the image file.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image. File may be corrupted.'));
      img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error('Image has zero dimensions.'));
          return;
        }
        resolve({
          file,
          name: file.name,
          size: file.size,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          dataUrl,
          img,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────
// Crop + Export Engine
// ─────────────────────────────────────────────────────────────

/**
 * Renders the rotated/flipped image to a temp canvas at full resolution.
 */
function renderTransformedImage(img: HTMLImageElement, rotation: number, flipH: boolean, flipV: boolean): HTMLCanvasElement {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const isSwapped = rotation === 90 || rotation === 270;
  const effW = isSwapped ? srcH : srcW;
  const effH = isSwapped ? srcW : srcH;

  const canvas = document.createElement('canvas');
  canvas.width  = effW;
  canvas.height = effH;
  const ctx = canvas.getContext('2d')!;

  ctx.save();
  ctx.translate(effW / 2, effH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.drawImage(img, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx.restore();

  return canvas;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const rx = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rx, y);
  ctx.lineTo(x + w - rx, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
  ctx.lineTo(x + w, y + h - rx);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
  ctx.lineTo(x + rx, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
  ctx.lineTo(x, y + rx);
  ctx.quadraticCurveTo(x, y, x + rx, y);
  ctx.closePath();
}

/**
 * Applies all crop state and returns the final output canvas.
 * This is the authoritative export function.
 */
export function applyCrop(
  img: HTMLImageElement,
  state: CropState
): HTMLCanvasElement {
  const {
    rotation, flipH, flipV,
    cropBox,
    circleCrop, cornerRadius,
    paddingEnabled, paddingSize, paddingColor,
    customWidth, customHeight,
  } = state;

  // 1. Render transformed image at full resolution
  const transformed = renderTransformedImage(img, rotation, flipH, flipV);
  const effW = transformed.width;
  const effH = transformed.height;

  // 2. Crop box → pixels (clamped)
  const cropX = Math.max(0, Math.min(effW - 1, Math.round((cropBox.x / 100) * effW)));
  const cropY = Math.max(0, Math.min(effH - 1, Math.round((cropBox.y / 100) * effH)));
  const cropW = Math.max(1, Math.min(effW - cropX, Math.round((cropBox.w / 100) * effW)));
  const cropH = Math.max(1, Math.min(effH - cropY, Math.round((cropBox.h / 100) * effH)));

  // 3. Padding
  const pad = paddingEnabled ? Math.max(0, paddingSize) : 0;

  // 4. Final output dimensions
  let outW = cropW + pad * 2;
  let outH = cropH + pad * 2;

  // 5. Custom resize
  let scaledCropW = cropW;
  let scaledCropH = cropH;
  if (customWidth > 0 && customHeight > 0) {
    scaledCropW = customWidth;
    scaledCropH = customHeight;
    outW = customWidth + pad * 2;
    outH = customHeight + pad * 2;
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width  = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.imageSmoothingEnabled  = true;
  outCtx.imageSmoothingQuality  = 'high';

  // 6. Background fill
  outCtx.fillStyle = paddingColor || '#ffffff';
  outCtx.fillRect(0, 0, outW, outH);

  // 7. Clipping
  if (circleCrop) {
    outCtx.save();
    const cx = outW / 2;
    const cy = outH / 2;
    const r  = Math.min(outW, outH) / 2;
    outCtx.beginPath();
    outCtx.arc(cx, cy, r, 0, Math.PI * 2);
    outCtx.clip();
  } else if (cornerRadius > 0) {
    outCtx.save();
    roundedRectPath(outCtx, pad, pad, scaledCropW, scaledCropH, cornerRadius);
    outCtx.clip();
  }

  // 8. Draw crop region
  outCtx.drawImage(transformed, cropX, cropY, cropW, cropH, pad, pad, scaledCropW, scaledCropH);

  if (circleCrop || cornerRadius > 0) {
    outCtx.restore();
  }

  return outCanvas;
}

// ─────────────────────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────────────────────

export function downloadCroppedImage(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png' | 'webp',
  quality: number,
  baseName = 'image'
): void {
  const ext     = format === 'jpeg' ? 'jpg' : format;
  const mime    = `image/${format}`;
  const dataUrl = canvas.toDataURL(mime, quality);
  const a       = document.createElement('a');
  const cleanBase = baseName.replace(/\.[^/.]+$/, '');
  a.href     = dataUrl;
  a.download = `cropped-${cleanBase}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Given effective image dimensions and a target aspect ratio, returns a
 * new crop box that preserves the centre position and fits within bounds.
 */
export function buildCropBoxForAspectRatio(
  effectiveW: number,
  effectiveH: number,
  ratio: number | null,
  currentBox: CropBox
): CropBox {
  if (ratio === null) return currentBox; // free — no change

  // Try to keep the current centre
  const cx = currentBox.x + currentBox.w / 2;
  const cy = currentBox.y + currentBox.h / 2;

  // Start from current width and derive height
  let newW = currentBox.w;
  // ratio = (newW * effectiveW) / (newH * effectiveH)  =>  newH = (newW * effectiveW) / (ratio * effectiveH)
  let newH = (newW * effectiveW) / (ratio * effectiveH);

  if (newH > 90) {
    newH = 90;
    newW = (newH * ratio * effectiveH) / effectiveW;
  }
  if (newW > 90) {
    newW = 90;
    newH = (newW * effectiveW) / (ratio * effectiveH);
  }

  const newX = Math.max(0, Math.min(100 - newW, cx - newW / 2));
  const newY = Math.max(0, Math.min(100 - newH, cy - newH / 2));

  return {
    x: parseFloat(newX.toFixed(2)),
    y: parseFloat(newY.toFixed(2)),
    w: parseFloat(newW.toFixed(2)),
    h: parseFloat(newH.toFixed(2)),
  };
}

/**
 * Returns a quick-position crop box (centre / top / bottom / left / right).
 */
export function positionCropBox(
  currentBox: CropBox,
  position: 'center' | 'top' | 'bottom' | 'left' | 'right'
): CropBox {
  const { w, h } = currentBox;
  switch (position) {
    case 'center': return { x: (100 - w) / 2,  y: (100 - h) / 2,  w, h };
    case 'top':    return { x: (100 - w) / 2,  y: 0,               w, h };
    case 'bottom': return { x: (100 - w) / 2,  y: 100 - h,         w, h };
    case 'left':   return { x: 0,              y: (100 - h) / 2,   w, h };
    case 'right':  return { x: 100 - w,        y: (100 - h) / 2,   w, h };
    default:       return currentBox;
  }
}
