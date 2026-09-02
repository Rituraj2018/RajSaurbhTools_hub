import jsPDF from 'jspdf';

export type PageSizeOption = 'A4' | 'Letter' | 'Custom';
export type OrientationOption = 'portrait' | 'landscape' | 'auto';
export type MarginOption = 'none' | 'small' | 'standard' | 'large' | 'custom';
export type ImageFitOption = 'contain' | 'cover' | 'original';

export interface ImageFileItem {
  id: string;
  file?: File | null;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270 degrees
}

export interface PdfSettings {
  pageSize: PageSizeOption;
  customWidthMm: number;
  customHeightMm: number;
  orientation: OrientationOption;
  margin: MarginOption;
  customMarginMm: number;
  imageFit: ImageFitOption;
  quality: number; // 0.6 to 1.0
  filename: string;
}

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  pageSize: 'A4',
  customWidthMm: 210,
  customHeightMm: 297,
  orientation: 'portrait',
  margin: 'small',
  customMarginMm: 5,
  imageFit: 'contain',
  quality: 0.92,
  filename: 'Converted_Document',
};

export const PAGE_SIZE_SPECS: Record<
  Exclude<PageSizeOption, 'Custom'>,
  { name: string; widthMm: number; heightMm: number }
> = {
  A4: {
    name: 'A4 (210 × 297 mm)',
    widthMm: 210,
    heightMm: 297,
  },
  Letter: {
    name: 'US Letter (215.9 × 279.4 mm)',
    widthMm: 215.9,
    heightMm: 279.4,
  },
};

export const MARGIN_VALUES_MM: Record<Exclude<MarginOption, 'custom'>, number> = {
  none: 0,
  small: 5,
  standard: 12,
  large: 20,
};

/**
 * Resolves the margin in millimeters from the settings
 */
export function getMarginMm(settings: PdfSettings): number {
  if (settings.margin === 'custom') {
    return Math.max(0, settings.customMarginMm || 0);
  }
  return MARGIN_VALUES_MM[settings.margin] ?? 5;
}

/**
 * Resolves width and height of page in mm based on size and orientation
 */
export function getPageDimensionsMm(
  settings: PdfSettings,
  imageWidth: number = 1,
  imageHeight: number = 1,
  rotation: number = 0
): { widthMm: number; heightMm: number; isLandscape: boolean } {
  let baseWidth: number;
  let baseHeight: number;

  if (settings.pageSize === 'Custom') {
    baseWidth = Math.max(20, settings.customWidthMm || 210);
    baseHeight = Math.max(20, settings.customHeightMm || 297);
  } else {
    const spec = PAGE_SIZE_SPECS[settings.pageSize];
    baseWidth = spec.widthMm;
    baseHeight = spec.heightMm;
  }

  // Check effective image aspect ratio after rotation
  const isRotated90or270 = rotation === 90 || rotation === 270;
  const effImgWidth = isRotated90or270 ? imageHeight : imageWidth;
  const effImgHeight = isRotated90or270 ? imageWidth : imageHeight;
  const imgIsLandscape = effImgWidth > effImgHeight;

  let isLandscape = false;
  if (settings.orientation === 'landscape') {
    isLandscape = true;
  } else if (settings.orientation === 'portrait') {
    isLandscape = false;
  } else {
    // Auto mode
    isLandscape = imgIsLandscape;
  }

  const shortEdge = Math.min(baseWidth, baseHeight);
  const longEdge = Math.max(baseWidth, baseHeight);

  return {
    widthMm: isLandscape ? longEdge : shortEdge,
    heightMm: isLandscape ? shortEdge : longEdge,
    isLandscape,
  };
}

/**
 * Creates an oriented, rotated canvas from an image item
 */
export function createRotatedImageCanvas(
  img: HTMLImageElement,
  rotation: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const isRotated = rotation === 90 || rotation === 270;

  canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
  canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  return canvas;
}

/**
 * Loads an image from URL or dataURL into an HTMLImageElement
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Generates an accurate live Canvas preview for a single page
 */
