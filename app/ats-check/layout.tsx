import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker',
  description: 'Check your resume\'s ATS score for free. Upload your resume to see how it performs against Applicant Tracking Systems and get a recruiter score, section breakdown, and missing keywords — built for the Indian job market.',
  alternates: { canonical: 'https://www.resume-expert.com/ats-check' },
}

export default function ATSCheckLayout({ children }: { children: React.ReactNode }) {
  return children
}
