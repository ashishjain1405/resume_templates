'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.head.appendChild(script)
  })
}

export function useProUpgrade() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function startUpgrade(userEmail?: string, source?: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/pro-order', { method: 'POST' })
      if (res.status === 401) { router.push('/auth/login?redirect=/pricing'); return }
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to create order'); return }
      const { orderId, amount, currency } = await res.json()

      await loadRazorpayScript()

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
            router.push(`/payment/success?type=pro${source ? `&source=${source}` : ''}`)
          } else {
            const d = await verifyRes.json()
            alert(`Payment verification failed: ${d.error ?? 'Unknown error'}`)
          }
        },
        prefill: { email: userEmail ?? '' },
        theme: { color: '#2563eb' },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { startUpgrade, loading }
}
