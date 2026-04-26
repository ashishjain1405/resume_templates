import type { ResumeData } from '@/lib/resume-data'

interface Props {
  accentColor?: string
  data?: ResumeData
}

export default function ClassicPreview({ accentColor = '#1e3a5f', data }: Props) {
  const name = data?.personal.name || 'KATHLEEN JONES'
  const title = data?.personal.title || 'Senior Marketing Manager'
  const contact = data
    ? [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' · ')
    : 'kathleen@email.com · +91 98765 43210 · Mumbai, India'

  const experience = data?.experience.length
    ? data.experience
    : [
        { id: '1', role: 'Marketing Director', company: 'Tata Consumer Products, Mumbai', startDate: '2020', endDate: '', bullets: ['Led digital campaigns reaching 5M+ users', 'Increased brand awareness by 40% YoY'] },
        { id: '2', role: 'Brand Manager', company: 'HUL, Bengaluru', startDate: '2017', endDate: '2020', bullets: [] },
      ]

  const education = data?.education.length
    ? data.education
    : [{ id: '1', degree: 'MBA, Marketing', institution: 'IIM Ahmedabad', year: '2017' }]

  const skillCategories = data?.skillCategories?.length ? data.skillCategories : null
  const skills = data?.skills.length ? data.skills : []

  return (
    <div className="w-full h-full bg-white text-[6px] leading-tight overflow-hidden p-3 font-sans">
      {/* Header */}
      <div className="text-center border-b-2 pb-2 mb-2" style={{ borderColor: accentColor }}>
        <div className="font-bold text-[9px] text-gray-900 tracking-wide">{name.toUpperCase()}</div>
        <div className="text-[6px] tracking-widest uppercase mt-0.5" style={{ color: accentColor }}>{title}</div>
        <div className="text-gray-400 mt-0.5 text-[5px]">{contact}</div>
      </div>

      {/* Summary */}
      {data?.personal.summary && (
        <div className="mb-2">
          <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Summary</div>
          <div className="text-gray-500 text-[5px] leading-relaxed">{data.personal.summary}</div>
        </div>
      )}

      {/* Experience */}
      <div className="mb-2">
        <div className="font-bold uppercase tracking-widest text-[5px] mb-1" style={{ color: accentColor }}>Experience</div>
        {experience.map((exp) => (
          <div key={exp.id} className="mb-1">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800 text-[5.5px]">{exp.role}</span>
              <span className="text-gray-400 text-[5px]">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.startDate ? ' – Present' : ''}</span>
            </div>
            <div className="text-gray-500 text-[5px]">{exp.company}</div>
            {exp.bullets.slice(0, 2).map((b, i) => (
              <div key={i} className="text-gray-400 text-[5px] mt-0.5">· {b}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-2">
        <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Education</div>
        {education.map((edu) => (
          <div key={edu.id}>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800 text-[5.5px]">{edu.degree}</span>
              <span className="text-gray-400 text-[5px]">{edu.year}</span>
            </div>
            <div className="text-gray-500 text-[5px]">{edu.institution}{edu.gpa ? ` · ${edu.gpa}` : ''}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {(skillCategories || skills.length > 0) && (
        <div className="mb-2">
          <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Skills</div>
          {skillCategories ? (
            <div className="space-y-0.5">
              {skillCategories.map(cat => (
                <div key={cat.category} className="text-[5px] text-gray-500">
                  <span className="font-semibold text-gray-700">{cat.category}:</span> {cat.items.join(' · ')}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-[5px]">{skills.join(' · ')}</div>
          )}
        </div>
      )}

      {/* Awards */}
      {(data?.awards?.length ?? 0) > 0 && (
        <div>
          <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Awards</div>
          {data!.awards!.map((a, i) => (
            <div key={i} className="text-gray-400 text-[5px]">· {a}</div>
          ))}
        </div>
      )}
    </div>
  )
}
