import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PdfFileItem {
  id: string;
  file?: File | null;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer | null;
  error?: string | null;
}

export interface MergeOptions {
  filename: string;
}

export const DEFAULT_MERGE_OPTIONS: MergeOptions = {
  filename: 'Merged_Document',
};

/**
 * Reads and inspects a PDF file to extract page count and validate structure
 */
export async function loadAndInspectPdf(file: File): Promise<PdfFileItem> {
  const id = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    // Validate magic header %PDF-
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode(...headerBytes);
    if (!headerStr.startsWith('%PDF')) {
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        pageCount: 0,
        arrayBuffer: null,
        error: 'Invalid PDF format: File header is missing standard %PDF signature.',
      };
    }

    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    return {
      id,
      file,
      name: file.name,
      size: file.size,
      pageCount: Math.max(1, pageCount),
      arrayBuffer,
      error: null,
    };
  } catch (err: any) {
    console.error('Failed to parse PDF:', err);
    return {
      id,
      file,
      name: file.name,
      size: file.size,
      pageCount: 0,
      arrayBuffer: null,
      error: err?.message || 'Corrupted or password-protected PDF file.',
    };
  }
}

/**
 * Creates authentic sample multi-page PDF documents for 1-click testing
 */
export async function createSamplePdf(
  title: string,
  subtitle: string,
  pageCount: number = 2,
  colorTheme: { r: number; g: number; b: number } = { r: 0.1, g: 0.2, b: 0.4 }
): Promise<PdfFileItem> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]); // A4 in points (72 DPI)
    const { width, height } = page.getSize();

    // Top decorative colored banner
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(colorTheme.r, colorTheme.g, colorTheme.b),
    });

    // Header Title
    page.drawText(title, {
      x: 40,
      y: height - 60,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Subtitle
    page.drawText(subtitle, {
      x: 40,
      y: height - 90,
      size: 13,
      font: fontRegular,
      color: rgb(0.9, 0.9, 0.95),
    });

    // Section Content Card
    page.drawRectangle({
      x: 40,
      y: height - 420,
      width: width - 80,
      height: 260,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    page.drawText(`Chapter ${i}: Section Overview & Details`, {
      x: 60,
      y: height - 200,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    const bodyParagraph =
      'This document page was generated client-side by RajSaurbh Tool Hub Pro PDF Engine.\nAll vector graphics, fonts, and page structures are compiled directly in browser memory\nfor high-throughput batch processing with zero cloud uploads.';

    page.drawText(bodyParagraph, {
      x: 60,
      y: height - 250,
      size: 11,
      font: fontRegular,
      lineHeight: 18,
      color: rgb(0.25, 0.3, 0.4),
    });

    // Bottom Footer & Page Numbering
    page.drawLine({
      start: { x: 40, y: 50 },
      end: { x: width - 40, y: 50 },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.92),
    });

    page.drawText('RajSaurbh Tool Hub Pro • PDF Merge Engine', {
      x: 40,
      y: 32,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65),
    });

    page.drawText(`Page ${i} of ${pageCount}`, {
      x: width - 110,
      y: 32,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.45),
    });
  }

  const pdfBytes = await doc.save();
  const arrayBuffer = pdfBytes.buffer as ArrayBuffer;
  const fileName = `${title.replace(/\s+/g, '_')}.pdf`;

  return {
    id: `sample_pdf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    file: null,
    name: fileName,
    size: pdfBytes.byteLength,
    pageCount,
    arrayBuffer,
    error: null,
  };
}

/**
 * Merges multiple PDF items into a single combined PDF document
 */
export async function mergePdfDocuments(
  items: PdfFileItem[],
  onProgress?: (progressPercent: number) => void
): Promise<Uint8Array> {
  const validItems = items.filter((item) => item.arrayBuffer && !item.error);

  if (validItems.length === 0) {
    throw new Error('No valid PDF documents to merge');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < validItems.length; i++) {
    const item = validItems[i];
    if (!item.arrayBuffer) continue;

    const srcPdf = await PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }

    if (onProgress) {
      const percent = Math.round(((i + 1) / validItems.length) * 100);
      onProgress(percent);
    }
  }

  // Set standard metadata on merged document
  mergedPdf.setTitle('Merged Document');
  mergedPdf.setProducer('RajSaurbh Tool Hub Pro');
  mergedPdf.setCreator('RajSaurbh PDF Merge Engine');

  const mergedBytes = await mergedPdf.save();
  return mergedBytes;
}

/**
 * Downloads a merged PDF Uint8Array to the user's computer
 */
export function downloadMergedPdf(bytes: Uint8Array, filename: string = 'Merged_Document'): void {
  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
