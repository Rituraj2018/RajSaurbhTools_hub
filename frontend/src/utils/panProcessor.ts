import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure pdfjs worker for Vite browser execution
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PanCropBox {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
}

export interface PanImageAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  sharpness: number; // 0 to 100 (default 0)
  signatureBoost: boolean; // boosts contrast for dark pen ink / signature
}

export interface PanDocItem {
  id: string;
  name: string;
  originalCanvas: HTMLCanvasElement;
  frontCrop: PanCropBox;
  backCrop: PanCropBox;
  hasBackCard: boolean;
  adjustments: PanImageAdjustments;
}

export interface PanPrintOptions {
  layoutMode: 'side-by-side' | 'stacked';
  showCuttingGuides: boolean;
  showBorder: boolean;
  cardSpacingMm: number;
}

export const DEFAULT_PAN_ADJUSTMENTS: PanImageAdjustments = {
  brightness: 0,
  contrast: 5,
  sharpness: 10,
  signatureBoost: true,
};

export const DEFAULT_PAN_PRINT_OPTIONS: PanPrintOptions = {
  layoutMode: 'side-by-side',
  showCuttingGuides: true,
  showBorder: true,
  cardSpacingMm: 2,
};

// Default NSDL / UTIITSL bottom card cutout
export const DEFAULT_PAN_FRONT_CROP: PanCropBox = {
  x: 8.0,
  y: 65.0,
  width: 41.5,
  height: 27.0,
};

export const DEFAULT_PAN_BACK_CROP: PanCropBox = {
  x: 50.5,
  y: 65.0,
  width: 41.5,
  height: 27.0,
};

/**
 * Standard ISO/IEC 7810 ID-1 / CR80 Dimensions @ 300 DPI
 * Width: 85.60 mm (~1011 px)
 * Height: 53.98 mm (~638 px)
 */
export const CR80_WIDTH_PX = 1011;
export const CR80_HEIGHT_PX = 638;
export const CR80_ASPECT_RATIO = 85.6 / 54.0; // ~1.5852

/**
 * Renders a PDF page to Canvas with optional password decryption
 */
export async function renderPdfPageToCanvas(
  arrayBuffer: ArrayBuffer,
  password?: string,
  pageNumber: number = 1
): Promise<HTMLCanvasElement> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    password: password || undefined,
  });

  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);

  // Render at 3.0 scale for crisp 300 DPI card extraction
  const viewport = page.getViewport({ scale: 3.0 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await (page.render({
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  } as any) as any).promise;

  return canvas;
}

/**
 * Loads an image file onto a Canvas
 */
export function renderImageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context is not available'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Crops a specific card region from the source canvas and returns a normalized CR80 Canvas
 */
export function cropCardFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  cropBox: PanCropBox
): HTMLCanvasElement {
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const cropX = Math.round((cropBox.x / 100) * srcW);
  const cropY = Math.round((cropBox.y / 100) * srcH);
  const cropWidth = Math.round((cropBox.width / 100) * srcW);
  const cropHeight = Math.round((cropBox.height / 100) * srcH);

  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = CR80_WIDTH_PX;
  cardCanvas.height = CR80_HEIGHT_PX;

  const ctx = cardCanvas.getContext('2d');
  if (!ctx) return cardCanvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    CR80_WIDTH_PX,
    CR80_HEIGHT_PX
  );

  return cardCanvas;
}

/**
 * Applies brightness, contrast, sharpness and signature ink boost filters
 */
export function applyPanAdjustments(
  cardCanvas: HTMLCanvasElement,
  adjustments: PanImageAdjustments
): HTMLCanvasElement {
  const { brightness, contrast, sharpness, signatureBoost } = adjustments;

  if (brightness === 0 && contrast === 0 && sharpness === 0 && !signatureBoost) {
    return cardCanvas;
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = cardCanvas.width;
  outputCanvas.height = cardCanvas.height;

  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return cardCanvas;

  const brightnessPercent = 100 + brightness;
  const contrastPercent = 100 + contrast;

  ctx.filter = `brightness(${brightnessPercent}%) contrast(${contrastPercent}%)`;
  ctx.drawImage(cardCanvas, 0, 0);
  ctx.filter = 'none';

  // Apply pixel-level sharpening & ink enhancement
  if (sharpness > 0 || signatureBoost) {
    const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;

    // Convolution sharpen filter
    if (sharpness > 0) {
      const weight = (sharpness / 100) * 0.4;
      const kernel = [
        0, -weight, 0,
        -weight, 1 + 4 * weight, -weight,
        0, -weight, 0,
      ];

      const copy = new Uint8ClampedArray(data);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let val = 0;
            let kIdx = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                val += copy[pIdx] * kernel[kIdx];
                kIdx++;
              }
            }
            const outIdx = (y * width + x) * 4 + c;
            data[outIdx] = Math.min(255, Math.max(0, val));
          }
        }
      }
    }

    // Signature boost: darken dark ink pixels while preserving bright backgrounds
    if (signatureBoost) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // If pixel is darker than mid-tone, push it darker for crisp signature/text
        if (luminance < 110) {
          data[i] = Math.max(0, r * 0.85);
          data[i + 1] = Math.max(0, g * 0.85);
          data[i + 2] = Math.max(0, b * 0.85);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  return outputCanvas;
}

/**
 * Generates an A4 print sheet canvas containing up to 5 PAN card pairs (300 DPI: 2480 x 3508 px)
 */
