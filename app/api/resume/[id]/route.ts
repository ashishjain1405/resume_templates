import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

// GET /api/resume/[id] — returns a short-lived signed URL for the file
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row, error } = await supabase
    .from('uploaded_resumes')
    .select('storage_path, filename')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !row) return Response.json({ error: 'Not found' }, { status: 404 })

  const adminClient = await createAdminClient()
  const { data: signed, error: signError } = await adminClient.storage
    .from('user-resumes')
    .createSignedUrl(row.storage_path, 120)

  if (signError || !signed) return Response.json({ error: 'Could not generate URL' }, { status: 500 })
  return Response.json({ url: signed.signedUrl, filename: row.filename })
}

// DELETE /api/resume/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row, error } = await supabase
    .from('uploaded_resumes')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !row) return Response.json({ error: 'Not found' }, { status: 404 })

  const adminClient = await createAdminClient()
  await adminClient.storage.from('user-resumes').remove([row.storage_path])
  await adminClient.from('uploaded_resumes').delete().eq('id', id)

  return Response.json({ ok: true })
}
