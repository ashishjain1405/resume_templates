'use client'

import { useEffect, useState } from 'react'
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
  const isProPayment = searchParams.get('type') === 'pro'

  const [proConfirmed, setProConfirmed] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  let primary = (source ? SOURCE_CONFIG[source] : undefined) ?? DEFAULT_SOURCE
  if (source === 'docs' && from) {
    primary = { ...primary, href: `${from}?openDocs=1` }
  }

  // Poll /api/pro-status until the DB confirms Pro (handles replication lag)
  useEffect(() => {
    if (!isProPayment) return
    let cancelled = false
    let attempts = 0
    const MAX = 15 // poll up to 15 times (15s total)

    async function poll() {
      if (cancelled || attempts >= MAX) return
      attempts++
      try {
        const res = await fetch('/api/pro-status')
        const data = await res.json()
        if (data.pro) {
          if (!cancelled) setProConfirmed(true)
          return
        }
      } catch { /* network blip — keep polling */ }
      setPollCount(attempts)
      setTimeout(poll, 1000)
    }

    poll()
    return () => { cancelled = true }
  }, [isProPayment])

  function navigate(href: string) {
    window.location.href = href
  }

  const waiting = isProPayment && !proConfirmed

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-sm w-full">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${waiting ? 'bg-blue-50' : 'bg-green-100'}`}>
          {waiting ? (
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {waiting ? 'Activating your Pro access…' : 'Payment successful!'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {waiting
            ? 'Hang tight — this usually takes just a second. Please keep this tab open.'
            : (isProPayment ? primary.description : 'Your purchase is confirmed. Head to your dashboard to access your template.')}
        </p>

        {!waiting && (
          <div className="flex flex-col gap-3">
            {isProPayment ? (
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
        )}

        {/* Fallback if polling exhausted without confirmation */}
        {isProPayment && !proConfirmed && pollCount >= 15 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-3">Taking longer than expected.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
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
