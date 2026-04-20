import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { ResumeData } from '@/lib/resume-data'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { templateId, data, accentColor } = await req.json() as {
    templateId: string
    data: ResumeData
    accentColor: string
  }

  const html = buildResumeHtml(data, accentColor, templateId)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="resume-${templateId}.html"`,
    },
  })
}

function buildResumeHtml(data: ResumeData, accentColor: string, templateId: string): string {
  const { personal, experience, education, skills } = data
  const name = personal.name || 'Your Name'
  const title = personal.title || ''
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' | ')

  const expHtml = experience.map(exp => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <strong style="font-size:11px;">${exp.role}</strong>
        <span style="font-size:10px;color:#888;">${exp.startDate}${exp.endDate ? ' – ' + exp.endDate : exp.startDate ? ' – Present' : ''}</span>
      </div>
      <div style="font-size:10px;color:#555;margin-bottom:4px;">${exp.company}</div>
      ${exp.bullets.map(b => `<div style="font-size:10px;color:#666;margin-left:12px;">• ${b}</div>`).join('')}
    </div>
  `).join('')

  const eduHtml = education.map(edu => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;">
        <strong style="font-size:11px;">${edu.degree}</strong>
        <span style="font-size:10px;color:#888;">${edu.year}</span>
      </div>
      <div style="font-size:10px;color:#555;">${edu.institution}</div>
    </div>
  `).join('')

  const skillsHtml = skills.length
    ? `<div style="font-size:10px;color:#555;">${skills.join(' • ')}</div>`
    : ''

  const sectionTitle = (text: string) =>
    `<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${accentColor};border-bottom:1px solid ${accentColor};padding-bottom:3px;margin-bottom:8px;margin-top:16px;">${text}</div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Resume — ${name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', sans-serif; color: #222; background: white; }
  .page { max-width: 720px; margin: 0 auto; padding: 40px; }
  @media print {
    body { margin: 0; }
    .page { padding: 24px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="no-print" style="background:#1e40af;color:white;text-align:center;padding:10px;font-size:13px;font-family:Arial,sans-serif;">
  Press <strong>Ctrl+P</strong> (or Cmd+P on Mac) and choose "Save as PDF" to download your resume.
</div>
<div class="page">
  <div style="text-align:center;border-bottom:2px solid ${accentColor};padding-bottom:16px;margin-bottom:4px;">
    <h1 style="font-size:22px;font-weight:700;letter-spacing:1px;color:#111;">${name.toUpperCase()}</h1>
    ${title ? `<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${accentColor};margin-top:4px;">${title}</div>` : ''}
    ${contact ? `<div style="font-size:10px;color:#888;margin-top:6px;">${contact}</div>` : ''}
  </div>
  ${expHtml ? sectionTitle('Experience') + expHtml : ''}
  ${eduHtml ? sectionTitle('Education') + eduHtml : ''}
  ${skillsHtml ? sectionTitle('Skills') + skillsHtml : ''}
</div>
</body>
</html>`
}
