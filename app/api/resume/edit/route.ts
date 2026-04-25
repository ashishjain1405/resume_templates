import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { uploadResumeToDrive } from '@/lib/google-drive'
import { fileTypeFromBuffer } from 'file-type'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

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
    if (!file || file.size === 0) return Response.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_SIZE) return Response.json({ error: 'File must be under 10 MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = await fileTypeFromBuffer(buffer)
    // Plain text has no magic bytes — fall back to declared type only for text/plain
    const mimeType = detected?.mime ?? (file.type === 'text/plain' ? 'text/plain' : '')
    if (!ALLOWED_TYPES.includes(mimeType)) return Response.json({ error: 'Only PDF, DOCX, and plain text files are allowed' }, { status: 400 })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'resume'
    const url = await uploadResumeToDrive(buffer, safeName, mimeType)
    return Response.json({ url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('resume/edit error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
