import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { uploadResumeToDrive } from '@/lib/google-drive'
import { buildResumeHtml } from '@/lib/build-resume-html'
import { validateResumeData } from '@/lib/resume-data'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)
    if (!pro) return Response.json({ error: 'Pro access required' }, { status: 403 })

    const { templateId, data, accentColor } = await request.json()
    if (!templateId || !data) return Response.json({ error: 'Missing templateId or data' }, { status: 400 })

    const html = buildResumeHtml(validateResumeData(data), accentColor ?? '#2c3e50', templateId)
    const buffer = Buffer.from(html, 'utf-8')
    const url = await uploadResumeToDrive(buffer, 'resume.html', 'text/html')
    return Response.json({ url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('resume/edit-html error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
