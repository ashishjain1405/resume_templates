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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Resume Builder</div>
                <p className="text-xs text-gray-500 leading-relaxed">Build and download your resume in a professional template. No design skills needed.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Unlimited ATS Checks</div>
                <p className="text-xs text-gray-500 leading-relaxed">Keep improving until your score is interview-ready. Check as many times as you need.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">1:1 Expert Session</div>
                <p className="text-xs text-gray-500 leading-relaxed">30-minute live resume review with an expert. Get actionable feedback before you apply.</p>
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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">Professional templates, built for India</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {TEMPLATES.slice(0, 4).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <div className="text-center mt-8">
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
              href="/builder/multicolumn"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm text-center"
            >
              Start building for free →
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
            Check my resume score — free
          </Link>
        </div>
      </section>
    </>
  )
}
