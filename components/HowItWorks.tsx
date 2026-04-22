const STEPS = [
  {
    n: '1',
    title: 'Build or upload',
    desc: 'No resume? Build one from scratch in minutes. Already have one? Upload it directly.',
    pro: false,
    color: { bg: 'bg-blue-50', text: 'text-blue-600', pill: 'bg-blue-600', border: 'border-blue-100' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    ),
  },
  {
    n: '2',
    title: 'Check your ATS score',
    desc: 'Get an instant score with specific gaps and improvements highlighted.',
    pro: false,
    color: { bg: 'bg-green-50', text: 'text-green-600', pill: 'bg-green-600', border: 'border-green-100' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    n: '3',
    title: 'Fix, download & apply',
    desc: 'Improve your resume, download the polished version, and apply with confidence.',
    pro: true,
    color: { bg: 'bg-amber-50', text: 'text-amber-600', pill: 'bg-amber-500', border: 'border-amber-100' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
    ),
  },
  {
    n: '4',
    title: 'Book an expert review',
    desc: 'Want a second opinion? Book a 30-minute 1:1 session with a resume expert and get personalised feedback before you apply.',
    pro: true,
    color: { bg: 'bg-purple-50', text: 'text-purple-600', pill: 'bg-purple-600', border: 'border-purple-100' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${step.color.bg} rounded-xl flex items-center justify-center ${step.color.text}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {step.icon}
                  </svg>
                </div>
                <span className={`text-xs font-bold text-white ${step.color.pill} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {step.n}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5 flex-wrap">
                  {step.title}
                  {step.pro && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full tracking-wide">PRO</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
