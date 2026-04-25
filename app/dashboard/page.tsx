import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import { isPro } from '@/lib/pro'
import DashboardTabs from '@/components/DashboardTabs'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signup')

  const [
    { data: purchases },
    pro,
    { count: atsCount },
    { data: latestResume },
    { data: upcomingSession },
    { count: sessionsBooked },
    { count: extraPurchases },
  ] = await Promise.all([
    supabase.from('purchases').select('template_id').eq('user_id', user.id),
    isPro(user.id, supabase),
    supabase.from('ats_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('uploaded_resumes').select('id, filename, created_at, ats_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('sessions').select('id, scheduled_at, meet_link, status').eq('user_id', user.id).eq('status', 'confirmed').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('session_purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const hasRemainingCredits = (sessionsBooked ?? 0) < 1 + (extraPurchases ?? 0)

  const purchasedIds = new Set((purchases ?? []).map((p) => p.template_id))
  const accessibleTemplates = pro ? TEMPLATES : TEMPLATES.filter((t) => purchasedIds.has(t.id))
  const lockedTemplates = pro ? [] : TEMPLATES.filter((t) => !purchasedIds.has(t.id))

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <DashboardTabs
        pro={pro}
        userEmail={user.email}
        accessibleTemplates={accessibleTemplates}
        lockedTemplates={lockedTemplates}
        atsChecksUsed={atsCount ?? 0}
        latestResume={latestResume ?? null}
        upcomingSession={upcomingSession ?? null}
        hasRemainingCredits={hasRemainingCredits}
        templateCount={accessibleTemplates.length}
      />
    </div>
  )
}
