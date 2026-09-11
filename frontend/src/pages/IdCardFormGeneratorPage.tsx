import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Upload,
  Trash2,
  Download,
  Printer,
  Sparkles,
  QrCode,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  User,
  Building,
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { generateBarcodeCanvas, BarcodeFormat } from '../utils/barcodeGenerator';
import {
  MM_TO_PX_300DPI,
  CR80_WIDTH_MM,
  CR80_HEIGHT_MM,
  validateCardImage,
  downloadCanvasAsImage,
} from '../utils/idCardProcessor';
import { recordToolHistorySafely } from '../api/historyApi';

// ─── Card Types ───────────────────────────────────────────────────────────────
export type CardType =
  | 'employee'
  | 'student'
  | 'school'
  | 'college'
  | 'company'
  | 'custom';

interface CardTypeConfig {
  id: CardType;
  label: string;
  defaultOrg: string;
  defaultTitleLabel: string;
  defaultDeptLabel: string;
  defaultIdLabel: string;
  badgeLabel: string;
}

const CARD_TYPE_CONFIGS: Record<CardType, CardTypeConfig> = {
  employee: {
    id: 'employee',
    label: 'Employee ID Card',
    defaultOrg: 'Acme Global Technologies',
    defaultTitleLabel: 'Designation / Role',
    defaultDeptLabel: 'Department',
    defaultIdLabel: 'Employee ID',
    badgeLabel: 'EMPLOYEE ID',
  },
  student: {
    id: 'student',
    label: 'Student ID Card',
    defaultOrg: 'National Model University',
    defaultTitleLabel: 'Program / Course',
    defaultDeptLabel: 'Faculty / Stream',
    defaultIdLabel: 'Student Roll No',
    badgeLabel: 'STUDENT ID',
  },
  school: {
    id: 'school',
    label: 'School ID Card',
    defaultOrg: 'Greenwood High School',
    defaultTitleLabel: 'Class & Section',
    defaultDeptLabel: 'House / Division',
    defaultIdLabel: 'Admission No',
    badgeLabel: 'SCHOOL BADGE',
  },
  college: {
    id: 'college',
    label: 'College ID Card',
    defaultOrg: 'St. Xavier College of Science',
    defaultTitleLabel: 'Course / Major',
    defaultDeptLabel: 'Department / Year',
    defaultIdLabel: 'Enrollment No',
    badgeLabel: 'COLLEGE ID',
  },
  company: {
    id: 'company',
    label: 'Company ID Card',
    defaultOrg: 'Apex Enterprise Solutions',
    defaultTitleLabel: 'Job Title',
    defaultDeptLabel: 'Business Unit',
    defaultIdLabel: 'Staff ID',
    badgeLabel: 'STAFF PASS',
  },
  custom: {
    id: 'custom',
    label: 'Custom ID Card',
    defaultOrg: 'Organization Name',
    defaultTitleLabel: 'Title / Designation',
    defaultDeptLabel: 'Department / Group',
    defaultIdLabel: 'ID / Badge No',
    badgeLabel: 'IDENTITY CARD',
  },
};

// ─── Templates ────────────────────────────────────────────────────────────────
export type TemplateStyle = 'classic' | 'modern' | 'minimal' | 'corporate' | 'vibrant';

interface TemplateTheme {
  id: TemplateStyle;
  name: string;
  headerBg: string;
  headerBgEnd?: string;
  headerText: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  subTextColor: string;
  badgeBg: string;
  badgeText: string;
}

