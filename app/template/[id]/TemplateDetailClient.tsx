'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, type Template } from '@/lib/templates'
import BuyButton from '@/components/BuyButton'
import ClassicPreview from '@/components/resume-previews/Classic'
import ModernPreview from '@/components/resume-previews/Modern'
import MulticolumnPreview from '@/components/resume-previews/Multicolumn'
import QuotationPreview from '@/components/resume-previews/Quotation'
import ExecutivePreview from '@/components/resume-previews/Executive'

const PREVIEW_MAP: Record<string, React.ComponentType<{ accentColor?: string }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  multicolumn: MulticolumnPreview,
  quotation: QuotationPreview,
  executive: ExecutivePreview,
}

interface Props {
  template: Template
  purchased: boolean
}

export default function TemplateDetailClient({ template, purchased }: Props) {
  const [selectedColor, setSelectedColor] = useState(template.colors[0])
  const Preview = PREVIEW_MAP[template.id] ?? ClassicPreview

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg" style={{ height: '520px' }}>
          <Preview accentColor={selectedColor} />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
          {template.category}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
        <p className="text-gray-500 mb-4">{template.description}</p>

        <div className="flex items-center gap-2 mb-6">
          {template.colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="w-6 h-6 rounded-full border-2 shadow transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? '#1d4ed8' : 'white',
                outline: selectedColor === color ? '2px solid #1d4ed8' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Format</span>
            <span className="font-medium">PDF</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">License</span>
            <span className="font-medium">Lifetime access</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ATS-friendly</span>
            <span className="font-medium text-green-600">Yes ✓</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="font-semibold text-gray-900">Price</span>
            <span className="font-bold text-xl text-blue-600">{formatPrice(template.price_inr)}</span>
          </div>
        </div>

        <BuyButton template={template} purchased={purchased} selectedColor={selectedColor} />

        {!purchased && (
          <p className="text-xs text-gray-400 text-center mt-3">
            One-time payment. No subscription. No expiry.
          </p>
        )}

        {!purchased && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/builder/${template.id}`}
              className="w-full block text-center border border-blue-600 text-blue-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Build resume with this template →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
