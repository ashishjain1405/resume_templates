import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = {
  title: "India's Best Resume Templates — ATS-Friendly | ResumeNow",
  description: 'Browse 35+ professionally designed, ATS-optimised resume templates for Indian job seekers. One-time purchase, lifetime access. Download in PDF & DOCX.',
  alternates: { canonical: 'https://www.resumenow.in' },
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: '35+ Template Designs',
    desc: 'Professionally crafted layouts for every role and industry',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Enhance with AI',
    desc: 'AI-powered suggestions to strengthen your bullet points',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
      </svg>
    ),
    title: 'Resume Review',
    desc: 'Instant feedback on content, formatting and ATS score',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: 'AI Cover Letter Builder',
    desc: 'Generate tailored cover letters in seconds',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'ATS Optimised',
    desc: 'All templates pass leading applicant tracking systems',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: 'Instant Download',
    desc: 'Download in PDF and DOCX formats immediately after purchase',
  },
]

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
      <HeroSection />

      {/* "Create a resume that gets results" */}
      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            Create a resume<br />that gets results
          </h2>
          {/* Curved arrow SVG — points right-to-left downward toward button */}
          <div className="flex justify-center mb-6">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none" className="text-blue-400">
              <path d="M70 10 Q40 -10 15 30" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 3"/>
              <path d="M20 25 L15 30 L22 32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link
            href="/templates"
            className="inline-block bg-blue-600 text-white px-10 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Choose a template
          </Link>
        </div>
      </section>

      {/* Template grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
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

      {/* 6 features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 tracking-tight">
            6 features to boost your job search
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-sm transition-shadow flex flex-col gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
