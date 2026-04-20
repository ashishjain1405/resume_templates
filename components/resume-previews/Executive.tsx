export default function ExecutivePreview({ accentColor = '#1c1c1c' }: { accentColor?: string }) {
  return (
    <div className="w-full h-full bg-white text-[5.5px] leading-tight overflow-hidden font-sans">
      {/* Dark header band */}
      <div className="px-3 py-2.5" style={{ backgroundColor: accentColor }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-[9px] text-white tracking-wide">RAJESH KUMAR</div>
            <div className="text-[5px] tracking-widest uppercase mt-0.5" style={{ color: '#c9b99a' }}>Chief Executive Officer</div>
          </div>
          <div className="w-9 h-9 rounded flex items-center justify-center border border-white/20">
            <span className="text-white font-bold text-[9px]">RK</span>
          </div>
        </div>
        <div className="flex gap-3 mt-1.5 text-[4.5px] text-white/60">
          <span>rajesh@email.com</span>
          <span>+91 98765 43210</span>
          <span>Mumbai</span>
        </div>
      </div>

      <div className="p-2.5 space-y-1.5">
        {/* Summary */}
        <div>
          <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Executive Profile</div>
          <div className="text-gray-500 text-[4.5px] leading-relaxed">Visionary leader with 20+ years driving growth across Fortune 500 companies. Proven track record in P&amp;L management and organisational transformation.</div>
        </div>

        {/* Experience */}
        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>Career History</div>
          <div className="mb-1">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-gray-900 text-[5.5px]">CEO, Tata Digital</span>
              <span className="text-gray-400 text-[4.5px]">2019–Now</span>
            </div>
            <div className="text-gray-400 text-[4.5px] mt-0.5">· ₹2,400 Cr revenue under management</div>
            <div className="text-gray-400 text-[4.5px]">· Led acquisition of BigBasket</div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900 text-[5.5px]">MD, Reliance Retail</span>
              <span className="text-gray-400 text-[4.5px]">2014–2019</span>
            </div>
            <div className="text-gray-400 text-[4.5px]">Mumbai</div>
          </div>
        </div>

        {/* Education */}
        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Education</div>
          <div className="font-semibold text-gray-900 text-[5.5px]">MBA, Harvard Business School</div>
          <div className="text-gray-400 text-[4.5px]">2003 · Baker Scholar</div>
        </div>
      </div>
    </div>
  )
}
