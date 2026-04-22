import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import { isPro } from '@/lib/pro'
import ProUpgradeCTAs from '@/components/ProUpgradeCTAs'
import DashboardTabs from '@/components/DashboardTabs'

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

      {!pro && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex-wrap">
          <div className="text-sm text-amber-800">
            <span className="font-semibold">✦ You&apos;re on the free plan.</span>{' '}
            <span className="text-amber-700">Unlimited checks, PDF downloads &amp; expert session with Pro.</span>
          </div>
          <ProUpgradeCTAs layout="row" userEmail={user.email} />
        </div>
      )}

      <DashboardTabs
        pro={pro}
        userEmail={user.email}
        accessibleTemplates={accessibleTemplates}
        lockedTemplates={lockedTemplates}
      />
    </div>
  )
}
