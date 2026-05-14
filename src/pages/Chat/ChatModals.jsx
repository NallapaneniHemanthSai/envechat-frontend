export function ModalFrame({ title, subtitle, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1524] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            aria-label="Close"
          >
            ×
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
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
        <span className="font-mono text-lg font-bold text-slate-500">#</span>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
          placeholder="e.g. dev-talk"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-900/30 hover:brightness-110"
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
      <p className="text-sm text-slate-300">
        Signed in as <span className="font-medium text-white">{username}</span>
      </p>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-slate-400">Profile Photo URL (Local)</label>
        <input
          type="url"
          value={avatarUrl || ''}
          onChange={(e) => onSetAvatar(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
        <p className="mt-1.5 text-[11px] text-slate-500">
          This is stored locally in your browser for now.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-lg border border-white/10 py-2 text-sm text-slate-300 hover:bg-white/5"
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
        className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        placeholder="Search messages…"
        autoFocus
      />
      <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-slate-300">
        {results.length === 0 && <li className="text-slate-500">No matches</li>}
        {results.map((m, i) => (
          <li key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
            <span className="text-[11px] text-slate-500">{m.senderUsername}</span>
            <p className="mt-1 text-slate-200">{m.content}</p>
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
      <p className="text-sm text-slate-400">
        Notification overrides, slow mode, and permissions can plug into your backend here.
      </p>
      <button
        type="button"
        onClick={onLeave}
        className="mt-6 w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20"
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
      <p className="text-sm text-slate-400">
        You will stop seeing <span className="font-medium text-slate-200">#{roomName}</span> in this session until you rejoin from the server.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Leave (local)
        </button>
      </div>
    </ModalFrame>
  )
}
