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

  async function startUpgrade(userEmail?: string, source?: string, returnPath?: string) {
    setLoading(true)
    try {
      // Ensure session cookie is fresh before hitting the API — newly signed-up users
      // may have a valid client-side session that hasn't been flushed to cookies yet
      const res = await fetch('/api/razorpay/pro-order', { method: 'POST' })
      if (res.status === 401) {
        const redirect = typeof window !== 'undefined'
          ? encodeURIComponent(window.location.pathname + window.location.search)
          : encodeURIComponent('/pricing')
        router.push(`/auth/login?redirect=${redirect}`)
        setLoading(false)
        return
      }
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to create order'); setLoading(false); return }
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
            localStorage.setItem('pro_unlocked', '1')
            sessionStorage.setItem('pro_unlocked', '1')
            // Poll until DB confirms Pro (adminClient bypasses RLS replication lag),
            // then navigate directly to the return path — no success page redirect
            const destination = returnPath ?? '/dashboard'
            let attempts = 0
            const MAX = 20
            async function pollThenGo() {
              attempts++
              try {
                const d = await fetch('/api/pro-status').then(r => r.json())
                if (d.pro) {
                  window.location.href = destination
                  return
                }
              } catch { /* keep polling */ }
              if (attempts < MAX) setTimeout(pollThenGo, 1000)
              else window.location.href = destination
            }
            pollThenGo()
          } else {
            const d = await verifyRes.json()
            alert(`Payment verification failed: ${d.error ?? 'Unknown error'}`)
            setLoading(false)
          }
        },
        prefill: { email: userEmail ?? '' },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      })
      rzp.open()
    } catch (err) {
      console.error('startUpgrade error:', err)
      setLoading(false)
    }
  }

  return { startUpgrade, loading }
}
