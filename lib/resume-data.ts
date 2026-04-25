export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  year: string
}

export interface ResumeData {
  personal: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    linkedin: string
  }
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
}

const str = (v: unknown, max = 500) => String(v ?? '').slice(0, max)

export function validateResumeData(raw: unknown): ResumeData {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const p = (d.personal && typeof d.personal === 'object' ? d.personal : {}) as Record<string, unknown>

  const experience: ExperienceEntry[] = Array.isArray(d.experience)
    ? d.experience.slice(0, 20).map((e: unknown) => {
        const x = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
        return {
          id: str(x.id, 50),
          company: str(x.company),
          role: str(x.role),
          startDate: str(x.startDate, 50),
          endDate: str(x.endDate, 50),
          bullets: Array.isArray(x.bullets) ? x.bullets.slice(0, 10).map((b: unknown) => str(b, 500)) : [],
        }
      })
    : []

  const education: EducationEntry[] = Array.isArray(d.education)
    ? d.education.slice(0, 10).map((e: unknown) => {
        const x = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
        return {
          id: str(x.id, 50),
          institution: str(x.institution),
          degree: str(x.degree),
          year: str(x.year, 50),
        }
      })
    : []

  return {
    personal: {
      name: str(p.name),
      title: str(p.title),
      email: str(p.email),
      phone: str(p.phone, 50),
      location: str(p.location),
      linkedin: str(p.linkedin),
    },
    experience,
    education,
    skills: Array.isArray(d.skills) ? d.skills.slice(0, 30).map((s: unknown) => str(s, 100)) : [],
  }
}

export const SAMPLE_RESUME: ResumeData = {
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
        'Managed cross-functional team of 14 (engg, design, analytics) to ship 4 major features per quarter on schedule',
      ],
    },
    {
      id: '2',
      company: 'Razorpay',
      role: 'Product Manager',
      startDate: 'Jul 2018',
      endDate: 'Dec 2020',
      bullets: [
        'Owned payments dashboard product used by 80,000+ merchants; reduced support tickets by 27% through self-serve tooling',
        'Launched recurring payments feature end-to-end in 10 weeks, acquired 1,200 enterprise clients in first quarter',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'IIM Bangalore',
      degree: 'MBA, Strategy & Technology',
      year: '2018',
    },
    {
      id: '2',
      institution: 'BITS Pilani',
      degree: 'B.E. Computer Science',
      year: '2016',
    },
  ],
  skills: ['Product Strategy', 'Roadmapping', 'SQL', 'A/B Testing', 'Figma', 'JIRA', 'Python', 'Go-to-Market'],
}

export const EMPTY_RESUME: ResumeData = {
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
  },
  experience: [],
  education: [],
  skills: [],
}
