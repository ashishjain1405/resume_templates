import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { getAvailableSlots, createBookingEvent } from '@/lib/google-calendar'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)
    if (!pro) return Response.json({ error: 'Pro access required' }, { status: 403 })

    const { start, end, userName } = await request.json()
    if (!start || !end) return Response.json({ error: 'Invalid slot' }, { status: 400 })

    // Enforce 1-session limit per pro user
    const { count: existingCount } = await adminClient
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((existingCount ?? 0) >= 1) {
      return Response.json({ error: 'session_limit_reached' }, { status: 403 })
    }

    // Verify slot is still free
    const available = await getAvailableSlots(14)
    const stillFree = available.some((s) => s.start === start && s.end === end)
    if (!stillFree) return Response.json({ error: 'This slot is no longer available. Please choose another.' }, { status: 409 })

    const { eventId, meetLink } = await createBookingEvent(
      { start, end },
      { email: user.email!, name: userName || user.email! },
    )

    const { error: dbError } = await adminClient.from('sessions').insert({
      user_id: user.id,
      user_email: user.email!,
      user_name: userName || null,
      scheduled_at: start,
      google_event_id: eventId,
      meet_link: meetLink,
    })

    if (dbError) {
      console.error('Session insert error:', dbError)
      return Response.json({ error: 'Booking created but failed to save. Contact support.' }, { status: 500 })
    }

    return Response.json({ meetLink, eventId, scheduledAt: start })
  } catch (e) {
    console.error('Booking error:', e)
    const msg = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
