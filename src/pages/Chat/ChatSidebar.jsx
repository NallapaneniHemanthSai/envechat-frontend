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
      <div className="border-b-[3px] border-[#1C1C1C] px-4 pb-4 pt-5 bg-[#F8F7F3]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BEF355] border-[3px] border-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-xl font-heading font-black tracking-tight text-[#1C1C1C]">EnveChat</span>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex w-full items-center gap-3 rounded-xl border-[3px] border-transparent p-2 text-left transition-all hover:border-[#1C1C1C] hover:bg-white hover:shadow-[2px_2px_0px_0px_#1C1C1C]"
        >
          <Avatar name={username} avatarUrl={avatarUrl} size={36} radius={12} className="border-2 border-[#1C1C1C]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-[#1C1C1C]">{dn(username)}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#1C1C1C] bg-[#BEF355]" />
              Online
            </div>
          </div>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="px-4 pt-4 pb-2 font-heading text-xs font-black uppercase tracking-widest text-[#1C1C1C]">
          Pinned
        </div>
        <div className="custom-scroll flex-1 space-y-1 overflow-y-auto px-3 py-1">
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
            <p className="px-3 py-2 text-xs font-medium text-[#6B7280]">Star a channel to pin it here.</p>
          )}
          <div className="px-1 pt-5 pb-2 font-heading text-xs font-black uppercase tracking-widest text-[#1C1C1C]">
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
            <p className="px-3 py-4 text-center text-sm font-bold text-[#6B7280]">No channels yet</p>
          )}
        </div>
      </div>

      <div className="bg-white px-3 pb-3">
        <button
          type="button"
          onClick={onNewChannel}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-dashed border-[#1C1C1C] py-3 text-sm font-bold text-[#1C1C1C] transition-all hover:-translate-y-1 hover:border-solid hover:bg-[#BEF355] hover:shadow-[4px_4px_0px_0px_#1C1C1C]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New channel
        </button>
      </div>

      <div className="space-y-3 border-t-[3px] border-[#1C1C1C] p-4 bg-[#F8F7F3]">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-2 rounded-xl border-2 border-[#1C1C1C] bg-white px-3 py-2.5 text-left text-sm font-bold text-[#6B7280] transition-all hover:border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white hover:shadow-[2px_2px_0px_0px_#BEF355]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search…
        </button>
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#1C1C1C]">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full border-2 border-[#1C1C1C] ${connected ? 'bg-[#BEF355]' : 'bg-amber-400'}`} />
            <span>
              {connected ? 'Live' : wsPhase === 'error' ? 'Error' : 'Connecting…'}
            </span>
          </div>
          {memberCount != null && (
            <span className="rounded-md border-2 border-[#1C1C1C] bg-white px-2.5 py-1 text-xs font-bold text-[#1C1C1C]">
              {memberCount} here
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1C1C1C] bg-white py-2.5 text-sm font-bold text-[#1C1C1C] transition-all hover:translate-y-0.5 hover:bg-red-500 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
      <aside className="relative hidden h-full w-[280px] shrink-0 flex-col border-r-[3px] border-[#1C1C1C] bg-white md:flex">
        {shell}
      </aside>

      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-[#1C1C1C]/60 backdrop-blur-sm transition-opacity ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
          aria-label="Close menu"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(88vw,320px)] max-w-full flex-col border-r-[3px] border-[#1C1C1C] bg-white shadow-[8px_0_0_0_#1C1C1C] transition-transform duration-300 ease-out ${
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
        className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
          active
            ? 'border-[#1C1C1C] bg-[#BEF355] text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]'
            : 'border-transparent text-[#6B7280] hover:-translate-y-[1px] hover:border-[#1C1C1C] hover:bg-[#F8F7F3] hover:text-[#1C1C1C] hover:shadow-[2px_2px_0px_0px_#1C1C1C]'
        }`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#1C1C1C] text-sm font-black ${active ? 'bg-white text-[#1C1C1C]' : 'bg-white text-[#1C1C1C]'}`}>
          {room.name?.slice(0, 1)?.toUpperCase() || '#'}
        </span>
        <span className={`min-w-0 flex-1 truncate text-[15px] font-bold ${active ? 'text-[#1C1C1C]' : ''}`}>{room.name}</span>
        {active && <span className="h-2 w-2 shrink-0 rounded-full border-2 border-[#1C1C1C] bg-white" />}
      </button>
      <button
        type="button"
        title={pinned ? 'Unpin' : 'Pin'}
        onClick={(e) => {
          e.stopPropagation()
          onPin()
        }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md border-2 border-[#1C1C1C] p-1 font-black transition-all hover:bg-white hover:-translate-y-[50%] hover:scale-110 ${active ? 'bg-white text-[#1C1C1C] opacity-100' : 'bg-[#F8F7F3] text-[#1C1C1C] opacity-0 group-hover/row:opacity-100'}`}
      >
        {pinned ? '★' : '☆'}
      </button>
    </div>
  )
}
