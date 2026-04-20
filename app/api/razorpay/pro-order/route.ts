import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRazorpay } from '@/lib/razorpay'
import { PRO_PRICE_INR, isPro } from '@/lib/pro'

export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const alreadyPro = await isPro(user.id, supabase)
  if (alreadyPro) return Response.json({ error: 'Already Pro' }, { status: 400 })

  const order = await getRazorpay().orders.create({
    amount: PRO_PRICE_INR,
    currency: 'INR',
    receipt: `pro_${user.id.slice(0, 8)}`,
    notes: { userId: user.id, product: 'pro_access' },
  })

  return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency })
}
