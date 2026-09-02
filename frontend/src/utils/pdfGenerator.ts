import jsPDF from 'jspdf';
import { PaperSize, PAPER_SPECS } from './passportProcessor';

export interface PDFExportOptions {
  paperSize: PaperSize;
  landscape?: boolean;
  filename?: string;
  quality?: number;
}

/**
 * Generates and downloads a print-ready vector-dimensioned PDF from a print sheet canvas
 */
export async function generatePDFSheet(
  sheetCanvas: HTMLCanvasElement,
  options: PDFExportOptions
): Promise<void> {
  const {
    paperSize,
    landscape = false,
    filename = `Passport_Sheet_${paperSize}_${Date.now()}`,
    quality = 0.95,
  } = options;

  const specs = PAPER_SPECS[paperSize];
  const widthMm = landscape ? specs.heightMm : specs.widthMm;
  const heightMm = landscape ? specs.widthMm : specs.heightMm;

  // Initialize jsPDF with exact mm format
  const doc = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: paperSize === 'A4' ? 'a4' : [specs.widthMm, specs.heightMm],
    compress: true,
  });

  const imgData = sheetCanvas.toDataURL('image/jpeg', quality);

  // Draw full-bleed sheet onto PDF page with exact mm dimensions
  doc.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');

  // Trigger download
  doc.save(`${filename}.pdf`);
}
