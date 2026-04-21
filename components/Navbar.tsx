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
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">ResumeNow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
          <Link href="/ats-check" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            ATS Checker
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Pricing
          </Link>
          <Link href="/builder/multicolumn" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Build my resume
          </Link>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">My Templates</Link>
              <Link href="/sessions" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sessions</Link>
              <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign out</button>
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors ml-1">Log in</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link href="/builder/multicolumn" onClick={() => setMenuOpen(false)} className="block text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium">Build my resume</Link>
          <Link href="/ats-check" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2">ATS Checker</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2">Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2">My Templates</Link>
              <Link href="/sessions" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2">Sessions</Link>
              <button onClick={() => { setMenuOpen(false); handleSignOut() }} className="block text-sm text-gray-700 py-2 w-full text-left">Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-2">Log in</Link>
          )}
        </div>
      )}
    </nav>
  )
}
