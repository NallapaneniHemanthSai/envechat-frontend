import { Avatar } from './ChatPrimitives'
import { displayName } from './chatUtils'

export default function MemberSidebar({ users = [], currentUsername }) {
  // Mock users for visual scaling
  const mockMembers = [
    { username: 'Alex', status: 'online' },
    { username: 'Sarah', status: 'idle' },
    { username: 'Mike', status: 'dnd' },
    { username: 'Emily', status: 'offline' },
    { username: 'Jake', status: 'online' },
  ]

  // Deduplicate and combine
  const allMembers = [
    { username: currentUsername, status: 'online' },
    ...mockMembers.filter(m => m.username !== currentUsername)
  ]

  const online = allMembers.filter(m => m.status !== 'offline')
  const offline = allMembers.filter(m => m.status === 'offline')

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col bg-[#2b2d31] overflow-hidden lg:flex">
      <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-3 py-4">
        <div>
          <h3 className="px-2 pb-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">
            Online — {online.length}
          </h3>
          <div className="space-y-0.5">
            {online.map((u) => (
              <MemberRow key={u.username} user={u} />
            ))}
          </div>
        </div>

        {offline.length > 0 && (
          <div>
            <h3 className="px-2 pb-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Offline — {offline.length}
            </h3>
            <div className="space-y-0.5">
              {offline.map((u) => (
                <MemberRow key={u.username} user={u} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function MemberRow({ user }) {
  const statusColors = {
    online: 'bg-status-online',
    idle: 'bg-status-idle',
    dnd: 'bg-status-dnd',
    offline: 'bg-status-offline',
  }

  return (
    <button className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-white/[0.05]">
      <div className="relative shrink-0">
        <Avatar name={user.username} size={32} radius={999} />
        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-[#2b2d31] ${statusColors[user.status] || 'bg-slate-500'}`} />
      </div>
      <span className="truncate text-[14px] font-medium text-slate-400 group-hover:text-slate-100">
        {displayName(user.username)}
      </span>
    </button>
  )
}
