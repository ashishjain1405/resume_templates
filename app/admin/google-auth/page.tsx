import { redirect } from 'next/navigation'

export default function GoogleAuthPage() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Google OAuth Setup</h1>
        <p className="text-red-600 text-sm">Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI env vars.</p>
      </div>
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent',
  })

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
