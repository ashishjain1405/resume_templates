'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

function CheckATSButton({ user, onAuthRequired, data, accentColor, templateId }: {
  user: User | null
  onAuthRequired: () => void
  data: ResumeData
  accentColor: string
  templateId: string
}) {
  const [saving, setSaving] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)

  async function handleCheckATS() {
    if (!user) { onAuthRequired(); return }
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
      if (uploadData.resume?.id) setResumeId(uploadData.resume.id)
    } finally {
      setSaving(false)
    }
  }

  if (resumeId) {
    return (
      <Link
        href={`/ats-check?resumeId=${resumeId}`}
        className="border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-1.5 flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Check ATS
      </Link>
    )
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
  const [isPro, setIsPro] = useState(false)
  const [showProDownloadModal, setShowProDownloadModal] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const Preview = PREVIEW_MAP[templateId] ?? ClassicPreview

  // Load user + pro status
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: row } = await supabase.from('pro_access').select('id').eq('user_id', data.user.id).maybeSingle()
        setIsPro(!!row)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: row } = await supabase.from('pro_access').select('id').eq('user_id', session.user.id).maybeSingle()
        setIsPro(!!row)
      } else {
        setIsPro(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load saved data: Supabase for logged-in, localStorage for guests
  useEffect(() => {
    async function load() {
      if (user) {
        const { data: row } = await supabase
          .from('resumes')
          .select('data, accent_color')
          .eq('user_id', user.id)
          .eq('template_id', templateId)
          .maybeSingle()
        if (row) {
          setData(row.data as ResumeData)
          if (row.accent_color) setAccentColor(row.accent_color)
          return
        }
      }
      const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey(templateId)) : null
      if (stored) {
        try { setData(JSON.parse(stored)) } catch {}
      }
    }
    load()
  }, [user, templateId])

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

  async function handleDownload() {
    if (!user) { setShowAuthModal(true); return }
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
          <CheckATSButton user={user} onAuthRequired={() => setShowAuthModal(true)} data={data} accentColor={accentColor} templateId={templateId} />
          {isPro ? (
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
            >
              Download PDF
            </button>
          ) : (
            <button
              onClick={() => setShowProDownloadModal(true)}
              className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-semibold flex-shrink-0 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Download PDF
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
          <span className="ml-auto text-xs text-gray-400">{template?.name} template</span>
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
            <h2 className="text-lg font-bold text-gray-900 mb-2">Save your progress</h2>
            <p className="text-sm text-gray-500 mb-5">Create a free account to save your resume and download it anytime.</p>
            <div className="flex flex-col gap-2">
              <a href={`/auth/signup?redirect=/builder/${templateId}`} className="w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                Create free account
              </a>
              <a href={`/auth/login?redirect=/builder/${templateId}`} className="w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                Log in
              </a>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Pro download modal */}
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
            <ProUpgradeCTAs layout="stack" source="download" />
          </div>
        </div>
      )}
    </div>
  )
}
