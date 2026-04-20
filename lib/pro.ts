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
