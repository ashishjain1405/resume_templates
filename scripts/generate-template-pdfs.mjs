/**
 * One-time script: generate PDFs for all templates and upload to Supabase storage.
 * Run with: node scripts/generate-template-pdfs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ─── Sample data ───────────────────────────────────────────────────────────

const SAMPLE_RESUME = {
  personal: {
    name: 'Priya Sharma',
    title: 'Senior Product Manager',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/priyasharma',
  },
  experience: [
    {
      id: '1',
      company: 'Flipkart',
      role: 'Senior Product Manager',
      startDate: 'Jan 2021',
      endDate: '',
      bullets: [
        'Led end-to-end launch of seller onboarding revamp, reducing drop-off by 34% and increasing active sellers by 18K in 6 months',
        'Defined roadmap for checkout experience across 3 platforms, driving 12% uplift in conversion rate (₹240 Cr incremental GMV)',
        'Managed cross-functional team of 14 to ship 4 major features per quarter on schedule',
      ],
    },
    {
      id: '2',
      company: 'Razorpay',
      role: 'Product Manager',
      startDate: 'Jul 2018',
      endDate: 'Dec 2020',
      bullets: [
        'Owned payments dashboard used by 80,000+ merchants; reduced support tickets by 27% through self-serve tooling',
        'Launched recurring payments feature end-to-end in 10 weeks, acquired 1,200 enterprise clients in Q1',
      ],
    },
  ],
  education: [
    { id: '1', institution: 'IIM Bangalore', degree: 'MBA, Strategy & Technology', year: '2018' },
    { id: '2', institution: 'BITS Pilani', degree: 'B.E. Computer Science', year: '2016' },
  ],
  skills: ['Product Strategy', 'Roadmapping', 'SQL', 'A/B Testing', 'Figma', 'JIRA', 'Python', 'Go-to-Market'],
}

// ─── Templates ─────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'classic',     colors: ['#1e3a5f', '#2d6a9f', '#4a9ede', '#7bbfe8', '#b0d9f5'] },
  { id: 'modern',      colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'] },
  { id: 'multicolumn', colors: ['#2c3e50', '#8e44ad', '#2980b9', '#27ae60', '#e74c3c'] },
  { id: 'quotation',   colors: ['#f5f0e8', '#d4a853', '#8b7355', '#4a3728', '#2c1810'] },
  { id: 'executive',   colors: ['#0a0a0a', '#1c1c1c', '#2d2d2d', '#8a7d6b', '#c9b99a'] },
]

// ─── HTML builders ─────────────────────────────────────────────────────────

const BASE_STYLE = `* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, Helvetica, sans-serif; color: #222; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`

function sectionLabel(text, color) {
  return `<div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};border-bottom:1px solid ${color};padding-bottom:4px;margin-bottom:10px;margin-top:20px;">${text}</div>`
}

function expHtml(experience) {
  return experience.map(exp => `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:11px;font-weight:600;color:#1a1a1a;">${exp.role}</span>
        <span style="font-size:9px;color:#888;">${exp.startDate}${exp.endDate ? ' – ' + exp.endDate : exp.startDate ? ' – Present' : ''}</span>
      </div>
      <div style="font-size:10px;color:#555;margin-bottom:4px;">${exp.company}</div>
      ${exp.bullets.map(b => `<div style="font-size:10px;color:#444;margin-left:10px;margin-top:2px;">· ${b}</div>`).join('')}
    </div>
  `).join('')
}

function eduHtml(education) {
  return education.map(edu => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:11px;font-weight:600;color:#1a1a1a;">${edu.degree}</span>
        <span style="font-size:9px;color:#888;">${edu.year}</span>
      </div>
      <div style="font-size:10px;color:#555;">${edu.institution}</div>
    </div>
  `).join('')
}

function buildClassicHtml(data, accentColor) {
  const { personal, experience, education, skills } = data
  const name = personal.name || 'Your Name'
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' · ')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${BASE_STYLE} .page{max-width:750px;margin:0 auto;padding:48px;}</style></head><body><div class="page">
    <div style="text-align:center;border-bottom:2px solid ${accentColor};padding-bottom:20px;margin-bottom:4px;">
      <div style="font-size:24px;font-weight:700;letter-spacing:2px;color:#111;">${name.toUpperCase()}</div>
      ${personal.title ? `<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};margin-top:6px;">${personal.title}</div>` : ''}
      ${contact ? `<div style="font-size:10px;color:#888;margin-top:8px;">${contact}</div>` : ''}
    </div>
    ${experience.length ? sectionLabel('Experience', accentColor) + expHtml(experience) : ''}
    ${education.length ? sectionLabel('Education', accentColor) + eduHtml(education) : ''}
    ${skills.length ? sectionLabel('Skills', accentColor) + `<div style="font-size:10px;color:#555;">${skills.join(' · ')}</div>` : ''}
  </div></body></html>`
}

function buildModernHtml(data, accentColor) {
  const { personal, experience, education, skills } = data
  const name = personal.name || 'Your Name'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '??'
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).join(' · ')
  const skillBadges = skills.map(s => `<span style="background:${accentColor};color:white;padding:3px 8px;border-radius:4px;font-size:9px;margin:2px;display:inline-block;">${s}</span>`).join('')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${BASE_STYLE} .page{max-width:750px;margin:0 auto;display:flex;min-height:100vh;} .bar{width:8px;flex-shrink:0;background:${accentColor};} .main{flex:1;display:flex;flex-direction:column;} .header{background:${accentColor};padding:28px 32px;display:flex;align-items:center;gap:20px;} .avatar{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;} .content{padding:28px 32px;}</style></head><body><div class="page">
    <div class="bar"></div>
    <div class="main">
      <div class="header">
        <div class="avatar"><span style="color:white;font-weight:700;font-size:20px;">${initials}</span></div>
        <div>
          <div style="font-size:22px;font-weight:700;color:white;letter-spacing:1px;">${name.toUpperCase()}</div>
          ${personal.title ? `<div style="font-size:10px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;margin-top:4px;">${personal.title}</div>` : ''}
        </div>
      </div>
      <div class="content">
        ${contact ? `<div style="font-size:10px;color:#888;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:4px;">${contact}</div>` : ''}
        ${experience.length ? sectionLabel('Experience', accentColor) + expHtml(experience) : ''}
        ${education.length ? sectionLabel('Education', accentColor) + eduHtml(education) : ''}
        ${skills.length ? sectionLabel('Skills', accentColor) + `<div style="margin-top:4px;">${skillBadges}</div>` : ''}
      </div>
    </div>
  </div></body></html>`
}

function buildMulticolumnHtml(data, accentColor) {
  const { personal, experience, education, skills } = data
  const name = personal.name || 'Your Name'
  const sideLabel = text => `<div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:4px;margin-bottom:8px;margin-top:16px;">${text}</div>`
  const skillBars = skills.map(s => `<div style="margin-bottom:6px;display:flex;align-items:center;gap:8px;"><div style="flex:1;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;"><div style="width:75%;height:4px;background:rgba(255,255,255,0.7);border-radius:2px;"></div></div><span style="font-size:9px;color:rgba(255,255,255,0.7);min-width:60px;">${s}</span></div>`).join('')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${BASE_STYLE} .page{max-width:750px;margin:0 auto;display:flex;min-height:100vh;} .sidebar{width:260px;flex-shrink:0;background:${accentColor};padding:36px 24px;color:white;} .main{flex:1;padding:36px 32px;}</style></head><body><div class="page">
    <div class="sidebar">
      <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.15);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;"><span style="color:rgba(255,255,255,0.5);font-size:28px;">&#128100;</span></div>
      <div style="text-align:center;">
        <div style="font-size:15px;font-weight:700;color:white;">${name.toUpperCase()}</div>
        ${personal.title ? `<div style="font-size:9px;color:rgba(255,255,255,0.7);margin-top:4px;">${personal.title}</div>` : ''}
      </div>
      ${sideLabel('Contact')}
      <div style="font-size:9px;color:rgba(255,255,255,0.7);line-height:1.8;">
        ${personal.email ? `<div>${personal.email}</div>` : ''}
        ${personal.phone ? `<div>${personal.phone}</div>` : ''}
        ${personal.location ? `<div>${personal.location}</div>` : ''}
        ${personal.linkedin ? `<div>${personal.linkedin}</div>` : ''}
      </div>
      ${skills.length ? sideLabel('Skills') + skillBars : ''}
    </div>
    <div class="main">
      ${experience.length ? sectionLabel('Experience', accentColor) + expHtml(experience) : ''}
      ${education.length ? sectionLabel('Education', accentColor) + eduHtml(education) : ''}
    </div>
  </div></body></html>`
}

function buildQuotationHtml(data, accentColor) {
  const { personal, experience, education } = data
  const name = personal.name || 'Your Name'
  const contact = [personal.email, personal.location].filter(Boolean).join(' · ')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${BASE_STYLE} .page{max-width:750px;margin:0 auto;padding:48px;background:#fdfaf5;min-height:100vh;position:relative;} .qmark{position:absolute;top:24px;right:32px;font-size:120px;line-height:1;font-family:Georgia,serif;opacity:0.08;color:${accentColor};}</style></head><body><div class="page">
    <div class="qmark">&ldquo;</div>
    <div style="margin-bottom:20px;">
      <div style="font-size:28px;font-weight:700;color:#111;">${name}</div>
      ${personal.title ? `<div style="font-size:11px;color:${accentColor};margin-top:4px;">${personal.title}</div>` : ''}
      <div style="width:40px;height:3px;background:${accentColor};border-radius:2px;margin-top:10px;"></div>
    </div>
    <div style="font-size:10px;color:#888;margin-bottom:20px;line-height:1.7;">
      ${contact ? `<div>${contact}</div>` : ''}
      ${personal.linkedin ? `<div>${personal.linkedin}</div>` : ''}
    </div>
    ${experience.length ? `<div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentColor};margin-bottom:10px;">Experience</div>
      ${experience.map(exp => `<div style="margin-bottom:14px;"><div style="font-size:11px;font-weight:600;color:#1a1a1a;">${exp.role}${exp.company ? ` — ${exp.company}` : ''}</div><div style="font-size:9px;color:#888;margin-bottom:3px;">${exp.startDate}${exp.endDate ? ' – ' + exp.endDate : exp.startDate ? ' – Present' : ''}</div>${exp.bullets.map(b => `<div style="font-size:10px;color:#555;margin-left:10px;">· ${b}</div>`).join('')}</div>`).join('')}` : ''}
    ${education.length ? `<div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentColor};margin-bottom:10px;margin-top:20px;">Education</div>
      ${education.map(edu => `<div style="margin-bottom:10px;"><div style="font-size:11px;font-weight:600;color:#1a1a1a;">${edu.degree}</div><div style="font-size:9px;color:#888;">${[edu.institution, edu.year].filter(Boolean).join(' · ')}</div></div>`).join('')}` : ''}
  </div></body></html>`
}

function buildExecutiveHtml(data, accentColor) {
  const { personal, experience, education } = data
  const name = personal.name || 'Your Name'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '??'
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).join('  ·  ')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${BASE_STYLE} .page{max-width:750px;margin:0 auto;} .header{background:${accentColor};padding:28px 36px;display:flex;align-items:center;justify-content:space-between;} .content{padding:32px 36px;}</style></head><body><div class="page">
    <div class="header">
      <div>
        <div style="font-size:24px;font-weight:700;color:white;letter-spacing:2px;">${name.toUpperCase()}</div>
        ${personal.title ? `<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9b99a;margin-top:6px;">${personal.title}</div>` : ''}
        ${contact ? `<div style="font-size:9px;color:rgba(255,255,255,0.55);margin-top:10px;">${contact}</div>` : ''}
      </div>
      <div style="width:56px;height:56px;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:24px;">
        <span style="color:white;font-size:18px;font-weight:700;">${initials}</span>
      </div>
    </div>
    <div class="content">
      ${experience.length ? `<div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentColor};border-bottom:1px solid ${accentColor};padding-bottom:4px;margin-bottom:14px;">Career History</div>${expHtml(experience)}` : ''}
      ${education.length ? sectionLabel('Education', accentColor) + eduHtml(education) : ''}
    </div>
  </div></body></html>`
}

function buildResumeHtml(data, accentColor, templateId) {
  switch (templateId) {
    case 'modern':      return buildModernHtml(data, accentColor)
    case 'multicolumn': return buildMulticolumnHtml(data, accentColor)
    case 'quotation':   return buildQuotationHtml(data, accentColor)
    case 'executive':   return buildExecutiveHtml(data, accentColor)
    default:            return buildClassicHtml(data, accentColor)
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function generateAndUpload() {
  const puppeteer = (await import('puppeteer-core')).default

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const template of TEMPLATES) {
      for (const color of template.colors) {
        const colorKey = color.replace('#', '')
        const storagePath = `templates/${template.id}-${colorKey}.pdf`
        console.log(`Generating ${template.id} (${color})...`)

        const html = buildResumeHtml(SAMPLE_RESUME, color, template.id)
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        })
        await page.close()

        const { error } = await supabase.storage
          .from('templates')
          .upload(storagePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          })

        if (error) {
          console.error(`  ✗ ${storagePath}: ${error.message}`)
        } else {
          console.log(`  ✓ Uploaded ${storagePath}`)
        }
      }
    }
  } finally {
    await browser.close()
  }

  console.log('Done.')
}

generateAndUpload().catch(console.error)
