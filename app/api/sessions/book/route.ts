import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { getAvailableSlots, createBookingEvent, deleteBookingEvent } from '@/lib/google-calendar'
import { Resend } from 'resend'

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

    // Enforce credits-based session limit (1 included with Pro + 1 per additional purchase)
    const [{ count: sessionsBooked }, { count: extraPurchases }] = await Promise.all([
      adminClient.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      adminClient.from('session_purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])
    const totalCredits = 1 + (extraPurchases ?? 0)
    if ((sessionsBooked ?? 0) >= totalCredits) {
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
      if (dbError.code === '23505') {
        await deleteBookingEvent(eventId).catch(() => {})
        return Response.json({ error: 'This slot was just booked by someone else. Please choose another.' }, { status: 409 })
      }
      console.error('Session insert error:', dbError)
      return Response.json({ error: 'Booking created but failed to save. Contact support.' }, { status: 500 })
    }

    // Notify expert by email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const scheduledDate = new Date(start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      const safeName = esc(userName || 'Not provided')
      const safeEmail = esc(user.email ?? '')
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.EXPERT_EMAIL!,
        subject: `New session booked — ${userName || user.email}`,
        html: `<p>A new resume session has been booked.</p>
               <p><strong>Name:</strong> ${safeName}<br>
               <strong>Email:</strong> ${safeEmail}<br>
               <strong>Time:</strong> ${scheduledDate} IST<br>
               <strong>Meet link:</strong> <a href="${meetLink}">${meetLink}</a></p>`,
      })
      if (emailError) console.error('Expert email failed:', emailError)
      else console.log('Expert email sent:', emailData?.id)
    } catch (emailErr) {
      console.error('Expert email exception:', emailErr)
    }

    return Response.json({ meetLink, eventId, scheduledAt: start })
  } catch (e) {
    console.error('Booking error:', e)
    const msg = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
