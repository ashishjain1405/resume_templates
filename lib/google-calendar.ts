import { google } from 'googleapis'

export interface Slot {
  start: string
  end: string
}

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return client
}

// Returns available 30-min slots over the next `days` working days (Mon–Fri, 10am–6pm IST)
export async function getAvailableSlots(days = 14): Promise<Slot[]> {
  const auth = getOAuth2Client()
  const calendar = google.calendar({ version: 'v3', auth })

  const IST_OFFSET = 5.5 * 60 * 60 * 1000 // ms
  const now = new Date()
  const timeMin = now.toISOString()
  const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: 'Asia/Kolkata',
      items: [{ id: process.env.EXPERT_EMAIL! }],
    },
  })

  const busy: { start: string; end: string }[] =
    (freeBusy.data.calendars?.[process.env.EXPERT_EMAIL!]?.busy ?? []).map((b) => ({
      start: b.start!,
      end: b.end!,
    }))

  const slots: Slot[] = []
  const cursor = new Date(now)
  cursor.setMinutes(0, 0, 0)
  cursor.setHours(cursor.getHours() + 1) // start from next full hour at earliest

  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  while (cursor < endDate) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) { cursor.setDate(cursor.getDate() + 1); cursor.setHours(10, 0, 0, 0); continue }

    // Get IST hour
    const istMs = cursor.getTime() + IST_OFFSET
    const istDate = new Date(istMs)
    const istHour = istDate.getUTCHours()

    if (istHour < 10) { cursor.setTime(cursor.getTime() + (10 - istHour) * 60 * 60 * 1000); cursor.setMinutes(0, 0, 0); continue }
    if (istHour >= 18) { cursor.setDate(cursor.getDate() + 1); cursor.setHours(4, 30, 0, 0); continue } // next day 10am IST = 4:30am UTC

    const slotEnd = new Date(cursor.getTime() + 30 * 60 * 1000)
    const overlaps = busy.some((b) => {
      const bs = new Date(b.start).getTime()
      const be = new Date(b.end).getTime()
      return cursor.getTime() < be && slotEnd.getTime() > bs
    })

    if (!overlaps) {
      slots.push({ start: cursor.toISOString(), end: slotEnd.toISOString() })
    }

    cursor.setTime(cursor.getTime() + 30 * 60 * 1000)
  }

  return slots
}

export async function createBookingEvent(
  slot: Slot,
  user: { email: string; name: string },
): Promise<{ eventId: string; meetLink: string }> {
  const auth = getOAuth2Client()
  const calendar = google.calendar({ version: 'v3', auth })

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Resume Expert Session — ${user.name}`,
      description: `1:1 resume feedback session with ${user.name} (${user.email}) booked via ResumeNow.`,
      start: { dateTime: slot.start, timeZone: 'Asia/Kolkata' },
      end: { dateTime: slot.end, timeZone: 'Asia/Kolkata' },
      attendees: [
        { email: process.env.EXPERT_EMAIL! },
        { email: user.email, displayName: user.name },
      ],
      conferenceData: {
        createRequest: {
          requestId: `resumenow-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  const meetLink = event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ?? ''
  return { eventId: event.data.id!, meetLink }
}
