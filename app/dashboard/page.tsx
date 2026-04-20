import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import TemplateCard from '@/components/TemplateCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: purchases } = await supabase
    .from('purchases')
    .select('template_id, purchased_at')
    .eq('user_id', user.id)

  const purchasedIds = new Set((purchases ?? []).map((p) => p.template_id))
  const purchasedTemplates = TEMPLATES.filter((t) => purchasedIds.has(t.id))

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Templates</h1>
        <p className="text-gray-500">Templates you&apos;ve purchased — yours to keep forever.</p>
      </div>

      {purchasedTemplates.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h2>
          <p className="text-gray-500 mb-6 text-sm">Browse our collection and find the perfect resume template.</p>
          <Link
            href="/templates"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Browse templates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {purchasedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} purchased />
          ))}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">More templates</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.filter((t) => !purchasedIds.has(t.id)).map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  )
}
