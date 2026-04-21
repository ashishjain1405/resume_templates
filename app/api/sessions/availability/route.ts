import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { getAvailableSlots } from '@/lib/google-calendar'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)
    if (!pro) return Response.json({ error: 'Pro access required' }, { status: 403 })

    const slots = await getAvailableSlots(14)
    return Response.json({ slots })
  } catch (e) {
    console.error('Availability error:', e)
    return Response.json({ error: 'Could not fetch availability. Please try again.' }, { status: 500 })
  }
}
