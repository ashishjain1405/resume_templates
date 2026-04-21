import { google } from 'googleapis'

interface Props {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function GoogleAuthCallbackPage({ searchParams }: Props) {
  const { code, error } = await searchParams

  if (error || !code) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">OAuth Error</h1>
        <p className="text-red-600 text-sm">{error ?? 'No authorization code received.'}</p>
      </div>
    )
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    const { tokens } = await oauth2Client.getToken(code)

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Calendar Connected</h1>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-1">Success!</p>
          <p className="text-xs text-green-700">Copy the refresh token below and add it to your environment variables as <code>GOOGLE_REFRESH_TOKEN</code>.</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
          <pre className="text-green-400 text-xs break-all">{tokens.refresh_token ?? '(no refresh token — make sure you set prompt=consent)'}</pre>
        </div>
        {!tokens.refresh_token && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            No refresh token returned. Visit <code>/admin/google-auth</code> again — Google only issues a refresh token when <code>prompt=consent</code> is used and the account hasn&apos;t already granted access. Revoke access at <a href="https://myaccount.google.com/permissions" className="underline" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a> and try again.
          </p>
        )}
      </div>
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Token Exchange Failed</h1>
        <p className="text-red-600 text-sm">{msg}</p>
      </div>
    )
  }
}
