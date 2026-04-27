import type { ResumeData } from './resume-data'

function esc(s: string | undefined | null): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)|hsl\(\s*\d{1,3}\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\))$/
function safeColor(color: string, fallback = '#2563eb'): string {
  return COLOR_RE.test(color.trim()) ? color.trim() : fallback
}

function sectionLabel(text: string, color: string) {
  return `<div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};border-bottom:1px solid ${color};padding-bottom:4px;margin-bottom:10px;margin-top:20px;">${text}</div>`
}

function expHtml(experience: ResumeData['experience']) {
  return experience.map(exp => `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:15px;font-weight:600;color:#1a1a1a;">${esc(exp.role)}</span>
        <span style="font-size:13px;color:#888;">${esc(exp.startDate)}${exp.endDate ? ' – ' + esc(exp.endDate) : exp.startDate ? ' – Present' : ''}</span>
      </div>
      <div style="font-size:13px;color:#555;margin-bottom:4px;">${esc(exp.company)}</div>
      ${exp.bullets.map(b => `<div style="font-size:15px;color:#444;margin-left:10px;margin-top:2px;">· ${esc(b)}</div>`).join('')}
    </div>
  `).join('')
}

function eduHtml(education: ResumeData['education']) {
  return education.map(edu => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:15px;font-weight:600;color:#1a1a1a;">${esc(edu.degree)}</span>
        <span style="font-size:13px;color:#888;">${esc(edu.year)}</span>
      </div>
      <div style="font-size:13px;color:#555;">${esc(edu.institution)}${edu.gpa ? ` · ${esc(edu.gpa)}` : ''}</div>
    </div>
  `).join('')
}

const BASE_STYLE = `* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, Helvetica, sans-serif; color: #222; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`

// ─── Classic ───────────────────────────────────────────────────────────────

function buildClassicHtml(data: ResumeData, accentColor: string): string {
  const { personal, experience, education, skills, skillCategories } = data
  const color = safeColor(accentColor)
  const name = esc(personal.name) || 'Your Name'
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).map(esc).join(' · ')

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    ${BASE_STYLE}
    .page { max-width: 750px; margin: 0 auto; padding: 48px; }
  </style></head><body><div class="page">
    <div style="text-align:center;border-bottom:2px solid ${color};padding-bottom:20px;margin-bottom:4px;">
      <div style="font-size:28px;font-weight:700;letter-spacing:2px;color:#111;">${name.toUpperCase()}</div>
      ${personal.title ? `<div style="font-size:15px;letter-spacing:3px;text-transform:uppercase;color:${color};margin-top:6px;">${esc(personal.title)}</div>` : ''}
      ${contact ? `<div style="font-size:13px;color:#888;margin-top:8px;">${contact}</div>` : ''}
    </div>
    ${personal.summary ? sectionLabel('Summary', color) + `<div style="font-size:15px;color:#555;line-height:1.7;">${esc(personal.summary)}</div>` : ''}
    ${experience.length ? sectionLabel('Experience', color) + expHtml(experience) : ''}
    ${education.length ? sectionLabel('Education', color) + eduHtml(education) : ''}
    ${(skillCategories?.length ?? skills.length) ? sectionLabel('Skills', color) + (skillCategories?.length
      ? skillCategories.map(cat => `<div style="font-size:15px;color:#444;margin-bottom:4px;"><span style="font-weight:600;color:#1a1a1a;">${esc(cat.category)}:</span> ${cat.items.map(esc).join(' · ')}</div>`).join('')
      : `<div style="font-size:15px;color:#555;">${skills.map(esc).join(' · ')}</div>`) : ''}
    ${data.awards?.length ? sectionLabel('Awards &amp; Achievements', color) + `<ul style="margin:0;padding-left:16px;">${data.awards.map(a => `<li style="font-size:15px;color:#444;margin-bottom:4px;">${esc(a)}</li>`).join('')}</ul>` : ''}
  </div></body></html>`
}

// ─── Modern ────────────────────────────────────────────────────────────────

function buildModernHtml(data: ResumeData, accentColor: string): string {
  const { personal, experience, education, skills, skillCategories } = data
  const color = safeColor(accentColor)
  const name = esc(personal.name) || 'Your Name'
  const initials = (personal.name || '').split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '??'
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).map(esc).join(' · ')

  const skillsHtml = skillCategories?.length
    ? skillCategories.map(cat => `
        <div style="margin-bottom:8px;">
          <div style="font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">${esc(cat.category)}</div>
          <div>${cat.items.map(item => `<span style="background:${color};color:white;padding:3px 8px;border-radius:4px;font-size:13px;margin:2px;display:inline-block;">${esc(item)}</span>`).join('')}</div>
        </div>`).join('')
    : skills.map(s => `<span style="background:${color};color:white;padding:3px 8px;border-radius:4px;font-size:13px;margin:2px;display:inline-block;">${esc(s)}</span>`).join('')

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    ${BASE_STYLE}
    .page { max-width: 750px; margin: 0 auto; display: flex; min-height: 1063px; }
    .bar { width: 8px; flex-shrink: 0; background: ${color}; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .header { background: ${color}; padding: 28px 32px; display: flex; align-items: center; gap: 20px; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .content { padding: 28px 32px; }
  </style></head><body><div class="page">
    <div class="bar"></div>
    <div class="main">
      <div class="header">
        <div class="avatar"><span style="color:white;font-weight:700;font-size:20px;">${esc(initials)}</span></div>
        <div>
          <div style="font-size:26px;font-weight:700;color:white;letter-spacing:1px;">${name.toUpperCase()}</div>
          ${personal.title ? `<div style="font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;margin-top:4px;">${esc(personal.title)}</div>` : ''}
        </div>
      </div>
      <div class="content">
        ${contact ? `<div style="font-size:13px;color:#888;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:4px;">${contact}</div>` : ''}
        ${personal.summary ? sectionLabel('Summary', color) + `<div style="font-size:15px;color:#555;line-height:1.7;">${esc(personal.summary)}</div>` : ''}
        ${experience.length ? sectionLabel('Experience', color) + expHtml(experience) : ''}
        ${education.length ? sectionLabel('Education', color) + eduHtml(education) : ''}
        ${(skillCategories?.length ?? skills.length) ? sectionLabel('Skills', color) + `<div style="margin-top:4px;">${skillsHtml}</div>` : ''}
        ${data.awards?.length ? sectionLabel('Awards &amp; Achievements', color) + `<ul style="margin:0;padding-left:16px;">${data.awards.map(a => `<li style="font-size:15px;color:#444;margin-bottom:4px;">${esc(a)}</li>`).join('')}</ul>` : ''}
      </div>
    </div>
  </div></body></html>`
}

// ─── Multicolumn ───────────────────────────────────────────────────────────

function buildMulticolumnHtml(data: ResumeData, accentColor: string): string {
  const { personal, experience, education, skills, skillCategories } = data
  const color = safeColor(accentColor)
  const name = esc(personal.name) || 'Your Name'

  const sidebarSectionLabel = (text: string) =>
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:4px;margin-bottom:8px;margin-top:16px;">${text}</div>`

  const skillsHtml = skillCategories?.length
    ? skillCategories.map(cat => `
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">${esc(cat.category)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${cat.items.map(item => `<span style="font-size:13px;color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.12);padding:2px 7px;border-radius:3px;">${esc(item)}</span>`).join('')}
          </div>
        </div>
      `).join('')
    : skills.map(s => `
        <div style="margin-bottom:6px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;">
              <div style="width:75%;height:4px;background:rgba(255,255,255,0.7);border-radius:2px;"></div>
            </div>
            <span style="font-size:13px;color:rgba(255,255,255,0.7);min-width:60px;">${esc(s)}</span>
          </div>
        </div>
      `).join('')

  const hasSkills = (skillCategories?.length ?? 0) > 0 || skills.length > 0

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    ${BASE_STYLE}
    .page { max-width: 750px; margin: 0 auto; display: flex; min-height: 1063px; }
    .sidebar { width: 260px; flex-shrink: 0; background: ${color}; padding: 36px 24px; color: white; }
    .main { flex: 1; padding: 36px 32px; }
  </style></head><body><div class="page">
    <div class="sidebar">
      <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.15);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="color:rgba(255,255,255,0.5);font-size:28px;">&#128100;</span>
      </div>
      <div style="text-align:center;">
        <div style="font-size:18px;font-weight:700;color:white;">${name.toUpperCase()}</div>
        ${personal.title ? `<div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">${esc(personal.title)}</div>` : ''}
      </div>
      ${sidebarSectionLabel('Contact')}
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.8;">
        ${personal.email ? `<div>${esc(personal.email)}</div>` : ''}
        ${personal.phone ? `<div>${esc(personal.phone)}</div>` : ''}
        ${personal.location ? `<div>${esc(personal.location)}</div>` : ''}
        ${personal.linkedin ? `<div>${esc(personal.linkedin)}</div>` : ''}
      </div>
      ${hasSkills ? sidebarSectionLabel('Skills') + skillsHtml : ''}
    </div>
    <div class="main">
      ${personal.summary ? `<div style="font-size:15px;color:#555;line-height:1.7;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #eee;">${esc(personal.summary)}</div>` : ''}
      ${experience.length ? sectionLabel('Experience', color) + expHtml(experience) : ''}
      ${education.length ? sectionLabel('Education', color) + eduHtml(education) : ''}
      ${data.awards?.length ? sectionLabel('Awards &amp; Achievements', color) + `<ul style="margin:0;padding-left:16px;">${data.awards.map(a => `<li style="font-size:15px;color:#444;margin-bottom:4px;">${esc(a)}</li>`).join('')}</ul>` : ''}
    </div>
  </div></body></html>`
}

// ─── Quotation ─────────────────────────────────────────────────────────────

function buildQuotationHtml(data: ResumeData, accentColor: string): string {
  const { personal, experience, education } = data
  const color = safeColor(accentColor)
  const name = esc(personal.name) || 'Your Name'
  const contact = [personal.email, personal.location].filter(Boolean).map(esc).join(' · ')

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    ${BASE_STYLE}
    .page { max-width: 750px; margin: 0 auto; padding: 48px; background: #fdfaf5; min-height: 1063px; position: relative; }
    .quote-mark { position: absolute; top: 24px; right: 32px; font-size: 120px; line-height: 1; font-family: Georgia, serif; opacity: 0.08; color: ${color}; }
  </style></head><body><div class="page">
    <div class="quote-mark">&ldquo;</div>
    <div style="margin-bottom:20px;">
      <div style="font-size:30px;font-weight:700;color:#111;">${name}</div>
      ${personal.title ? `<div style="font-size:15px;color:${color};margin-top:4px;">${esc(personal.title)}</div>` : ''}
      <div style="width:40px;height:3px;background:${color};border-radius:2px;margin-top:10px;"></div>
    </div>
    <div style="font-size:13px;color:#888;margin-bottom:20px;line-height:1.7;">
      ${contact ? `<div>${contact}</div>` : ''}
      ${personal.linkedin ? `<div>${esc(personal.linkedin)}</div>` : ''}
    </div>
    ${personal.summary ? `<div style="font-size:15px;color:#555;line-height:1.7;margin-bottom:20px;font-style:italic;">${esc(personal.summary)}</div>` : ''}
    ${experience.length ? `
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:10px;">Experience</div>
      ${experience.map(exp => `
        <div style="margin-bottom:14px;">
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;">${esc(exp.role)}${exp.company ? ` — ${esc(exp.company)}` : ''}</div>
          <div style="font-size:13px;color:#888;margin-bottom:3px;">${esc(exp.startDate)}${exp.endDate ? ' – ' + esc(exp.endDate) : exp.startDate ? ' – Present' : ''}</div>
          ${exp.bullets.map(b => `<div style="font-size:15px;color:#555;margin-left:10px;">· ${esc(b)}</div>`).join('')}
        </div>
      `).join('')}
    ` : ''}
    ${education.length ? `
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:10px;margin-top:20px;">Education</div>
      ${education.map(edu => `
        <div style="margin-bottom:10px;">
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;">${esc(edu.degree)}</div>
          <div style="font-size:13px;color:#888;">${[edu.institution, edu.year, edu.gpa].filter(Boolean).map(esc).join(' · ')}</div>
        </div>
      `).join('')}
    ` : ''}
    ${data.awards?.length ? `
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:10px;margin-top:20px;">Awards &amp; Achievements</div>
      <ul style="margin:0;padding-left:16px;">
        ${data.awards.map(a => `<li style="font-size:15px;color:#555;margin-bottom:4px;">${esc(a)}</li>`).join('')}
      </ul>
    ` : ''}
  </div></body></html>`
}

