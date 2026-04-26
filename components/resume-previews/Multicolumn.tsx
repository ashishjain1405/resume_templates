import type { ResumeData } from '@/lib/resume-data'

interface Props {
  accentColor?: string
  data?: ResumeData
}

export default function MulticolumnPreview({ accentColor = '#2c3e50', data }: Props) {
  const name = data?.personal.name || 'JONATHAN HILL'
  const title = data?.personal.title || 'Software Engineer'
  const email = data?.personal.email || 'jonathan@email.com'
  const phone = data?.personal.phone || '+91 98765 43210'
  const location = data?.personal.location || 'Bangalore, India'

  const skillCategories = data?.skillCategories?.length ? data.skillCategories : null
  const skills = data?.skills.length ? data.skills.slice(0, 4) : ['React', 'Node.js', 'Python', 'AWS']

  const experience = data?.experience.length
    ? data.experience
    : [
        { id: '1', role: 'Senior Developer', company: 'Google India, Bangalore', startDate: '2021', endDate: '', bullets: ['Built scalable microservices', 'Led team of 8 engineers'] },
        { id: '2', role: 'Developer', company: 'Infosys, Pune', startDate: '2018', endDate: '2021', bullets: [] },
      ]

  const education = data?.education.length
    ? data.education
    : [{ id: '1', degree: 'B.Tech Computer Science', institution: 'IIT Delhi', year: '2018' }]

  return (
    <div className="w-full h-full bg-white text-[5.5px] leading-tight overflow-hidden flex font-sans">
      {/* Left sidebar */}
      <div className="w-2/5 text-white p-2 flex flex-col gap-1.5" style={{ backgroundColor: accentColor }}>
        <div className="w-10 h-10 rounded-full bg-white/20 mx-auto mb-1 flex items-center justify-center">
          <div className="text-white/60 text-[8px]">👤</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-[7px] text-white">{name.toUpperCase()}</div>
          <div className="text-white/70 text-[5px] mt-0.5">{title}</div>
        </div>

        <div className="border-t border-white/20 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider text-white/80 mb-1">Contact</div>
          <div className="text-white/70 text-[4.5px] space-y-0.5">
            <div>{email}</div>
            <div>{phone}</div>
            <div>{location}</div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider text-white/80 mb-1">Skills</div>
          {skillCategories ? (
            <div className="space-y-1">
              {skillCategories.map(cat => (
                <div key={cat.category}>
                  <div className="text-white/50 text-[3.5px] uppercase tracking-wider mb-0.5">{cat.category}</div>
                  <div className="flex flex-wrap gap-0.5">
                    {cat.items.slice(0, 4).map(item => (
                      <span key={item} className="text-white/80 text-[4px] bg-white/10 px-1 py-0.5 rounded">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {skills.map(skill => (
                <div key={skill} className="flex items-center gap-1">
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="h-1 bg-white/70 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-white/70 text-[4px] w-8 truncate">{skill}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 p-2 space-y-1.5">
        {data?.personal.summary && (
          <div className="text-gray-500 text-[4.5px] leading-relaxed pb-1 border-b border-gray-100">{data.personal.summary}</div>
        )}
        <div>
          <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 text-[5.5px]">{exp.role}</span>
                <span className="text-gray-400 text-[4.5px]">{exp.startDate}{exp.endDate ? `–${exp.endDate}` : exp.startDate ? '–Now' : ''}</span>
              </div>
              <div className="text-gray-500 text-[4.5px]">{exp.company}</div>
              {exp.bullets.map((b, i) => (
                <div key={i} className="text-gray-400 text-[4.5px] mt-0.5">· {b}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Education</div>
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="font-semibold text-gray-800 text-[5.5px]">{edu.degree}</div>
              <div className="text-gray-500 text-[4.5px]">{[edu.institution, edu.year, edu.gpa].filter(Boolean).join(' · ')}</div>
            </div>
          ))}
        </div>

        {(data?.awards?.length ?? 0) > 0 && (
          <div className="border-t border-gray-100 pt-1.5">
            <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Awards</div>
            {data!.awards!.map((a, i) => (
              <div key={i} className="text-gray-400 text-[4.5px]">· {a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
