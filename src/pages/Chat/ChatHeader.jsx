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
      className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-[#1C1C1C] bg-[#F8F7F3] px-4 py-4 md:px-6"
    >
      <div className="flex min-w-0 items-center gap-4">
        {mobileNav && (
          <div className="md:hidden">
            {mobileNav}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-[#1C1C1C] bg-[#BEF355] font-mono text-lg font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]">
              #
            </span>
            <h1 className="truncate font-heading text-xl font-black tracking-tight text-[#1C1C1C] md:text-2xl">
              {activeRoom ? activeRoom.name : 'Select a channel'}
            </h1>
          </div>
          {activeRoom && (
            <div className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold text-[#6B7280]">
              <span className={`h-2 w-2 rounded-full border border-[#1C1C1C] ${connected ? 'bg-[#BEF355]' : 'bg-amber-400'}`} />
              {connected ? 'Live connection' : 'Reconnecting...'}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {activeRoom && (
          <button
            type="button"
            onClick={onOpenRoomSettings}
            className="rounded-lg border-2 border-[#1C1C1C] bg-white p-2 text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] transition-all hover:-translate-y-[1px] hover:bg-[#BEF355] hover:shadow-[3px_3px_0px_0px_#1C1C1C]"
            title="Channel options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onMenu}
          className="hidden rounded-lg border-2 border-[#1C1C1C] bg-white p-2 text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] transition-all hover:-translate-y-[1px] hover:bg-[#BEF355] hover:shadow-[3px_3px_0px_0px_#1C1C1C] md:inline-flex"
          title="Main menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}
