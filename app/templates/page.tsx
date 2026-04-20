import type { Metadata } from 'next'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = {
  title: 'Resume Templates',
  description: 'Browse all ATS-friendly resume templates — Classic, Modern, Multicolumn and more. One-time purchase, instant PDF & DOCX download.',
  alternates: { canonical: 'https://www.resumenow.in/templates' },
}

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates</h1>
        <p className="text-gray-500">Download once, keep forever. Available in PDF and DOCX.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
