import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRazorpay } from '@/lib/razorpay'
import { TEMPLATES } from '@/lib/templates'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await checkRateLimit(user.id, 'razorpay-create-order', 10))) {
    return Response.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 })
  }

  const { templateId } = await request.json()
  const template = TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 })
  }

  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('template_id', templateId)
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'Already purchased' }, { status: 400 })
  }

  const order = await getRazorpay().orders.create({
    amount: template.price_inr,
    currency: 'INR',
    receipt: `receipt_${user.id.slice(0, 8)}_${templateId.slice(0, 8)}`,
    notes: {
      userId: user.id,
      templateId,
    },
  })

  return Response.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  })
}
