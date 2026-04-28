import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = process.env.RESEND_FROM ?? 'Resume Expert <hello@resumeexpert.in>'
export const REPLY_TO = process.env.RESEND_REPLY_TO
