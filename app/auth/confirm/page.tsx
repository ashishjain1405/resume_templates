'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const supabase = createClient()

  useEffect(() => {
    async function confirm() {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'email' | 'recovery' | 'invite' | null
      // URL param is preferred; fall back to localStorage set at signup time
      const redirect = params.get('redirect') ?? localStorage.getItem('auth_redirect') ?? '/dashboard'
      localStorage.removeItem('auth_redirect')

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) {
          setStatus('error')
          return
        }
        setStatus('success')
        setTimeout(() => { window.location.href = redirect }, 2000)
        return
      }

      // Fallback: check if session already exists (e.g. magic link auto-confirmed)
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setStatus('success')
        setTimeout(() => { window.location.href = redirect }, 2000)
      } else {
        setStatus('error')
      }
    }

    confirm()
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-sm w-full">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Confirming your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email confirmed!</h2>
            <p className="text-gray-500 text-sm">Redirecting you now…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmation failed</h2>
            <p className="text-gray-500 text-sm mb-4">The link may have expired. Try signing up again.</p>
            <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline text-sm">
              Back to sign up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
