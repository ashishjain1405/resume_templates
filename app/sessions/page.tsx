import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import BuySessionButton from './BuySessionButton'

interface Session {
  id: string
  scheduled_at: string
  meet_link: string | null
  status: string
  user_name: string | null
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  })
}

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup?redirect=/sessions')

  const [{ data: sessions }, { count: extraPurchases }] = await Promise.all([
    supabase.from('sessions').select('id, scheduled_at, meet_link, status, user_name').eq('user_id', user.id).order('scheduled_at', { ascending: false }),
    supabase.from('session_purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const now = new Date()
  const upcoming = (sessions ?? []).filter((s: Session) => new Date(s.scheduled_at) > now && s.status === 'confirmed')
  const past = (sessions ?? []).filter((s: Session) => new Date(s.scheduled_at) <= now || s.status !== 'confirmed')

  const totalCredits = 1 + (extraPurchases ?? 0)
  const hasRemainingCredits = (sessions ?? []).length < totalCredits

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Sessions</h1>
          <p className="text-gray-500 text-sm">Your expert resume review sessions.</p>
        </div>
        {(sessions ?? []).length > 0 && hasRemainingCredits && (
          <Link href="/sessions/book" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            Book a session
          </Link>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((s: Session) => (
              <div key={s.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">{formatDateTime(s.scheduled_at)} IST</div>
                  <div className="text-xs text-gray-400">30-minute expert session</div>
                </div>
                {s.meet_link && (
                  <a
                    href={s.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Meet
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Past</h2>
          <div className="space-y-3">
            {past.map((s: Session) => (
              <div key={s.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap opacity-60">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-0.5">{formatDateTime(s.scheduled_at)} IST</div>
                  <div className="text-xs text-gray-400">{s.status === 'cancelled' ? 'Cancelled' : 'Completed'}</div>
                </div>
                {s.meet_link && (
                  <a href={s.meet_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Recording link</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used all credits — show buy CTA */}
      {(sessions ?? []).length > 0 && !hasRemainingCredits && upcoming.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">You&apos;ve used your included expert session</p>
          <p className="text-xs text-gray-500 mb-4">Book another 30-minute 1:1 review at ₹299.</p>
          <BuySessionButton userEmail={user.email ?? ''} />
        </div>
      )}

      {(sessions ?? []).length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No sessions yet</p>
          <p className="text-xs text-gray-400 mb-5">Book a 30-minute expert review session.</p>
          <Link href="/sessions/book" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            Book your first session
          </Link>
        </div>
      )}
    </div>
  )
}
