import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 mb-4 text-xs text-gray-600">
              <span className="text-yellow-400">★★★★★</span>
              <span className="font-semibold">4.5 out of 5</span>
              <span>based on 16,844 reviews</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              India&apos;s Top<br />
              <span className="text-blue-600">Resume Templates</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto lg:mx-0">
              Get the job 2x as fast. Use recruiter-approved templates and step-by-step content recommendations to create a standout resume.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/templates"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Browse templates
              </Link>
              <Link
                href="/auth/signup"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Create free account
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Our customers have been hired by</p>
              <div className="flex items-center gap-6 justify-center lg:justify-start flex-wrap">
                {['Tata', 'Google', 'Nike', 'Microsoft'].map((company) => (
                  <span key={company} className="text-gray-400 font-semibold text-sm">{company}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="relative w-full max-w-sm mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                  <div className="h-3 bg-blue-500 rounded w-1/2" />
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                    <div className="h-2 bg-gray-200 rounded w-4/5" />
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-1/4" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                ATS-Friendly ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
