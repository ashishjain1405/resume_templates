'use client'

import { useState, useEffect } from 'react'
import MulticolumnPreview from './resume-previews/Multicolumn'
import type { ResumeData } from '@/lib/resume-data'

const FIELDS = [
  { key: 'name',    label: 'Full Name',            final: 'Priya Sharma' },
  { key: 'title',   label: 'Job Title',            final: 'Senior Product Manager' },
  { key: 'company', label: 'Company & Location',   final: 'Google India, Bangalore' },
  { key: 'skills',  label: 'Skills',               final: 'Product Strategy, Agile, Analytics' },
]

const ACCENT = '#2c3e50'

export default function BuilderDemo() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [activeField, setActiveField] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        setValues({})
        setActiveField(0)
        setCharIdx(0)
        setDone(false)
      }, 2800)
      return () => clearTimeout(t)
    }

    const field = FIELDS[activeField]
    if (!field) return

    if (charIdx < field.final.length) {
      const delay = 48 + Math.random() * 28
      const t = setTimeout(() => {
        setValues(v => ({ ...v, [field.key]: field.final.slice(0, charIdx + 1) }))
        setCharIdx(c => c + 1)
      }, delay)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      if (activeField < FIELDS.length - 1) {
        setActiveField(a => a + 1)
        setCharIdx(0)
      } else {
        setDone(true)
      }
    }, 520)
    return () => clearTimeout(t)
  }, [activeField, charIdx, done])

  const skills = values.skills
    ? values.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const previewData: ResumeData = {
    personal: {
      name: values.name || '',
      title: values.title || '',
      email: 'priya@email.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      linkedin: '',
    },
    experience: values.company
      ? [{ id: '1', role: values.title || 'Product Manager', company: values.company, startDate: '2022', endDate: '', bullets: ['Led cross-functional teams to ship 0→1 products', 'Grew user base by 3x in 12 months'] }]
      : [],
    education: [{ id: '1', degree: 'MBA, Strategy', institution: 'IIM Bangalore', year: '2019' }],
    skills,
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-4xl mx-auto">

      {/* Form panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Mock tab bar */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          {['Personal', 'Experience', 'Education', 'Skills'].map((tab, i) => (
            <div
              key={tab}
              className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
                i === (done ? 3 : Math.min(activeField, 3))
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {FIELDS.map((field, idx) => {
            const isActive = idx === activeField && !done
            const val = values[field.key] || ''
            const isDone = idx < activeField || done

            return (
              <div key={field.key}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{field.label}</label>
                <div
                  className={`border rounded-lg px-3 py-2 text-sm min-h-[36px] flex items-center transition-all duration-200 ${
                    isActive
                      ? 'border-blue-400 shadow-sm shadow-blue-100 bg-white'
                      : isDone
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <span className="text-gray-800 flex-1">{val}</span>
                  {isActive && (
                    <span
                      className="w-0.5 h-4 bg-blue-500 inline-block ml-0.5 flex-shrink-0"
                      style={{ animation: 'blink 1s step-end infinite' }}
                    />
                  )}
                  {isDone && !isActive && (
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}

          <div
            className={`mt-2 transition-all duration-500 ${done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <div className="w-full bg-blue-600 text-white text-sm py-2.5 rounded-lg font-semibold text-center cursor-default select-none">
              Download Resume ↓
            </div>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          ATS-Friendly ✓
        </div>
        <div style={{ height: '360px' }}>
          <MulticolumnPreview accentColor={ACCENT} data={previewData} />
        </div>
        <div className={`absolute inset-0 bg-white/60 backdrop-blur-[1px] transition-opacity duration-700 flex items-center justify-center ${values.name ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium">Resume preview</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  )
}
