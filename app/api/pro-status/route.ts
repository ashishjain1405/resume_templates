import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ pro: false, authenticated: false })
  const adminClient = await createAdminClient()
  const pro = await isPro(user.id, adminClient)
  return Response.json({ pro, authenticated: true })
}
