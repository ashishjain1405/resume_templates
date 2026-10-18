import type { SupabaseClient } from '@supabase/supabase-js'

export const PRO_PRICE_INR = 99900 // ₹999 in paise

export async function isPro(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase
    .from('pro_access')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

// True if the user may download/export resumes built on this template (Pro or individual purchase)
export async function canUseTemplate(userId: string, templateId: string, supabase: SupabaseClient): Promise<boolean> {
  if (await isPro(userId, supabase)) return true
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .maybeSingle()
  return !!data
}
