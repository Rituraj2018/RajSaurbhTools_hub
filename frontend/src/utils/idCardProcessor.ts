/**
 * ID Card Processor Engine
 * 100% client-side Canvas-based ID card generation
 * Supports CR80 standard (85.6mm × 53.98mm) and custom dimensions
 * No server uploads — all processing in-browser
 */

// ─── Constants ──────────────────────────────────────────────────────────────
export const MM_TO_PX_300DPI = 11.811; // 1mm = 11.811px @ 300 DPI

export const CR80_WIDTH_MM = 85.6;
export const CR80_HEIGHT_MM = 53.98;
export const CR80_WIDTH_PX = Math.round(CR80_WIDTH_MM * MM_TO_PX_300DPI); // 1011
export const CR80_HEIGHT_PX = Math.round(CR80_HEIGHT_MM * MM_TO_PX_300DPI); // 638

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_PX = 2480;
export const A4_HEIGHT_PX = 3508;

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface CardDimensions {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
}

export interface CardTextField {
  id: string;
  label: string;
  value: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // in px
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  maxWidth: number; // percentage of card width
  visible: boolean;
}

export interface CardImageElement {
  id: string;
  type: 'photo' | 'logo' | 'qr' | 'barcode';
  dataUrl: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage of card width
  height: number; // percentage of card height
  borderRadius: number; // px
  visible: boolean;
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  backgroundGradient?: string;
  accentColor: string;
  textColor: string;
  headerHeight: number; // percentage
  fields: CardTextField[];
  imageElements: CardImageElement[];
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
}

export interface CardData {
  template: CardTemplate;
  dimensions: CardDimensions;
  photo?: string; // dataURL
  logo?: string; // dataURL
  qrCode?: string; // dataURL
  barcode?: string; // dataURL
  fields: Record<string, string>;
}

export interface SheetLayoutOptions {
  paperWidthPx: number;
  paperHeightPx: number;
  cardWidthPx: number;
  cardHeightPx: number;
  marginTopPx: number;
  marginLeftPx: number;
  spacingXPx: number;
  spacingYPx: number;
  rows: number;
  cols: number;
}

// ─── Preset Dimensions ─────────────────────────────────────────────────────

export const CARD_PRESETS: Record<string, CardDimensions> = {
  CR80: {
    widthMm: CR80_WIDTH_MM,
    heightMm: CR80_HEIGHT_MM,
    widthPx: CR80_WIDTH_PX,
    heightPx: CR80_HEIGHT_PX,
    dpi: 300,
  },
  'CR80-Landscape': {
    widthMm: CR80_WIDTH_MM,
    heightMm: CR80_HEIGHT_MM,
    widthPx: CR80_WIDTH_PX,
    heightPx: CR80_HEIGHT_PX,
    dpi: 300,
  },
  'CR80-Portrait': {
    widthMm: CR80_HEIGHT_MM,
    heightMm: CR80_WIDTH_MM,
    widthPx: CR80_HEIGHT_PX,
    heightPx: CR80_WIDTH_PX,
    dpi: 300,
  },
  'Custom': {
    widthMm: 85.6,
    heightMm: 53.98,
    widthPx: 1011,
    heightPx: 638,
    dpi: 300,
  },
};

