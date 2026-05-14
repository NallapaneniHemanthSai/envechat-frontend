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

  const statusText = connected
    ? 'Realtime online'
    : wsPhase === 'connecting'
      ? 'Connecting...'
      : 'Realtime offline'

  const shell = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-black tracking-tight text-white">EnveChat</h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {statusText}
            {memberCount ? ` · ${memberCount} members` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          className="rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100"
          title="Search messages"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="custom-scroll flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {sortedRooms.pinnedRooms.length > 0 && (
            <>
              <SectionLabel>Pinned</SectionLabel>
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
            </>
          )}

          <SectionLabel>Channels</SectionLabel>
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
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-4 text-center">
              <p className="text-sm font-bold text-slate-300">No channels yet</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Create a channel to start a backend-backed room.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.08] p-3">
        <button
          type="button"
          onClick={onNewChannel}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-400 px-3 py-2.5 text-sm font-black text-[#06101f] transition hover:bg-blue-300"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New channel
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white/[0.08]"
          >
            <div className="relative">
              <Avatar name={username} avatarUrl={avatarUrl} size={32} radius={999} />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-[#111827] bg-status-online" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-slate-100">{dn(username)}</div>
              <div className="truncate text-[11px] text-slate-400">{connected ? 'Online' : 'Offline'}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
            title="Log out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="relative hidden h-full w-[280px] shrink-0 flex-col border-r border-white/[0.08] bg-[#080d1a]/96 backdrop-blur-xl md:flex">
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
          className={`absolute left-0 top-0 flex h-full w-[min(88vw,280px)] max-w-full flex-col border-r border-white/[0.08] bg-[#080d1a] shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {shell}
        </aside>
      </div>
    </>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="px-1 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-200/45">
      {children}
    </div>
  )
}

function RoomRow({ room, active, onSelect, onPin, pinned }) {
  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-bold transition ${
          active
            ? 'bg-blue-300/12 text-slate-100'
            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
        }`}
      >
        <span className="shrink-0 text-blue-200/45">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate">{room.name}</span>
      </button>
      <button
        type="button"
        title={pinned ? 'Unpin' : 'Pin'}
        onClick={(e) => {
          e.stopPropagation()
          onPin()
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 opacity-0 transition hover:bg-white/10 hover:text-blue-100 group-hover/row:opacity-100"
      >
        {pinned ? '★' : '☆'}
      </button>
    </div>
  )
}
