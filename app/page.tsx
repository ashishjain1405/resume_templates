import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'

const STEPS = [
  {
    number: '01',
    title: 'Browse templates',
    desc: 'Choose from 5 professionally designed layouts suited for every industry and experience level.',
  },
  {
    number: '02',
    title: 'Buy once',
    desc: 'One-time payment via Razorpay. No subscription, no hidden fees. The template is yours forever.',
  },
  {
    number: '03',
    title: 'Download & use',
    desc: 'Instantly download your template in PDF and DOCX. Edit it in Word or Google Docs and apply.',
  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Templates section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Choose your template
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Every template is ATS-friendly and available in PDF + DOCX. Buy once, keep forever.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 text-sm"
            >
              View all templates →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">How it works</h2>
            <p className="text-gray-400 text-sm">Get your resume ready in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Ready to stand out?
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Join 1,000+ job seekers who landed interviews with our templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/templates"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
            >
              Browse templates
            </Link>
            <Link
              href="/auth/signup"
              className="border border-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
