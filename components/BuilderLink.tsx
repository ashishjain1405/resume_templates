'use client'

import { useRouter } from 'next/navigation'

const TEMPLATE_IDS = ['multicolumn', 'classic', 'modern', 'quotation', 'executive']

export function getBuilderHref(): string {
  if (typeof window === 'undefined') return '/builder'
  const last = localStorage.getItem('resume_builder_last_template')
  if (last && TEMPLATE_IDS.includes(last)) return `/builder/${last}`
  for (const id of TEMPLATE_IDS) {
    if (localStorage.getItem(`resume_builder_${id}`)) return `/builder/${id}`
  }
  return '/builder'
}

export default function BuilderLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <button onClick={() => router.push(getBuilderHref())} className={className}>
      {children}
    </button>
  )
}
