import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRazorpay } from '@/lib/razorpay'
import { checkRateLimit } from '@/lib/rate-limit'

const SESSION_PRICE_PAISE = 29900 // ₹299

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await checkRateLimit(user.id, 'razorpay-create-session-order', 5))) {
    return Response.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 })
  }

  const order = await getRazorpay().orders.create({
    amount: SESSION_PRICE_PAISE,
    currency: 'INR',
    receipt: `session_${user.id.slice(0, 8)}`,
    notes: { userId: user.id, product: 'expert_session' },
  })

  return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency })
}
