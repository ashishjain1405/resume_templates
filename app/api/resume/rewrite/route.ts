import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateResumeData, type ResumeData } from '@/lib/resume-data'
import OpenAI from 'openai'

export const maxDuration = 120

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const REWRITE_SYSTEM_PROMPT = `You are an expert resume writer and career coach specializing in ATS optimization and recruiter appeal.

Your task is to analyze the provided resume and produce a significantly improved version that:
1. **Reconstructs structure** - Identify and properly categorize all sections even if poorly formatted
2. **Strengthens impact** - Rewrite bullets with strong action verbs, quantified achievements, and STAR format where possible
3. **Optimizes for ATS** - Include relevant keywords naturally, use standard section headings
4. **Improves skills categorization** - Group skills into logical categories (e.g., "Programming Languages", "Frameworks", "Tools", "Soft Skills")
5. **Aligns with job description** - If provided, tailor content to match required skills and keywords
6. **Highlights achievements** - Extract and emphasize measurable accomplishments

Return ONLY valid JSON in this exact structure, no markdown, no extra text:
{
  "original_resume": {
    "contact": { "name": "string", "title": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string" },
    "summary": "string",
    "experience": [{ "company": "string", "role": "string", "start_date": "string", "end_date": "string", "bullets": ["string"] }],
    "education": [{ "institution": "string", "degree": "string", "start_year": "string", "end_year": "string", "details": ["string"] }],
    "skills": ["string"],
    "achievements": ["string"]
  },
  "rewritten_resume": {
    "contact": { "name": "string", "title": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string" },
    "summary": "string",
    "experience": [{ "company": "string", "role": "string", "start_date": "string", "end_date": "string", "bullets": ["string"] }],
    "education": [{ "institution": "string", "degree": "string", "start_year": "string", "end_year": "string", "details": ["string"] }],
    "skills": [{ "category": "string", "items": ["string"] }],
    "achievements": [{ "text": "string", "source": "original | rewritten | inferred" }]
  },
  "comparison": {
    "summary": { "original": "string", "rewritten": "string" },
    "experience": [{ "company": "string", "role": "string", "bullets": [{ "original": "string", "rewritten": "string" }] }]
  },
  "key_changes": ["string"]
}`

