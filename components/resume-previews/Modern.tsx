export default function ModernPreview({ accentColor = '#e94560' }: { accentColor?: string }) {
  return (
    <div className="w-full h-full bg-white text-[5.5px] leading-tight overflow-hidden flex font-sans">
      {/* Left accent bar */}
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-2 pb-1.5" style={{ backgroundColor: accentColor }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/30 flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-[9px]">CM</span>
            </div>
            <div>
              <div className="font-bold text-[8px] text-white">CHARLES MENDOZA</div>
              <div className="text-white/80 text-[5px] mt-0.5 uppercase tracking-wider">Product Designer</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 space-y-1.5">
          {/* Contact bar */}
          <div className="flex gap-2 text-[4.5px] text-gray-400 border-b border-gray-100 pb-1">
            <span>charles@email.com</span>
            <span>·</span>
            <span>+91 98765 43210</span>
            <span>·</span>
            <span>Delhi</span>
          </div>

          {/* Summary */}
          <div>
            <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Profile</div>
            <div className="text-gray-500 text-[4.5px] leading-relaxed">Product designer with 6 years crafting user-centric digital experiences for fintech and edtech startups.</div>
          </div>

          {/* Experience */}
          <div>
            <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Experience</div>
            <div className="mb-1">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 text-[5.5px]">Lead Designer</span>
                <span className="text-gray-400 text-[4.5px]">2022–Now</span>
              </div>
              <div className="text-gray-500 text-[4.5px]">Razorpay, Bangalore</div>
              <div className="text-gray-400 text-[4.5px] mt-0.5">· Redesigned checkout flow (+23% conversion)</div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 text-[5.5px]">UI Designer</span>
                <span className="text-gray-400 text-[4.5px]">2019–2022</span>
              </div>
              <div className="text-gray-500 text-[4.5px]">BYJU'S, Bangalore</div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Skills</div>
            <div className="flex flex-wrap gap-0.5">
              {['Figma', 'Prototyping', 'User Research', 'Design Systems'].map(s => (
                <span key={s} className="px-1 py-0.5 rounded text-[4px] text-white" style={{ backgroundColor: accentColor }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