export async function renderPagePreviewCanvas(
  item: ImageFileItem,
  settings: PdfSettings,
  previewWidthPx: number = 420
): Promise<HTMLCanvasElement> {
  const img = await loadImageElement(item.url);
  const pageDim = getPageDimensionsMm(settings, img.naturalWidth, img.naturalHeight, item.rotation);
  const marginMm = getMarginMm(settings);

  const canvas = document.createElement('canvas');
  const pageAspect = pageDim.widthMm / pageDim.heightMm;

  canvas.width = previewWidthPx;
  canvas.height = Math.round(previewWidthPx / pageAspect);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw Crisp White Page Background with subtle border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Compute Margin in Canvas Pixels
  const pxPerMm = canvas.width / pageDim.widthMm;
  const marginPx = marginMm * pxPerMm;

  const availWidthPx = Math.max(10, canvas.width - marginPx * 2);
  const availHeightPx = Math.max(10, canvas.height - marginPx * 2);

  // 3. Draw Rotated Image
  const rotatedCanvas = createRotatedImageCanvas(img, item.rotation);
  const imgWidth = rotatedCanvas.width;
  const imgHeight = rotatedCanvas.height;
  const imgAspect = imgWidth / imgHeight;
  const availAspect = availWidthPx / availHeightPx;

  let drawW = availWidthPx;
  let drawH = availHeightPx;
  let drawX = marginPx;
  let drawY = marginPx;

  if (settings.imageFit === 'contain') {
    if (imgAspect > availAspect) {
      drawW = availWidthPx;
      drawH = drawW / imgAspect;
      drawX = marginPx;
      drawY = marginPx + (availHeightPx - drawH) / 2;
    } else {
      drawH = availHeightPx;
      drawW = drawH * imgAspect;
      drawX = marginPx + (availWidthPx - drawW) / 2;
      drawY = marginPx;
    }
  } else if (settings.imageFit === 'cover') {
    // Fill printable area, crop overflow
    ctx.save();
    ctx.beginPath();
    ctx.rect(marginPx, marginPx, availWidthPx, availHeightPx);
    ctx.clip();

    if (imgAspect > availAspect) {
      drawH = availHeightPx;
      drawW = drawH * imgAspect;
      drawX = marginPx + (availWidthPx - drawW) / 2;
      drawY = marginPx;
    } else {
      drawW = availWidthPx;
      drawH = drawW / imgAspect;
      drawX = marginPx;
      drawY = marginPx + (availHeightPx - drawH) / 2;
    }
    ctx.drawImage(rotatedCanvas, drawX, drawY, drawW, drawH);
    ctx.restore();
    return canvas;
  }

  ctx.drawImage(rotatedCanvas, drawX, drawY, drawW, drawH);

  // Optional subtle dashed margin outline
  if (marginMm > 0) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(marginPx, marginPx, availWidthPx, availHeightPx);
    ctx.setLineDash([]);
  }

  return canvas;
}

/**
 * Converts multiple images into a multi-page PDF document completely in the browser
 */
export async function convertImagesToPDF(
  images: ImageFileItem[],
  settings: PdfSettings,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('No images provided for PDF conversion');
  }

  let doc: jsPDF | null = null;
  const marginMm = getMarginMm(settings);

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const img = await loadImageElement(item.url);
    const rotatedCanvas = createRotatedImageCanvas(img, item.rotation);

    const pageDim = getPageDimensionsMm(
      settings,
      img.naturalWidth,
      img.naturalHeight,
      item.rotation
    );

    const orientation = pageDim.isLandscape ? 'landscape' : 'portrait';
    const format: [number, number] = [pageDim.widthMm, pageDim.heightMm];

    if (i === 0) {
      doc = new jsPDF({
        orientation,
        unit: 'mm',
        format,
        compress: true,
      });
    } else if (doc) {
      doc.addPage(format, orientation);
    }

    if (!doc) continue;

    // Available printable dimension in mm
    const availWidthMm = Math.max(1, pageDim.widthMm - marginMm * 2);
    const availHeightMm = Math.max(1, pageDim.heightMm - marginMm * 2);

    const imgWidth = rotatedCanvas.width;
    const imgHeight = rotatedCanvas.height;
    const imgAspect = imgWidth / imgHeight;
    const availAspect = availWidthMm / availHeightMm;

    let destWMm = availWidthMm;
    let destHMm = availHeightMm;
    let destXMm = marginMm;
    let destYMm = marginMm;

    if (settings.imageFit === 'contain') {
      if (imgAspect > availAspect) {
        destWMm = availWidthMm;
        destHMm = destWMm / imgAspect;
        destXMm = marginMm;
        destYMm = marginMm + (availHeightMm - destHMm) / 2;
      } else {
        destHMm = availHeightMm;
        destWMm = destHMm * imgAspect;
        destXMm = marginMm + (availWidthMm - destWMm) / 2;
        destYMm = marginMm;
      }
    } else if (settings.imageFit === 'cover') {
      // Cover fit
      if (imgAspect > availAspect) {
        destHMm = availHeightMm;
        destWMm = destHMm * imgAspect;
        destXMm = marginMm + (availWidthMm - destWMm) / 2;
        destYMm = marginMm;
      } else {
        destWMm = availWidthMm;
        destHMm = destWMm / imgAspect;
        destXMm = marginMm;
        destYMm = marginMm + (availHeightMm - destHMm) / 2;
      }
    }

    // Convert rotated canvas to data URL
    const imgDataUrl = rotatedCanvas.toDataURL('image/jpeg', settings.quality || 0.92);

    doc.addImage(
      imgDataUrl,
      'JPEG',
      destXMm,
      destYMm,
      destWMm,
      destHMm,
      undefined,
      'FAST'
    );

    if (onProgress) {
      const progress = Math.round(((i + 1) / images.length) * 100);
      onProgress(progress);
    }
  }

  if (!doc) {
    throw new Error('Failed to assemble PDF document');
  }

  const outputBlob = doc.output('blob');
  return outputBlob;
}

/**
 * Downloads a generated PDF Blob to user machine
 */
export function downloadPdfBlob(blob: Blob, filename: string = 'Converted_Document'): void {
  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
