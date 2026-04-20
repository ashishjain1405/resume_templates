'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatPrice, type Template } from '@/lib/templates'

interface Props {
  template: Template
  purchased?: boolean
}

export default function TemplateCard({ template, purchased }: Props) {
  const [activeColor, setActiveColor] = useState(template.colors[0])

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Preview area with colored header */}
      <div className="relative bg-gray-50 aspect-[3/4] flex flex-col overflow-hidden">
        {/* Colored top bar */}
        <div className="h-8 w-full transition-colors duration-300" style={{ backgroundColor: activeColor }} />

        {/* Resume lines */}
        <div className="flex-1 p-4 space-y-2">
          <div className="h-2 bg-gray-200 rounded w-2/3" />
          <div className="h-1.5 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="space-y-1">
            <div className="h-1 bg-gray-100 rounded w-full" />
            <div className="h-1 bg-gray-100 rounded w-5/6" />
            <div className="h-1 bg-gray-100 rounded w-4/5" />
          </div>
          <div className="pt-2 space-y-1">
            <div className="h-1 bg-gray-200 rounded w-1/3" />
            <div className="h-1 bg-gray-100 rounded w-full" />
            <div className="h-1 bg-gray-100 rounded w-3/4" />
            <div className="h-1 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="pt-2 space-y-1">
            <div className="h-1 bg-gray-200 rounded w-1/4" />
            <div className="h-1 bg-gray-100 rounded w-full" />
            <div className="h-1 bg-gray-100 rounded w-2/3" />
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow transition-colors duration-300" style={{ backgroundColor: activeColor }}>
          {formatPrice(template.price_inr)}
        </div>

        {purchased && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Owned
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3">
        {/* Color swatches */}
        <div className="flex items-center gap-1 mb-2">
          {template.colors.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className="w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-125 focus:outline-none"
              style={{
                backgroundColor: color,
                borderColor: activeColor === color ? color : 'transparent',
                boxShadow: activeColor === color ? `0 0 0 1px ${color}` : 'none',
              }}
            />
          ))}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{template.category}</p>

        <div className="flex gap-1.5">
          <Link
            href={`/template/${template.id}`}
            className="flex-1 text-center text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview
          </Link>
          {purchased ? (
            <a
              href={`/api/download/${template.id}?format=pdf`}
              className="flex-1 text-center text-xs bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download
            </a>
          ) : (
            <Link
              href={`/template/${template.id}`}
              className="flex-1 text-center text-xs text-white py-1.5 rounded-lg transition-colors"
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
