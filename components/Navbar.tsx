'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">ResumeNow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
            Templates
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
                My Templates
              </Link>
              <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
                Log in
              </Link>
              <Link href="/auth/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-500 hover:text-gray-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link href="/templates" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2 hover:text-blue-600">
            Templates
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2 hover:text-blue-600">
                My Templates
              </Link>
              <button onClick={() => { setMenuOpen(false); handleSignOut() }} className="block text-sm text-gray-700 py-2 hover:text-blue-600 w-full text-left">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2 hover:text-blue-600">
                Log in
              </Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-600 font-semibold py-2">
                Sign up free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
