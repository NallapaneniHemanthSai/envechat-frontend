export default function ServerSidebar() {
  const servers = [
    { id: 'workspace', icon: 'E', name: 'EnveChat', active: true },
  ]

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center bg-[#1e1f22] pt-3 pb-3 md:flex z-50">
      <div className="flex flex-col items-center gap-2 w-full">
        {servers.map((s) => (
          <div key={s.id} className="group relative flex items-center justify-center w-full">
            {/* Active Indicator */}
            {s.active && (
              <div className="absolute left-0 w-1 h-10 bg-white rounded-r-full transition-all duration-300" />
            )}
            {!s.active && (
              <div className="absolute left-0 w-1 h-2 bg-white rounded-r-full opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-300" />
            )}
            
            <button
              title={s.name}
              className={`flex h-12 w-12 items-center justify-center transition-all duration-300 ${
                s.active
                  ? 'rounded-[16px] bg-brand-500 text-white'
                  : 'rounded-[24px] bg-[#313338] text-slate-300 group-hover:rounded-[16px] group-hover:bg-brand-500 group-hover:text-white'
              }`}
            >
              <span className="text-lg font-bold">{s.icon}</span>
            </button>
          </div>
        ))}
        
        <div className="h-[2px] w-8 bg-[#35363c] rounded-full my-1" />
        
        <button className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-[#313338] text-status-online transition-all duration-300 hover:rounded-[16px] hover:bg-status-online hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
