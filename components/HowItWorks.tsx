const STEPS: { n: string; title: string; desc: string; pro?: boolean }[] = [
  {
    n: '1',
    title: 'Build or upload',
    desc: "No resume? Build one in minutes. Already have one? Just upload it.",
  },
  {
    n: '2',
    title: 'See how your resume stacks up',
    desc: 'Get an instant score - see exactly what\'s holding you back and how to fix it.',
  },
  {
    n: '3',
    title: 'Fix, download & apply',
    desc: 'Improve your resume, download the polished version, and apply with confidence.',
    pro: true,
  },
  {
    n: '4',
    title: 'Book an expert review',
    pro: true,
    desc: 'Want an expert opinion? Book a 30-minute 1:1 with a resume expert and get personalised feedback before you hit send.',
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
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 justify-center">
                {step.title}
                {step.pro && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full tracking-wide">PRO</span>}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
