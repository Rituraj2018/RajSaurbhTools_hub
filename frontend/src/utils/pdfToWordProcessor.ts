/**
 * Client-Side PDF to Microsoft Word (.docx) Engine
 * 100% in-browser processing using pdfjs-dist and docx OpenXML compiler
 * Zero server uploads and zero permanent file storage
 */

import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  ImageRun,
} from 'docx';

// Initialize PDF.js worker using unpkg CDN matching the installed version
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface LoadedPdfDocument {
  file: File;
  name: string;
  size: number;
  totalPages: number;
  thumbnailUrl?: string;
  arrayBuffer: ArrayBuffer;
}

export interface PdfToWordOptions {
  includeImages?: boolean;
  preservePageBreaks?: boolean;
}

export interface ConvertedWordResult {
  blob: Blob;
  url: string;
  size: number;
  filename: string;
  pageCount: number;
  wordCount: number;
  paragraphCount: number;
}

/**
 * Validate that the uploaded file is a valid PDF
 */
export const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected. Please choose a PDF document.' };
  }

  const nameLower = file.name.toLowerCase();
  const isPdfExt = nameLower.endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === 'application/x-pdf';

  if (!isPdfMime && !isPdfExt) {
    return {
      valid: false,
      error: `Invalid file format: "${file.name}". Only PDF (.pdf) documents are supported for this tool.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected PDF file is empty (0 bytes).' };
  }

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 50MB.`,
    };
  }

  return { valid: true };
};

/**
 * Inspect and extract basic metadata from a PDF file
 */
export const inspectPdfDocument = async (file: File): Promise<LoadedPdfDocument> => {
  const arrayBuffer = await file.arrayBuffer();

  // Validate magic %PDF header
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const headerStr = String.fromCharCode(...headerBytes);
  if (!headerStr.startsWith('%PDF')) {
    throw new Error('Invalid PDF format: Missing %PDF header signature.');
  }

  // Verify with pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('The selected PDF file contains no pages.');
  }

  let thumbnailUrl: string | undefined;

  // Generate lightweight preview thumbnail using pdfjs-dist
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
    const pdfJsDoc = await loadingTask.promise;
    const page = await pdfJsDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.4 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (err) {
    console.warn('Could not generate PDF thumbnail:', err);
  }

  return {
    file,
    name: file.name,
    size: file.size,
    totalPages,
    thumbnailUrl,
    arrayBuffer,
  };
};

interface ExtractedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

/**
 * Convert a loaded PDF document to authentic Microsoft Word (.docx) format
 */
