import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import { isPro } from '@/lib/pro'
import TemplateCard from '@/components/TemplateCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: purchases }, pro] = await Promise.all([
    supabase.from('purchases').select('template_id').eq('user_id', user.id),
    isPro(user.id, supabase),
  ])

  const purchasedIds = new Set((purchases ?? []).map((p) => p.template_id))
  const accessibleTemplates = pro ? TEMPLATES : TEMPLATES.filter((t) => purchasedIds.has(t.id))
  const lockedTemplates = pro ? [] : TEMPLATES.filter((t) => !purchasedIds.has(t.id))

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
          <p className="text-gray-500">Your templates and tools.</p>
        </div>
        {pro && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Pro Access
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/builder/multicolumn" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Resume Builder</div>
            <div className="text-xs text-gray-400">Edit your resume</div>
          </div>
        </Link>

        <Link href={pro ? '/ats-check' : '/pricing'} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              ATS Checker {!pro && <span className="text-xs text-blue-500 font-normal ml-1">— Pro</span>}
            </div>
            <div className="text-xs text-gray-400">{pro ? 'Check your resume score' : 'Upgrade to access'}</div>
          </div>
        </Link>

        <Link href="/templates" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Templates</div>
            <div className="text-xs text-gray-400">Browse all designs</div>
          </div>
        </Link>
      </div>

      {/* Templates */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {pro ? 'All Templates' : 'My Templates'}
      </h2>

      {accessibleTemplates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-8">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-5 text-sm">Purchase individual templates or upgrade to Pro to get all 5.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/templates" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">Browse templates</Link>
            <Link href="/pricing" className="border border-blue-600 text-blue-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">Get Pro — ₹999</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {accessibleTemplates.map((t) => <TemplateCard key={t.id} template={t} purchased />)}
        </div>
      )}

      {!pro && lockedTemplates.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">More templates</h2>
            <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:text-blue-700">Get Pro for all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {lockedTemplates.map((t) => <TemplateCard key={t.id} template={t} />)}
          </div>
        </>
      )}
    </div>
  )
}
