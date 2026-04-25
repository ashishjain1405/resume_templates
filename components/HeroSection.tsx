'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const SCORE_TARGET = 72
const ATS_SCORE = 68
const RECRUITER_SCORE = 74

const BARS = [
  { label: 'Keyword Matching', value: 65, color: 'bg-amber-500', delay: '0.3s' },
  { label: 'Formatting & Structure', value: 80, color: 'bg-green-500', delay: '0.5s' },
  { label: 'Contact Information', value: 88, color: 'bg-green-500', delay: '0.7s' },
  { label: 'Measurable Achievements', value: 55, color: 'bg-red-400', delay: '0.9s' },
  { label: 'Job Relevance', value: 70, color: 'bg-amber-500', delay: '1.1s' },
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
  {
    original: 'Collaborated with cross-functional teams on product launches',
    improved: 'Partnered with design, PM, and engineering to ship 4 launches, reaching 200k users',
  },
]

const CARD_STYLE = 'absolute inset-0 w-full bg-transparent p-3 lg:p-4'

function ATSAnimation() {
  const [cycle, setCycle] = useState(0)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [stage, setStage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const ringSize = isMobile ? 60 : 84
  const r = isMobile ? 24 : 34
  const circ = 2 * Math.PI * r
  const cx = ringSize / 2
  const strokeWidth = isMobile ? 5 : 7

  function reset() {
    setStage(0)
    setDone(false)
    setScore(0)
    setStarted(false)
    setCycle(c => c + 1)
  }

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400)
    return () => clearTimeout(t)
  }, [cycle])

  useEffect(() => {
    if (!started) return
    const duration = 1200
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScore(Math.round(eased * SCORE_TARGET))
      if (progress < 1) { raf = requestAnimationFrame(tick) }
      else setDone(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started])

  useEffect(() => {
    if (!done) return
    const t1 = setTimeout(() => setStage(1), 800)
    const t2 = setTimeout(() => setStage(2), 800 + 600 + 2500)
    const t3 = setTimeout(() => reset(), 800 + 600 + 2500 + 600 + 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [done])

  const fill = started ? circ - (score / 100) * circ : circ
  const ringColor = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  const card1Bars = BARS.slice(0, isMobile ? 2 : 3)
  const card2Bars = BARS.slice(0, isMobile ? 3 : 5)
  const rewrites = REWRITES

  return (
    <div className="w-full max-w-md">
      <style>{`
        @keyframes cardSlideBack {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to   { transform: translateY(14px) scale(0.96); opacity: 0; }
        }
        @keyframes cardSlideFront {
          from { transform: translateY(10px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="relative h-[220px] lg:h-[340px]">

        {/* Card 1 — Scores */}
        <div
          className={CARD_STYLE}
          style={stage === 0
            ? { zIndex: 2, animation: done && stage > 0 ? 'cardSlideBack 0.6s cubic-bezier(0.4,0,0.2,1) forwards' : undefined }
            : { zIndex: 0, opacity: 0, pointerEvents: 'none' }}
        >
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[9px] lg:text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full">Resume Score Report</span>
            <span className={`text-[9px] lg:text-[11px] font-medium transition-colors duration-500 ${done ? 'text-green-600' : 'text-gray-400'}`}>
              {done ? '✓ Done' : 'Analysing…'}
            </span>
          </div>

          <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
            <div className="relative inline-flex items-center justify-center flex-shrink-0">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
                <circle cx={cx} cy={cx} r={r} fill="none"
                  stroke={started ? ringColor : '#f3f4f6'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circ}
                  strokeDashoffset={fill}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease' }}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-base lg:text-xl font-bold text-gray-900 leading-none">{score}</div>
              </div>
            </div>
            <div>
              <div className="text-xs lg:text-sm font-bold text-gray-900 mb-1 lg:mb-1.5">
                {score >= 75 ? 'Strong resume' : score >= 50 ? 'Needs improvement' : 'Significant gaps'}
              </div>
              <div className="flex gap-2 lg:gap-3">
                <div>
                  <div className="text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-wide font-medium">ATS</div>
                  <div className="text-xs lg:text-sm font-bold text-blue-600">{started ? ATS_SCORE : 0}</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <div className="text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-wide font-medium">Recruiter</div>
                  <div className="text-xs lg:text-sm font-bold text-violet-600">{started ? RECRUITER_SCORE : 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 lg:space-y-2">
            <div className="text-[9px] lg:text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Section Breakdown</div>
            {card1Bars.map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-[9px] lg:text-[11px] mb-0.5">
                  <span className="text-gray-600 font-medium">{bar.label}</span>
                  <span className="text-gray-400">{bar.value}</span>
                </div>
                <div className="h-1 lg:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} rounded-full`}
                    style={{ width: started ? `${bar.value}%` : '0%', transition: 'width 0.6s ease', transitionDelay: started ? bar.delay : '0s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — Section Breakdown */}
        <div
          className={CARD_STYLE}
          style={stage === 1
            ? { zIndex: 2, animation: 'cardSlideFront 0.6s cubic-bezier(0.4,0,0.2,1) forwards' }
            : stage > 1
              ? { zIndex: 0, animation: 'cardSlideBack 0.6s cubic-bezier(0.4,0,0.2,1) forwards', opacity: 0, pointerEvents: 'none' }
              : { zIndex: 0, opacity: 0, pointerEvents: 'none' }}
        >
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[9px] lg:text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full">Section Breakdown</span>
            <span className="text-[9px] lg:text-[11px] font-medium text-green-600">✓ Done</span>
          </div>
          <div className="space-y-1.5 lg:space-y-2.5">
            {card2Bars.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[9px] lg:text-[11px] mb-0.5">
                  <span className="text-gray-600 font-medium">{bar.label}</span>
                  <span className="text-gray-400">{bar.value}</span>
                </div>
                <div className="h-1 lg:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} rounded-full`}
                    style={{ width: stage >= 1 ? `${bar.value}%` : '0%', transition: 'width 0.6s ease', transitionDelay: stage >= 1 ? `${i * 0.13}s` : '0s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Suggested Rewrites */}
        <div
          className={CARD_STYLE}
          style={stage === 2
            ? { zIndex: 2, animation: 'cardSlideFront 0.6s cubic-bezier(0.4,0,0.2,1) forwards' }
            : { zIndex: 0, opacity: 0, pointerEvents: 'none' }}
        >
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[9px] lg:text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full">Suggested Rewrites</span>
            <span className="text-[9px] lg:text-[11px] font-medium text-green-600">✓ Done</span>
          </div>
          <div className="space-y-2.5 lg:space-y-4">
            {rewrites.map((rw, i) => (
              <div key={i} className="text-[10px] lg:text-xs space-y-1 lg:space-y-1.5"
                style={{ opacity: 0, animation: stage === 2 ? 'fadeInUp 0.3s ease forwards' : undefined, animationDelay: `${0.3 + i * 0.2}s` }}>
                <p className="text-gray-400 line-through leading-snug">{rw.original}</p>
                <p className="text-gray-800 leading-snug flex gap-1.5">
                  <span className="text-green-500 font-bold flex-shrink-0">→</span>{rw.improved}
                </p>
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
    <section className="bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">

          {/* Left — copy */}
          <div className="flex-1 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
              <span className="whitespace-nowrap">Not just ATS-ready.</span><br />
              <span className="text-blue-600">Hire-ready.</span>
            </h1>
            <p className="text-gray-500 text-base mb-5 leading-relaxed">
              Get your free resume score, built for ATS and recruiters. See what to improve and land more interviews.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/ats-check" className="w-full text-center bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                Check Resume Score
              </Link>
              <Link href="/templates" className="w-full text-center border border-gray-300 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">
                Browse templates
              </Link>
            </div>
          </div>

          {/* Right — animated card deck */}
          <div className="flex flex-1 justify-center lg:justify-end w-full">
            <ATSAnimation />
          </div>

        </div>
      </div>
    </section>
  )
}
