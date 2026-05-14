import { useEffect, useRef } from 'react'

export default function ChatHeader({
  activeRoom,
  onMenu,
  connected,
  mobileNav,
  onOpenRoomSettings,
  onOpenSearch,
  showMembers,
  onToggleMembers,
}) {
  const stickyRef = useRef(null)

  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    el.style.setProperty('--chat-header-h', `${el.offsetHeight}px`)
  }, [activeRoom?.name, mobileNav])

  return (
    <header
      ref={stickyRef}
      className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b1020]/92 px-3 py-3 backdrop-blur-xl md:px-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        {mobileNav}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-blue-300/80">#</span>
            <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-50 md:text-base">
              {activeRoom ? activeRoom.name : 'Select a channel'}
            </h1>
          </div>
          {activeRoom && (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] font-medium text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-blue-300' : 'bg-blue-500/50'}`} />
              {connected ? 'Realtime connected' : 'Reconnecting realtime'}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="h-8 w-40 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-left text-[12px] font-medium text-slate-400 outline-none transition hover:border-blue-300/30 hover:bg-white/[0.07] hover:text-slate-200 md:w-52"
          >
            Search
          </button>
          <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>

        <button
          type="button"
          className={`rounded-lg border border-white/[0.08] p-2 transition ${
            showMembers ? 'bg-blue-400/12 text-blue-100' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
          }`}
          onClick={onToggleMembers}
          title="Toggle members"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </button>

        {activeRoom && (
          <button
            type="button"
            onClick={onOpenRoomSettings}
            className="rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
            title="Channel options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
          title="Command palette"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}
