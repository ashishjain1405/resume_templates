import Link from 'next/link'
import MulticolumnPreview from './resume-previews/Multicolumn'

export default function HeroSection() {
  return (
    <>
      <section className="bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left — copy */}
            <div className="flex-1 max-w-lg">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                Get hired faster with an<br />
                <span className="text-blue-600">ATS-ready resume</span>
              </h1>
              <p className="text-gray-500 text-base mb-6 leading-relaxed">
                Check your resume score free. See exactly what&apos;s missing. Fix the gaps and land more interviews.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                <Link
                  href="/ats-check"
                  className="w-full text-center bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Check my resume score — free
                </Link>
                <Link
                  href="/templates"
                  className="w-full text-center border border-gray-300 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Browse templates
                </Link>
              </div>
            </div>

            {/* Right — resume preview */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-56 lg:w-64">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" style={{ height: '320px' }}>
                  <MulticolumnPreview />
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  ATS-Friendly ✓
                </div>
                <div className="absolute -bottom-2 -left-3 w-full h-full bg-blue-50 rounded-xl border border-blue-100 -z-10" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hired-by strip */}
      <div className="bg-gray-50 border-y border-gray-100 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Our customers have been hired by</span>
          <span className="text-gray-400 font-black text-base tracking-tight hover:text-gray-600 transition-colors">TATA</span>
          <span className="text-gray-400 font-normal text-base tracking-tight hover:text-gray-600 transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>Google</span>
          <svg className="text-gray-400 hover:text-gray-600 transition-colors" width="48" height="18" viewBox="0 0 24 9" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 0.6L7.2 7.8C5.7 8.4 4.4 8.7 3.3 8.7c-1.3 0-2.2-.5-2.7-1.4C.1 6.5.3 5.1 1.1 3.6L2.4 1.2c.2-.4.1-.6-.2-.5L.6 1.1C.2 1.2 0 1.6 0 2.1c0 .3.1.6.2.9L1.9 6.3c.3.7.1 1.3-.5 1.6C.9 8.2.4 8 .1 7.4L0 7.1c-.1-.2 0-.4.1-.6L2.2.4C2.4.1 2.7 0 3 0c.2 0 .4.1.5.2L24 .6z"/>
          </svg>
          <span className="text-gray-400 font-semibold text-sm tracking-wide hover:text-gray-600 transition-colors">Microsoft</span>
        </div>
      </div>
    </>
  )
}
