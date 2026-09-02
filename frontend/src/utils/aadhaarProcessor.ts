import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure pdfjs worker for Vite browser execution
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface CardCropBox {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  sharpness: number; // 0 to 100 (default 0)
}

export interface AadhaarDocItem {
  id: string;
  name: string;
  originalCanvas: HTMLCanvasElement;
  frontCrop: CardCropBox;
  backCrop: CardCropBox;
  adjustments: ImageAdjustments;
}

export interface AadhaarPrintOptions {
  layoutMode: 'side-by-side' | 'stacked';
  showCuttingGuides: boolean;
  showBorder: boolean;
  cardSpacingMm: number;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  sharpness: 0,
};

export const DEFAULT_PRINT_OPTIONS: AadhaarPrintOptions = {
  layoutMode: 'side-by-side',
  showCuttingGuides: true,
  showBorder: true,
  cardSpacingMm: 2,
};

// Default standard bottom cutout positions for e-Aadhaar sheets
export const DEFAULT_FRONT_CROP: CardCropBox = {
  x: 7.5,
  y: 68.0,
  width: 41.5,
  height: 26.5,
};

export const DEFAULT_BACK_CROP: CardCropBox = {
  x: 51.0,
  y: 68.0,
  width: 41.5,
  height: 26.5,
};

/**
 * Standard CR80 Card Dimensions @ 300 DPI
 * Width: 85.6 mm (~1011 px)
 * Height: 54.0 mm (~638 px)
 */
export const CR80_WIDTH_PX = 1011;
export const CR80_HEIGHT_PX = 638;
export const CR80_ASPECT_RATIO = 85.6 / 54.0; // ~1.5852

/**
 * Renders a PDF page to an offscreen Canvas with optional password decryption
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

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await (page.render(renderContext as any) as any).promise;
  return canvas;
}

/**
 * Loads an image file onto a Canvas
 */
export function renderImageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to obtain canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an authentic sample e-Aadhaar document canvas for 1-click testing
 */
export function createSampleAadhaarCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // A4 ratio (1240 x 1754 px)
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top Government Header Banner
  ctx.fillStyle = '#C0392B';
  ctx.fillRect(40, 40, canvas.width - 80, 8);
  ctx.fillStyle = '#27AE60';
  ctx.fillRect(40, 48, canvas.width - 80, 8);

  ctx.fillStyle = '#1A365D';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('UNIQUE IDENTIFICATION AUTHORITY OF INDIA', 60, 95);
  ctx.font = '14px Arial, sans-serif';
  ctx.fillStyle = '#4A5568';
  ctx.fillText('Government of India • e-Aadhaar Document Format', 60, 120);

  // Letter & Address details section
  ctx.fillStyle = '#F7FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.fillRect(40, 150, canvas.width - 80, 420);
  ctx.strokeRect(40, 150, canvas.width - 80, 420);

  ctx.fillStyle = '#2D3748';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('To: Rahul Kumar Sharma', 60, 190);
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#4A5568';
  ctx.fillText('S/O: Mohan Sharma', 60, 215);
  ctx.fillText('House No. 42, Sector 15, Vasundhara', 60, 235);
  ctx.fillText('New Delhi, Delhi - 110001', 60, 255);
  ctx.fillText('Mobile: 98XXXXXX12', 60, 275);

  // Security barcode / QR mock
  ctx.fillStyle = '#EDF2F7';
  ctx.fillRect(canvas.width - 240, 180, 160, 160);
  ctx.fillStyle = '#2D3748';
  ctx.font = '11px monospace';
  ctx.fillText('SECURE DIGITAL', canvas.width - 220, 255);
  ctx.fillText('QR VERIFIED', canvas.width - 210, 275);

  // Dotted Cut Line Section
  ctx.beginPath();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#A0AEC0';
  ctx.lineWidth = 2;
  ctx.moveTo(40, 1150);
  ctx.lineTo(canvas.width - 40, 1150);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#718096';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('✂ Cut along this line to detach your Aadhaar Card', 60, 1140);

  // --- 1. BOTTOM LEFT: FRONT CARD REGION ---
  const frontX = 80;
  const frontY = 1180;
  const cardW = 515;
  const cardH = 325;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.fillRect(frontX, frontY, cardW, cardH);
  ctx.strokeRect(frontX, frontY, cardW, cardH);

  // Front Tricolor band
  ctx.fillStyle = '#FF9933';
  ctx.fillRect(frontX, frontY, cardW, 6);
  ctx.fillStyle = '#138808';
  ctx.fillRect(frontX, frontY + cardH - 6, cardW, 6);

  ctx.fillStyle = '#1A365D';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('GOVERNMENT OF INDIA', frontX + 110, frontY + 32);

  // Portrait Photo Box
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(frontX + 25, frontY + 50, 95, 115);
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(frontX + 72, frontY + 95, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(frontX + 72, frontY + 155, 38, Math.PI, 0);
  ctx.fill();

  // Front Personal Details
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('Rahul Sharma', frontX + 140, frontY + 75);
  ctx.font = '11px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('DOB: 15/08/1995', frontX + 140, frontY + 98);
  ctx.fillText('Gender: MALE / पुरुष', frontX + 140, frontY + 120);

  // Mock Aadhaar Number Banner
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(frontX + 20, frontY + cardH - 55, cardW - 40, 36);
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(frontX + 20, frontY + cardH - 55, cardW - 40, 36);
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('9482  7391  4028', frontX + 160, frontY + cardH - 31);

  // --- 2. BOTTOM RIGHT: BACK CARD REGION ---
  const backX = 645;
  const backY = 1180;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.fillRect(backX, backY, cardW, cardH);
  ctx.strokeRect(backX, backY, cardW, cardH);

  // Back Tricolor band
  ctx.fillStyle = '#FF9933';
  ctx.fillRect(backX, backY, cardW, 6);
  ctx.fillStyle = '#138808';
  ctx.fillRect(backX, backY + cardH - 6, cardW, 6);

  ctx.fillStyle = '#1A365D';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('UNIQUE IDENTIFICATION AUTHORITY OF INDIA', backX + 80, backY + 32);

  // Address in English & Hindi
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('Address / पता:', backX + 25, backY + 65);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('S/O: Mohan Sharma, House No. 42,', backX + 25, backY + 85);
  ctx.fillText('Sector 15, Vasundhara, New Delhi,', backX + 25, backY + 102);
  ctx.fillText('Delhi, Pin Code - 110001', backX + 25, backY + 119);

  // QR Code Box on Back
  ctx.fillStyle = '#F1F5F9';
  ctx.strokeStyle = '#CBD5E1';
  ctx.fillRect(backX + cardW - 135, backY + 60, 110, 110);
  ctx.strokeRect(backX + cardW - 135, backY + 60, 110, 110);
  ctx.fillStyle = '#334155';
  ctx.font = '9px monospace';
  ctx.fillText('SECURE QR', backX + cardW - 115, backY + 120);

  // Back Aadhaar Number Banner
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(backX + 20, backY + cardH - 55, cardW - 40, 36);
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(backX + 20, backY + cardH - 55, cardW - 40, 36);
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('9482  7391  4028', backX + 160, backY + cardH - 31);

  return canvas;
}

