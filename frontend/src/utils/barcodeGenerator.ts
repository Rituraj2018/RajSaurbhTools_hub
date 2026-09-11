/**
 * Barcode Generator Utility
 * Lightweight wrapper around JsBarcode for ID card barcode generation
 * 100% client-side
 */

import JsBarcode from 'jsbarcode';

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF14'
  | 'codabar';

export interface BarcodeOptions {
  format: BarcodeFormat;
  data: string;
  width?: number; // bar width, default 2
  height?: number; // bar height px, default 80
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
}

export const BARCODE_FORMATS: { value: BarcodeFormat; label: string; description: string }[] = [
  { value: 'CODE128', label: 'Code 128', description: 'Alphanumeric, most versatile' },
  { value: 'CODE39', label: 'Code 39', description: 'Letters, numbers, symbols' },
  { value: 'EAN13', label: 'EAN-13', description: '13-digit international' },
  { value: 'EAN8', label: 'EAN-8', description: '8-digit compact' },
  { value: 'UPC', label: 'UPC-A', description: '12-digit US standard' },
  { value: 'ITF14', label: 'ITF-14', description: '14-digit shipping/logistics' },
  { value: 'codabar', label: 'Codabar', description: 'Libraries, blood banks' },
];

/**
 * Validate barcode data for the given format
 */
export function validateBarcodeData(data: string, format: BarcodeFormat): { valid: boolean; error?: string } {
  if (!data || !data.trim()) {
    return { valid: false, error: 'Barcode data is required.' };
  }

  const trimmed = data.trim();

  switch (format) {
    case 'EAN13':
      if (!/^\d{12,13}$/.test(trimmed)) {
        return { valid: false, error: 'EAN-13 requires exactly 12 or 13 digits.' };
      }
      break;
    case 'EAN8':
      if (!/^\d{7,8}$/.test(trimmed)) {
        return { valid: false, error: 'EAN-8 requires exactly 7 or 8 digits.' };
      }
      break;
    case 'UPC':
      if (!/^\d{11,12}$/.test(trimmed)) {
        return { valid: false, error: 'UPC-A requires exactly 11 or 12 digits.' };
      }
      break;
    case 'ITF14':
      if (!/^\d{13,14}$/.test(trimmed)) {
        return { valid: false, error: 'ITF-14 requires exactly 13 or 14 digits.' };
      }
      break;
    case 'CODE128':
    case 'CODE39':
    case 'codabar':
      if (trimmed.length < 1 || trimmed.length > 80) {
        return { valid: false, error: 'Data must be between 1 and 80 characters.' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Generate a barcode as a Canvas element
 */
export function generateBarcodeCanvas(options: BarcodeOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  try {
    JsBarcode(canvas, options.data.trim(), {
      format: options.format,
      width: options.width || 2,
      height: options.height || 80,
      displayValue: options.displayValue !== false,
      fontSize: options.fontSize || 14,
      margin: options.margin ?? 10,
      background: options.background || '#ffffff',
      lineColor: options.lineColor || '#000000',
    });
  } catch (err: any) {
    // If generation fails, return a small error canvas
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(0, 0, 200, 40);
    ctx.fillStyle = '#dc2626';
    ctx.font = '12px Arial';
    ctx.fillText('Invalid barcode data', 10, 25);
  }

  return canvas;
}

/**
 * Generate barcode as data URL
 */
export function generateBarcodeDataUrl(options: BarcodeOptions): string {
  const canvas = generateBarcodeCanvas(options);
  return canvas.toDataURL('image/png');
}

/**
 * Download barcode as PNG
 */
export function downloadBarcode(options: BarcodeOptions, filename: string = 'barcode'): void {
  const canvas = generateBarcodeCanvas(options);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
