import type { ResumeData } from '@/lib/resume-data'

interface Props {
  accentColor?: string
  data?: ResumeData
}

export default function QuotationPreview({ accentColor = '#d4a853', data }: Props) {
  const name = data?.personal.name || 'Kathleen Jones'
  const title = data?.personal.title || 'Content Strategist & Writer'
  const email = data?.personal.email || 'kathleen@email.com'
  const location = data?.personal.location || 'Mumbai, India'
  const linkedin = data?.personal.linkedin || 'linkedin.com/in/kathleenjones'

  const experience = data?.experience.length
    ? data.experience
    : [
        { id: '1', role: 'Content Lead', company: 'Times Internet', startDate: '2021', endDate: '', bullets: ['Grew blog traffic by 3x in 18 months'] },
        { id: '2', role: 'Senior Writer', company: 'YourStory', startDate: '2018', endDate: '2021', bullets: [] },
      ]

  const education = data?.education.length
    ? data.education
    : [{ id: '1', degree: 'BA English Literature', institution: 'Delhi University', year: '2018' }]

  return (
    <div className="w-full bg-[#fdfaf5] text-[5.5px] leading-tight p-3 font-sans relative">
      <div className="absolute top-2 right-2 text-[40px] leading-none font-serif opacity-10" style={{ color: accentColor }}>"</div>

      <div className="mb-2">
        <div className="font-bold text-[10px] text-gray-900 tracking-tight">{name}</div>
        <div className="text-[5.5px] mt-0.5" style={{ color: accentColor }}>{title}</div>
        <div className="w-8 h-0.5 mt-1 rounded" style={{ backgroundColor: accentColor }} />
      </div>

      <div className="mb-2 text-[4.5px] text-gray-400 space-y-0.5">
        <div>{[email, location].filter(Boolean).join(' · ')}</div>
        {linkedin && <div>{linkedin}</div>}
      </div>

      {data?.personal.summary && (
        <div className="mb-2 text-gray-500 text-[4.5px] leading-relaxed italic">{data.personal.summary}</div>
      )}

      <div className="mb-1.5">
        <div className="font-bold text-[5px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>Experience</div>
        {experience.map((exp) => (
          <div key={exp.id} className="mb-1">
            <div className="font-semibold text-gray-800 text-[5.5px]">{exp.role}{exp.company ? ` — ${exp.company}` : ''}</div>
            <div className="text-gray-400 text-[4.5px]">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.startDate ? ' – Present' : ''}</div>
            {exp.bullets.map((b, i) => (
              <div key={i} className="text-gray-400 text-[4.5px] mt-0.5">· {b}</div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Education</div>
        {education.map((edu) => (
          <div key={edu.id}>
            <div className="font-semibold text-gray-800 text-[5.5px]">{edu.degree}</div>
            <div className="text-gray-400 text-[4.5px]">{[edu.institution, edu.year, edu.gpa].filter(Boolean).join(' · ')}</div>
          </div>
        ))}
      </div>

      {(data?.awards?.length ?? 0) > 0 && (
        <div className="mt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Awards</div>
          {data!.awards!.map((a, i) => (
            <div key={i} className="text-gray-400 text-[4.5px]">· {a}</div>
          ))}
        </div>
      )}
    </div>
  )
}
