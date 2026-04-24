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
      // Retry up to 5 times with 500ms delay — newly signed-up users may redirect here
      // before the session cookie has been flushed, causing a transient 401.
      let res: Response | null = null
      for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 500))
        res = await fetch('/api/razorpay/pro-order', { method: 'POST' })
        if (res.status !== 401) break
      }
      if (!res) { setLoading(false); return }
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
            // Payment is server-verified (HMAC + DB insert confirmed). Trust it immediately.
            localStorage.setItem('pro_unlocked', '1')
            sessionStorage.setItem('pro_unlocked', '1')
            // Remove any page-level beforeunload handler (e.g. ATS unsaved result warning)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const atsHandler = (window as any).__atsBeforeUnload
            if (atsHandler) { window.removeEventListener('beforeunload', atsHandler); delete (window as any).__atsBeforeUnload }
            window.location.reload()
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
