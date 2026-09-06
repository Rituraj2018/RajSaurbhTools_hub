import { Tool, ITool } from '../models/Tool';

/**
 * Initial 7 static tool definitions for RajSaurbh Tools_Hub
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
