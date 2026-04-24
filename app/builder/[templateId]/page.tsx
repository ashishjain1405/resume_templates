'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import { EMPTY_RESUME, type ResumeData, type ExperienceEntry, type EducationEntry } from '@/lib/resume-data'
import { createClient } from '@/lib/supabase'
import ClassicPreview from '@/components/resume-previews/Classic'
import ModernPreview from '@/components/resume-previews/Modern'
import MulticolumnPreview from '@/components/resume-previews/Multicolumn'
import QuotationPreview from '@/components/resume-previews/Quotation'
import ExecutivePreview from '@/components/resume-previews/Executive'
import type { User } from '@supabase/supabase-js'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'

function CheckATSButton({ user, data, accentColor, templateId }: {
  user: User | null
  data: ResumeData
  accentColor: string
  templateId: string
}) {
  const [saving, setSaving] = useState(false)

  async function handleCheckATS() {
    if (!user) {
      sessionStorage.setItem('ats_pending', JSON.stringify({ fromBuilder: true, templateId, data, accentColor }))
      localStorage.setItem('ats_pending', JSON.stringify({ fromBuilder: true, templateId, data, accentColor }))
      window.location.href = `/auth/signup?redirect=${encodeURIComponent('/ats-check')}`
      return
    }
    setSaving(true)
    try {
      const pdfRes = await fetch('/api/builder/pdf?pdf=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data, accentColor }),
      })
      if (!pdfRes.ok) return
      const blob = await pdfRes.blob()
      const name = `${data.personal.name?.replace(/\s+/g, '_') || 'resume'}_${templateId}.pdf`
      const file = new File([blob], name, { type: 'application/pdf' })
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await fetch('/api/resume/upload', { method: 'POST', body: form })
      const uploadData = await uploadRes.json()
      if (uploadData.resume?.id) {
        window.open(`/ats-check?resumeId=${uploadData.resume.id}`, '_blank')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={handleCheckATS}
      disabled={saving}
      className="border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
    >
      {saving ? (
        <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {saving ? 'Preparing…' : 'Check ATS'}
    </button>
  )
}

const PREVIEW_MAP: Record<string, React.ComponentType<{ accentColor?: string; data?: ResumeData }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  multicolumn: MulticolumnPreview,
  quotation: QuotationPreview,
  executive: ExecutivePreview,
}

type Tab = 'personal' | 'experience' | 'education' | 'skills'

function uid() {
  return Math.random().toString(36).slice(2)
}

function storageKey(templateId: string) {
  return `resume_builder_${templateId}`
}

export default function BuilderPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const template = TEMPLATES.find(t => t.id === templateId)
  if (!template) router.push('/templates')

  const [tab, setTab] = useState<Tab>('personal')
  const [accentColor, setAccentColor] = useState(template?.colors[0] ?? '#2c3e50')
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME)
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [savingVersion, setSavingVersion] = useState(false)
  const [savedVersion, setSavedVersion] = useState(false)
  const [saveCount, setSaveCount] = useState(0)
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [isPro, setIsPro] = useState(() =>
    typeof window !== 'undefined'
      ? !!(localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked'))
      : false
  )
  const [showProDownloadModal, setShowProDownloadModal] = useState(false)
  const [showProDocsModal, setShowProDocsModal] = useState(false)
  const [showChangeTemplateModal, setShowChangeTemplateModal] = useState(false)
  const [authForDownload, setAuthForDownload] = useState(false)
  const [authForDocs, setAuthForDocs] = useState(false)
  const [docsLoading, setDocsLoading] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const Preview = PREVIEW_MAP[templateId] ?? ClassicPreview

  // Load user + pro status
  useEffect(() => {
    // Capture synchronously before any async code can clear it
    const initialProFlag = typeof window !== 'undefined'
      && (localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked'))

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        if (initialProFlag) {
          setIsPro(true)
          // Clear flag once server confirms the row
          fetch('/api/pro-status').then(r => r.json()).then(d => {
            if (d.pro) { localStorage.removeItem('pro_unlocked'); sessionStorage.removeItem('pro_unlocked') }
          })
        } else {
          // Use server-side endpoint (service role) to avoid RLS/replication lag
          const d = await fetch('/api/pro-status').then(r => r.json())
          setIsPro(!!d.pro)
        }
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          const proFlag = initialProFlag
            || (typeof window !== 'undefined' && (localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked')))
          if (proFlag) {
            // Restore isPro=true in case SIGNED_OUT fired first and wiped it
            setIsPro(true)
            fetch('/api/pro-status').then(r => r.json()).then(d => {
              if (d.pro) { localStorage.removeItem('pro_unlocked'); sessionStorage.removeItem('pro_unlocked') }
            })
          } else {
            const d = await fetch('/api/pro-status').then(r => r.json())
            setIsPro(!!d.pro)
          }
        }
      } else {
        setIsPro(false)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`resume_builder_${templateId}`)
          localStorage.removeItem(`builder_session_restore_${templateId}`)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load saved data: sessionStorage (post-auth restore) > Supabase > localStorage
  useEffect(() => {
    async function load() {
      // Restore guest state saved just before login/signup redirect
      // Check sessionStorage first (same tab), then localStorage fallback (email confirmation new tab)
      const sessionRaw = typeof window !== 'undefined'
        ? (sessionStorage.getItem(`builder_session_${templateId}`) ?? localStorage.getItem(`builder_session_restore_${templateId}`))
        : null
      if (sessionRaw) {
        sessionStorage.removeItem(`builder_session_${templateId}`)
        localStorage.removeItem(`builder_session_restore_${templateId}`)
        try {
          const { data: saved, accentColor: savedColor } = JSON.parse(sessionRaw)
          setData(saved)
          if (savedColor) setAccentColor(savedColor)
          // Persist restored state to Supabase immediately
          if (user) {
            await supabase.from('resumes').upsert({
              user_id: user.id,
              template_id: templateId,
              data: saved,
              accent_color: savedColor,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,template_id' })
          }
        } catch {}
      } else if (user) {
        const { data: row } = await supabase
          .from('resumes')
          .select('data, accent_color')
          .eq('user_id', user.id)
          .eq('template_id', templateId)
          .maybeSingle()
        if (row) {
          setData(row.data as ResumeData)
          if (row.accent_color) setAccentColor(row.accent_color)
        } else {
          // No Supabase row yet — fall back to localStorage draft (e.g. guest typed data, then signed up via ATS flow)
          const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey(templateId)) : null
          if (stored) {
            try { setData(JSON.parse(stored)) } catch {}
          }
        }
      } else {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey(templateId)) : null
        if (stored) {
          try { setData(JSON.parse(stored)) } catch {}
        }
      }
    }
    load()
  }, [user, templateId])

  // Auto-open Pro upgrade modal once user is resolved — runs after load() has restored data
  useEffect(() => {
    if (!user) return
    const downloadPending = localStorage.getItem(`download_pending_${templateId}`)
    if (downloadPending) {
      if (isPro) {
        localStorage.removeItem(`download_pending_${templateId}`)
        setTimeout(() => handleDownload(), 0)
      } else {
        const proFlag = localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked')
        if (!proFlag) {
          // Free user returned after signup — show upgrade modal
          localStorage.removeItem(`download_pending_${templateId}`)
          setShowProDownloadModal(true)
        }
        // proFlag present: payment reload, isPro not yet resolved — keep flag, wait for re-run
      }
    }
    const docsPending = localStorage.getItem(`docs_pending_${templateId}`)
    if (docsPending) {
      if (isPro) {
        localStorage.removeItem(`docs_pending_${templateId}`)
        setTimeout(() => handleEditInDocs(), 0)
      } else {
        const proFlag = localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked')
        if (!proFlag) {
          localStorage.removeItem(`docs_pending_${templateId}`)
          setShowProDocsModal(true)
        }
      }
    }
  }, [user, isPro, templateId])

  // Auto-save with debounce
  const autoSave = useCallback((next: ResumeData, color: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey(templateId), JSON.stringify(next))
    }
    if (!user) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await supabase.from('resumes').upsert({
        user_id: user.id,
        template_id: templateId,
        data: next,
        accent_color: color,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,template_id' })
      setSaving(false)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    }, 1000)
  }, [user, templateId])

  function updateData(next: ResumeData) {
    setData(next)
    autoSave(next, accentColor)
  }

  function updateColor(color: string) {
    setAccentColor(color)
    autoSave(data, color)
  }

  // Personal field updater
  function setPersonal(field: keyof ResumeData['personal'], value: string) {
    updateData({ ...data, personal: { ...data.personal, [field]: value } })
  }

  // Experience
  function addExp() {
    updateData({ ...data, experience: [...data.experience, { id: uid(), company: '', role: '', startDate: '', endDate: '', bullets: [] }] })
  }
  function removeExp(id: string) {
    updateData({ ...data, experience: data.experience.filter(e => e.id !== id) })
  }
  function updateExp(id: string, field: keyof ExperienceEntry, value: string | string[]) {
    updateData({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  // Education
  function addEdu() {
    updateData({ ...data, education: [...data.education, { id: uid(), institution: '', degree: '', year: '' }] })
  }
  function removeEdu(id: string) {
    updateData({ ...data, education: data.education.filter(e => e.id !== id) })
  }
  function updateEdu(id: string, field: keyof EducationEntry, value: string) {
    updateData({ ...data, education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  // Skills: comma-separated string ↔ array
  const skillsStr = data.skills.join(', ')
  function setSkills(raw: string) {
    updateData({ ...data, skills: raw.split(',').map(s => s.trim()).filter(Boolean) })
  }

  async function handleSaveVersion() {
    if (!user) { setShowAuthModal(true); return }
    setSavingVersion(true)
    try {
      const res = await fetch('/api/builder/pdf?pdf=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data, accentColor }),
      })
      if (!res.ok) { const err = await res.text(); alert(`Could not generate resume: ${err}`); return }
      const blob = await res.blob()
      const base = `${data.personal.name?.replace(/\s+/g, '_') || 'resume'}_${templateId}`
      const version = saveCount + 1
      const versionSuffix = version > 1 ? `_v${version}` : ''
      const name = `${base}${versionSuffix}.pdf`
      const file = new File([blob], name, { type: 'application/pdf' })
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await fetch('/api/resume/upload', { method: 'POST', body: form })
      if (!uploadRes.ok) { alert('Could not save to Dashboard. Please try again.'); return }
      setSaveCount(c => c + 1)
      setSavedVersion(true)
      setTimeout(() => setSavedVersion(false), 3000)
    } finally {
      setSavingVersion(false)
    }
  }

  async function handleEditInDocs() {
    if (!user) {
      setAuthForDocs(true)
      const sessionSnapshot = JSON.stringify({ data, accentColor })
      sessionStorage.setItem(`builder_session_${templateId}`, sessionSnapshot)
      localStorage.setItem(`builder_session_restore_${templateId}`, sessionSnapshot)
      localStorage.setItem(`docs_pending_${templateId}`, '1')
      setShowAuthModal(true)
      return
    }
    if (!isPro) {
      // Re-check via adminClient endpoint to bypass RLS replication lag
      const res = await fetch('/api/pro-status')
      const d = await res.json()
      if (d.pro) { setIsPro(true) } else { setShowProDocsModal(true); return }
    }
    try {
      setDocsLoading(true)
      const pdfRes = await fetch('/api/builder/pdf?pdf=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data, accentColor }),
      })
      if (!pdfRes.ok) { setDocsLoading(false); return }
      const blob = await pdfRes.blob()
      const form = new FormData()
      form.append('file', new File([blob], 'resume.pdf', { type: 'application/pdf' }))
      const res = await fetch('/api/resume/edit', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) window.open(json.url, '_blank')
    } catch {
      alert('Failed to open in Google Docs. Please try again.')
    } finally {
      setDocsLoading(false)
    }
  }

  async function handleDownload() {
    if (!user) {
      setAuthForDownload(true)
      const sessionSnapshot = JSON.stringify({ data, accentColor })
      sessionStorage.setItem(`builder_session_${templateId}`, sessionSnapshot)
      localStorage.setItem(`builder_session_restore_${templateId}`, sessionSnapshot)
      localStorage.setItem(`download_pending_${templateId}`, '1')
      setShowAuthModal(true)
      return
    }
    if (!isPro) {
      const statusRes = await fetch('/api/pro-status')
      const statusData = await statusRes.json()
      if (statusData.pro) { setIsPro(true) } else { setShowProDownloadModal(true); return }
    }
    const res = await fetch('/api/builder/pdf?pdf=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, data, accentColor }),
    })
    if (!res.ok) { alert('Download failed. Please try again.'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${templateId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'personal', label: 'Personal' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile view toggle */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white">
        <button
          onClick={() => setMobileView('edit')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileView === 'edit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileView === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className={`${mobileView === 'edit' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[42%] flex-col border-r border-gray-100 bg-white`}>
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab === t.id ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'personal' && (
            <>
              {([
                ['name', 'Full Name', 'e.g. Priya Sharma'],
                ['title', 'Job Title', 'e.g. Software Engineer'],
                ['email', 'Email', 'priya@email.com'],
                ['phone', 'Phone', '+91 98765 43210'],
                ['location', 'Location', 'Mumbai, India'],
                ['linkedin', 'LinkedIn URL', 'linkedin.com/in/priya'],
              ] as [keyof ResumeData['personal'], string, string][]).map(([field, lbl, placeholder]) => (
                <div key={field}>
                  <label className={labelCls}>{lbl}</label>
                  <input className={inputCls} placeholder={placeholder} value={data.personal[field]} onChange={e => setPersonal(field, e.target.value)} />
                </div>
              ))}
            </>
          )}

          {tab === 'experience' && (
            <>
              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="border border-gray-100 rounded-xl p-3 space-y-2 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">Position {idx + 1}</span>
                    <button onClick={() => removeExp(exp.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                  </div>
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input className={inputCls} placeholder="e.g. Senior Developer" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Company & Location</label>
                    <input className={inputCls} placeholder="e.g. Google India, Bangalore" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Start</label>
                      <input className={inputCls} placeholder="2021" value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>End</label>
                      <input className={inputCls} placeholder="Present" value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Achievements (one per line)</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="· Built a feature used by 1M users&#10;· Led a team of 5 engineers"
                      value={exp.bullets.join('\n')}
                      onChange={e => updateExp(exp.id, 'bullets', e.target.value.split('\n').map(b => b.replace(/^·\s*/, '')))}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addExp} className="w-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 py-2.5 rounded-xl text-sm font-medium transition-colors">
                + Add Position
              </button>
            </>
          )}

          {tab === 'education' && (
            <>
              {data.education.map((edu, idx) => (
                <div key={edu.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">Entry {idx + 1}</span>
                    <button onClick={() => removeEdu(edu.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                  </div>
                  <div>
                    <label className={labelCls}>Degree / Qualification</label>
                    <input className={inputCls} placeholder="e.g. B.Tech Computer Science" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Institution</label>
                    <input className={inputCls} placeholder="e.g. IIT Delhi" value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <input className={inputCls} placeholder="2022" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addEdu} className="w-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 py-2.5 rounded-xl text-sm font-medium transition-colors">
                + Add Education
              </button>
            </>
          )}

          {tab === 'skills' && (
            <div>
              <label className={labelCls}>Skills (comma-separated)</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="e.g. React, Node.js, Python, AWS, TypeScript"
                value={skillsStr}
                onChange={e => setSkills(e.target.value)}
              />
              {data.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {data.skills.map(s => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 p-3 flex items-center gap-2 flex-wrap">
          {user ? (
            <span className="text-xs text-gray-400 flex-1 min-w-0">
              {saving ? 'Saving…' : savedMsg ? '✓ Saved' : 'Auto-saved'}
            </span>
          ) : (
            <span className="text-xs text-gray-400 flex-1 min-w-0">
              <button onClick={() => setShowAuthModal(true)} className="text-blue-500 hover:underline">Sign up</button> to save & revisit
            </span>
          )}
          <button
            onClick={handleSaveVersion}
            disabled={savingVersion}
            className="border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
          >
            {savingVersion ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : savedVersion ? (
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            )}
            {savingVersion ? 'Saving…' : savedVersion ? 'Saved to Dashboard' : 'Save to Dashboard'}
          </button>
          {isPro ? (
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
            >
              Download PDF
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="bg-amber-50 text-amber-700 border border-amber-200 text-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-semibold flex-shrink-0 flex items-center gap-1.5"
            >
              Download PDF
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right panel — live preview (desktop always, mobile when preview tab active) */}
      <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gray-100`}>
        {/* Color picker */}
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Accent color</span>
          <div className="flex gap-2">
            {template?.colors.map(c => (
              <button
                key={c}
                onClick={() => updateColor(c)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  boxShadow: accentColor === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none',
                }}
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CheckATSButton user={user} data={data} accentColor={accentColor} templateId={templateId} />
            <button
              onClick={handleEditInDocs}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${isPro ? 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Edit in Google Docs
              {!isPro && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>}
            </button>
            <button
              onClick={() => setShowChangeTemplateModal(true)}
              className="flex items-center gap-1.5 text-xs border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Change Template
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-start justify-center p-4 lg:p-8">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-[420px]" style={{ aspectRatio: '420/594' }}>
            <Preview accentColor={accentColor} data={data} />
          </div>
        </div>
      </div>
      </div>{/* end flex row */}

      {/* Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {(authForDownload || authForDocs) ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Almost there — 2 quick steps</h2>
                <div className="flex flex-col gap-2 mb-5 mt-3">
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span className="text-sm text-gray-700 font-medium">Create a free account</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span className="text-sm text-gray-500">
                      {authForDocs ? 'Unlock Google Docs editing with Pro — ₹999 one-time' : 'Unlock PDF downloads with Pro — ₹999 one-time'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Save your progress</h2>
                <p className="text-sm text-gray-500 mb-5">Sign in to save your resume and pick up where you left off.</p>
              </>
            )}
            <div className="flex flex-col gap-2">
              <a
                href={`/auth/signup?redirect=${encodeURIComponent(`/builder/${templateId}`)}`}
                onClick={() => { sessionStorage.setItem(`builder_session_${templateId}`, JSON.stringify({ data, accentColor })) }}
                className="w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                {(authForDownload || authForDocs) ? 'Create account to continue' : 'Create account'}
              </a>
              <a
                href={`/auth/login?redirect=${encodeURIComponent(`/builder/${templateId}`)}`}
                onClick={() => { sessionStorage.setItem(`builder_session_${templateId}`, JSON.stringify({ data, accentColor })) }}
                className="w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Sign in
              </a>
            </div>
            <button onClick={() => { setShowAuthModal(false); setAuthForDownload(false); setAuthForDocs(false) }} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Change template modal */}
      {showChangeTemplateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowChangeTemplateModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowChangeTemplateModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Change template?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Your current progress will be lost unless you save it first.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await handleSaveVersion()
                  router.push('/builder')
                }}
                disabled={savingVersion}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingVersion ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : 'Save to Dashboard'}
              </button>
              <button
                onClick={() => { localStorage.removeItem(storageKey(templateId)); router.push('/builder') }}
                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Change anyway
              </button>
              <button onClick={() => setShowChangeTemplateModal(false)} className="text-xs text-gray-400 hover:text-gray-600 pt-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Pro download modal */}
      {showProDocsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowProDocsModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProDocsModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Edit in Google Docs is a Pro feature</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Upgrade once for lifetime access — edit in Google Docs, unlimited ATS checks, PDF downloads, and an expert session. ₹999, one-time.</p>
            <ProUpgradeCTAs layout="stack" source="docs" returnPath={`/builder/${templateId}`} />
          </div>
        </div>
      )}

      {showProDownloadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowProDownloadModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProDownloadModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m-4.5-4.5L12 16.5l4.5-4.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">PDF download is a Pro feature</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Upgrade once for lifetime access — unlimited downloads, unlimited ATS checks, and an expert session. ₹999, one-time.</p>
            <ProUpgradeCTAs layout="stack" source="download" returnPath={`/builder/${templateId}`} />
          </div>
        </div>
      )}

      {/* Google Docs loading overlay */}
      {docsLoading && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">Opening in Google Docs…</p>
            <p className="text-sm text-gray-400">This takes a few seconds. Please don&apos;t close this tab.</p>
          </div>
        </div>
      )}
    </div>
  )
}
