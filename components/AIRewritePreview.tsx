'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const ORIG_SCORE = 58
const ORIG_ATS = 54
const ORIG_REC = 62
const REW_SCORE = 88
const REW_ATS = 86
const REW_REC = 90

const REWRITES = [
  {
    original: 'Responsible for leading engineering projects and managing team members.',
    improved: 'Led 5-engineer squad to ship payments redesign 2 weeks early, unblocking ₹2Cr in revenue.',
  },
  {
    original: 'Worked on improving API performance across microservices.',
    improved: 'Cut API p95 latency from 820ms to 190ms by introducing Redis caching across 4 microservices.',
  },
  {
    original: 'Collaborated with cross-functional teams on various product initiatives.',
    improved: 'Partnered with design and product to define and ship 3 features in Q3, driving 18% DAU increase.',
  },
]

function ScoreRing({ score, size = 64, color, dimBg = false }: { score: number; size?: number; color: string; dimBg?: boolean }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const cx = size / 2
  const sw = size * 0.09
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={dimBg ? '#374151' : '#f3f4f6'} strokeWidth={sw} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`font-bold leading-none ${dimBg ? 'text-gray-400' : 'text-gray-900'}`} style={{ fontSize: size * 0.22 }}>{score}</div>
      </div>
    </div>
  )
}

export default function AIRewritePreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)
  const [shimmering, setShimmering] = useState(false)
  const [score, setScore] = useState(ORIG_SCORE)
  const [atsScore, setAtsScore] = useState(ORIG_ATS)
  const [recScore, setRecScore] = useState(ORIG_REC)
  const [bulletIdx, setBulletIdx] = useState(-1)
  const [badgeVisible, setBadgeVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered) return
    setShimmering(true)
    const shimmerOff = setTimeout(() => setShimmering(false), 900)

    const animStart = 900
    const duration = 1000
    let raf: number
    const t = setTimeout(() => {
      const start = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setScore(Math.round(ORIG_SCORE + eased * (REW_SCORE - ORIG_SCORE)))
        setAtsScore(Math.round(ORIG_ATS + eased * (REW_ATS - ORIG_ATS)))
        setRecScore(Math.round(ORIG_REC + eased * (REW_REC - ORIG_REC)))
        if (progress < 1) { raf = requestAnimationFrame(tick) }
        else {
          setScore(REW_SCORE)
          setAtsScore(REW_ATS)
          setRecScore(REW_REC)
          REWRITES.forEach((_, i) => setTimeout(() => setBulletIdx(i), 200 + i * 350))
          setTimeout(() => setBadgeVisible(true), 200 + REWRITES.length * 350 + 100)
        }
      }
      raf = requestAnimationFrame(tick)
    }, animStart)

    return () => { clearTimeout(shimmerOff); clearTimeout(t); cancelAnimationFrame(raf) }
  }, [triggered])

  const rewRingColor = score >= 75 ? '#16a34a' : '#d97706'

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Your resume, rewritten in seconds</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Paste your resume. AI fixes weak bullets, adds missing keywords, and lifts your score — instantly.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Before</div>
              <div className="flex items-center gap-4">
                <ScoreRing score={ORIG_SCORE} size={60} color="#d97706" dimBg />
                <div className="flex gap-4">
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wide font-medium mb-0.5">ATS</div>
                    <div className="text-base font-bold text-gray-500">{ORIG_ATS}</div>
                  </div>
                  <div className="w-px bg-gray-700" />
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wide font-medium mb-0.5">Recruiter</div>
                    <div className="text-base font-bold text-gray-500">{ORIG_REC}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {REWRITES.map((rw, i) => (
                <p key={i} className="text-[11px] text-gray-600 line-through leading-snug">{rw.original}</p>
              ))}
            </div>
          </div>

          {/* Centre AI badge — desktop only */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1">
            <div className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/30">AI</div>
            <div className="text-blue-400 text-xs">→</div>
          </div>

          {/* After */}
          <div className={`bg-white rounded-2xl ring-1 ring-blue-200 overflow-hidden shadow-xl shadow-blue-500/10 transition-all duration-300 ${shimmering ? 'animate-pulse' : ''}`}>
            <div className="px-5 py-4 border-b border-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">After AI Re-write</div>
                <span
                  className="text-sm font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700"
                  style={{ opacity: badgeVisible ? 1 : 0, transform: badgeVisible ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}
                >
                  +{REW_SCORE - ORIG_SCORE} pts
                </span>
              </div>
              <div className="flex items-center gap-4">
                <ScoreRing score={score} size={60} color={rewRingColor} />
                <div className="flex gap-4">
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">ATS</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-blue-600">{atsScore}</span>
                      <span
                        className="text-[9px] font-bold text-green-600"
                        style={{ opacity: badgeVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                      >+{REW_ATS - ORIG_ATS}</span>
                    </div>
                  </div>
                  <div className="w-px bg-gray-100" />
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Recruiter</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-violet-600">{recScore}</span>
                      <span
                        className="text-[9px] font-bold text-green-600"
                        style={{ opacity: badgeVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                      >+{REW_REC - ORIG_REC}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {REWRITES.map((rw, i) => (
                <p key={i} className="text-[11px] text-gray-800 leading-snug flex gap-1.5"
                  style={{ opacity: bulletIdx >= i ? 1 : 0, transform: bulletIdx >= i ? 'none' : 'translateY(6px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
                  <span className="text-green-500 font-bold flex-shrink-0 mt-px">✓</span>{rw.improved}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/ats-check" className="inline-block bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Rewrite My Resume Free
          </Link>
        </div>
      </div>
    </section>
  )
}
