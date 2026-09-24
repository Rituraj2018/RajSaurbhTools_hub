import { Tool, ITool } from '../models/Tool';

/**
 * Initial 7 static tool definitions for Toolix
 */
export const INITIAL_STATIC_TOOLS: Omit<ITool, 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Passport Photo Studio',
    slug: 'passport-photo-studio',
    description:
      'Create, crop, resize and arrange passport and visa size photos with standard dimensions and custom backgrounds.',
    category: 'Photo',
    icon: 'Camera',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Image to PDF',
    slug: 'image-to-pdf',
    description:
      'Convert JPG, PNG, WEBP and BMP images into high quality PDF documents with custom layout and page sizes.',
    category: 'PDF',
    icon: 'FileText',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'PDF Merge',
    slug: 'pdf-merge',
    description:
      'Combine and arrange multiple PDF documents into a single organized file in seconds.',
    category: 'PDF',
    icon: 'Layers',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'PDF Split',
    slug: 'pdf-split',
    description:
      'Split PDF files into individual pages or extract custom page ranges quickly and securely.',
    category: 'PDF',
    icon: 'Scissors',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Image Compressor',
    slug: 'image-compressor',
    description:
      'Reduce image file size with smart lossy and lossless compression while preserving visual fidelity.',
    category: 'Photo',
    icon: 'Minimize2',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Aadhaar Print Studio Pro',
    slug: 'aadhaar-print-studio',
    description:
      'Format, optimize and generate ready-to-print Aadhaar card layouts with front and back alignment.',
    category: 'Document',
    icon: 'FileCheck',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Ayushman Card Print Tool Pro',
    slug: 'ayushman-card-print',
    description:
      'Smart framing and enhancement utility to print PM-JAY Ayushman cards in perfect ID card proportions.',
    category: 'Document',
    icon: 'Sparkles',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'PAN / CR80 Print Studio Pro',
    slug: 'pan-print-studio',
    description:
      'Standardized CR80 ID card layout with dual-side NSDL/UTIITSL cropping, signature sharpening, and PVC / A4 tiling.',
    category: 'Document',
    icon: 'CreditCard',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'QR Code Studio Pro',
    slug: 'qr-generator',
    description:
      'Generate customized QR codes for UPI payments, website URLs, Wi-Fi networks, and contacts with high-res PNG, SVG and PDF export.',
    category: 'Document',
    icon: 'QrCode',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Signature Cropper',
    slug: 'signature-cropper',
    description:
      'Client-side signature crop tool with exam aspect ratios, high-res canvas rendering, and instant PNG/JPG export.',
    category: 'Photo',
    icon: 'PenTool',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    description:
      'Convert transparent and solid PNG images into compact, standard JPG pictures with custom quality and background synthesis.',
    category: 'Image',
    icon: 'FileImage',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    description:
      'Convert JPG and JPEG images into lossless, high-definition PNG format with optional background transparency.',
    category: 'Image',
    icon: 'FileImage',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'PDF to Word',
    slug: 'pdf-to-word',
    description:
      'Convert PDF files into editable Microsoft Word (.docx) documents with extracted typography and formatting.',
    category: 'PDF',
    icon: 'FileText',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Word to PDF',
    slug: 'word-to-pdf',
    description:
      'Convert Microsoft Word (.docx, .doc) documents into standardized, print-ready A4 PDF files.',
    category: 'Document',
    icon: 'FileType',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Image Resizer',
    slug: 'image-resizer',
    description:
      'Resize JPG, PNG, and WebP pictures by exact pixel dimensions or percentage while locking aspect ratio.',
    category: 'Image',
    icon: 'Maximize2',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'File Password Protector',
    slug: 'file-password-protector',
    description:
      'Password-protect PDF and image files with AES-256-GCM encryption. All processing is done locally in your browser — your password never leaves your device.',
    category: 'Security',
    icon: 'Lock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'ID Card Maker',
    slug: 'id-card-maker',
    description:
      'Full ID card creator with custom text fields, photos, dimensions, front & back templates, and instant download.',
    category: 'ID Card Tools',
    icon: 'CreditCard',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'ID Card Print Studio',
    slug: 'id-card-print-studio',
    description:
      'Prepare ready-to-print ID card layouts on A4 paper or PVC CR80 sheets with cut marks and custom margins.',
    category: 'ID Card Tools',
    icon: 'Printer',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'ID Card Photo Maker',
    slug: 'id-card-photo-maker',
    description:
      'Crop, resize, adjust brightness, contrast, and prepare photos specifically sized for ID card badges.',
    category: 'ID Card Tools',
    icon: 'Camera',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Resize',
    slug: 'id-card-resize',
    description:
      'Resize existing ID card pictures or scans to exact CR80, standard millimeter, or custom dimensions.',
    category: 'ID Card Tools',
    icon: 'Maximize2',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card PDF Generator',
    slug: 'id-card-pdf-generator',
    description:
      'Convert front and back ID card images into standardized, high-resolution print-ready PDF files.',
    category: 'ID Card Tools',
    icon: 'FileText',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Sheet Maker',
    slug: 'id-card-sheet-maker',
    description:
      'Arrange multiple employee or student ID cards on a single A4 or Letter sheet with alignment grid.',
    category: 'ID Card Tools',
    icon: 'LayoutGrid',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card QR Generator',
    slug: 'id-card-qr-generator',
    description:
      'Generate compact QR codes encoding vCards, employee IDs, URLs, or access codes for badge printing.',
    category: 'ID Card Tools',
    icon: 'QrCode',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Barcode Generator',
    slug: 'id-card-barcode-generator',
    description:
      'Generate Code128, Code39, and EAN barcodes sized and formatted specifically for ID badges.',
    category: 'ID Card Tools',
    icon: 'BarChart3',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Template Maker',
    slug: 'id-card-template-maker',
    description:
      'Design custom reusable ID card badge layouts with draggable headers, footers, and photo zones.',
    category: 'ID Card Tools',
    icon: 'Palette',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Print Preview',
    slug: 'id-card-print-preview',
    description:
      'Preview ID cards at 1:1 real-world physical size on screen with grid guides before final printing.',
    category: 'ID Card Tools',
    icon: 'Eye',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'ID Card Form Generator',
    slug: 'id-card-form-generator',
    description:
      'Fill form details to automatically generate professional two-sided (Front + Back) ID cards with QR/barcodes.',
    category: 'ID Card Tools',
    icon: 'CreditCard',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Image Cropper',
    slug: 'image-cropper',
    description:
      'Crop images with customizable aspect ratios, preset dimensions, rotation, zoom, circle crop, and instant high-quality export.',
    category: 'Crop',
    icon: 'Crop',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Image to SVG Converter',
    slug: 'image-to-svg',
    description:
      'Convert PNG, JPG, and WebP raster images into clean, scalable SVG vector graphics with smart auto vectorization and logo optimization.',
    category: 'Image',
    icon: 'Sparkles',
    isActive: true,
    isFeatured: true,
  },
];

/**
 * Seeds initial tools into MongoDB if the collection is empty or missing tools
 */
export const seedInitialTools = async (): Promise<void> => {
  try {
    const existingCount = await Tool.countDocuments();
    if (existingCount === 0) {
      await Tool.insertMany(INITIAL_STATIC_TOOLS);
      console.log(`[Database Seed] Seeded ${INITIAL_STATIC_TOOLS.length} initial tools successfully.`);
    } else {
      // Upsert any missing tools or update categories
      for (const toolData of INITIAL_STATIC_TOOLS) {
        const existing = await Tool.findOne({ slug: toolData.slug });
        if (!existing) {
          await Tool.create(toolData);
          console.log(`[Database Seed] Seeded missing tool: ${toolData.name}`);
        } else {
          // Update properties if changed (e.g. category, name)
          existing.name = toolData.name;
          existing.description = toolData.description;
          existing.category = toolData.category;
          existing.icon = toolData.icon;
          await existing.save();
        }
      }
    }
  } catch (error) {
    console.error('[Database Seed Error] Failed to seed initial tools:', error);
  }
};
