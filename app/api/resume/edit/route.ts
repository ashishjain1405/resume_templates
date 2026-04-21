import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { uploadResumeToDrive } from '@/lib/google-drive'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)
    if (!pro) return Response.json({ error: 'Pro access required' }, { status: 403 })

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file || file.size === 0) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadResumeToDrive(buffer, file.name, file.type)
    return Response.json({ url })
  } catch (e) {
    console.error('resume/edit error:', e)
    return Response.json({ error: 'Failed to upload resume' }, { status: 500 })
  }
}