const ATS_SYSTEM_PROMPT = `You are an expert resume reviewer, ATS specialist, and hiring manager.

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

function serializeResumeToText(data: ResumeData): string {
  const lines: string[] = []
  const p = data.personal
  if (p.name) lines.push(p.name)
  if (p.title) lines.push(p.title)
  if (p.email) lines.push(p.email)
  if (p.phone) lines.push(p.phone)
  if (p.location) lines.push(p.location)
  if (p.linkedin) lines.push(p.linkedin)
  if (p.summary) lines.push('\nSUMMARY\n' + p.summary)
  if (data.experience.length) {
    lines.push('\nEXPERIENCE')
    for (const e of data.experience) {
      lines.push(`${e.role} at ${e.company} (${e.startDate}${e.endDate ? ' – ' + e.endDate : ' – Present'})`)
      for (const b of e.bullets) lines.push('• ' + b)
    }
  }
  if (data.education.length) {
    lines.push('\nEDUCATION')
    for (const e of data.education) {
      lines.push(`${e.degree} — ${e.institution}${e.year ? ' (' + e.year + ')' : ''}${e.gpa ? ' GPA: ' + e.gpa : ''}`)
    }
  }
  const allSkills = data.skillCategories?.length
    ? data.skillCategories.flatMap(c => c.items)
    : data.skills
  if (allSkills.length) lines.push('\nSKILLS\n' + allSkills.join(', '))
  if (data.awards?.length) lines.push('\nACHIEVEMENTS\n' + data.awards.join('\n'))
  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await checkRateLimit(user.id, 'resume-rewrite', 5))) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }

    const body = await request.json()
    const { templateId, resumeText, jobDescription, atsContext } = body as {
      templateId: string
      resumeText: string
      jobDescription?: string
      atsContext?: { overall_score: number; top_issues: string[]; missing_keywords: string[] }
    }

    if (!templateId || !resumeText?.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step A: Fetch original ResumeData from Supabase
    const adminClient = await createAdminClient()
    const { data: row } = await adminClient
      .from('resumes')
      .select('data, accent_color')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .maybeSingle()

    if (!row) {
      return Response.json({ error: 'Resume not found' }, { status: 404 })
    }

    const originalData = validateResumeData(row.data)
    const accentColor: string = row.accent_color ?? '#2563eb'

    // Step B: Call OpenAI rewrite
    const atsContextNote = atsContext
      ? `\n\nATS CONTEXT (current score: ${atsContext.overall_score}/100):\nTop issues: ${atsContext.top_issues?.join('; ')}\nMissing keywords: ${atsContext.missing_keywords?.join(', ')}`
      : ''

    const userPrompt = jobDescription?.trim()
      ? `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}${atsContextNote}`
      : `RESUME:\n${resumeText}${atsContextNote}`

    const rewriteCompletion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const rewriteRaw = rewriteCompletion.choices[0].message.content ?? ''
    let aiOutput: {
      rewritten_resume: {
        contact: { name: string; title: string; email: string; phone: string; location: string; linkedin: string }
        summary: string
        experience: { company: string; role: string; start_date: string; end_date: string; bullets: string[] }[]
        education: { institution: string; degree: string; start_year: string; end_year: string; details: string[] }[]
        skills: { category: string; items: string[] }[]
        achievements: { text: string; source: string }[]
      }
      comparison: {
        summary: { original: string; rewritten: string }
        experience: { company: string; role: string; bullets: { original: string; rewritten: string }[] }[]
      }
      key_changes: string[]
    }

    try {
      aiOutput = JSON.parse(rewriteRaw)
    } catch {
      console.error('Rewrite OpenAI returned invalid JSON:', rewriteRaw)
      return Response.json({ error: 'Rewrite failed. Please try again.' }, { status: 500 })
    }

    const r = aiOutput.rewritten_resume
    const rewrittenData = validateResumeData({
      personal: {
        name: r.contact?.name ?? '',
        title: r.contact?.title ?? '',
        email: r.contact?.email ?? '',
        phone: r.contact?.phone ?? '',
        location: r.contact?.location ?? '',
        linkedin: r.contact?.linkedin ?? '',
        summary: r.summary ?? '',
      },
      experience: Array.isArray(r.experience) ? r.experience.map(e => ({
        id: crypto.randomUUID(),
        company: e.company,
        role: e.role,
        startDate: e.start_date,
        endDate: e.end_date,
        bullets: e.bullets,
      })) : [],
      education: Array.isArray(r.education) ? r.education.map(e => ({
        id: crypto.randomUUID(),
        institution: e.institution,
        degree: e.degree,
        year: e.end_year,
        gpa: e.details?.[0] ?? '',
      })) : [],
      skills: Array.isArray(r.skills) ? r.skills.flatMap((s: { items: string[] }) => s.items) : [],
      skillCategories: Array.isArray(r.skills) ? r.skills : [],
      awards: Array.isArray(r.achievements) ? r.achievements.map((a: { text: string }) => a.text) : [],
    })

    // Step C: Score the rewritten resume
    const rewrittenText = serializeResumeToText(rewrittenData)
    const scoreUserPrompt = jobDescription?.trim()
      ? `RESUME:\n${rewrittenText}\n\nJOB DESCRIPTION:\n${jobDescription}`
      : `RESUME:\n${rewrittenText}`

    const scoreCompletion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: ATS_SYSTEM_PROMPT },
        { role: 'user', content: scoreUserPrompt },
      ],
    })

    const scoreRaw = scoreCompletion.choices[0].message.content ?? ''
    let scoreResult: { overall_score: number; ats_score: number; recruiter_score: number }
    try {
      const s = JSON.parse(scoreRaw)
      const clamp = (v: unknown) => Math.min(100, Math.max(0, Number.isFinite(Number(v)) ? Number(v) : 0))
      scoreResult = {
        overall_score: clamp(s.overall_score),
        ats_score: clamp(s.ats_score),
        recruiter_score: clamp(s.recruiter_score),
      }
    } catch {
      scoreResult = { overall_score: 0, ats_score: 0, recruiter_score: 0 }
    }

    return Response.json({
      originalData,
      rewrittenData,
      accentColor,
      rewrittenScore: scoreResult,
      comparison: aiOutput.comparison ?? {},
      keyChanges: Array.isArray(aiOutput.key_changes) ? aiOutput.key_changes : [],
    })
  } catch (e) {
    console.error('Resume rewrite error:', e)
    const msg = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
