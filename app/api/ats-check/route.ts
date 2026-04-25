import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import { checkRateLimit } from '@/lib/rate-limit'
import OpenAI from 'openai'

export const maxDuration = 60

// Cache unpdf module at module level so WASM is only initialized once per container
let _unpdf: typeof import('unpdf') | null = null
async function getUnpdf() {
  if (!_unpdf) _unpdf = await import('unpdf')
  return _unpdf
}

async function parsePdf(buf: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await getUnpdf()
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const SYSTEM_PROMPT = `You are an expert resume reviewer, ATS specialist, and hiring manager.

Your goal is to maximize the candidate's chances of getting shortlisted by:
- Passing ATS filters
- Aligning with the target job description
- Improving recruiter scan (first 6–10 seconds)
- Strengthening impact and measurable achievements

Be direct, critical, and specific. Avoid generic advice.

Return ONLY valid JSON in this exact structure, no markdown, no extra text:
{
  "overall_score": <number 0-100>,
  "ats_score": <number 0-100>,
  "recruiter_score": <number 0-100>,
  "section_scores": {
    "keywords": <number 0-100>,
    "formatting": <number 0-100>,
    "contact": <number 0-100>,
    "achievements": <number 0-100>,
    "relevance_to_job": <number 0-100, use 0 if no job description provided>
  },
  "top_issues": [<3-5 specific, high-impact problems>],
  "missing_keywords": [<up to 10 relevant keywords from job description or inferred role>],
  "bullet_improvements": [<always exactly 3 items — pick the 3 weakest bullets and rewrite them with strong action verbs and metrics>
    {
      "original": "<weak resume bullet>",
      "improved": "<rewritten bullet with strong action verbs + metrics>"
    }
  ],
  "suggestions": [
    {
      "priority": "high | medium | low",
      "action": "<specific improvement>",
      "example": "<optional concrete example>"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = await createAdminClient()
    const pro = await isPro(user.id, adminClient)

    if (!(await checkRateLimit(user.id, 'ats-check', 20))) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }

    const FREE_LIMIT = 5
    if (!pro) {
      const { count } = await adminClient
        .from('ats_checks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if ((count ?? 0) >= FREE_LIMIT) {
        return Response.json({ error: 'limit_reached', used: count, limit: FREE_LIMIT }, { status: 403 })
      }
    }

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
      const r = JSON.parse(raw)

      const clamp = (v: unknown) => Math.min(100, Math.max(0, Number.isFinite(Number(v)) ? Number(v) : 0))
      const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])

      const result = {
        overall_score: clamp(r.overall_score),
        ats_score: clamp(r.ats_score),
        recruiter_score: clamp(r.recruiter_score),
        section_scores: {
          keywords: clamp(r.section_scores?.keywords),
          formatting: clamp(r.section_scores?.formatting),
          contact: clamp(r.section_scores?.contact),
          achievements: clamp(r.section_scores?.achievements),
          relevance_to_job: clamp(r.section_scores?.relevance_to_job),
        },
        top_issues: strArr(r.top_issues),
        missing_keywords: strArr(r.missing_keywords),
        bullet_improvements: Array.isArray(r.bullet_improvements)
          ? r.bullet_improvements
              .filter((b: unknown) => b && typeof b === 'object')
              .map((b: { original?: unknown; improved?: unknown }) => ({
                original: typeof b.original === 'string' ? b.original : '',
                improved: typeof b.improved === 'string' ? b.improved : '',
              }))
          : [],
        suggestions: Array.isArray(r.suggestions)
          ? r.suggestions
              .filter((s: unknown) => s && typeof s === 'object')
              .map((s: { priority?: unknown; action?: unknown; example?: unknown }) => ({
                priority: ['high', 'medium', 'low'].includes(s.priority as string) ? s.priority : 'medium',
                action: typeof s.action === 'string' ? s.action : '',
                example: typeof s.example === 'string' ? s.example : '',
              }))
          : [],
      }

      // Track usage for free users
      let usageAfter: number | null = null
      if (!pro) {
        await adminClient.from('ats_checks').insert({ user_id: user.id })
        const { count } = await adminClient
          .from('ats_checks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        usageAfter = count ?? null
      }
      return Response.json({ ...result, _usage: pro ? null : { used: usageAfter, limit: 5 } })
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
