import type { ResumeData } from '@/lib/resume-data'

interface Props {
  accentColor?: string
  data?: ResumeData
}

export default function ModernPreview({ accentColor = '#e94560', data }: Props) {
  const name = data?.personal.name || 'CHARLES MENDOZA'
  const title = data?.personal.title || 'Product Designer'
  const email = data?.personal.email || 'charles@email.com'
  const phone = data?.personal.phone || '+91 98765 43210'
  const location = data?.personal.location || 'Delhi'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CM'

  const experience = data?.experience.length
    ? data.experience
    : [
        { id: '1', role: 'Lead Designer', company: 'Razorpay, Bangalore', startDate: '2022', endDate: '', bullets: ['Redesigned checkout flow (+23% conversion)'] },
        { id: '2', role: 'UI Designer', company: "BYJU'S, Bangalore", startDate: '2019', endDate: '2022', bullets: [] },
      ]

  const skillCategories = data?.skillCategories?.length ? data.skillCategories : null
  const skills = data?.skills.length ? data.skills.slice(0, 4) : ['Figma', 'Prototyping', 'User Research', 'Design Systems']

  return (
    <div className="w-full bg-white text-[5.5px] leading-tight flex font-sans" style={{ minHeight: 297 }}>
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 flex flex-col">
        <div className="p-2 pb-1.5" style={{ backgroundColor: accentColor }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/30 flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-[9px]">{initials}</span>
            </div>
            <div>
              <div className="font-bold text-[8px] text-white">{name.toUpperCase()}</div>
              <div className="text-white/80 text-[5px] mt-0.5 uppercase tracking-wider">{title}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 space-y-1.5">
          <div className="flex gap-2 text-[4.5px] text-gray-400 border-b border-gray-100 pb-1">
            <span>{email}</span>
            {phone && <><span>·</span><span>{phone}</span></>}
            {location && <><span>·</span><span>{location}</span></>}
          </div>

          {data?.personal.summary && (
            <div className="text-gray-500 text-[4.5px] leading-relaxed">{data.personal.summary}</div>
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

          <div>
            <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Skills</div>
            {skillCategories ? (
              <div className="space-y-0.5">
                {skillCategories.map(cat => (
                  <div key={cat.category}>
                    <div className="text-[3.5px] uppercase tracking-wider text-gray-400 mb-0.5">{cat.category}</div>
                    <div className="flex flex-wrap gap-0.5">
                      {cat.items.slice(0, 4).map(item => (
                        <span key={item} className="px-1 py-0.5 rounded text-[4px] text-white" style={{ backgroundColor: accentColor }}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-0.5">
                {skills.map(s => (
                  <span key={s} className="px-1 py-0.5 rounded text-[4px] text-white" style={{ backgroundColor: accentColor }}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {(data?.awards?.length ?? 0) > 0 && (
            <div>
              <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Awards</div>
              {data!.awards!.map((a, i) => (
                <div key={i} className="text-gray-400 text-[4.5px]">· {a}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
