export default function QuotationPreview({ accentColor = '#d4a853' }: { accentColor?: string }) {
  return (
    <div className="w-full h-full bg-[#fdfaf5] text-[5.5px] leading-tight overflow-hidden p-3 font-sans relative">
      {/* Large watermark quote */}
      <div className="absolute top-2 right-2 text-[40px] leading-none font-serif opacity-10" style={{ color: accentColor }}>"</div>

      {/* Header */}
      <div className="mb-2">
        <div className="font-bold text-[10px] text-gray-900 tracking-tight">Kathleen Jones</div>
        <div className="text-[5.5px] mt-0.5" style={{ color: accentColor }}>Content Strategist &amp; Writer</div>
        <div className="w-8 h-0.5 mt-1 rounded" style={{ backgroundColor: accentColor }} />
      </div>

      {/* Quote */}
      <div className="mb-2 pl-2 border-l-2" style={{ borderColor: accentColor }}>
        <div className="text-gray-500 text-[5px] italic leading-relaxed">"Crafting narratives that connect brands with their audiences through authentic storytelling."</div>
      </div>

      {/* Contact */}
      <div className="mb-2 text-[4.5px] text-gray-400 space-y-0.5">
        <div>kathleen@email.com · Mumbai, India</div>
        <div>linkedin.com/in/kathleenjones</div>
      </div>

      {/* Experience */}
      <div className="mb-1.5">
        <div className="font-bold text-[5px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>Experience</div>
        <div className="mb-1">
          <div className="font-semibold text-gray-800 text-[5.5px]">Content Lead — Times Internet</div>
          <div className="text-gray-400 text-[4.5px]">2021 – Present · Mumbai</div>
          <div className="text-gray-400 text-[4.5px] mt-0.5">· Grew blog traffic by 3x in 18 months</div>
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-[5.5px]">Senior Writer — YourStory</div>
          <div className="text-gray-400 text-[4.5px]">2018 – 2021 · Bangalore</div>
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="font-bold text-[5px] uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>Education</div>
        <div className="font-semibold text-gray-800 text-[5.5px]">BA English Literature</div>
        <div className="text-gray-400 text-[4.5px]">Delhi University · 2018</div>
      </div>
    </div>
  )
}
