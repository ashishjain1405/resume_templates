import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import { isPro } from '@/lib/pro'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = await createAdminClient()

  const pro = await isPro(user.id, adminClient)
  if (!pro) {
    const { data: purchase } = await adminClient
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .maybeSingle()
    if (!purchase) {
      return Response.json({ error: 'Not purchased' }, { status: 403 })
    }
  }

  const template = TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 })
  }

  const color = request.nextUrl.searchParams.get('color')
  const colorKey = color ? color.replace('#', '') : template.colors[0].replace('#', '')
  if (!/^[0-9a-fA-F]{3,6}$/.test(colorKey)) {
    return Response.json({ error: 'Invalid color' }, { status: 400 })
  }
  const storagePath = `templates/${templateId}-${colorKey}.pdf`

  const { data, error } = await adminClient.storage
    .from('templates')
    .createSignedUrl(storagePath, 60)

  if (error || !data) {
    console.error('[download] Supabase storage error:', error, 'path:', storagePath)
    return Response.json({ error: 'Failed to generate download link', detail: error?.message }, { status: 500 })
  }

  return Response.redirect(data.signedUrl)
}
