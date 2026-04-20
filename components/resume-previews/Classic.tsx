export default function ClassicPreview({ accentColor = '#1e3a5f' }: { accentColor?: string }) {
  return (
    <div className="w-full h-full bg-white text-[6px] leading-tight overflow-hidden p-3 font-sans">
      {/* Header */}
      <div className="text-center border-b-2 pb-2 mb-2" style={{ borderColor: accentColor }}>
        <div className="font-bold text-[9px] text-gray-900 tracking-wide">KATHLEEN JONES</div>
        <div className="text-[6px] tracking-widest uppercase mt-0.5" style={{ color: accentColor }}>Senior Marketing Manager</div>
        <div className="text-gray-400 mt-0.5 text-[5px]">kathleen@email.com · +91 98765 43210 · Mumbai, India</div>
      </div>

      {/* Summary */}
      <div className="mb-2">
        <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Professional Summary</div>
        <div className="text-gray-500 text-[5px] leading-relaxed">Results-driven marketing professional with 8+ years of experience driving brand growth and digital strategy across FMCG and tech sectors.</div>
      </div>

      {/* Experience */}
      <div className="mb-2">
        <div className="font-bold uppercase tracking-widest text-[5px] mb-1" style={{ color: accentColor }}>Experience</div>
        <div className="mb-1">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-800 text-[5.5px]">Marketing Director</span>
            <span className="text-gray-400 text-[5px]">2020 – Present</span>
          </div>
          <div className="text-gray-500 text-[5px]">Tata Consumer Products, Mumbai</div>
          <div className="text-gray-400 text-[5px] mt-0.5">· Led digital campaigns reaching 5M+ users</div>
          <div className="text-gray-400 text-[5px]">· Increased brand awareness by 40% YoY</div>
        </div>
        <div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-800 text-[5.5px]">Brand Manager</span>
            <span className="text-gray-400 text-[5px]">2017 – 2020</span>
          </div>
          <div className="text-gray-500 text-[5px]">HUL, Bengaluru</div>
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="font-bold uppercase tracking-widest text-[5px] mb-0.5" style={{ color: accentColor }}>Education</div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-800 text-[5.5px]">MBA, Marketing</span>
          <span className="text-gray-400 text-[5px]">2017</span>
        </div>
        <div className="text-gray-500 text-[5px]">IIM Ahmedabad</div>
      </div>
    </div>
  )
}