/**
 * Extracts a cropped card canvas (Front or Back) and applies brightness & contrast filters
 */
export function extractCardCanvas(
  sourceCanvas: HTMLCanvasElement,
  crop: CardCropBox,
  adjustments: ImageAdjustments = DEFAULT_ADJUSTMENTS
): HTMLCanvasElement {
  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = CR80_WIDTH_PX;
  cardCanvas.height = CR80_HEIGHT_PX;
  const ctx = cardCanvas.getContext('2d');
  if (!ctx) return cardCanvas;

  // Calculate pixel bounds from percentages
  const srcX = Math.round((crop.x / 100) * sourceCanvas.width);
  const srcY = Math.round((crop.y / 100) * sourceCanvas.height);
  const srcW = Math.round((crop.width / 100) * sourceCanvas.width);
  const srcH = Math.round((crop.height / 100) * sourceCanvas.height);

  // Draw white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

  // Apply filters via CSS filter property or manual pixel manipulation
  const b = 100 + adjustments.brightness;
  const c = 100 + adjustments.contrast;
  ctx.filter = `brightness(${b}%) contrast(${c}%)`;

  // Draw high-resolution cropped region
  ctx.drawImage(
    sourceCanvas,
    Math.max(0, srcX),
    Math.max(0, srcY),
    Math.min(sourceCanvas.width - srcX, srcW),
    Math.min(sourceCanvas.height - srcY, srcH),
    0,
    0,
    cardCanvas.width,
    cardCanvas.height
  );

  ctx.filter = 'none';

  return cardCanvas;
}

/**
 * Generates a full A4 sheet (2480 x 3508 px @ 300 DPI) containing 1 to 5 sets of Front & Back cards
 */
