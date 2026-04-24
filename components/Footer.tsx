import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-white font-bold">Resume Expert</span>
            </div>
            <p className="text-sm leading-relaxed">All in one solution to stand out to recruiters.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Templates</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/templates" className="hover:text-white transition-colors">All Templates</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Classic</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Modern</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Creative</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <p>© {new Date().getFullYear()} Resume Expert. All rights reserved.</p>
          <p>Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  )
}
