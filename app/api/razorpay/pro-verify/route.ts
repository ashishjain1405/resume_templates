import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { PRO_PRICE_INR } from '@/lib/pro'
import { getRazorpay } from '@/lib/razorpay'
import { resend, FROM, REPLY_TO } from '@/lib/resend'

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
  if (Number(payment.amount) !== PRO_PRICE_INR) {
    return Response.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  const { error } = await adminClient.from('pro_access').insert({
    user_id: user.id,
    razorpay_order_id,
    razorpay_payment_id,
    amount_inr: PRO_PRICE_INR,
  })

  if (error) {
    if (error.code === '23505') return Response.json({ success: true }) // duplicate payment_id — already recorded
    console.error('Pro access insert error:', error.code)
    return Response.json({ error: 'Failed to record purchase. Contact support.' }, { status: 500 })
  }

  // Send Pro upgrade confirmation email (non-blocking)
  if (user.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#2563eb;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Resume Expert</span>
    <span style="font-size:13px;font-weight:700;color:#d97706;background:#fffbeb;padding:4px 12px;border-radius:20px;border:1px solid #fde68a;">&#10022; Pro</span>
  </div>
  <div style="padding:32px;">
    <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 10px;">Welcome to Pro - this is a big step.</h1>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 28px;">Seriously - most people keep putting off their resume. You didn't. That already puts you ahead.</p>
    <div style="background:#f0f9ff;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="font-size:14px;font-weight:700;color:#1e40af;margin:0 0 12px;">Here's what's yours now:</p>
      <p style="font-size:14px;color:#1e3a5f;margin:0 0 8px;line-height:1.6;">&#10003; &nbsp;Run as many resume score checks as you want - no limits</p>
      <p style="font-size:14px;color:#1e3a5f;margin:0 0 8px;line-height:1.6;">&#10003; &nbsp;AI Re-write - paste a job description and get a tailored resume in seconds</p>
      <p style="font-size:14px;color:#1e3a5f;margin:0 0 8px;line-height:1.6;">&#10003; &nbsp;All 5 premium templates - Classic, Modern, Multicolumn, Quotation, Executive</p>
      <p style="font-size:14px;color:#1e3a5f;margin:0;line-height:1.6;">&#10003; &nbsp;A 30-minute 1:1 session with an expert who will go through your resume with you</p>
    </div>
    <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">Everything is ready for you on your dashboard. Jump in whenever you're ready.</p>
    <a href="${appUrl}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Explore Pro &rarr;</a>
    <p style="font-size:13px;color:#9ca3af;margin:28px 0 6px;line-height:1.6;">If you have any questions or want to make the most of your session, just reply to this email. I'm happy to help.</p>
    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">- Ashish<br>Founder, Resume Expert</p>
  </div>
</div>`
    resend.emails.send({
      from: FROM,
      to: user.email,
      replyTo: REPLY_TO,
      subject: "You're Pro - here's everything you've unlocked \u2736",
      html,
    }).catch(e => console.error('Pro email error:', e))
  }

  return Response.json({ success: true })
}
