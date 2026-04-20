import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'

const FEATURES = [
  { icon: '📄', title: '35+ Template Designs', desc: 'Professionally designed layouts for every industry' },
  { icon: '✨', title: 'Enhance with AI', desc: 'AI-powered content suggestions to strengthen your resume' },
  { icon: '🔍', title: 'Resume Review', desc: 'Get instant feedback on your resume quality' },
  { icon: '✉️', title: 'AI Cover Letter Builder', desc: 'Generate tailored cover letters in seconds' },
  { icon: '📊', title: 'ATS Optimized', desc: 'Pass applicant tracking systems every time' },
  { icon: '⬇️', title: 'Instant Download', desc: 'Download in PDF and DOCX formats immediately' },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Create a resume that gets results
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose from our recruiter-approved templates. Download once, keep forever.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              View all templates →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            6 features to boost your job search
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to land your dream job?</h2>
          <p className="text-blue-100 mb-8">
            Join over 1 million job seekers who have used our templates to get hired.
          </p>
          <Link
            href="/templates"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Choose a template
          </Link>
        </div>
      </section>
    </>
  )
}
