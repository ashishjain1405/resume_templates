'use client'

import Link from 'next/link'
import { getBuilderHref } from '@/components/BuilderLink'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const currentUserIdRef = useRef<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      currentUserIdRef.current = data.user?.id ?? null
      if (data.user) checkPro(data.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      currentUserIdRef.current = session?.user?.id ?? null
      setUser(session?.user ?? null)
      if (session?.user) checkPro(session.user.id)
      else setIsPro(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkPro(userId: string) {
    const proFlag = typeof window !== 'undefined'
      && (localStorage.getItem('pro_unlocked') || sessionStorage.getItem('pro_unlocked'))
    if (proFlag) {
      if (currentUserIdRef.current !== userId) return
      setIsPro(true)
      const { data } = await supabase.from('pro_access').select('id').eq('user_id', userId).maybeSingle()
      if (data) { localStorage.removeItem('pro_unlocked'); sessionStorage.removeItem('pro_unlocked') }
      return
    }
    const { data } = await supabase.from('pro_access').select('id').eq('user_id', userId).maybeSingle()
    if (currentUserIdRef.current !== userId) return
    setIsPro(!!data)
  }

  useEffect(() => {
    if (user && pathname.startsWith('/payment/success')) checkPro(user.id)
  }, [pathname, user])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    // Clear any locally cached builder drafts so the next user on this device starts fresh
    Object.keys(localStorage).filter(k => k.startsWith('resume_builder_') || k.startsWith('download_pending_') || k.startsWith('builder_session_restore_')).forEach(k => localStorage.removeItem(k))
    localStorage.removeItem('auth_redirect')
    await supabase.auth.signOut()
    setMenuOpen(false)
    setMobileOpen(false)
    router.push('/')
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'


  const GoProLink = ({ className = '', onClick }: { className?: string; onClick?: () => void }) => (
    <Link
      href="/pricing"
      onClick={onClick}
      className={`text-sm bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-semibold ${className}`}
    >
      Upgrade to Pro ✦
    </Link>
  )

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
          <span className="font-bold text-gray-900 text-base">Resume Expert</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
          {user ? (
            <>
              <Link href="/ats-check" className="text-sm text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
                Check Resume Score
              </Link>
              <button onClick={() => { const href = getBuilderHref(); const guard = (window as any).__atsNavGuard; if (guard) { guard(href); return } router.push(href) }} className="text-sm text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
                Create my Resume
              </button>
              {!isPro && <GoProLink />}

              {/* User dropdown */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-3 border-l border-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500 leading-none mb-0.5">{user.email?.split('@')[0]}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isPro ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      Dashboard
                    </Link>
                    <Link href="/templates" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Templates
                    </Link>
                    <Link href="/sessions" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                      Sessions
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2.5 px-4 py-2.5 text-gray-500 hover:bg-gray-50 w-full text-left">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/ats-check" className="text-sm text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
                Check Resume Score
              </Link>
              <button onClick={() => { const href = getBuilderHref(); const guard = (window as any).__atsNavGuard; if (guard) { guard(href); return } router.push(href) }} className="text-sm text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
                Create my Resume
              </button>
              <GoProLink />
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors ml-1">Log in</Link>
            </>
          )}
        </div>

        {/* Mobile: inline action buttons + hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          <Link href="/ats-check" className="text-xs text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap">
            Check
          </Link>
          <button onClick={() => { const href = getBuilderHref(); const guard = (window as any).__atsNavGuard; if (guard) { guard(href); return } router.push(href) }} className="text-xs text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap">
            Create
          </button>
          <button className="p-2 text-gray-500" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white z-50 shadow-2xl flex flex-col">
            <div className="h-16 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {user && (
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.email?.split('@')[0]}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isPro ? 'Pro' : 'Free'}
                    </span>
                  </div>
                </div>
              )}

              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-sm text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                  </Link>
                  <Link href="/templates" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-sm text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Templates
                  </Link>
                  <Link href="/sessions" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-sm text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                    Sessions
                  </Link>
                  {!isPro && (
                    <div className="pt-2">
                      <GoProLink className="block text-center w-full" onClick={() => setMobileOpen(false)} />
                    </div>
                  )}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button onClick={handleSignOut} className="flex items-center gap-2.5 text-sm text-gray-500 py-2.5 px-2 rounded-lg hover:bg-gray-50 w-full text-left">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50">Log in</Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50">Sign up</Link>
                  <div className="pt-2">
                    <GoProLink className="block text-center w-full" onClick={() => setMobileOpen(false)} />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
