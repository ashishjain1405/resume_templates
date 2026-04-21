const STEPS = [
  {
    n: '1',
    title: 'Build or upload',
    desc: "No resume? Build one from scratch in minutes. Already have one? Upload it directly.",
  },
  {
    n: '2',
    title: 'Check your ATS score',
    desc: 'Get an instant score with specific gaps and improvements highlighted.',
  },
  {
    n: '3',
    title: 'Fix, download & apply',
    desc: 'Improve your resume, download the polished version, and apply with confidence.',
  },
  {
    n: '4',
    title: 'Book an expert review',
    desc: 'Want a second opinion? Book a 30-minute 1:1 session with a resume expert and get personalised feedback before you apply.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative flex flex-col items-center text-center px-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base mb-4 flex-shrink-0">
                {step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-0 h-px border-t-2 border-dashed border-blue-200" />
              )}
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
