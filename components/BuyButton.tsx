'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice, type Template } from '@/lib/templates'

interface Props {
  template: Template
  purchased: boolean
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: { email: string }
  theme: { color: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open(): void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export default function BuyButton({ template, purchased }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleBuy() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/signup?redirect=/template/${template.id}`)
        return
      }

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      })

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
          description: `${template.name} Resume Template`,
          order_id: orderId,
          handler: async (response) => {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                templateId: template.id,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              router.push('/payment/success')
            } else {
              alert(`Payment verification failed: ${verifyData.error ?? verifyRes.status}`)
              setLoading(false)
            }
          },
          prefill: { email: user.email ?? '' },
          theme: { color: '#2563eb' },
          modal: {
            ondismiss: () => {
              setLoading(false)
            },
          },
        })
        rzp.open()
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (purchased) {
    return (
      <div className="flex gap-3">
        <a
          href={`/api/download/${template.id}?format=pdf`}
          className="flex-1 text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Download PDF
        </a>
        <a
          href={`/api/download/${template.id}?format=docx`}
          className="flex-1 text-center border border-green-600 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
        >
          Download DOCX
        </a>
      </div>
    )
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : `Buy now — ${formatPrice(template.price_inr)}`}
    </button>
  )
}
