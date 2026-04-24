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
