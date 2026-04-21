'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface ATSResult {
  score: number
  sections: { keywords: number; formatting: number; contact: number; achievements: number }
  missing_keywords: string[]
  suggestions: string[]
}

function ScoreRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-gray-900">{score}</div>
        <div className="text-[10px] text-gray-400 font-medium">/100</div>
      </div>
    </div>
  )
}

function SectionBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function Modal({ type, onClose }: { type: 'login_required' | 'pro_required'; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        {type === 'login_required' ? (
          <>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Sign in to continue</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Create a free account to use the ATS Checker.</p>
            <Link
              href="/auth/login?redirect=/ats-check%3Frun%3D1"
              className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Sign in / Sign up — free
            </Link>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Pro Access Required</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Upgrade once for unlimited ATS checks — ₹999, lifetime.</p>
            <Link href="/pricing" className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Get Pro Access — ₹999
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

const STORAGE_KEY = 'ats_pending'

function ATSCheckInner() {
  const searchParams = useSearchParams()
  const shouldRun = searchParams.get('run') === '1'

  const [tab, setTab] = useState<'upload' | 'paste'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<'login_required' | 'pro_required' | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const runAnalysis = useCallback(async (text: string, jd: string) => {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('resumeText', text)
      form.append('jobDescription', jd)
      const res = await fetch('/api/ats-check', { method: 'POST', body: form })
      const raw = await res.text()
      let data: { error?: string } & Partial<ATSResult> = {}
      try { data = JSON.parse(raw) } catch { /* non-JSON */ }
      if (!res.ok) {
        if (res.status === 401) setModal('login_required')
        else if (res.status === 403) setModal('pro_required')
        else setError(data.error ?? `Server error (${res.status}). Please try again.`)
        return
      }
      setResult(data as ATSResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Restore pending state when redirected back from login with ?run=1
  useEffect(() => {
    if (!shouldRun) return
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    sessionStorage.removeItem(STORAGE_KEY)
    try {
      const pending = JSON.parse(raw)
      const jd = pending.jobDescription ?? ''
      setJobDescription(jd)
      if (pending.resumeText) {
        setTab('paste')
        setResumeText(pending.resumeText)
        runAnalysis(pending.resumeText, jd)
      }
    } catch { /* ignore */ }
  }, [shouldRun, runAnalysis])

  async function handleAnalyse() {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      if (tab === 'upload' && file) {
        form.append('file', file)
      } else {
        form.append('resumeText', resumeText)
      }
      form.append('jobDescription', jobDescription)

      const res = await fetch('/api/ats-check', { method: 'POST', body: form })
      const raw = await res.text()
      let data: { error?: string } & Partial<ATSResult> = {}
      try { data = JSON.parse(raw) } catch { /* non-JSON */ }
      if (!res.ok) {
        if (res.status === 401) {
          if (tab === 'paste' && resumeText.trim()) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ resumeText, jobDescription }))
          }
          setModal('login_required')
        } else if (res.status === 403) {
          setModal('pro_required')
        } else {
          setError(data.error ?? `Server error (${res.status}). Please try again.`)
        }
        return
      }
      setResult(data as ATSResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = tab === 'upload' ? !!file : resumeText.trim().length > 50

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {modal && <Modal type={modal} onClose={() => setModal(null)} />}

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Feature
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ATS Resume Checker</h1>
        <p className="text-gray-500 max-w-xl">Upload your resume and optionally paste a job description. Get an instant ATS score with actionable improvements.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            {(['upload', 'paste'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'upload' ? 'Upload PDF' : 'Paste Text'}
              </button>
            ))}
          </div>

          {tab === 'upload' ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f) }}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-800">{file.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · <button onClick={e => { e.stopPropagation(); setFile(null) }} className="text-red-400 hover:text-red-600">Remove</button></div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Drop your PDF here or click to browse</div>
                  <div className="text-xs text-gray-400 mt-1">PDF only · max 5MB</div>
                </>
              )}
            </div>
          ) : (
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
              rows={10}
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Description <span className="text-gray-400 font-normal">(optional — improves keyword matching)</span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
              rows={5}
              placeholder="Paste the job description you're applying to..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyse}
            disabled={!canSubmit || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing your resume…
              </>
            ) : 'Analyse Resume'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
        </div>

        <div>
          {!result && !loading && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Your results will appear here</p>
                <p className="text-xs mt-1">Upload your resume and click Analyse</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] border border-gray-100 rounded-2xl p-6 space-y-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
            </div>
          )}

          {result && (
            <div className="border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-6">
                <ScoreRing score={result.score} />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {result.score >= 75 ? 'Strong resume' : result.score >= 50 ? 'Needs improvement' : 'Significant gaps found'}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">ATS Compatibility Score</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Section Breakdown</div>
                <div className="space-y-3">
                  <SectionBar label="Keyword Matching" score={result.sections.keywords} />
                  <SectionBar label="Formatting & Structure" score={result.sections.formatting} />
                  <SectionBar label="Contact Information" score={result.sections.contact} />
                  <SectionBar label="Measurable Achievements" score={result.sections.achievements} />
                </div>
              </div>

              {result.missing_keywords.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Missing Keywords</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_keywords.map(kw => (
                      <span key={kw} className="bg-red-50 text-red-600 border border-red-100 text-xs px-2.5 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">How to Improve</div>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-50">
                <Link href="/builder/multicolumn" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Apply these improvements in the Resume Builder →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ATSCheckPage() {
  return (
    <Suspense>
      <ATSCheckInner />
    </Suspense>
  )
}
