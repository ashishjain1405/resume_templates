import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { fileTypeFromBuffer } from 'file-type'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file || file.size === 0) return Response.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_SIZE) return Response.json({ error: 'File must be under 5 MB' }, { status: 400 })

    const adminClient = await createAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = await fileTypeFromBuffer(buffer)
    const mimeType = detected?.mime ?? ''
    if (!ALLOWED_TYPES.includes(mimeType)) return Response.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 })

    const storagePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await adminClient.storage
      .from('user-resumes')
      .upload(storagePath, buffer, { contentType: mimeType, upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return Response.json({ error: uploadError.message }, { status: 500 })
    }

    const atsScoreRaw = form.get('ats_score')
    let atsScoreValue: number | undefined
    if (atsScoreRaw !== null) {
      const score = Number(atsScoreRaw)
      if (!Number.isInteger(score) || score < 0 || score > 100) return Response.json({ error: 'Invalid ats_score' }, { status: 400 })
      atsScoreValue = score
    }
    const { data: row, error: dbError } = await adminClient
      .from('uploaded_resumes')
      .insert({
        user_id: user.id,
        filename: file.name,
        storage_path: storagePath,
        mime_type: mimeType,
        size_bytes: file.size,
        ...(atsScoreValue !== undefined ? { ats_score: atsScoreValue } : {}),
      })
      .select('id, filename, mime_type, size_bytes, ats_score, created_at')
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      // Clean up orphaned storage object
      await adminClient.storage.from('user-resumes').remove([storagePath])
      return Response.json({ error: 'Failed to save resume record' }, { status: 500 })
    }

    return Response.json({ resume: row })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('resume/upload error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
