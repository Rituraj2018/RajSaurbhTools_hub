import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure pdfjs worker
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
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  sharpness: number; // 0 to 100
}

export interface AyushmanCardItem {
  id: string;
  name: string;
  originalCanvas: HTMLCanvasElement;
  frontCrop: CardCropBox;
  backCrop: CardCropBox;
  adjustments: ImageAdjustments;
}

export interface AyushmanPrintOptions {
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

export const DEFAULT_PRINT_OPTIONS: AyushmanPrintOptions = {
  layoutMode: 'side-by-side',
  showCuttingGuides: true,
  showBorder: true,
  cardSpacingMm: 2,
};

// Standard Ayushman card crop regions (top/bottom or side-by-side)
export const DEFAULT_AYUSHMAN_FRONT_CROP: CardCropBox = {
  x: 8.0,
  y: 55.0,
  width: 41.0,
  height: 26.0,
};

export const DEFAULT_AYUSHMAN_BACK_CROP: CardCropBox = {
  x: 51.0,
  y: 55.0,
  width: 41.0,
  height: 26.0,
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
 * Renders a PDF page to Canvas with optional password decryption
 */
export async function renderAyushmanPdfToCanvas(
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
export function renderAyushmanImageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
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
 * Generates an authentic sample Ayushman Bharat PM-JAY card canvas for 1-click testing
 */
export function createSampleAyushmanCanvas(
  beneficiaryName: string = 'Vikram Singh Verma',
  pmjayId: string = 'PMJ-9482-7391-4028',
  stateName: string = 'UTTAR PRADESH'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // A4 ratio (1240 x 1754 px)
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top PMJAY Header Banner
  ctx.fillStyle = '#15803D'; // Emerald green
  ctx.fillRect(40, 40, canvas.width - 80, 10);
  ctx.fillStyle = '#EA580C'; // Orange
  ctx.fillRect(40, 50, canvas.width - 80, 6);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('NATIONAL HEALTH AUTHORITY • PM-JAY', 60, 95);
  ctx.font = '14px Arial, sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('Ayushman Bharat Pradhan Mantri Jan Arogya Yojana • Health Card', 60, 120);

  // Beneficiary Summary Details Card
  ctx.fillStyle = '#F0FDF4';
  ctx.strokeStyle = '#BBF7D0';
  ctx.lineWidth = 1;
  ctx.fillRect(40, 150, canvas.width - 80, 360);
  ctx.strokeRect(40, 150, canvas.width - 80, 360);

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(`Beneficiary: ${beneficiaryName}`, 60, 190);
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#374151';
  ctx.fillText(`PM-JAY ID: ${pmjayId}`, 60, 215);
  ctx.fillText(`State: ${stateName}`, 60, 235);
  ctx.fillText('Family ID: HH-9832-1149', 60, 255);
  ctx.fillText('Coverage: ₹5,00,000 / Year Free Health Treatment', 60, 275);
  ctx.fillText('Toll Free Helpline: 14555', 60, 295);

  // Mock Barcode
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(canvas.width - 240, 180, 160, 160);
  ctx.fillStyle = '#1F2937';
  ctx.font = '11px monospace';
  ctx.fillText('AYUSHMAN QR', canvas.width - 215, 255);
  ctx.fillText('SECURE DIGITAL', canvas.width - 225, 275);

  // Dotted Cut Line Section
  ctx.beginPath();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 2;
  ctx.moveTo(40, 920);
  ctx.lineTo(canvas.width - 40, 920);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#6B7280';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('✂ Cut along this line to detach your Ayushman Bharat Health Card', 60, 910);

  // --- 1. FRONT CARD REGION (Bottom Left) ---
  const frontX = 80;
  const frontY = 960;
  const cardW = 515;
  const cardH = 325;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.fillRect(frontX, frontY, cardW, cardH);
  ctx.strokeRect(frontX, frontY, cardW, cardH);

  // Front Header (Golden / Yellow-Orange Banner)
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(frontX, frontY, cardW, 40);
  ctx.fillStyle = '#166534';
  ctx.fillRect(frontX, frontY + 36, cardW, 4);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('AYUSHMAN BHARAT • PM-JAY', frontX + 110, frontY + 25);

  // Beneficiary Photo Box
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(frontX + 20, frontY + 55, 95, 115);
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(frontX + 67, frontY + 100, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(frontX + 67, frontY + 160, 38, Math.PI, 0);
  ctx.fill();

  // Front Beneficiary Details
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText(beneficiaryName, frontX + 130, frontY + 75);
  ctx.font = '11px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('YOB: 1988  |  Gender: MALE', frontX + 130, frontY + 98);
  ctx.fillText(`State: ${stateName}`, frontX + 130, frontY + 120);
  ctx.fillText('₹5 Lakh Health Benefit', frontX + 130, frontY + 142);

  // Bottom ID Strip
  ctx.fillStyle = '#F0FDF4';
  ctx.fillRect(frontX + 20, frontY + cardH - 55, cardW - 40, 38);
  ctx.strokeStyle = '#BBF7D0';
  ctx.strokeRect(frontX + 20, frontY + cardH - 55, cardW - 40, 38);
  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(pmjayId, frontX + 110, frontY + cardH - 31);

  // --- 2. BACK CARD REGION (Bottom Right) ---
  const backX = 645;
  const backY = 960;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.fillRect(backX, backY, cardW, cardH);
  ctx.strokeRect(backX, backY, cardW, cardH);

  // Back Top Banner
  ctx.fillStyle = '#166534';
  ctx.fillRect(backX, backY, cardW, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('PRADHAN MANTRI JAN AROGYA YOJANA', backX + 80, backY + 23);

  // Back Instructions & Hospital network info
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('Important Instructions / महत्वपूर्ण निर्देश:', backX + 25, backY + 60);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('1. Cashless treatment at all empanelled hospitals.', backX + 25, backY + 80);
  ctx.fillText('2. Carry this card along with a valid ID proof.', backX + 25, backY + 98);
  ctx.fillText('3. 24x7 Toll Free Support: 14555 / 1800 111 565', backX + 25, backY + 116);
  ctx.fillText('4. Website: https://pmjay.gov.in', backX + 25, backY + 134);

  // QR Box on Back
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#CBD5E1';
  ctx.fillRect(backX + cardW - 130, backY + 55, 110, 110);
  ctx.strokeRect(backX + cardW - 130, backY + 55, 110, 110);
  ctx.fillStyle = '#334155';
  ctx.font = '9px monospace';
  ctx.fillText('PM-JAY QR', backX + cardW - 108, backY + 115);

  // Back Footer Strip
  ctx.fillStyle = '#F0FDF4';
  ctx.fillRect(backX + 20, backY + cardH - 55, cardW - 40, 38);
  ctx.strokeStyle = '#BBF7D0';
  ctx.strokeRect(backX + 20, backY + cardH - 55, cardW - 40, 38);
  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(pmjayId, backX + 110, backY + cardH - 31);

  return canvas;
}

/**
 * Extracts cropped card canvas (Front or Back) with brightness & contrast adjustments
 */
export function extractAyushmanCardCanvas(
  sourceCanvas: HTMLCanvasElement,
  crop: CardCropBox,
  adjustments: ImageAdjustments = DEFAULT_ADJUSTMENTS
): HTMLCanvasElement {
  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = CR80_WIDTH_PX;
  cardCanvas.height = CR80_HEIGHT_PX;
  const ctx = cardCanvas.getContext('2d');
  if (!ctx) return cardCanvas;

  const srcX = Math.round((crop.x / 100) * sourceCanvas.width);
  const srcY = Math.round((crop.y / 100) * sourceCanvas.height);
  const srcW = Math.round((crop.width / 100) * sourceCanvas.width);
  const srcH = Math.round((crop.height / 100) * sourceCanvas.height);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

  const b = 100 + adjustments.brightness;
  const c = 100 + adjustments.contrast;
  ctx.filter = `brightness(${b}%) contrast(${c}%)`;

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
 * Generates a full A4 sheet (2480 x 3508 px @ 300 DPI) containing 1 to 5 sets of Ayushman cards
 */
export function generateAyushmanA4SheetCanvas(
  cards: AyushmanCardItem[],
  options: AyushmanPrintOptions = DEFAULT_PRINT_OPTIONS
): HTMLCanvasElement {
  const a4Canvas = document.createElement('canvas');
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
  ctx.fillText('Ayushman Card Print Tool • Print Ready Layout (A4 300 DPI)', 90, 80);

  const cardW = CR80_WIDTH_PX;
  const cardH = CR80_HEIGHT_PX;
  const maxSets = Math.min(5, cards.length);

  if (options.layoutMode === 'side-by-side') {
    const gapPx = Math.round((options.cardSpacingMm / 25.4) * 300);
    const pairWidth = cardW * 2 + gapPx;
    const startX = Math.round((a4Canvas.width - pairWidth) / 2);
    const verticalGap = 70;
    const startY = 130;

    for (let i = 0; i < maxSets; i++) {
      const item = cards[i];
      const frontCanvas = extractAyushmanCardCanvas(item.originalCanvas, item.frontCrop, item.adjustments);
      const backCanvas = extractAyushmanCardCanvas(item.originalCanvas, item.backCrop, item.adjustments);

      const posY = startY + i * (cardH + verticalGap);
      if (posY + cardH > a4Canvas.height - 60) break;

      const posXFront = startX;
      const posXBack = startX + cardW + gapPx;

      ctx.drawImage(frontCanvas, posXFront, posY, cardW, cardH);
      ctx.drawImage(backCanvas, posXBack, posY, cardW, cardH);

      if (options.showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(posXFront, posY, cardW, cardH);
        ctx.strokeRect(posXBack, posY, cardW, cardH);
      }

      if (options.showCuttingGuides) {
        drawCuttingGuideCrosshairs(ctx, posXFront, posY, cardW, cardH);
        drawCuttingGuideCrosshairs(ctx, posXBack, posY, cardW, cardH);

        // Center fold guideline
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

        ctx.fillStyle = '#64748B';
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(`Ayushman Card ${i + 1}: ${item.name}`, posXFront, posY - 10);
      }
    }
  } else {
    // Stacked vertical layout
    const posX = Math.round((a4Canvas.width - cardW) / 2);
    const gapPx = Math.round((options.cardSpacingMm / 25.4) * 300);
    const startY = 130;
    const pairHeight = cardH * 2 + gapPx + 50;

    for (let i = 0; i < maxSets; i++) {
      const item = cards[i];
      const frontCanvas = extractAyushmanCardCanvas(item.originalCanvas, item.frontCrop, item.adjustments);
      const backCanvas = extractAyushmanCardCanvas(item.originalCanvas, item.backCrop, item.adjustments);

      const posYFront = startY + i * pairHeight;
      const posYBack = posYFront + cardH + gapPx;
      if (posYBack + cardH > a4Canvas.height - 60) break;

      ctx.drawImage(frontCanvas, posX, posYFront, cardW, cardH);
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
        ctx.fillText(`Ayushman Card ${i + 1}: ${item.name} (Front & Back)`, posX, posYFront - 10);
      }
    }
  }

  // Footer
  ctx.fillStyle = '#94A3B8';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Processed 100% locally in browser memory • Print at 100% Scale / Actual Size', 90, a4Canvas.height - 50);

  return a4Canvas;
}

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
  ctx.lineTo(x + len, y);
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
export function generateAyushmanPDF(sheetCanvas: HTMLCanvasElement, filename: string): void {
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
export function generateAyushmanCardPDF(cardCanvas: HTMLCanvasElement, filename: string): void {
  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54],
  });

  const imgData = cardCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(imgData, 'JPEG', 0, 0, 85.6, 54);
  pdf.save(cleanName);
}
