'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const ORIG_SCORE = 58
const REW_SCORE = 84

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

function ScoreRing({ score, size = 72, color }: { score: number; size?: number; color: string }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const cx = size / 2
  const sw = size * 0.09
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
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
  const [cycle, setCycle] = useState(0)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(ORIG_SCORE)
  const [bulletIdx, setBulletIdx] = useState(-1)

  function reset() {
    setStarted(false)
    setScore(ORIG_SCORE)
    setBulletIdx(-1)
    setCycle(c => c + 1)
  }

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(t)
  }, [cycle])

  useEffect(() => {
    if (!started) return
    const duration = 1000
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScore(Math.round(ORIG_SCORE + eased * (REW_SCORE - ORIG_SCORE)))
      if (progress < 1) { raf = requestAnimationFrame(tick) }
      else {
        setScore(REW_SCORE)
        REWRITES.forEach((_, i) => {
          setTimeout(() => setBulletIdx(i), 300 + i * 350)
        })
        setTimeout(reset, 300 + REWRITES.length * 350 + 3000)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started])

  const rewRingColor = score >= 75 ? '#16a34a' : '#d97706'

  return (
    <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">AI Re-write — before &amp; after</h2>
          <p className="text-gray-500 text-sm">See how your bullets transform with one click.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Original</div>
                <ScoreRing score={ORIG_SCORE} size={56} color="#d97706" />
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {REWRITES.map((rw, i) => (
                  <p key={i} className="text-[11px] text-gray-400 line-through leading-snug">{rw.original}</p>
                ))}
              </div>
            </div>

            {/* Rewritten */}
            <div className="bg-white rounded-2xl border border-blue-200 ring-1 ring-blue-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">AI Rewritten</div>
                  {started && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
                      +{REW_SCORE - ORIG_SCORE} pts
                    </span>
                  )}
                </div>
                <ScoreRing score={score} size={56} color={rewRingColor} />
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
