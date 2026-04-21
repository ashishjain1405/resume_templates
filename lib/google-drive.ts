import { google } from 'googleapis'
import { Readable } from 'stream'

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return client
}

export async function uploadResumeToDrive(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const auth = getOAuth2Client()
  const drive = google.drive({ version: 'v3', auth })

  const stream = Readable.from([fileBuffer])

  const res = await drive.files.create({
    requestBody: {
      name: filename.replace(/\.[^.]+$/, '') || 'Resume',
      mimeType: 'application/vnd.google-apps.document',
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id',
  })

  const fileId = res.data.id!
  return `https://docs.google.com/document/d/${fileId}/edit`
}
