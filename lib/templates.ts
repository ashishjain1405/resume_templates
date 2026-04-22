export interface Template {
  id: string
  name: string
  description: string
  price_inr: number
  preview_image: string
  storage_path_pdf: string
  storage_path_docx: string
  category: string
  tag: string
  colors: string[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'multicolumn',
    name: 'Multicolumn',
    description: 'Two-column layout that fits more content without feeling cluttered.',
    price_inr: 24900,
    preview_image: '/previews/multicolumn.png',
    storage_path_pdf: 'templates/multicolumn.pdf',
    storage_path_docx: 'templates/multicolumn.docx',
    category: 'Creative',
    tag: 'Best for tech & creative roles',
    colors: ['#2c3e50', '#8e44ad', '#2980b9', '#27ae60', '#e74c3c'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A timeless, clean layout trusted by professionals across industries.',
    price_inr: 9900,
    preview_image: '/previews/classic.png',
    storage_path_pdf: 'templates/classic.pdf',
    storage_path_docx: 'templates/classic.docx',
    category: 'Classic',
    tag: 'Clean, ATS-safe, all industries',
    colors: ['#1e3a5f', '#2d6a9f', '#4a9ede', '#7bbfe8', '#b0d9f5'],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold sidebar design that makes your profile stand out instantly.',
    price_inr: 19900,
    preview_image: '/previews/modern.png',
    storage_path_pdf: 'templates/modern.pdf',
    storage_path_docx: 'templates/modern.docx',
    category: 'Modern',
    tag: 'Stand out with a bold sidebar',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
  },
  {
    id: 'quotation',
    name: 'Quotation',
    description: 'Elegant minimal design with a personal touch for creative roles.',
    price_inr: 14900,
    preview_image: '/previews/quotation.png',
    storage_path_pdf: 'templates/quotation.pdf',
    storage_path_docx: 'templates/quotation.docx',
    category: 'Minimal',
    tag: 'Minimal & elegant for creatives',
    colors: ['#f5f0e8', '#d4a853', '#8b7355', '#4a3728', '#2c1810'],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Premium layout for senior professionals and C-suite executives.',
    price_inr: 49900,
    preview_image: '/previews/executive.png',
    storage_path_pdf: 'templates/executive.pdf',
    storage_path_docx: 'templates/executive.docx',
    category: 'Professional',
    tag: 'Senior professionals & C-suite',
    colors: ['#0a0a0a', '#1c1c1c', '#2d2d2d', '#8a7d6b', '#c9b99a'],
  },
]

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`
}
