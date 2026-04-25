'use client'

import { useState } from 'react'

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string; amount: number; currency: string; name: string; description: string
      order_id: string; handler: (r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
      prefill: { email: string }; theme: { color: string }; modal?: { ondismiss?: () => void }
    }) => { open(): void }
  }
}

export default function BuySessionButton({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/create-session-order', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create order')
      const { orderId, amount, currency } = await res.json()

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.appendChild(script)

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount,
          currency,
          name: 'Resume Expert',
          description: 'Expert Resume Review Session',
          order_id: orderId,
          handler: async (response) => {
            const verifyRes = await fetch('/api/razorpay/verify-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (verifyRes.ok) {
              window.location.reload()
            } else {
              const d = await verifyRes.json()
              alert(`Payment verification failed: ${d.error ?? verifyRes.status}`)
              setLoading(false)
            }
          },
          prefill: { email: userEmail },
          theme: { color: '#2563eb' },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
    >
      {loading ? 'Processing…' : 'Buy another session — ₹299'}
    </button>
  )
}
