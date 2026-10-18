import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import type { ResumeData } from '@/lib/resume-data'
import { buildResumeHtml } from '@/lib/build-resume-html'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateResumeData } from '@/lib/resume-data'
import { canUseTemplate } from '@/lib/pro'
import { renderPdf } from '@/lib/pdf'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await checkRateLimit(user.id, 'builder-pdf', 20))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 })
  }

  const url = new URL(req.url)
  const asPdf = url.searchParams.get('pdf') === '1'

  const { templateId, data, accentColor } = await req.json() as {
    templateId: string
    data: ResumeData
    accentColor: string
  }

  const adminClient = await createAdminClient()
  if (!(await canUseTemplate(user.id, templateId, adminClient))) {
    return NextResponse.json({ error: 'Pro access or template purchase required' }, { status: 403 })
  }

  const html = buildResumeHtml(validateResumeData(data), accentColor, templateId)

  if (!asPdf) {
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="resume-${templateId}.html"`,
      },
    })
  }

  // Generate real PDF via headless Chromium
  try {
    const pdfBuffer = await renderPdf(html)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${templateId}.pdf"`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('PDF generation error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
