import { Avatar } from './ChatPrimitives'
import { displayName } from './chatUtils'

export default function MemberSidebar({ users = [], currentUsername }) {
  const memberMap = new Map()

  users
    .filter((user) => user?.username)
    .forEach((user) => {
      memberMap.set(user.username, {
        username: user.username,
        status: user.status || 'unknown',
      })
    })

  if (currentUsername && !memberMap.has(currentUsername)) {
    memberMap.set(currentUsername, {
      username: currentUsername,
      status: 'unknown',
    })
  }

  const members = [...memberMap.values()]
  const online = members.filter((m) => m.status === 'online')
  const other = members.filter((m) => m.status !== 'online')

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col overflow-hidden border-l border-white/[0.08] bg-[#080d1a] lg:flex">
      <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {online.length > 0 && (
          <div>
            <h3 className="px-2 pb-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Online - {online.length}
            </h3>
            <div className="space-y-0.5">
              {online.map((u) => (
                <MemberRow key={u.username} user={u} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="px-2 pb-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">
            Members - {other.length}
          </h3>
          <div className="space-y-0.5">
            {other.map((u) => (
              <MemberRow key={u.username} user={u} />
            ))}
            {members.length === 0 && (
              <p className="px-2 py-2 text-xs leading-5 text-slate-500">
                Member presence will appear when the backend sends user activity.
              </p>
            )}
          </div>
        </div>
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
    unknown: 'bg-status-offline',
  }

  return (
    <button className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-white/[0.05]">
      <div className="relative shrink-0">
        <Avatar name={user.username} size={32} radius={999} />
        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-[#080d1a] ${statusColors[user.status] || 'bg-slate-500'}`} />
      </div>
      <span className="truncate text-[14px] font-medium text-slate-400 group-hover:text-slate-100">
        {displayName(user.username)}
      </span>
    </button>
  )
}
