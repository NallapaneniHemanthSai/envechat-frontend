import { useMemo, useState } from 'react'
import { Avatar } from './ChatPrimitives'
import { displayName as dn } from './chatUtils'

const PIN_KEY = 'envechat:pinned-rooms'

function readPinned() {
  try {
    const raw = localStorage.getItem(PIN_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.map(String) : []
  } catch {
    return []
  }
}

function writePinned(ids) {
  localStorage.setItem(PIN_KEY, JSON.stringify(ids))
}

export default function ChatSidebar({
  rooms,
  activeRoom,
  onSelectRoom,
  username,
  avatarUrl,
  connected,
  wsPhase,
  onLogout,
  onNewChannel,
  onOpenProfile,
  onOpenSearch,
  mobileOpen,
  onCloseMobile,
  memberCount,
}) {
  const [pinned, setPinned] = useState(readPinned)

  const sortedRooms = useMemo(() => {
    const pinSet = new Set(pinned)
    const pinnedRooms = rooms.filter((r) => pinSet.has(String(r.id)))
    const rest = rooms.filter((r) => !pinSet.has(String(r.id)))
    return { pinnedRooms, rest }
  }, [rooms, pinned])

  const togglePin = (roomId) => {
    const id = String(roomId)
    const next = pinned.includes(id) ? pinned.filter((x) => x !== id) : [...pinned, id]
    writePinned(next)
    setPinned(next)
  }

  const shell = (
    <>
      <div className="flex h-12 items-center justify-between px-4 shadow-sm transition hover:bg-white/[0.05] cursor-pointer group/header border-b border-black/20">
        <div className="min-w-0">
          <h2 className="truncate font-bold text-[15px] text-white">EnveChat</h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {connected ? 'Realtime online' : wsPhase === 'connecting' ? 'Connecting…' : 'Realtime offline'}
            {memberCount ? ` · ${memberCount} members` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          className="rounded p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
          title="Search messages"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Pinned
        </div>
        <div className="custom-scroll flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {sortedRooms.pinnedRooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              active={activeRoom?.id === room.id}
              onSelect={() => {
                onSelectRoom(room)
                onCloseMobile?.()
              }}
              onPin={() => togglePin(room.id)}
              pinned
            />
          ))}
          {sortedRooms.pinnedRooms.length === 0 && (
            <p className="px-2 py-1 text-[11px] text-slate-600">Star a channel to pin it here.</p>
          )}
          <div className="px-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Text channels
          </div>
          {sortedRooms.rest.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              active={activeRoom?.id === room.id}
              onSelect={() => {
                onSelectRoom(room)
                onCloseMobile?.()
              }}
              onPin={() => togglePin(room.id)}
              pinned={pinned.includes(String(room.id))}
            />
          ))}
          {rooms.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-slate-600">No channels yet</p>
          )}
        </div>
      </div>

      <div className="px-2 pb-2 pt-2">
        <button
          type="button"
          onClick={onNewChannel}
          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
        >
          <span>Text Channels</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#232428] px-2 py-1.5">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-1 items-center gap-2 rounded px-1 py-1 transition hover:bg-white/[0.08]"
        >
          <div className="relative">
            <Avatar name={username} avatarUrl={avatarUrl} size={32} radius={999} />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-[#232428] bg-status-online" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[13px] font-bold text-slate-100">{dn(username)}</div>
            <div className="truncate text-[11px] text-slate-400">{connected ? 'Online' : 'Offline'}</div>
          </div>
        </button>
        <div className="flex items-center">
          <button className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100" title="Mute">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100" title="Deafen">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </button>
          <button 
            onClick={onLogout}
            className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100" 
            title="User Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="relative hidden h-full w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07111f]/95 backdrop-blur md:flex">
        {shell}
      </aside>

      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
          aria-label="Close menu"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(88vw,280px)] max-w-full flex-col border-r border-white/[0.08] bg-[#07111f] shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {shell}
        </aside>
      </div>
    </>
  )
}

function RoomRow({ room, active, onSelect, onPin, pinned }) {
  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[15px] font-medium transition ${
          active
            ? 'bg-white/[0.08] text-slate-100'
            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
        }`}
      >
        <span className="shrink-0 text-slate-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
        </span>
        <span className="min-w-0 flex-1 truncate">{room.name}</span>
        {active && (
           <div className="flex items-center gap-1">
              <svg className="text-slate-400 opacity-0 group-hover/row:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              <svg className="text-slate-400 opacity-0 group-hover/row:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
           </div>
        )}
      </button>
      <button
        type="button"
        title={pinned ? 'Unpin' : 'Pin'}
        onClick={(e) => {
          e.stopPropagation()
          onPin()
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-slate-600 opacity-0 transition hover:bg-white/10 hover:text-slate-200 group-hover/row:opacity-100"
      >
        {pinned ? '★' : '☆'}
      </button>
    </div>
  )
}
