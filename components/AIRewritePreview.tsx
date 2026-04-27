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

function ScoreRing({ score, size = 60, color, bgStroke = '#f3f4f6' }: { score: number; size?: number; color: string; bgStroke?: string }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const cx = size / 2
  const sw = size * 0.09
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={bgStroke} strokeWidth={sw} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-bold text-gray-900 leading-none" style={{ fontSize: size * 0.22 }}>{score}</div>
      </div>
    </div>
  )
}

export default function AIRewritePreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [struckIdx, setStruckIdx] = useState(-1)
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

    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1: strike through left bullets sequentially
    REWRITES.forEach((_, i) => {
      timers.push(setTimeout(() => setStruckIdx(i), 400 + i * 350))
    })

    // Phase 2: animate scores on the right
    const scoreStart = 1400
    const duration = 900
    let raf: number
    const scoreTimer = setTimeout(() => {
      const start = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setScore(Math.round(ORIG_SCORE + eased * (REW_SCORE - ORIG_SCORE)))
        setAtsScore(Math.round(ORIG_ATS + eased * (REW_ATS - ORIG_ATS)))
        setRecScore(Math.round(ORIG_REC + eased * (REW_REC - ORIG_REC)))
        if (progress < 1) {
          raf = requestAnimationFrame(tick)
        } else {
          setScore(REW_SCORE); setAtsScore(REW_ATS); setRecScore(REW_REC)
        }
      }
      raf = requestAnimationFrame(tick)
    }, scoreStart)
    timers.push(scoreTimer)

    // Phase 3: right bullets appear
    REWRITES.forEach((_, i) => {
      timers.push(setTimeout(() => setBulletIdx(i), 2400 + i * 350))
    })

    // Phase 4: badges pop in
    timers.push(setTimeout(() => setBadgeVisible(true), 3300))

    // Phase 5: reset and loop
    timers.push(setTimeout(() => {
      setStruckIdx(-1)
      setBulletIdx(-1)
      setBadgeVisible(false)
      setScore(ORIG_SCORE)
      setAtsScore(ORIG_ATS)
      setRecScore(ORIG_REC)
      setCycle(c => c + 1)
    }, 6500))

    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf) }
  }, [triggered, cycle])

  const rewRingColor = score >= 75 ? '#16a34a' : '#d97706'

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">AI Re-write - before &amp; after</h2>
          <p className="text-gray-500 text-sm">See your bullets transform with one click.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Before card */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Before</div>
                <div className="flex items-center gap-4">
                  <ScoreRing score={ORIG_SCORE} size={56} color="#d97706" bgStroke="#e5e7eb" />
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">ATS</div>
                      <div className="text-base font-bold text-gray-600">{ORIG_ATS}</div>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Recruiter</div>
                      <div className="text-base font-bold text-gray-600">{ORIG_REC}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {REWRITES.map((rw, i) => (
                  <p key={i} className="text-[11px] text-gray-600 leading-snug"
                    style={{
                      textDecorationLine: 'line-through',
                      textDecorationColor: struckIdx >= i ? 'rgba(156,163,175,1)' : 'rgba(156,163,175,0)',
                      transition: 'text-decoration-color 400ms ease',
                    }}
                  >{rw.original}</p>
                ))}
              </div>
            </div>

            {/* After card */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">AI Re-write</span>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700"
                    style={{ opacity: badgeVisible ? 1 : 0, transform: badgeVisible ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}
                  >
                    +{REW_SCORE - ORIG_SCORE} pts
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreRing score={score} size={56} color={rewRingColor} bgStroke="#dbeafe" />
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium mb-0.5">ATS</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-blue-700">{atsScore}</span>
                        <span
                          className="text-[9px] font-bold text-green-600"
                          style={{ opacity: badgeVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                        >+{REW_ATS - ORIG_ATS}</span>
                      </div>
                    </div>
                    <div className="w-px bg-blue-100" />
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-wide font-medium mb-0.5">Recruiter</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-violet-700">{recScore}</span>
                        <span
                          className="text-[9px] font-bold text-green-600"
                          style={{ opacity: badgeVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                        >+{REW_REC - ORIG_REC}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {REWRITES.map((rw, i) => (
                  <p key={i} className="text-[11px] text-gray-800 leading-snug flex gap-1"
                    style={{ opacity: bulletIdx >= i ? 1 : 0, transform: bulletIdx >= i ? 'none' : 'translateY(4px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
                    <span className="text-green-500 font-bold flex-shrink-0">→</span>{rw.improved}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/ats-check" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Try AI Re-write
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
