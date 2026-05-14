export function ModalFrame({ title, subtitle, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#F8F7F3]/80 p-4 backdrop-blur-sm animate-pop-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] border-[3px] border-[#1C1C1C] bg-white p-6 shadow-[8px_8px_0px_0px_#1C1C1C]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-black text-[#1C1C1C]">{title}</h2>
            {subtitle && <p className="mt-1 text-xs font-bold text-[#6B7280]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-[#1C1C1C] bg-white p-1 text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-[#BEF355]"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CreateRoomModal({ open, name, onChangeName, onCreate, onClose }) {
  if (!open) return null
  return (
    <ModalFrame title="Create channel" subtitle="Lowercase names, dashes for spaces" onClose={onClose}>
      <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F8F7F3] px-4 py-3 shadow-inner">
        <span className="font-mono text-xl font-black text-[#1C1C1C]">#</span>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          className="flex-1 bg-transparent text-base font-bold text-[#1C1C1C] placeholder-[#9CA3AF] focus:outline-none"
          placeholder="e.g. dev-talk"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border-2 border-[#1C1C1C] bg-white px-5 py-2.5 text-sm font-black text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-[#F8F7F3] hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl border-2 border-[#1C1C1C] bg-[#BEF355] px-6 py-2.5 text-sm font-black text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
        >
          Create
        </button>
      </div>
    </ModalFrame>
  )
}

export function ProfileModal({ open, username, avatarUrl, onSetAvatar, onClose }) {
  if (!open) return null
  return (
    <ModalFrame title="Profile" subtitle="Frontend preview — wire to your API later" onClose={onClose}>
      <p className="text-sm font-medium text-[#6B7280]">
        Signed in as <span className="font-black text-[#1C1C1C] bg-[#BEF355] px-2 py-0.5 rounded-md border-2 border-[#1C1C1C]">{username}</span>
      </p>

      <div className="mt-6">
        <label className="mb-2 block font-heading text-xs font-black uppercase tracking-wider text-[#1C1C1C]">Profile Photo URL</label>
        <input
          type="url"
          value={avatarUrl || ''}
          onChange={(e) => onSetAvatar(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="w-full rounded-xl border-2 border-[#1C1C1C] bg-[#F8F7F3] px-4 py-3 text-sm font-bold text-[#1C1C1C] placeholder-[#9CA3AF] transition-all focus:border-[#BEF355] focus:outline-none focus:shadow-[4px_4px_0px_0px_#1C1C1C]"
        />
        <p className="mt-2 text-[11px] font-bold text-[#6B7280]">
          This is stored locally in your browser for now.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-8 w-full rounded-xl border-2 border-[#1C1C1C] bg-white py-3 text-sm font-black text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-[#F8F7F3] hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
      >
        Close
      </button>
    </ModalFrame>
  )
}

export function SearchModal({ open, query, onChangeQuery, results, onClose }) {
  if (!open) return null
  return (
    <ModalFrame title="Search in channel" subtitle="Client-side filter of loaded history" onClose={onClose}>
      <input
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
        className="mb-4 w-full rounded-xl border-2 border-[#1C1C1C] bg-[#F8F7F3] px-4 py-3 text-sm font-bold text-[#1C1C1C] placeholder-[#9CA3AF] transition-all focus:border-[#BEF355] focus:outline-none focus:shadow-[4px_4px_0px_0px_#1C1C1C]"
        placeholder="Search messages…"
        autoFocus
      />
      <ul className="custom-scroll max-h-64 space-y-3 overflow-y-auto pr-2">
        {results.length === 0 && <li className="text-center text-sm font-bold text-[#6B7280] py-4">No matches found</li>}
        {results.map((m, i) => (
          <li key={i} className="rounded-xl border-2 border-[#1C1C1C] bg-white px-4 py-3 shadow-[2px_2px_0px_0px_#1C1C1C]">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">{m.senderUsername}</span>
            <p className="mt-1 text-sm font-medium text-[#1C1C1C]">{m.content}</p>
          </li>
        ))}
      </ul>
    </ModalFrame>
  )
}

export function RoomSettingsModal({ open, roomName, onClose, onLeave }) {
  if (!open) return null
  return (
    <ModalFrame title={`#${roomName}`} subtitle="Channel settings (UI foundation)" onClose={onClose}>
      <p className="text-sm font-medium text-[#6B7280]">
        Notification overrides, slow mode, and permissions can plug into your backend here.
      </p>
      <button
        type="button"
        onClick={onLeave}
        className="mt-8 w-full rounded-xl border-2 border-[#1C1C1C] bg-red-500 py-3 text-sm font-black text-white shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
      >
        Leave channel…
      </button>
    </ModalFrame>
  )
}

export function LeaveRoomModal({ open, roomName, onConfirm, onClose }) {
  if (!open) return null
  return (
    <ModalFrame title="Leave channel?" subtitle="This is a UI-only action in this build" onClose={onClose}>
      <p className="text-sm font-medium text-[#6B7280]">
        You will stop seeing <span className="font-black text-[#1C1C1C]">#{roomName}</span> in this session until you rejoin from the server.
      </p>
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border-2 border-[#1C1C1C] bg-white px-5 py-2.5 text-sm font-black text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-[#F8F7F3] hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl border-2 border-[#1C1C1C] bg-red-500 px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[6px_6px_0px_0px_#1C1C1C]"
        >
          Leave (local)
        </button>
      </div>
    </ModalFrame>
  )
}
