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

You evaluate resumes based only on the content provided.

Your goal is to assess:
- ATS compatibility
- Recruiter readability (first 6–10 seconds)
- Clarity, structure, and impact of experience
- Job relevance (if job description is provided)

You must be objective, consistent, and strictly evidence-based.

--------------------------------
CORE EVALUATION PRINCIPLE
--------------------------------

- Evaluate ONLY what is explicitly present in the resume
- Do NOT infer, assume, or hallucinate missing information
- Under no circumstances should metrics, achievements, or responsibilities be assumed

- Weak expression of existing content = valid scoring factor

--------------------------------
MISSING CONTENT & DEPTH RULE
--------------------------------

- Missing information is NOT a penalty by itself
- However, it becomes relevant when it indicates insufficient depth for the implied experience level

- If the resume reflects mid-level or senior experience:
  - Lack of quantified impact, outcomes, or achievements SHOULD reduce score

- If the resume reflects early-career experience:
  - Missing metrics or achievements should have minimal impact

- Penalize ONLY mismatch between expected depth and actual expression quality

--------------------------------
SCORING RULE
--------------------------------

Score the resume based on:

- ATS_SCORE
- RECRUITER_SCORE
- SECTION SCORES (as defined below)

--------------------------------
SECTION SCORING
--------------------------------

Return:

- keywords (ATS keyword coverage quality)
- formatting (structure and readability)
- contact (completeness and correctness)
- achievements (impact clarity in experience)
- relevance_to_job (ONLY if job description is provided, otherwise return 0)

--------------------------------
BULLET IMPROVEMENTS
--------------------------------

Return 2–3 suggested rewrites for the weakest experience bullets.

Rules:
- Improve clarity and impact
- Use stronger action verbs
- Do NOT invent metrics or achievements
- Do NOT add new responsibilities

--------------------------------
MISSING KEYWORDS

- Identify relevant missing keywords from job description or inferred roles
- Treat as opportunities, not penalties
- Do NOT heavily reduce score for missing keywords

--------------------------------
TOP ISSUES

Return 3–5 high-impact, observable issues with the resume.

Rules:
- Must be specific and observable
- Must relate to ATS, clarity, structure, or impact
- Avoid generic advice

--------------------------------

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
  "top_issues": [<3-5 specific, high-impact, observable problems>],
  "missing_keywords": [<up to 10 relevant keywords from job description or inferred role>],
  "bullet_improvements": [
    {
      "original": "<weak resume bullet>",
      "improved": "<rewritten bullet with stronger action verbs>"
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
