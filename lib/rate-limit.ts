import { createAdminClient } from '@/lib/supabase-server'

/**
 * Returns true if the user is within limits, false if rate limit exceeded.
 * key: endpoint identifier e.g. 'ats-check'
 * limit: max requests allowed in the window
 * windowMs: window size in milliseconds (default 1 hour)
 */
export async function checkRateLimit(
  userId: string,
  key: string,
  limit: number,
  windowMs = 60 * 60 * 1000,
): Promise<boolean> {
  const adminClient = await createAdminClient()
  const since = new Date(Date.now() - windowMs).toISOString()

  const { count } = await adminClient
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('key', key)
    .gte('created_at', since)

  if ((count ?? 0) >= limit) return false

  await adminClient.from('rate_limits').insert({ user_id: userId, key })

  // 1% chance: clean up old rows to keep the table small
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    await adminClient.from('rate_limits').delete().lt('created_at', cutoff)
  }

  return true
}
