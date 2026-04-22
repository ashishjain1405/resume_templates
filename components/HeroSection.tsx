'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const SCORE_TARGET = 72
const BARS = [
  { label: 'Keyword Matching', value: 65, color: 'bg-amber-500', delay: '0.5s' },
  { label: 'Formatting & Structure', value: 80, color: 'bg-green-500', delay: '0.8s' },
  { label: 'Achievements', value: 55, color: 'bg-red-400', delay: '1.1s' },
]
const SUGGESTIONS = [
  'Add measurable achievements (e.g. "grew revenue by 30%")',
  'Include missing keywords: Python, SQL, Leadership',
  'Move contact details to the top of your resume',
]

function ATSAnimation() {
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const r = 54
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!started) return
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScore(Math.round(eased * SCORE_TARGET))
      if (progress < 1) requestAnimationFrame(tick)
      else setDone(true)
    }
    requestAnimationFrame(tick)
  }, [started])

  // Trigger card-deck flip 600ms after score completes
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setFlipped(true), 600)
    return () => clearTimeout(t)
  }, [done])

  const fill = started ? circ - (score / 100) * circ : circ
  const ringColor = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  const cardBase = 'absolute inset-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6'

  return (
    <div className="w-full max-w-sm" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes cardFlipBack {
          from { transform: translateY(0) scale(1) translateZ(0); z-index: 2; }
          to   { transform: translateY(18px) scale(0.95) translateZ(-40px); z-index: 0; }
        }
        @keyframes cardFlipFront {
          from { transform: translateY(12px) scale(0.97) translateZ(-20px); opacity: 0; }
          to   { transform: translateY(0) scale(1) translateZ(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Fixed-height container so size never changes */}
      <div className="relative" style={{ height: '420px' }}>

        {/* Back card — score (slides back when flipped) */}
        <div
          className={cardBase}
          style={{
            zIndex: flipped ? 0 : 2,
            animation: flipped ? 'cardFlipBack 1s cubic-bezier(0.4,0,0.2,1) forwards' : undefined,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">ATS Score Report</span>
            <span className={`text-xs font-medium transition-colors duration-500 ${done ? 'text-green-600' : 'text-gray-400'}`}>
              {done ? '✓ Analysis complete' : 'Analysing…'}
            </span>
          </div>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative inline-flex items-center justify-center flex-shrink-0">
              <svg width="128" height="128" className="-rotate-90">
                <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={r} fill="none"
                  stroke={started ? ringColor : '#f3f4f6'}
                  strokeWidth="10"
                  strokeDasharray={circ}
                  strokeDashoffset={fill}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease' }}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl font-bold text-gray-900">{score}</div>
                <div className="text-[10px] text-gray-400 font-medium">/100</div>
              </div>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">
                {score >= 75 ? 'Strong resume' : score >= 50 ? 'Needs improvement' : 'Significant gaps'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">ATS Compatibility</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {['Python', 'SQL', 'Leadership'].map(kw => (
                  <span key={kw} className="bg-red-50 text-red-500 border border-red-100 text-[10px] px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Section Breakdown</div>
            {BARS.map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{bar.label}</span>
                  <span className="text-gray-400">{bar.value}/100</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar.color} rounded-full`}
                    style={{
                      width: started ? `${bar.value}%` : '0%',
                      transition: 'width 0.6s ease',
                      transitionDelay: started ? bar.delay : '0s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Front card — suggestions (slides forward when flipped) */}
        <div
          className={cardBase}
          style={{
            zIndex: flipped ? 2 : 0,
            opacity: 0,
            transform: 'translateY(12px) scale(0.97) translateZ(-20px)',
            animation: flipped ? 'cardFlipFront 1s cubic-bezier(0.4,0,0.2,1) forwards' : undefined,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Improvement Plan</span>
            <span className="text-xs font-medium text-green-600">✓ Analysis complete</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-5">
            {['Python', 'SQL', 'Leadership'].map(kw => (
              <span key={kw} className="bg-red-50 text-red-500 border border-red-100 text-[10px] px-2 py-0.5 rounded-full">{kw} missing</span>
            ))}
          </div>
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Suggestions</div>
            {SUGGESTIONS.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-3"
                style={{
                  opacity: flipped ? 1 : 0,
                  animation: flipped ? `fadeInUp 0.3s ease forwards` : undefined,
                  animationDelay: `${0.3 + i * 0.15}s`,
                }}
              >
                <span className="text-amber-500 font-bold text-sm flex-shrink-0 mt-0.5">→</span>
                <span className="text-xs text-gray-700 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

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
                  Check Resume Score
                </Link>
                <Link
                  href="/templates"
                  className="w-full text-center border border-gray-300 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Browse templates
                </Link>
              </div>
            </div>

            {/* Right — animated ATS card deck */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <ATSAnimation />
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
