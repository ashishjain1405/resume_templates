'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ProBadge from '@/components/ProBadge'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'
import { createClient } from '@/lib/supabase'

interface ATSResult {
  score: number
  sections: { keywords: number; formatting: number; contact: number; achievements: number }
  missing_keywords: string[]
  suggestions: string[]
  _usage?: { used: number; limit: number } | null
}

interface UploadedResume {
  id: string
  filename: string
  mime_type: string
  size_bytes: number
  created_at: string
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

function Modal({ type, onClose, userEmail }: { type: 'login_required' | 'pro_required' | 'pro_docs'; onClose: () => void; userEmail?: string }) {
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
            <Link href="/auth/login?redirect=/ats-check" className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Sign in / Sign up — free
            </Link>
          </>
        ) : type === 'pro_docs' ? (
          <>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Pro feature</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Editing your resume in Google Docs is available on Pro. Upgrade once for lifetime access — ₹999.</p>
            <ProUpgradeCTAs layout="stack" userEmail={userEmail} source="ats" />
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Free limit reached</h3>
            <p className="text-sm text-gray-500 text-center mb-5">You've used all 5 free checks. Upgrade once for unlimited ATS checks — ₹999, lifetime.</p>
            <ProUpgradeCTAs layout="stack" userEmail={userEmail} source="ats" />
          </>
        )}
      </div>
    </div>
  )
}

const STORAGE_KEY = 'ats_pending'
const FREE_LIMIT = 5

function ATSCheckInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'upload' | 'paste' | 'saved'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<'login_required' | 'pro_required' | 'pro_docs' | null>(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [editLoading, setEditLoading] = useState(false)
  const [savedResumes, setSavedResumes] = useState<UploadedResume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [savingToDashboard, setSavingToDashboard] = useState(false)
  const [savedToDashboard, setSavedToDashboard] = useState(false)
  const [saveCount, setSaveCount] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // On mount: check pro status, fetch usage, load saved resumes
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserEmail(data.user.email)
      const { data: row } = await supabase.from('pro_access').select('id').eq('user_id', data.user.id).maybeSingle()
      const pro = !!row
      setIsPro(pro)
      if (!pro) {
        const { count } = await supabase.from('ats_checks').select('id', { count: 'exact', head: true }).eq('user_id', data.user.id)
        setUsage({ used: count ?? 0, limit: FREE_LIMIT })
      }
      // Load saved resumes
      fetch('/api/resume/list').then(r => r.json()).then(d => setSavedResumes(d.resumes ?? []))
    })
  }, [])

  // Load resume from dashboard "Check ATS" link (?resumeId=) and auto-analyse
  useEffect(() => {
    const resumeId = searchParams.get('resumeId')
    if (!resumeId) return
    fetch(`/api/resume/${resumeId}`)
      .then(r => r.json())
      .then(async data => {
        if (!data.url) return
        const resp = await fetch(data.url)
        const blob = await resp.blob()
        const contentType = blob.type || 'application/pdf'
        const filename = data.filename ?? (contentType.includes('pdf') ? 'resume.pdf' : 'resume.docx')
        const f = new File([blob], filename, { type: contentType })
        setFile(f)
        setTab('upload')
        // Auto-trigger analysis
        setError('')
        setLoading(true)
        setResult(null)
        const form = new FormData()
        form.append('file', f)
        try {
          const res = await fetch('/api/ats-check', { method: 'POST', body: form })
          const raw = await res.text()
          let parsed: { error?: string; _usage?: { used: number; limit: number } | null } & Partial<ATSResult> = {}
          try { parsed = JSON.parse(raw) } catch { /* ignore */ }
          if (!res.ok) {
            if (res.status === 403) setModal('pro_required')
            else if (res.status === 401) setModal('login_required')
            else setError(parsed.error ?? `Error ${res.status}`)
          } else {
            setResult(parsed as ATSResult)
            if (parsed._usage) setUsage(parsed._usage)
            setSaveCount(0)
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Something went wrong.')
        } finally {
          setLoading(false)
        }
      })
      .catch(() => {})
  }, [searchParams])

  // Restore pending state on mount — fires after login redirect returns to this page
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    sessionStorage.removeItem(STORAGE_KEY)
    try {
      const pending = JSON.parse(raw)
      const jd = pending.jobDescription ?? ''
      setJobDescription(jd)
      const autoAnalyse = (form: FormData) => {
        setLoading(true)
        fetch('/api/ats-check', { method: 'POST', body: form })
          .then(r => r.text())
          .then(txt => {
            try {
              const data = JSON.parse(txt)
              if (data.score !== undefined) setResult(data)
              else if (data.error) setError(data.error)
            } catch { setError('Analysis failed. Please try again.') }
          })
          .catch(() => setError('Something went wrong. Please try again.'))
          .finally(() => setLoading(false))
      }

      if (pending.fromBuilder && pending.data) {
        const d = pending.data
        const lines: string[] = []
        const p = d.personal ?? {}
        if (p.name) lines.push(p.name)
        if (p.title) lines.push(p.title)
        if (p.email) lines.push(p.email)
        if (p.phone) lines.push(p.phone)
        if (p.location) lines.push(p.location)
        if (p.linkedin) lines.push(p.linkedin)
        for (const exp of d.experience ?? []) {
          lines.push(`${exp.role} at ${exp.company} (${exp.startDate}–${exp.endDate})`)
          for (const b of exp.bullets ?? []) if (b.trim()) lines.push(b)
        }
        for (const edu of d.education ?? []) {
          lines.push(`${edu.degree}, ${edu.institution}, ${edu.year}`)
        }
        if ((d.skills ?? []).length) lines.push('Skills: ' + d.skills.join(', '))
        const text = lines.join('\n')
        setTab('paste')
        setResumeText(text)
        const form = new FormData()
        form.append('resumeText', text)
        autoAnalyse(form)
        // Also generate PDF in background so "Save to Dashboard" uploads a proper PDF
        if (pending.templateId) {
          fetch('/api/builder/pdf?pdf=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId: pending.templateId, data: d, accentColor: pending.accentColor }),
          })
            .then(r => r.ok ? r.blob() : null)
            .then(blob => {
              if (blob) {
                const name = `${p.name?.replace(/\s+/g, '_') || 'resume'}_${pending.templateId}.pdf`
                setFile(new File([blob], name, { type: 'application/pdf' }))
              }
            })
            .catch(() => {/* file stays null, save will fall back to txt */})
        }
      } else if (pending.tab === 'paste' && pending.resumeText) {
        setTab('paste')
        setResumeText(pending.resumeText)
        const form = new FormData()
        form.append('resumeText', pending.resumeText)
        form.append('jobDescription', jd)
        autoAnalyse(form)
      } else if (pending.tab === 'upload' && pending.fileData) {
        setTab('upload')
        // Reconstruct File from base64 data URL
        fetch(pending.fileData)
          .then(r => r.blob())
          .then(blob => {
            const restoredFile = new File([blob], pending.fileName ?? 'resume.pdf', { type: pending.fileType ?? 'application/pdf' })
            setFile(restoredFile)
            const form = new FormData()
            form.append('file', restoredFile)
            form.append('jobDescription', jd)
            autoAnalyse(form)
          })
          .catch(() => setInfo('Resume could not be restored — please re-upload.'))
      } else if (pending.tab === 'upload') {
        setTab('upload')
        setInfo('You\'re signed in — re-upload your PDF and click Analyse.')
      }
    } catch { /* ignore */ }
  }, [])

  // Warn before tab close / hard navigation when result is unsaved
  useEffect(() => {
    if (!result || saveCount > 0) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [result, saveCount])

  // Intercept in-app link clicks when result is unsaved
  useEffect(() => {
    if (!result || saveCount > 0) return
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || anchor.getAttribute('target') === '_blank') return
      e.preventDefault()
      setPendingNavUrl(href)
      setShowSaveModal(true)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [result, saveCount])

  async function handleAnalyse() {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      if (tab === 'upload' && file) {
        form.append('file', file)
      } else if (tab === 'saved' && selectedResumeId) {
        // Fetch signed URL, download file, attach
        const urlRes = await fetch(`/api/resume/${selectedResumeId}`)
        const urlData = await urlRes.json()
        if (!urlData.url) { setError('Could not load saved resume.'); return }
        const resp = await fetch(urlData.url)
        const blob = await resp.blob()
        const resume = savedResumes.find(r => r.id === selectedResumeId)
        form.append('file', blob, resume?.filename ?? 'resume.pdf')
      } else {
        form.append('resumeText', resumeText)
      }
      form.append('jobDescription', jobDescription)

      const res = await fetch('/api/ats-check', { method: 'POST', body: form })
      const raw = await res.text()
      let data: { error?: string; _usage?: { used: number; limit: number } | null } & Partial<ATSResult> = {}
      try { data = JSON.parse(raw) } catch { /* non-JSON */ }
      if (!res.ok) {
        if (res.status === 401) {
          if (tab === 'paste' && resumeText.trim()) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tab: 'paste', resumeText, jobDescription }))
          } else if (tab === 'upload' && file) {
            // Encode file as base64 so it survives the auth redirect
            const reader = new FileReader()
            reader.onload = () => {
              sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                tab: 'upload',
                jobDescription,
                fileData: reader.result as string,
                fileName: file.name,
                fileType: file.type,
              }))
              setModal('login_required')
            }
            reader.readAsDataURL(file)
            return
          }
          setModal('login_required')
        } else if (res.status === 403) {
          setModal('pro_required')
        } else {
          setError(data.error ?? `Server error (${res.status}). Please try again.`)
        }
        return
      }
      const atsResult = data as ATSResult
      setResult(atsResult)
      setSaveCount(0)
      if (atsResult._usage) setUsage(atsResult._usage)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = tab === 'upload' ? !!file : tab === 'saved' ? !!selectedResumeId : resumeText.trim().length > 50
  const limitReached = !isPro && usage !== null && usage.used >= usage.limit

  async function handleSaveToDashboard() {
    setSavingToDashboard(true)
    try {
      let fileToUpload: File | null = null
      const version = saveCount + 1
      const versionSuffix = version > 1 ? `_v${version}` : ''

      if (file) {
        const base = file.name.replace(/\.[^.]+$/, '')
        const ext = file.name.split('.').pop() ?? 'pdf'
        fileToUpload = new File([file], `${base}${versionSuffix}.${ext}`, { type: file.type })
      } else if (tab === 'saved' && selectedResumeId) {
        const urlRes = await fetch(`/api/resume/${selectedResumeId}`)
        const urlData = await urlRes.json()
        if (!urlData.url) return
        const resp = await fetch(urlData.url)
        const blob = await resp.blob()
        const resume = savedResumes.find(r => r.id === selectedResumeId)
        const origName = urlData.filename ?? resume?.filename ?? 'resume.pdf'
        const base = origName.replace(/\.[^.]+$/, '')
        const ext = origName.split('.').pop() ?? 'pdf'
        fileToUpload = new File([blob], `${base}${versionSuffix}.${ext}`, { type: blob.type || 'application/pdf' })
      } else if (tab === 'paste' && resumeText.trim()) {
        const blob = new Blob([resumeText], { type: 'text/plain' })
        fileToUpload = new File([blob], `resume${versionSuffix}.txt`, { type: 'text/plain' })
      }
      if (!fileToUpload) return
      const form = new FormData()
      form.append('file', fileToUpload)
      await fetch('/api/resume/upload', { method: 'POST', body: form })
      setSaveCount(c => c + 1)
      setSavedToDashboard(true)
      setTimeout(() => setSavedToDashboard(false), 3000)
    } finally {
      setSavingToDashboard(false)
    }
  }

  async function handleEditInDocs() {
    if (!isPro) { setModal('pro_docs'); return }
    setEditLoading(true)
    try {
      const form = new FormData()
      if (tab === 'upload' && file) {
        form.append('file', file)
      } else {
        const blob = new Blob([resumeText], { type: 'text/plain' })
        form.append('file', blob, 'resume.txt')
      }
      const res = await fetch('/api/resume/edit', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
      else setError(data.error ?? 'Failed to open in Google Docs')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload PDF' },
    { id: 'paste' as const, label: 'Paste Text' },
    ...(savedResumes.length > 0 ? [{ id: 'saved' as const, label: 'My Resumes' }] : []),
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {modal && <Modal type={modal} onClose={() => setModal(null)} userEmail={userEmail} />}

      {showSaveModal && saveCount === 0 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Save your ATS results?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Your score and suggestions will be gone once you leave this page.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await handleSaveToDashboard()
                  setShowSaveModal(false)
                  if (pendingNavUrl) window.location.href = pendingNavUrl
                }}
                disabled={savingToDashboard}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {savingToDashboard ? 'Saving…' : 'Save to Dashboard'}
              </button>
              <button
                onClick={() => { setShowSaveModal(false); if (pendingNavUrl) window.location.href = pendingNavUrl }}
                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATS Resume Checker</h1>
          <p className="text-gray-500 max-w-xl">Upload your resume and optionally paste a job description. Get an instant ATS score with actionable improvements.</p>
        </div>
        {limitReached && (
          <div className="flex items-center gap-2">
            <ProBadge />
            <span className="text-xs text-gray-500">Free limit reached</span>
          </div>
        )}
        {!isPro && usage && !limitReached && (() => {
          const remaining = usage.limit - usage.used
          const isWarning = remaining <= 2
          return (
            <div className={`text-xs px-3 py-1.5 rounded-full border ${isWarning ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {remaining === 1 ? 'Last free check' : `${remaining} free checks remaining`}
            </div>
          )
        })()}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'upload' && (
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
          )}

          {tab === 'paste' && (
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
              rows={10}
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          )}

          {tab === 'saved' && (
            <div className="space-y-2">
              {savedResumes.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${selectedResumeId === r.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.mime_type === 'application/pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{r.filename}</div>
                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {selectedResumeId === r.id && (
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
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

          {limitReached ? (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-center">
              <p className="text-sm font-semibold text-amber-800 mb-1">You've used all 5 free checks</p>
              <p className="text-xs text-amber-600 mb-3">Upgrade to Pro for unlimited ATS checks — ₹999, one-time.</p>
              <div className="flex justify-center">
                <ProUpgradeCTAs layout="row" userEmail={userEmail} source="ats" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleAnalyse}
              disabled={!canSubmit || loading}
              className={`w-full py-3 rounded-xl font-semibold transition-colors text-sm flex items-center justify-center gap-2 ${canSubmit && !loading ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Analysing your resume…
                </>
              ) : 'Analyse Resume'}
            </button>
          )}

          {info && <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">{info}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
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
              <div className="flex gap-2">
                <button
                  onClick={handleEditInDocs}
                  disabled={editLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  Edit in Google Docs
                  {!isPro && <ProBadge />}
                </button>
                <button
                  onClick={handleSaveToDashboard}
                  disabled={savingToDashboard}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {savingToDashboard ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  ) : savedToDashboard ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  )}
                  {savedToDashboard ? 'Saved to Dashboard' : 'Save to Dashboard'}
                </button>
              </div>

              <div className="flex items-center gap-6">
                <ScoreRing score={result.score} />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {result.score >= 75 ? 'Strong resume' : result.score >= 50 ? 'Needs improvement' : 'Significant gaps found'}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">ATS Compatibility Score</div>
                  {result._usage && (
                    <div className="text-xs text-gray-400 mt-1">{result._usage.limit - result._usage.used} free check{result._usage.limit - result._usage.used !== 1 ? 's' : ''} remaining</div>
                  )}
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

              {!isPro && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                  <div className="text-xs font-bold text-amber-800 mb-1">✦ Unlock Pro — ₹999 one-time</div>
                  <div className="text-xs text-amber-700 mb-3">Unlimited checks · PDF download · Edit in Google Docs · Expert session</div>
                  <ProUpgradeCTAs layout="row" userEmail={userEmail} source="ats" />
                </div>
              )}

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
