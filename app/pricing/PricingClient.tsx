'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useProUpgrade } from '@/lib/use-pro-upgrade'

interface Props {
  isPro: boolean
  userEmail: string
  isLoggedIn: boolean
}

const COMPARISON: { feature: string; free: boolean | string; pro: boolean | string }[] = [
  { feature: 'Resume Checks', free: '5', pro: 'Unlimited' },
  { feature: 'AI Re-write', free: false, pro: true },
  { feature: 'Create Resume', free: 'Create & Preview', pro: 'Create, Preview & Download' },
  { feature: 'Access to all 5 templates', free: true, pro: true },
  { feature: 'Edit resume in Google Docs', free: false, pro: true },
  { feature: '1:1 Expert Review Session', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
]

const FAQS = [
  {
    q: 'What exactly do I get with Pro?',
    a: 'Unlimited ATS checks, AI resume re-write, the ability to download your resume from the Builder, one 1:1 expert review session, and priority support - all for a single one-time payment.',
  },
  {
    q: 'Is this really a one-time payment?',
    a: 'Yes. Pay ₹999 once and you have lifetime access — no monthly fees, no renewals, no surprises.',
  },
  {
    q: 'How does the expert session work?',
    a: 'After upgrading, visit the Sessions page to pick a 30-minute slot from the expert\'s calendar. You\'ll receive a Google Meet link by email. The session is a live 1:1 resume review.',
  },
  {
    q: 'Can I use Pro on multiple resumes?',
    a: 'Yes. Pro is tied to your account, not a single resume. You can build, check, and download as many resumes as you need.',
  },
  {
    q: 'What if I already have a good resume?',
    a: 'The ATS Checker will tell you exactly how good it really is. Most resumes have gaps that aren\'t visible to the human eye but cause ATS rejections.',
  },
]

function Check({ color = 'blue' }: { color?: 'blue' | 'green' }) {
  return (
    <svg className={`w-4 h-4 ${color === 'green' ? 'text-green-500' : 'text-blue-600'} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function PricingClient({ isPro, userEmail, isLoggedIn }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { startUpgrade, loading } = useProUpgrade()

  useEffect(() => {
    if (isLoggedIn && !isPro && searchParams.get('autoupgrade') === '1') {
      startUpgrade(userEmail, 'pricing')
    }
  }, [])

  function handleUpgrade() {
    if (!isLoggedIn) { router.push('/auth/signup?redirect=/pricing?autoupgrade=1'); return }
    startUpgrade(userEmail, 'pricing')
  }

  const UpgradeButton = ({ className = '' }: { className?: string }) => isPro ? (
    <div className={`bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-semibold text-sm text-center ${className}`}>
      ✓ You have Pro Access
    </div>
  ) : (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Processing…' : 'Upgrade to Pro — ₹999'}
    </button>
  )

  return (
    <div className="bg-white">

      {/* 1. Hero */}
      <section className="py-16 px-4 text-center border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Resume Expert Pro
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Everything you need to<br />land your next job
          </h1>
          <p className="text-gray-500 text-base mb-8">
            One payment. Lifetime access. No subscriptions, no renewals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <UpgradeButton className="w-full sm:w-auto px-10" />
            {isPro ? (
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Go to Dashboard →
              </Link>
            ) : (
              <Link href="/ats-check" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Try Resume Checker →
              </Link>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">Secure payment via Razorpay · GST invoice on request</p>
        </div>
      </section>

      {/* 2. Feature deep-dives */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* ATS Checker */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Unlimited checks</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Resume Score Checker</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Most resumes don&apos;t fail just because of ATS - they fail because they don&apos;t convince recruiters either. Our analyzer evaluates your resume across both ATS requirements and real hiring criteria and lets AI fix it for you in one click.
              </p>
              <ul className="space-y-2">
                {['Instant score out of 100', 'Section-by-section breakdown', 'Missing keyword detection', '5 actionable improvement suggestions', 'Paste text or upload PDF'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check color="green" />{f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock ATS result */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-5">
                <div className="relative inline-flex items-center justify-center flex-shrink-0">
                  <svg width="80" height="80" className="-rotate-90">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#16a34a" strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * 0.18}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-xl font-bold text-gray-900">82</div>
                    <div className="text-[9px] text-gray-400">/100</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Interview Ready</div>
                  <div className="text-xs text-gray-400 mt-0.5">Your resume is performing strongly</div>
                </div>
              </div>
              {[['Keyword Matching', 78, 'bg-amber-500'], ['Formatting & Structure', 92, 'bg-green-500'], ['Measurable Achievements', 70, 'bg-amber-500']].map(([label, score, color]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-400">{score}/100</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Leadership', 'Agile', 'SQL'].map(kw => (
                  <span key={kw} className="bg-red-50 text-red-600 border border-red-100 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Resume Builder */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your details</div>
                    {['Full name', 'Job title', 'Email', 'Experience'].map(f => (
                      <div key={f} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-gray-400">{f}</div>
                        <div className="h-2 bg-gray-100 rounded mt-1 w-3/4" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1.5">
                    <div className="h-2.5 bg-blue-600 rounded w-2/3" />
                    <div className="h-1.5 bg-gray-200 rounded w-1/2" />
                    <div className="border-t border-gray-100 my-1" />
                    <div className="h-1.5 bg-gray-100 rounded w-full" />
                    <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                    <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                    <div className="border-t border-gray-100 my-1" />
                    <div className="h-1.5 bg-gray-100 rounded w-full" />
                    <div className="h-1.5 bg-gray-100 rounded w-3/4" />
                    <div className="mt-auto pt-2">
                      <div className="bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded text-center">Download PDF</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Pro download</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Resume Builder</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Fill in your details and watch your resume update live. Choose from 5 professionally designed, recruiter-optimised templates. When you&apos;re happy — download as PDF instantly.
              </p>
              <ul className="space-y-2">
                {['5 professional templates', 'Live preview as you type', 'Accent colour customisation', 'PDF download (Pro)', 'Auto-saves to your account'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Expert Session */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">1 session included</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">1:1 Expert Session</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                A 30-minute live video call with a resume expert. Get honest, specific feedback on your resume before you apply. Walk away with a clear action plan.
              </p>
              <ul className="space-y-2">
                {['30-minute Google Meet session', 'Book any available weekend slot', 'Expert reviews your actual resume', 'Actionable feedback you can apply immediately', 'Google Calendar invite sent automatically'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check color="green" />{f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock calendar slot picker */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pick a slot</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['Saturday, 26 Apr', 'Sunday, 27 Apr', 'Saturday, 3 May', 'Sunday, 4 May'].map((d, i) => (
                  <div key={d} className={`px-3 py-2.5 rounded-xl border text-xs font-medium ${i === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700'}`}>
                    <div className="font-semibold">{d.split(',')[0]}</div>
                    <div className={`text-[10px] mt-0.5 ${i === 1 ? 'text-blue-100' : 'text-gray-400'}`}>{i < 2 ? '4 slots' : '6 slots'}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available times (IST)</div>
              <div className="grid grid-cols-4 gap-1.5">
                {['11:00', '11:30', '12:00', '12:30', '2:00', '2:30', '3:00', '3:30'].map((t, i) => (
                  <div key={t} className={`py-2 rounded-lg text-xs font-medium text-center border ${i === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700'}`}>{t}</div>
                ))}
              </div>
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">Google Meet link sent to your email</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Calendar invite sent to both parties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Free vs Pro comparison */}
      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">Free vs Pro</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 text-xs font-semibold text-center py-3 border-b border-gray-100">
              <div className="text-left pl-5 text-gray-500 uppercase tracking-wider">Feature</div>
              <div className="text-gray-500 uppercase tracking-wider">Free</div>
              <div className="text-blue-600 uppercase tracking-wider">Pro</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 items-center py-3 px-5 ${i !== COMPARISON.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="text-sm text-gray-700">{row.feature}</div>
                <div className="flex justify-center">{typeof row.free === 'string' ? <span className="text-xs text-gray-600 font-medium">{row.free}</span> : row.free ? <Check color="green" /> : <Cross />}</div>
                <div className="flex justify-center">{typeof row.pro === 'string' ? <span className="text-xs text-blue-600 font-medium">{row.pro}</span> : row.pro ? <Check /> : <Cross />}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 tracking-tight">Why it matters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '75%', label: 'of resumes are rejected by ATS before a human sees them' },
              { stat: '2×', label: 'more interview callbacks for resumes with resume scores above 75' },
              { stat: '30 min', label: 'expert session — enough to transform your entire job search' },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-blue-50 rounded-2xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing card */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-sm mx-auto">
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-7 relative shadow-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Best value</div>
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Pro</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">₹999</span>
            </div>
            <div className="text-sm text-gray-400 mb-6">One-time · lifetime access</div>
            <ul className="space-y-2.5 mb-7">
              {['Unlimited Resume Checks', 'Resume Builder + PDF download', '1:1 Expert Review Session', 'All 5 templates', 'Priority support'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check />{f}
                </li>
              ))}
            </ul>
            <UpgradeButton className="w-full" />
            <p className="text-xs text-gray-400 text-center mt-3">Secure payment via Razorpay · GST invoice on request</p>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 px-4 bg-blue-600 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Ready to land more interviews?</h2>
        <p className="text-blue-100 text-sm mb-6">Join thousands of Indian job seekers already using Resume Expert Pro.</p>
        <UpgradeButton className="inline-block px-10" />
      </section>

    </div>
  )
}
