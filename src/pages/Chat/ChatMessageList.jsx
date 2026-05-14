import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dateDividerLabel, displayName } from './chatUtils'
import {
  Avatar,
  DateSeparator,
  MessageCluster,
  SystemRow,
  TypingRow,
  UnreadSeparator,
} from './ChatPrimitives'

function buildGroups(messages) {
  const groups = []
  messages.forEach((msg) => {
    if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
      groups.push({ kind: 'system', msg })
      return
    }
    if (msg.type === 'TYPING') return
    const last = groups[groups.length - 1]
    if (last && last.kind === 'cluster' && last.sender === msg.senderUsername) {
      last.msgs.push(msg)
    } else {
      groups.push({ kind: 'cluster', sender: msg.senderUsername, msgs: [msg] })
    }
  })
  return groups
}

function flattenWithDates(groups) {
  const rows = []
  let lastDay = null
  groups.forEach((g, idx) => {
    if (g.kind === 'system') {
      rows.push({ kind: 'system', key: `sys-${idx}`, msg: g.msg })
      return
    }
    const ts = g.msgs[0]?.sentAt
    if (ts) {
      const day = new Date(ts).toDateString()
      if (day !== lastDay) {
        lastDay = day
        rows.push({ kind: 'date', key: `d-${day}-${idx}`, label: dateDividerLabel(ts) })
      }
    }
    rows.push({ kind: 'cluster', key: `c-${idx}`, ...g })
  })
  return rows
}

export default function ChatMessageList({
  messages,
  username,
  typingUsers,
  reactions,
  onToggleReaction,
  onReply,
  welcomeRoomName,
  hasRoom,
  onScrollState,
  currentUserAvatarUrl,
}) {
  const scrollerRef = useRef(null)
  const endRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)
  const [showUnreadLine, setShowUnreadLine] = useState(false)
  const prevLen = useRef(0)

  const groups = useMemo(() => buildGroups(messages), [messages])
  const rows = useMemo(() => flattenWithDates(groups), [groups])

  const checkBottom = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return true
    const threshold = 120
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    const fn = () => scrollToBottom()
    window.addEventListener('envechat:scroll-bottom', fn)
    return () => window.removeEventListener('envechat:scroll-bottom', fn)
  }, [scrollToBottom])

  const onScroll = useCallback(() => {
    const bottom = checkBottom()
    setAtBottom(bottom)
    onScrollState?.(bottom)
    if (bottom) setShowUnreadLine(false)
  }, [checkBottom, onScrollState])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    if (messages.length > prevLen.current && prevLen.current > 0) {
      if (checkBottom()) scrollToBottom()
      else {
        setShowUnreadLine(true)
      }
    }
    prevLen.current = messages.length
  }, [messages, checkBottom, scrollToBottom])

  useEffect(() => {
    scrollToBottom('auto')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- room switch
  }, [welcomeRoomName])

  return (
    <div className="relative min-h-0 flex-1 bg-white">
      <div
        ref={scrollerRef}
        className="custom-scroll h-full overflow-y-auto overscroll-contain px-4 pb-4 pt-4 md:px-6"
      >
        {!hasRoom && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-[#1C1C1C] bg-[#F8F7F3] shadow-[4px_4px_0px_0px_#1C1C1C] transform -rotate-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#1C1C1C]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="font-heading text-2xl font-black text-[#1C1C1C]">No channel selected</p>
            <p className="max-w-xs text-sm font-bold text-[#6B7280]">Pick a channel from the sidebar or create one.</p>
          </div>
        )}

        {hasRoom && messages.length === 0 && (
          <div className="border-b-[3px] border-dashed border-[#1C1C1C] pb-8 mb-6 mt-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[#1C1C1C] bg-[#BEF355] shadow-[4px_4px_0px_0px_#1C1C1C]">
              <p className="font-mono text-4xl font-black text-[#1C1C1C]">#</p>
            </div>
            <h2 className="mt-5 font-heading text-3xl font-black tracking-tight text-[#1C1C1C]">
              Welcome to #{welcomeRoomName}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-[#6B7280]">
              This is the start of <span className="font-black text-[#1C1C1C]">#{welcomeRoomName}</span>.
              Send a message to kick things off.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border-[3px] border-[#1C1C1C] bg-[#F8F7F3] p-5 shadow-[4px_4px_0px_0px_#1C1C1C]">
              <Avatar name={username} avatarUrl={currentUserAvatarUrl} size={48} radius={12} />
              <div className="text-left text-[13px] font-bold text-[#6B7280]">
                <span className="font-black text-[#1C1C1C]">Pro Tip:</span> Press{' '}
                <kbd className="rounded-md border-2 border-[#1C1C1C] bg-white px-2 py-0.5 font-mono text-[11px] font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]">
                  Enter
                </kbd>{' '}
                to send,{' '}
                <kbd className="rounded-md border-2 border-[#1C1C1C] bg-white px-2 py-0.5 font-mono text-[11px] font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]">
                  Shift+Enter
                </kbd>{' '}
                for a new line.
              </div>
            </div>
          </div>
        )}

        {hasRoom &&
          rows.map((row) => {
            if (row.kind === 'date') {
              return <DateSeparator key={row.key} label={row.label} />
            }
            if (row.kind === 'system') {
              const { msg } = row
              const text =
                msg.type === 'JOIN'
                  ? `${displayName(msg.senderUsername)} joined the channel`
                  : `${displayName(msg.senderUsername)} left the channel`
              return <SystemRow key={row.key}>{text}</SystemRow>
            }
            return (
              <MessageCluster
                key={row.key}
                msgs={row.msgs}
                own={row.sender === username}
                avatarUrl={row.sender === username ? currentUserAvatarUrl : null}
                reactions={reactions}
                onToggleReaction={onToggleReaction}
                onReply={onReply}
              />
            )
          })}

        {showUnreadLine && !atBottom && <UnreadSeparator />}
        <TypingRow names={typingUsers} />
        <div ref={endRef} className="h-4 shrink-0" />
      </div>

      {hasRoom && !atBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="absolute bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1C1C1C] bg-[#BEF355] text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#1C1C1C] active:translate-y-0 active:shadow-none"
          title="Jump to latest"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}
