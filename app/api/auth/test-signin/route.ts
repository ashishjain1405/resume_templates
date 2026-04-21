import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const TEST_PASSWORD = 'test1234'

export async function POST(request: NextRequest) {
  if (process.env.TEST_BYPASS_ENABLED !== 'true') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { email } = await request.json()
  if (!email?.startsWith('test')) {
    return Response.json({ error: 'Only test* emails allowed' }, { status: 400 })
  }

  const adminClient = await createAdminClient()

  // Create user if they don't exist — email_confirm skips the confirmation email
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  // Ignore "already exists" error
  if (error && !error.message.toLowerCase().includes('already been registered')) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
