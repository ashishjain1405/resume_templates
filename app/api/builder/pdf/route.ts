import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { ResumeData } from '@/lib/resume-data'
import { buildResumeHtml } from '@/lib/build-resume-html'
import { checkRateLimit } from '@/lib/rate-limit'

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

  const html = buildResumeHtml(data, accentColor, templateId)

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
    const chromium = require('@sparticuz/chromium-min')
    const puppeteer = require('puppeteer-core')

    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar'
    )

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="resume-${templateId}.pdf"`,
        },
      })
    } finally {
      await browser.close()
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('PDF generation error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