export function generatePanPrintSheet(
  docs: PanDocItem[],
  printOptions: PanPrintOptions = DEFAULT_PAN_PRINT_OPTIONS
): HTMLCanvasElement {
  const A4_WIDTH_PX = 2480;
  const A4_HEIGHT_PX = 3508;
  const MM_TO_PX = 300 / 25.4; // ~11.81 px/mm

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = A4_WIDTH_PX;
  sheetCanvas.height = A4_HEIGHT_PX;

  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) return sheetCanvas;

  // Solid white sheet background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

  const cardW = CR80_WIDTH_PX;
  const cardH = CR80_HEIGHT_PX;
  const spacingPx = Math.round(printOptions.cardSpacingMm * MM_TO_PX);

  const docsToRender = docs.slice(0, 5);
  const totalSlots = docsToRender.length;
  const totalGroupH = totalSlots * cardH + (totalSlots - 1) * Math.round(6 * MM_TO_PX);
  const startY = Math.max(Math.round(15 * MM_TO_PX), Math.round((A4_HEIGHT_PX - totalGroupH) / 2));

  docsToRender.forEach((docItem, index) => {
    const rawFront = cropCardFromCanvas(docItem.originalCanvas, docItem.frontCrop);
    const adjFront = applyPanAdjustments(rawFront, docItem.adjustments);

    let rawBack: HTMLCanvasElement | null = null;
    let adjBack: HTMLCanvasElement | null = null;
    if (docItem.hasBackCard) {
      rawBack = cropCardFromCanvas(docItem.originalCanvas, docItem.backCrop);
      adjBack = applyPanAdjustments(rawBack, docItem.adjustments);
    }

    const rowY = startY + index * (cardH + Math.round(6 * MM_TO_PX));

    if (printOptions.layoutMode === 'side-by-side' && adjBack) {
      const pairTotalW = cardW * 2 + spacingPx;
      const startX = Math.round((A4_WIDTH_PX - pairTotalW) / 2);
      const frontX = startX;
      const backX = startX + cardW + spacingPx;

      ctx.drawImage(adjFront, frontX, rowY);
      ctx.drawImage(adjBack, backX, rowY);

      if (printOptions.showBorder) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(frontX, rowY, cardW, cardH);
        ctx.strokeRect(backX, rowY, cardW, cardH);
      }

      if (printOptions.showCuttingGuides) {
        drawCuttingGuides(ctx, frontX, rowY, cardW, cardH, MM_TO_PX);
        drawCuttingGuides(ctx, backX, rowY, cardW, cardH, MM_TO_PX);
      }
    } else {
      // Single card or stacked layout centered
      const startX = Math.round((A4_WIDTH_PX - cardW) / 2);

      ctx.drawImage(adjFront, startX, rowY);

      if (printOptions.showBorder) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, rowY, cardW, cardH);
      }

      if (printOptions.showCuttingGuides) {
        drawCuttingGuides(ctx, startX, rowY, cardW, cardH, MM_TO_PX);
      }
    }
  });

  return sheetCanvas;
}

/**
 * Draws precision corner crop marks for cutting
 */
function drawCuttingGuides(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  mmToPx: number
): void {
  const lineLen = Math.round(3.5 * mmToPx);
  const gap = Math.round(1.5 * mmToPx);

  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.2;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - gap - lineLen, y);
  ctx.lineTo(x - gap, y);
  ctx.moveTo(x, y - gap - lineLen);
  ctx.lineTo(x, y - gap);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w + gap, y);
  ctx.lineTo(x + w + gap + lineLen, y);
  ctx.moveTo(x + w, y - gap - lineLen);
  ctx.lineTo(x + w, y - gap);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - gap - lineLen, y + h);
  ctx.lineTo(x - gap, y + h);
  ctx.moveTo(x, y + h + gap);
  ctx.lineTo(x, y + h + gap + lineLen);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w + gap, y + h);
  ctx.lineTo(x + w + gap + lineLen, y + h);
  ctx.moveTo(x + w, y + h + gap);
  ctx.lineTo(x + w, y + h + gap + lineLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Generates ready-to-print A4 PDF
 */
export function generatePanA4Pdf(sheetCanvas: HTMLCanvasElement): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = sheetCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  return pdf;
}

/**
 * Generates exact size CR80 PDF (85.6 x 54 mm) for direct card printers
 */
export function generatePanCr80DirectPdf(docItem: PanDocItem): jsPDF {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [54.0, 85.6],
  });

  const rawFront = cropCardFromCanvas(docItem.originalCanvas, docItem.frontCrop);
  const adjFront = applyPanAdjustments(rawFront, docItem.adjustments);
  const frontData = adjFront.toDataURL('image/jpeg', 0.98);

  // Page 1: Front
  pdf.addImage(frontData, 'JPEG', 0, 0, 85.6, 54.0, undefined, 'FAST');

  // Page 2: Back (if present)
  if (docItem.hasBackCard) {
    pdf.addPage([54.0, 85.6], 'landscape');
    const rawBack = cropCardFromCanvas(docItem.originalCanvas, docItem.backCrop);
    const adjBack = applyPanAdjustments(rawBack, docItem.adjustments);
    const backData = adjBack.toDataURL('image/jpeg', 0.98);
    pdf.addImage(backData, 'JPEG', 0, 0, 85.6, 54.0, undefined, 'FAST');
  }

  return pdf;
}
