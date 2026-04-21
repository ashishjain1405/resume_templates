import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import BuilderDemo from '@/components/BuilderDemo'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = {
  title: "India's Best Resume Templates — ATS-Friendly | ResumeNow",
  description: 'Browse 35+ professionally designed, ATS-optimised resume templates for Indian job seekers. One-time purchase, lifetime access. Download in PDF & DOCX.',
  alternates: { canonical: 'https://www.resumenow.in' },
}

const FEATURES: { icon: React.ReactNode; title: string; desc: string; href?: string }[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Resume Builder',
    desc: 'Fill in your details and watch your resume update live. Download in seconds.',
    href: '/builder/multicolumn',
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'ATS Checker',
    desc: 'Upload your resume and get an instant ATS score with actionable improvements.',
    href: '/ats-check',
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
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
    title: '1:1 Expert Session',
    desc: 'Book a 30-minute live resume review with an expert. Get actionable feedback before you apply.',
    href: '/sessions/book',
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

      {/* Builder feature — animated demo section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">New</span>
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
              <div key={f.title} className={`rounded-xl p-6 border flex flex-col gap-3 transition-all ${f.href ? 'bg-blue-600 border-blue-700 hover:bg-blue-700 cursor-pointer' : 'bg-gray-50 border-gray-100 hover:shadow-sm'}`}>
                {f.href ? (
                  <Link href={f.href} className="flex flex-col gap-3 h-full">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white flex-shrink-0">{f.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-blue-100 leading-relaxed">{f.desc}</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-white underline underline-offset-2">Try it free →</span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">{f.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
