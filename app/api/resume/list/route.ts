import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('uploaded_resumes')
      .select('id, filename, mime_type, size_bytes, ats_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ resumes: data ?? [] })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
