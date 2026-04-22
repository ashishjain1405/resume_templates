'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserResumes from '@/components/UserResumes'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'
import TemplateCard from '@/components/TemplateCard'
import type { Template } from '@/lib/templates'

interface Props {
  pro: boolean
  userEmail?: string
  accessibleTemplates: Template[]
  lockedTemplates: Template[]
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ats', label: 'ATS Score' },
  { id: 'builder', label: 'Resume Builder' },
  { id: 'templates', label: 'Templates' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'resumes', label: 'My Resumes' },
]

export default function DashboardTabs({ pro, userEmail, accessibleTemplates, lockedTemplates }: Props) {
  const [active, setActive] = useState('overview')

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {active === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setActive('ats')} className="group flex items-center gap-4 p-5 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors text-left">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-white">Check ATS Score</div>
                <div className="text-xs text-blue-100 mt-0.5">See how your resume performs</div>
              </div>
              <svg className="w-4 h-4 text-white/60 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            <button onClick={() => setActive('builder')} className="group flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-shadow text-left">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Create my Resume</div>
                <div className="text-xs text-gray-400 mt-0.5">Create or edit your resume</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setActive('templates')} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow text-left">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Templates</div>
                <div className="text-xs text-gray-400">Browse all designs</div>
              </div>
            </button>

            <button onClick={() => setActive('sessions')} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow text-left">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Expert Session {!pro && <span className="text-xs text-blue-500 font-normal ml-1">— Pro</span>}
                </div>
                <div className="text-xs text-gray-400">{pro ? 'Book a 1:1 review' : 'Upgrade to access'}</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ATS Score */}
      {active === 'ats' && (
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">ATS Score Checker</h2>
          <p className="text-sm text-gray-500 mb-6">Upload your resume to see how it performs against ATS systems. Get a score, keyword gaps, and improvement suggestions.</p>
          <Link href="/ats-check" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Open ATS Checker
          </Link>
        </div>
      )}

      {/* Resume Builder */}
      {active === 'builder' && (
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Resume Builder</h2>
          <p className="text-sm text-gray-500 mb-6">Choose from 5 professionally designed templates and build your resume with a live preview.</p>
          <Link href="/builder" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            Open Builder
          </Link>
        </div>
      )}

      {/* Templates */}
      {active === 'templates' && (
        <div>
          {accessibleTemplates.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-8">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-5 text-sm">Purchase individual templates or upgrade to Pro to get all 5.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/templates" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">Browse templates</Link>
                <Link href="/pricing" className="border border-blue-600 text-blue-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">Get Pro — ₹999</Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{pro ? 'All Templates' : 'My Templates'}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {accessibleTemplates.map((t) => <TemplateCard key={t.id} template={t} purchased />)}
              </div>
            </>
          )}

          {!pro && lockedTemplates.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">More templates</h2>
                <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:text-blue-700">Get Pro for all →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {lockedTemplates.map((t) => <TemplateCard key={t.id} template={t} />)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sessions */}
      {active === 'sessions' && (
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Expert Sessions</h2>
          <p className="text-sm text-gray-500 mb-6">Book a 30-minute 1:1 resume review with an expert. Get personalised feedback and actionable advice.</p>
          {pro ? (
            <div className="flex gap-3 flex-wrap">
              <Link href="/sessions/book" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                Book a Session
              </Link>
              <Link href="/sessions" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                View My Sessions
              </Link>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="text-sm text-amber-800 font-medium mb-3">Expert sessions are a Pro feature.</p>
              <ProUpgradeCTAs layout="row" userEmail={userEmail} source="sessions" />
            </div>
          )}
        </div>
      )}

      {/* My Resumes */}
      {active === 'resumes' && (
        <UserResumes isPro={pro} />
      )}
    </div>
  )
}
