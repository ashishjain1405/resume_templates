import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Resume Expert" className="h-24 w-24 object-contain" />
              <span className="text-white font-bold">Resume Expert</span>
            </div>
            <p className="text-sm leading-relaxed">Everything you need to get noticed — and hired.</p>
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
