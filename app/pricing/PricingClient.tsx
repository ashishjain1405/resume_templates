'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FEATURES_FREE = [
  'Resume Builder (all templates)',
  'Save & sync resumes',
  'Browse all template designs',
]

const FEATURES_PRO = [
  'Everything in Free',
  'Unlimited ATS Checker',
  '1:1 Expert Resume Review Session',
  'All 5 template downloads included',
  'Priority support',
]


interface Props {
  isPro: boolean
  userEmail: string
  isLoggedIn: boolean
}

export default function PricingClient({ isPro, userEmail, isLoggedIn }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpgrade() {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/pricing')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/pro-order', { method: 'POST' })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to create order'); return }
      const { orderId, amount, currency } = await res.json()

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount,
          currency,
          name: 'ResumeNow',
          description: 'Pro Access — Lifetime',
          order_id: orderId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/razorpay/pro-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            if (verifyRes.ok) {
              router.push('/payment/success?type=pro')
            } else {
              const d = await verifyRes.json()
              alert(`Payment verification failed: ${d.error ?? 'Unknown error'}`)
            }
          },
          prefill: { email: userEmail },
          theme: { color: '#2563eb' },
        })
        rzp.open()
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">Simple, one-time pricing</h1>
        <p className="text-gray-500 text-base">No subscription. No renewal. Pay once, use forever.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Free</div>
            <div className="text-3xl font-bold text-gray-900">₹0</div>
            <div className="text-sm text-gray-400 mt-0.5">Always free</div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/builder/multicolumn" className="w-full block text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
            Start for free
          </Link>
        </div>

        {/* Pro */}
        <div className="border-2 border-blue-600 rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Pro</div>
            <div className="text-3xl font-bold text-gray-900">₹999</div>
            <div className="text-sm text-gray-400 mt-0.5">One-time · lifetime access</div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FEATURES_PRO.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-lg font-semibold text-sm text-center">
              ✓ You have Pro Access
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing…' : 'Get Pro Access — ₹999'}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Secure payment via Razorpay · GST invoice available on request
      </p>
    </div>
  )
}
