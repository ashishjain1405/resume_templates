'use client'

import { useState, useEffect, useRef } from 'react'

export default function SaveNameModal({
  defaultName,
  onSave,
  onCancel,
  saving = false,
}: {
  defaultName: string
  onSave: (name: string) => void
  onCancel: () => void
  saving?: boolean
}) {
  const [value, setValue] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function handleSave() {
    const cleaned = value.trim().replace(/[^a-zA-Z0-9 \-(). ]/g, '').trim()
    if (!cleaned) return
    onSave(cleaned)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Name your resume</h3>
        <p className="text-sm text-gray-500 mb-4">This name will appear on your Dashboard.</p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="e.g. Software Engineer Resume"
          maxLength={60}
          disabled={saving}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !value.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Save to Dashboard'}
          </button>
          <button onClick={onCancel} disabled={saving} className="text-xs text-gray-400 hover:text-gray-600 pt-1">Cancel</button>
        </div>
      </div>
    </div>
  )
}
