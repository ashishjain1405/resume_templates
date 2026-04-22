'use client'

import { useState } from 'react'
import type { Template } from '@/lib/templates'
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
  selected: boolean
  onSelect: () => void
}

export default function TemplatePickerCard({ template, selected, onSelect }: Props) {
  const [activeColor, setActiveColor] = useState(template.colors[0])
  const Preview = PREVIEW_MAP[template.id] ?? ClassicPreview

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md ${
        selected ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Live preview */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: '220px' }}>
        <div className="absolute inset-0 origin-top">
          <Preview accentColor={activeColor} />
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3 border-t border-gray-100">
        {/* Color swatches */}
        <div className="flex items-center gap-1 mb-2" onClick={e => e.stopPropagation()}>
          {template.colors.map(color => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 focus:outline-none"
              style={{
                backgroundColor: color,
                boxShadow: activeColor === color ? `0 0 0 2px white, 0 0 0 3px ${color}` : 'none',
              }}
            />
          ))}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{template.name}</h3>
        <span className="inline-block mt-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {template.tag}
        </span>
      </div>
    </div>
  )
}
