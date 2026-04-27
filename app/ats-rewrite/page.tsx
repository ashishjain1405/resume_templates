'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { ResumeData } from '@/lib/resume-data'
import ScaledPreview from '@/components/ScaledPreview'
import SaveNameModal from '@/components/SaveNameModal'

interface RewriteResult {
  originalData: ResumeData
  originalScore: { overall_score: number; ats_score: number; recruiter_score: number }
  rewrittenData: ResumeData
  rewrittenScore: { overall_score: number; ats_score: number; recruiter_score: number }
  comparison: unknown
  keyChanges: string[]
  accentColor: string
  templateId: string
  resumeId: string | null
  isUploadedResume?: boolean
}

function ScoreRing({ score }: { score: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-gray-900">{score}</div>
      </div>
    </div>
  )
}

function ATSRewriteInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId') ?? ''
  const [data, setData] = useState<RewriteResult | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null)
  const [showSaveNameModal, setShowSaveNameModal] = useState(false)
  const [saveNameDraft, setSaveNameDraft] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('rewrite_result')
    if (!raw) {
      router.replace('/ats-check')
      return
    }
    try {
      const parsed: RewriteResult = JSON.parse(raw)
      setData(parsed)
      if (parsed.isUploadedResume && parsed.resumeId) {
        fetch(`/api/resume/${parsed.resumeId}`)
          .then(r => r.json())
          .then(d => { if (d.url) setOriginalPdfUrl(d.url) })
          .catch(() => {})
      }
    } catch {
      router.replace('/ats-check')
    }
  }, [router])

  if (!data) return null

  const resolvedTemplateId = templateId || data.templateId

  async function handleAcceptWithName(resumeName: string) {
    if (!data) return
    setAccepting(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not logged in'); return }

      // 1. Upsert resumes (builder JSON)
      const { error: upsertError } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          template_id: data.templateId,
          data: data.rewrittenData,
          accent_color: data.accentColor,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,template_id' })
      if (upsertError) { setError('Failed to save. Please try again.'); return }

      // 2. Generate PDF from rewritten data
      const pdfRes = await fetch('/api/builder/pdf?pdf=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: data.templateId, data: data.rewrittenData, accentColor: data.accentColor }),
      })
      if (!pdfRes.ok) { setError('Failed to generate PDF. Please try again.'); return }
      const blob = await pdfRes.blob()
      const sanitized = resumeName.trim().replace(/[^a-zA-Z0-9 \-(). ]/g, '').trim() || 'My Resume'
      const name = `${sanitized.replace(/\s+/g, '_')}.pdf`
      const file = new File([blob], name, { type: 'application/pdf' })

      // 3. Upload new PDF with rewritten score
      const form = new FormData()
      form.append('file', file)
      form.append('template_id', data.templateId)
      form.append('ats_score', String(data.rewrittenScore.overall_score))
      const uploadRes = await fetch('/api/resume/upload', { method: 'POST', body: form })
      if (!uploadRes.ok) { setError('Failed to save to Dashboard. Please try again.'); return }

      // 4. Delete original file only after new upload succeeds
      if (data.resumeId) {
        await fetch(`/api/resume/${data.resumeId}`, { method: 'DELETE' })
      }

      sessionStorage.removeItem('rewrite_result')
      router.push('/dashboard?tab=resumes')
    } finally {
      setAccepting(false)
    }
  }

  function handleReject() {
    sessionStorage.removeItem('rewrite_result')
    router.back()
  }

  const origScore = data.originalScore
  const rewScore = data.rewrittenScore
  const scoreDiff = rewScore.overall_score - origScore.overall_score

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Resume Re-write</h1>
          <p className="text-sm text-gray-500 mt-1">Review the changes before saving. The AI rewritten version will replace your existing resume.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Original</div>
              <div className="flex items-center gap-4">
                <ScoreRing score={origScore.overall_score} />
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">ATS</div>
                    <div className="text-lg font-bold text-blue-600">{origScore.ats_score}</div>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Recruiter</div>
                    <div className="text-lg font-bold text-violet-600">{origScore.recruiter_score}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              {data.isUploadedResume && originalPdfUrl ? (
                <iframe
                  src={originalPdfUrl}
                  className="w-full rounded-lg border border-gray-100 shadow-sm"
                  style={{ height: '560px' }}
                  title="Original resume"
                />
              ) : (
                <div className="w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <ScaledPreview templateId={resolvedTemplateId} accentColor={data.accentColor} data={data.originalData} />
                </div>
              )}
            </div>
          </div>

          {/* Rewritten */}
          <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden ring-1 ring-blue-100">
            <div className="px-5 py-4 border-b border-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Rewritten</div>
                {scoreDiff !== 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreDiff > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {scoreDiff > 0 ? '+' : ''}{scoreDiff} pts
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <ScoreRing score={rewScore.overall_score} />
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">ATS</div>
                    <div className="text-lg font-bold text-blue-600">{rewScore.ats_score}</div>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Recruiter</div>
                    <div className="text-lg font-bold text-violet-600">{rewScore.recruiter_score}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <ScaledPreview templateId={resolvedTemplateId} accentColor={data.accentColor} data={data.rewrittenData} />
              </div>
            </div>
          </div>
        </div>

        {/* Key changes */}
        {data.keyChanges?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Changes</div>
            <ul className="space-y-2">
              {data.keyChanges.map((change, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <button
            onClick={handleReject}
            disabled={accepting}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Discard
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => {
                setSaveNameDraft(data.rewrittenData.personal?.name?.trim() || '')
                setShowSaveNameModal(true)
              }}
              disabled={accepting}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {accepting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {accepting ? 'Saving…' : 'Save to Dashboard'}
            </button>
            {!accepting && <p className="text-xs text-gray-400">Replaces your existing resume with the AI rewritten version</p>}
          </div>
        </div>
      </div>

      {showSaveNameModal && (
        <SaveNameModal
          defaultName={saveNameDraft}
          saving={accepting}
          onSave={(name) => { setShowSaveNameModal(false); handleAcceptWithName(name) }}
          onCancel={() => setShowSaveNameModal(false)}
        />
      )}
    </div>
  )
}

export default function ATSRewritePage() {
  return (
    <Suspense>
      <ATSRewriteInner />
    </Suspense>
  )
}
