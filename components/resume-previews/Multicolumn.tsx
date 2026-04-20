export default function MulticolumnPreview({ accentColor = '#2c3e50' }: { accentColor?: string }) {
  return (
    <div className="w-full h-full bg-white text-[5.5px] leading-tight overflow-hidden flex font-sans">
      {/* Left sidebar */}
      <div className="w-2/5 text-white p-2 flex flex-col gap-1.5" style={{ backgroundColor: accentColor }}>
        {/* Photo placeholder */}
        <div className="w-10 h-10 rounded-full bg-white/20 mx-auto mb-1 flex items-center justify-center">
          <div className="text-white/60 text-[8px]">👤</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-[7px] text-white">JONATHAN HILL</div>
          <div className="text-white/70 text-[5px] mt-0.5">Software Engineer</div>
        </div>

        <div className="border-t border-white/20 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider text-white/80 mb-1">Contact</div>
          <div className="text-white/70 text-[4.5px] space-y-0.5">
            <div>jonathan@email.com</div>
            <div>+91 98765 43210</div>
            <div>Bangalore, India</div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider text-white/80 mb-1">Skills</div>
          <div className="space-y-0.5">
            {['React', 'Node.js', 'Python', 'AWS'].map(skill => (
              <div key={skill} className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div className="h-1 bg-white/70 rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-white/70 text-[4px] w-8">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 p-2 space-y-1.5">
        <div>
          <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Experience</div>
          <div className="mb-1">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800 text-[5.5px]">Senior Developer</span>
              <span className="text-gray-400 text-[4.5px]">2021–Now</span>
            </div>
            <div className="text-gray-500 text-[4.5px]">Google India, Bangalore</div>
            <div className="text-gray-400 text-[4.5px] mt-0.5">· Built scalable microservices</div>
            <div className="text-gray-400 text-[4.5px]">· Led team of 8 engineers</div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800 text-[5.5px]">Developer</span>
              <span className="text-gray-400 text-[4.5px]">2018–2021</span>
            </div>
            <div className="text-gray-500 text-[4.5px]">Infosys, Pune</div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Education</div>
          <div className="font-semibold text-gray-800 text-[5.5px]">B.Tech Computer Science</div>
          <div className="text-gray-500 text-[4.5px]">IIT Delhi · 2018</div>
        </div>

        <div className="border-t border-gray-100 pt-1.5">
          <div className="font-bold text-[5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>Languages</div>
          <div className="text-gray-500 text-[4.5px]">English · Hindi · Kannada</div>
        </div>
      </div>
    </div>
  )
}