export function generateAadhaarA4SheetCanvas(
  docs: AadhaarDocItem[],
  options: AadhaarPrintOptions = DEFAULT_PRINT_OPTIONS
): HTMLCanvasElement {
  const a4Canvas = document.createElement('canvas');
  // A4 @ 300 DPI
  a4Canvas.width = 2480;
  a4Canvas.height = 3508;
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) return a4Canvas;

  // Clean White Page
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

  // Header Title at Top Margin
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('Aadhaar Print Studio • High-Resolution Print Ready Layout (A4 300 DPI)', 90, 80);

  const cardW = CR80_WIDTH_PX;
  const cardH = CR80_HEIGHT_PX;
  const maxSets = Math.min(5, docs.length);

  if (options.layoutMode === 'side-by-side') {
    // Side-by-Side: Front on left, Back on right (Width: 1011 + 1011 = 2022 px, fits in 2480 px width)
    const gapPx = Math.round((options.cardSpacingMm / 25.4) * 300);
    const pairWidth = cardW * 2 + gapPx;
    const startX = Math.round((a4Canvas.width - pairWidth) / 2);
    const verticalGap = 70;
    const startY = 130;

    for (let i = 0; i < maxSets; i++) {
      const doc = docs[i];
      const frontCanvas = extractCardCanvas(doc.originalCanvas, doc.frontCrop, doc.adjustments);
      const backCanvas = extractCardCanvas(doc.originalCanvas, doc.backCrop, doc.adjustments);

      const posY = startY + i * (cardH + verticalGap);
      if (posY + cardH > a4Canvas.height - 60) break;

      const posXFront = startX;
      const posXBack = startX + cardW + gapPx;

      // Draw Front Card
      ctx.drawImage(frontCanvas, posXFront, posY, cardW, cardH);
      // Draw Back Card
      ctx.drawImage(backCanvas, posXBack, posY, cardW, cardH);

      // Card Borders
      if (options.showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(posXFront, posY, cardW, cardH);
        ctx.strokeRect(posXBack, posY, cardW, cardH);
      }

      // Cutting and Folding Guides
      if (options.showCuttingGuides) {
        drawCuttingGuideCrosshairs(ctx, posXFront, posY, cardW, cardH);
        drawCuttingGuideCrosshairs(ctx, posXBack, posY, cardW, cardH);

        // Center fold guideline between front & back
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        const foldX = posXFront + cardW + Math.round(gapPx / 2);
        ctx.beginPath();
        ctx.moveTo(foldX, posY - 15);
        ctx.lineTo(foldX, posY + cardH + 15);
        ctx.stroke();
        ctx.restore();

        // Label
        ctx.fillStyle = '#64748B';
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(`Card ${i + 1}: ${doc.name}`, posXFront, posY - 10);
      }
    }
  } else {
    // Stacked layout (Front above, Back below)
    const posX = Math.round((a4Canvas.width - cardW) / 2);
    const gapPx = Math.round((options.cardSpacingMm / 25.4) * 300);
    const startY = 130;
    const pairHeight = cardH * 2 + gapPx + 50;

    for (let i = 0; i < maxSets; i++) {
      const doc = docs[i];
      const frontCanvas = extractCardCanvas(doc.originalCanvas, doc.frontCrop, doc.adjustments);
      const backCanvas = extractCardCanvas(doc.originalCanvas, doc.backCrop, doc.adjustments);

      const posYFront = startY + i * pairHeight;
      const posYBack = posYFront + cardH + gapPx;
      if (posYBack + cardH > a4Canvas.height - 60) break;

      // Draw Front Card
      ctx.drawImage(frontCanvas, posX, posYFront, cardW, cardH);
      // Draw Back Card
      ctx.drawImage(backCanvas, posX, posYBack, cardW, cardH);

      if (options.showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posYFront, cardW, cardH);
        ctx.strokeRect(posX, posYBack, cardW, cardH);
      }

      if (options.showCuttingGuides) {
        drawCuttingGuideCrosshairs(ctx, posX, posYFront, cardW, cardH);
        drawCuttingGuideCrosshairs(ctx, posX, posYBack, cardW, cardH);

        ctx.fillStyle = '#64748B';
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(`Card ${i + 1}: ${doc.name} (Front & Back)`, posX, posYFront - 10);
      }
    }
  }

  // Footer Note
  ctx.fillStyle = '#94A3B8';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Processed 100% locally via RajSaurbh Tools_Hub • Print at 100% Scale / Actual Size', 90, a4Canvas.height - 50);

  return a4Canvas;
}

/**
 * Helper to draw corner crosshair cutting guides
 */
function drawCuttingGuideCrosshairs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  const len = 20;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + len, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + len);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(x + w + 10, y);
  ctx.lineTo(x + w - len, y);
  ctx.moveTo(x + w, y - 10);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(x - 10, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.moveTo(x, y + h + 10);
  ctx.lineTo(x, y + h - len);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(x + w + 10, y + h);
  ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + w, y + h + 10);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}

/**
 * Downloads a Canvas as JPG or PNG
 */
export function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): void {
  const ext = format === 'image/jpeg' ? 'jpg' : 'png';
  const cleanName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const dataUrl = canvas.toDataURL(format, 0.98);

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an A4 PDF document containing the print sheet
 */
export function generateAadhaarPDF(sheetCanvas: HTMLCanvasElement, filename: string): void {
  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = sheetCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  pdf.save(cleanName);
}

/**
 * Generates a PDF at true CR80 / PAN Card dimensions (85.6 × 54 mm) for actual-size card printing.
 * The PDF page is exactly 85.6 × 54 mm — print at 100% scale / actual size.
 */
export function generateAadhaarCardPDF(cardCanvas: HTMLCanvasElement, filename: string): void {
  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54],
  });

  const imgData = cardCanvas.toDataURL('image/jpeg', 0.98);
  // Fill the entire 85.6 × 54 mm page with the card image
  pdf.addImage(imgData, 'JPEG', 0, 0, 85.6, 54);
  pdf.save(cleanName);
}
