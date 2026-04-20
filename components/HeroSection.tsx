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
                India&apos;s Top |<br />
                <span className="text-blue-600">Resume Templates</span>
              </h1>
              <p className="text-gray-500 text-base mb-6 leading-relaxed">
                Get the job 2x as fast. Use recruiter-approved templates and step-by-step content recommendations to create a standout resume.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                <Link
                  href="/templates"
                  className="w-full text-center bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Create new resume
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full text-center border border-gray-300 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Optimize my resume
                </Link>
              </div>

              {/* Trustpilot badge */}
              <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl w-fit">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-[#00b67a] flex items-center justify-center rounded-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">EXCELLENT</div>
                  <div className="text-xs text-gray-500">4.5 out of 5 based on <span className="font-medium">16,844 reviews</span></div>
                </div>
                <div className="text-[10px] font-bold text-[#00b67a] border border-[#00b67a] px-1.5 py-0.5 rounded">Trustpilot</div>
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
                {/* Decorative shadow card behind */}
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
          <span className="text-gray-400 font-black text-lg italic tracking-tighter hover:text-gray-600 transition-colors">Nike</span>
          <span className="text-gray-400 font-semibold text-sm tracking-wide hover:text-gray-600 transition-colors">Microsoft</span>
        </div>
      </div>
    </>
  )
}
