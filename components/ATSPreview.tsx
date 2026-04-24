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
      </div>
    </div>
  )
}

function MiniBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{score}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

const TOP_ISSUES = [
  'No quantified achievements in experience bullets',
  'Missing key technical skills for this role',
  'Contact section lacks LinkedIn URL',
]

const REWRITES = [
  {
    original: 'Responsible for managing a team of 5 engineers',
    improved: 'Led 5-engineer team delivering 3 features on time, reducing backlog by 40%',
  },
  {
    original: 'Worked on improving application performance',
    improved: 'Optimised API response time by 35% (800ms → 520ms) via query indexing',
  },
]

export default function ATSPreview() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">What your Resume report looks like</h2>
          <p className="text-gray-500 text-sm">Instant score. Clear gaps. Actionable fixes.</p>
        </div>

        <div className="max-w-xl mx-auto relative">
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">

            {/* Score row */}
            <div className="flex items-center gap-5">
              <MiniRing score={58} />
              <div>
                <div className="text-base font-bold text-gray-900 mb-1">Needs improvement</div>
                <div className="flex gap-3">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">ATS</div>
                    <div className="text-base font-bold text-blue-600">54</div>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Recruiter</div>
                    <div className="text-base font-bold text-violet-600">62</div>
                  </div>
                </div>
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

            {/* Top Issues */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Issues</div>
              <ul className="space-y-2">
                {TOP_ISSUES.map((issue, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">!</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Rewrites */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggested Rewrites</div>
              <div className="space-y-4">
                {REWRITES.map((r, i) => (
                  <div key={i} className="text-sm space-y-1.5">
                    <p className="text-gray-400 line-through leading-snug">{r.original}</p>
                    <p className="text-gray-800 leading-snug flex gap-1.5"><span className="text-green-500 font-bold flex-shrink-0">→</span>{r.improved}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Improve — partially visible, fades into CTA */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">How to Improve</div>
              <ul className="space-y-2">
                <li className="flex gap-2.5 text-sm text-gray-300 blur-[2px] select-none">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 mt-0.5 bg-red-50 text-red-200">high</span>
                  Add measurable outcomes to your internship bullets using the CAR format.
                </li>
                <li className="flex gap-2.5 text-sm text-gray-300 blur-[3px] select-none">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 mt-0.5 bg-amber-50 text-amber-200">med</span>
                  Include a dedicated Skills section listing tools and certifications explicitly.
                </li>
              </ul>
            </div>

          </div>

          {/* CTA overlay */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/90 to-transparent rounded-b-2xl flex items-end justify-center pb-5">
            <Link
              href="/ats-check"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg"
            >
              Check Resume Score
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
