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
      <div className="border-b border-white/[0.06] px-3 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-100">EnveChat</span>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
        >
          <Avatar name={username} avatarUrl={avatarUrl} size={30} radius={8} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-200">{dn(username)}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-emerald-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </div>
          </div>
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

      <button
        type="button"
        onClick={onNewChannel}
        className="mx-2 mb-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-2.5 text-xs text-slate-500 transition hover:border-blue-500/30 hover:text-slate-300"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New channel
      </button>

      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-left text-[12px] text-slate-400 transition hover:border-white/12 hover:bg-white/[0.05] hover:text-slate-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search…
        </button>
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>
              {connected ? 'Realtime live' : wsPhase === 'error' ? 'Realtime error' : 'Connecting…'}
            </span>
          </div>
          {memberCount != null && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
              {memberCount} here
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
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
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
          active
            ? 'border border-blue-500/25 bg-blue-500/10 text-slate-100'
            : 'border border-transparent text-slate-500 hover:bg-white/[0.05] hover:text-slate-200'
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[11px] font-bold text-slate-400">
          {room.name?.slice(0, 1)?.toUpperCase() || '#'}
        </span>
        <span className="font-mono text-[13px] font-semibold text-slate-400">#</span>
        <span className="min-w-0 flex-1 truncate">{room.name}</span>
        {active && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />}
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
