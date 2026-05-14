export default function ServerSidebar() {
  const servers = [
    { id: 'workspace', icon: 'E', name: 'EnveChat', active: true },
  ]

  return (
    <aside className="z-50 hidden w-[72px] shrink-0 flex-col items-center bg-[#050916] pb-3 pt-3 md:flex">
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
                  ? 'rounded-[16px] bg-blue-400 text-[#06101f]'
                  : 'rounded-[24px] bg-[#10172a] text-slate-300 group-hover:rounded-[16px] group-hover:bg-blue-400 group-hover:text-[#06101f]'
              }`}
            >
              <span className="text-lg font-bold">{s.icon}</span>
            </button>
          </div>
        ))}
        
      </div>
    </aside>
  )
}
