import Link from 'next/link'

function MiniRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="#d97706" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-gray-900">{score}</div>
        <div className="text-[10px] text-gray-400 font-medium">/100</div>
      </div>
    </div>
  )
}

function MiniBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function ATSPreview() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">What your ATS report looks like</h2>
          <p className="text-gray-500 text-sm">Instant score. Clear gaps. Actionable fixes.</p>
        </div>

        <div className="max-w-xl mx-auto relative">
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Score row */}
            <div className="flex items-center gap-6">
              <MiniRing score={58} />
              <div>
                <div className="text-base font-bold text-gray-900">Needs improvement</div>
                <div className="text-sm text-gray-500 mt-0.5">ATS Compatibility Score</div>
              </div>
            </div>

            {/* Section bars */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Section Breakdown</div>
              <MiniBar label="Keyword Matching" score={45} color="bg-red-500" />
              <MiniBar label="Formatting & Structure" score={72} color="bg-amber-500" />
              <MiniBar label="Contact Information" score={90} color="bg-green-500" />
              <MiniBar label="Measurable Achievements" score={40} color="bg-red-500" />
            </div>

            {/* Missing keywords */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Missing Keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'SQL', 'Data Analysis', 'Stakeholder Management'].map(kw => (
                  <span key={kw} className="bg-red-50 text-red-600 border border-red-100 text-xs px-2.5 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            </div>

            {/* Blurred suggestions */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">How to Improve</div>
              <ul className="space-y-2">
                <li className="flex gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                  Add quantified achievements to each work experience bullet point.
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                  <span className="text-sm text-gray-300 blur-[3px] select-none flex-1">Include a dedicated skills section with role-specific technical keywords.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                  <span className="text-sm text-gray-300 blur-[3px] select-none flex-1">Use a single-column layout to ensure correct ATS parsing order.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent rounded-b-2xl flex items-end justify-center pb-4">
            <Link
              href="/ats-check"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg"
            >
              See your real score — free →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
