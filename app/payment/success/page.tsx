'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
    href: '/builder?openDocs=1',
    description: 'Your resume is ready to open in Google Docs.',
  },
}

const DEFAULT_SOURCE = {
  label: 'Go to Dashboard →',
  href: '/dashboard',
  description: 'You now have Pro access — unlimited ATS checks, PDF downloads, and an expert session.',
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source') ?? ''
  const from = searchParams.get('from') ?? ''
  const isPro = searchParams.get('type') === 'pro'

  let primary = (source ? SOURCE_CONFIG[source] : undefined) ?? DEFAULT_SOURCE
  if (source === 'docs' && from) {
    primary = { ...primary, href: `${from}?openDocs=1` }
  }

  // For Pro CTAs always do a full page reload so isPro state reloads fresh from DB
  function navigate(href: string) {
    window.location.href = href
  }

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
            : 'Your purchase is confirmed. Head to your dashboard to access your template.'}
        </p>
        <div className="flex flex-col gap-3">
          {isPro ? (
            <>
              <button
                onClick={() => navigate(primary.href)}
                className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                {primary.label}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/templates')}
                className="border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Browse more templates
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  )
}
