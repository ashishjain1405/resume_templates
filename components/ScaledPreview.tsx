'use client'

import { useRef, useState, useEffect } from 'react'
import type { ResumeData } from '@/lib/resume-data'
import ClassicPreview from '@/components/resume-previews/Classic'
import ModernPreview from '@/components/resume-previews/Modern'
import MulticolumnPreview from '@/components/resume-previews/Multicolumn'
import QuotationPreview from '@/components/resume-previews/Quotation'
import ExecutivePreview from '@/components/resume-previews/Executive'
import type React from 'react'

const PREVIEW_MAP: Record<string, React.ComponentType<{ accentColor?: string; data?: ResumeData }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  multicolumn: MulticolumnPreview,
  quotation: QuotationPreview,
  executive: ExecutivePreview,
}

const DESIGN_WIDTH = 210
const DESIGN_HEIGHT = DESIGN_WIDTH * (297 / 210) // A4: 297

interface Props {
  templateId: string
  accentColor?: string
  data?: ResumeData
}

export default function ScaledPreview({ templateId, accentColor, data }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Measure container width → scale
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width > 0) setScale(width / DESIGN_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Reset to page 1 when content or template changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data, templateId])

  // Measure total pages after layout settles
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h = innerRef.current?.scrollHeight ?? 0
      setTotalPages(Math.max(1, Math.ceil(h / DESIGN_HEIGHT)))
    })
    return () => cancelAnimationFrame(id)
  }, [scale, data, templateId])

  // Clamp current page if total pages shrinks (e.g. on resize)
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages))
  }, [totalPages])

  const Preview = PREVIEW_MAP[templateId] ?? ClassicPreview
  const offset = (currentPage - 1) * DESIGN_HEIGHT

  return (
    <div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 tabular-nums font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      <div ref={outerRef} className="relative w-full overflow-hidden" style={{ height: DESIGN_HEIGHT * scale }}>
        <div
          ref={innerRef}
          style={{
            width: DESIGN_WIDTH,
            minHeight: DESIGN_HEIGHT,
            transform: `scale(${scale}) translateY(-${offset}px)`,
            transformOrigin: 'top left',
          }}
        >
          <Preview accentColor={accentColor} data={data} />
        </div>
        {totalPages > 1 && currentPage < totalPages && (
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{ borderTop: '1.5px dashed #93c5fd' }}
          />
        )}
      </div>
    </div>
  )
}
