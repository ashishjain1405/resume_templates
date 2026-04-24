import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { isPro } from '@/lib/pro'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pro Access',
  description: 'Get unlimited Resume checks, all resume templates, and the resume builder — one-time payment, no subscription.',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pro = user ? await isPro(user.id, supabase) : false

  return <PricingClient isPro={pro} userEmail={user?.email ?? ''} isLoggedIn={!!user} />
}