export function mmToPx(mm: number, dpi: number = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

export function pxToMm(px: number, dpi: number = 300): number {
  return parseFloat(((px * 25.4) / dpi).toFixed(2));
}

// ─── Default Templates ──────────────────────────────────────────────────────

const defaultPhotoElement: CardImageElement = {
  id: 'photo',
  type: 'photo',
  dataUrl: '',
  x: 5,
  y: 20,
  width: 25,
  height: 65,
  borderRadius: 4,
  visible: true,
};

const defaultLogoElement: CardImageElement = {
  id: 'logo',
  type: 'logo',
  dataUrl: '',
  x: 3,
  y: 3,
  width: 12,
  height: 15,
  borderRadius: 2,
  visible: true,
};

function createDefaultFields(): CardTextField[] {
  return [
    {
      id: 'orgName',
      label: 'Organization',
      value: '',
      x: 18,
      y: 5,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      textAlign: 'left',
      maxWidth: 78,
      visible: true,
    },
    {
      id: 'name',
      label: 'Full Name',
      value: '',
      x: 35,
      y: 30,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      color: '#1e293b',
      textAlign: 'left',
      maxWidth: 60,
      visible: true,
    },
    {
      id: 'designation',
      label: 'Designation',
      value: '',
      x: 35,
      y: 44,
      fontSize: 13,
      fontWeight: 'normal',
      fontFamily: 'Arial, sans-serif',
      color: '#475569',
      textAlign: 'left',
      maxWidth: 60,
      visible: true,
    },
    {
      id: 'department',
      label: 'Department',
      value: '',
      x: 35,
      y: 55,
      fontSize: 12,
      fontWeight: 'normal',
      fontFamily: 'Arial, sans-serif',
      color: '#64748b',
      textAlign: 'left',
      maxWidth: 60,
      visible: true,
    },
    {
      id: 'idNumber',
      label: 'ID Number',
      value: '',
      x: 35,
      y: 68,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      color: '#0f172a',
      textAlign: 'left',
      maxWidth: 60,
      visible: true,
    },
  ];
}

export const DEFAULT_TEMPLATES: CardTemplate[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional corporate ID with blue header',
    backgroundColor: '#ffffff',
    accentColor: '#1e40af',
    textColor: '#1e293b',
    headerHeight: 18,
    fields: createDefaultFields(),
    imageElements: [
      { ...defaultPhotoElement },
      { ...defaultLogoElement },
    ],
    showBorder: true,
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  {
    id: 'corporate-dark',
    name: 'Corporate Dark',
    description: 'Modern dark theme corporate ID',
    backgroundColor: '#0f172a',
    accentColor: '#3b82f6',
    textColor: '#e2e8f0',
    headerHeight: 18,
    fields: createDefaultFields().map(f => ({
      ...f,
      color: f.id === 'orgName' ? '#ffffff' : f.id === 'name' ? '#f1f5f9' : '#94a3b8',
    })),
    imageElements: [
      { ...defaultPhotoElement },
      { ...defaultLogoElement },
    ],
    showBorder: true,
    borderColor: '#334155',
    borderWidth: 1,
  },
  {
    id: 'student-green',
    name: 'Student Green',
    description: 'Student ID card with green accent',
    backgroundColor: '#f0fdf4',
    accentColor: '#16a34a',
    textColor: '#14532d',
    headerHeight: 20,
    fields: createDefaultFields(),
    imageElements: [
      { ...defaultPhotoElement },
      { ...defaultLogoElement },
    ],
    showBorder: true,
    borderColor: '#86efac',
    borderWidth: 2,
  },
  {
    id: 'visitor-orange',
    name: 'Visitor Pass',
    description: 'Temporary visitor pass with orange theme',
    backgroundColor: '#fffbeb',
    accentColor: '#ea580c',
    textColor: '#431407',
    headerHeight: 22,
    fields: createDefaultFields(),
    imageElements: [
      { ...defaultPhotoElement },
      { ...defaultLogoElement },
    ],
    showBorder: true,
    borderColor: '#fed7aa',
    borderWidth: 2,
  },
  {
    id: 'blank',
    name: 'Blank Card',
    description: 'Start from scratch with a blank template',
    backgroundColor: '#ffffff',
    accentColor: '#6366f1',
    textColor: '#1e293b',
    headerHeight: 0,
    fields: createDefaultFields(),
    imageElements: [
      { ...defaultPhotoElement },
      { ...defaultLogoElement },
    ],
    showBorder: true,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
];

// ─── Image Loading Helpers ──────────────────────────────────────────────────

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function validateCardImage(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No file selected.' };

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are supported.' };
  }

  const MAX_SIZE = 20 * 1024 * 1024; // 20MB
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max 20MB.` };
  }

  if (file.size === 0) return { valid: false, error: 'File is empty.' };

  return { valid: true };
}

// ─── Card Rendering Engine ──────────────────────────────────────────────────

export async function renderCardToCanvas(
  cardData: CardData,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const { template, dimensions } = cardData;
  const w = Math.round(dimensions.widthPx * scale);
  const h = Math.round(dimensions.heightPx * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1) Background
  if (template.backgroundGradient) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, template.accentColor);
    grad.addColorStop(0.3, template.backgroundColor);
    grad.addColorStop(1, template.backgroundColor);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = template.backgroundColor;
  }
  ctx.fillRect(0, 0, w, h);

  // 2) Header accent bar
  if (template.headerHeight > 0) {
    const headerH = (template.headerHeight / 100) * h;
    ctx.fillStyle = template.accentColor;
    ctx.fillRect(0, 0, w, headerH);
  }

  // 3) Border
  if (template.showBorder && template.borderWidth > 0) {
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = template.borderWidth * scale;
    ctx.strokeRect(0, 0, w, h);
  }

  // 4) Image elements (photo, logo, QR, barcode)
  for (const elem of template.imageElements) {
    if (!elem.visible) continue;

    let src = elem.dataUrl;
    if (elem.type === 'photo' && cardData.photo) src = cardData.photo;
    if (elem.type === 'logo' && cardData.logo) src = cardData.logo;
    if (elem.type === 'qr' && cardData.qrCode) src = cardData.qrCode;
    if (elem.type === 'barcode' && cardData.barcode) src = cardData.barcode;

    if (!src) continue;

    try {
      const img = await loadImage(src);
      const ex = (elem.x / 100) * w;
      const ey = (elem.y / 100) * h;
      const ew = (elem.width / 100) * w;
      const eh = (elem.height / 100) * h;

      if (elem.borderRadius > 0) {
        ctx.save();
        const r = elem.borderRadius * scale;
        ctx.beginPath();
        ctx.moveTo(ex + r, ey);
        ctx.lineTo(ex + ew - r, ey);
        ctx.quadraticCurveTo(ex + ew, ey, ex + ew, ey + r);
        ctx.lineTo(ex + ew, ey + eh - r);
        ctx.quadraticCurveTo(ex + ew, ey + eh, ex + ew - r, ey + eh);
        ctx.lineTo(ex + r, ey + eh);
        ctx.quadraticCurveTo(ex, ey + eh, ex, ey + eh - r);
        ctx.lineTo(ex, ey + r);
        ctx.quadraticCurveTo(ex, ey, ex + r, ey);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, ex, ey, ew, eh);
        ctx.restore();
      } else {
        ctx.drawImage(img, ex, ey, ew, eh);
      }
    } catch {
      // Skip elements that fail to load
    }
  }

  // 5) Text fields
  for (const field of template.fields) {
    if (!field.visible) continue;
    const text = cardData.fields[field.id] || field.value;
    if (!text) continue;

    const fx = (field.x / 100) * w;
    const fy = (field.y / 100) * h;
    const maxW = (field.maxWidth / 100) * w;
    const fontSize = Math.round(field.fontSize * scale);

    ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
    ctx.fillStyle = field.color;
    ctx.textAlign = field.textAlign;
    ctx.textBaseline = 'top';

    // Wrap text if needed
    const words = text.split(' ');
    let line = '';
    let lineY = fy;
    const lineHeight = fontSize * 1.3;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && line) {
        const drawX = field.textAlign === 'center' ? fx + maxW / 2 :
                      field.textAlign === 'right' ? fx + maxW : fx;
        ctx.fillText(line, drawX, lineY, maxW);
        line = word;
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      const drawX = field.textAlign === 'center' ? fx + maxW / 2 :
                    field.textAlign === 'right' ? fx + maxW : fx;
      ctx.fillText(line, drawX, lineY, maxW);
    }
  }

  return canvas;
}

// ─── Export Functions ───────────────────────────────────────────────────────

export async function exportCardAsBlob(
  cardData: CardData,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<Blob> {
  const canvas = await renderCardToCanvas(cardData, 1);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to export card image'));
        resolve(blob);
      },
      `image/${format}`,
      format === 'jpeg' ? quality : undefined
    );
  });
}

export async function downloadCard(
  cardData: CardData,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<void> {
  const blob = await exportCardAsBlob(cardData, format, quality);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Sheet Tiling ───────────────────────────────────────────────────────────

export function calculateSheetLayout(
  cardWidthPx: number,
  cardHeightPx: number,
  marginMm: number = 10,
  spacingMm: number = 3,
  dpi: number = 300
): SheetLayoutOptions {
  const marginPx = mmToPx(marginMm, dpi);
  const spacingPx = mmToPx(spacingMm, dpi);

  const availW = A4_WIDTH_PX - 2 * marginPx;
  const availH = A4_HEIGHT_PX - 2 * marginPx;

  const cols = Math.max(1, Math.floor((availW + spacingPx) / (cardWidthPx + spacingPx)));
  const rows = Math.max(1, Math.floor((availH + spacingPx) / (cardHeightPx + spacingPx)));

  return {
    paperWidthPx: A4_WIDTH_PX,
    paperHeightPx: A4_HEIGHT_PX,
    cardWidthPx,
    cardHeightPx,
    marginTopPx: marginPx,
    marginLeftPx: marginPx,
    spacingXPx: spacingPx,
    spacingYPx: spacingPx,
    rows,
    cols,
  };
}

export async function renderSheetToCanvas(
  cardImages: HTMLCanvasElement[],
  layout: SheetLayoutOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = layout.paperWidthPx;
  canvas.height = layout.paperHeightPx;
  const ctx = canvas.getContext('2d')!;

  // White background for print
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let cardIndex = 0;
  for (let row = 0; row < layout.rows && cardIndex < cardImages.length; row++) {
    for (let col = 0; col < layout.cols && cardIndex < cardImages.length; col++) {
      const x = layout.marginLeftPx + col * (layout.cardWidthPx + layout.spacingXPx);
      const y = layout.marginTopPx + row * (layout.cardHeightPx + layout.spacingYPx);
      ctx.drawImage(cardImages[cardIndex], x, y, layout.cardWidthPx, layout.cardHeightPx);
      cardIndex++;
    }
  }

  return canvas;
}

export async function renderSheetFromImages(
  imageSrcs: string[],
  layout: SheetLayoutOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = layout.paperWidthPx;
  canvas.height = layout.paperHeightPx;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let idx = 0;
  for (let row = 0; row < layout.rows && idx < imageSrcs.length; row++) {
    for (let col = 0; col < layout.cols && idx < imageSrcs.length; col++) {
      try {
        const img = await loadImage(imageSrcs[idx]);
        const x = layout.marginLeftPx + col * (layout.cardWidthPx + layout.spacingXPx);
        const y = layout.marginTopPx + row * (layout.cardHeightPx + layout.spacingYPx);
        ctx.drawImage(img, x, y, layout.cardWidthPx, layout.cardHeightPx);
      } catch {
        // skip failed images
      }
      idx++;
    }
  }

  return canvas;
}

// ─── Image Adjustment Helpers ───────────────────────────────────────────────

export function applyImageAdjustments(
  canvas: HTMLCanvasElement,
  brightness: number = 0,
  contrast: number = 0
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const filters: string[] = [];
  if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`);
  if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`);
  if (filters.length > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.filter = filters.join(' ');
    tCtx.drawImage(canvas, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }
  return canvas;
}

export function cropImageToCanvas(
  img: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
  outputW: number,
  outputH: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH);
  return canvas;
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality: number = 0.95): string {
  return canvas.toDataURL(`image/${format}`, format === 'jpeg' ? quality : undefined);
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): void {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    `image/${format}`,
    format === 'jpeg' ? quality : undefined
  );
}
