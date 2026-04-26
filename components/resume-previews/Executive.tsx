import type { ResumeData } from '@/lib/resume-data'

interface Props {
  accentColor?: string
  data?: ResumeData
}

export default function ExecutivePreview({ accentColor = '#1c1c1c', data }: Props) {
  const name = data?.personal.name || 'RAJESH KUMAR'
  const title = data?.personal.title || 'Chief Executive Officer'
  const email = data?.personal.email || 'rajesh@email.com'
  const phone = data?.personal.phone || '+91 98765 43210'
  const location = data?.personal.location || 'Mumbai'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'RK'

  const experience = data?.experience.length
    ? data.experience
    : [
        { id: '1', role: 'CEO, Tata Digital', company: '', startDate: '2019', endDate: '', bullets: ['₹2,400 Cr revenue under management', 'Led acquisition of BigBasket'] },
        { id: '2', role: 'MD, Reliance Retail', company: 'Mumbai', startDate: '2014', endDate: '2019', bullets: [] },
      ]

  const education = data?.education.length
    ? data.education
    : [{ id: '1', degree: 'MBA, Harvard Business School', institution: '', year: '2003' }]

  return (
    <div className="w-full h-full bg-white text-[5.5px] leading-tight overflow-hidden font-sans">
      <div className="px-3 py-2.5" style={{ backgroundColor: accentColor }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-[9px] text-white tracking-wide">{name.toUpperCase()}</div>
            <div className="text-[5px] tracking-widest uppercase mt-0.5" style={{ color: '#c9b99a' }}>{title}</div>
          </div>
          <div className="w-9 h-9 rounded flex items-center justify-center border border-white/20">
            <span className="text-white font-bold text-[9px]">{initials}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-1.5 text-[4.5px] text-white/60">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
        </div>
      </div>

      <div className="p-2.5 space-y-1.5">
        {data?.personal.summary && (
          <div className="text-gray-500 text-[4.5px] leading-relaxed pb-1 border-b border-gray-100">{data.personal.summary}</div>
        )}
        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>Career History</div>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-1">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-gray-900 text-[5.5px]">{exp.role}</span>
                <span className="text-gray-400 text-[4.5px]">{exp.startDate}{exp.endDate ? `–${exp.endDate}` : exp.startDate ? '–Now' : ''}</span>
              </div>
              {exp.company && <div className="text-gray-400 text-[4.5px]">{exp.company}</div>}
              {exp.bullets.slice(0, 2).map((b, i) => (
                <div key={i} className="text-gray-400 text-[4.5px] mt-0.5">· {b}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Education</div>
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="font-semibold text-gray-900 text-[5.5px]">{edu.degree}</div>
              {(edu.institution || edu.year || edu.gpa) && (
                <div className="text-gray-400 text-[4.5px]">{[edu.institution, edu.year, edu.gpa].filter(Boolean).join(' · ')}</div>
              )}
            </div>
          ))}
        </div>

        {(data?.awards?.length ?? 0) > 0 && (
          <div className="border-t border-gray-100 pt-1.5">
            <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Awards</div>
            {data!.awards!.slice(0, 2).map((a, i) => (
              <div key={i} className="text-gray-400 text-[4.5px]">· {a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
