'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserResumes from '@/components/UserResumes'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'
import TemplateCard from '@/components/TemplateCard'
import type { Template } from '@/lib/templates'

const FREE_ATS_LIMIT = 5

interface Props {
  pro: boolean
  userEmail?: string
  accessibleTemplates: Template[]
  lockedTemplates: Template[]
  atsChecksUsed: number
  templateCount: number
  latestResume: { id: string; filename: string; created_at: string; ats_score: number | null } | null
  upcomingSession: { id: string; scheduled_at: string; meet_link: string | null; status: string } | null
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ats', label: 'ATS Score' },
  { id: 'builder', label: 'Resume Builder' },
  { id: 'templates', label: 'Templates' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'resumes', label: 'My Resumes' },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatSession(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

export default function DashboardTabs({
  pro, userEmail, accessibleTemplates, lockedTemplates,
  atsChecksUsed, latestResume, upcomingSession,
}: Props) {
  const [active, setActive] = useState('overview')

  const firstName = userEmail?.split('@')[0]?.split('.')[0] ?? 'there'
  const atsRemaining = Math.max(0, FREE_ATS_LIMIT - atsChecksUsed)

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

      {/* ── OVERVIEW ── */}
      {active === 'overview' && (
        <div className="space-y-8 max-w-2xl">

          {/* Greeting */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Good morning, {firstName}</h2>
            {pro && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Pro</span>
            )}
          </div>

          {/* Upcoming session — shown above hero when exists */}
          {upcomingSession && (
            <div className="flex items-center justify-between gap-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex-wrap">
              <div>
                <div className="text-xs font-semibold text-green-700 mb-0.5">Upcoming session</div>
                <div className="text-sm font-bold text-gray-900">{formatSession(upcomingSession.scheduled_at)}</div>
                <div className="text-xs text-gray-500 mt-0.5">30 minutes · Google Meet</div>
              </div>
              {upcomingSession.meet_link && (
                <a href={upcomingSession.meet_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                  Join Google Meet
                </a>
              )}
            </div>
          )}

          {/* Hero — contextual, adapts to user state */}
          {!latestResume ? (
            /* No resume yet: two side-by-side tiles */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3 p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">Check your ATS score</div>
                  <div className="text-xs text-gray-400">See how your resume performs against job tracking systems</div>
                </div>
                <Link href="/ats-check" className="mt-auto inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start">
                  Check ATS Score →
                </Link>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">No resume yet?</div>
                  <div className="text-xs text-gray-400">Build from scratch with our Resume Creator</div>
                </div>
                <Link href="/builder" className="mt-auto inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start">
                  Create Resume →
                </Link>
              </div>
            </div>
          ) : pro ? (
            /* Has resume + Pro: two tiles */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3 p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Latest resume</div>
                  <div className="text-sm font-bold text-gray-900 truncate">{latestResume.filename}</div>
                  {latestResume.ats_score != null && (
                    <div className="text-xs text-gray-500 mt-0.5">ATS score: <span className="font-semibold text-gray-700">{latestResume.ats_score}</span></div>
                  )}
                </div>
                <Link href="/ats-check" className="mt-auto inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start">
                  Run another check →
                </Link>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">Book 1:1 Expert Session</div>
                  <div className="text-xs text-gray-400">30-min personalised resume feedback call</div>
                </div>
                <Link href="/sessions/book" className="mt-auto inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start">
                  Book Session →
                </Link>
              </div>
            </div>
          ) : (
            /* Has resume + free user: single hero */
            <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Latest resume</div>
                  <div className="text-sm font-bold text-gray-900 truncate">{latestResume.filename}</div>
                  {latestResume.ats_score != null && (
                    <div className="text-xs text-gray-500 mt-0.5">ATS score: <span className="font-semibold text-gray-700">{latestResume.ats_score}</span></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Link href="/ats-check" className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Run another check →
                </Link>
                <span className="text-xs text-gray-400">{atsChecksUsed} of {FREE_ATS_LIMIT} free checks used</span>
              </div>
            </div>
          )}

          {/* Pro upsell — free users only, single line */}
          {!pro && (
            <Link href="/pricing" className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors self-start">
              Upgrade to Pro ✦
            </Link>
          )}
        </div>
      )}

      {/* ── ATS SCORE ── */}
      {active === 'ats' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">ATS Score Checker</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Most companies use ATS (Applicant Tracking Systems) to filter resumes before a human ever reads them. Upload your resume to get an instant score, see which keywords you&apos;re missing, and get specific suggestions to improve it.
            </p>
            {pro ? (
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 mb-4">
                Unlimited checks — Pro
              </div>
            ) : (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{atsChecksUsed} of {FREE_ATS_LIMIT} free checks used</span>
                  <span>{atsRemaining} remaining</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${atsChecksUsed >= FREE_ATS_LIMIT ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (atsChecksUsed / FREE_ATS_LIMIT) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {pro ? (
              <Link href="/ats-check" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                Check my resume score →
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/ats-check" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Check my resume score →
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-colors">
                  Upgrade to Pro for Unlimited checks ✦
                </Link>
              </div>
            )}
          </div>

          {latestResume && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{latestResume.filename}</div>
                  <div className="text-xs text-gray-400">Last uploaded {timeAgo(latestResume.created_at)}</div>
                </div>
              </div>
              <Link href="/ats-check" className="text-sm text-blue-600 font-semibold hover:underline whitespace-nowrap">Re-check →</Link>
            </div>
          )}
        </div>
      )}

      {/* ── RESUME BUILDER ── */}
      {active === 'builder' && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Resume Builder</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Build a polished resume from scratch using one of our professionally designed templates. Edit in real time with a live preview, then download as a PDF or open in Google Docs.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Live preview</span>
              <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full inline-block ${pro ? 'bg-green-400' : 'bg-gray-300'}`} />PDF download {!pro && '(Pro)'}</span>
              <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full inline-block ${pro ? 'bg-green-400' : 'bg-gray-300'}`} />Edit in Google Docs {!pro && '(Pro)'}</span>
            </div>
            <Link href="/builder" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
              Open Builder →
            </Link>
          </div>

          {accessibleTemplates.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Build with a template</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {accessibleTemplates.map(t => (
                  <Link key={t.id} href={`/builder/${t.id}`} className="group block border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-sm transition-all bg-white">
                    <div className="bg-gray-50 h-24 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="px-3 py-2">
                      <div className="text-xs font-semibold text-gray-700 truncate">{t.name}</div>
                      <div className="text-[11px] text-blue-500 mt-0.5 group-hover:underline">Build with this</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {accessibleTemplates.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Purchase a template to start building.</p>
              <Link href="/templates" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">Browse templates</Link>
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {active === 'templates' && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Resume Templates</h2>
              <p className="text-sm text-gray-500">Each template is a one-time purchase — download as PDF or DOCX, use forever. Pro gives you instant access to all 5.</p>
            </div>
          </div>

          {accessibleTemplates.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{pro ? 'All templates' : 'My templates'}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {accessibleTemplates.map((t) => <TemplateCard key={t.id} template={t} purchased />)}
              </div>
            </>
          )}

          {!pro && lockedTemplates.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">More templates</div>
                <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:text-blue-700">Upgrade to Pro →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {lockedTemplates.map((t) => <TemplateCard key={t.id} template={t} />)}
              </div>
            </>
          )}

          {accessibleTemplates.length === 0 && (
            <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 mb-4">You don&apos;t own any templates yet.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/templates" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">Browse templates</Link>
                <Link href="/pricing" className="bg-amber-50 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-colors">Upgrade to Pro ✦</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SESSIONS ── */}
      {active === 'sessions' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Expert Sessions</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              A 30-minute 1:1 video call with a resume expert. You&apos;ll get personalised feedback on your resume, tips tailored to your target role, and a clear action plan to improve your chances.
            </p>
            {pro ? (
              <div className="flex gap-3 flex-wrap">
                <Link href="/sessions/book" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Book a session →
                </Link>
                <Link href="/sessions" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                  View my sessions
                </Link>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium mb-3">Expert sessions are included with Pro.</p>
                <Link href="/pricing" className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                  Upgrade to Pro ✦
                </Link>
              </div>
            )}
          </div>

          {upcomingSession && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs font-semibold text-green-700 mb-1">Upcoming session</div>
                <div className="text-sm font-bold text-gray-900">{formatSession(upcomingSession.scheduled_at)}</div>
                <div className="text-xs text-gray-500 mt-0.5">30 minutes · Google Meet</div>
              </div>
              {upcomingSession.meet_link && (
                <a href={upcomingSession.meet_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                  Join Google Meet
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MY RESUMES ── */}
      {active === 'resumes' && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">My Resumes</h2>
              <p className="text-sm text-gray-500">Upload your existing resume to run an ATS check or edit it in Google Docs. Files are stored securely and only accessible by you.</p>
            </div>
          </div>
          <UserResumes isPro={pro} />
        </div>
      )}
    </div>
  )
}
