'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { ResumeData } from '@/lib/resume-data'
import { buildResumeHtml } from '@/lib/build-resume-html'

const DESIGN_WIDTH = 750
const DESIGN_HEIGHT = Math.round(DESIGN_WIDTH * (297 / 210)) // 1063

interface Props {
  templateId: string
  accentColor?: string
  data?: ResumeData
}

const EMPTY_RESUME: ResumeData = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  skillCategories: [],
  awards: [],
}

export default function ScaledPreview({ templateId, accentColor = '#2563eb', data }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const html = buildResumeHtml(data ?? EMPTY_RESUME, accentColor, templateId)

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

  const measurePages = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const h = doc.documentElement.scrollHeight
    setTotalPages(Math.max(1, Math.ceil(h / DESIGN_HEIGHT)))
  }, [])

  // Clamp current page if total pages shrinks
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages))
  }, [totalPages])

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
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="Resume preview"
          onLoad={measurePages}
          style={{
            border: 'none',
            overflow: 'hidden',
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT * totalPages,
            transform: `scale(${scale}) translateY(-${offset}px)`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
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
