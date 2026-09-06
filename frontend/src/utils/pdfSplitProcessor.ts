import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PdfPageInfo {
  pageNumber: number; // 1-indexed
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface PdfDocumentInfo {
  id: string;
  name: string;
  size: number;
  totalPages: number;
  pages: PdfPageInfo[];
  arrayBuffer: ArrayBuffer;
}

export type SplitMode = 'custom-range' | 'selected-pages' | 'all-individual' | 'fixed-interval';

/**
 * Parses and renders thumbnails for all pages of a PDF file
 */
export async function loadAndInspectPdfForSplit(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfDocumentInfo> {
  const arrayBuffer = await file.arrayBuffer();

  // Validate magic header
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const headerStr = String.fromCharCode(...headerBytes);
  if (!headerStr.startsWith('%PDF')) {
    throw new Error('Invalid PDF: The selected file does not have a standard %PDF signature.');
  }

  // Load with pdf-lib to ensure validity
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('This PDF file contains no pages.');
  }

  // Load with PDF.js to render thumbnails
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
  const pdfJsDoc = await loadingTask.promise;

  const pages: PdfPageInfo[] = [];

  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdfJsDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 }); // Lightweight thumbnail scale

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await (page.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        } as any) as any).promise;

        pages.push({
          pageNumber: i,
          thumbnailUrl: canvas.toDataURL('image/jpeg', 0.8),
          width: viewport.width,
          height: viewport.height,
        });
      }
    } catch (err) {
      console.warn(`Failed to render thumbnail for page ${i}:`, err);
      pages.push({
        pageNumber: i,
        thumbnailUrl: '',
        width: 150,
        height: 200,
      });
    }

    if (onProgress) {
      onProgress(i, totalPages);
    }
  }

  return {
    id: `split_pdf_${Date.now()}`,
    name: file.name,
    size: file.size,
    totalPages,
    pages,
    arrayBuffer,
  };
}

/**
 * Parses page range string such as "1-3, 5, 8-10" into sorted unique 1-indexed numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): { pages: number[]; error: string | null } {
  if (!rangeStr.trim()) {
    return { pages: [], error: 'Please enter at least one page number or range.' };
  }

  const clean = rangeStr.replace(/\s+/g, '');
  const tokens = clean.split(',');
  const resultSet = new Set<number>();

  for (const token of tokens) {
    if (!token) continue;

    if (token.includes('-')) {
      const parts = token.split('-');
      if (parts.length !== 2) {
        return { pages: [], error: `Invalid range format: "${token}"` };
      }

      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        return { pages: [], error: `Invalid numbers in range: "${token}"` };
      }

      if (start < 1 || end > totalPages || start > end) {
        return {
          pages: [],
          error: `Range "${token}" out of bounds (Document has ${totalPages} pages, range must be between 1 and ${totalPages}).`,
        };
      }

      for (let p = start; p <= end; p++) {
        resultSet.add(p);
      }
    } else {
      const p = parseInt(token, 10);
      if (isNaN(p)) {
        return { pages: [], error: `Invalid page number: "${token}"` };
      }

      if (p < 1 || p > totalPages) {
        return {
          pages: [],
          error: `Page ${p} is out of bounds (Document has ${totalPages} pages).`,
        };
      }

      resultSet.add(p);
    }
  }

  const pages = Array.from(resultSet).sort((a, b) => a - b);
  if (pages.length === 0) {
    return { pages: [], error: 'No valid pages found in expression.' };
  }

  return { pages, error: null };
}

/**
 * Extracts specified pages and returns a new merged PDF Uint8Array
 */
export async function extractPagesToSinglePdf(
  arrayBuffer: ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  // Convert 1-indexed to 0-indexed indices
  const zeroBasedIndices = pageNumbers.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(sourceDoc, zeroBasedIndices);

  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Extracts each page as an individual 1-page PDF
 */
export async function extractAllIndividualPages(
  arrayBuffer: ArrayBuffer,
  baseFilename: string
): Promise<{ filename: string; bytes: Uint8Array }[]> {
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const total = sourceDoc.getPageCount();
  const results: { filename: string; bytes: Uint8Array }[] = [];

  const cleanBase = baseFilename.replace(/\.pdf$/i, '');

  for (let i = 0; i < total; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(sourceDoc, [i]);
    singleDoc.addPage(page);

    const bytes = await singleDoc.save();
    results.push({
      filename: `${cleanBase}_Page_${i + 1}.pdf`,
      bytes,
    });
  }

  return results;
}

/**
 * Trigger browser file download
 */
export function triggerFileDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
