import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = await createAdminClient()
  const [{ count: sessionsBooked }, { count: extraPurchases }] = await Promise.all([
    adminClient.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    adminClient.from('session_purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const totalCredits = 1 + (extraPurchases ?? 0)
  const hasRemainingCredits = (sessionsBooked ?? 0) < totalCredits

  return Response.json({ hasRemainingCredits })
}
