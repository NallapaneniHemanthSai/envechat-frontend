import { useEffect, useRef } from 'react'

export default function ChatHeader({
  activeRoom,
  onMenu,
  connected,
  mobileNav,
  onOpenRoomSettings,
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
      className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-black/20 bg-[#313338]/95 px-3 py-2.5 backdrop-blur-md md:px-4"
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
            <p className="mt-0.5 truncate text-[12px] font-medium text-slate-500">
              The start of something great.
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden items-center gap-4 md:flex">
          <button className="text-slate-400 transition hover:text-slate-200" title="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button className="text-slate-400 transition hover:text-slate-200" title="Pinned Messages">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <button 
            className={`transition ${showMembers ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'}`} 
            onClick={onToggleMembers}
            title="Member List"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>
        </div>

        <div className="relative hidden lg:block">
          <input 
            type="text" 
            placeholder="Search"
            className="h-6 w-36 rounded bg-[#1e1f22] px-2 text-[12px] font-medium text-slate-200 outline-none transition-all focus:w-60"
          />
          <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-slate-400 transition hover:text-slate-200" title="Inbox">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </button>
          <button className="text-slate-400 transition hover:text-slate-200" title="Help">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
        </div>
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
