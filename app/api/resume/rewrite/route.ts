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

Your task is to extract, structure, and improve the provided resume.

--------------------------------
CORE RULE: DATA PRESERVATION
--------------------------------

- If content exists → preserve it
- If content is unclear → keep it
- If content is missing → do NOT create it

- Do NOT delete or omit any section or content
- Do NOT invent or assume any information
- Do NOT add skills, achievements, or metrics not present in the resume

- If unsure → keep original content unchanged

--------------------------------
STRUCTURE EXTRACTION (original_resume)
--------------------------------

Extract and structure:

- contact: name, title, email, phone, location, linkedin
- summary: any introductory text at the top (even without heading)
- experience: company, role, start_date, end_date, bullets
- education: institution, degree, start_year, end_year, details
- skills: flat list
- achievements: flat list (only if explicitly present)

Rules:
- Do NOT rewrite content here
- Clean formatting only
- Do NOT drop any content

--------------------------------
REWRITE (rewritten_resume)
--------------------------------

Improve content while preserving meaning.

SUMMARY:
- If present → rewrite
- If not present → keep empty
- Never remove existing summary

EXPERIENCE:
- Rewrite bullets only if content exists
- Keep same or fewer bullets (do NOT add new ones)
- If paragraph text → convert only that text into bullets
- Do NOT add new responsibilities or metrics

EDUCATION:
- Standardize formatting only

SKILLS:
- Extract all skills
- Remove duplicates
- Group into 1–4 categories
- Do NOT remove valid skills
- Do NOT add new skills

ACHIEVEMENTS:
- Include only if present in original
- Improve wording if needed
- Do NOT create new achievements

--------------------------------
JOB DESCRIPTION (if provided)
--------------------------------

- Align wording of summary and bullets with relevant keywords
- Do NOT add new skills or experience

--------------------------------
COMPARISON
--------------------------------

Provide comparison ONLY for:

- summary → original vs rewritten
- experience bullets → original vs rewritten

--------------------------------
CONSTRAINTS
--------------------------------

- Max 20 experience entries
- Max 10 education entries
- Max 10 bullets per role
- Max 30 skills
- Return empty arrays/strings if sections are missing
- Ensure no section is dropped between original and rewritten

--------------------------------

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

    if (!(await checkRateLimit(user.id, 'resume-rewrite', 10))) {
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

    // Defensive skills mapping — AI may return grouped [{category,items}] or flat ["skill"]
    const aiSkills = Array.isArray(r.skills) ? r.skills : []
    const isGrouped = aiSkills.length > 0 && typeof aiSkills[0] === 'object' && 'items' in (aiSkills[0] as object)
    const skillsFlat = isGrouped
      ? aiSkills.flatMap((s: { items: string[] }) => Array.isArray(s.items) ? s.items : [])
      : aiSkills.filter((s: unknown) => typeof s === 'string')
    const skillCats = isGrouped ? aiSkills : []
    const finalSkillsFlat = skillsFlat.length > 0 ? skillsFlat : originalData.skills
    const finalSkillCats = skillCats.length > 0 ? skillCats : (originalData.skillCategories ?? [])

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
      experience: (() => {
        const aiExp = Array.isArray(r.experience) ? r.experience : []
        if (aiExp.length === 0) return originalData.experience
        return aiExp.map((e, i) => {
          const orig = originalData.experience[i]
          const aiBullets = Array.isArray(e.bullets) ? e.bullets.filter((b: unknown) => typeof b === 'string' && (b as string).trim()) : []
          return {
            id: orig?.id ?? crypto.randomUUID(),
            company: e.company || orig?.company || '',
            role: e.role || orig?.role || '',
            startDate: e.start_date || orig?.startDate || '',
            endDate: e.end_date || orig?.endDate || '',
            bullets: aiBullets.length > 0 ? aiBullets : (orig?.bullets ?? []),
          }
        })
      })(),
      education: Array.isArray(r.education) ? r.education.map(e => ({
        id: crypto.randomUUID(),
        institution: e.institution,
        degree: e.degree,
        year: e.end_year,
        gpa: e.details?.[0] ?? '',
      })) : [],
      skills: finalSkillsFlat,
      skillCategories: finalSkillCats,
      awards: (() => {
        const aiAwards = Array.isArray(r.achievements) ? r.achievements.map((a: { text: string }) => a.text).filter(Boolean) : []
        return aiAwards.length > 0 ? aiAwards : (originalData.awards ?? [])
      })(),
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
