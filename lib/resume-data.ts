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
