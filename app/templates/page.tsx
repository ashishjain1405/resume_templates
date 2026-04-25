import type { Metadata } from 'next'
import Link from 'next/link'
import TemplateCard from '@/components/TemplateCard'
import { TEMPLATES } from '@/lib/templates'
import { createClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'

export const metadata: Metadata = {
  title: 'Resume Templates',
  description: 'Browse ATS-friendly resume templates — Classic, Modern, Multicolumn, and more. One-time purchase, instant PDF download.',
  alternates: { canonical: 'https://www.resume-expert.com/templates' },
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pro = false
  let purchasedIds = new Set<string>()

  if (user) {
    const [proResult, { data: purchases }] = await Promise.all([
      isPro(user.id, supabase),
      supabase.from('purchases').select('template_id').eq('user_id', user.id),
    ])
    pro = proResult
    purchasedIds = new Set((purchases ?? []).map((p) => p.template_id))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates</h1>
        <p className="text-gray-500 mb-4">Buy once, create your resume, download instantly — yours forever as a PDF.</p>
        <Link
          href="/builder/multicolumn"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Start building your resume →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} purchased={pro || purchasedIds.has(template.id)} />
        ))}
      </div>
    </div>
  )
}
