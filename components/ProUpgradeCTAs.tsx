'use client'

import Link from 'next/link'
import { useProUpgrade } from '@/lib/use-pro-upgrade'

interface Props {
  layout?: 'row' | 'stack'
  userEmail?: string
  source?: string
  returnPath?: string
}

export default function ProUpgradeCTAs({ layout = 'row', userEmail, source, returnPath }: Props) {
  const { startUpgrade, loading } = useProUpgrade()
  return (
    <div className={layout === 'stack' ? 'flex flex-col gap-2' : 'flex items-center gap-2 flex-wrap'}>
      <button
        onClick={() => startUpgrade(userEmail, source, returnPath)}
        disabled={loading}
        className={`bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-60 ${layout === 'stack' ? 'w-full py-3' : 'px-4 py-2'}`}
      >
        {loading ? 'Processing…' : 'Upgrade to Pro — ₹999'}
      </button>
      <Link
        href="/pricing"
        className={`text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors ${layout === 'stack' ? 'text-center py-1' : ''}`}
      >
        Explore Pro features →
      </Link>
    </div>
  )
}
