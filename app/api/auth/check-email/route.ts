import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return Response.json({ exists: false })

  const admin = await createAdminClient()
  // Query auth.users directly via admin client — faster than listUsers()
  const { data, error } = await admin
    .from('auth.users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  // Fallback to listUsers if direct query fails (RLS on auth schema)
  if (error) {
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const exists = (list?.users ?? []).some(u => u.email?.toLowerCase() === email.toLowerCase())
    return Response.json({ exists })
  }

  return Response.json({ exists: !!data })
}
