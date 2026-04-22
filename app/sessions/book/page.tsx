'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'

interface Slot {
  start: string
  end: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
}

function groupByDate(slots: Slot[]): Record<string, Slot[]> {
  const groups: Record<string, Slot[]> = {}
  for (const slot of slots) {
    const key = new Date(slot.start).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    if (!groups[key]) groups[key] = []
    groups[key].push(slot)
  }
  return groups
}

export default function BookSessionPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [step, setStep] = useState<'pick' | 'confirm' | 'done'>('pick')
  const [userName, setUserName] = useState('')
  const [booking, setBooking] = useState(false)
  const [meetLink, setMeetLink] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  useEffect(() => {
    fetch('/api/sessions/availability')
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 403) setError('pro_required')
          else setError(data.error ?? 'Could not load availability.')
          return
        }
        setSlots(data.slots ?? [])
      })
      .catch(() => setError('Could not load availability. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleBook() {
    if (!selectedSlot) return
    setBooking(true)
    setError('')
    try {
      const res = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: selectedSlot.start, end: selectedSlot.end, userName }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'session_limit_reached') {
          setError('You have already used your included expert session. Each Pro plan includes 1 session.')
        } else {
          setError(data.error ?? 'Booking failed.')
        }
        return
      }
      setMeetLink(data.meetLink)
      setScheduledAt(data.scheduledAt)
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const grouped = groupByDate(slots)
  const dates = Object.keys(grouped)
  const slotsForDate = selectedDate ? (grouped[selectedDate] ?? []) : []

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading availability…</p>
      </div>
    )
  }

  if (error === 'pro_required') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Access Required</h1>
        <p className="text-gray-500 mb-6 text-sm">Expert sessions are available to Pro members. Upgrade once for lifetime access.</p>
        <ProUpgradeCTAs layout="stack" source="sessions" />
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Booked!</h1>
        <p className="text-gray-500 text-sm mb-1">Your 30-minute expert session is confirmed.</p>
        <p className="text-sm font-medium text-gray-700 mb-6">{formatDate(scheduledAt)} · {formatTime(scheduledAt)}</p>
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Join Google Meet
          </a>
        )}
        <div className="block">
          <Link href="/sessions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all my sessions →</Link>
        </div>
      </div>
    )
  }

  if (step === 'confirm' && selectedSlot) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => setStep('pick')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm your booking</h1>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">{formatDate(selectedSlot.start)}</div>
          <div className="text-sm text-gray-600">{formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)} IST · 30 minutes</div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            placeholder="Enter your name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
        <button
          onClick={handleBook}
          disabled={booking}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {booking ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking…</>
          ) : 'Confirm Booking'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">A Google Calendar invite with Meet link will be sent to your email.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Feature
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Expert Session</h1>
        <p className="text-gray-500 max-w-xl text-sm">Get a 30-minute 1:1 resume review with an expert. Pick a slot below.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>}

      {slots.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">No slots available right now</p>
          <p className="text-xs text-gray-400">Check back soon — new slots open up every week.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Date list */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select a date</div>
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null) }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${selectedDate === date ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="font-medium">{formatDate(grouped[date][0].start)}</div>
                <div className={`text-xs mt-0.5 ${selectedDate === date ? 'text-blue-100' : 'text-gray-400'}`}>{grouped[date].length} slot{grouped[date].length !== 1 ? 's' : ''} available</div>
              </button>
            ))}
          </div>

          {/* Slot grid */}
          <div>
            {!selectedDate ? (
              <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400 text-sm">
                Select a date to see available times
              </div>
            ) : (
              <>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available times (IST)</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${selectedSlot?.start === slot.start ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      {formatTime(slot.start)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => selectedSlot && setStep('confirm')}
                  disabled={!selectedSlot}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
