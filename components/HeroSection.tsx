import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="bg-white py-16 px-4 border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 mb-5 text-xs text-gray-600">
              <span className="text-yellow-400 tracking-tight">★★★★★</span>
              <span className="font-semibold text-gray-700">4.5/5</span>
              <span className="text-gray-400">·</span>
              <span>16,844 reviews</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
              India&apos;s Top<br />
              <span className="text-blue-600">Resume Templates</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Recruiter-approved templates that help you land interviews faster. Buy once, download forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/templates"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm"
              >
                Browse templates
              </Link>
              <Link
                href="/auth/signup"
                className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center text-sm"
              >
                Create free account
              </Link>
            </div>

            <div className="mt-10">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Hired at</p>
              <div className="flex items-center gap-6 justify-center lg:justify-start flex-wrap">
                {['Tata', 'Google', 'Nike', 'Microsoft'].map((company) => (
                  <span key={company} className="text-gray-300 font-bold text-sm tracking-wide">{company}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — resume card collage */}
          <div className="flex-1 relative h-72 lg:h-96 w-full max-w-sm mx-auto">

            {/* Back card */}
            <div className="absolute top-4 right-0 w-44 lg:w-52 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 rotate-6 opacity-60">
              <div className="h-2 bg-purple-400 rounded w-2/3 mb-3" />
              <div className="space-y-1.5">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                <div className="h-1.5 bg-gray-100 rounded w-4/5" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-1/3" />
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </div>

            {/* Middle card */}
            <div className="absolute top-8 left-4 w-44 lg:w-52 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 -rotate-3 opacity-80">
              <div className="h-2 bg-emerald-400 rounded w-1/2 mb-3" />
              <div className="space-y-1.5">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                <div className="h-1.5 bg-gray-100 rounded w-5/6" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-1/4" />
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-2/3" />
              </div>
            </div>

            {/* Front card — main */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8 w-48 lg:w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full" />
                <div className="h-2 bg-gray-800 rounded w-20" />
              </div>
              <div className="h-1.5 bg-blue-200 rounded w-1/2 mb-3" />
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-5/6" />
                <div className="h-1.5 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-3">
                <div className="h-1.5 bg-gray-300 rounded w-1/3" />
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                <div className="h-1.5 bg-gray-300 rounded w-1/4" />
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow text-center">
                ATS ✓
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
