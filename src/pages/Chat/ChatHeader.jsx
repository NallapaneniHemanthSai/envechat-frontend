import { useEffect, useRef } from 'react'

export default function ChatHeader({
  activeRoom,
  onMenu,
  connected,
  mobileNav,
  onOpenRoomSettings,
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
      className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-gradient-to-b from-[#050c14]/98 to-[#050c14]/85 px-3 py-3 backdrop-blur-xl md:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        {mobileNav}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-slate-600">#</span>
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-100 md:text-base">
              {activeRoom ? activeRoom.name : 'Select a channel'}
            </h1>
          </div>
          {activeRoom && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              Realtime channel ·{' '}
              {connected ? <span className="text-emerald-400/90">Connected</span> : <span className="text-amber-400/90">Reconnecting</span>}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
          className="hidden rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200 md:inline-flex"
          title="Main menu"
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
