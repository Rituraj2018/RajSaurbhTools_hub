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
    category: 'Image',
    icon: 'Minimize2',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Aadhaar Print Studio',
    slug: 'aadhaar-print-studio',
    description:
      'Format, optimize and generate ready-to-print Aadhaar card layouts with front and back alignment.',
    category: 'Document',
    icon: 'FileCheck',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Ayushman Card Print',
    slug: 'ayushman-card-print',
    description:
      'Smart framing and enhancement utility to print PM-JAY Ayushman cards in perfect ID card proportions.',
    category: 'Document',
    icon: 'Sparkles',
    isActive: true,
    isFeatured: false,
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
      // Upsert any missing tools
      for (const toolData of INITIAL_STATIC_TOOLS) {
        const exists = await Tool.findOne({ slug: toolData.slug });
        if (!exists) {
          await Tool.create(toolData);
          console.log(`[Database Seed] Seeded missing tool: ${toolData.name}`);
        }
      }
    }
  } catch (error) {
    console.error('[Database Seed Error] Failed to seed initial tools:', error);
  }
};
