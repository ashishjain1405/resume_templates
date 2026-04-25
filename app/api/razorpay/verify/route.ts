import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, templateId } =
    await request.json()

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

  const template = TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 })
  }

  const adminClient = await createAdminClient()
  const { error } = await adminClient.from('purchases').insert({
    user_id: user.id,
    template_id: templateId,
    razorpay_order_id,
    razorpay_payment_id,
    amount_inr: template.price_inr,
  })

  if (error) {
    if (error.code === '23505') return Response.json({ success: true }) // duplicate payment_id — already recorded
    console.error('Purchase insert error:', JSON.stringify(error))
    return Response.json({ error: `Failed to record purchase: ${error.message} (${error.code})` }, { status: 500 })
  }

  return Response.json({ success: true })
}
