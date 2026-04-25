import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json()

  const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const signaturesMatch = timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(typeof razorpay_signature === 'string' ? razorpay_signature : '', 'hex'),
  )
  if (!signaturesMatch) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payment = await getRazorpay().payments.fetch(razorpay_payment_id)
  if (payment.status !== 'captured') {
    return Response.json({ error: 'Payment not captured' }, { status: 400 })
  }
  if (Number(payment.amount) !== 29900) {
    return Response.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  const { error } = await adminClient.from('session_purchases').insert({
    user_id: user.id,
    razorpay_order_id,
    razorpay_payment_id,
    amount_inr: 29900,
  })

  if (error) {
    if (error.code === '23505') return Response.json({ success: true }) // duplicate payment_id — already recorded
    console.error('Session purchase insert error:', error.code)
    return Response.json({ error: 'Failed to record purchase. Contact support.' }, { status: 500 })
  }

  return Response.json({ success: true })
}
