import { Resend } from 'resend'

// Lazy init: constructing Resend at module scope throws during `next build` when RESEND_API_KEY is unset
let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export const FROM = process.env.RESEND_FROM ?? 'Resume Expert <hello@resumeexpert.in>'
export const REPLY_TO = process.env.RESEND_REPLY_TO
