'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatPrice, type Template } from '@/lib/templates'
import ClassicPreview from './resume-previews/Classic'
import ModernPreview from './resume-previews/Modern'
import MulticolumnPreview from './resume-previews/Multicolumn'
import QuotationPreview from './resume-previews/Quotation'
import ExecutivePreview from './resume-previews/Executive'

const PREVIEW_MAP: Record<string, React.ComponentType<{ accentColor?: string }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  multicolumn: MulticolumnPreview,
  quotation: QuotationPreview,
  executive: ExecutivePreview,
}

interface Props {
  template: Template
  purchased?: boolean
}

export default function TemplateCard({ template, purchased }: Props) {
  const [activeColor, setActiveColor] = useState(template.colors[0])
  const Preview = PREVIEW_MAP[template.id] ?? ClassicPreview

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Resume preview */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: '260px' }}>
        <div className="absolute inset-0 transform scale-100 origin-top">
          <Preview accentColor={activeColor} />
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md" style={{ backgroundColor: activeColor }}>
          {formatPrice(template.price_inr)}
        </div>

        {purchased && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Owned
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3 border-t border-gray-100">
        {/* Color swatches */}
        <div className="flex items-center gap-1 mb-2">
          {template.colors.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              title={color}
              className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 focus:outline-none"
              style={{
                backgroundColor: color,
                boxShadow: activeColor === color ? `0 0 0 2px white, 0 0 0 3px ${color}` : 'none',
              }}
            />
          ))}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{template.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{template.category}</p>

        <div className="flex gap-1.5">
          <Link
            href={`/template/${template.id}`}
            className="flex-1 text-center text-xs border border-gray-300 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Preview
          </Link>
          {purchased ? (
            <a
              href={`/api/download/${template.id}?format=pdf`}
              className="flex-1 text-center text-xs bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Download
            </a>
          ) : (
            <Link
              href={`/template/${template.id}`}
              className="flex-1 text-center text-xs text-white py-1.5 rounded-lg transition-colors font-medium"
              style={{ backgroundColor: activeColor }}
            >
              Select
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
