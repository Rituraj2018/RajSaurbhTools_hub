import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export type QrPayloadType = 'upi' | 'url' | 'wifi' | 'text' | 'vcard' | 'whatsapp' | 'email';

export interface UpiPayload {
  vpa: string;
  name: string;
  amount: string;
  note: string;
}

export interface WifiPayload {
  ssid: string;
  password: string;
  authType: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  website: string;
}

export interface WhatsAppPayload {
  countryCode: string;
  phoneNumber: string;
  message: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface QrStylingOptions {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  size: number;
  margin: number;
  centerLogo?: string | null; // dataURL of logo
  logoSizePercent?: number; // default 20%
}

export const DEFAULT_QR_STYLING: QrStylingOptions = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'H',
  size: 512,
  margin: 2,
  centerLogo: null,
  logoSizePercent: 22,
};

/**
 * Encodes payload object into standard string based on QR type
 */
export function formatQrPayload(type: QrPayloadType, data: any): string {
  switch (type) {
    case 'upi': {
      const { vpa, name, amount, note } = data as UpiPayload;
      if (!vpa.trim()) return '';
      const params = new URLSearchParams();
      params.set('pa', vpa.trim());
      if (name.trim()) params.set('pn', name.trim());
      if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
        params.set('am', parseFloat(amount).toFixed(2));
      }
      if (note.trim()) params.set('tn', note.trim());
      params.set('cu', 'INR');
      return `upi://pay?${params.toString()}`;
    }

    case 'url': {
      const url = String(data || '').trim();
      if (!url) return '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    }

    case 'wifi': {
      const { ssid, password, authType, hidden } = data as WifiPayload;
      if (!ssid.trim()) return '';
      return `WIFI:T:${authType};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, organization, website } = data as VCardPayload;
      const fn = `${firstName} ${lastName}`.trim();
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${fn || 'Contact'}`,
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        organization ? `ORG:${organization}` : '',
        website ? `URL:${website}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'whatsapp': {
      const { countryCode, phoneNumber, message } = data as WhatsAppPayload;
      const fullNumber = `${countryCode.replace(/\+/g, '')}${phoneNumber.replace(/\D/g, '')}`;
      if (!fullNumber) return '';
      const query = message ? `?text=${encodeURIComponent(message)}` : '';
      return `https://wa.me/${fullNumber}${query}`;
    }

    case 'email': {
      const { to, subject, body } = data as EmailPayload;
      if (!to.trim()) return '';
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const q = params.toString();
      return `mailto:${to.trim()}${q ? `?${q}` : ''}`;
    }

    case 'text':
    default:
      return String(data || '');
  }
}

/**
 * Generates QR Code onto an HTML Canvas with optional center logo
 */
export async function generateQrCanvas(
  text: string,
  options: QrStylingOptions = DEFAULT_QR_STYLING
): Promise<HTMLCanvasElement> {
  if (!text) {
    throw new Error('QR payload text cannot be empty.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = options.size;
  canvas.height = options.size;

  // Render base QR code onto canvas
  await QRCode.toCanvas(canvas, text, {
    width: options.size,
    margin: options.margin,
    color: {
      dark: options.fgColor || '#000000',
      light: options.bgColor || '#ffffff',
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
  });

  // If center logo provided, draw in center with rounded white badge
  if (options.centerLogo) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoSizePercent = (options.logoSizePercent || 22) / 100;
          const logoWidth = options.size * logoSizePercent;
          const logoHeight = options.size * logoSizePercent;
          const centerX = (options.size - logoWidth) / 2;
          const centerY = (options.size - logoHeight) / 2;
          const padding = logoWidth * 0.15;

          // Draw white background pill/badge for logo
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          const r = 12; // radius
          const x = centerX - padding;
          const y = centerY - padding;
          const w = logoWidth + padding * 2;
          const h = logoHeight + padding * 2;

          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();

          // Draw image
          ctx.drawImage(img, centerX, centerY, logoWidth, logoHeight);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = options.centerLogo!;
      });
    }
  }

  return canvas;
}

/**
 * Generates SVG string for vector export
 */
export async function generateQrSvg(
  text: string,
  options: QrStylingOptions = DEFAULT_QR_STYLING
): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    width: options.size,
    margin: options.margin,
    color: {
      dark: options.fgColor || '#000000',
      light: options.bgColor || '#ffffff',
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
  });
}

/**
 * Downloads PNG from Canvas
 */
export function downloadQrPng(canvas: HTMLCanvasElement, filename: string = 'QRCode'): void {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `${filename.replace(/\.png$/i, '')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Downloads SVG file
 */
export function downloadQrSvg(svgContent: string, filename: string = 'QRCode'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/\.svg$/i, '')}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Generates and downloads ready-to-print A4 / Standee PDF
 */
export function downloadQrPdf(
  canvas: HTMLCanvasElement,
  title: string = 'Scan to Pay / Connect',
  subtitle: string = 'Point your camera or UPI app to scan',
  filename: string = 'QRCode_Print'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Background card
  doc.setFillColor(248, 250, 252); // light slate
  doc.rect(20, 30, pageWidth - 40, pageHeight - 60, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.rect(20, 30, pageWidth - 40, pageHeight - 60, 'S');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, pageWidth / 2, 55, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(subtitle, pageWidth / 2, 65, { align: 'center' });

  // QR Image centered (120 x 120 mm)
  const qrSize = 120;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 80;

  const dataUrl = canvas.toDataURL('image/png');
  doc.addImage(dataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Footer branding
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Powered by RajSaurbh Tools_Hub • Verified QR Studio', pageWidth / 2, 225, {
    align: 'center',
  });

  doc.save(`${filename.replace(/\.pdf$/i, '')}.pdf`);
}
