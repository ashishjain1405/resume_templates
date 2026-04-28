import { createClient } from '@/lib/supabase-server'
import { resend, FROM } from '@/lib/resend'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#2563eb;padding:28px 32px;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Resume Expert</span>
  </div>
  <div style="padding:32px;">
    <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 8px;">Welcome to Resume Expert</h1>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 28px;">Let's get your resume to stand out. Here's how:</p>

    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;">
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 6px;">&#128196; Check your resume score</p>
      <p style="font-size:14px;color:#555;margin:0 0 14px;line-height:1.5;">Upload your existing resume and get an instant ATS + recruiter score. Free - no payment needed.</p>
      <a href="${appUrl}/ats-check" style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:600;padding:10px 20px;border-radius:7px;text-decoration:none;">Check my resume score &rarr;</a>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;">
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 6px;">&#9997;&#65039; Build a new resume</p>
      <p style="font-size:14px;color:#555;margin:0 0 14px;line-height:1.5;">Choose from 5 ATS-ready templates - Classic, Modern, Multicolumn, Quotation, Executive. Download as PDF.</p>
      <a href="${appUrl}/builder" style="display:inline-block;background:#fff;color:#2563eb;font-size:14px;font-weight:600;padding:10px 20px;border-radius:7px;text-decoration:none;border:1px solid #2563eb;">Start building &rarr;</a>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px;">
      <p style="font-size:15px;font-weight:600;color:#92400e;margin:0 0 6px;">&#10022; Upgrade to Pro</p>
      <p style="font-size:14px;color:#78350f;margin:0 0 10px;line-height:1.5;">Unlimited score checks + AI Resume Re-write + 1:1 Expert Review Session + all templates.</p>
      <a href="${appUrl}/pricing" style="font-size:14px;color:#d97706;font-weight:600;text-decoration:underline;">Explore all benefits &rarr;</a>
    </div>
  </div>
</div>`

    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: 'Welcome to Resume Expert - here\'s how to start',
      html,
    })

    if (emailError) console.error('Welcome email error:', emailError)

    return Response.json({ success: true })
  } catch (e) {
    console.error('welcome email exception:', e)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
