import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { resend, FROM } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email, redirect } = await request.json()
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const redirectTo = `${appUrl}/auth/confirm?redirect=${encodeURIComponent(redirect ?? '/dashboard')}`

    const adminClient = await createAdminClient()
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo },
    })

    if (error || !data?.properties?.action_link) {
      console.error('generateLink error:', error)
      return Response.json({ error: 'Could not generate confirmation link' }, { status: 500 })
    }

    const confirmUrl = data.properties.action_link

    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#2563eb;padding:28px 32px;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Resume Expert</span>
  </div>
  <div style="padding:32px;">
    <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 12px;">Confirm your email</h1>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 28px;">You're one click away from building a resume that gets noticed. Click the button below to confirm your account.</p>
    <a href="${confirmUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Confirm my email &rarr;</a>
    <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;">This link expires in 24 hours. If you didn't sign up for Resume Expert, you can safely ignore this email.</p>
  </div>
</div>`

    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Confirm your Resume Expert account',
      html,
    })

    if (emailError) {
      console.error('Confirmation email error:', emailError)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('send-confirmation exception:', e)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
