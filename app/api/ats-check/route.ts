import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import OpenAI from 'openai'
async function parsePdf(buf: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf) })
  const pdf = await loadingTask.promise
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, (_: unknown, i: number) =>
      pdf.getPage(i + 1).then((p: { getTextContent: () => Promise<{ items: { str?: string }[] }> }) =>
        p.getTextContent()
      ).then((tc: { items: { str?: string }[] }) =>
        tc.items.map(item => item.str ?? '').join(' ')
      )
    )
  )
  return pages.join('\n')
}

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst. Analyse the provided resume text and return a structured JSON evaluation. Be honest and critical — most resumes have room for improvement.

Return ONLY valid JSON in this exact shape, no markdown, no extra text:
{
  "score": <number 0-100>,
  "sections": {
    "keywords": <number 0-100>,
    "formatting": <number 0-100>,
    "contact": <number 0-100>,
    "achievements": <number 0-100>
  },
  "missing_keywords": [<up to 8 short keyword strings>],
  "suggestions": [<exactly 5 actionable improvement strings>]
}`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Use user client for isPro — service role key can still bypass RLS via adminClient
    // but SELECT policy exists so user client works fine here too
    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)
    if (!pro) return Response.json({ error: 'Pro access required' }, { status: 403 })

    let resumeText = ''
    let jobDescription = ''

    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file') as File | null
      resumeText = (form.get('resumeText') as string) ?? ''
      jobDescription = (form.get('jobDescription') as string) ?? ''

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer())
        try {
          resumeText = await parsePdf(buffer)
        } catch (e) {
          console.error('pdf-parse error:', e)
          return Response.json({ error: 'Could not parse PDF. Try pasting the text instead.' }, { status: 422 })
        }
      }
    } else {
      const body = await request.json()
      resumeText = body.resumeText ?? ''
      jobDescription = body.jobDescription ?? ''
    }

    if (!resumeText.trim()) {
      return Response.json({ error: 'No resume text provided' }, { status: 400 })
    }

    const userPrompt = jobDescription.trim()
      ? `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
      : `RESUME:\n${resumeText}`

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const raw = completion.choices[0].message.content ?? ''
    try {
      const result = JSON.parse(raw)
      return Response.json(result)
    } catch {
      console.error('OpenAI returned invalid JSON:', raw)
      return Response.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
    }
  } catch (e) {
    console.error('ATS check error:', e)
    const msg = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