export const convertPdfToWord = async (
  loaded: LoadedPdfDocument,
  options: PdfToWordOptions = {},
  onProgress?: (percent: number, status: string) => void
): Promise<ConvertedWordResult> => {
  const { includeImages = true, preservePageBreaks = true } = options;

  onProgress?.(5, 'Initializing PDF parser...');

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(loaded.arrayBuffer.slice(0)) });
  const pdfJsDoc = await loadingTask.promise;
  const totalPages = pdfJsDoc.numPages;

  const docChildren: Paragraph[] = [];
  let totalWords = 0;
  let totalParagraphs = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pct = 5 + Math.round((pageNum / totalPages) * 80);
    onProgress?.(pct, `Extracting content from Page ${pageNum} of ${totalPages}...`);

    const page = await pdfJsDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    const extractedItems: ExtractedTextItem[] = [];

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;

      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.abs(transform[3]) || Math.abs(transform[0]) || 12;
      const x = transform[4];
      const y = transform[5];

      extractedItems.push({
        str: item.str,
        x,
        y,
        width: item.width || 0,
        height: item.height || fontSize,
        fontSize,
        fontName: item.fontName || '',
      });
    }

    if (extractedItems.length > 0) {
      // Group items into lines based on vertical position (y coordinate descending)
      extractedItems.sort((a, b) => b.y - a.y || a.x - b.x);

      const lines: ExtractedTextItem[][] = [];
      let currentLine: ExtractedTextItem[] = [];
      let lastY: number | null = null;

      for (const item of extractedItems) {
        if (lastY === null || Math.abs(item.y - lastY) <= Math.max(4, item.fontSize * 0.4)) {
          currentLine.push(item);
        } else {
          if (currentLine.length > 0) {
            currentLine.sort((a, b) => a.x - b.x);
            lines.push(currentLine);
          }
          currentLine = [item];
        }
        lastY = item.y;
      }
      if (currentLine.length > 0) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
      }

      // Group lines into paragraphs
      for (const line of lines) {
        const textRuns: TextRun[] = [];
        let lineAvgFontSize = 0;

        for (let i = 0; i < line.length; i++) {
          const item = line[i];
          lineAvgFontSize += item.fontSize;

          const isBold =
            item.fontName.toLowerCase().includes('bold') ||
            item.fontName.toLowerCase().includes('black') ||
            item.fontName.toLowerCase().includes('heavy');

          const isItalic =
            item.fontName.toLowerCase().includes('italic') ||
            item.fontName.toLowerCase().includes('oblique');

          const needsSpace =
            i > 0 && item.x - (line[i - 1].x + line[i - 1].width) > item.fontSize * 0.2;

          const textToInsert = (needsSpace ? ' ' : '') + item.str;
          totalWords += item.str.trim().split(/\s+/).length;

          textRuns.push(
            new TextRun({
              text: textToInsert,
              bold: isBold,
              italics: isItalic,
              size: Math.round(Math.min(item.fontSize, 36) * 2), // Half-points in docx
            })
          );
        }

        lineAvgFontSize = lineAvgFontSize / line.length;

        // Determine heading level or regular paragraph
        let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
        if (lineAvgFontSize >= 20) {
          heading = HeadingLevel.HEADING_1;
        } else if (lineAvgFontSize >= 15) {
          heading = HeadingLevel.HEADING_2;
        } else if (lineAvgFontSize >= 13) {
          heading = HeadingLevel.HEADING_3;
        }

        docChildren.push(
          new Paragraph({
            children: textRuns,
            heading,
            spacing: {
              after: heading ? 200 : 120, // Twips
            },
          })
        );
        totalParagraphs++;
      }
    } else if (includeImages) {
      // If the page contains no selectable text (e.g. scanned document / visual flyer),
      // render high-resolution raster image into Word document to preserve content
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.85)
          );

          if (blob) {
            const buffer = await blob.arrayBuffer();
            const scaledWidth = Math.min(550, Math.round(viewport.width * 0.45));
            const scaledHeight = Math.min(750, Math.round(viewport.height * 0.45));

            docChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: {
                      width: scaledWidth,
                      height: scaledHeight,
                    },
                    type: 'jpg',
                  } as any),
                ],
                spacing: { after: 200 },
              })
            );
            totalParagraphs++;
          }
        }
      } catch (renderErr) {
        console.warn('Page image snapshot fallback failed:', renderErr);
      }
    }

    // Insert page break between PDF pages
    if (preservePageBreaks && pageNum < totalPages) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  onProgress?.(90, 'Assembling Word OpenXML Document (.docx)...');

  // If completely empty document, add a placeholder paragraph
  if (docChildren.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Empty Document or No Text Extracted from PDF.',
            italics: true,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    title: loaded.name,
    creator: 'RajSaurbh Tools_Hub',
    description: `Converted from ${loaded.name}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  onProgress?.(96, 'Compressing Word package into binary blob...');

  const wordBlob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(wordBlob);
  const baseName = loaded.name.replace(/\.[^/.]+$/, '');
  const filename = `${baseName}.docx`;

  onProgress?.(100, 'Word conversion complete!');

  return {
    blob: wordBlob,
    url,
    size: wordBlob.size,
    filename,
    pageCount: totalPages,
    wordCount: totalWords,
    paragraphCount: totalParagraphs,
  };
};

/**
 * Format bytes to readable string (e.g. "1.2 MB" or "450 KB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Download the converted Word (.docx) file directly in the browser
 */
export const downloadWordFile = (result: ConvertedWordResult): void => {
  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