// ─── Executive ─────────────────────────────────────────────────────────────

function buildExecutiveHtml(data: ResumeData, accentColor: string): string {
  const { personal, experience, education } = data
  const color = safeColor(accentColor)
  const name = esc(personal.name) || 'Your Name'
  const initials = (personal.name || '').split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '??'
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).map(esc).join('  ·  ')

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    ${BASE_STYLE}
    .page { max-width: 750px; margin: 0 auto; }
    .header { background: ${color}; padding: 28px 36px; display: flex; align-items: center; justify-content: space-between; }
    .content { padding: 32px 36px; }
  </style></head><body><div class="page">
    <div class="header">
      <div>
        <div style="font-size:28px;font-weight:700;color:white;letter-spacing:2px;">${name.toUpperCase()}</div>
        ${personal.title ? `<div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#c9b99a;margin-top:6px;">${esc(personal.title)}</div>` : ''}
        ${contact ? `<div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:10px;letter-spacing:0.5px;">${contact}</div>` : ''}
      </div>
      <div style="width:56px;height:56px;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:24px;">
        <span style="color:white;font-size:18px;font-weight:700;">${esc(initials)}</span>
      </div>
    </div>
    <div class="content">
      ${personal.summary ? `<div style="font-size:15px;color:#555;line-height:1.7;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #eee;">${esc(personal.summary)}</div>` : ''}
      ${experience.length ? `
        <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};border-bottom:1px solid ${color};padding-bottom:4px;margin-bottom:14px;">Career History</div>
        ${expHtml(experience)}
      ` : ''}
      ${education.length ? sectionLabel('Education', color) + eduHtml(education) : ''}
      ${data.awards?.length ? sectionLabel('Awards &amp; Achievements', color) + `<ul style="margin:0;padding-left:16px;">${data.awards.map(a => `<li style="font-size:15px;color:#444;margin-bottom:4px;">${esc(a)}</li>`).join('')}</ul>` : ''}
    </div>
  </div></body></html>`
}

// ─── Router ────────────────────────────────────────────────────────────────

export function buildResumeHtml(data: ResumeData, accentColor: string, templateId: string): string {
  switch (templateId) {
    case 'modern':      return buildModernHtml(data, accentColor)
    case 'multicolumn': return buildMulticolumnHtml(data, accentColor)
    case 'quotation':   return buildQuotationHtml(data, accentColor)
    case 'executive':   return buildExecutiveHtml(data, accentColor)
    default:            return buildClassicHtml(data, accentColor)
  }
}
