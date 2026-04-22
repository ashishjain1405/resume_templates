import Link from 'next/link'

const SOURCE_CONFIG: Record<string, { label: string; href: string; description: string }> = {
  sessions: {
    label: 'Book your expert session →',
    href: '/sessions/book',
    description: 'Your 1:1 resume review is ready to schedule.',
  },
  download: {
    label: 'Download your resume →',
    href: '/builder',
    description: 'Head back to the Builder to download your PDF.',
  },
  ats: {
    label: 'Check your ATS score →',
    href: '/ats-check',
    description: 'Run unlimited ATS checks now.',
  },
  docs: {
    label: 'Edit in Google Docs →',
    href: '/ats-check?openDocs=1',
    description: 'Your resume is ready to open in Google Docs.',
  },
}

const DEFAULT_SOURCE = {
  label: 'Go to Dashboard →',
  href: '/dashboard',
  description: 'You now have Pro access — unlimited ATS checks, PDF downloads, and an expert session.',
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; source?: string }>
}) {
  const params = await searchParams
  const isPro = params.type === 'pro'
  const primary = (params.source ? SOURCE_CONFIG[params.source] : undefined) ?? DEFAULT_SOURCE

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-500 text-sm mb-6">
          {isPro
            ? primary.description
            : 'Congrats! You have access to all Pro features.'}
        </p>
        <div className="flex flex-col gap-3">
          {isPro ? (
            <>
              <Link
                href={primary.href}
                className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                {primary.label}
              </Link>
              <Link
                href="/dashboard"
                className="border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/templates"
                className="border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Browse more templates
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
