'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import { createClient } from '@/lib/supabase'
import TemplatePickerCard from '@/components/TemplatePickerCard'

export default function BuilderPickerPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('multicolumn')
  const [draftTemplateIds, setDraftTemplateIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const localDrafts = new Set(
      TEMPLATES.map(t => t.id).filter(id => localStorage.getItem(`resume_builder_${id}`))
    )
    setDraftTemplateIds(localDrafts)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('resumes')
        .select('template_id')
        .eq('user_id', data.user.id)
        .then(({ data: rows }) => {
          if (rows) setDraftTemplateIds(prev => new Set([...prev, ...rows.map((r: { template_id: string }) => r.template_id)]))
        })
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your template</h1>
        <p className="text-gray-500 text-sm">Pick a style and start building. You can change it anytime.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {TEMPLATES.map(t => (
          <TemplatePickerCard
            key={t.id}
            template={t}
            selected={selected === t.id}
            hasDraft={draftTemplateIds.has(t.id)}
            onSelect={() => setSelected(t.id)}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => router.push(`/builder/${selected}`)}
          className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Start Building →
        </button>
      </div>
    </div>
  )
}
