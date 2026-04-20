import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'

const FEATURES = [
  { icon: '📄', title: '35+ Template Designs', desc: 'Professionally crafted layouts for every role and industry' },
  { icon: '✨', title: 'Enhance with AI', desc: 'AI-powered suggestions to strengthen your bullet points' },
  { icon: '🔍', title: 'Resume Review', desc: 'Instant feedback on content, formatting and ATS score' },
  { icon: '✉️', title: 'AI Cover Letter Builder', desc: 'Generate tailored cover letters in seconds' },
  { icon: '📊', title: 'ATS Optimised', desc: 'All templates pass leading applicant tracking systems' },
  { icon: '⬇️', title: 'Instant Download', desc: 'Download in PDF and DOCX formats immediately after purchase' },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* "Create a resume that gets results" */}
      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            Create a resume<br />that gets results
          </h2>
          {/* Curved arrow SVG */}
          <div className="flex justify-center mb-6">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none" className="text-blue-400">
              <path d="M10 10 Q40 -10 65 30" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 3"/>
              <path d="M60 25 L65 30 L58 32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Ready to stand out?</h2>
          <p className="text-blue-200 text-sm mb-8">
            Join 1,000+ job seekers who landed interviews with our templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/templates" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
              Browse templates
            </Link>
            <Link href="/auth/signup" className="border border-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