const TEMPLATES: Record<TemplateStyle, TemplateTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic Corporate',
    headerBg: '#1e3a8a',
    headerBgEnd: '#172554',
    headerText: '#ffffff',
    accentColor: '#2563eb',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    textColor: '#0f172a',
    subTextColor: '#475569',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
  },
  modern: {
    id: 'modern',
    name: 'Modern Emerald',
    headerBg: '#064e3b',
    headerBgEnd: '#047857',
    headerText: '#ffffff',
    accentColor: '#10b981',
    cardBg: '#ffffff',
    cardBorder: '#a7f3d0',
    textColor: '#0f172a',
    subTextColor: '#334155',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Slate',
    headerBg: '#0f172a',
    headerBgEnd: '#1e293b',
    headerText: '#ffffff',
    accentColor: '#64748b',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textColor: '#0f172a',
    subTextColor: '#64748b',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
  },
  corporate: {
    id: 'corporate',
    name: 'Executive Gold',
    headerBg: '#18181b',
    headerBgEnd: '#27272a',
    headerText: '#fafafa',
    accentColor: '#d97706',
    cardBg: '#ffffff',
    cardBorder: '#fed7aa',
    textColor: '#18181b',
    subTextColor: '#52525b',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant Tech',
    headerBg: '#4338ca',
    headerBgEnd: '#6366f1',
    headerText: '#ffffff',
    accentColor: '#818cf8',
    cardBg: '#ffffff',
    cardBorder: '#c7d2fe',
    textColor: '#0f172a',
    subTextColor: '#4338ca',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const IdCardFormGeneratorPage: React.FC = () => {
  // Step 1: Card Type
  const [cardType, setCardType] = useState<CardType>('employee');

  // Step 2: Front Side Form State
  const [photo, setPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('Johnathan Doe');
  const [idNumber, setIdNumber] = useState<string>('EMP-2026-8941');
  const [designation, setDesignation] = useState<string>('Senior Software Architect');
  const [department, setDepartment] = useState<string>('Engineering & AI Systems');
  const [organization, setOrganization] = useState<string>('Acme Global Technologies');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [email, setEmail] = useState<string>('j.doe@acmeglobal.com');
  const [dob, setDob] = useState<string>('1994-08-15');
  const [joiningDate, setJoiningDate] = useState<string>('2024-01-10');
  const [validUntil, setValidUntil] = useState<string>('2028-12-31');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [customFieldLabel, setCustomFieldLabel] = useState<string>('Security Clearance');
  const [customFieldValue, setCustomFieldValue] = useState<string>('Level 3 (Confidential)');

  // Step 3: Back Side Form State
  const [address, setAddress] = useState<string>('450 Tech Boulevard, Suite 800, San Jose, CA 95110');
  const [emergencyContact, setEmergencyContact] = useState<string>('+1 (555) 987-6543');
  const [website, setWebsite] = useState<string>('www.acmeglobal.com');
  const [instructions, setInstructions] = useState<string>(
    '1. This card remains the property of the issuing organization.\n2. Must be displayed visibly at all security checkpoints.\n3. If found, please return to the address above or call contact.'
  );
  const [terms, setTerms] = useState<string>(
    'Unauthorized use or duplication of this card is strictly prohibited.'
  );
  const [signatoryText, setSignatoryText] = useState<string>('Authorized Signatory');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  // QR Code & Barcode Options
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [qrType, setQrType] = useState<'summary' | 'url' | 'id'>('summary');
  const [customQrUrl, setCustomQrUrl] = useState<string>('https://acmeglobal.com/verify/EMP-2026-8941');

  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [customBarcodeData, setCustomBarcodeData] = useState<string>('');

  // Step 5: Template & Size
  const [template, setTemplate] = useState<TemplateStyle>('classic');
  const [cardWidthMm, setCardWidthMm] = useState<number>(CR80_WIDTH_MM);
  const [cardHeightMm, setCardHeightMm] = useState<number>(CR80_HEIGHT_MM);
  const [isCustomSize, setIsCustomSize] = useState<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'settings'>('front');
  const [previewSide, setPreviewSide] = useState<'both' | 'front' | 'back'>('both');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Hidden high-res canvas references
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate resolution in pixels @ 300 DPI
  const widthPx = Math.round(cardWidthMm * MM_TO_PX_300DPI);
  const heightPx = Math.round(cardHeightMm * MM_TO_PX_300DPI);

  // Update card defaults when card type changes
  const handleCardTypeChange = (newType: CardType) => {
    setCardType(newType);
    const cfg = CARD_TYPE_CONFIGS[newType];
    if (cfg) {
      setOrganization(cfg.defaultOrg);
      if (newType === 'student') {
        setDesignation('Computer Science & Engineering');
        setDepartment('Batch 2024-2028');
        setIdNumber('CS-2024-042');
        setCustomFieldLabel('Semester');
        setCustomFieldValue('4th Semester');
      } else if (newType === 'school') {
        setDesignation('Grade 10 - Section A');
        setDepartment('Blue Dolphins House');
        setIdNumber('SCH-10482');
        setCustomFieldLabel('Parent Name');
        setCustomFieldValue('Robert Doe');
      } else if (newType === 'college') {
        setDesignation('B.Tech Information Technology');
        setDepartment('School of Engineering');
        setIdNumber('COL-2024-771');
        setCustomFieldLabel('Library Card No');
        setCustomFieldValue('LIB-9941');
      } else if (newType === 'company') {
        setDesignation('Operations Manager');
        setDepartment('Enterprise Logistics');
        setIdNumber('STF-5509');
        setCustomFieldLabel('Office Location');
        setCustomFieldValue('Building C, Floor 4');
      }
    }
  };

  // Image Upload Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateCardImage(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid photo format');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateCardImage(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid logo format');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateCardImage(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid signature format');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureImage(reader.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── High-Res Canvas Rendering ──────────────────────────────────────────────
  const renderFrontCard = useCallback(async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d')!;
    const theme = TEMPLATES[template];
    const cfg = CARD_TYPE_CONFIGS[cardType];

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 2. Header Band
    const headerHeight = Math.round(heightPx * 0.22);
    const grad = ctx.createLinearGradient(0, 0, widthPx, 0);
    grad.addColorStop(0, theme.headerBg);
    grad.addColorStop(1, theme.headerBgEnd || theme.headerBg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widthPx, headerHeight);

    // Accent line below header
    ctx.fillStyle = theme.accentColor;
    ctx.fillRect(0, headerHeight - 4, widthPx, 4);

    // Header Logo (if present)
    let headerTextStartX = Math.round(widthPx * 0.05);
    if (logo) {
      try {
        const logoImg = await loadImageAsync(logo);
        const logoSize = Math.round(headerHeight * 0.7);
        const logoY = Math.round((headerHeight - logoSize) / 2);
        ctx.drawImage(logoImg, headerTextStartX, logoY, logoSize, logoSize);
        headerTextStartX += logoSize + Math.round(widthPx * 0.03);
      } catch {
        // Fallback gracefully
      }
    }

    // Header Organization Name
    ctx.fillStyle = theme.headerText;
    ctx.font = `bold ${Math.round(heightPx * 0.055)}px Inter, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(organization || 'Organization Name', headerTextStartX, Math.round(headerHeight * 0.38));

    // Header Badge / Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `600 ${Math.round(heightPx * 0.032)}px Inter, sans-serif`;
    ctx.fillText(cfg.badgeLabel, headerTextStartX, Math.round(headerHeight * 0.72));

    // 3. Photo Section (Left Column)
    const photoWidth = Math.round(widthPx * 0.28);
    const photoHeight = Math.round(photoWidth * 1.25);
    const photoX = Math.round(widthPx * 0.05);
    const photoY = headerHeight + Math.round(heightPx * 0.07);

    // Photo Box Background & Border
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 8, true, true);

    if (photo) {
      try {
        const photoImg = await loadImageAsync(photo);
        ctx.save();
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 8, false, false);
        ctx.clip();
        ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      } catch {
        drawPhotoPlaceholder(ctx, photoX, photoY, photoWidth, photoHeight);
      }
    } else {
      drawPhotoPlaceholder(ctx, photoX, photoY, photoWidth, photoHeight);
    }

    // Photo Badge: Blood Group (under photo)
    if (bloodGroup) {
      const bgBadgeW = photoWidth;
      const bgBadgeH = Math.round(heightPx * 0.055);
      const bgBadgeY = photoY + photoHeight + 8;
      ctx.fillStyle = '#fee2e2';
      roundRect(ctx, photoX, bgBadgeY, bgBadgeW, bgBadgeH, 4, true, false);
      ctx.fillStyle = '#b91c1c';
      ctx.font = `bold ${Math.round(heightPx * 0.03)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Blood: ${bloodGroup}`, photoX + bgBadgeW / 2, bgBadgeY + bgBadgeH / 2);
    }

    // 4. Details Section (Right Column)
    const detailsX = photoX + photoWidth + Math.round(widthPx * 0.05);
    const detailsMaxW = widthPx - detailsX - Math.round(widthPx * 0.05);

    // Full Name
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.textColor;
    ctx.font = `800 ${Math.round(heightPx * 0.065)}px Inter, sans-serif`;
    ctx.fillText(fullName || 'Cardholder Name', detailsX, photoY, detailsMaxW);

    // Designation / Role
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold ${Math.round(heightPx * 0.042)}px Inter, sans-serif`;
    ctx.fillText(designation || 'Title / Role', detailsX, photoY + Math.round(heightPx * 0.08), detailsMaxW);

    // Department
    ctx.fillStyle = theme.subTextColor;
    ctx.font = `500 ${Math.round(heightPx * 0.034)}px Inter, sans-serif`;
    ctx.fillText(department || 'Department', detailsX, photoY + Math.round(heightPx * 0.135), detailsMaxW);

    // ID Badge Chip
    const idBadgeY = photoY + Math.round(heightPx * 0.20);
    const idBadgeH = Math.round(heightPx * 0.065);
    ctx.fillStyle = theme.badgeBg;
    const idText = `${cfg.defaultIdLabel}: ${idNumber || 'N/A'}`;
    ctx.font = `bold ${Math.round(heightPx * 0.035)}px monospace`;
    const idTextWidth = ctx.measureText(idText).width;
    roundRect(ctx, detailsX, idBadgeY, idTextWidth + 24, idBadgeH, 6, true, false);

    ctx.fillStyle = theme.badgeText;
    ctx.textBaseline = 'middle';
    ctx.fillText(idText, detailsX + 12, idBadgeY + idBadgeH / 2);

    // Key-Value Grid
    const fieldsStartY = idBadgeY + idBadgeH + Math.round(heightPx * 0.035);
    const fieldSpacing = Math.round(heightPx * 0.052);
    const gridFields: [string, string][] = [];

    if (phone) gridFields.push(['Phone', phone]);
    if (email) gridFields.push(['Email', email]);
    if (validUntil) gridFields.push(['Valid Thru', validUntil]);
    if (customFieldValue && customFieldLabel) {
      gridFields.push([customFieldLabel, customFieldValue]);
    }

    gridFields.slice(0, 4).forEach(([lbl, val], idx) => {
      const fy = fieldsStartY + idx * fieldSpacing;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 ${Math.round(heightPx * 0.028)}px Inter, sans-serif`;
      ctx.fillText(lbl.toUpperCase(), detailsX, fy);

      ctx.fillStyle = theme.textColor;
      ctx.font = `bold ${Math.round(heightPx * 0.032)}px Inter, sans-serif`;
      ctx.fillText(val, detailsX + Math.round(widthPx * 0.18), fy, detailsMaxW - Math.round(widthPx * 0.18));
    });

    // 5. Card Outer Border
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, widthPx - 2, heightPx - 2);

    // 6. Footer Ribbon
    const footerH = Math.round(heightPx * 0.06);
    ctx.fillStyle = theme.headerBg;
    ctx.fillRect(0, heightPx - footerH, widthPx, footerH);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(heightPx * 0.026)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `OFFICIAL IDENTITY CREDENTIAL • ${organization.toUpperCase()}`,
      widthPx / 2,
      heightPx - footerH / 2
    );

    return canvas;
  }, [
    widthPx,
    heightPx,
    template,
    cardType,
    photo,
    logo,
    organization,
    fullName,
    idNumber,
    designation,
    department,
    phone,
    email,
    validUntil,
    bloodGroup,
    customFieldLabel,
    customFieldValue,
  ]);

  const renderBackCard = useCallback(async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d')!;
    const theme = TEMPLATES[template];

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 2. Header Band
    const headerHeight = Math.round(heightPx * 0.16);
    ctx.fillStyle = theme.headerBg;
    ctx.fillRect(0, 0, widthPx, headerHeight);

    ctx.fillStyle = theme.headerText;
    ctx.font = `bold ${Math.round(heightPx * 0.045)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `${(organization || 'ORGANIZATION').toUpperCase()} • TERMS & EMERGENCY`,
      widthPx / 2,
      headerHeight / 2
    );

    // Accent line
    ctx.fillStyle = theme.accentColor;
    ctx.fillRect(0, headerHeight - 3, widthPx, 3);

    // 3. Left Column: Return Address & Contact Info
    const leftColX = Math.round(widthPx * 0.05);
    const leftColW = Math.round(widthPx * 0.58);
    let curY = headerHeight + Math.round(heightPx * 0.06);

    // Return Address Section
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold ${Math.round(heightPx * 0.03)}px Inter, sans-serif`;
    ctx.fillText('ISSUING ADDRESS & CONTACT', leftColX, curY);
    curY += Math.round(heightPx * 0.045);

    ctx.fillStyle = theme.textColor;
    ctx.font = `500 ${Math.round(heightPx * 0.028)}px Inter, sans-serif`;
    const addrLines = wrapText(ctx, address || 'Address not provided', leftColW);
    addrLines.slice(0, 2).forEach(line => {
      ctx.fillText(line, leftColX, curY);
      curY += Math.round(heightPx * 0.038);
    });

    if (emergencyContact) {
      curY += 4;
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${Math.round(heightPx * 0.028)}px Inter, sans-serif`;
      ctx.fillText(`Emergency Contact: ${emergencyContact}`, leftColX, curY);
      curY += Math.round(heightPx * 0.042);
    }

    if (website) {
      ctx.fillStyle = theme.subTextColor;
      ctx.font = `500 ${Math.round(heightPx * 0.026)}px Inter, sans-serif`;
      ctx.fillText(`Portal: ${website}`, leftColX, curY);
      curY += Math.round(heightPx * 0.045);
    }

    // Instructions / Terms
    curY += 4;
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold ${Math.round(heightPx * 0.028)}px Inter, sans-serif`;
    ctx.fillText('CARDHOLDER INSTRUCTIONS', leftColX, curY);
    curY += Math.round(heightPx * 0.04);

    ctx.fillStyle = theme.subTextColor;
    ctx.font = `normal ${Math.round(heightPx * 0.024)}px Inter, sans-serif`;
    const instructionLines = instructions.split('\n');
    instructionLines.slice(0, 3).forEach(ins => {
      const wrapped = wrapText(ctx, ins, leftColW);
      wrapped.forEach(wline => {
        ctx.fillText(wline, leftColX, curY);
        curY += Math.round(heightPx * 0.032);
      });
    });

    if (terms) {
      curY += 2;
      ctx.fillStyle = '#64748b';
      ctx.font = `italic ${Math.round(heightPx * 0.022)}px Inter, sans-serif`;
      const termLines = wrapText(ctx, terms, leftColW);
      termLines.slice(0, 2).forEach(tLine => {
        ctx.fillText(tLine, leftColX, curY);
        curY += Math.round(heightPx * 0.028);
      });
    }

    // 4. Right Column: QR Code & Signatory
    const rightColX = Math.round(widthPx * 0.67);
    const rightColW = Math.round(widthPx * 0.28);
    const qrSize = rightColW;
    const qrY = headerHeight + Math.round(heightPx * 0.06);

    // QR Code
    if (showQrCode) {
      let qrPayload = `ID:${idNumber};NAME:${fullName};ORG:${organization};VERIFY:${website}`;
      if (qrType === 'url') qrPayload = customQrUrl || website;
      if (qrType === 'id') qrPayload = idNumber;

      try {
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: qrSize * 2,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        const qrImg = await loadImageAsync(qrDataUrl);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        roundRect(ctx, rightColX, qrY, qrSize, qrSize, 6, true, true);
        ctx.drawImage(qrImg, rightColX + 4, qrY + 4, qrSize - 8, qrSize - 8);

        ctx.fillStyle = '#64748b';
        ctx.font = `600 ${Math.round(heightPx * 0.022)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO VERIFY', rightColX + qrSize / 2, qrY + qrSize + 12);
      } catch {
        // Fallback
      }
    }

    // Signatory Area (Bottom Right)
    const sigY = heightPx - Math.round(heightPx * 0.24);
    if (signatureImage) {
      try {
        const sigImg = await loadImageAsync(signatureImage);
        ctx.drawImage(sigImg, rightColX, sigY - 25, rightColW, Math.round(heightPx * 0.12));
      } catch {
        // fallback
      }
    }
    // Signature Line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rightColX, sigY + Math.round(heightPx * 0.08));
    ctx.lineTo(rightColX + rightColW, sigY + Math.round(heightPx * 0.08));
    ctx.stroke();

    ctx.fillStyle = theme.textColor;
    ctx.font = `600 ${Math.round(heightPx * 0.024)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      signatoryText || 'Authorized Signatory',
      rightColX + rightColW / 2,
      sigY + Math.round(heightPx * 0.11)
    );

    // 5. Barcode Section (Bottom Left / Center)
    if (showBarcode) {
      const barcodeDataToUse = customBarcodeData.trim() || idNumber || '1029384756';
      try {
        const bCanvas = generateBarcodeCanvas({
          format: barcodeFormat,
          data: barcodeDataToUse,
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 10,
          margin: 2,
          background: '#ffffff',
          lineColor: '#000000',
        });
        const bcW = Math.round(widthPx * 0.55);
        const bcH = Math.round(heightPx * 0.14);
        const bcX = leftColX;
        const bcY = heightPx - bcH - Math.round(heightPx * 0.06);

        ctx.drawImage(bCanvas, bcX, bcY, bcW, bcH);
      } catch {
        // Fallback
      }
    }

    // 6. Border
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, widthPx - 2, heightPx - 2);

    return canvas;
  }, [
    widthPx,
    heightPx,
    template,
    organization,
    address,
    emergencyContact,
    website,
    instructions,
    terms,
    signatoryText,
    signatureImage,
    showQrCode,
    qrType,
    customQrUrl,
    idNumber,
    fullName,
    showBarcode,
    customBarcodeData,
    barcodeFormat,
  ]);

  // Update Live Canvases
  const updateCanvases = useCallback(async () => {
    try {
      const fCanvas = await renderFrontCard();
      const bCanvas = await renderBackCard();

      if (frontCanvasRef.current) {
        frontCanvasRef.current.width = fCanvas.width;
        frontCanvasRef.current.height = fCanvas.height;
        const ctx = frontCanvasRef.current.getContext('2d');
        ctx?.drawImage(fCanvas, 0, 0);
      }

      if (backCanvasRef.current) {
        backCanvasRef.current.width = bCanvas.width;
        backCanvasRef.current.height = bCanvas.height;
        const ctx = backCanvasRef.current.getContext('2d');
        ctx?.drawImage(bCanvas, 0, 0);
      }
    } catch (err) {
      console.error('Error rendering ID card canvases:', err);
    }
  }, [renderFrontCard, renderBackCard]);

  useEffect(() => {
    updateCanvases();
  }, [updateCanvases]);

  // ─── Step 7: Generate ID Card Button ────────────────────────────────────────
  const handleGenerate = async () => {
    setValidationError(null);
    if (!fullName.trim()) {
      setValidationError('Please enter Cardholder Full Name.');
      return;
    }
    if (!idNumber.trim()) {
      setValidationError('Please enter an ID / Roll Number.');
      return;
    }

    setIsGenerating(true);
    try {
      await updateCanvases();
      setIsGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Step 8: Download Options ───────────────────────────────────────────────
  const handleDownloadFrontPng = async () => {
    const canvas = await renderFrontCard();
    const outName = `${fullName.replace(/\s+/g, '_')}_ID_Front.png`;
    downloadCanvasAsImage(canvas, `${fullName.replace(/\s+/g, '_')}_ID_Front`, 'png');
    await recordToolHistorySafely({
      tool: 'id-card-form-generator',
      toolName: 'ID Card Form Generator',
      inputFiles: [{ name: `${fullName}_data.json`, type: 'application/json' }],
      outputFile: { name: outName, type: 'image/png' },
      status: 'completed',
      metadata: { side: 'front', cardType, fullName, idNumber, template },
    });
  };

  const handleDownloadBackPng = async () => {
    const canvas = await renderBackCard();
    const outName = `${fullName.replace(/\s+/g, '_')}_ID_Back.png`;
    downloadCanvasAsImage(canvas, `${fullName.replace(/\s+/g, '_')}_ID_Back`, 'png');
    await recordToolHistorySafely({
      tool: 'id-card-form-generator',
      toolName: 'ID Card Form Generator',
      inputFiles: [{ name: `${fullName}_data.json`, type: 'application/json' }],
      outputFile: { name: outName, type: 'image/png' },
      status: 'completed',
      metadata: { side: 'back', cardType, fullName, idNumber, template },
    });
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const fCanvas = await renderFrontCard();
      const bCanvas = await renderBackCard();

      const doc = new jsPDF({
        orientation: cardWidthMm > cardHeightMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [cardWidthMm, cardHeightMm],
        compress: true,
      });

      // Front Page
      const fData = fCanvas.toDataURL('image/jpeg', 0.98);
      doc.addImage(fData, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');

      // Back Page
      doc.addPage([cardWidthMm, cardHeightMm], cardWidthMm > cardHeightMm ? 'landscape' : 'portrait');
      const bData = bCanvas.toDataURL('image/jpeg', 0.98);
      doc.addImage(bData, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');

      const outName = `${fullName.replace(/\s+/g, '_')}_ID_Card_Dual.pdf`;
      doc.save(outName);

      await recordToolHistorySafely({
        tool: 'id-card-form-generator',
        toolName: 'ID Card Form Generator',
        inputFiles: [{ name: `${fullName}_data.json`, type: 'application/json' }],
        outputFile: { name: outName, type: 'application/pdf' },
        status: 'completed',
        metadata: { side: 'dual-pdf', cardType, fullName, idNumber, template },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Step 9: Print ID Card ──────────────────────────────────────────────────
  const handlePrint = async () => {
    const fCanvas = await renderFrontCard();
    const bCanvas = await renderBackCard();
    const fData = fCanvas.toDataURL('image/png');
    const bData = bCanvas.toDataURL('image/png');

    recordToolHistorySafely({
      tool: 'id-card-form-generator',
      toolName: 'ID Card Form Generator',
      inputFiles: [{ name: `${fullName}_data.json`, type: 'application/json' }],
      status: 'completed',
      metadata: { action: 'print', cardType, fullName, idNumber, template },
    }).catch(() => {});

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to enable the printing window.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ID Card — ${fullName}</title>
          <style>
            @page {
              size: auto;
              margin: 15mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #fff;
              color: #000;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }
            .header-info {
              text-align: center;
              font-size: 14px;
              color: #555;
              margin-bottom: 10px;
            }
            .cards-container {
              display: flex;
              flex-wrap: wrap;
              gap: 25px;
              justify-content: center;
            }
            .card-wrapper {
              text-align: center;
            }
            .card-label {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              color: #666;
              margin-bottom: 6px;
            }
            .card-img {
              width: ${cardWidthMm}mm;
              height: ${cardHeightMm}mm;
              border: 1px dashed #999;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              display: block;
            }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
              .card-img { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print header-info">
            <h2>ID Card Print Layout</h2>
            <p>Dimensions: ${cardWidthMm} mm × ${cardHeightMm} mm (CR80 Standard). Ready for PVC card printers or badge sheet cutting.</p>
            <button onclick="window.print()" style="padding: 8px 18px; font-weight: bold; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
              Print Now
            </button>
          </div>
          <div class="cards-container">
            <div class="card-wrapper">
              <div class="card-label">Front Side</div>
              <img src="${fData}" class="card-img" alt="Front Side" />
            </div>
            <div class="card-wrapper">
              <div class="card-label">Back Side</div>
              <img src="${bData}" class="card-img" alt="Back Side" />
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">
              ID Card Tools
            </Link>
            <span>/</span>
            <span className="text-teal-400">ID Card Form Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                ID Card Form Generator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Front + Back
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Fill form details to automatically generate, preview, and download professional two-sided ID cards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side Private
          </span>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>{showGuide ? 'Hide Guide' : 'How to Use'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <Link to="/tools">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Informational Step-by-Step Guide ── */}
      {showGuide && (
        <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              How to Use / Step-by-Step Process
            </h3>
            <span className="text-xs text-slate-400">9 Simple Steps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs text-slate-300">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 1:</span>
              Select ID Card Type (Employee, Student, School, College, etc.)
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 2:</span>
              Fill Front Side Information (Name, ID, Role, Department, etc.)
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 3:</span>
              Upload Cardholder Photo and Organization Logo
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 4:</span>
              Fill Back Side Information (Address, Instructions, Signatory)
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 5:</span>
              Add QR Code / Barcode if required for scanning
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 6:</span>
              Choose Template Design & Card Dimensions
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 7:</span>
              Check Front and Back Live Preview
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 8:</span>
              Click Generate ID Card to compile high-res canvases
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-teal-400 mr-1.5">Step 9:</span>
              Download Front/Back PNG, Dual PDF, or Print directly
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {validationError && (
        <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── Main Layout: Form (Left) + Live Preview (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Form Controls (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Card Type Selector */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Step 1: Select Card Type
              </label>
              <span className="text-[11px] text-teal-400 font-medium">
                {CARD_TYPE_CONFIGS[cardType].label}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CARD_TYPE_CONFIGS) as CardType[]).map(typeKey => {
                const isSel = cardType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => handleCardTypeChange(typeKey)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between border ${
                      isSel
                        ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/20'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span>{CARD_TYPE_CONFIGS[typeKey].label.replace(' ID Card', '')}</span>
                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 ml-1 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Navigation Tabs: Front / Back / Style */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('front')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'front'
                  ? 'border-teal-400 text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Front Side Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('back')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'back'
                  ? 'border-teal-400 text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Back Side Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-teal-400 text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Template & Size
            </button>
          </div>

          {/* ── TAB 1: FRONT SIDE FORM ── */}
          {activeTab === 'front' && (
            <div className="space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg animate-fadeIn">
              {/* Photo & Logo Uploaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      Cardholder Photo
                    </label>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  {photo ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={photo}
                        alt="Cardholder"
                        className="w-14 h-16 object-cover rounded-lg border border-teal-500/40 shadow"
                      />
                      <label className="text-xs text-teal-400 hover:underline cursor-pointer">
                        Change Photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-xl cursor-pointer transition-colors bg-slate-900/40">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-300 font-medium">Upload Photo</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WebP (Max 20MB)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Logo */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-400" />
                      Organization Logo
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => setLogo(null)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  {logo ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={logo}
                        alt="Logo"
                        className="w-14 h-14 object-contain rounded-lg border border-teal-500/40 bg-white p-1 shadow"
                      />
                      <label className="text-xs text-teal-400 hover:underline cursor-pointer">
                        Change Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-xl cursor-pointer transition-colors bg-slate-900/40">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-300 font-medium">Upload Logo</span>
                      <span className="text-[10px] text-slate-500">Optional Header Crest</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Front Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
                <Input
                  label={`${CARD_TYPE_CONFIGS[cardType].defaultIdLabel} *`}
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder="e.g. EMP-2026-8941"
                  required
                />
                <Input
                  label={CARD_TYPE_CONFIGS[cardType].defaultTitleLabel}
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Software Architect"
                />
                <Input
                  label={CARD_TYPE_CONFIGS[cardType].defaultDeptLabel}
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering & AI"
                />
                <Input
                  label="Organization / Institute Name"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Global Technologies"
                  className="sm:col-span-2"
                />
                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
                <Input
                  label="Official Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. j.doe@acmeglobal.com"
                />
                <Input
                  label="Joining / Issue Date"
                  type="date"
                  value={joiningDate}
                  onChange={e => setJoiningDate(e.target.value)}
                />
                <Input
                  label="Valid Until / Expiry Date"
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                />
                <Input
                  label="Blood Group"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  placeholder="e.g. O+, A+, B+"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <Input
                    label="Custom Field Label"
                    value={customFieldLabel}
                    onChange={e => setCustomFieldLabel(e.target.value)}
                    placeholder="e.g. Security Level / House"
                  />
                  <Input
                    label="Custom Field Value"
                    value={customFieldValue}
                    onChange={e => setCustomFieldValue(e.target.value)}
                    placeholder="e.g. Clearance Level 3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: BACK SIDE FORM ── */}
          {activeTab === 'back' && (
            <div className="space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg animate-fadeIn">
              {/* Back Details */}
              <div className="space-y-4">
                <Input
                  label="Issuing Office / Return Address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Full office or campus address"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Emergency Contact / Parent Phone"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +1 555-999-0000"
                  />
                  <Input
                    label="Website / Verification Portal"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="e.g. www.acmeglobal.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Instructions / Return Policy
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="Instructions for cardholder..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Terms & Conditions / Disclaimer
                  </label>
                  <textarea
                    rows={2}
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                    placeholder="Unauthorized use or duplication is prohibited..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Authorized Signatory Title"
                    value={signatoryText}
                    onChange={e => setSignatoryText(e.target.value)}
                    placeholder="Authorized Signatory / Registrar"
                  />
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Digital Signature (Optional)
                    </label>
                    {signatureImage ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="h-9 object-contain bg-white rounded px-2"
                        />
                        <button
                          type="button"
                          onClick={() => setSignatureImage(null)}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="text-xs text-teal-400 hover:underline cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Signature Stamp</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code & Barcode Controls */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Verification & Barcode Toggles
                </h4>

                {/* QR Code Toggle */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                      <QrCode className="w-4 h-4 text-teal-400" />
                      Display QR Code on Back
                    </label>
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={e => setShowQrCode(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900 cursor-pointer"
                    />
                  </div>

                  {showQrCode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">QR Content Type</label>
                        <select
                          value={qrType}
                          onChange={e => setQrType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                        >
                          <option value="summary">Card Summary (Name + ID + Org)</option>
                          <option value="url">Verification URL</option>
                          <option value="id">ID Number Only</option>
                        </select>
                      </div>
                      {qrType === 'url' && (
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Target URL</label>
                          <input
                            type="text"
                            value={customQrUrl}
                            onChange={e => setCustomQrUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Barcode Toggle */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                      <BarChart3 className="w-4 h-4 text-teal-400" />
                      Display Barcode on Back
                    </label>
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={e => setShowBarcode(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900 cursor-pointer"
                    />
                  </div>

                  {showBarcode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Barcode Format</label>
                        <select
                          value={barcodeFormat}
                          onChange={e => setBarcodeFormat(e.target.value as BarcodeFormat)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                        >
                          <option value="CODE128">Code 128 (Standard Alphanumeric)</option>
                          <option value="CODE39">Code 39 (Letters + Numbers)</option>
                          <option value="EAN13">EAN-13 (13 Digits)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Barcode Data (Default: ID No)
                        </label>
                        <input
                          type="text"
                          value={customBarcodeData}
                          onChange={e => setCustomBarcodeData(e.target.value)}
                          placeholder={idNumber || 'Barcode data'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: TEMPLATE & CARD SIZE ── */}
          {activeTab === 'settings' && (
            <div className="space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg animate-fadeIn">
              {/* Step 5: Template Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Choose Template Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(TEMPLATES) as TemplateStyle[]).map(tplKey => {
                    const tpl = TEMPLATES[tplKey];
                    const isSel = template === tplKey;
                    return (
                      <button
                        key={tplKey}
                        type="button"
                        onClick={() => setTemplate(tplKey)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSel
                            ? 'border-teal-400 bg-teal-500/10 shadow-md shadow-teal-500/10'
                            : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className="h-4 rounded-t mb-2"
                          style={{ background: tpl.headerBg }}
                        />
                        <div className="text-xs font-bold text-white">{tpl.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                          Accent: {tpl.accentColor}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 6: Card Size */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Card Dimensions & Presets
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSize(false);
                      setCardWidthMm(CR80_WIDTH_MM);
                      setCardHeightMm(CR80_HEIGHT_MM);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !isCustomSize
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">CR80 Standard (Default)</div>
                    <div className="text-[11px] text-slate-400">85.60 mm × 53.98 mm (Standard PVC)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomSize(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCustomSize
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Custom Dimensions</div>
                    <div className="text-[11px] text-slate-400">Specify Width & Height in mm</div>
                  </button>
                </div>

                {isCustomSize && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <Input
                      label="Card Width (mm)"
                      type="number"
                      value={cardWidthMm}
                      onChange={e => setCardWidthMm(Number(e.target.value))}
                      min={40}
                      max={200}
                    />
                    <Input
                      label="Card Height (mm)"
                      type="number"
                      value={cardHeightMm}
                      onChange={e => setCardHeightMm(Number(e.target.value))}
                      min={30}
                      max={200}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Generate Action Button (Step 7) ── */}
          <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Generate Ready ID Card
                </h4>
                {isGenerated && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full font-semibold">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validate fields and compile high-resolution 300 DPI Front and Back sides.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-lg shadow-teal-500/25"
            >
              Generate ID Card
            </Button>
          </div>
        </div>

        {/* ── Right Column: Live Dual Preview & Export Actions (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            {/* Preview Viewport Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-400" />
                Front + Back Live Preview
              </span>
              <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewSide('both')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    previewSide === 'both' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide('front')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    previewSide === 'front' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide('back')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    previewSide === 'back' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Front Canvas Preview */}
            {(previewSide === 'both' || previewSide === 'front') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                    Front Side Preview
                  </span>
                  <span>{cardWidthMm} × {cardHeightMm} mm</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={frontCanvasRef}
                    className="w-full h-auto rounded-lg shadow-2xl border border-slate-700/40"
                    style={{ aspectRatio: `${cardWidthMm}/${cardHeightMm}` }}
                  />
                </div>
              </div>
            )}

            {/* Back Canvas Preview */}
            {(previewSide === 'both' || previewSide === 'back') && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                    Back Side Preview
                  </span>
                  <span>{cardWidthMm} × {cardHeightMm} mm</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={backCanvasRef}
                    className="w-full h-auto rounded-lg shadow-2xl border border-slate-700/40"
                    style={{ aspectRatio: `${cardWidthMm}/${cardHeightMm}` }}
                  />
                </div>
              </div>
            )}

            {/* ── Export & Print Actions Panel (Step 8 & Step 9) ── */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Download & Print</span>
                <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadFrontPng}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Front PNG
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadBackPng}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Back PNG
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadPdf}
                isLoading={isGenerating}
                leftIcon={<FileText className="w-4 h-4" />}
                className="w-full shadow-md shadow-teal-500/20"
              >
                Download Front + Back (PDF)
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4 text-cyan-400" />}
                className="w-full border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 text-slate-200"
              >
                Print ID Card
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Canvas Helper Functions ──────────────────────────────────────────────────
function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean = true,
  stroke: boolean = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x, y, w, h);

  // Simple avatar circle & shoulders
  ctx.fillStyle = '#94a3b8';
  const cx = x + w / 2;
  const headR = w * 0.22;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.38, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, y + h * 0.95, w * 0.45, Math.PI, 0);
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
