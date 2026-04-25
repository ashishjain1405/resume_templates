'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface UploadedResume {
  id: string
  filename: string
  mime_type: string
  size_bytes: number
  ats_score: number | null
  created_at: string
  template_id: string | null
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserResumes({ isPro = false }: { isPro?: boolean }) {
  const [resumes, setResumes] = useState<UploadedResume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchResumes() }, [])

  async function fetchResumes() {
    setLoading(true)
    try {
      const res = await fetch('/api/resume/list')
      const data = await res.json()
      setResumes(data.resumes ?? [])
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/resume/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      setResumes(prev => [data.resume, ...prev])
    } catch { setError('Upload failed. Please try again.') } finally {
      setUploading(false)
    }
  }

  async function handleDownload(r: UploadedResume) {
    setDownloadingId(r.id)
    try {
      const res = await fetch(`/api/resume/${r.id}`)
      const data = await res.json()
      if (!data.url) return
      const fileRes = await fetch(data.url)
      const blob = await fileRes.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = r.filename
      a.click()
    } catch { /* ignore */ } finally {
      setDownloadingId(null)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/resume/${id}`, { method: 'DELETE' })
      setResumes(prev => prev.filter(r => r.id !== id))
    } catch { /* ignore */ } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">My Resumes</h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          {uploading ? 'Uploading…' : 'Upload Resume'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No resumes uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload a PDF or DOCX to get started</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {resumes.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.mime_type === 'application/pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{r.filename}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>{formatSize(r.size_bytes)} · {formatDate(r.created_at)}</span>
                  {r.ats_score != null && (
                    <span className={`font-semibold ${r.ats_score >= 75 ? 'text-green-600' : r.ats_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      Resume {r.ats_score}/100
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.template_id && (
                  <Link
                    href={`/builder/${r.template_id}`}
                    className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </Link>
                )}
                <Link
                  href={`/ats-check?resumeId=${r.id}`}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  Check Resume score
                </Link>
                {isPro ? (
                  <button
                    onClick={() => handleDownload(r)}
                    disabled={downloadingId === r.id}
                    className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                    aria-label="Download"
                  >
                    {downloadingId === r.id ? (
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m-4.5-4.5L12 16.5l4.5-4.5" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <span className="text-gray-300 cursor-default" aria-label="Pro required to download" title="Upgrade to Pro to download">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                  disabled={deletingId === r.id}
                  className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                  aria-label="Delete"
                >
                  {deletingId === r.id ? (
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
