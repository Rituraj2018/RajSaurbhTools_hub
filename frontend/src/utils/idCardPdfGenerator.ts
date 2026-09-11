/**
 * ID Card PDF Generator
 * Uses existing jsPDF dependency for PDF generation
 * Supports single card, front+back, and multi-card A4 sheet PDFs
 */

import { jsPDF } from 'jspdf';
import {
  CardData,
  renderCardToCanvas,
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  pxToMm,
  SheetLayoutOptions,
} from './idCardProcessor';

export interface IdCardPdfOptions {
  filename?: string;
  quality?: number;
  includeBack?: boolean;
}

/**
 * Generate a single-card PDF at actual card size
 */
export async function generateSingleCardPdf(
  cardData: CardData,
  backCardData?: CardData,
  options: IdCardPdfOptions = {}
): Promise<void> {
  const {
    filename = `ID_Card_${Date.now()}`,
    quality = 0.95,
    includeBack = false,
  } = options;

  const widthMm = cardData.dimensions.widthMm;
  const heightMm = cardData.dimensions.heightMm;

  const doc = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  // Front side
  const frontCanvas = await renderCardToCanvas(cardData, 1);
  const frontData = frontCanvas.toDataURL('image/jpeg', quality);
  doc.addImage(frontData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');

  // Back side
  if (includeBack && backCardData) {
    doc.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
    const backCanvas = await renderCardToCanvas(backCardData, 1);
    const backData = backCanvas.toDataURL('image/jpeg', quality);
    doc.addImage(backData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Generate an A4 sheet PDF with multiple cards
 */
export async function generateSheetPdf(
  cardCanvases: HTMLCanvasElement[],
  layout: SheetLayoutOptions,
  options: { filename?: string; quality?: number } = {}
): Promise<void> {
  const {
    filename = `ID_Card_Sheet_${Date.now()}`,
    quality = 0.95,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const cardWMm = pxToMm(layout.cardWidthPx, 300);
  const cardHMm = pxToMm(layout.cardHeightPx, 300);
  const marginLeftMm = pxToMm(layout.marginLeftPx, 300);
  const marginTopMm = pxToMm(layout.marginTopPx, 300);
  const spacingXMm = pxToMm(layout.spacingXPx, 300);
  const spacingYMm = pxToMm(layout.spacingYPx, 300);

  let cardIndex = 0;
  const cardsPerPage = layout.rows * layout.cols;
  const totalPages = Math.ceil(cardCanvases.length / cardsPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage('a4', 'portrait');
    }

    for (let row = 0; row < layout.rows && cardIndex < cardCanvases.length; row++) {
      for (let col = 0; col < layout.cols && cardIndex < cardCanvases.length; col++) {
        const x = marginLeftMm + col * (cardWMm + spacingXMm);
        const y = marginTopMm + row * (cardHMm + spacingYMm);
        const imgData = cardCanvases[cardIndex].toDataURL('image/jpeg', quality);
        doc.addImage(imgData, 'JPEG', x, y, cardWMm, cardHMm, undefined, 'FAST');
        cardIndex++;
      }
    }
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Generate sheet PDF from image data URLs
 */
export async function generateSheetPdfFromImages(
  sheetCanvas: HTMLCanvasElement,
  options: { filename?: string; quality?: number } = {}
): Promise<void> {
  const {
    filename = `ID_Card_Sheet_${Date.now()}`,
    quality = 0.95,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgData = sheetCanvas.toDataURL('image/jpeg', quality);
  doc.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
  doc.save(`${filename}.pdf`);
}

/**
 * Generate a simple PDF from a single canvas at A4 size
 */
export async function generateA4CardPdf(
  cardCanvas: HTMLCanvasElement,
  options: { filename?: string; quality?: number; landscape?: boolean } = {}
): Promise<void> {
  const {
    filename = `ID_Card_A4_${Date.now()}`,
    quality = 0.95,
    landscape = false,
  } = options;

  const doc = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageW = landscape ? A4_HEIGHT_MM : A4_WIDTH_MM;
  const pageH = landscape ? A4_WIDTH_MM : A4_HEIGHT_MM;

  // Center the card on the A4 page
  const cardW = pxToMm(cardCanvas.width, 300);
  const cardH = pxToMm(cardCanvas.height, 300);

  const x = Math.max(0, (pageW - cardW) / 2);
  const y = Math.max(0, (pageH - cardH) / 2);

  const imgData = cardCanvas.toDataURL('image/jpeg', quality);
  doc.addImage(imgData, 'JPEG', x, y, Math.min(cardW, pageW), Math.min(cardH, pageH), undefined, 'FAST');
  doc.save(`${filename}.pdf`);
}
