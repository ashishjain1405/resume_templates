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

// Preview components are authored at this width (derived from their px font sizes
// targeting ~10-12px body text at 2× scale on a standard A4 proportion container).
const DESIGN_WIDTH = 210

interface Props {
  templateId: string
  accentColor?: string
  data?: ResumeData
}

export default function ScaledPreview({ templateId, accentColor, data }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

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

  const Preview = PREVIEW_MAP[templateId] ?? ClassicPreview
  // A4 ratio: 210 × 297mm → height = DESIGN_WIDTH × (297/210)
  const designHeight = DESIGN_WIDTH * (297 / 210)

  return (
    <div ref={outerRef} className="w-full overflow-hidden" style={{ height: designHeight * scale }}>
      <div style={{ width: DESIGN_WIDTH, height: designHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Preview accentColor={accentColor} data={data} />
      </div>
    </div>
  )
}
