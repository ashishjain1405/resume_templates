export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: April 2025</p>
      <div className="prose prose-gray text-gray-600 space-y-6 text-sm leading-relaxed">
        <p>Resume Expert (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains what data we collect and how we use it.</p>
        <h2 className="text-base font-semibold text-gray-900">Data we collect</h2>
        <p>We collect your email address when you create an account. We store records of templates you have purchased. We do not store payment card details — all payments are processed securely by Razorpay.</p>
        <h2 className="text-base font-semibold text-gray-900">How we use your data</h2>
        <p>Your email is used to send account confirmation and purchase receipts. Purchase records are used to grant you permanent access to downloaded templates.</p>
        <h2 className="text-base font-semibold text-gray-900">Third parties</h2>
        <p>We use Supabase for authentication and data storage, and Razorpay for payment processing. Both services have their own privacy policies.</p>
        <h2 className="text-base font-semibold text-gray-900">Contact</h2>
        <p>For privacy-related questions, contact us at support@resumenow.in.</p>
      </div>
    </div>
  )
}
