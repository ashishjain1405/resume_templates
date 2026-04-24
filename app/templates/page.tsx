import type { Metadata } from 'next'
import Link from 'next/link'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'
import { createClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'

export const metadata: Metadata = {
  title: 'Resume Templates',
  description: 'Browse all ATS-friendly resume templates — Classic, Modern, Multicolumn and more. One-time purchase, instant PDF & DOCX download.',
  alternates: { canonical: 'https://www.resumenow.in/templates' },
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pro = user ? await isPro(user.id, supabase) : false

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates</h1>
        <p className="text-gray-500 mb-4">Download once, keep forever. Available in PDF and DOCX.</p>
        <Link
          href="/builder/multicolumn"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Start building your resume →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} purchased={pro} />
        ))}
      </div>
    </div>
  )
}
