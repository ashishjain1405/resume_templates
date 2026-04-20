'use client'

import Link from 'next/link'
import { formatPrice, type Template } from '@/lib/templates'

interface Props {
  template: Template
  purchased?: boolean
}

export default function TemplateCard({ template, purchased }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative bg-gray-50 aspect-[3/4] flex items-center justify-center overflow-hidden">
        <div className="w-full h-full p-6 flex flex-col gap-2">
          <div className="h-3 bg-gray-700 rounded w-1/2" />
          <div className="h-2 bg-blue-400 rounded w-1/3" />
          <div className="border-t border-gray-200 pt-2 space-y-1">
            <div className="h-1.5 bg-gray-200 rounded w-full" />
            <div className="h-1.5 bg-gray-200 rounded w-5/6" />
            <div className="h-1.5 bg-gray-200 rounded w-4/5" />
          </div>
          <div className="border-t border-gray-200 pt-2 space-y-1">
            <div className="h-1.5 bg-gray-300 rounded w-1/3" />
            <div className="h-1.5 bg-gray-200 rounded w-full" />
            <div className="h-1.5 bg-gray-200 rounded w-5/6" />
            <div className="h-1.5 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="border-t border-gray-200 pt-2 space-y-1">
            <div className="h-1.5 bg-gray-300 rounded w-1/4" />
            <div className="h-1.5 bg-gray-200 rounded w-full" />
            <div className="h-1.5 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {formatPrice(template.price_inr)}
        </div>
        {purchased && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Owned
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          {template.colors.map((color) => (
            <div
              key={color}
              className="w-4 h-4 rounded-full border border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>

        <div className="flex gap-2">
          <Link
            href={`/template/${template.id}`}
            className="flex-1 text-center text-sm border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview
          </Link>
          {purchased ? (
            <a
              href={`/api/download/${template.id}?format=pdf`}
              className="flex-1 text-center text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download
            </a>
          ) : (
            <Link
              href={`/template/${template.id}`}
              className="flex-1 text-center text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
