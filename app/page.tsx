import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import BuilderDemo from '@/components/BuilderDemo'
import HowItWorks from '@/components/HowItWorks'
import ATSPreview from '@/components/ATSPreview'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = {
  title: "India's Best Resume Templates — ATS-Friendly | ResumeNow",
  description: 'Browse 35+ professionally designed, ATS-optimised resume templates for Indian job seekers. One-time purchase, lifetime access. Download in PDF & DOCX.',
  alternates: { canonical: 'https://www.resumenow.in' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ResumeNow',
  url: 'https://www.resumenow.in',
  description: "India's best ATS-friendly resume templates for job seekers.",
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.resumenow.in/templates',
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. How it works */}
      <HowItWorks />

      {/* 3. ATS score preview */}
      <ATSPreview />

      {/* 4. Pro upgrade section */}
      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Go further with Pro</h2>
            <p className="text-gray-500 text-sm">One-time payment. Lifetime access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600 mb-1">5 templates</div>
                <div className="text-base font-semibold text-gray-700 mb-1.5">Resume Creator</div>
                <p className="text-sm text-gray-400 leading-relaxed">Build and download your resume in a professional template. No design skills needed.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600 mb-1">Unlimited</div>
                <div className="text-base font-semibold text-gray-700 mb-1.5">ATS Checks</div>
                <p className="text-sm text-gray-400 leading-relaxed">Keep improving until your score is interview-ready. Check as many times as you need.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600 mb-1">1:1 Expert Session</div>
                <div className="text-base font-semibold text-gray-700 mb-1.5">30 min session</div>
                <p className="text-sm text-gray-400 leading-relaxed">Live resume review with an expert. Get actionable feedback before you apply.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Get Pro Access — ₹999
            </Link>
            <p className="text-xs text-gray-400 mt-2">One-time · no subscription · lifetime access</p>
          </div>
        </div>
      </section>

      {/* 5. Template grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2 tracking-tight">Professional templates, built for India</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Each template is a one-time purchase — pay once, download forever.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {TEMPLATES.slice(0, 4).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mt-6 mb-2">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              One-time payment
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" /></svg>
              Instant PDF download
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Lifetime access
            </span>
          </div>
          <div className="text-center mt-3">
            <Link href="/templates" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 text-sm">
              View all templates →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Builder demo */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Build your resume in minutes
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Fill in your details. Watch your resume come to life in real time. Download and apply.
            </p>
          </div>
          <BuilderDemo />
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              href="/builder"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm text-center"
            >
              Create my resume
            </Link>
            <Link
              href="/templates"
              className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm text-center"
            >
              Browse templates
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA strip */}
      <section className="py-14 px-4 bg-blue-600">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Ready to land your next job?</h2>
          <p className="text-blue-100 text-sm mb-6">Check your resume score in seconds — it&apos;s free.</p>
          <Link
            href="/ats-check"
            className="inline-block bg-white text-blue-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
          >
            Check Resume Score
          </Link>
        </div>
      </section>
    </>
  )
}
